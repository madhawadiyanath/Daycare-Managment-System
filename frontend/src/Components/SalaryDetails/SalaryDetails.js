import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../Nav/Nav';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './SalaryDetails.css';
// Import logo - using require to handle special characters in filename
const logoImage = require('../../assets/WhatsApp Image 2025-08-05 at 19.02.34_b673857a - Copy.jpg');

const SALARY_URL = "http://localhost:5000/salaries";

function SalaryDetails() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [formData, setFormData] = useState({
    empID: '',
    empName: '',
    email: '',
    basicSalary: '',
    month: '',
    allowances: '',
    loanDeductions: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all salaries
  const fetchSalaries = async () => {
    try {
      const response = await axios.get(SALARY_URL);
      console.log('API Response:', response.data); // Debug log
      console.log('Salaries array:', response.data.salaries); // Debug log
      
      if (response.data.success && response.data.salaries) {
        setSalaries(response.data.salaries);
        console.log('Set salaries state:', response.data.salaries);
      } else {
        setSalaries([]);
        console.log('No salaries found or API error');
      }
    } catch (err) {
      setError('Failed to load salary details');
      console.error('Error fetching salaries:', err);
      setSalaries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  // Calculate final salary
  const calculateFinalSalary = (basicSalary, allowances, loanDeductions) => {
    const basic = parseFloat(basicSalary) || 0;
    const allow = parseFloat(allowances) || 0;
    const deduct = parseFloat(loanDeductions) || 0;
    return basic + allow - deduct;
  };

  // Validate employee name (letters and spaces only)
  const validateEmployeeName = (name) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special validation for employee name - filter out invalid characters
    if (name === 'empName') {
      // Only allow letters and spaces, remove everything else
      const filteredValue = value.replace(/[^A-Za-z\s]/g, '');
      setFormData({
        ...formData,
        [name]: filteredValue
      });
      return;
    }
    
    // Prevent negative values for salary fields
    if (['basicSalary', 'allowances', 'loanDeductions'].includes(name)) {
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
    if (!validateEmployeeName(formData.empName)) {
      setError('Employee name can only contain letters and spaces');
      return;
    }
    
    const basicSalary = parseFloat(formData.basicSalary) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const loanDeductions = parseFloat(formData.loanDeductions) || 0;
    
    // Check for negative values
    if (basicSalary < 0 || allowances < 0 || loanDeductions < 0) {
      setError('Salary values cannot be negative');
      return;
    }
    
    // Check if loan deductions exceed basic salary
    if (loanDeductions > basicSalary) {
      setError('Loan deductions cannot exceed basic salary');
      return;
    }
    
    try {
      const salaryData = {
        empID: formData.empID,
        empName: formData.empName,
        email: formData.email,
        basicSalary: basicSalary,
        month: formData.month,
        allowances: allowances,
        loanDeductions: loanDeductions
      };

      console.log('Sending salary data:', salaryData); // Debug log

      if (editingSalary) {
        // Update existing salary
        const response = await axios.put(`${SALARY_URL}/${editingSalary._id}`, salaryData);
        console.log('Update response:', response.data);
        setEditingSalary(null);
      } else {
        // Create new salary
        const response = await axios.post(SALARY_URL, salaryData);
        console.log('Create response:', response.data);
      }

      // Reset form and refresh data
      setFormData({
        empID: '',
        empName: '',
        email: '',
        basicSalary: '',
        month: '',
        allowances: '',
        loanDeductions: ''
      });
      setShowForm(false);
      setError(''); // Clear any previous errors
      fetchSalaries();
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to save salary details: ${err.response?.data?.message || err.message}`);
    }
  };

  // Handle edit
  const handleEdit = (salary) => {
    setFormData({
      empID: salary.empID,
      empName: salary.empName,
      email: salary.email,
      basicSalary: salary.basicSalary.toString(),
      month: salary.month,
      allowances: salary.allowances.toString(),
      loanDeductions: salary.loanDeductions.toString()
    });
    setEditingSalary(salary);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (salaryId) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      try {
        await axios.delete(`${SALARY_URL}/${salaryId}`);
        fetchSalaries();
      } catch (err) {
        setError('Failed to delete salary record');
        console.error('Error deleting salary:', err);
      }
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingSalary(null);
    setFormData({
      empID: '',
      empName: '',
      email: '',
      basicSalary: '',
      month: '',
      allowances: '',
      loanDeductions: ''
    });
  };

  // Filter salaries based on search term
  const filteredSalaries = salaries.filter(salary =>
    salary.empID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salary.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salary.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salary.month?.toLowerCase().includes(searchTerm.toLowerCase())
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
      doc.text('EMPLOYEE SALARY REPORT', pageWidth / 2, 70, { align: 'center' });
      
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
      doc.text(`Total Records: ${filteredSalaries.length}`, 15, 97);
      doc.text(`Report Period: ${filteredSalaries.length > 0 ? 'All Available Data' : 'No Data'}`, pageWidth / 2 + 10, 92);
      doc.text(`Status: ${filteredSalaries.length > 0 ? 'Complete' : 'No Data Available'}`, pageWidth / 2 + 10, 97);
      
      // Prepare table data
      const tableData = filteredSalaries.map((salary) => [
        salary.empID || 'N/A',
        salary.empName || 'N/A',
        salary.email || 'N/A',
        `Rs ${(salary.basicSalary || 0).toFixed(2)}`,
        salary.month || 'N/A',
        `Rs ${(salary.allowances || 0).toFixed(2)}`,
        `Rs ${(salary.loanDeductions || 0).toFixed(2)}`,
        `Rs ${calculateFinalSalary(salary.basicSalary || 0, salary.allowances || 0, salary.loanDeductions || 0).toFixed(2)}`
      ]);
      
      // Calculate totals for summary
      const totalBasicSalary = filteredSalaries.reduce((sum, salary) => sum + (salary.basicSalary || 0), 0);
      const totalAllowances = filteredSalaries.reduce((sum, salary) => sum + (salary.allowances || 0), 0);
      const totalDeductions = filteredSalaries.reduce((sum, salary) => sum + (salary.loanDeductions || 0), 0);
      const totalFinalSalary = totalBasicSalary + totalAllowances - totalDeductions;
      
      // Add professional table with enhanced styling
      autoTable(doc, {
        head: [['Emp ID', 'Name', 'Email', 'Basic Salary', 'Month', 'Allowances', 'Deductions', 'Final Salary']],
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
          0: { halign: 'center', fontStyle: 'bold' }, // Emp ID
          1: { halign: 'left' }, // Name
          2: { halign: 'left', fontSize: 8 }, // Email
          3: { halign: 'right', fontStyle: 'bold' }, // Basic Salary
          4: { halign: 'center' }, // Month
          5: { halign: 'right' }, // Allowances
          6: { halign: 'right' }, // Deductions
          7: { halign: 'right', fontStyle: 'bold', fillColor: [240, 248, 255] } // Final Salary
        }
      });
      
      // Add summary section
      const finalY = doc.lastAutoTable.finalY + 15;
      
      // Summary box
      doc.setFillColor(245, 250, 255); // Very light blue
      doc.rect(10, finalY, pageWidth - 20, 30, 'F');
      doc.setDrawColor(70, 130, 180); // Steel blue
      doc.setLineWidth(1);
      doc.rect(10, finalY, pageWidth - 20, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138); // Professional dark blue
      doc.text('PAYROLL SUMMARY', 15, finalY + 10);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Basic Salaries: Rs ${totalBasicSalary.toFixed(2)}`, 15, finalY + 18);
      doc.text(`Total Allowances: Rs ${totalAllowances.toFixed(2)}`, 15, finalY + 23);
      doc.text(`Total Deductions: Rs ${totalDeductions.toFixed(2)}`, pageWidth / 2, finalY + 18);
      doc.text(`Net Payroll Amount: Rs ${totalFinalSalary.toFixed(2)}`, pageWidth / 2, finalY + 23);
      
      // Footer
      const footerY = pageHeight - 25;
      
      // Footer line
      doc.setDrawColor(30, 58, 138); // Professional dark blue
      doc.setLineWidth(1);
      doc.line(10, footerY, pageWidth - 10, footerY);
      
      // Footer content
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Little Nest Daycare - Confidential Payroll Document', 15, footerY + 8);
      doc.text(`Page 1 of 1`, pageWidth - 15, footerY + 8, { align: 'right' });
      doc.text('This document contains sensitive financial information. Handle with care.', 15, footerY + 12);
      doc.text(`Generated by: Daycare Management System v1.0`, pageWidth - 15, footerY + 12, { align: 'right' });
      
      // Disclaimer
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('© 2024 Little Nest Daycare. All rights reserved. Unauthorized distribution prohibited.', pageWidth / 2, footerY + 18, { align: 'center' });
      
      doc.save(`Little-Nest-Salary-Report-${currentDate.toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Download Excel function
  const downloadExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        filteredSalaries.map(salary => ({
          'Employee ID': salary.empID || 'N/A',
          'Employee Name': salary.empName || 'N/A',
          'Email': salary.email || 'N/A',
          'Basic Salary': (salary.basicSalary || 0).toFixed(2),
          'Month': salary.month || 'N/A',
          'Allowances': (salary.allowances || 0).toFixed(2),
          'Loan Deductions': (salary.loanDeductions || 0).toFixed(2),
          'Final Salary': calculateFinalSalary(salary.basicSalary || 0, salary.allowances || 0, salary.loanDeductions || 0).toFixed(2)
        }))
      );
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary Report');
      XLSX.writeFile(workbook, 'salary-report.xlsx');
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
          <div className="loading">Loading salary details...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="salary-details-container">
      <Nav />
      <main className="main-content">
        <div className="salary-header">
          <h1>Salary Management</h1>
          <p>Manage employee salaries and payroll information</p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="salary-actions">
          <button 
            className="add-salary-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add New Salary'}
          </button>
        </div>

        {showForm && (
          <div className="salary-form-container">
            <h3>{editingSalary ? 'Edit Salary' : 'Add New Salary'}</h3>
            <form onSubmit={handleSubmit} className="salary-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="empID">Employee ID</label>
                  <input
                    type="text"
                    id="empID"
                    name="empID"
                    value={formData.empID}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="empName">Employee Name</label>
                  <input
                    type="text"
                    id="empName"
                    name="empName"
                    value={formData.empName}
                    onChange={(e) => {
                      // Only allow letters and spaces
                      const filteredValue = e.target.value.replace(/[^A-Za-z\s]/g, '');
                      setFormData({
                        ...formData,
                        empName: filteredValue
                      });
                    }}
                    onKeyPress={(e) => {
                      // Prevent typing invalid characters
                      const char = String.fromCharCode(e.which);
                      if (!/[A-Za-z\s]/.test(char)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter employee name (letters only)"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="month">Month</label>
                  <input
                    type="month"
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="basicSalary">Basic Salary (Rs)</label>
                  <input
                    type="number"
                    id="basicSalary"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="allowances">Allowances (Rs)</label>
                  <input
                    type="number"
                    id="allowances"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="loanDeductions">Loan Deductions (Rs)</label>
                  <input
                    type="number"
                    id="loanDeductions"
                    name="loanDeductions"
                    value={formData.loanDeductions}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Final Salary (Rs)</label>
                  <input
                    type="text"
                    value={`Rs ${calculateFinalSalary(formData.basicSalary, formData.allowances, formData.loanDeductions).toFixed(2)}`}
                    disabled
                    className="calculated-field"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingSalary ? 'Update Salary' : 'Add Salary'}
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="salary-table-container">
          <div className="table-header">
            <h2>Employee Salary Records</h2>
            <div className="table-controls">
              <input
                type="text"
                placeholder="Search salaries..."
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

          <div className="debug-info">
            <p>Debug: Found {salaries.length} salary records</p>
            <p>Loading state: {loading.toString()}</p>
            <p>Error: {error || 'None'}</p>
          </div>

          {filteredSalaries.length === 0 ? (
            <div className="no-salaries">
              <p>No salary records found.</p>
              <p>Start by adding your first salary record!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="salary-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Email</th>
                    <th>Basic Salary</th>
                    <th>Month</th>
                    <th>Allowances</th>
                    <th>Loan Deductions</th>
                    <th>Final Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaries.map((salary) => (
                    <tr key={salary._id} className="salary-row">
                      <td>{salary.empID || 'N/A'}</td>
                      <td>{salary.empName || 'N/A'}</td>
                      <td>{salary.email || 'N/A'}</td>
                      <td>Rs {(salary.basicSalary || 0).toFixed(2)}</td>
                      <td>{salary.month || 'N/A'}</td>
                      <td>Rs {(salary.allowances || 0).toFixed(2)}</td>
                      <td>Rs {(salary.loanDeductions || 0).toFixed(2)}</td>
                      <td className="final-salary">
                        Rs {calculateFinalSalary(salary.basicSalary || 0, salary.allowances || 0, salary.loanDeductions || 0).toFixed(2)}
                      </td>
                      <td className="actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(salary)}
                        >
                          Update
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(salary._id)}
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
  );
}

export default SalaryDetails;
