import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchBar.css';
import API from '../../api';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const FLASK_API_URL = 'https://render-search-nlp.onrender.com';

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length > 2) {
                setLoadingSuggestions(true);
                try {
                    // 1. First fetch from Flask API (same as search results)
                    const searchResponse = await axios.get(
                        `${FLASK_API_URL}/search?query=${encodeURIComponent(query)}`,
                        { headers: { 'Accept': 'application/json' } }
                    );

                    // Parse response data (same logic as search results)
                    let productData = [];
                    if (Array.isArray(searchResponse.data)) {
                        productData = searchResponse.data;
                    } else if (searchResponse.data.results) {
                        productData = searchResponse.data.results;
                    }

                    // Extract product IDs
                    const productIds = productData
                        .map(product => product.product_id)
                        .filter(id => !isNaN(parseInt(id)));

                    if (productIds.length === 0) {
                        setSuggestions([]);
                        return;
                    }

                    // 2. Get full product details from MongoDB (same as search results)
                    const detailsResponse = await API.get(
                        `/api/products/by-ids?ids=${productIds.join(',')}`
                    );

                    // Limit to 10 suggestions and format them
                    const limitedSuggestions = detailsResponse.data.slice(0, 10).map(product => ({
                        ...product,
                        image: product.image || `https://source.unsplash.com/random/300x200/?${encodeURIComponent(product.product_name)}`
                    }));

                    setSuggestions(limitedSuggestions);
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                    // Fallback to simple text search if NLP fails
                    try {
                        const fallbackResponse = await API.get(
                            `/api/products/search/suggestions?q=${query}`
                        );
                        setSuggestions(fallbackResponse.data.slice(0, 10));
                    } catch (fallbackError) {
                        console.error('Fallback suggestion error:', fallbackError);
                        setSuggestions([]);
                    }
                } finally {
                    setLoadingSuggestions(false);
                }
            } else {
                setSuggestions([]);
            }
        };

        const timer = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${query}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (productId, productName) => {
        navigate(`/search?q=${productName}`);
        setShowSuggestions(false);
    };

    return (
        <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search 'egg'"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="search-input"
                />
                <button type="submit" className="search-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                </button>
            </form>

            {showSuggestions && (loadingSuggestions || suggestions.length > 0) && (
                <div className="suggestions-dropdown">
                    {loadingSuggestions ? (
                        <div className="suggestion-loading">Loading suggestions...</div>
                    ) : (
                        suggestions.map((product) => (
                            <div
                                key={product.product_id}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(product.product_id, product.product_name)}
                            >
                                <img
                                    src={product.image}
                                    alt={product.product_name}
                                    className="suggestion-image"
                                />
                                <div className="suggestion-text">
                                    <div className="suggestion-name">{product.product_name}</div>
                                    {product.price && (
                                        <div className="suggestion-price">${product.price.toFixed(2)}</div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;