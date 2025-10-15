import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../Nav/Nav';
import FinanceSidebar from '../FinanceSideNav/FinanceSidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './ProfitLoss.css';
// Import logo - using require to handle special characters in filename
const logoImage = require('../../assets/WhatsApp Image 2025-08-05 at 19.02.34_b673857a - Copy.jpg');

const INCOME_URL = "http://localhost:5000/incomes";
const EXPENSE_URL = "http://localhost:5000/expenses";

function ProfitLoss() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [calculationResult, setCalculationResult] = useState(null);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);

  // Handle date range input changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    const selectedDate = new Date(value);
    const currentDate = new Date();
    
    // Reset any previous errors
    setError('');
    
    // Check if the selected date is in the future
    if (selectedDate > currentDate) {
      setError(`Cannot select a future date for ${name === 'startDate' ? 'start date' : 'end date'}`);
      return;
    }
    
    // Update the date range
    const newDateRange = {
      ...dateRange,
      [name]: value
    };
    
    // Additional validation when both dates are selected
    if (newDateRange.startDate && newDateRange.endDate) {
      const startDate = new Date(newDateRange.startDate);
      const endDate = new Date(newDateRange.endDate);
      
      if (startDate > endDate) {
        setError('Start date cannot be after end date');
        return;
      }
    }
    
    setDateRange(newDateRange);
  };

  // Fetch data from both APIs and calculate profit/loss
  const calculateProfitLoss = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      setError('Start date cannot be after end date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch income and expense data
      const [incomeResponse, expenseResponse] = await Promise.all([
        axios.get(INCOME_URL),
        axios.get(EXPENSE_URL)
      ]);

      const incomes = incomeResponse.data.success ? incomeResponse.data.incomes : [];
      const expenses = expenseResponse.data.success ? expenseResponse.data.expenses : [];

      // Filter data by date range
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date

      const filteredIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate >= startDate && incomeDate <= endDate;
      });

      const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });

      // Calculate totals
      const totalIncome = filteredIncomes.reduce((sum, income) => sum + (income.amount || 0), 0);
      const totalExpense = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const profitLoss = totalIncome - totalExpense;

      // Set calculation result
      setCalculationResult({
        totalIncome,
        totalExpense,
        profitLoss,
        isProfitable: profitLoss >= 0,
        incomeCount: filteredIncomes.length,
        expenseCount: filteredExpenses.length,
        dateRange: {
          start: dateRange.startDate,
          end: dateRange.endDate
        }
      });

      setIncomeData(filteredIncomes);
      setExpenseData(filteredExpenses);
      setIsCalculated(true);

    } catch (err) {
      setError('Failed to fetch data for calculation');
      console.error('Error calculating profit/loss:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset calculation
  const resetCalculation = () => {
    setCalculationResult(null);
    setIncomeData([]);
    setExpenseData([]);
    setIsCalculated(false);
    setError('');
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };

  // Download PDF function
  const downloadPDF = () => {
    if (!calculationResult) return;

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
      
      doc.setDrawColor(70, 130, 180);
      doc.setLineWidth(0.5);
      doc.rect(12, 57, pageWidth - 24, 21);
      
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138);
      doc.text('PROFIT & LOSS STATEMENT', pageWidth / 2, 70, { align: 'center' });
      
      // Report metadata
      doc.setFillColor(250, 252, 255);
      doc.rect(10, 85, pageWidth - 20, 25, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.setLineWidth(0.5);
      doc.rect(10, 85, pageWidth - 20, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const currentDate = new Date();
      doc.text(`Report Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, 92);
      doc.text(`Period: ${new Date(calculationResult.dateRange.start).toLocaleDateString()} to ${new Date(calculationResult.dateRange.end).toLocaleDateString()}`, 15, 97);
      doc.text(`Income Records: ${calculationResult.incomeCount}`, pageWidth / 2 + 10, 92);
      doc.text(`Expense Records: ${calculationResult.expenseCount}`, pageWidth / 2 + 10, 97);
      doc.text(`Status: ${calculationResult.isProfitable ? 'PROFITABLE' : 'LOSS'}`, 15, 102);
      
      // Financial Summary Table
      const summaryData = [
        ['Total Income', `Rs ${calculationResult.totalIncome.toFixed(2)}`],
        ['Total Expenses', `Rs ${calculationResult.totalExpense.toFixed(2)}`],
        [calculationResult.isProfitable ? 'Net Profit' : 'Net Loss', `Rs ${Math.abs(calculationResult.profitLoss).toFixed(2)}`]
      ];
      
      autoTable(doc, {
        head: [['Description', 'Amount']],
        body: summaryData,
        startY: 120,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontSize: 12,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 11,
          cellPadding: { top: 8, right: 8, bottom: 8, left: 8 }
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold' },
          1: { halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: function (data) {
          if (data.row.index === 2) { // Profit/Loss row
            data.cell.styles.fillColor = calculationResult.isProfitable ? [220, 252, 231] : [254, 226, 226];
            data.cell.styles.textColor = calculationResult.isProfitable ? [22, 101, 52] : [185, 28, 28];
          }
        }
      });
      
      // Detailed breakdown if space allows
      let currentY = doc.lastAutoTable.finalY + 20;
      
      if (currentY < pageHeight - 80) {
        // Income breakdown
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text('INCOME BREAKDOWN', 15, currentY);
        
        const incomeByCategory = {};
        incomeData.forEach(income => {
          if (!incomeByCategory[income.category]) {
            incomeByCategory[income.category] = 0;
          }
          incomeByCategory[income.category] += income.amount;
        });
        
        const incomeBreakdownData = Object.entries(incomeByCategory).map(([category, amount]) => [
          category,
          `Rs ${amount.toFixed(2)}`
        ]);
        
        if (incomeBreakdownData.length > 0) {
          autoTable(doc, {
            head: [['Income Category', 'Amount']],
            body: incomeBreakdownData,
            startY: currentY + 5,
            theme: 'striped',
            headStyles: {
              fillColor: [34, 197, 94],
              textColor: [255, 255, 255],
              fontSize: 10
            },
            bodyStyles: {
              fontSize: 9
            },
            columnStyles: {
              1: { halign: 'right' }
            }
          });
          
          currentY = doc.lastAutoTable.finalY + 15;
        }
        
        // Expense breakdown
        if (currentY < pageHeight - 60) {
          doc.setFontSize(14);
          doc.setTextColor(30, 58, 138);
          doc.text('EXPENSE BREAKDOWN', 15, currentY);
          
          const expenseByCategory = {};
          expenseData.forEach(expense => {
            if (!expenseByCategory[expense.category]) {
              expenseByCategory[expense.category] = 0;
            }
            expenseByCategory[expense.category] += expense.amount;
          });
          
          const expenseBreakdownData = Object.entries(expenseByCategory).map(([category, amount]) => [
            category,
            `Rs ${amount.toFixed(2)}`
          ]);
          
          if (expenseBreakdownData.length > 0) {
            autoTable(doc, {
              head: [['Expense Category', 'Amount']],
              body: expenseBreakdownData,
              startY: currentY + 5,
              theme: 'striped',
              headStyles: {
                fillColor: [239, 68, 68],
                textColor: [255, 255, 255],
                fontSize: 10
              },
              bodyStyles: {
                fontSize: 9
              },
              columnStyles: {
                1: { halign: 'right' }
              }
            });
          }
        }
      }
      
      // Footer
      const footerY = pageHeight - 25;
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(1);
      doc.line(10, footerY, pageWidth - 10, footerY);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Little Nest Daycare - Confidential Financial Document', 15, footerY + 8);
      doc.text(`Page 1 of 1`, pageWidth - 15, footerY + 8, { align: 'right' });
      doc.text('This document contains sensitive financial information. Handle with care.', 15, footerY + 12);
      doc.text(`Generated by: Daycare Management System v1.0`, pageWidth - 15, footerY + 12, { align: 'right' });
      
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('© 2024 Little Nest Daycare. All rights reserved. Unauthorized distribution prohibited.', pageWidth / 2, footerY + 18, { align: 'center' });
      
      doc.save(`Little-Nest-ProfitLoss-${calculationResult.dateRange.start}-to-${calculationResult.dateRange.end}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Download Excel function
  const downloadExcel = () => {
    if (!calculationResult) return;

    try {
      const workbook = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [
        ['PROFIT & LOSS STATEMENT'],
        [''],
        ['Period:', `${new Date(calculationResult.dateRange.start).toLocaleDateString()} to ${new Date(calculationResult.dateRange.end).toLocaleDateString()}`],
        ['Generated:', new Date().toLocaleDateString()],
        [''],
        ['FINANCIAL SUMMARY'],
        ['Total Income', calculationResult.totalIncome.toFixed(2)],
        ['Total Expenses', calculationResult.totalExpense.toFixed(2)],
        [calculationResult.isProfitable ? 'Net Profit' : 'Net Loss', Math.abs(calculationResult.profitLoss).toFixed(2)],
        [''],
        ['RECORD COUNTS'],
        ['Income Records', calculationResult.incomeCount],
        ['Expense Records', calculationResult.expenseCount]
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Income details sheet
      if (incomeData.length > 0) {
        const incomeSheet = XLSX.utils.json_to_sheet(
          incomeData.map(income => ({
            'Date': new Date(income.date).toLocaleDateString(),
            'Title': income.title,
            'Category': income.category,
            'Amount': income.amount.toFixed(2),
            'Description': income.description
          }))
        );
        XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Income Details');
      }
      
      // Expense details sheet
      if (expenseData.length > 0) {
        const expenseSheet = XLSX.utils.json_to_sheet(
          expenseData.map(expense => ({
            'Date': new Date(expense.date).toLocaleDateString(),
            'Title': expense.title,
            'Category': expense.category,
            'Amount': expense.amount.toFixed(2),
            'Description': expense.description
          }))
        );
        XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expense Details');
      }
      
      XLSX.writeFile(workbook, `profit-loss-${calculationResult.dateRange.start}-to-${calculationResult.dateRange.end}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error generating Excel file. Please try again.');
    }
  };

  // Get today's date in YYYY-MM-DD format for the max attribute
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="profit-loss-container">
      <Nav />
      <br></br><br></br><br></br><br></br>
      <div style={{ display: 'flex', flex: '1' }}>
        <FinanceSidebar />
        <main className="main-content">
        <div className="profit-loss-header">
          <h1>Profit & Loss Analysis</h1>
          <p>Calculate and analyze your daycare's financial performance</p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="calculation-section">
          <div className="date-selection-card">
            <h3>Select Date Range</h3>
            <div className="date-inputs">
              <div className="date-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  max={today}
                  required
                />
              </div>
              <div className="date-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  max={today}
                  required
                />
              </div>
            </div>
            <div className="calculation-buttons">
              <button 
                className="calculate-btn"
                onClick={calculateProfitLoss}
                disabled={loading}
              >
                {loading ? 'Calculating...' : 'Calculate Profit/Loss'}
              </button>
              {isCalculated && (
                <button 
                  className="reset-btn"
                  onClick={resetCalculation}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {calculationResult && (
            <div className="results-section">
              <div className="financial-summary">
                <div className="summary-card income-card">
                  <div className="card-icon">💰</div>
                  <div className="card-content">
                    <h4>Total Income</h4>
                    <p className="amount income-amount">Rs {calculationResult.totalIncome.toFixed(2)}</p>
                    <span className="record-count">{calculationResult.incomeCount} records</span>
                  </div>
                </div>

                <div className="summary-card expense-card">
                  <div className="card-icon">💸</div>
                  <div className="card-content">
                    <h4>Total Expenses</h4>
                    <p className="amount expense-amount">Rs {calculationResult.totalExpense.toFixed(2)}</p>
                    <span className="record-count">{calculationResult.expenseCount} records</span>
                  </div>
                </div>

                <div className={`summary-card result-card ${calculationResult.isProfitable ? 'profit-card' : 'loss-card'}`}>
                  <div className="card-icon">{calculationResult.isProfitable ? '📈' : '📉'}</div>
                  <div className="card-content">
                    <h4>{calculationResult.isProfitable ? 'Net Profit' : 'Net Loss'}</h4>
                    <p className={`amount ${calculationResult.isProfitable ? 'profit-amount' : 'loss-amount'}`}>
                      Rs {Math.abs(calculationResult.profitLoss).toFixed(2)}
                    </p>
                    <span className="result-status">
                      {calculationResult.isProfitable ? '✅ Profitable Period' : '⚠️ Loss Period'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="period-info">
                <h4>Analysis Period</h4>
                <p>
                  <strong>From:</strong> {new Date(calculationResult.dateRange.start).toLocaleDateString()} 
                  <strong> To:</strong> {new Date(calculationResult.dateRange.end).toLocaleDateString()}
                </p>
              </div>

              <div className="export-section">
                <h4>Export Reports</h4>
                <div className="export-buttons">
                  <button onClick={downloadPDF} className="export-btn pdf-btn">
                    📄 Download PDF Report
                  </button>
                  <button onClick={downloadExcel} className="export-btn excel-btn">
                    📊 Download Excel Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}

export default ProfitLoss;
