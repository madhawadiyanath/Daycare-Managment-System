import React from 'react';

function InventoryItemList({ open, onClose, items, onEdit, onDelete }) {
  if (!open) return null;

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 1500, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
        <h2 style={{ marginBottom: 24 }}>All Inventory Items</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Name</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Category</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Stock</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Expiry</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Supplier</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Created On</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Modified On</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items && items.length > 0 ? (
              items.map((item, idx) => (
                <tr key={item._id || idx}>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{item.name}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{item.category}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{item.stock}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{formatDate(item.expiry)}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{item.supplier}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{formatDate(item.createdOn)}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{formatDate(item.modifiedOn)}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                    <button
                      style={{ background: '#7f7fff', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', marginRight: 8, cursor: 'pointer' }}
                      onClick={() => onEdit && onEdit(item)}
                    >Edit</button>
                    <button
                      style={{ background: '#ff7f7f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}
                      onClick={() => onDelete && onDelete(item)}
                    >Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={8} style={{ padding: 16, textAlign: 'center' }}>No items found.</td></tr>
            )}
          </tbody>
        </table>
        <button
          style={{ background: '#7f7fff', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '10px 32px', fontSize: 16, cursor: 'pointer' }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default InventoryItemList;
