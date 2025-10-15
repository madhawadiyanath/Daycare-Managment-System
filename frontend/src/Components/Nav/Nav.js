import React from 'react'
import './Nav.css';
import {Link} from "react-router-dom";
function Nav() {
  const parentUser = JSON.parse(localStorage.getItem('user') || 'null');
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
                            <Link to="/learning-activities" class="dropdown-link">Learning & Assessment</Link>
                        </li>
                        <li class="dropdown-item">
                            <Link to="/mainfina" class="dropdown-link" >Billing & Finance</Link>
                        </li>
                        <li class="dropdown-item">
                            <Link to="/inventory/dashboard" class="dropdown-link" >Inventory</Link>
                        </li>
                    </ul>
                </li>
                <li class="nav-item">
                    <Link to="/AboutUs" class="nav-link">About</Link>
                </li>
                {parentUser ? (
                  <>
                    <li class="nav-item nav-actions">
                      <Link to="/parent/profile" class="nav-link nav-action-btn profile-btn" title="Profile">👤 {parentUser.name || parentUser.username || 'Profile'}</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li class="nav-item nav-actions">
                        <Link to="/login" class="nav-link nav-action-btn login-btn">Login</Link>
                    </li>
                    <li class="nav-item">
                        <Link to="/JoinUs" class="nav-link nav-action-btn join-btn" >Join Us</Link>
                    </li>
                  </>
                )}
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
