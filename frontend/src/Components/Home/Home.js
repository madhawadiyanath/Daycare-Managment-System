import React from 'react'
import Nav from "../Nav/Nav";
import './Home.css';
function Home() {
  return (
    <div>
      <Nav/>
      <body>
    <header class="header">
        <div class="header-container">
            <div class="logo-section">
                <div class="logo">
                    <div class="logo-icon">
                        <div class="logo-figures">
                            <div class="logo-adult"></div>
                            <div class="logo-child logo-child-1"></div>
                            <div class="logo-child logo-child-2"></div>
                            <div class="logo-child logo-child-3"></div>
                        </div>
                    </div>
                </div>
                <div class="brand-name">LITTLE NEST</div>
            </div>

            <nav>
                <ul class="nav-menu" id="navMenu">
                    <li class="nav-item">
                        <a href="#" class="nav-link">Home</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">Features</a>
                        <ul class="dropdown-menu">
                            <li class="dropdown-item">
                                <a href="#" class="dropdown-link">Parent Communication</a>
                            </li>
                            <li class="dropdown-item">
                                <a href="#" class="dropdown-link">Attendance Tracking</a>
                            </li>
                            <li class="dropdown-item">
                                <a href="#" class="dropdown-link">Learning & Assessment</a>
                            </li>
                            <li class="dropdown-item">
                                <a href="#" class="dropdown-link">Billing & Finance</a>
                            </li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link">About</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link login-btn">Login</a>
                    </li>
                    <li class="nav-item">
                        <a href="#" class="nav-link join-btn">Join Us</a>
                    </li>
                </ul>
            </nav>

            <div class="hamburger" id="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </header>

    <main class="main-content">
        <div class="hero-section">
            <h1 class="main-title">LITTLE NEST</h1>
            <p class="hero-subtitle">Where little dreams grow big</p>
        </div>
        
    </main>

    
</body>

    </div>
  )
}

export default Home
