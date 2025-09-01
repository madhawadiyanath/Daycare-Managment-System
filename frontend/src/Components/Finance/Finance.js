import React from 'react';
import Nav from "../Nav/Nav";
import { Link } from "react-router-dom";
import './Finance.css'; // Create this CSS file

function Finance() {
  return (
    <div className="finance-container">
      <Nav/>
      <main className="main-content">
        <div className="finance-header">
          <h1>Financial Management</h1>
          <p>Manage your daycare's finances efficiently</p>
        </div>

        <div className="finance-cards">
          <Link to="/AddBill" className="finance-card">
            <div className="card-icon">
              <i className="fas fa-plus-circle"></i>
            </div>
            <h3>Add New Transaction</h3>
            <p>Record new expenses, income, or transfers</p>
            <button className="card-button">Add Bill</button>
          </Link>

          <Link to="/BillDetails" className="finance-card">
            <div className="card-icon">
              <i className="fas fa-list-alt"></i>
            </div>
            <h3>View Transactions</h3>
            <p>Review all financial records and history</p>
            <button className="card-button">Bill Details</button>
          </Link>

          <Link to="/reports" className="finance-card">
            <div className="card-icon">
              <i className="fas fa-chart-bar"></i>
            </div>
            <h3>Financial Reports</h3>
            <p>Generate financial reports and analytics</p>
            <button className="card-button">View Reports</button>
          </Link>

          <Link to="/budget" className="finance-card">
            <div className="card-icon">
              <i className="fas fa-wallet"></i>
            </div>
            <h3>Budget Planning</h3>
            <p>Create and manage your budget</p>
            <button className="card-button">Manage Budget</button>
          </Link>
        </div>

        <div className="quick-stats">
          <div className="stat-item">
            <i className="fas fa-arrow-down stat-icon expense"></i>
            <div className="stat-info">
              <h4>Total Expenses</h4>
              <p className="stat-amount">$2,500.00</p>
            </div>
          </div>
          
          <div className="stat-item">
            <i className="fas fa-arrow-up stat-icon income"></i>
            <div className="stat-info">
              <h4>Total Income</h4>
              <p className="stat-amount">$5,800.00</p>
            </div>
          </div>
          
          <div className="stat-item">
            <i className="fas fa-exchange-alt stat-icon transfer"></i>
            <div className="stat-info">
              <h4>Net Balance</h4>
              <p className="stat-amount">$3,300.00</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Finance;