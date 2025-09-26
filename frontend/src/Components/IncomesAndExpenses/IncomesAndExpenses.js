import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../Nav/Nav';
import FinanceSidebar from '../FinanceSideNav/FinanceSidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './IncomesAndExpenses.css';

// Import logo - using require to handle special characters in filename
const logoImage = require('../../assets/WhatsApp Image 2025-08-05 at 19.02.34_b673857a - Copy.jpg');

const INCOME_URL = "http://localhost:5000/incomes";
const EXPENSE_URL = "http://localhost:5000/expenses";

function IncomesAndExpenses() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [incomeSearchTerm, setIncomeSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter incomes based on search term
  useEffect(() => {
    const filtered = incomes.filter(income =>
      income.title.toLowerCase().includes(incomeSearchTerm.toLowerCase()) ||
      income.category.toLowerCase().includes(incomeSearchTerm.toLowerCase()) ||
      income.description.toLowerCase().includes(incomeSearchTerm.toLowerCase()) ||
      new Date(income.date).toLocaleDateString().includes(incomeSearchTerm.toLowerCase())
    );
    setFilteredIncomes(filtered);
  }, [incomes, incomeSearchTerm]);

  // Filter expenses based on search term
  useEffect(() => {
    const filtered = expenses.filter(expense =>
      expense.title.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
      new Date(expense.date).toLocaleDateString().includes(expenseSearchTerm.toLowerCase())
    );
    setFilteredExpenses(filtered);
  }, [expenses, expenseSearchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incomeResponse, expenseResponse] = await Promise.all([
        axios.get(INCOME_URL),
        axios.get(EXPENSE_URL)
      ]);

      if (incomeResponse.data.success) {
        setIncomes(incomeResponse.data.incomes);
      }
      if (expenseResponse.data.success) {
        setExpenses(expenseResponse.data.expenses);
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Download PDF function
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Header Section
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(3);
      doc.line(10, 10, pageWidth - 10, 10);
      
      // Company logo
      try {
        doc.addImage(logoImage.default || logoImage, 'JPEG', 15, 15, 30, 30);
      } catch (logoError) {
        console.error('Error loading logo:', logoError);
        doc.setFillColor(30, 58, 138);
        doc.rect(15, 15, 30, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('LITTLE', 30, 28, { align: 'center' });
        doc.text('NEST', 30, 35, { align: 'center' });
      }
      
      // Company name and details
      doc.setFontSize(24);
      doc.setTextColor(30, 58, 138);
      doc.text('LITTLE NEST DAYCARE', 55, 28);
      
      doc.setFontSize(12);
      doc.setTextColor(70, 130, 180);
      doc.text('Quality Childcare & Early Learning Center', 55, 36);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('📍 123 Childcare Lane, City, State 12345 | 📞 (555) 123-4567', 55, 42);
      doc.text('✉️ info@littlenest.com | 🌐 www.littlenest.com', 55, 46);
      
      // Report title section
      doc.setFillColor(245, 250, 255);
      doc.rect(10, 55, pageWidth - 20, 25, 'F');
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(2);
      doc.rect(10, 55, pageWidth - 20, 25);
      
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138);
      doc.text('INCOMES & EXPENSES REPORT', pageWidth / 2, 70, { align: 'center' });
      
      // Report metadata
      doc.setFillColor(250, 252, 255);
      doc.rect(10, 85, pageWidth - 20, 20, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.setLineWidth(0.5);
      doc.rect(10, 85, pageWidth - 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const currentDate = new Date();
      doc.text(`Report Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, 92);
      doc.text(`Total Income Records: ${filteredIncomes.length}`, 15, 97);
      doc.text(`Total Expense Records: ${filteredExpenses.length}`, pageWidth / 2 + 10, 92);
      
      const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
      const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      doc.text(`Total Income: Rs ${totalIncome.toFixed(2)}`, pageWidth / 2 + 10, 97);
      
      let currentY = 115;
      
      // Income Table
      if (filteredIncomes.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text('INCOME RECORDS', 15, currentY);
        
        const incomeTableData = filteredIncomes.map(income => [
          new Date(income.date).toLocaleDateString(),
          income.title,
          income.category,
          `Rs ${income.amount.toFixed(2)}`,
          income.description.substring(0, 30) + (income.description.length > 30 ? '...' : '')
        ]);
        
        autoTable(doc, {
          head: [['Date', 'Title', 'Category', 'Amount', 'Description']],
          body: incomeTableData,
          startY: currentY + 5,
          theme: 'striped',
          headStyles: {
            fillColor: [34, 197, 94],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 8
          },
          columnStyles: {
            3: { halign: 'right' }
          }
        });
        
        currentY = doc.lastAutoTable.finalY + 20;
      }
      
      // Add new page if needed
      if (currentY > pageHeight - 100) {
        doc.addPage();
        currentY = 20;
      }
      
      // Expense Table
      if (filteredExpenses.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text('EXPENSE RECORDS', 15, currentY);
        
        const expenseTableData = filteredExpenses.map(expense => [
          new Date(expense.date).toLocaleDateString(),
          expense.title,
          expense.category,
          `Rs ${expense.amount.toFixed(2)}`,
          expense.description.substring(0, 30) + (expense.description.length > 30 ? '...' : '')
        ]);
        
        autoTable(doc, {
          head: [['Date', 'Title', 'Category', 'Amount', 'Description']],
          body: expenseTableData,
          startY: currentY + 5,
          theme: 'striped',
          headStyles: {
            fillColor: [239, 68, 68],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 8
          },
          columnStyles: {
            3: { halign: 'right' }
          }
        });
      }
      
      // Footer
      const footerY = pageHeight - 25;
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(1);
      doc.line(10, footerY, pageWidth - 10, footerY);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Little Nest Daycare - Confidential Financial Document', 15, footerY + 8);
      doc.text(`Generated by: Daycare Management System v1.0`, pageWidth - 15, footerY + 8, { align: 'right' });
      
      doc.save(`Little-Nest-Incomes-Expenses-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Download Excel function
  const downloadExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Summary sheet
      const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
      const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const summaryData = [
        ['INCOMES & EXPENSES REPORT'],
        [''],
        ['Generated:', new Date().toLocaleDateString()],
        [''],
        ['SUMMARY'],
        ['Total Income Records', filteredIncomes.length],
        ['Total Expense Records', filteredExpenses.length],
        ['Total Income Amount', totalIncome.toFixed(2)],
        ['Total Expense Amount', totalExpense.toFixed(2)],
        ['Net Amount', (totalIncome - totalExpense).toFixed(2)]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Income sheet
      if (filteredIncomes.length > 0) {
        const incomeSheet = XLSX.utils.json_to_sheet(
          filteredIncomes.map(income => ({
            'Date': new Date(income.date).toLocaleDateString(),
            'Title': income.title,
            'Category': income.category,
            'Amount': income.amount.toFixed(2),
            'Description': income.description
          }))
        );
        XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Incomes');
      }
      
      // Expense sheet
      if (filteredExpenses.length > 0) {
        const expenseSheet = XLSX.utils.json_to_sheet(
          filteredExpenses.map(expense => ({
            'Date': new Date(expense.date).toLocaleDateString(),
            'Title': expense.title,
            'Category': expense.category,
            'Amount': expense.amount.toFixed(2),
            'Description': expense.description
          }))
        );
        XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');
      }
      
      XLSX.writeFile(workbook, `incomes-expenses-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error generating Excel file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="incomes-expenses-container">
        <Nav />
        <br /><br /><br /><br />
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="incomes-expenses-container">
      <Nav />
      <br /><br /><br /><br />
      <div style={{ display: 'flex', flex: '1' }}>
        <FinanceSidebar />
        <main className="main-content">
        <div className="page-header">
          <h1>Incomes & Expenses Overview</h1>
          <p>Comprehensive view of all financial transactions</p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {/* Export Section */}
        <div className="export-section">
          <div className="export-buttons">
            <button onClick={downloadPDF} className="export-btn pdf-btn">
              📄 Download PDF Report
            </button>
            <button onClick={downloadExcel} className="export-btn excel-btn">
              📊 Download Excel Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card income-summary">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Total Income</h3>
              <p className="amount">Rs {filteredIncomes.reduce((sum, income) => sum + income.amount, 0).toFixed(2)}</p>
              <span className="record-count">{filteredIncomes.length} records</span>
            </div>
          </div>
          <div className="summary-card expense-summary">
            <div className="card-icon">💸</div>
            <div className="card-content">
              <h3>Total Expenses</h3>
              <p className="amount">Rs {filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}</p>
              <span className="record-count">{filteredExpenses.length} records</span>
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="tables-container">
          {/* Expenses Table (Left) */}
          <div className="table-section expense-section">
            <div className="table-header">
              <h2>💸 Expenses</h2>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={expenseSearchTerm}
                  onChange={(e) => setExpenseSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <div className="table-wrapper">
              <table className="data-table expense-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <tr key={expense._id}>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td>{expense.title}</td>
                        <td>{expense.category}</td>
                        <td className="amount-cell">Rs {expense.amount.toFixed(2)}</td>
                        <td className="description-cell">{expense.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No expenses found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Incomes Table (Right) */}
          <div className="table-section income-section">
            <div className="table-header">
              <h2>💰 Incomes</h2>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search incomes..."
                  value={incomeSearchTerm}
                  onChange={(e) => setIncomeSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <div className="table-wrapper">
              <table className="data-table income-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.length > 0 ? (
                    filteredIncomes.map((income) => (
                      <tr key={income._id}>
                        <td>{new Date(income.date).toLocaleDateString()}</td>
                        <td>{income.title}</td>
                        <td>{income.category}</td>
                        <td className="amount-cell">Rs {income.amount.toFixed(2)}</td>
                        <td className="description-cell">{income.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No incomes found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

export default IncomesAndExpenses;
