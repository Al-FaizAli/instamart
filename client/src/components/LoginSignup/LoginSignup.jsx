import React, { useState, useEffect, useRef } from "react";
import "./LoginSignup.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import API from '../../api';

const LoginSignup = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const modalRef = useRef(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose?.();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
            const payload = isLogin ? { email, password } : { name, email, password };

            const response = await API.post(endpoint, payload);
            if (response.data?.token && response.data?.user) {
                login(response.data.token, response.data.user);
                onClose?.();
                navigate('/', { replace: true }); // Changed to replace navigation
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error("Auth error:", error);
            setError(
                error.response?.data?.message ||
                error.message ||
                (isLogin ? "Login failed. Please try again." : "Signup failed. Please try again.")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-signup-overlay">
            <div className="login-signup-container" ref={modalRef}>
                <button className="close-btn" onClick={onClose}>
                    &times;
                </button>
                <h2>{isLogin ? "Login" : "Sign Up"}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            minLength={6}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>
                <p>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        className="toggle-link"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginSignup;