import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ParentProfile() {
  const navigate = useNavigate();
  const [parent, setParent] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      navigate('/login');
      return;
    }
    setParent(user);
  }, [navigate]);

  if (!parent) return null;

  return (
    <div style={{ padding: 24 }}>
      <h1>Parent Profile</h1>
      <div style={{ marginTop: 12, maxWidth: 640 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #eee' }}>Name</th>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{parent.name || '-'}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #eee' }}>Username</th>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{parent.username || '-'}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #eee' }}>Email</th>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{parent.email || '-'}</td>
            </tr>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #eee' }}>Phone</th>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{parent.phone || '-'}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            className="btn"
            onClick={() => navigate('/ChildcareDashboard')}
          >
            Go to Childcare Dashboard
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/goHome');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
