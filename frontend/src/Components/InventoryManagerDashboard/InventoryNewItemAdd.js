
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function InventoryNewItemAdd({ open, onClose, onSuccess, editItem }) {
  const isEdit = !!editItem;
  const [form, setForm] = useState({
    name: '',
    category: '',
    stock: '',
    expiry: '',
    supplier: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && editItem) {
      setForm({
        name: editItem.name || '',
        category: editItem.category || '',
        stock: editItem.stock || '',
        expiry: editItem.expiry ? editItem.expiry.substring(0, 10) : '',
        supplier: editItem.supplier || '',
      });
    } else {
      setForm({ name: '', category: '', stock: '', expiry: '', supplier: '' });
    }
  }, [isEdit, editItem, open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (isEdit && editItem && editItem._id) {
        res = await axios.put(`http://localhost:5000/admin/inventory-managers/items/${editItem._id}`, {
          name: form.name,
          category: form.category,
          stock: form.stock,
          expiry: form.expiry,
          supplier: form.supplier,
        });
      } else {
        res = await axios.post('http://localhost:5000/admin/inventory-managers/items', {
          name: form.name,
          category: form.category,
          stock: form.stock,
          expiry: form.expiry,
          supplier: form.supplier,
        });
      }
      if (res.data?.success) {
        setForm({ name: '', category: '', stock: '', expiry: '', supplier: '' });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.data?.message || (isEdit ? 'Failed to update' : 'Failed to create'));
      }
    } catch (err) {
      setError(isEdit ? 'Failed to update' : 'Failed to create');
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
        <h2 style={{ marginBottom: 24 }}>{isEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>Product Name<br/>
              <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Product Category<br/>
              <input name="category" value={form.category} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Stock Quantity<br/>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4 }} />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Expiry Date<br/>
              <input name="expiry" type="date" value={form.expiry} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4 }} />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Supplier Name<br/>
              <input name="supplier" value={form.supplier} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4 }} />
            </label>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <button type="submit" disabled={loading} style={{ background: '#19d219', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '10px 32px', fontSize: 16, cursor: 'pointer' }}>
              {loading ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Item' : 'Add Item')}
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

export default InventoryNewItemAdd;
