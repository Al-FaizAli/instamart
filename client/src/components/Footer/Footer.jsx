import React from 'react';
import './Footer.css'; // Import the CSS file for styling

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="contributors">
                    <h4>Contributors</h4>
                    <ul>
                        <li>Ameer Hamza Khan</li>
                        <li>Sourov Debnath</li>
                        <li>Jeet Choudhary</li>
                        <li>Al-Faiz Ali</li>
                    </ul>
                </div>

                <div className="social-media">
                    <h4>Follow Us</h4>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-linkedin-in"></i>
                        </a>
                    </div>
                </div>

                <div className="copyright">
                    <p>© 2025 INSTACART. All rights reserved.</p>
                    <p>Made with ❤️ by the team</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;