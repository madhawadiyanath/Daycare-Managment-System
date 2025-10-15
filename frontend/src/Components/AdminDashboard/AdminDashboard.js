import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Reuse the same logo used by ExpenseDetails for consistent branding
const logoImage = require('../../assets/WhatsApp Image 2025-08-05 at 19.02.34_b673857a - Copy.jpg');

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  // Finance managers state
  const [fmList, setFmList] = useState([]);
  const [fmLoading, setFmLoading] = useState(false);
  const [fmError, setFmError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fmForm, setFmForm] = useState({ name: '', email: '', phone: '', username: '', password: '' });
  const [fmSubmitting, setFmSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', username: '', password: '' });

  // Teachers state
  const [tList, setTList] = useState([]);
  const [tLoading, setTLoading] = useState(false);
  const [tError, setTError] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [tForm, setTForm] = useState({ name: '', email: '', phone: '', subject: '', username: '', password: '' });
  const [tEditingId, setTEditingId] = useState(null);
  const [tEditForm, setTEditForm] = useState({ name: '', email: '', phone: '', subject: '', username: '', password: '' });

  // Staff state
  const [sList, setSList] = useState([]);
  const [sLoading, setSLoading] = useState(false);
  const [sError, setSError] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [sForm, setSForm] = useState({ name: '', email: '', phone: '', role: '', username: '', password: '' });
  const [sEditingId, setSEditingId] = useState(null);
  const [sEditForm, setSEditForm] = useState({ name: '', email: '', phone: '', role: '', username: '', password: '' });

  // Inventory Managers state
  const [imList, setImList] = useState([]);
  const [imLoading, setImLoading] = useState(false);
  const [imError, setImError] = useState('');
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [imForm, setImForm] = useState({ name: '', email: '', phone: '', username: '', password: '' });
  const [imSubmitting, setImSubmitting] = useState(false);
  const [imEditingId, setImEditingId] = useState(null);
  const [imEditForm, setImEditForm] = useState({ name: '', email: '', phone: '', username: '', password: '' });

  // Input sanitizers: only letters/spaces for names, only digits for phones
  const onlyLetters = (val) => val.replace(/[^a-zA-Z\s]/g, '');
  const onlyDigits = (val) => val.replace(/\D/g, '');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('http://localhost:5000/admin/dashboard');
        setData(res.data?.data || null);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Fetch staff
  async function fetchStaff() {
    try {
      setSLoading(true);
      setSError('');
      const res = await axios.get('http://localhost:5000/admin/staff');
      setSList(res.data?.data || []);
    } catch (err) {
      setSError(err?.response?.data?.message || 'Failed to load staff');
    } finally {
      setSLoading(false);
    }
  }

  // Function to download Finance Managers as PDF
  const downloadFinanceManagersPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Header Section
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(3);
      doc.line(10, 10, pageWidth - 10, 10);
      
      // Add logo
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
      doc.text('FINANCE MANAGERS REPORT', pageWidth / 2, 70, { align: 'center' });
      
      // Report metadata
      doc.setFillColor(250, 252, 255);
      doc.rect(10, 85, pageWidth - 20, 18, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.setLineWidth(0.5);
      doc.rect(10, 85, pageWidth - 20, 18);
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const currentDate = new Date();
      doc.text(`Report Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, 92);
      doc.text(`Total Managers: ${fmList.length}`, 15, 97);
      
      // Prepare table data
      const tableData = fmList.map((manager) => [
        manager.name || 'N/A',
        manager.username || 'N/A',
        manager.email || 'N/A',
        manager.phone || '-'
      ]);
      
      // Add professional table
      autoTable(doc, {
        head: [['Name', 'Username', 'Email', 'Phone']],
        body: tableData,
        startY: 110,
        theme: 'grid',
        alternateRowStyles: {
          fillColor: [248, 251, 255]
        },
        headStyles: {
          fillColor: [30, 58, 138],
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
          0: { halign: 'left', fontStyle: 'bold' },
          1: { halign: 'left' },
          2: { halign: 'left' },
          3: { halign: 'left' }
        }
      });
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: 'right' }
        );
      }
      
      // Save the PDF
      doc.save(`Finance_Managers_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Fetch finance managers
  const fetchManagers = async () => {
    try {
      setFmLoading(true);
      setFmError('');
      const res = await axios.get('http://localhost:5000/admin/finance-managers');
      setFmList(res.data?.data || []);
    } catch (err) {
      setFmError(err?.response?.data?.message || 'Failed to load finance managers');
    } finally {
      setFmLoading(false);
    }
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setTLoading(true);
      setTError('');
      const res = await axios.get('http://localhost:5000/admin/teachers');
      setTList(res.data?.data || []);
    } catch (err) {
      setTError(err?.response?.data?.message || 'Failed to load teachers');
    } finally {
      setTLoading(false);
    }
  };

  // Fetch inventory managers
  const fetchInventoryManagers = async () => {
    try {
      setImLoading(true);
      setImError('');
      const res = await axios.get('http://localhost:5000/admin/inventory-managers');
      setImList(res.data?.data || []);
    } catch (err) {
      setImError(err?.response?.data?.message || 'Failed to load inventory managers');
    } finally {
      setImLoading(false);
    }
  };

  // Load managers when Finance tab becomes active
  useEffect(() => {
    if (activeTab === 'finance') {
      fetchManagers();
    }
    if (activeTab === 'teacher') {
      fetchTeachers();
    }
    if (activeTab === 'staff') {
      fetchStaff();
    }
    if (activeTab === 'inventory') {
      fetchInventoryManagers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const admin = JSON.parse(localStorage.getItem('admin') || 'null');

  // Generate Overview PDF (Finance Managers, Teachers, Staff, Inventory Managers)
  const downloadAdminPDF = async () => {
    try {
      // Fetch all lists to ensure freshest data
      const [fmRes, tRes, sRes, imRes] = await Promise.all([
        axios.get('http://localhost:5000/admin/finance-managers'),
        axios.get('http://localhost:5000/admin/teachers'),
        axios.get('http://localhost:5000/admin/staff'),
        axios.get('http://localhost:5000/admin/inventory-managers')
      ]);

      const fm = fmRes.data?.data || [];
      const teachers = tRes.data?.data || [];
      const staff = sRes.data?.data || [];
      const inventory = imRes.data?.data || [];

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Decorative top line
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(3);
      doc.line(10, 10, pageWidth - 10, 10);

      // Logo
      try {
        doc.addImage(logoImage.default || logoImage, 'JPEG', 15, 15, 30, 30);
      } catch (e) {
        doc.setFillColor(30, 58, 138);
        doc.rect(15, 15, 30, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('LITTLE', 30, 28, { align: 'center' });
        doc.text('NEST', 30, 35, { align: 'center' });
      }

      // Company name and subtitle
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

      // Report title block
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
      doc.text('ADMIN OVERVIEW REPORT', pageWidth / 2, 70, { align: 'center' });

      // Metadata
      const now = new Date();
      doc.setFillColor(250, 252, 255);
      doc.rect(10, 85, pageWidth - 20, 18, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.setLineWidth(0.5);
      doc.rect(10, 85, pageWidth - 20, 18);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Report Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 15, 92);
      doc.text(`Managers: ${fm.length}  |  Teachers: ${teachers.length}  |  Staff: ${staff.length}  |  Inventory Managers: ${inventory.length}`, 15, 97);

      let currentY = 110;
      const makeSection = (title, head, rows) => {
        // Section title
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text(title, 12, currentY - 4);

        autoTable(doc, {
          head: [head],
          body: rows,
          startY: currentY,
          theme: 'grid',
          alternateRowStyles: { fillColor: [248, 251, 255] },
          headStyles: {
            fillColor: [30, 58, 138],
            textColor: [255, 255, 255],
            fontSize: 11,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9,
            lineColor: [180, 200, 220],
            lineWidth: 0.3
          },
          styles: {
            lineColor: [70, 130, 180],
            lineWidth: 0.5,
            cellPadding: 4
          },
          didDrawPage: (data) => {},
        });
        currentY = doc.lastAutoTable.finalY + 12;
      };

      // Prepare data
      const fmRows = fm.map(m => [m.name || 'N/A', m.username || 'N/A', m.email || 'N/A', m.phone || '-']);
      const tRows = teachers.map(t => [t.name || 'N/A', t.username || 'N/A', t.email || 'N/A', t.phone || '-', t.subject || '-']);
      const sRows = staff.map(s => [s.name || 'N/A', s.username || 'N/A', s.email || 'N/A', s.phone || '-', s.role || '-']);
      const imRows = inventory.map(m => [m.name || 'N/A', m.username || 'N/A', m.email || 'N/A', m.phone || '-']);

      // Sections (split across pages automatically by autotable)
      makeSection('Finance Managers', ['Name', 'Username', 'Email', 'Phone'], fmRows);
      makeSection('Teachers', ['Name', 'Username', 'Email', 'Phone', 'Subject'], tRows);
      makeSection('Staff', ['Name', 'Username', 'Email', 'Phone', 'Role'], sRows);
      makeSection('Inventory Managers', ['Name', 'Username', 'Email', 'Phone'], imRows);

      // Footer
      const footerY = pageHeight - 20;
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(1);
      doc.line(10, footerY, pageWidth - 10, footerY);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Little Nest Daycare - Admin Overview', 15, footerY + 8);
      doc.text('Generated by: Daycare Management System', pageWidth - 15, footerY + 8, { align: 'right' });

      doc.save(`Admin-Overview-Report-${now.toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating admin PDF:', err);
      alert('Error generating PDF. Please try again.');
    }
  };

  const TabButton = ({ id, label }) => (
    <button
      className={`tab-btn ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Manage different areas using the tabs below</p>
        </div>
        {admin && (
          <div className="admin-profile">
            <span className="role">{admin.role}</span>
            <span className="username">{admin.username}</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tabs">
        <TabButton id="overview" label="Overview" />
        <TabButton id="finance" label="Finance Manager" />
        <TabButton id="teacher" label="Teacher" />
        <TabButton id="staff" label="Staff" />
        <TabButton id="inventory" label="Inventory Manager" />
      </div>

      {/* Tab Panels */}
      <div className="tab-panels">
        {activeTab === 'overview' && (
          <div className="panel">
            {loading && <div className="card">Loading...</div>}
            {error && <div className="card error">{error}</div>}
            {!loading && !error && (
              <>
                <div className="actions" style={{ marginBottom: 12 }}>
                  <button className="btn" type="button" onClick={downloadAdminPDF}>Download Overview PDF</button>
                </div>
                <div className="grid">
                  <div className="card stat">
                    <h3>Total Users</h3>
                    <p>{data?.totalUsers ?? '-'}</p>
                  </div>
                  <div className="card stat">
                    <h3>Total Transactions</h3>
                    <p>{data?.totalTransactions ?? '-'}</p>
                  </div>
                  <div className="card stat">
                    <h3>Total Revenue</h3>
                    <p>{data?.totalRevenue ?? '-'}</p>
                  </div>
                  <div className="card">
                    <h3>Recent Activities</h3>
                    {data?.recentActivities?.length ? (
                      <ul>
                        {data.recentActivities.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No recent activities</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="panel">
            {/* Create Finance Manager */}
            <div className="card">
              <h3>Add Finance Manager</h3>
              <form
                className="fm-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFmError('');
                  if (!fmForm.name.trim() || !fmForm.email.trim() || !fmForm.username.trim() || !fmForm.password) {
                    setFmError('Name, Email, Username and Password are required');
                    return;
                  }
                  setFmSubmitting(true);
                  try {
                    const res = await axios.post('http://localhost:5000/admin/finance-managers', {
                      name: fmForm.name.trim(),
                      email: fmForm.email.trim().toLowerCase(),
                      phone: fmForm.phone.trim(),
                      username: fmForm.username.trim(),
                      password: fmForm.password,
                    });
                    if (res.data?.success) {
                      setFmForm({ name: '', email: '', phone: '', username: '', password: '' });
                      // refresh list
                      await fetchManagers();
                      alert('Finance manager added');
                    } else {
                      setFmError(res.data?.message || 'Failed to create');
                    }
                  } catch (err) {
                    setFmError(err?.response?.data?.message || 'Failed to create');
                  } finally {
                    setFmSubmitting(false);
                  }
                }}
              >
                <div className="row">
                  <div className="col">
                    <label>Name</label>
                    <input
                      type="text"
                      value={fmForm.name}
                      onChange={(e) => setFmForm({ ...fmForm, name: onlyLetters(e.target.value) })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="col">
                    <label>Email</label>
                    <input
                      type="email"
                      value={fmForm.email}
                      onChange={(e) => setFmForm({ ...fmForm, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="col">
                    <label>Username</label>
                    <input
                      type="text"
                      value={fmForm.username}
                      onChange={(e) => setFmForm({ ...fmForm, username: e.target.value })}
                      placeholder="Unique username"
                    />
                  </div>
                  <div className="col">
                    <label>Password</label>
                    <input
                      type="password"
                      value={fmForm.password}
                      onChange={(e) => setFmForm({ ...fmForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="col">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={fmForm.phone}
                      onChange={(e) => setFmForm({ ...fmForm, phone: onlyDigits(e.target.value) })}
                      inputMode="numeric"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                {fmError && <div className="form-error">{fmError}</div>}
                <button className="btn" type="submit" disabled={fmSubmitting}>
                  {fmSubmitting ? 'Adding...' : 'Add Manager'}
                </button>
              </form>
            </div>

            {/* List Finance Managers */}
            <div className="card">
              <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Finance Managers</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search managers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      width: '250px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={downloadFinanceManagersPDF}
                    style={{
                      backgroundColor: '#1e3a8a',
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Download PDF Report"
                  >
                    <i className="fas fa-file-pdf"></i> PDF
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={async () => {
                      await fetchManagers();
                      setSearchTerm('');
                    }}
                  >
                    Refresh
                  </button>
                </div>
              </div>
              {fmLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(searchTerm
                        ? fmList.filter(m => 
                            (m.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (m.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (m.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (m.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                          )
                        : fmList
                      ).length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center' }}>
                            {searchTerm ? 'No matching managers found' : 'No finance managers yet'}
                          </td>
                        </tr>
                      ) : (
                        (searchTerm
                          ? fmList.filter(m => 
                              (m.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                              (m.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                              (m.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                              (m.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                            )
                          : fmList
                        ).map((m) => (
                          <tr key={m._id}>
                            {editingId === m._id ? (
                              <>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: onlyLetters(e.target.value) })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={editForm.phone || ''}
                                    onChange={(e) => setEditForm({ ...editForm, phone: onlyDigits(e.target.value) })}
                                    inputMode="numeric"
                                  />
                                </td>
                                <td className="actions-cell">
                                  <input
                                    className="table-input"
                                    type="password"
                                    placeholder="New password (optional)"
                                    value={editForm.password || ''}
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                  />
                                  <div className="row-actions">
                                    <button
                                      className="btn"
                                      type="button"
                                      onClick={async () => {
                                        // Basic validation
                                        if (!editForm.name.trim() || !editForm.email.trim() || !editForm.username.trim()) {
                                          alert('Name, Email, and Username are required');
                                          return;
                                        }
                                        try {
                                          await axios.put(`http://localhost:5000/admin/finance-managers/${m._id}`, {
                                            name: editForm.name.trim(),
                                            email: editForm.email.trim().toLowerCase(),
                                            phone: editForm.phone?.trim?.() || '',
                                            username: editForm.username.trim(),
                                            password: editForm.password || undefined,
                                          });
                                          setEditingId(null);
                                          setEditForm({ name: '', email: '', phone: '', username: '', password: '' });
                                          await fetchManagers();
                                        } catch (err) {
                                          alert(err?.response?.data?.message || 'Failed to update');
                                        }
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => {
                                        setEditingId(null);
                                        setEditForm({ name: '', email: '', phone: '', username: '', password: '' });
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{m.name}</td>
                                <td>{m.username}</td>
                                <td>{m.email}</td>
                                <td>{m.phone || '-'}</td>
                                <td className="actions-cell">
                                  <div className="row-actions">
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => {
                                        setEditingId(m._id);
                                        setEditForm({ name: m.name || '', email: m.email || '', phone: m.phone || '', username: m.username || '', password: '' });
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-danger"
                                      type="button"
                                      onClick={async () => {
                                        if (!window.confirm('Delete this manager?')) return;
                                        try {
                                          await axios.delete(`http://localhost:5000/admin/finance-managers/${m._id}`);
                                          await fetchManagers();
                                        } catch (err) {
                                          alert('Failed to delete');
                                        }
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="grid">
              <div className="card">
                <h3>Quick Links</h3>
                <p>Access financial features like transactions, salaries, and reports.</p>
                <div className="actions">
                  <Link className="btn" to="/mainfina">Open Finance</Link>
                  <Link className="btn" to="/SalaryDetails">Salaries</Link>
                  <Link className="btn" to="/BillDetails">Bills</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teacher' && (
          <div className="panel">
            {/* Add Teacher */}
            <div className="card">
              <h3>Add Teacher</h3>
              <form
                className="fm-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setTError('');
                  if (!tForm.name.trim() || !tForm.email.trim() || !tForm.username.trim() || !tForm.password) {
                    setTError('Name, Email, Username and Password are required');
                    return;
                  }
                  try {
                    const res = await axios.post('http://localhost:5000/admin/teachers', {
                      name: tForm.name.trim(),
                      email: tForm.email.trim().toLowerCase(),
                      phone: tForm.phone.trim(),
                      subject: tForm.subject.trim(),
                      username: tForm.username.trim(),
                      password: tForm.password,
                    });
                    if (res.data?.success) {
                      setTForm({ name: '', email: '', phone: '', subject: '', username: '', password: '' });
                      await fetchTeachers();
                    } else {
                      setTError(res.data?.message || 'Failed to create');
                    }
                  } catch (err) {
                    setTError(err?.response?.data?.message || 'Failed to create');
                  }
                }}
              >
                <div className="row">
                  <div className="col">
                    <label>Name</label>
                    <input
                      type="text"
                      value={tForm.name}
                      onChange={(e) => setTForm({ ...tForm, name: onlyLetters(e.target.value) })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="col">
                    <label>Email</label>
                    <input
                      type="email"
                      value={tForm.email}
                      onChange={(e) => setTForm({ ...tForm, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="col">
                    <label>Username</label>
                    <input
                      type="text"
                      value={tForm.username}
                      onChange={(e) => setTForm({ ...tForm, username: e.target.value })}
                      placeholder="Unique username"
                    />
                  </div>
                  <div className="col">
                    <label>Password</label>
                    <input
                      type="password"
                      value={tForm.password}
                      onChange={(e) => setTForm({ ...tForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="col">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={tForm.phone}
                      onChange={(e) => setTForm({ ...tForm, phone: onlyDigits(e.target.value) })}
                      inputMode="numeric"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="col">
                    <label>Subject</label>
                    <input
                      type="text"
                      value={tForm.subject}
                      onChange={(e) => setTForm({ ...tForm, subject: e.target.value })}
                      placeholder="e.g., Math, Science"
                    />
                  </div>
                </div>
                {tError && <div className="form-error">{tError}</div>}
                <button className="btn" type="submit">Add Teacher</button>
              </form>
            </div>

            {/* List Teachers */}
            <div className="card">
              <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Teachers</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search teachers..."
                    value={teacherSearchTerm}
                    onChange={(e) => setTeacherSearchTerm(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      width: '250px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={async () => {
                      await fetchTeachers();
                      setTeacherSearchTerm('');
                    }}
                  >
                    Refresh
                  </button>
                </div>
              </div>
              {tLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Subject</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(teacherSearchTerm
                        ? tList.filter(t => 
                            (t.name?.toLowerCase() || '').includes(teacherSearchTerm.toLowerCase()) ||
                            (t.username?.toLowerCase() || '').includes(teacherSearchTerm.toLowerCase()) ||
                            (t.email?.toLowerCase() || '').includes(teacherSearchTerm.toLowerCase()) ||
                            (t.phone?.toLowerCase() || '').includes(teacherSearchTerm.toLowerCase()) ||
                            (t.subject?.toLowerCase() || '').includes(teacherSearchTerm.toLowerCase())
                          )
                        : tList
                      ).length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center' }}>
                            {teacherSearchTerm ? 'No matching teachers found' : 'No teachers yet'}
                          </td>
                        </tr>
                      ) : (
                        (teacherSearchTerm
                          ? tList.filter(t => 
                              (t.name?.toLowerCase() || '').includes(teacherSearchTerm.toLowerCase()) ||
                              (t.username?.toLowerCase() || '').includes(teacherSearchTerm.toLowerCase()) ||
                              (t.email?.toLowerCase() || '').includes(teacherSearchTerm.toLowerCase()) ||
                              (t.phone?.toLowerCase() || '').includes(teacherSearchTerm.toLowerCase()) ||
                              (t.subject?.toLowerCase() || '').includes(teacherSearchTerm.toLowerCase())
                            )
                          : tList
                        ).map((t) => (
                          <tr key={t._id}>
                            {tEditingId === t._id ? (
                              <>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={tEditForm.name}
                                    onChange={(e) => setTEditForm({ ...tEditForm, name: onlyLetters(e.target.value) })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={tEditForm.username}
                                    onChange={(e) => setTEditForm({ ...tEditForm, username: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="email"
                                    value={tEditForm.email}
                                    onChange={(e) => setTEditForm({ ...tEditForm, email: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={tEditForm.phone || ''}
                                    onChange={(e) => setTEditForm({ ...tEditForm, phone: onlyDigits(e.target.value) })}
                                    inputMode="numeric"
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={tEditForm.subject || ''}
                                    onChange={(e) => setTEditForm({ ...tEditForm, subject: e.target.value })}
                                  />
                                </td>
                                <td className="actions-cell">
                                  <input
                                    className="table-input"
                                    type="password"
                                    placeholder="New password (optional)"
                                    value={tEditForm.password || ''}
                                    onChange={(e) => setTEditForm({ ...tEditForm, password: e.target.value })}
                                  />
                                  <div className="row-actions">
                                    <button
                                      className="btn"
                                      type="button"
                                      onClick={async () => {
                                        if (!tEditForm.name.trim() || !tEditForm.email.trim() || !tEditForm.username.trim()) {
                                          alert('Name, Email, and Username are required');
                                          return;
                                        }
                                        try {
                                          await axios.put(`http://localhost:5000/admin/teachers/${t._id}`, {
                                            name: tEditForm.name.trim(),
                                            email: tEditForm.email.trim().toLowerCase(),
                                            phone: tEditForm.phone?.trim?.() || '',
                                            subject: tEditForm.subject?.trim?.() || '',
                                            username: tEditForm.username.trim(),
                                            password: tEditForm.password || undefined,
                                          });
                                          setTEditingId(null);
                                          setTEditForm({ name: '', email: '', phone: '', subject: '', username: '', password: '' });
                                          await fetchTeachers();
                                        } catch (err) {
                                          alert(err?.response?.data?.message || 'Failed to update');
                                        }
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => {
                                        setTEditingId(null);
                                        setTEditForm({ name: '', email: '', phone: '', subject: '', username: '', password: '' });
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{t.name}</td>
                                <td>{t.username}</td>
                                <td>{t.email}</td>
                                <td>{t.phone || '-'}</td>
                                <td>{t.subject || '-'}</td>
                                <td className="actions-cell">
                                  <div className="row-actions">
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => {
                                        setTEditingId(t._id);
                                        setTEditForm({ name: t.name || '', email: t.email || '', phone: t.phone || '', subject: t.subject || '', username: t.username || '', password: '' });
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-danger"
                                      type="button"
                                      onClick={async () => {
                                        if (!window.confirm('Delete this teacher?')) return;
                                        try {
                                          await axios.delete(`http://localhost:5000/admin/teachers/${t._id}`);
                                          await fetchTeachers();
                                        } catch (err) {
                                          alert('Failed to delete');
                                        }
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="panel">
            {/* Add Staff */}
            <div className="card">
              <h3>Add Staff</h3>
              <form
                className="fm-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSError('');
                  if (!sForm.name.trim() || !sForm.email.trim() || !sForm.username.trim() || !sForm.password) {
                    setSError('Name, Email, Username and Password are required');
                    return;
                  }
                  try {
                    const res = await axios.post('http://localhost:5000/admin/staff', {
                      name: sForm.name.trim(),
                      email: sForm.email.trim().toLowerCase(),
                      phone: sForm.phone.trim(),
                      role: sForm.role.trim(),
                      username: sForm.username.trim(),
                      password: sForm.password,
                    });
                    if (res.data?.success) {
                      setSForm({ name: '', email: '', phone: '', role: '', username: '', password: '' });
                      await fetchStaff();
                    } else {
                      setSError(res.data?.message || 'Failed to create');
                    }
                  } catch (err) {
                    setSError(err?.response?.data?.message || 'Failed to create');
                  }
                }}
              >
                <div className="row">
                  <div className="col">
                    <label>Name</label>
                    <input
                      type="text"
                      value={sForm.name}
                      onChange={(e) => setSForm({ ...sForm, name: onlyLetters(e.target.value) })}
                      placeholder="Full name"
                    />

                  </div>
                  <div className="col">
                    <label>Email</label>
                    <input
                      type="email"
                      value={sForm.email}
                      onChange={(e) => setSForm({ ...sForm, email: e.target.value })}
                      placeholder="email@example.com"
                    />

                  </div>
                  <div className="col">
                    <label>Username</label>
                    <input
                      type="text"
                      value={sForm.username}
                      onChange={(e) => setSForm({ ...sForm, username: e.target.value })}
                      placeholder="Unique username"
                    />

                  </div>
                  <div className="col">
                    <label>Password</label>
                    <input
                      type="password"
                      value={sForm.password}
                      onChange={(e) => setSForm({ ...sForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                    />

                  </div>
                  <div className="col">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={sForm.phone}
                      onChange={(e) => setSForm({ ...sForm, phone: onlyDigits(e.target.value) })}
                      inputMode="numeric"
                      placeholder="Optional"
                    />

                  </div>
                  <div className="col">
                    <label>Role</label>
                    <input
                      type="text"
                      value={sForm.role}
                      onChange={(e) => setSForm({ ...sForm, role: e.target.value })}
                      placeholder="e.g., Assistant, Cleaner"
                    />

                  </div>
                </div>
                {sError && <div className="form-error">{sError}</div>}
                <button className="btn" type="submit">Add Staff</button>
              </form>
            </div>

            {/* List Staff */}
            <div className="card">
              <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Staff</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={staffSearchTerm}
                    onChange={(e) => setStaffSearchTerm(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      width: '250px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={async () => {
                      await fetchStaff();
                      setStaffSearchTerm('');
                    }}
                  >
                    Refresh
                  </button>
                </div>
              </div>
              {sLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(staffSearchTerm
                        ? sList.filter(s => 
                            (s.name?.toLowerCase() || '').includes(staffSearchTerm.toLowerCase()) ||
                            (s.username?.toLowerCase() || '').includes(staffSearchTerm.toLowerCase()) ||
                            (s.email?.toLowerCase() || '').includes(staffSearchTerm.toLowerCase()) ||
                            (s.phone?.toLowerCase() || '').includes(staffSearchTerm.toLowerCase()) ||
                            (s.role?.toLowerCase() || '').includes(staffSearchTerm.toLowerCase())
                          )
                        : sList
                      ).length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center' }}>
                            {staffSearchTerm ? 'No matching staff found' : 'No staff yet'}
                          </td>
                        </tr>
                      ) : (
                        (staffSearchTerm
                          ? sList.filter(s => 
                              (s.name?.toLowerCase() || '').includes(staffSearchTerm.toLowerCase()) ||
                              (s.username?.toLowerCase() || '').includes(staffSearchTerm.toLowerCase()) ||
                              (s.email?.toLowerCase() || '').includes(staffSearchTerm.toLowerCase()) ||
                              (s.phone?.toLowerCase() || '').includes(staffSearchTerm.toLowerCase()) ||
                              (s.role?.toLowerCase() || '').includes(staffSearchTerm.toLowerCase())
                            )
                          : sList
                        ).map((s) => (
                          <tr key={s._id}>
                            {sEditingId === s._id ? (
                              <>
                                <td>
                                  <input className="table-input" type="text" value={sEditForm.name} onChange={(e) => setSEditForm({ ...sEditForm, name: onlyLetters(e.target.value) })} />
                                </td>
                                <td>
                                  <input className="table-input" type="text" value={sEditForm.username} onChange={(e) => setSEditForm({ ...sEditForm, username: e.target.value })} />
                                </td>
                                <td>
                                  <input className="table-input" type="email" value={sEditForm.email} onChange={(e) => setSEditForm({ ...sEditForm, email: e.target.value })} />
                                </td>
                                <td>
                                  <input className="table-input" type="text" value={sEditForm.phone || ''} onChange={(e) => setSEditForm({ ...sEditForm, phone: onlyDigits(e.target.value) })} inputMode="numeric" />
                                </td>
                                <td>
                                  <input className="table-input" type="text" value={sEditForm.role || ''} onChange={(e) => setSEditForm({ ...sEditForm, role: e.target.value })} />
                                </td>
                                <td className="actions-cell">
                                  <input className="table-input" type="password" placeholder="New password (optional)" value={sEditForm.password || ''} onChange={(e) => setSEditForm({ ...sEditForm, password: e.target.value })} />
                                  <div className="row-actions">
                                    <button className="btn" type="button" onClick={async () => {
                                      if (!sEditForm.name.trim() || !sEditForm.email.trim() || !sEditForm.username.trim()) { alert('Name, Email, and Username are required'); return; }
                                      try {
                                        await axios.put(`http://localhost:5000/admin/staff/${s._id}`, {
                                          name: sEditForm.name.trim(),
                                          email: sEditForm.email.trim().toLowerCase(),
                                          phone: sEditForm.phone?.trim?.() || '',
                                          role: sEditForm.role?.trim?.() || '',
                                          username: sEditForm.username.trim(),
                                          password: sEditForm.password || undefined,
                                        });
                                        setSEditingId(null);
                                        setSEditForm({ name: '', email: '', phone: '', role: '', username: '', password: '' });
                                        await fetchStaff();
                                      } catch (err) {
                                        alert(err?.response?.data?.message || 'Failed to update');
                                      }
                                    }}>Save</button>
                                    <button className="btn btn-secondary" type="button" onClick={() => { setSEditingId(null); setSEditForm({ name: '', email: '', phone: '', role: '', username: '', password: '' }); }}>Cancel</button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{s.name}</td>
                                <td>{s.username}</td>
                                <td>{s.email}</td>
                                <td>{s.phone || '-'}</td>
                                <td>{s.role || '-'}</td>
                                <td className="actions-cell">
                                  <div className="row-actions">
                                    <button className="btn btn-secondary" type="button" onClick={() => { setSEditingId(s._id); setSEditForm({ name: s.name || '', email: s.email || '', phone: s.phone || '', role: s.role || '', username: s.username || '', password: '' }); }}>Edit</button>
                                    <button className="btn btn-danger" type="button" onClick={async () => {
                                      if (!window.confirm('Delete this staff member?')) return;
                                      try {
                                        await axios.delete(`http://localhost:5000/admin/staff/${s._id}`);
                                        await fetchStaff();
                                      } catch (err) {
                                        alert('Failed to delete');
                                      }
                                    }}>Delete</button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="panel">
            {/* Add Inventory Manager */}
            <div className="card">
              <h3>Add Inventory Manager</h3>
              <form
                className="fm-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setImError('');
                  if (!imForm.name.trim() || !imForm.email.trim() || !imForm.username.trim() || !imForm.password) {
                    setImError('Name, Email, Username and Password are required');
                    return;
                  }
                  setImSubmitting(true);
                  try {
                    const res = await axios.post('http://localhost:5000/admin/inventory-managers', {
                      name: imForm.name.trim(),
                      email: imForm.email.trim().toLowerCase(),
                      phone: imForm.phone.trim(),
                      username: imForm.username.trim(),
                      password: imForm.password,
                    });
                    if (res.data?.success) {
                      setImForm({ name: '', email: '', phone: '', username: '', password: '' });
                      await fetchInventoryManagers();
                      alert('Inventory manager added');
                    } else {
                      setImError(res.data?.message || 'Failed to create');
                    }
                  } catch (err) {
                    setImError(err?.response?.data?.message || 'Failed to create');
                  } finally {
                    setImSubmitting(false);
                  }
                }}
              >
                <div className="row">
                  <div className="col">
                    <label>Name</label>
                    <input
                      type="text"
                      value={imForm.name}
                      onChange={(e) => setImForm({ ...imForm, name: onlyLetters(e.target.value) })}
                      placeholder="Full name"
                    />

                  </div>
                  <div className="col">
                    <label>Email</label>
                    <input
                      type="email"
                      value={imForm.email}
                      onChange={(e) => setImForm({ ...imForm, email: e.target.value })}
                      placeholder="email@example.com"
                    />

                  </div>
                  <div className="col">
                    <label>Username</label>
                    <input
                      type="text"
                      value={imForm.username}
                      onChange={(e) => setImForm({ ...imForm, username: e.target.value })}
                      placeholder="Unique username"
                    />

                  </div>
                  <div className="col">
                    <label>Password</label>
                    <input
                      type="password"
                      value={imForm.password}
                      onChange={(e) => setImForm({ ...imForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                    />

                  </div>
                  <div className="col">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={imForm.phone}
                      onChange={(e) => setImForm({ ...imForm, phone: onlyDigits(e.target.value) })}
                      inputMode="numeric"
                      placeholder="Optional"
                    />

                  </div>
                </div>
                {imError && <div className="form-error">{imError}</div>}
                <button className="btn" type="submit" disabled={imSubmitting}>
                  {imSubmitting ? 'Adding...' : 'Add Manager'}
                </button>
              </form>
            </div>

            {/* List Inventory Managers */}
            <div className="card">
              <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Inventory Managers</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search inventory managers..."
                    value={inventorySearchTerm}
                    onChange={(e) => setInventorySearchTerm(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      width: '250px',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={async () => {
                      await fetchInventoryManagers();
                      setInventorySearchTerm('');
                    }}
                  >
                    Refresh
                  </button>
                </div>
              </div>
              {imLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(inventorySearchTerm
                        ? imList.filter(im => 
                            (im.name?.toLowerCase() || '').includes(inventorySearchTerm.toLowerCase()) ||
                            (im.username?.toLowerCase() || '').includes(inventorySearchTerm.toLowerCase()) ||
                            (im.email?.toLowerCase() || '').includes(inventorySearchTerm.toLowerCase()) ||
                            (im.phone?.toLowerCase() || '').includes(inventorySearchTerm.toLowerCase())
                          )
                        : imList
                      ).length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center' }}>
                            {inventorySearchTerm ? 'No matching inventory managers found' : 'No inventory managers yet'}
                          </td>
                        </tr>
                      ) : (
                        (inventorySearchTerm
                          ? imList.filter(im => 
                              (im.name?.toLowerCase() || '').includes(inventorySearchTerm.toLowerCase()) ||
                              (im.username?.toLowerCase() || '').includes(inventorySearchTerm.toLowerCase()) ||
                              (im.email?.toLowerCase() || '').includes(inventorySearchTerm.toLowerCase()) ||
                              (im.phone?.toLowerCase() || '').includes(inventorySearchTerm.toLowerCase())
                            )
                          : imList
                        ).map((m) => (
                          <tr key={m._id}>
                            {imEditingId === m._id ? (
                              <>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={imEditForm.name}
                                    onChange={(e) => setImEditForm({ ...imEditForm, name: onlyLetters(e.target.value) })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={imEditForm.username}
                                    onChange={(e) => setImEditForm({ ...imEditForm, username: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="email"
                                    value={imEditForm.email}
                                    onChange={(e) => setImEditForm({ ...imEditForm, email: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="table-input"
                                    type="text"
                                    value={imEditForm.phone || ''}
                                    onChange={(e) => setImEditForm({ ...imEditForm, phone: onlyDigits(e.target.value) })}
                                    inputMode="numeric"
                                  />
                                </td>
                                <td className="actions-cell">
                                  <input
                                    className="table-input"
                                    type="password"
                                    placeholder="New password (optional)"
                                    value={imEditForm.password || ''}
                                    onChange={(e) => setImEditForm({ ...imEditForm, password: e.target.value })}
                                  />
                                  <div className="row-actions">
                                    <button
                                      className="btn"
                                      type="button"
                                      onClick={async () => {
                                        // Basic validation
                                        if (!imEditForm.name.trim() || !imEditForm.email.trim() || !imEditForm.username.trim()) {
                                          alert('Name, Email, and Username are required');
                                          return;
                                        }
                                        try {
                                          await axios.put(`http://localhost:5000/admin/inventory-managers/${m._id}`, {
                                            name: imEditForm.name.trim(),
                                            email: imEditForm.email.trim().toLowerCase(),
                                            phone: imEditForm.phone?.trim?.() || '',
                                            username: imEditForm.username.trim(),
                                            password: imEditForm.password || undefined,
                                          });
                                          setImEditingId(null);
                                          setImEditForm({ name: '', email: '', phone: '', username: '', password: '' });
                                          await fetchInventoryManagers();
                                        } catch (err) {
                                          alert(err?.response?.data?.message || 'Failed to update');
                                        }
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => {
                                        setImEditingId(null);
                                        setImEditForm({ name: '', email: '', phone: '', username: '', password: '' });
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{m.name}</td>
                                <td>{m.username}</td>
                                <td>{m.email}</td>
                                <td>{m.phone || '-'}</td>
                                <td className="actions-cell">
                                  <div className="row-actions">
                                    <button
                                      className="btn btn-secondary"
                                      type="button"
                                      onClick={() => {
                                        setImEditingId(m._id);
                                        setImEditForm({ name: m.name || '', email: m.email || '', phone: m.phone || '', username: m.username || '', password: '' });
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-danger"
                                      type="button"
                                      onClick={async () => {
                                        if (!window.confirm('Delete this inventory manager?')) return;
                                        try {
                                          await axios.delete(`http://localhost:5000/admin/inventory-managers/${m._id}`);
                                          await fetchInventoryManagers();
                                        } catch (err) {
                                          alert('Failed to delete');
                                        }
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
