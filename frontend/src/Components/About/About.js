import React, { useEffect, useState } from 'react';
import Nav from "../Nav/Nav";
import './About.css';

function About() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.team-member, .value-card, .milestone').forEach(el => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-container">
      <Nav />
      
      {/* Animated Background Elements */}
      <div className="about-background">
        <div className="floating-shape shape1"></div>
        <div className="floating-shape shape2"></div>
        <div className="floating-shape shape3"></div>
        <div className="floating-shape shape4"></div>
      </div>

      <main className="about-content">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="container">
            <div className={`hero-content ${animated ? 'animate-in' : ''}`}>
              <h1 className="hero-title">Our Story</h1>
              <p className="hero-subtitle">Nurturing young minds with love, care, and creativity</p>
              <div className="hero-image">
                <div className="image-placeholder">
                  <div className="placeholder-content">
                    <span className="placeholder-icon">🏡</span>
                    <p>Our Happy Little Nest</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="container">
            <div className="mission-grid">
              <div className="mission-content">
                <h2>Our Mission</h2>
                <p>At Little Nest, we believe every child deserves a safe, nurturing environment where they can explore, learn, and grow. Our mission is to provide a home away from home where little dreams can flourish and children can develop at their own pace.</p>
                <p>We combine innovative learning approaches with traditional values to create a balanced experience that prepares children for the world while preserving the magic of childhood.</p>
              </div>
              <div className="mission-visual">
                <div className="visual-element element1">🌈</div>
                <div className="visual-element element2">📚</div>
                <div className="visual-element element3">🎨</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <div className="container">
            <h2 className="section-title">Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">❤️</div>
                <h3>Love & Care</h3>
                <p>We provide a warm, loving environment where every child feels valued and secure.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🌱</div>
                <h3>Growth</h3>
                <p>We foster each child's natural curiosity and support their unique developmental journey.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>Community</h3>
                <p>We build strong partnerships with families to create a supportive community.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">✨</div>
                <h3>Creativity</h3>
                <p>We encourage imaginative play and creative expression in all aspects of learning.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <div className="container">
            <h2 className="section-title">Our Caring Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-photo">
                  <div className="photo-placeholder">👩‍🏫</div>
                </div>
                <h3>Sarah Johnson</h3>
                <p className="member-role">Founder & Director</p>
                <p className="member-bio">With over 15 years in early childhood education, Sarah founded Little Nest to create the ideal learning environment she wished existed for her own children.</p>
              </div>
              <div className="team-member">
                <div className="member-photo">
                  <div className="photo-placeholder">👨‍🏫</div>
                </div>
                <h3>Michael Chen</h3>
                <p className="member-role">Lead Educator</p>
                <p className="member-bio">Specializing in creative arts and sensory play, Michael brings joy and innovation to our learning activities.</p>
              </div>
              <div className="team-member">
                <div className="member-photo">
                  <div className="photo-placeholder">👩‍🏫</div>
                </div>
                <h3>Emily Rodriguez</h3>
                <p className="member-role">Child Development Specialist</p>
                <p className="member-bio">Emily ensures our programs support each child's individual developmental needs and milestones.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="timeline-section">
          <div className="container">
            <h2 className="section-title">Our Journey</h2>
            <div className="timeline">
              <div className="milestone">
                <div className="milestone-year">2015</div>
                <div className="milestone-content">
                  <h3>Little Nest Founded</h3>
                  <p>Started with just 5 children and a dream to create a different kind of learning space.</p>
                </div>
              </div>
              <div className="milestone">
                <div className="milestone-year">2017</div>
                <div className="milestone-content">
                  <h3>Expanded Facilities</h3>
                  <p>Moved to a larger space to accommodate growing interest from the community.</p>
                </div>
              </div>
              <div className="milestone">
                <div className="milestone-year">2019</div>
                <div className="milestone-content">
                  <h3>Curriculum Innovation</h3>
                  <p>Developed our unique Nature & Nurture curriculum combining outdoor learning with emotional intelligence.</p>
                </div>
              </div>
              <div className="milestone">
                <div className="milestone-year">2022</div>
                <div className="milestone-content">
                  <h3>Community Recognition</h3>
                  <p>Received the Excellence in Early Childhood Education award from the National Association.</p>
                </div>
              </div>
              <div className="milestone">
                <div className="milestone-year">2023</div>
                <div className="milestone-content">
                  <h3>Digital Learning Integration</h3>
                  <p>Successfully blended traditional play-based learning with appropriate digital tools.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta">
          <div className="container">
            <div className="cta-content">
              <h2>Come Visit Our Nest</h2>
              <p>We'd love to show you around our space and introduce you to our team. Schedule a tour to experience the Little Nest difference firsthand.</p>
              <button className="cta-button">Schedule a Visit</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default About;