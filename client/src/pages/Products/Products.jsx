import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api';
import ProductsGrid from '../../components/ProductsGrid/ProductsGrid';
import './Products.css'
import { normalizeProducts } from '../../utils/productHelpers';

const ProductsPage = () => {
    const { aisleId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [aisleName, setAisleName] = useState('');

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
                alert('Please login to add items to cart');
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
            alert(`${product.product_name} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    const handleRemove = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to modify cart');
                return;
            }

            await API.delete(`/api/cart/${productId}`);

            await fetchCart();
            alert('Item removed from cart');
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert(error.response?.data?.message || 'Failed to remove from cart');
        }
    };

    const isInCart = (productId) => {
        return cart.some(item => item.product_id === productId);
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
                isInCart={isInCart}
                handleAdd={handleAdd}
                handleRemove={handleRemove}
                loading={loading}
            />
        </div>
    );
};

export default ProductsPage;
