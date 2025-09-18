import React, { useEffect, useState } from 'react';
import Nav from "../Nav/Nav";
import './Home.css';

function Home() {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      <Nav/>
      
      {/* Animated Background Elements */}
      <div className="animated-background">
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
        <div className="balloon balloon1">🎈</div>
        <div className="balloon balloon2">🎈</div>
        <div className="balloon balloon3">🎈</div>
        <div className="stars">
          <div className="star">⭐</div>
          <div className="star">⭐</div>
          <div className="star">⭐</div>
          <div className="star">⭐</div>
          <div className="star">⭐</div>
          <div className="star">⭐</div>
        </div>
        <div className="sun-rays"></div>
      </div>

      <main className="main-content">
        <div className={`hero-section ${scrollPosition > 50 ? 'scrolled' : ''}`}>
          <h1 className="main-title animate-character">LITTLE NEST</h1>
          <p className="hero-subtitle">Where little dreams grow big</p>
          <div className="scroll-indicator">
            <span>Scroll to explore</span>
            <div className="mouse">
              <div className="wheel"></div>
            </div>
          </div>
        </div>
        
        {/* New Sections with Scroll Animations */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">What We Offer</h2>
            <div className="features-grid">
              <div className="feature-card" style={{animationDelay: '0.1s'}}>
                <div className="feature-icon">🧸</div>
                <h3>Safe Environment</h3>
                <p>A secure and nurturing space for children to learn and play.</p>
              </div>
              <div className="feature-card" style={{animationDelay: '0.3s'}}>
                <div className="feature-icon">🎨</div>
                <h3>Creative Learning</h3>
                <p>Engaging activities that spark imagination and creativity.</p>
              </div>
              <div className="feature-card" style={{animationDelay: '0.5s'}}>
                <div className="feature-icon">👪</div>
                <h3>Family Community</h3>
                <p>Building connections between families and caregivers.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="testimonials-section">
          <div className="container">
            <h2 className="section-title">Happy Parents Say</h2>
            <div className="testimonial-slider">
              <div className="testimonial">
                <div className="testimonial-content">
                  "Little Nest has been a blessing for our family. Our daughter loves coming here every day!"
                </div>
                <div className="testimonial-author">- Sarah Johnson</div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="cta-section">
          <div className="container">
            <h2>Ready to Join Our Nest?</h2>
            <p>Schedule a visit and see why children love our space</p>
            <button className="cta-button">Schedule a Tour</button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home;