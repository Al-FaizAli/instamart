import React from "react";
import "./Navbar.css";
import { FaShoppingCart, FaSearch } from "react-icons/fa";
import Login from "../Login/Login";
import { useState } from "react";

const Navbar = () => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    return (
        <nav className="navbar">
            <div className="logo">
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
                <button className="cart-btn">
                    <FaShoppingCart />
                    My Cart
                </button>
            </div>
            {isLoginOpen && <Login onClose={() => setIsLoginOpen(false)} />}
        </nav>
    );
};

export default Navbar;