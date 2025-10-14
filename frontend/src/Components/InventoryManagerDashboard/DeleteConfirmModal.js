import React from 'react';

function DeleteConfirmModal({ open, onClose, onConfirm, item }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 350, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginBottom: 20 }}>Delete Item</h3>
        <div style={{ marginBottom: 24 }}>
          Are you sure you want to delete <b>{item?.name}</b>?
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: '#7f7fff', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ background: '#ff7f7f', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
