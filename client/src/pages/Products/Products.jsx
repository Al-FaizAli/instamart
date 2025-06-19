import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API from '../../api';
import ProductsGrid from '../../components/ProductsGrid/ProductsGrid';
import './Products.css'
import { FiSearch, FiFilter } from 'react-icons/fi';
import { IoIosArrowForward } from 'react-icons/io';

const ProductsPage = () => {
    const { aisleId } = useParams(); // Changed from departmentId to aisleId
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [aisleName, setAisleName] = useState(''); // Changed from departmentName to aisleName
    const aisleCache = useRef({}); // In-memory cache for this session

    const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    // Helper to fetch Unsplash image for a product
    const fetchUnsplashImage = async (query) => {
        try {
            const res = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${ACCESS_KEY}`
            );
            const data = await res.json();
            return data.results?.[0]?.urls?.small || '/placeholder.png';
        } catch {
            return '/placeholder.png';
        }
    };

    const fetchAisleProducts = async () => {
        setLoading(true);

        // 1. Check localStorage cache first
        const cacheKey = `aisleProducts_${aisleId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { products, aisleName } = JSON.parse(cached);
            setProducts(products);
            setAisleName(aisleName);
            setLoading(false);
            return;
        }

        // 2. If not cached, fetch from backend and Unsplash
        try {
            const productsRes = await API.get(`/api/products/aisle/${aisleId}`);
            let aisleNameFetched = `Aisle ${aisleId}`;
            try {
                const aisleRes = await API.get(`/api/aisles/${aisleId}`);
                aisleNameFetched = aisleRes.data.aisle || aisleNameFetched;
            } catch { }

            const productsWithImages = await Promise.all(
                productsRes.data.slice(0, 32).map(async (product) => ({
                    ...product,
                    image: await fetchUnsplashImage(product.product_name),
                    rating: (Math.random() * 2 + 3).toFixed(1)
                }))
            );

            // Store in localStorage
            localStorage.setItem(
                cacheKey,
                JSON.stringify({ products: productsWithImages, aisleName: aisleNameFetched })
            );

            setProducts(productsWithImages);
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

            const response = await axios.get('http://localhost:5000/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCart(response.data.cart?.items || []);
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

            await axios.post('http://localhost:5000/api/cart/add',
                {
                    product_id: product.product_id,
                    name: product.product_name,
                    price: product.price || 10.99,
                    image: product.image,
                    quantity: 1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            await fetchCart();
            alert(`${product.product_name} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.response?.data?.error || 'Failed to add to cart');
        }
    };

    const handleRemove = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to modify cart');
                return;
            }

            await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            await fetchCart();
            alert('Item removed from cart');
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert(error.response?.data?.error || 'Failed to remove from cart');
        }
    };

    const isInCart = (productId) => {
        return cart.some(item => item.product.productId === productId);
    };

    useEffect(() => {
        fetchAisleProducts();
        // fetchCart();
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