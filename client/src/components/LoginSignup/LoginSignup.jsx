import React, { useState, useEffect, useRef } from "react";
import "./LoginSignup.css";

const LoginSignup = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true); 
    const [name, setName] = useState(""); 
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtpField, setShowOtpField] = useState(false); 
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); 
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const sendOTP = async () => {
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (response.ok) {
                setShowOtpField(true);
                setError("");
            } else {
                setError(data.message || "Failed to send OTP");
            }
        } catch (error) {
            setError("Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email, 
                    otp, 
                    ...(!isLogin && { name }) 
                }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                onClose();
            } else {
                setError(data.message || "Failed to verify OTP");
            }
        } catch (error) {
            setError("Failed to verify OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!showOtpField) {
            sendOTP();
        } else {
            verifyOTP();
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
                    {!isLogin && !showOtpField && (
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
                            disabled={showOtpField}
                        />
                    </div>
                    {showOtpField && (
                        <div className="form-group">
                            <label htmlFor="otp">OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                required
                                maxLength={6}
                            />
                        </div>
                    )}
                    {error && <p className="error-message">{error}</p>}
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : showOtpField ? "Verify OTP" : "Send OTP"}
                    </button>
                </form>
                <p>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        className="toggle-link"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setShowOtpField(false);
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