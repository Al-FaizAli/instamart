import React, { useState } from "react";
import "./Navbar.css";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import LoginSignup from "../LoginSignup/LoginSignup";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

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
                <SearchBar />
            </div>
            <div className="nav-buttons">
                {user ? (
                    <>
                        <span className="welcome-msg">Hi, {user.name}</span>
                        <button className="logout-btn" onClick={logout}>
                            <span className="logout-text">Logout</span>
                            <span className="logout-icon">→</span>
                        </button>
                    </>
                ) : (
                    <button
                        className="login-btn"
                        onClick={() => setIsLoginOpen(true)}
                    >
                        Login
                    </button>
                )}
                <button
                    className="cart-btn"
                    onClick={() => navigate('/cart')}
                >
                    <FaShoppingCart className="cart-icon" />
                    <span className="cart-text">My Cart</span>
                </button>
            </div>

            <div
                className="hamburger-menu"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </div>

            {isMenuOpen && (
                <div className="mobile-menu">
                    {user ? (
                        <>
                            <span className="welcome-msg">Hi, {user.name}</span>
                            <button className="logout-btn" onClick={logout}>
                                <span className="logout-text">Logout</span>
                                <span className="logout-icon">→</span>
                            </button>
                        </>
                    ) : (
                        <button
                            className="login-btn"
                            onClick={() => setIsLoginOpen(true)}
                        >
                            Login
                        </button>
                    )}
                    <button
                        className="cart-btn"
                        onClick={() => {
                            navigate('/cart');
                            setIsMenuOpen(false);
                        }}
                    >
                        <FaShoppingCart className="cart-icon" />
                        <span className="cart-text">My Cart</span>
                    </button>
                </div>
            )}

            {isLoginOpen && (
                <LoginSignup
                    onClose={() => setIsLoginOpen(false)}
                />
            )}
        </nav>
    );
};

export default Navbar;