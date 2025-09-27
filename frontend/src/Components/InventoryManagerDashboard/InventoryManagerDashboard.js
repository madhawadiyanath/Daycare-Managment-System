

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InventoryItemList from './InventoryItemList';
import InventoryNewItemAdd from './InventoryNewItemAdd';
import DeleteConfirmModal from './DeleteConfirmModal';
import IssueItemModal from './IssueItemModal';

function InventoryManagerDashboard() {
  const navigate = useNavigate();
  const [showGetItem, setShowGetItem] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueError, setIssueError] = useState('');
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    const im = JSON.parse(localStorage.getItem('inventoryManager') || 'null');
    if (!im) {
      navigate('/login');
    }
  }, [navigate]);
 const [allItems, setAllItems] = useState([]);
  // Calculate total product categories and total stock from allItems
  const totalProducts = Array.from(new Set(allItems.map(i => i.category))).length;
  const totalStock = allItems.reduce((sum, item) => sum + (item.stock || 0), 0);
  // Out of stock and low stock logic (replace with backend data if available)
  const outOfStock = allItems.filter(item => (item.stock || 0) === 0);
  const lowStock = allItems.filter(item => (item.stock || 0) > 0 && (item.stock || 0) <= 5);
  // Inventory items from backend
 
  const [loadingItems, setLoadingItems] = useState(false);
  const [errorItems, setErrorItems] = useState('');

  // Fetch inventory items from backend
  const fetchItems = async () => {
    setLoadingItems(true);
    setErrorItems('');
    try {
      const res = await axios.get('http://localhost:5000/admin/inventory-managers/items');
      if (res.data?.success) {
        setAllItems(res.data.data || []);
      } else {
        setErrorItems(res.data?.message || 'Failed to fetch items');
      }
    } catch (err) {
      setErrorItems('Failed to fetch items');
    }
    setLoadingItems(false);
  };

  // Fetch items on mount and after add
  useEffect(() => {
    fetchItems();
  }, []);

  const handleEdit = (item) => {
    setEditItem(item);
    setShowAddItem(true);
  };

  const handleCloseAddEdit = () => {
    setShowAddItem(false);
    setEditItem(null);
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await axios.delete(`http://localhost:5000/admin/inventory-managers/items/${deleteItem._id}`);
      if (res.data?.success) {
        setDeleteItem(null);
        fetchItems();
      } else {
        setDeleteError(res.data?.message || 'Failed to delete');
      }
    } catch (err) {
      setDeleteError('Failed to delete');
    }
    setDeleting(false);
  };

  const handleCloseDelete = () => {
    setDeleteItem(null);
    setDeleteError('');
  };

  // For category/product dropdowns
  const categories = Array.from(new Set(allItems.map(i => i.category)));
  const products = allItems;

  const handleIssue = () => {
    setShowIssueModal(true);
    setIssueError('');
  };

  const handleSubmitIssue = async (data) => {
    setIssuing(true);
    setIssueError('');
    try {
      // Backend call
      const res = await axios.post('http://localhost:5000/admin/inventory-managers/issue', data);
      if (res.data?.success) {
        setShowIssueModal(false);
        fetchItems();
      } else {
        setIssueError(res.data?.message || 'Failed to issue item');
      }
    } catch (err) {
      setIssueError('Failed to issue item');
    }
    setIssuing(false);
  };

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', padding: 40 }}>
      <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 40 }}>INVENTORY</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 80, marginBottom: 40 }}>
        <div style={{ background: '#7fff9f', borderRadius: 10, width: 250, height: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Total Products</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{totalProducts}</div>
        </div>
        <div style={{ background: '#f7ff7f', borderRadius: 10, width: 250, height: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Total Stock</div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{totalStock}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 60 }}>
        <div style={{ background: '#dadada', borderRadius: 2, width: 400, minHeight: 150, padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>OUT OF STOCK PRODUCT</div>
          {outOfStock.length === 0 ? (
            <div>None</div>
          ) : (
            outOfStock.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 4 }}>{item.name} : {item.category}</div>
            ))
          )}
        </div>
        <div style={{ background: '#dadada', borderRadius: 2, width: 400, minHeight: 150, padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>LOW STOCK PRODUCT</div>
          {lowStock.length === 0 ? (
            <div>None</div>
          ) : (
            lowStock.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 4 }}>{item.name} : {item.stock} Unit</div>
            ))
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
        <button
          style={{ background: '#ff7f7f', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '14px 40px', fontSize: 18, cursor: 'pointer' }}
          onClick={() => setShowGetItem(true)}
        >
          Item List
        </button>
        <button
          style={{ background: '#19d219', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '14px 40px', fontSize: 18, cursor: 'pointer' }}
          onClick={() => setShowAddItem(true)}
        >
          Add Item
        </button>
        <button
          style={{ background: '#27F5EB', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '14px 40px', fontSize: 18, cursor: 'pointer' }}
          onClick={handleIssue}
        >
          Issue Item
        </button>
      <IssueItemModal
        open={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        onSubmit={handleSubmitIssue}
        categories={categories}
        products={products}
      />
      {issueError && <div style={{textAlign:'center',color:'red'}}>{issueError}</div>}
        <button
          style={{ background: '#7f7fff', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '14px 40px', fontSize: 18, cursor: 'pointer' }}
          onClick={() => {/* handle get summary */}}
        >
          Get Summary
        </button>
      </div>
  <InventoryItemList open={showGetItem} onClose={() => setShowGetItem(false)} items={allItems} onEdit={handleEdit} onDelete={handleDelete} />
  {loadingItems && <div style={{textAlign:'center',color:'#888'}}>Loading inventory items...</div>}
  {errorItems && <div style={{textAlign:'center',color:'red'}}>{errorItems}</div>}
      <InventoryNewItemAdd
        open={showAddItem}
        onClose={handleCloseAddEdit}
        onSuccess={fetchItems}
        editItem={editItem}
      />
      <DeleteConfirmModal
        open={!!deleteItem}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        item={deleteItem}
      />
      {deleteError && <div style={{textAlign:'center',color:'red'}}>{deleteError}</div>}
    </div>
  );
}

export default InventoryManagerDashboard;
