import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import "./Login.css";

export default function Login({ onClose }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    if (phone.length === 10) {
      setOtpSent(true);
    } else {
      alert("Please enter a valid 10-digit phone number.");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("login-overlay")) {
      onClose();
    }
  };

  return (
    <div className="login-overlay" onClick={handleOverlayClick}>
      <div className="login-container">
        <button className="back-btn" onClick={onClose}>
          <ArrowLeft size={20} />
        </button>
        <h2>Login with Mobile Number</h2>
        <input
          type="tel"
          placeholder="Enter your mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={10}
          className="phone-input"
        />
        <button className="send-otp-btn" onClick={handleSendOtp}>
          {otpSent ? "OTP Sent!" : "Send OTP"}
        </button>
      </div>
    </div>
  );
}
