import React from 'react';
import './Footer.css';
import logo from '../../assets/little-nest-logo.png';

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer footer--dark" role="contentinfo">
      <div className="footer-top">
        <div className="footer-col">
          <h4 className="footer-heading">About Us</h4>
          <ul className="footer-links">
            <li><a href="#">Our Story</a></li>
            <li><a href="#">Affiliate Program</a></li>
            <li><a href="#">Wholesale Program</a></li>
            <li><a href="#">Press Inquiries</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Customer Support</h4>
          <ul className="footer-links">
            <li><a href="#">Returns & Exchanges</a></li>
            <li><a href="#">Shipping Information</a></li>
            <li><a href="#">Track Your Order</a></li>
            <li><a href="#">Promo Code Lookup</a></li>
            <li><a href="#">Gift Card Lookup</a></li>
          </ul>
        </div>

        <div className="footer-col footer-connect">
          <h4 className="footer-heading">Connect With Us</h4>
          <div className="social-list" aria-label="social links">
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="X">✖️</a>
            <a href="#" aria-label="YouTube">▶️</a>
            <a href="#" aria-label="Slack">💬</a>
            <a href="#" aria-label="Instagram">📸</a>
            <a href="#" aria-label="Pinterest">📌</a>
            <a href="#" aria-label="TikTok">🎵</a>
          </div>
          <p className="connect-copy">Want updates? Sign up for our Newsletter.<br/>Join SMS alerts and be the first to know!</p>
          <button type="button" className="cta-btn">Get in the loop!</button>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-branding">
          
          <span className="footer-brand-name">Little Nest</span>
        </div>
        <ul className="legal-links">
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms & Conditions</a></li>
          <li><a href="#">Accessibility Statement</a></li>
        </ul>
        <div className="copyright">© {year} Little Nest. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default Footer;
