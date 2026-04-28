import React, { useState } from "react";
import "./Navbar.css";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import LoginSignup from "../LoginSignup/LoginSignup";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Navbar = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <>
            <nav className="navbar">
                <div className="logo" onClick={() => navigate('/')}>
                    <span className="blink">Neural</span>
                    <span className="it">Grocer</span>
                </div>
                <div className="delivery-info">
                    <strong>Delivery in 15 minutes</strong>
                    <span className="location">Link Road Number 3, Near Kali Mata Mandir, Bhopal, Madhya Pradesh, India, Pin Code 462003...</span>
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
                        onClick={() => {
                            if (!user) {
                                toast.error('Please login to access cart');
                                setIsLoginOpen(true);
                            } else {
                                navigate('/cart');
                            }
                        }}
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
                                setIsMenuOpen(false);
                                if (!user) {
                                    toast.error('Please login to access cart');
                                    setIsLoginOpen(true);
                                } else {
                                    navigate('/cart');
                                }
                            }}
                        >
                            <FaShoppingCart className="cart-icon" />
                            <span className="cart-text">My Cart</span>
                        </button>
                    </div>
                )}
            </nav>

            {isLoginOpen && (
                <LoginSignup
                    onClose={() => setIsLoginOpen(false)}
                />
            )}
        </>
    );
};

export default Navbar;