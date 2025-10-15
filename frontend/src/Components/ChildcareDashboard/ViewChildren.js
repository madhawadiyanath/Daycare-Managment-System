import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./CreateChild.css";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Use the same logo as expense report for consistent branding
// eslint-disable-next-line @typescript-eslint/no-var-requires
const logoImage = require('../../assets/WhatsApp Image 2025-08-05 at 19.02.34_b673857a - Copy.jpg');

export default function ViewChildren() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Details view state
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [selectedChild, setSelectedChild] = useState(null);
  // UI state
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name"); // name | age | created
  const detailsRef = useRef(null);

  const handleDownloadPdf = async () => {
    try {
      if (!selectedChild) return;

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Top decorative border
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(3);
      doc.line(10, 10, pageWidth - 10, 10);

      // Logo (same asset as expense report)
      try {
        doc.addImage(logoImage.default || logoImage, 'JPEG', 15, 15, 30, 30);
      } catch (logoError) {
        // Fallback painted box if logo missing
        doc.setFillColor(30, 58, 138);
        doc.rect(15, 15, 30, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('LITTLE', 30, 28, { align: 'center' });
        doc.text('NEST', 30, 35, { align: 'center' });
      }

      // Company name + tagline
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

      // Title panel
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
      doc.text('CHILD DETAILS REPORT', pageWidth / 2, 70, { align: 'center' });

      // Metadata box
      doc.setFillColor(250, 252, 255);
      doc.rect(10, 85, pageWidth - 20, 18, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.setLineWidth(0.5);
      doc.rect(10, 85, pageWidth - 20, 18);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const currentDate = new Date();
      const fullName = `${selectedChild?.name || ''}`;
      doc.text(`Report Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, 92);
      doc.text(`Child: ${fullName || 'N/A'}`, 15, 97);
      doc.text(`Child ID: ${selectedChild?.childId || 'N/A'}`, pageWidth / 2 + 10, 92);
      doc.text(`Parent: ${selectedChild?.parent || 'N/A'}`, pageWidth / 2 + 10, 97);

      // Details table
      const tableBody = [
        ['Child ID', selectedChild.childId || 'N/A'],
        ['Name', selectedChild.name || 'N/A'],
        ['Age', selectedChild.age != null ? String(selectedChild.age) : 'N/A'],
        ['Gender', selectedChild.gender || 'N/A'],
        ['Parent', selectedChild.parent || 'N/A'],
        ['Health Notes', selectedChild.healthNotes || 'N/A'],
        ['Check-in Time', selectedChild.checkInTime || 'N/A'],
        ['Check-out Time', selectedChild.checkOutTime || 'N/A'],
        ['Meal Updates', selectedChild.meals || 'N/A'],
        ['Nap Times', selectedChild.napTimes || 'N/A'],
        ['Health Status', selectedChild.healthStatus || 'N/A'],
        ['Accident/Incident Reports', selectedChild.incidents || 'N/A'],
        ['Medication Updates', selectedChild.medication || 'N/A'],
        ['Mood & Behavior', selectedChild.moodBehavior || 'N/A'],
        ['Interaction with Other Kids', selectedChild.interactions || 'N/A'],
        ['Approved By', selectedChild.approvedBy ? (selectedChild.approvedBy.name || selectedChild.approvedBy.username || selectedChild.approvedBy._id) : 'N/A'],
        ['Created', selectedChild.createdAt ? new Date(selectedChild.createdAt).toLocaleString() : 'N/A']
      ];

      const startY = 110;
      autoTable(doc, {
        head: [['Field', 'Value']],
        body: tableBody,
        startY,
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
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: pageWidth - 20 - 60 }
        }
      });

      // Footer
      const footerY = pageHeight - 25;
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(1);
      doc.line(10, footerY, pageWidth - 10, footerY);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Little Nest Daycare - Confidential Child Document', 15, footerY + 8);
      doc.text('This document may contain sensitive personal information. Handle with care.', 15, footerY + 12);
      doc.text('Generated by: Daycare Management System v1.0', pageWidth - 15, footerY + 8, { align: 'right' });

      const fileNameParts = [];
      if (selectedChild?.childId) fileNameParts.push(selectedChild.childId);
      if (selectedChild?.name) fileNameParts.push(selectedChild.name.replace(/\s+/g, '_'));
      const fileName = `${fileNameParts.join('_') || 'child'}_details_report.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF');
    }
  };

  const handleDownloadAllPdf = async () => {
    try {
      if (!children || children.length === 0) return;
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Decorative top line
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(3);
      doc.line(10, 10, pageWidth - 10, 10);

      // Logo (match finance expenses style)
      try {
        doc.addImage(logoImage.default || logoImage, 'JPEG', 15, 15, 30, 30);
      } catch (logoError) {
        doc.setFillColor(30, 58, 138);
        doc.rect(15, 15, 30, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('LITTLE', 30, 28, { align: 'center' });
        doc.text('NEST', 30, 35, { align: 'center' });
      }

      // Company info
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

      // Title panel
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
      doc.text('CHILDREN FULL DETAILS REPORT', pageWidth / 2, 70, { align: 'center' });

      // Metadata box
      doc.setFillColor(250, 252, 255);
      doc.rect(10, 85, pageWidth - 20, 18, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.setLineWidth(0.5);
      doc.rect(10, 85, pageWidth - 20, 18);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const genDate = new Date();
      doc.text(`Report Generated: ${genDate.toLocaleDateString()} at ${genDate.toLocaleTimeString()}`, 15, 92);
      doc.text(`Total Records: ${children.length}`, 15, 97);
      doc.text('Report Scope: All Available Children Records', pageWidth / 2 + 10, 92);
      doc.text('Status: Complete', pageWidth / 2 + 10, 97);

      // One big table: core fields + compact multi-line details column
      const head = [[
        'Child ID', 'Name', 'Age', 'Gender', 'Parent', 'Check-in', 'Check-out', 'Created', 'Details'
      ]];

      const rows = children.map((c) => {
        const approvedBy = c.approvedBy ? (c.approvedBy.name || c.approvedBy.username || c.approvedBy._id) : '-';
        const details = [
          `Health Notes: ${c.healthNotes || '-'}`,
          `Meals: ${c.meals || '-'}`,
          `Nap Times: ${c.napTimes || '-'}`,
          `Health Status: ${c.healthStatus || '-'}`,
          `Incidents: ${c.incidents || '-'}`,
          `Medication: ${c.medication || '-'}`,
          `Mood & Behavior: ${c.moodBehavior || '-'}`,
          `Interactions: ${c.interactions || '-'}`,
          `Approved By: ${approvedBy}`
        ].join('\n');
        return [
          c.childId || '-',
          c.name || '-',
          c.age != null ? String(c.age) : '-',
          c.gender || '-',
          c.parent || '-',
          c.checkInTime || '-',
          c.checkOutTime || '-',
          c.createdAt ? new Date(c.createdAt).toLocaleString() : '-',
          details
        ];
      });

      autoTable(doc, {
        head,
        body: rows,
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
          fontSize: 8,
          cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
          lineColor: [180, 200, 220],
          lineWidth: 0.3
        },
        styles: { lineColor: [70, 130, 180], lineWidth: 0.5 },
        columnStyles: {
          0: { cellWidth: 22 },   // Child ID
          1: { cellWidth: 30 },   // Name
          2: { cellWidth: 12 },   // Age
          3: { cellWidth: 16 },   // Gender
          4: { cellWidth: 28 },   // Parent
          5: { cellWidth: 20 },   // Check-in
          6: { cellWidth: 20 },   // Check-out
          7: { cellWidth: 32 },   // Created
          8: { cellWidth: 90 },   // Details (wraps)
        }
      });

      // Footer line and text
      const footerY = pageHeight - 10;
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(1);
      doc.line(10, footerY, pageWidth - 10, footerY);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Little Nest Daycare - Confidential Child Document', 15, footerY + 6);
      doc.text('Generated by: Daycare Management System v1.0', pageWidth - 15, footerY + 6, { align: 'right' });

      doc.save('Little-Nest-Children-Full-Details.pdf');
    } catch (e) {
      console.error(e);
      alert('Failed to generate All Children PDF');
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const parent = user?.name || user?.username;
    if (!parent) {
      setError('Please login as a parent to view your children.');
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const approvedRes = await axios.get(`http://localhost:5000/children/by-parent/list`, { params: { parent } });
        setChildren(approvedRes.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load records');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const viewDetails = async (child) => {
    setDetailsError("");
    setSelectedChild(null);
    if (!child?.childId) {
      setDetailsError("Child ID not available for this record");
      return;
    }
    try {
      setDetailsLoading(true);
      const res = await axios.get(`http://localhost:5000/children/${encodeURIComponent(child.childId)}`);
      if (res.data?.success) {
        setSelectedChild(res.data.data);
      } else {
        setDetailsError(res.data?.message || "Failed to fetch child details");
      }
    } catch (err) {
      setDetailsError(err?.response?.data?.message || "Failed to fetch child details");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="create-container">
      <div className="create-form">
        <h1 className="form-title">👶 Children Records</h1>
        <p style={{ color: '#667085', marginTop: -8, marginBottom: 16 }}>Browse your approved children. Use search and sort to quickly find a record.</p>
        {error && <div className="form-error">{error}</div>}
        {loading && <p>Loading...</p>}
        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Search by name, ID, or gender"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', flex: 1, minWidth: 220 }}
          />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
          >
            <option value="name">Sort by Name</option>
            <option value="age">Sort by Age</option>
            <option value="created">Sort by Created</option>
          </select>
          <button
            className="submit-btn"
            type="button"
            onClick={handleDownloadAllPdf}
            disabled={!children || children.length === 0}
          >
            Download All
          </button>
        </div>

        {/* Card grid */}
        {children.length === 0 ? (
          <div className="form-error" style={{ background: '#f8fafc', color: '#475569', border: '1px dashed #cbd5e1' }}>
            No approved children yet
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[...children]
              .filter((c) => {
                const q = search.trim().toLowerCase();
                if (!q) return true;
                const name = String(c.name || '').toLowerCase().trim();
                if (!name) return false;
                if (name.startsWith(q)) return true; // beginning of the phrase
                const tokens = name.split(/\s+/);
                return tokens.some(t => t.startsWith(q)); // beginning of any word
              })
              .sort((a, b) => {
                if (sortKey === 'age') {
                  const av = Number(a.age) || 0, bv = Number(b.age) || 0;
                  return av - bv;
                }
                if (sortKey === 'created') {
                  const at = new Date(a.createdAt || 0).getTime();
                  const bt = new Date(b.createdAt || 0).getTime();
                  return bt - at; // newest first
                }
                // name
                return String(a.name || '').localeCompare(String(b.name || ''));
              })
              .map((c) => (
                <div key={c._id} className="child-card" style={{
                  border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, background: '#fff', boxShadow: '0 1px 2px rgba(16,24,40,0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{c.name || '-'}</div>
                      <div style={{ color: '#64748b', fontSize: 13 }}>ID: {c.childId || '-'}</div>
                    </div>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: 999, fontSize: 12 }}>
                      {c.gender || '-'}
                    </span>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', color: '#475569', fontSize: 14 }}>
                    <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 999 }}>Age: {c.age || '-'}</span>
                    <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 999 }}>Parent: {c.parent || '-'}</span>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <button
                      className="submit-btn"
                      type="button"
                      onClick={() => viewDetails(c)}
                      disabled={detailsLoading}
                      style={{ flex: 1 }}
                    >
                      {detailsLoading ? 'Loading...' : 'View Details'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* View Child Details (Read-only) */}
        {(detailsError || selectedChild || detailsLoading) && (
          <div className="create-form" style={{ marginTop: 24 }}>
            <h2>📖 View Child Details</h2>
            {detailsError && <div className="form-error" style={{ marginTop: 8 }}>{detailsError}</div>}
            {detailsLoading && <p>Loading details...</p>}
            {selectedChild && !detailsLoading && (
              <div className="table-wrap" style={{ marginTop: 10 }} ref={detailsRef}>
                <table className="table">
                  <tbody>
                    <tr><th>Child ID</th><td>{selectedChild.childId}</td></tr>
                    <tr><th>Name</th><td>{selectedChild.name}</td></tr>
                    <tr><th>Age</th><td>{selectedChild.age}</td></tr>
                    <tr><th>Gender</th><td>{selectedChild.gender}</td></tr>
                    <tr><th>Parent</th><td>{selectedChild.parent}</td></tr>
                    <tr><th>Health Notes</th><td>{selectedChild.healthNotes || '-'}</td></tr>
                    {/* Basic Daily Routine */}
                    <tr>
                      <th
                        colSpan="2"
                        style={{
                          background: '#eef2ff',
                          color: '#1e3a8a',
                          textAlign: 'left',
                          fontWeight: 700,
                          padding: '8px 12px',
                          borderTop: '1px solid #dbeafe'
                        }}
                      >
                        Basic Daily Routine
                      </th>
                    </tr>
                    <tr><th>Check-in Time</th><td>{selectedChild.checkInTime || '-'}</td></tr>
                    <tr><th>Check-out Time</th><td>{selectedChild.checkOutTime || '-'}</td></tr>
                    <tr><th>Meal Updates</th><td>{selectedChild.meals || '-'}</td></tr>
                    <tr><th>Nap Times</th><td>{selectedChild.napTimes || '-'}</td></tr>
                    {/* Health & Safety */}
                    <tr>
                      <th
                        colSpan="2"
                        style={{
                          background: '#fee2e2',
                          color: '#991b1b',
                          textAlign: 'left',
                          fontWeight: 700,
                          padding: '8px 12px',
                          borderTop: '1px solid #fecaca'
                        }}
                      >
                        Health & Safety
                      </th>
                    </tr>
                    <tr><th>Health Status</th><td>{selectedChild.healthStatus || '-'}</td></tr>
                    <tr><th>Accident/Incident Reports</th><td>{selectedChild.incidents || '-'}</td></tr>
                    <tr><th>Medication Updates</th><td>{selectedChild.medication || '-'}</td></tr>
                    {/* Behavior & Social Updates */}
                    <tr>
                      <th
                        colSpan="2"
                        style={{
                          background: '#ecfeff',
                          color: '#155e75',
                          textAlign: 'left',
                          fontWeight: 700,
                          padding: '8px 12px',
                          borderTop: '1px solid #a5f3fc'
                        }}
                      >
                        Behavior & Social Updates
                      </th>
                    </tr>
                    <tr><th>Mood & Behavior</th><td>{selectedChild.moodBehavior || '-'}</td></tr>
                    <tr><th>Interaction with Other Kids</th><td>{selectedChild.interactions || '-'}</td></tr>
                    <tr><th>Approved By</th><td>{selectedChild.approvedBy ? (selectedChild.approvedBy.name || selectedChild.approvedBy.username || selectedChild.approvedBy._id) : '-'}</td></tr>
                    <tr><th>Created</th><td>{selectedChild.createdAt ? new Date(selectedChild.createdAt).toLocaleString() : '-'}</td></tr>
                  </tbody>
                </table>
                <div className="actions" style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="submit-btn" type="button" onClick={handleDownloadPdf}>Download PDF</button>
                  <button className="submit-btn" type="button" onClick={() => { setSelectedChild(null); setDetailsError(""); }}>Close</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
