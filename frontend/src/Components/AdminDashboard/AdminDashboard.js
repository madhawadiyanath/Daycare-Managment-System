import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const admin = JSON.parse(localStorage.getItem('admin') || 'null');

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        {admin && (
          <div className="admin-profile">
            <span className="role">{admin.role}</span>
            <span className="username">{admin.username}</span>
          </div>
        )}
      </div>

      {loading && <div className="card">Loading...</div>}
      {error && <div className="card error">{error}</div>}

      {!loading && !error && (
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
      )}
    </div>
  );
}

export default AdminDashboard;
