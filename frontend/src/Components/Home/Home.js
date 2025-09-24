import React, { useEffect, useState } from 'react';
import Nav from "../Nav/Nav";
import './Home.css';

function Home() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://advancecareagency.com.au/wp-content/uploads/2023/07/Child-Care-Advance-care-GAgency.jpg',
      title: 'Daycare Learning Center',
      description: 'A bright and cheerful environment for children to learn and play'
    },
    {
      image: 'https://th.bing.com/th/id/R.e0195b3e9a5ee81ec9097f1c2bd181aa?rik=nKJMvThg%2f6IQAQ&pid=ImgRaw&r=0',
      title: 'Mom & Child Bonding',
      description: 'Building strong connections between mothers and their children'
    },
    {
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'Happy Children Playing',
      description: 'Kids enjoying fun activities and making new friends'
    },
    {
      image: 'https://th.bing.com/th/id/R.8a931852da83910716330113667caf0a?rik=craCC7CNHyRY6Q&pid=ImgRaw&r=0',
      title: 'Family Love & Care',
      description: 'Creating precious memories with your little ones'
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home-container">
      <Nav/>
      
      {/* Image Slider */}
      <div className="image-slider">
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div key={index} className={`slide ${index === currentSlide ? 'active' : ''}`}>
              <img src={slide.image} alt={slide.title} />
              <div className="slide-content">
                <h3 className="slide-title">{slide.title}</h3>
                <p className="slide-description">{slide.description}</p>
              </div>
            </div>
          ))}
          
          <div className="slider-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="slider-arrows">
            <button className="arrow" onClick={prevSlide} aria-label="Previous slide">
              ‹
            </button>
            <button className="arrow" onClick={nextSlide} aria-label="Next slide">
              ›
            </button>
          </div>
        </div>
      </div>
      
      {/* Animated Background Elements */}
      

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
        
        <section className="pricing-section">
          <div className="container">
            <h2 className="section-title">Choose Your Perfect Plan</h2>
            <p className="section-subtitle">Select the package that best fits your family's needs</p>
            
            <div className="pricing-grid">
              {/* Basic Package */}
              <div className="pricing-card basic">
                <div className="pricing-content">
                  <div className="pricing-header">
                    <h3>Basic</h3>
                    <div className="price">
                      <span className="currency">Rs.</span>
                      <span className="amount">89,700</span>
                      <span className="period">/month</span>
                    </div>
                  </div>
                  <div className="pricing-features">
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>✅ Attendance Tracking</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>✅ Payment Management</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>✅ Parent App Access</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>Basic Reporting</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>Email Support</span>
                    </div>
                  </div>
                </div>
                <div className="pricing-button-wrapper">
                  <button className="pricing-btn basic-btn">Get Started</button>
                </div>
              </div>

              {/* Premium Package - Most Popular */}
              <div className="pricing-card premium most-popular">
                <div className="popular-badge">
                  <span>🌟 Most Popular</span>
                </div>
                <div className="pricing-content">
                  <div className="pricing-header">
                    <h3>Premium</h3>
                    <div className="price">
                      <span className="currency">Rs.</span>
                      <span className="amount">149,700</span>
                      <span className="period">/month</span>
                    </div>
                  </div>
                  <div className="pricing-features">
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>✅ Attendance Tracking</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>✅ Payment Management</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>✅ Parent App Access</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>Advanced Analytics</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>Photo Sharing</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>Priority Support</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>Custom Branding</span>
                    </div>
                  </div>
                </div>
                <div className="pricing-button-wrapper">
                  <button className="pricing-btn premium-btn">Choose Premium</button>
                </div>
              </div>

              {/* Enterprise Package */}
              <div className="pricing-card enterprise">
                <div className="pricing-content">
                  <div className="pricing-header">
                    <h3>Enterprise</h3>
                    <div className="price">
                      <span className="currency">Rs.</span>
                      <span className="amount">239,700</span>
                      <span className="period">/month</span>
                    </div>
                  </div>
                  <div className="pricing-features">
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>✅ Attendance Tracking</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>✅ Payment Management</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>✅ Parent App Access</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>Everything in Premium</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>Multi-Location Support</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>API Access</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>24/7 Phone Support</span>
                    </div>
                    <div className="feature">
                      <i className="fas fa-check"></i>
                      <span>Dedicated Account Manager</span>
                    </div>
                  </div>
                </div>
                <div className="pricing-button-wrapper">
                  <button className="pricing-btn enterprise-btn">Contact Sales</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="testimonials-section">
          <div className="container">
            <h2 className="section-title">Happy Parents Say</h2>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <div className="quote-icon">"</div>
                  <p>"Little Nest has been a blessing for our family. The attendance tracking feature gives me peace of mind knowing exactly when my daughter arrives and leaves. The staff is amazing!"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">👩</div>
                  <div className="author-info">
                    <h4>Sarah Johnson</h4>
                    <span>Premium Plan User</span>
                  </div>
                </div>
              </div>
              
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <div className="quote-icon">"</div>
                  <p>"The payment management system is so convenient! I love getting notifications and being able to track all payments through the parent app. Highly recommend!"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">👨</div>
                  <div className="author-info">
                    <h4>Michael Chen</h4>
                    <span>Basic Plan User</span>
                  </div>
                </div>
              </div>
              
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <div className="quote-icon">"</div>
                  <p>"As a working mom, the parent app access is invaluable. I can check on my son throughout the day and stay connected with his caregivers. The photo sharing feature is wonderful!"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">👩‍💼</div>
                  <div className="author-info">
                    <h4>Emily Rodriguez</h4>
                    <span>Premium Plan User</span>
                  </div>
                </div>
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