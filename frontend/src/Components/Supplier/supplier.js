import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
// Import logo - using require to handle special characters in filename
const logoImage = require('../../assets/WhatsApp Image 2025-08-05 at 19.02.34_b673857a - Copy.jpg');

function SupplierModal({ open, onClose }) {
  const [suppliers, setSuppliers] = useState([]);
  const [supplierForm, setSupplierForm] = useState({ name: '', address: '', contact: '', email: '', company: '' });
  const [supplierError, setSupplierError] = useState('');
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [supplierSuccess, setSupplierSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Fetch suppliers from backend using axios
  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    setSupplierError('');
    try {
      const res = await axios.get('http://localhost:5000/admin/suppliers');
      // Ensure always array
      let data = res.data;
      if (!Array.isArray(data)) {
        if (data && Array.isArray(data.data)) {
          data = data.data;
        } else {
          data = [];
        }
      }
      setSuppliers(data);
    } catch (err) {
      setSupplierError('Error fetching suppliers');
      setSuppliers([]);
    }
    setLoadingSuppliers(false);
  };

  useEffect(() => {
    if (open) fetchSuppliers();
    // eslint-disable-next-line
  }, [open]);

  // Add supplier to backend using axios
  const handleAddSupplier = async (e) => {
    e.preventDefault();
    setSupplierError('');
    setSupplierSuccess('');
    const contact = supplierForm.contact.trim();
    const email = supplierForm.email.trim();
    if (!/^07\d{8}$/.test(contact)) {
      setSupplierError('Contact number must be a valid Sri Lankan mobile (e.g. 07XXXXXXXX)');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setSupplierError('Please enter a valid email address');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/admin/suppliers', supplierForm);
      // Accept either the new supplier object or a success flag
      const data = res.data;
      if ((data && data._id) || (data && data.success)) {
        setSupplierForm({ name: '', address: '', contact: '', email: '', company: '' });
        setSupplierSuccess('Supplier added successfully');
        // Optimistically add to table if backend returns the new supplier
        if (data && data._id) {
          setSuppliers(prev => [data, ...prev]);
        } else {
          fetchSuppliers();
        }
      } else {
        setSupplierError(data?.message || 'Failed to add supplier');
      }
    } catch (err) {
      setSupplierError('Failed to add supplier');
    }
  };

  // Delete supplier from backend using axios
  const handleDeleteSupplier = async (id) => {
    setSupplierError('');
    setSupplierSuccess('');
    try {
      const supplier = suppliers[id];
      const res = await axios.delete(`http://localhost:5000/admin/suppliers/${supplier._id}`);
      if (res.data && (res.data.success || res.status === 200)) {
        setSupplierSuccess('Supplier deleted');
        fetchSuppliers();
      } else {
        setSupplierError(res.data?.message || 'Failed to delete supplier');
      }
    } catch (err) {
      setSupplierError('Failed to delete supplier');
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
    supplier.address.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
    supplier.contact.startsWith(searchTerm) ||
    supplier.email.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
    supplier.company.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/admin/suppliers/search?name=${value}`);
      const data = res.data;

      if (Array.isArray(data)) {
        setSuggestions(data.map(supplier => supplier.name).slice(0, 5)); // Extract names and limit to top 5 suggestions
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching search suggestions:', err);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setSuggestions([]); // Clear suggestions after selection
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 1000, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: 24 }}>Suppliers</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search suppliers by name..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ flex: 1, padding: 8, marginRight: 16, border: '1px solid #ccc', borderRadius: 4 }}
            />
            {suggestions.length > 0 && (
              <ul style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: 4,
                listStyle: 'none',
                margin: 0,
                padding: 0,
                zIndex: 1000
              }}>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      color: '#000', // Changed text color to black
                      borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f0f0f0';
                      e.target.style.color = '#000'; // Ensure text color remains black on hover
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#fff';
                      e.target.style.color = '#000'; // Ensure text color remains black on leave
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            style={{ background: '#19d219', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 16, cursor: 'pointer' }}
            onClick={() => {
              try {
                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;

                // Header decorative line
                doc.setDrawColor(30, 58, 138);
                doc.setLineWidth(3);
                doc.line(10, 10, pageWidth - 10, 10);

                // Company logo
                try {
                  doc.addImage(logoImage.default || logoImage, 'JPEG', 15, 15, 30, 30);
                } catch (logoError) {
                  console.error('Error loading logo:', logoError);
                  // Fallback stylized box
                  doc.setFillColor(30, 58, 138);
                  doc.rect(15, 15, 30, 30, 'F');
                  doc.setTextColor(255, 255, 255);
                  doc.setFontSize(14);
                  doc.text('LITTLE', 30, 28, { align: 'center' });
                  doc.text('NEST', 30, 35, { align: 'center' });
                }

                // Company name and tagline
                doc.setFontSize(24);
                doc.setTextColor(30, 58, 138);
                doc.text('LITTLE NEST DAYCARE', 55, 28);

                doc.setFontSize(12);
                doc.setTextColor(70, 130, 180);
                doc.text('Quality Childcare & Early Learning Center', 55, 36);

                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(' 123 Childcare Lane, City, State 12345 |  (555) 123-4567', 55, 42);
                doc.text(' info@littlenest.com |  www.littlenest.com', 55, 46);

                // Report title box
                doc.setFillColor(245, 250, 255);
                doc.rect(10, 55, pageWidth - 20, 25, 'F');
                doc.setDrawColor(30, 58, 138);
                doc.setLineWidth(2);
                doc.rect(10, 55, pageWidth - 20, 25);

                // Inner border
                doc.setDrawColor(70, 130, 180);
                doc.setLineWidth(0.5);
                doc.rect(12, 57, pageWidth - 24, 21);

                doc.setFontSize(20);
                doc.setTextColor(30, 58, 138);
                doc.text('SUPPLIER DETAILS REPORT', pageWidth / 2, 70, { align: 'center' });

                // Report metadata
                doc.setFillColor(250, 252, 255);
                doc.rect(10, 85, pageWidth - 20, 18, 'F');
                doc.setDrawColor(200, 220, 240);
                doc.setLineWidth(0.5);
                doc.rect(10, 85, pageWidth - 20, 18);

                const currentDate = new Date();
                doc.setFontSize(10);
                doc.setTextColor(60, 60, 60);
                doc.text(`Report Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, 92);
                doc.text(`Total Records: ${(suppliers || []).length}`, 15, 97);
                doc.text(`Report Type: All Suppliers`, pageWidth / 2 + 10, 92);
                doc.text(`Status: ${(suppliers || []).length > 0 ? 'Complete' : 'No Data Available'}`, pageWidth / 2 + 10, 97);

                // Table data
                const tableData = (suppliers || []).map(s => [
                  s.name || 'N/A',
                  s.address || 'N/A',
                  s.contact || 'N/A',
                  s.email || 'N/A',
                  s.company || 'N/A'
                ]);

                autoTable(doc, {
                  head: [['Name', 'Address', 'Contact Number', 'Email Address', 'Company Name']],
                  body: tableData,
                  startY: 110,
                  theme: 'grid',
                  alternateRowStyles: { fillColor: [248, 251, 255] },
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
                    0: { halign: 'left' },
                    1: { halign: 'left' },
                    2: { halign: 'center' },
                    3: { halign: 'left' },
                    4: { halign: 'left' }
                  }
                });

                // Summary section
                const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 125;
                doc.setFillColor(245, 250, 255);
                doc.rect(10, finalY, pageWidth - 20, 20, 'F');
                doc.setDrawColor(70, 130, 180);
                doc.setLineWidth(1);
                doc.rect(10, finalY, pageWidth - 20, 20);

                doc.setFontSize(12);
                doc.setTextColor(30, 58, 138);
                doc.text('SUPPLIER SUMMARY', 15, finalY + 10);

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`Total Suppliers: ${(suppliers || []).length}`, 15, finalY + 16);

                // Footer
                const footerY = pageHeight - 25;
                doc.setDrawColor(30, 58, 138);
                doc.setLineWidth(1);
                doc.line(10, footerY, pageWidth - 10, footerY);

                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text('Little Nest Daycare - Confidential Supplier Document', 15, footerY + 8);
                doc.text(`Page 1 of 1`, pageWidth - 15, footerY + 8, { align: 'right' });
                doc.text('This document may contain sensitive supplier information. Handle with care.', 15, footerY + 12);
                doc.text(`Generated by: Daycare Management System v1.0`, pageWidth - 15, footerY + 12, { align: 'right' });

                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.text('© 2024 Little Nest Daycare. All rights reserved. Unauthorized distribution prohibited.', pageWidth / 2, footerY + 18, { align: 'center' });

                doc.save(`Little-Nest-Suppliers-Report-${new Date().toISOString().split('T')[0]}.pdf`);
              } catch (e) {
                console.error('Error generating Supplier PDF:', e);
                alert('Error generating PDF. Please try again.');
              }
            }}
          >
            Download PDF
          </button>
        </div>
        {loadingSuppliers && <div style={{ color: '#888', marginBottom: 8 }}>Loading suppliers...</div>}
        {supplierError && <div style={{ color: 'red', marginBottom: 8 }}>{supplierError}</div>}
        {supplierSuccess && <div style={{ color: 'green', marginBottom: 8 }}>{supplierSuccess}</div>}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, color: '#000' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', color: '#000' }}>
              <th style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>Name</th>
              <th style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>Address</th>
              <th style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>Contact Number</th>
              <th style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>Email Address</th>
              <th style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>Company Name</th>
              <th style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 16, color: '#888' }}>No suppliers</td>
              </tr>
            ) : (
              filteredSuppliers.map((s, idx) => (
                <tr key={s._id || idx}>
                  <td style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>{s.name}</td>
                  <td style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>{s.address}</td>
                  <td style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>{s.contact}</td>
                  <td style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>{s.email}</td>
                  <td style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>{s.company}</td>
                  <td style={{ padding: 8, border: '1px solid #ddd', color: '#000' }}>
                    <button
                      style={{ background: '#ff7f7f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}
                      onClick={() => handleDeleteSupplier(idx)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <form onSubmit={handleAddSupplier} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <input
              name="name"
              placeholder="Name"
              value={supplierForm.name}
              onChange={e => {
                // Only allow letters and spaces
                const lettersOnly = e.target.value.replace(/[^A-Za-z ]/g, '');
                setSupplierForm({ ...supplierForm, name: lettersOnly });
              }}
              required
              style={{ flex: 1, padding: 8 }}
              pattern="[A-Za-z ]+"
              title="Only letters allowed"
            />
            <input
              name="address"
              placeholder="Address"
              value={supplierForm.address}
              onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })}
              required
              style={{ flex: 1, padding: 8 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <input
              name="contact"
              placeholder="Contact Number"
              value={supplierForm.contact}
              onChange={e => {
                // Only allow digits
                const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                setSupplierForm({ ...supplierForm, contact: digitsOnly });
                if (digitsOnly && !/^07\d{0,8}$/.test(digitsOnly)) {
                  setSupplierError('Contact number must start with 07 and be up to 10 digits');
                } else {
                  setSupplierError('');
                }
              }}
              required
              style={{ flex: 1, padding: 8 }}
              maxLength={10}
              pattern="[0-9]+"
              title="Only digits allowed"
            />
            <input
              name="email"
              placeholder="Email Address"
              value={supplierForm.email}
              onChange={e => {
                setSupplierForm({ ...supplierForm, email: e.target.value });
                if (e.target.value && !/^\S+@\S+\.\S+$/.test(e.target.value)) {
                  setSupplierError('Please enter a valid email address');
                } else {
                  setSupplierError('');
                }
              }}
              required
              style={{ flex: 1, padding: 8 }}
              type="email"
            />
            <input
              name="company"
              placeholder="Company Name"
              value={supplierForm.company}
              onChange={e => {
                // Only allow letters and spaces
                const lettersOnly = e.target.value.replace(/[^A-Za-z ]/g, '');
                setSupplierForm({ ...supplierForm, company: lettersOnly });
              }}
              required
              style={{ flex: 1, padding: 8 }}
              pattern="[A-Za-z ]+"
              title="Only letters allowed"
            />
          </div>
          <button
            type="submit"
            style={{ background: '#19d219', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '10px 32px', fontSize: 16, cursor: 'pointer', marginTop: 8 }}
            disabled={!!supplierError}
          >
            Add Supplier
          </button>
        </form>
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{ background: '#7f7fff', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '10px 32px', fontSize: 16, cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SupplierModal;
