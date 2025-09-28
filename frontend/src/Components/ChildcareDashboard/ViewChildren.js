import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateChild.css";

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
                return (
                  (c.name || '').toLowerCase().includes(q) ||
                  (c.childId || '').toLowerCase().includes(q) ||
                  (c.gender || '').toLowerCase().includes(q)
                );
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
              <div className="table-wrap" style={{ marginTop: 10 }}>
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
                <div className="actions" style={{ marginTop: 10 }}>
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
