import React, { useState } from "react";
import "./CreateChild.css";

export default function DeleteChild() {
  const [childName, setChildName] = useState("Emma");
  const [confirm, setConfirm] = useState(false);

  const handleDelete = () => {
    console.log(`Deleted child: ${childName}`);
    alert(`❌ ${childName}'s record deleted successfully!`);
    setConfirm(false);
  };

  return (
    <div className="create-container">
      <div className="create-form">
        <h1 className="form-title">🗑️ Delete Child Record</h1>
        <p>
          Are you sure you want to delete <b>{childName}</b>'s record?
        </p>
        {!confirm ? (
          <button className="submit-btn" onClick={() => setConfirm(true)}>
            Confirm Delete
          </button>
        ) : (
          <div className="confirm-box">
            <button
              className="submit-btn"
              style={{ background: "red" }}
              onClick={handleDelete}
            >
              Yes, Delete
            </button>
            <button
              className="submit-btn"
              style={{ background: "gray" }}
              onClick={() => setConfirm(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
