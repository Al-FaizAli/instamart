import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Products.css';
import API from '../../api';
const ProductsPage = () => {
    const { departmentId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [departmentName, setDepartmentName] = useState('');

    const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    const fetchDepartmentProducts = async () => {
        setLoading(true);
        try {
            // 1. Fetch products from MongoDB by department ID
            const productsResponse = await API.get(
                `/api/products/department/${departmentId}`
            );

            // 2. Get department name
            const departmentResponse = await API.get(
                `/api/departments/${departmentId}`
            );

            setDepartmentName(departmentResponse.data.department);

            // 3. Limit to 30 products and fetch images from Unsplash
            const limitedProducts = productsResponse.data.slice(0, 32);
            const productsWithImages = await Promise.all(
                limitedProducts.map(async (product) => {
                    try {
                        const unsplashResponse = await axios.get(
                            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(product.product_name)}&client_id=${ACCESS_KEY}&per_page=1`
                        );

                        return {
                            ...product,
                            image: unsplashResponse.data.results[0]?.urls?.small ||
                                `https://source.unsplash.com/random/300x200/?${encodeURIComponent(product.product_name)},grocery`,
                            rating: (Math.random() * 2 + 3).toFixed(1) // Random rating between 3.0 and 5.0
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
            console.error(`Error fetching products for department ${departmentId}:`, error);
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

    useEffect(() => {
        fetchDepartmentProducts();
        fetchCart();
    }, [departmentId]);

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
                    price: product.price || 10.99, // Default price if not available
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

    return (
        <div className="products-page">
            <h1>{departmentName || 'Products'}</h1>
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading products...</p>
                </div>
            ) : (
                <div className="products-container">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.product_id} className="product-card">
                                <div className="image-container">
                                    <img
                                        src={product.image}
                                        alt={product.product_name}
                                        className="product-image"
                                        loading="lazy"
                                    />
                                </div>
                                <h3 className="product-name">{product.product_name}</h3>
                                <p className="product-price">${product.price || '10'}</p>
                                <p className="product-rating">Rating: {product.rating} ★</p>
                                <div className="product-actions">
                                    {isInCart(product.product_id) ? (
                                        <button
                                            className="remove-button"
                                            onClick={() => handleRemove(product.product_id)}
                                        >
                                            REMOVE
                                        </button>
                                    ) : (
                                        <button
                                            className="add-button"
                                            onClick={() => handleAdd(product.product_id)}
                                        >
                                            ADD
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-products">No products found in this department</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductsPage;