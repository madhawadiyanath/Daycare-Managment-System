import React, { useState } from 'react';
import './AddBill.css';
import Nav from "../Nav/Nav";
import axios from 'axios';

function AddBill() {
  // State for form inputs
  const [formData, setFormData] = useState({
    userId: '',
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recipient: '',
    status: 'completed'
  });

  // State for feedback messages
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate that userId is provided
      if (!formData.userId.trim()) {
        setMessage('Please enter a valid User ID');
        setIsError(true);
        setLoading(false);
        return;
      }
      
      const transactionData = {
        ...formData,
        userId: formData.userId.trim(),
        amount: parseFloat(formData.amount)
      };

      // Send data to backend API - CORRECTED ENDPOINT
      const response = await axios.post('http://localhost:5000/transactions', transactionData);

      if (response.data.success) {
        setMessage('Transaction added successfully!');
        setIsError(false);
        
        // Reset form
        setFormData({
          userId: '',
          type: 'expense',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          recipient: '',
          status: 'completed'
        });
      } else {
        throw new Error('Failed to add transaction');
      }
    } catch (error) {
      setMessage('Error adding transaction. Please try again.');
      setIsError(true);
      console.error('Error:', error);
      
      // More specific error handling
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Category options based on transaction type
  const expenseCategories = [
    'Tuition',
    'Supplies',
    'Salaries',
    'Rent',
    'Utilities',
    'Maintenance',
    'Food',
    'Other'
  ];

  const incomeCategories = [
    'Tuition Payment',
    'Grant',
    'Donation',
    'Fundraising',
    'Other Income'
  ];

  const transferCategories = [
    'Internal Transfer',
    'Bank Transfer',
    'Other Transfer'
  ];

  const getCategories = () => {
    if (formData.type === 'income') return incomeCategories;
    if (formData.type === 'transfer') return transferCategories;
    return expenseCategories;
  };

  return (
    <div className="add-bill-container">
      <Nav/>
      <h2>Add Financial Transaction</h2>
      
      {message && (
        <div className={`feedback-message ${isError ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      <div className="transaction-form-container">
        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                placeholder="Enter any user ID (e.g., user123, admin, 64d7a8c9e6b3f1a9f0b4c7d2)"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Transaction Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">Amount ($)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              required
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="recipient">Recipient/Payer</label>
              <input
                type="text"
                id="recipient"
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChange}
                placeholder={formData.type === 'income' ? 'Enter payer name' : 'Enter recipient name'}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding Transaction...' : 'Add Transaction'}
          </button>
        </form>
        
        <div className="form-info">
          <h3>About Transaction Types</h3>
          <div className="info-section">
            <h4>Expenses</h4>
            <p>Money going out of your organization. Examples: salaries, supplies, rent.</p>
          </div>
          <div className="info-section">
            <h4>Income</h4>
            <p>Money coming into your organization. Examples: tuition payments, donations.</p>
          </div>
          <div className="info-section">
            <h4>Transfers</h4>
            <p>Moving money between accounts. Examples: bank transfers, internal account changes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBill;