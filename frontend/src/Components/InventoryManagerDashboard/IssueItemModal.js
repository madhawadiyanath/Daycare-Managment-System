import React, { useState } from 'react';

function IssueItemModal({ open, onClose, onSubmit, categories, products }) {
  const [form, setForm] = useState({
    category: '',
    name: '',
    quantity: '',
    issueDate: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
  });
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.category || !form.name || !form.quantity) {
      setError('All fields are required');
      return;
    }
    onSubmit({ ...form, issueDate: new Date().toISOString() });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
        <h2 style={{ marginBottom: 24 }}>Issue Inventory Item</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>Product Category<br/>
              <select name="category" value={form.category} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4 }}>
                <option value="">Select category</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Product Name<br/>
              <select name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4 }}>
                <option value="">Select product</option>
                {products
                  .filter(p => !form.category || p.category === form.category)
                  .map((p, idx) => (
                    <option key={idx} value={p.name}>{p.name}</option>
                  ))}
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Quantity<br/>
              <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Issue Date & Time<br/>
              <input name="issueDate" type="datetime-local" value={form.issueDate} readOnly style={{ width: '100%', padding: 8, marginTop: 4, background: '#eee' }} />
            </label>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <button type="submit" style={{ background: '#27F5EB', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '10px 32px', fontSize: 16, cursor: 'pointer' }}>
              Issue
            </button>
            <button type="button" onClick={onClose} style={{ background: '#7f7fff', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '10px 32px', fontSize: 16, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IssueItemModal;
