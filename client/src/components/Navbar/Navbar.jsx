import React, { useState } from "react";
import "./Navbar.css";
import { FaShoppingCart, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import Login from "../LoginSignup/LoginSignup";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="logo" onClick={() => navigate('/')}>
                <span className="blink">insta</span>
                <span className="it">cart</span>
            </div>
            <div className="delivery-info">
                <strong>Delivery in 15 minutes</strong>
                <span className="location">45, College Rd, Indian Institute o...</span>
            </div>
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Search 'egg'" />
            </div>
            <div className="nav-buttons">
                <button className="login-btn" onClick={() => setIsLoginOpen(true)}>Login</button>
                <button className="cart-btn" onClick={() => navigate('/cart')}>
                    <FaShoppingCart />
                    My Cart
                </button>
            </div>

            <div className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </div>

            {isMenuOpen && (
                <div className="mobile-menu">
                    <button className="login-btn" onClick={() => setIsLoginOpen(true)}>Login</button>
                    <button className="cart-btn" onClick={() => navigate('/cart')}>
                        <FaShoppingCart />
                        My Cart
                    </button>
                </div>
            )}

            {isLoginOpen && <Login onClose={() => setIsLoginOpen(false)} />}
        </nav>
    );
};

export default Navbar;
