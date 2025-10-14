

import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SupplierModal from '../Supplier/supplier';
import InventoryItemList from './InventoryItemList';
import InventoryNewItemAdd from './InventoryNewItemAdd';
import DeleteConfirmModal from './DeleteConfirmModal';
import IssueItemModal from './IssueItemModal';
import Nav from "../Nav/Nav";

// Icon URLs (replace with local assets if available)
const icons = {
  box: 'https://cdn-icons-png.flaticon.com/512/1040/1040230.png',
  check: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
  warning: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
  alert: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
  list: 'https://cdn-icons-png.flaticon.com/512/1828/1828919.png',
  add: 'https://cdn-icons-png.flaticon.com/512/992/992651.png',
  issue: 'https://cdn-icons-png.flaticon.com/512/1040/1040230.png',
};

function InventoryManagerDashboard() {
  // Supplier names for dropdown
  const [supplierNames, setSupplierNames] = useState([]);

  // Summary popup state
  const [showSummary, setShowSummary] = useState(false);

  // Fetch supplier names for dropdown (from /admin/supplier-dropdown)
  const fetchSupplierNames = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/supplier-dropdown');
      let data = res.data;
      if (!Array.isArray(data)) {
        if (data && Array.isArray(data.data)) {
          data = data.data;
        } else {
          data = [];
        }
      }
      setSupplierNames(data.map(s => s.name).filter(Boolean));
    } catch (err) {
      setSupplierNames([]);
    }
  };
  const navigate = useNavigate();
  const [showGetItem, setShowGetItem] = useState(false);
  // Supplier modal state only
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  // ...existing code...

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
  const [selectedCategory, setSelectedCategory] = useState('');
  const categories = Array.from(new Set(allItems.map(i => i.category)));
  const totalStock = selectedCategory
    ? allItems.filter(i => i.category === selectedCategory).reduce((sum, item) => sum + (item.stock || 0), 0)
    : allItems.reduce((sum, item) => sum + (item.stock || 0), 0);
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

  // Fetch items and supplier names on mount
  useEffect(() => {
    fetchItems();
    fetchSupplierNames();
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

  // Delete handler for expired items popup
  const handleDeleteExpired = async (item) => {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await axios.delete(`http://localhost:5000/admin/inventory-managers/items/${item._id}`);
      if (res.data?.success) {
        fetchItems();
      } else {
        setDeleteError(res.data?.message || 'Failed to delete');
      }
    } catch (err) {
      setDeleteError('Failed to delete');
    }
    setDeleting(false);
  };

  // For category/product dropdowns
  // Filter out expired items for item list and issue
  const today = new Date();
  const isExpired = (item) => {
    if (!item.expiry) return false;
    const expiryDate = new Date(item.expiry);
    return expiryDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };
  const products = allItems.filter(item => !isExpired(item));

  // Expired items: expiry exists and is before today
  const expiredItems = allItems.filter(item => {
    if (!item.expiry) return false;
    const today = new Date();
    const expiryDate = new Date(item.expiry);
    // Only compare date part
    return expiryDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });

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
    <div className="finance-container" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: 260,
        background: '#00A8FF',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px 0 0 0',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
        minHeight: '100vh',
        borderRight: '1px solid #e0e0e0',
      }}>
        <div style={{ padding: '0 24px', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Inventory</div>
          <div style={{ fontSize: 11, color: '#e0e0e0', marginBottom: 12 }}>
            "Inventory manager user name"<br />
            "inventory manager email address"
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <div style={{ padding: '8px 24px', cursor: 'pointer', fontWeight: 500, fontSize: 15, color: '#fff' }}>Inventory Home</div>
          <div
            style={{ padding: '8px 24px', cursor: 'pointer', fontWeight: 500, fontSize: 15, color: '#fff' }}
            onClick={() => { setEditItem(null); setShowAddItem(true); }}
          >
            Add Item
          </div>
          <div
            style={{ padding: '8px 24px', cursor: 'pointer', fontWeight: 500, fontSize: 15, color: '#fff' }}
            onClick={() => setShowSummary(true)}
          >
            Summary
          </div>
          <div
            style={{ padding: '8px 24px', cursor: 'pointer', fontWeight: 500, fontSize: 15, color: '#fff' }}
            onClick={() => setShowSupplierModal(true)}
          >
            Supplier
          </div>
          <SupplierModal open={showSupplierModal} onClose={() => setShowSupplierModal(false)} />
          <div
            style={{ padding: '8px 24px', cursor: 'pointer', fontWeight: 500, fontSize: 15, color: '#fff' }}
            onClick={() => setShowIssueModal(true)}
          >
            Issue Item
          </div>
          <div
            style={{ padding: '8px 24px', cursor: 'pointer', fontWeight: 500, fontSize: 15, color: '#fff' }}
            onClick={() => setShowExpiredModal(true)}
          >
            Expired Items
          </div>
        </div>
      </div>
      {/* Main content, shifted right for sidebar */}
  <div style={{ marginLeft: 260, flex: 1, background: '#fff', minHeight: '100vh', padding: 0 }}>
        <Nav />
        {/* Header */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '150px 0 0 0' }}>
          <div style={{
            background: '#fff',
            borderRadius: 20,
            width: 750,
            height: 120,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 70,
            boxShadow: '0 8px 32px rgba(52,9,147,0.18), 0 2px 8px rgba(52,9,147,0.10)',
            border: '1.5px solid #e0e0e0'
          }}>
            <h1 style={{ fontWeight: 700, fontSize: 32, color: '#070f85ff', margin: 0 }}>Inventory Management</h1>
            <div style={{ color: '#131c94ff', fontSize: 14, fontWeight: 400 }}>Real time stock overview</div>
          </div>
        </div>

        {/* Top cards */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 40 }}>
          <div style={{ background: '#ffe9a7', borderRadius: 14, width: 370, height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0001', position: 'relative' }}>
            {/* Icon removed as requested */}
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, marginTop: 32 }}>Total Products</div>
            <div style={{ fontWeight: 700, fontSize: 32 }}>{totalProducts}</div>
          </div>
          <div style={{ background: '#ede5e5ff', borderRadius: 14, width: 370, height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0001', position: 'relative' }}>
            {/* Category dropdown (functional) */}
            <div style={{ width: '80%', marginBottom: 4 }}>
              <select
                style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', fontSize: 14 }}
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value=''>All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Total Stock</div>
            <div style={{ fontWeight: 700, fontSize: 32 }}>{totalStock}</div>
          </div>
        </div>

        {/* Middle cards */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
          <div style={{ background: '#ffe0f0', borderRadius: 16, width: 350, height: 270, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0001' }}>
            <img src={icons.warning} alt="warning" style={{ width: 32, marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>OUT OF STOCK PRODUCT</div>
            {outOfStock.length === 0 ? (
              <div style={{ color: '#888' }}>None</div>
            ) : (
              outOfStock.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 4 }}>{item.name} : {item.category}</div>
              ))
            )}
          </div>
          <div style={{ background: '#c6f7fa', borderRadius: 16, width: 350, height: 270, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0001' }}>
            <img src={icons.alert} alt="alert" style={{ width: 32, marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>LOW STOCK PRODUCT</div>
            {lowStock.length === 0 ? (
              <div style={{ color: '#888' }}>None</div>
            ) : (
              lowStock.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 4 }}>{item.name} : {item.stock} Unit</div>
              ))
            )}
          </div>
          <div style={{ background: '#fff9b6', borderRadius: 16, width: 350, height: 270, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0001' }}>
            <img src={icons.list} alt="list" style={{ width: 32, marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>LIST OF PRODUCT</div>
            <button
              style={{ background: '#ff7f7f', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 8, padding: '10px 32px', fontSize: 18, cursor: 'pointer', marginTop: 8 }}
              onClick={() => setShowGetItem(true)}
            >
              Item List
            </button>
          </div>
        </div>

        {/* Bottom cards */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
          <div style={{ background: '#ffe9a7', borderRadius: 16, width: 370, height: 270, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0001' }}>
            <img src={icons.add} alt="add" style={{ width: 32, marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>ADD ITEM</div>
            <div style={{ fontSize: 14, color: '#444', marginBottom: 12 }}>Adding items for stock</div>
            <button
              style={{ background: '#19d219', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 8, padding: '10px 32px', fontSize: 18, cursor: 'pointer' }}
              onClick={() => setShowAddItem(true)}
            >
              Add Item
            </button>
          </div>
          <div style={{ background: '#d6ffe9', borderRadius: 16, width: 370, height: 270, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0001' }}>
            <img src={icons.issue} alt="issue" style={{ width: 32, marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>ISSUE ITEM</div>
            <div style={{ fontSize: 14, color: '#444', marginBottom: 12 }}>Issuing items from stock.</div>
            <button
              style={{ background: '#27F5EB', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 8, padding: '10px 32px', fontSize: 18, cursor: 'pointer' }}
              onClick={handleIssue}
            >
              Issue Item
            </button>
          </div>
        </div>

        {/* Modals and lists */}
  {/* Only show non-expired items in the item list */}
  <InventoryItemList open={showGetItem} onClose={() => setShowGetItem(false)} items={products} onEdit={handleEdit} onDelete={handleDelete} />
        {loadingItems && <div style={{textAlign:'center',color:'#888'}}>Loading inventory items...</div>}
        {errorItems && <div style={{textAlign:'center',color:'red'}}>{errorItems}</div>}
        <InventoryNewItemAdd
          open={showAddItem}
          onClose={handleCloseAddEdit}
          onSuccess={() => { fetchItems(); fetchSupplierNames(); }}
          editItem={editItem}
          supplierNames={supplierNames}
        />

        {/* Summary Popup */}
        {showSummary && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
          }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 900, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' }}>
              <h2 style={{ marginBottom: 24 }}>Inventory Summary</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                <thead>
                  <tr style={{ background: '#f0f0f0' }}>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Name</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Category</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Create On Date</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Issue Stock</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Total Stock</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Issue Date</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Example: map over allItems or another data source for summary */}
                  {allItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 16, color: '#888' }}>No data</td>
                    </tr>
                  ) : (
                    allItems.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.name}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.category}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.createdOn ? item.createdOn.substring(0, 10) : ''}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.issueStock || '-'}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.stock}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.issueDate ? item.issueDate.substring(0, 10) : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => setShowSummary(false)}
                  style={{ background: '#7f7fff', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '10px 32px', fontSize: 16, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expired Items Modal */}
        {showExpiredModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
          }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 900, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' }}>
              <h2 style={{ marginBottom: 24 }}>Expired Items</h2>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                {/* <button
                  style={{ background: '#19d219', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 16, cursor: 'pointer' }}
                  onClick={() => {
                    const doc = new jsPDF('l', 'pt', 'a4');
                    doc.setFontSize(18);
                    doc.text('Expired Inventory Items', 40, 40);
                    const head = [[
                      'Name', 'Category', 'Stock', 'Expiry', 'Supplier'
                    ]];
                    const body = (expiredItems || []).map(item => [
                      item.name,
                      item.category,
                      item.stock,
                      item.expiry ? item.expiry.substring(0, 10) : '',
                      item.supplier
                    ]);
                    autoTable(doc, {
                      head,
                      body,
                      startY: 60,
                      styles: { fontSize: 10 },
                      headStyles: { fillColor: [255, 127, 127] }
                    });
                    doc.save('expired-inventory-list.pdf');
                  }}
                >
                  Download PDF
                </button> */}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                <thead>
                  <tr style={{ background: '#f0f0f0' }}>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Name</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Category</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Stock</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Expiry</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Supplier</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 16, color: '#888' }}>No expired items</td>
                    </tr>
                  ) : (
                    expiredItems.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.name}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.category}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.stock}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.expiry ? item.expiry.substring(0, 10) : ''}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.supplier}</td>
                        <td style={{ padding: 8, border: '1px solid #ddd' }}>
                          <button
                            style={{ background: '#ff7f7f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}
                            onClick={() => handleDeleteExpired(item)}
                            disabled={deleting}
                          >
                            {deleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => setShowExpiredModal(false)}
                  style={{ background: '#7f7fff', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 4, padding: '10px 32px', fontSize: 16, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <DeleteConfirmModal
          open={!!deleteItem}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
          item={deleteItem}
        />
        <IssueItemModal
          open={showIssueModal}
          onClose={() => setShowIssueModal(false)}
          onSubmit={handleSubmitIssue}
          categories={categories}
          products={products}
        />
        {issueError && <div style={{textAlign:'center',color:'red'}}>{issueError}</div>}
        {deleteError && <div style={{textAlign:'center',color:'red'}}>{deleteError}</div>}
      </div>
    </div>
  );
}

export default InventoryManagerDashboard;
