import React, { useState } from 'react';


function getSriLankaDateTimeLocal() {
  // Get current time in UTC+5:30 (Sri Lanka)
  const now = new Date();
  // Get UTC time in ms, add 5.5 hours in ms
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const slTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + offsetMs);
  // Format as yyyy-MM-ddTHH:mm
  return slTime.toISOString().slice(0, 16);
}

function getSriLankaISOString() {
  // Get current time in UTC+5:30 (Sri Lanka) as ISO string
  const now = new Date();
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const slTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + offsetMs);
  return slTime.toISOString();
}

function IssueItemModal({ open, onClose, onSubmit, categories, products }) {
  const [form, setForm] = useState({
    category: '',
    name: '',
    quantity: '',
    issueDate: getSriLankaDateTimeLocal(),
  });

  // Find the selected product's stock
  const selectedProduct = products.find(
    p => p.name === form.name && p.category === form.category
  );
  const inStock = selectedProduct ? selectedProduct.stock : 0;
  const [error, setError] = useState('');


  // Reset form with Sri Lankan time when modal opens
  React.useEffect(() => {
    if (open) {
      setForm({
        category: '',
        name: '',
        quantity: '',
        issueDate: getSriLankaDateTimeLocal(),
      });
      setError('');
    }
    // eslint-disable-next-line
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'quantity') {
      // Prevent entering more than inStock
      let val = value.replace(/[^0-9]/g, '');
      if (inStock && Number(val) > inStock) val = inStock;
      setForm({ ...form, quantity: val });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.category || !form.name || !form.quantity) {
      setError('All fields are required');
      return;
    }
    if (Number(form.quantity) > inStock) {
      setError(`Cannot issue more than in-stock quantity (${inStock})`);
      return;
    }
  onSubmit({ ...form, issueDate: getSriLankaISOString() });
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
              <input
                name="quantity"
                type="number"
                min="1"
                max={inStock || 1}
                value={form.quantity}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 8, marginTop: 4 }}
                disabled={!form.name || !form.category}
                title={form.name && form.category ? `Max: ${inStock}` : 'Select product first'}
              />
              {form.name && form.category && (
                <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                  In Stock: {inStock}
                </div>
              )}
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
