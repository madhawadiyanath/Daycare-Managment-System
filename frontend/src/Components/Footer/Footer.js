import React from 'react';
import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none" focusable="false">
          <path d="M0,96L60,112C120,128,240,160,360,149.3C480,139,600,85,720,80C840,75,960,117,1080,128C1200,139,1320,117,1380,106.7L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>

      <div className="footer__container">
        <div className="footer__brand">
          <div className="footer__logo" aria-hidden="true">🪺</div>
          <div>
            <h4 className="footer__title">Little Nest</h4>
            <p className="footer__tagline">Where little dreams grow big</p>
          </div>
        </div>

        <div className="footer__grid">
          <div className="footer__column">
            <h5>Explore</h5>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Programs</a></li>
              <li><a href="#">Gallery</a></li>
            </ul>
          </div>
          <div className="footer__column">
            <h5>Contact</h5>
            <ul className="footer__contact">
              <li><span role="img" aria-label="location">📍</span> 123 Nest Lane, Colombo</li>
              <li><span role="img" aria-label="phone">📞</span> +94 77 123 4567</li>
              <li><span role="img" aria-label="email">✉️</span> hello@littlenest.lk</li>
            </ul>
          </div>
          <div className="footer__column">
            <h5>Newsletter</h5>
            <p className="footer__note">Get tips and updates straight to your inbox</p>
            <form className="footer__form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" aria-label="Email address" placeholder="Your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer__social-row">
          <a aria-label="Facebook" href="#" className="social">📘</a>
          <a aria-label="Instagram" href="#" className="social">📸</a>
          <a aria-label="Twitter" href="#" className="social">🐦</a>
        </div>

        <div className="footer__bottom">
          <span>© {year} Little Nest. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
