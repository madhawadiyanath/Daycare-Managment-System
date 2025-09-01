import React, { useEffect, useState } from 'react';
import Nav from "../Nav/Nav";
import axios from 'axios';
import './BillDetails.css';

const TRANSACTIONS_URL = "http://localhost:5000/transactions";
const USERS_URL = "http://Localhost:5000/users";

function BillDetails() {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(TRANSACTIONS_URL);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      throw new Error("Failed to load transaction details");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(USERS_URL);
      const usersMap = {};
      response.data.users.forEach(user => {
        usersMap[user._id] = user;
      });
      return usersMap;
    } catch (err) {
      console.error("Failed to fetch users:", err);
      throw new Error("Failed to load user details");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactionsData, usersData] = await Promise.all([
          fetchTransactions(),
          fetchUsers()
        ]);
        
        setTransactions(transactionsData.transactions || []);
        setUsers(usersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusBadge = (status) => {
    const statusClass = status === 'completed' ? 'status-completed' : 
                       status === 'pending' ? 'status-pending' : 'status-failed';
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  const getTypeBadge = (type) => {
    const typeClass = type === 'income' ? 'type-income' : 
                     type === 'expense' ? 'type-expense' : 'type-transfer';
    return <span className={`type-badge ${typeClass}`}>{type}</span>;
  };

  const formatAmount = (amount, type) => {
    const sign = type === 'income' ? '+' : '-';
    return (
      <span className={`amount ${type === 'income' ? 'positive' : 'negative'}`}>
        {sign}${Math.abs(amount).toFixed(2)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserInfo = (userId) => {
    const user = users[userId];
    if (!user) return 'Loading...';
    
    return (
      <div className="user-info">
        <div className="user-name">{user.name}</div>
        <div className="user-email">{user.email}</div>
        <div className="user-id">ID: {userId}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <Nav />
        <main className="main-content">
          <div className="loading">Loading bill details...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Nav />
        <main className="main-content">
          <div className="error-message">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <main >
        <div className="bill-details-container">
          <div className="header-section">
            <h1>Bill & Transaction Details</h1>
            <p className="subtitle">Manage and view all financial transactions with user information</p>
          </div>

          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Transactions</h3>
              <p className="stat-number">{transactions.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{Object.keys(users).length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Income</h3>
              <p className="stat-number positive">
                ${transactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="stat-card">
              <h3>Total Expenses</h3>
              <p className="stat-number negative">
                ${transactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>

          <div className="transactions-table-container">
            <div className="table-header">
              <h2>All Transactions with User Details</h2>
              <span className="transaction-count">
                {transactions.length} transactions by {Object.keys(users).length} users
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="no-transactions">
                <p>No transactions found.</p>
                <p>Start by adding your first transaction!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>User Information</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Recipient</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction._id} className="transaction-row">
                        <td className="user-cell">
                          {getUserInfo(transaction.userId)}
                        </td>
                        <td>{formatDate(transaction.date)}</td>
                        <td>{getTypeBadge(transaction.type)}</td>
                        <td>{transaction.category}</td>
                        <td className="description">
                          {transaction.description || 'No description'}
                        </td>
                        <td>{formatAmount(transaction.amount, transaction.type)}</td>
                        <td>{transaction.recipient || 'N/A'}</td>
                        <td>{getStatusBadge(transaction.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default BillDetails;