import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api';
import ProductsGrid from '../../components/ProductsGrid/ProductsGrid';
import './Products.css'
import { normalizeProducts } from '../../utils/productHelpers';
import { toast } from 'react-hot-toast';
import LoginSignup from '../../components/LoginSignup/LoginSignup';

const ProductsPage = () => {
    const { aisleId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [aisleName, setAisleName] = useState('');
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const fetchAisleProducts = async () => {
        setLoading(true);

        // 1. Check localStorage cache first
        const cacheKey = `aisleProducts_${aisleId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { products, aisleName } = JSON.parse(cached);
            setProducts(normalizeProducts(products));
            setAisleName(aisleName);
            setLoading(false);
            return;
        }

        try {
            const productsRes = await API.get(`/api/products/aisle/${aisleId}`);
            let aisleNameFetched = `Aisle ${aisleId}`;
            try {
                const aisleRes = await API.get(`/api/aisles/${aisleId}`);
                aisleNameFetched = aisleRes.data.aisle || aisleNameFetched;
            } catch { }

            const normalizedProducts = normalizeProducts(productsRes.data.slice(0, 32));

            localStorage.setItem(
                cacheKey,
                JSON.stringify({ products: normalizedProducts, aisleName: aisleNameFetched })
            );

            setProducts(normalizedProducts);
            setAisleName(aisleNameFetched);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };
    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await API.get('/api/cart');
            setCart(response.data.cart || []);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const handleAdd = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to add items to cart');
                setIsLoginOpen(true);
                return;
            }

            const product = products.find(p => p.product_id === productId);
            if (!product) return;

            await API.post('/api/cart/add',
                {
                    product_id: product.product_id,
                    quantity: 1
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            await fetchCart();
            toast.success('Item added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    const handleRemove = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to modify cart');
                setIsLoginOpen(true);
                return;
            }

            await API.delete(`/api/cart/${productId}`);

            await fetchCart();
            toast.success('Item removed from cart');
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error(error.response?.data?.message || 'Failed to remove from cart');
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to modify cart');
                setIsLoginOpen(true);
                return;
            }

            if (newQuantity <= 0) {
                await handleRemove(productId);
                return;
            }

            await API.put(`/api/cart/${productId}`, { quantity: newQuantity });
            await fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error(error.response?.data?.message || 'Failed to update quantity');
        }
    };

    const getCartQuantity = (productId) => {
        const item = cart.find(item => item.product_id === productId);
        return item ? item.quantity : 0;
    };

    useEffect(() => {
        fetchAisleProducts();
        fetchCart();
    }, [aisleId]);

    return (
        <div className="products-page">
            <div className="breadcrumb">
                <a href="/">Home</a>
                <span className="breadcrumb-separator">/</span>
                <a href="/aisles">Aisles</a>
                <span className="breadcrumb-separator">/</span>
                <span>{aisleName}</span>
            </div>

            <div className="aisle-header">
                <h1 className="aisle-title">{aisleName || 'Products'}</h1>
            </div>

            <ProductsGrid
                products={products}
                getCartQuantity={getCartQuantity}
                handleAdd={handleAdd}
                handleRemove={handleRemove}
                handleUpdateQuantity={handleUpdateQuantity}
                loading={loading}
            />

            {isLoginOpen && (
                <LoginSignup onClose={() => setIsLoginOpen(false)} />
            )}
        </div>
    );
};

export default ProductsPage;
