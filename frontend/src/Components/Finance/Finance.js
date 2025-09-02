import React, { useState, useEffect } from 'react';
import Nav from "../Nav/Nav";
import { Link } from "react-router-dom";
import './Finance.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Finance() {
  const [financialData, setFinancialData] = useState({
    monthlyRevenue: [4200, 4800, 5200, 4900, 5400, 5800],
    monthlyExpenses: [2800, 3200, 2900, 3100, 2700, 2500],
    enrollmentTrend: [45, 48, 52, 55, 58, 62, 65, 68, 70, 72, 75, 78],
    expenseBreakdown: {
      salaries: 15000,
      utilities: 2500,
      supplies: 1800,
      food: 3200,
      maintenance: 1200,
      insurance: 800
    }
  });

  // Sample data for charts
  const monthlyFinancialData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Revenue',
        data: financialData.monthlyRevenue,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Expenses',
        data: financialData.monthlyExpenses,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
    ],
  };

  const enrollmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Student Enrollment',
        data: financialData.enrollmentTrend,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const expenseBreakdownData = {
    labels: ['Salaries', 'Utilities', 'Supplies', 'Food & Nutrition', 'Maintenance', 'Insurance'],
    datasets: [
      {
        data: Object.values(financialData.expenseBreakdown),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(6, 182, 212, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(6, 182, 212, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: 'Student Enrollment Trend'
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: 'Monthly Revenue vs Expenses'
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Expense Breakdown',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  return (
    <div className="finance-container">
      <Nav/>
      <main className="main-content">
        <div className="finance-header">
          <h1>Financial Management</h1>
          <p>Manage your daycare's finances efficiently</p>
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

          <Link to="/SalaryDetails" className="finance-card">
            <div className="card-icon">
              <i className="fas fa-money-check-alt"></i>
            </div>
            <h3>Salary Details</h3>
            <p>Manage employee salaries and payroll</p>
            <button className="card-button">Salary Details</button>
          </Link>
        </div>

        {/* Financial Analytics Dashboard */}
        <div className="analytics-section">
          <h2 className="analytics-title">Financial Analytics Dashboard</h2>
          
          <div className="charts-container">
            {/* Monthly Revenue vs Expenses Bar Chart */}
            <div className="chart-card">
              <div className="chart-wrapper">
                <Bar data={monthlyFinancialData} options={barChartOptions} />
              </div>
            </div>

            {/* Student Enrollment Trend Line Chart */}
            <div className="chart-card">
              <div className="chart-wrapper">
                <Line data={enrollmentData} options={lineChartOptions} />
              </div>
            </div>

            {/* Expense Breakdown Pie Chart */}
            <div className="chart-card pie-chart-card">
              <div className="chart-wrapper">
                <Pie data={expenseBreakdownData} options={pieChartOptions} />
              </div>
            </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="kpi-section">
            <h3 className="kpi-title">Key Performance Indicators</h3>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="kpi-content">
                  <h4>Monthly Growth</h4>
                  <p className="kpi-value positive">+12.5%</p>
                  <span className="kpi-label">vs last month</span>
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="kpi-content">
                  <h4>Enrollment Rate</h4>
                  <p className="kpi-value">78 Students</p>
                  <span className="kpi-label">Current capacity: 85%</span>
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-icon">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div className="kpi-content">
                  <h4>Profit Margin</h4>
                  <p className="kpi-value positive">56.9%</p>
                  <span className="kpi-label">Above industry avg</span>
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="kpi-content">
                  <h4>Payment Rate</h4>
                  <p className="kpi-value">94.2%</p>
                  <span className="kpi-label">On-time payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Finance;