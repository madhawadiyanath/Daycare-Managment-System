import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './FinanceSidebar.css'

function FinanceSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    
    <aside className={`finance-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="finance-sidebar__title">
        <span>Finance</span>
        <button
          type="button"
          className="finance-sidebar__toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <div className="finance-sidebar__profile">
        <img className="finance-sidebar__avatar" src="https://i.pravatar.cc/80?img=13" alt="Admin" />
        <div className="finance-sidebar__user">
          <span className="finance-sidebar__name">Admin User</span>
          <span className="finance-sidebar__email">admin@example.com</span>
        </div>
      </div>
      <nav>
        <ul className="finance-sidebar__nav">
          <li>
            <Link to="/mainfina" className={`finance-sidebar__link ${isActive('/finance') ? 'is-active' : ''}`}>
              <span className="finance-sidebar__icon">🏠</span>
              <span className="finance-sidebar__label">Finance Home</span>
            </Link>
          </li>
          <li>
            <Link to="/expense-details" className={`finance-sidebar__link ${isActive('/expense-details') ? 'is-active' : ''}`}>
              <span className="finance-sidebar__icon">💸</span>
              <span className="finance-sidebar__label">Expenses Details</span>
            </Link>
          </li>
          <li>
            <Link to="/income-details" className={`finance-sidebar__link ${isActive('/income-details') ? 'is-active' : ''}`}>
              <span className="finance-sidebar__icon">💰</span>
              <span className="finance-sidebar__label">Income Details</span>
            </Link>
          </li>
          <li>
            <Link to="/profit-loss" className={`finance-sidebar__link ${isActive('/profit-loss') ? 'is-active' : ''}`}>
              <span className="finance-sidebar__icon">📊</span>
              <span className="finance-sidebar__label">Profit & Loss</span>
            </Link>
          </li>
          <li>
            <Link to="/SalaryDetails" className={`finance-sidebar__link ${isActive('/salary-details') ? 'is-active' : ''}`}>
              <span className="finance-sidebar__icon">👥</span>
              <span className="finance-sidebar__label">Salary Details</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="finance-sidebar__footer">
      <Link to="/goHome"><button type="button" className="finance-sidebar__logout">
          <span className="finance-sidebar__icon">⎋</span>
          <span>Logout</span>
        </button>
        </Link>
      </div>
    </aside>
    
  )
}

export default FinanceSidebar


