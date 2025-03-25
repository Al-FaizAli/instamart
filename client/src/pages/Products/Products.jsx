import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Products.css';

const ProductsPage = () => {
    const { department } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);

    const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    const generateProductDetails = (product, index) => {
        const prices = [74, 80, 16, 25, 28];
        const quantities = ['1 ltr', '200 ml', '250 ml', '450 ml'];
        const ratings = [4.0, 4.5, 3.5, 5.0];

        return {
            ...product,
            id: `prod_${department}_${index}`,
            name: product.alt_description || `Product ${index + 1}`,
            price: prices[Math.floor(Math.random() * prices.length)],
            quantity: quantities[Math.floor(Math.random() * quantities.length)],
            rating: ratings[Math.floor(Math.random() * ratings.length)],
        };
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `https://api.unsplash.com/search/photos?query=${department}&client_id=${ACCESS_KEY}&per_page=20`
            );

            if (response.data.results.length > 0) {
                const productsWithDetails = response.data.results.map((product, index) =>
                    generateProductDetails(product, index)
                );
                setProducts(productsWithDetails);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error(`Error fetching products for ${department}:`, error);
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
        fetchProducts();
        fetchCart();
    }, [department]);

    const handleAdd = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to add items to cart');
                return;
            }

            const product = products.find(p => p.id === productId);
            if (!product) return;

            await axios.post('http://localhost:5000/api/cart/add', 
                {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.urls.regular,
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
            alert(`${product.name} added to cart!`);
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
        return cart.some(item => item.product.id === productId);
    };

    return (
        <div className="products-page">
            <h1>{department}</h1>
            {loading ? (
                <p className="loading-message">Loading products...</p>
            ) : (
                <div className="products-container">
                    {products.map((product, index) => (
                        <div key={product.id} className="product-card">
                            <img
                                src={product.urls.regular}
                                alt={product.alt_description}
                                className="product-image"
                            />
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-price">${product.price}</p>
                            <p className="product-rating">Rating: {product.rating} ★</p>
                            <div className="product-actions">
                                {isInCart(product.id) ? (
                                    <button
                                        className="remove-button"
                                        onClick={() => handleRemove(product.id)}
                                    >
                                        REMOVE
                                    </button>
                                ) : (
                                    <button
                                        className="add-button"
                                        onClick={() => handleAdd(product.id)}
                                    >
                                        ADD
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductsPage;