import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function InventoryManagerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const im = JSON.parse(localStorage.getItem('inventoryManager') || 'null');
    if (!im) {
      navigate('/login');
    }
  }, [navigate]);

  const im = JSON.parse(localStorage.getItem('inventoryManager') || 'null');

  return (
    <div className="page">
      <div className="container">
        <h1>Inventory Manager Dashboard</h1>
        <p>Welcome{im?.name ? `, ${im.name}` : ''}! Use this dashboard to manage inventory.</p>

        {/* Add inventory-related navigation or widgets here */}
        <div style={{ marginTop: 20 }}>
          <button className="btn" onClick={() => navigate('/admin/dashboard')}>Go to Admin Dashboard</button>
        </div>
      </div>
    </div>
  );
}

export default InventoryManagerDashboard;
