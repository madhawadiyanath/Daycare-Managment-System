import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateChild.css";

export default function ViewChildren() {
  const [children, setChildren] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        const [approvedRes, pendingRes] = await Promise.all([
          axios.get(`http://localhost:5000/children/by-parent/list`, { params: { parent } }),
          axios.get(`http://localhost:5000/child-requests/by-parent/list`, { params: { parent } }),
        ]);
        setChildren(approvedRes.data?.data || []);
        setPending(pendingRes.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load records');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="create-container">
      <div className="create-form">
        <h1 className="form-title">👶 Children Records</h1>
        {error && <div className="form-error">{error}</div>}
        {loading && <p>Loading...</p>}
        <table className="child-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Parent</th>
            </tr>
          </thead>
          <tbody>
            {children.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No approved children yet</td>
              </tr>
            ) : (
              children.map((child) => (
                <tr key={child._id}>
                  <td>{child.name}</td>
                  <td>{child.age}</td>
                  <td>{child.gender}</td>
                  <td>{child.parent}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <h2 style={{ marginTop: 24 }}>⏳ Pending Requests</h2>
        <table className="child-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No pending requests</td>
              </tr>
            ) : (
              pending.map((req) => (
                <tr key={req._id}>
                  <td>{req.name}</td>
                  <td>{req.age}</td>
                  <td>{req.gender}</td>
                  <td>{req.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
