import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../Nav/Nav';
import FinanceSidebar from '../FinanceSideNav/FinanceSidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './ExpenseDetails.css';
// Import logo - using require to handle special characters in filename
const logoImage = require('../../assets/WhatsApp Image 2025-08-05 at 19.02.34_b673857a - Copy.jpg');

const EXPENSE_URL = "http://localhost:5000/expenses";

function ExpenseDetails() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    'Staff Salaries',
    'Teacher Wages',
    'Assistant Wages',
    'Substitute Staff',
    'Benefits & Insurance',
    'Payroll Taxes',
    'Rent & Utilities',
    'Electricity Bills',
    'Water Bills',
    'Internet & Phone',
    'Food & Snacks',
    'Kitchen Supplies',
    'Educational Materials',
    'Toys & Games',
    'Arts & Crafts Supplies',
    'Books & Learning Resources',
    'Cleaning Supplies',
    'Diaper & Hygiene Products',
    'First Aid Supplies',
    'Office Supplies',
    'Furniture & Equipment',
    'Playground Maintenance',
    'Vehicle Maintenance',
    'Fuel Costs',
    'Insurance Premiums',
    'License & Permits',
    'Training & Certification',
    'Marketing & Advertising',
    'Professional Services',
    'Maintenance & Repairs',
    'Other Expenses'
  ];

  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      const response = await axios.get(EXPENSE_URL);
      console.log('API Response:', response.data);
      
      if (response.data.success && response.data.expenses) {
        setExpenses(response.data.expenses);
        console.log('Set expenses state:', response.data.expenses);
      } else {
        setExpenses([]);
        console.log('No expenses found or API error');
      }
    } catch (err) {
      setError('Failed to load expense details');
      console.error('Error fetching expenses:', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Validate title (letters, spaces, and basic punctuation only)
  const validateTitle = (title) => {
    const titleRegex = /^[A-Za-z\s.,'-]+$/;
    return titleRegex.test(title);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special validation for title - filter out invalid characters
    if (name === 'title') {
      // Only allow letters, spaces, and basic punctuation
      const filteredValue = value.replace(/[^A-Za-z\s.,'-]/g, '');
      setFormData({
        ...formData,
        [name]: filteredValue
      });
      return;
    }
    
    // Special validation for date - only allow today's date
    if (name === 'date') {
      const today = new Date().toISOString().split('T')[0];
      if (value !== today) {
        setError('You can only select today\'s date');
        return; // Don't update if not today
      }
      setError(''); // Clear error if valid
    }
    
    // Prevent negative values for amount field
    if (name === 'amount') {
      if (value < 0) {
        return; // Don't update if negative
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!validateTitle(formData.title)) {
      setError('Title can only contain letters, spaces, and basic punctuation');
      return;
    }
    
    const amount = parseFloat(formData.amount) || 0;
    
    // Check for negative values
    if (amount < 0) {
      setError('Amount cannot be negative');
      return;
    }

    // Check if all fields are filled
    if (!formData.title || !formData.amount || !formData.category || !formData.date || !formData.description) {
      setError('All fields are required');
      return;
    }
    
    try {
      const expenseData = {
        title: formData.title,
        amount: amount,
        category: formData.category,
        date: formData.date,
        description: formData.description
      };

      console.log('Sending expense data:', expenseData);

      if (editingExpense) {
        // Update existing expense
        const response = await axios.put(`${EXPENSE_URL}/${editingExpense._id}`, expenseData);
        console.log('Update response:', response.data);
        setEditingExpense(null);
      } else {
        // Create new expense
        const response = await axios.post(EXPENSE_URL, expenseData);
        console.log('Create response:', response.data);
      }

      // Reset form and refresh data
      setFormData({
        title: '',
        amount: '',
        category: '',
        date: '',
        description: ''
      });
      setShowForm(false);
      setError(''); // Clear any previous errors
      
      // Show success message
      const successMsg = editingExpense ? 'Expense updated successfully!' : 'Expense added successfully!';
      setSuccessMessage(successMsg);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      fetchExpenses();
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to save expense details: ${err.response?.data?.message || err.message}`);
    }
  };

  // Handle edit
  const handleEdit = (expense) => {
    // Clear any existing messages
    setError('');
    setSuccessMessage('');
    
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      description: expense.description
    });
    setEditingExpense(expense);
    setShowForm(true);
    
    // Show confirmation alert
    alert(`Editing expense record: ${expense.title} (Rs ${expense.amount})`);
  };

  // Handle delete
  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await axios.delete(`${EXPENSE_URL}/${expenseId}`);
        setSuccessMessage('Expense record deleted successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        
        fetchExpenses();
      } catch (err) {
        setError('Failed to delete expense record');
        console.error('Error deleting expense:', err);
      }
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
    setError(''); // Clear any errors
    setSuccessMessage(''); // Clear any success messages
    setFormData({
      title: '',
      amount: '',
      category: '',
      date: '',
      description: ''
    });
  };

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(expense =>
    expense.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(expense.date).toLocaleDateString().includes(searchTerm)
  );

  // Download PDF function
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Header Section
      // Add decorative border at top
      doc.setDrawColor(30, 58, 138); // Professional dark blue
      doc.setLineWidth(3);
      doc.line(10, 10, pageWidth - 10, 10);
      
      // Company logo - use the actual logo image
      try {
        doc.addImage(logoImage.default || logoImage, 'JPEG', 15, 15, 30, 30);
      } catch (logoError) {
        console.error('Error loading logo:', logoError);
        // Fallback to professional design if logo fails to load
        doc.setFillColor(30, 58, 138);
        doc.rect(15, 15, 30, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('LITTLE', 30, 28, { align: 'center' });
        doc.text('NEST', 30, 35, { align: 'center' });
      }
      
      // Company name and details
      doc.setFontSize(24);
      doc.setTextColor(30, 58, 138); // Professional dark blue
      doc.text('LITTLE NEST DAYCARE', 55, 28);
      
      doc.setFontSize(12);
      doc.setTextColor(70, 130, 180);
      doc.text('Quality Childcare & Early Learning Center', 55, 36);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('📍 123 Childcare Lane, City, State 12345 | 📞 (555) 123-4567', 55, 42);
      doc.text('✉️ info@littlenest.com | 🌐 www.littlenest.com', 55, 46);
      
      // Report title section with gradient effect
      doc.setFillColor(245, 250, 255); // Very light blue background
      doc.rect(10, 55, pageWidth - 20, 25, 'F');
      doc.setDrawColor(30, 58, 138); // Dark blue border
      doc.setLineWidth(2);
      doc.rect(10, 55, pageWidth - 20, 25);
      
      // Add subtle inner border
      doc.setDrawColor(70, 130, 180);
      doc.setLineWidth(0.5);
      doc.rect(12, 57, pageWidth - 24, 21);
      
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138); // Professional dark blue
      doc.text('EXPENSE DETAILS REPORT', pageWidth / 2, 70, { align: 'center' });
      
      // Report metadata in professional layout
      doc.setFillColor(250, 252, 255); // Very subtle background
      doc.rect(10, 85, pageWidth - 20, 18, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.setLineWidth(0.5);
      doc.rect(10, 85, pageWidth - 20, 18);
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const currentDate = new Date();
      doc.text(`Report Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, 92);
      doc.text(`Total Records: ${filteredExpenses.length}`, 15, 97);
      doc.text(`Report Period: ${filteredExpenses.length > 0 ? 'All Available Data' : 'No Data'}`, pageWidth / 2 + 10, 92);
      doc.text(`Status: ${filteredExpenses.length > 0 ? 'Complete' : 'No Data Available'}`, pageWidth / 2 + 10, 97);
      
      // Prepare table data
      const tableData = filteredExpenses.map((expense) => [
        expense.title || 'N/A',
        `Rs ${(expense.amount || 0).toFixed(2)}`,
        expense.category || 'N/A',
        new Date(expense.date).toLocaleDateString() || 'N/A',
        expense.description || 'N/A'
      ]);
      
      // Calculate total expense
      const totalExpense = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      // Add professional table with enhanced styling
      autoTable(doc, {
        head: [['Title', 'Amount', 'Category', 'Date', 'Description']],
        body: tableData,
        startY: 110,
        theme: 'grid',
        alternateRowStyles: {
          fillColor: [248, 251, 255] // Very light blue
        },
        headStyles: {
          fillColor: [30, 58, 138], // Professional dark blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: { top: 5, right: 3, bottom: 5, left: 3 }
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
          lineColor: [180, 200, 220],
          lineWidth: 0.3
        },
        styles: {
          lineColor: [70, 130, 180],
          lineWidth: 0.5,
          cellPadding: 4
        },
        columnStyles: {
          0: { halign: 'left' }, // Title
          1: { halign: 'right', fontStyle: 'bold' }, // Amount
          2: { halign: 'center' }, // Category
          3: { halign: 'center' }, // Date
          4: { halign: 'left', fontSize: 8 } // Description
        }
      });
      
      // Add summary section
      const finalY = doc.lastAutoTable.finalY + 15;
      
      // Summary box
      doc.setFillColor(245, 250, 255); // Very light blue
      doc.rect(10, finalY, pageWidth - 20, 20, 'F');
      doc.setDrawColor(70, 130, 180); // Steel blue
      doc.setLineWidth(1);
      doc.rect(10, finalY, pageWidth - 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138); // Professional dark blue
      doc.text('EXPENSE SUMMARY', 15, finalY + 10);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Expense Amount: Rs ${totalExpense.toFixed(2)}`, 15, finalY + 16);
      doc.text(`Number of Expense Records: ${filteredExpenses.length}`, pageWidth / 2, finalY + 16);
      
      // Footer
      const footerY = pageHeight - 25;
      
      // Footer line
      doc.setDrawColor(30, 58, 138); // Professional dark blue
      doc.setLineWidth(1);
      doc.line(10, footerY, pageWidth - 10, footerY);
      
      // Footer content
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Little Nest Daycare - Confidential Expense Document', 15, footerY + 8);
      doc.text(`Page 1 of 1`, pageWidth - 15, footerY + 8, { align: 'right' });
      doc.text('This document contains sensitive financial information. Handle with care.', 15, footerY + 12);
      doc.text(`Generated by: Daycare Management System v1.0`, pageWidth - 15, footerY + 12, { align: 'right' });
      
      // Disclaimer
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('© 2024 Little Nest Daycare. All rights reserved. Unauthorized distribution prohibited.', pageWidth / 2, footerY + 18, { align: 'center' });
      
      doc.save(`Little-Nest-Expense-Report-${currentDate.toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Download Excel function
  const downloadExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        filteredExpenses.map(expense => ({
          'Title': expense.title || 'N/A',
          'Amount': (expense.amount || 0).toFixed(2),
          'Category': expense.category || 'N/A',
          'Date': new Date(expense.date).toLocaleDateString() || 'N/A',
          'Description': expense.description || 'N/A'
        }))
      );
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Expense Report');
      XLSX.writeFile(workbook, 'expense-report.xlsx');
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error generating Excel file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div>
        <Nav />
        <main className="main-content">
          <div className="loading">Loading expense details...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="expense-details-container">
      <Nav />
      <br></br><br></br><br></br><br></br>
      <div style={{ display: 'flex', flex: '1' }}>
        <FinanceSidebar />
        <main className="main-content">
        <div className="expense-header">
          <h1>Expense Management</h1>
          <p>Manage daycare expense records and financial tracking</p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <div className="expense-actions">
          <button 
            className="add-expense-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add New Expense'}
          </button>
        </div>

        {showForm && (
          <div className="expense-form-container">
            <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
            <form onSubmit={handleSubmit} className="expense-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => {
                      // Only allow letters, spaces, and basic punctuation
                      const filteredValue = e.target.value.replace(/[^A-Za-z\s.,'-]/g, '');
                      setFormData({
                        ...formData,
                        title: filteredValue
                      });
                    }}
                    onKeyPress={(e) => {
                      // Prevent typing invalid characters
                      const char = String.fromCharCode(e.which);
                      if (!/[A-Za-z\s.,'-]/.test(char)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter expense title (letters only)"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="amount">Amount (Rs)</label>
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
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
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
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    maxLength="500"
                    placeholder="Enter description (max 500 characters)"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="expense-table-container">
          <div className="table-header">
            <h2>Expense Records</h2>
            <div className="table-controls">
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <div className="download-buttons">
                <button onClick={downloadPDF} className="download-btn pdf-btn">
                  Download PDF
                </button>
                <button onClick={downloadExcel} className="download-btn excel-btn">
                  Download Excel
                </button>
              </div>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="no-expenses">
              <p>No expense records found.</p>
              <p>Start by adding your first expense record!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="expense-row">
                      <td>{expense.title || 'N/A'}</td>
                      <td className="amount-cell">Rs {expense.amount.toFixed(2)}</td>
                      <td>{expense.category || 'N/A'}</td>
                      <td>{new Date(expense.date).toLocaleDateString() || 'N/A'}</td>
                      <td className="description">{expense.description || 'N/A'}</td>
                      <td className="actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(expense)}
                        >
                          Update
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(expense._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}

export default ExpenseDetails;
