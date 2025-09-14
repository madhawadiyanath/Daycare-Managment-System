import React from 'react'
import './Nav.css';
import {Link} from "react-router-dom";
function Nav() {
  return (
    <div>
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
                <Link to="/goHome"  class="nav-link"> Home</Link>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">Features</a>
                    <ul class="dropdown-menu">
                        <li class="dropdown-item">
                            <Link to="/ChildcareDashboard" class="dropdown-link">Child Details</Link>
                        </li>
                        <li class="dropdown-item">
                            <a href="#" class="dropdown-link">Attendance Tracking</a>
                        </li>
                        <li class="dropdown-item">
                            <a href="#" class="dropdown-link">Learning & Assessment</a>
                        </li>
                        <li class="dropdown-item">
                            <Link to="/mainfina" class="dropdown-link" >Billing & Finance</Link>
                        </li>
                    </ul>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">About</a>
                </li>
                <li class="nav-item">
                    <Link to="/login" class="nav-link login-btn">Login</Link>
                </li>
                <li class="nav-item">
                    <Link to="/JoinUs" class="nav-link join-btn" >Join Us</Link>
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

     
    
            

    </div>
  )
}

export default Nav
