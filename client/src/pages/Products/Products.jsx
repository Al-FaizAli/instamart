import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API from '../../api';
import ProductsGrid from '../../components/ProductsGrid/ProductsGrid';

const ProductsPage = () => {
    const { aisleId } = useParams(); // Changed from departmentId to aisleId
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [aisleName, setAisleName] = useState(''); // Changed from departmentName to aisleName

    const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    const fetchAisleProducts = async () => {
        setLoading(true);
        try {
            // 1. Fetch products by aisle ID
            const productsResponse = await API.get(
                `/api/products/aisle/${aisleId}`
            );

            // 2. Get aisle name (optional - if you have an aisle endpoint)
            try {
                const aisleResponse = await API.get(
                    `/api/aisles/${aisleId}`
                );
                setAisleName(aisleResponse.data.aisle || `Aisle ${aisleId}`);
            } catch (aisleError) {
                console.error('Error fetching aisle name:', aisleError);
                setAisleName(`Aisle ${aisleId}`);
            }

            // 3. Limit and enhance with images
            const limitedProducts = productsResponse.data.slice(0, 32);
            const productsWithImages = await Promise.all(
                limitedProducts.map(async (product) => {
                    try {
                        const unsplashResponse = await axios.get(
                            `https://api.unsplash.com/search/photos`,
                            {
                                params: {
                                    query: product.product_name,
                                    per_page: 1,
                                    client_id: ACCESS_KEY
                                }
                            }
                        );

                        return {
                            ...product,
                            image: unsplashResponse.data.results[0]?.urls?.small ||
                                `https://source.unsplash.com/random/300x200/?${encodeURIComponent(product.product_name)},grocery`,
                            rating: (Math.random() * 2 + 3).toFixed(1)
                        };
                    } catch (unsplashError) {
                        console.error(`Error fetching image for ${product.product_name}:`, unsplashError);
                        return {
                            ...product,
                            image: `https://source.unsplash.com/random/300x200/?${encodeURIComponent(product.product_name)},grocery`,
                            rating: (Math.random() * 2 + 3).toFixed(1)
                        };
                    }
                })
            );

            setProducts(productsWithImages);
        } catch (error) {
            console.error(`Error fetching products for aisle ${aisleId}:`, error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // ... rest of your existing code (fetchCart, handleAdd, handleRemove, isInCart) remains the same ...
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
                    productId: product.product_id,
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
        fetchCart();
    }, [aisleId]); // Changed dependency from departmentId to aisleId

    return (
        <div className="products-page">
            <h1>{aisleName || 'Products'}</h1> {/* Changed from departmentName to aisleName */}
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