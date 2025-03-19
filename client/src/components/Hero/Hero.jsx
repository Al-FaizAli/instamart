import React from "react";
import "./Hero.css";

const HeroSection = () => {
    return (
        <div className="hero-section">
            <div className="hero-content">
                <h1>Groceries Delivered in Minutes!</h1>
                <p>Fresh fruits, vegetables, dairy, snacks, and more at your doorstep.</p>
                <button className="shop-now-btn">Shop Now</button>
            </div>
        </div>
    );
};

export default HeroSection;
