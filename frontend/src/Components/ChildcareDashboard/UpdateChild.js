import React, { useState } from "react";
import "./CreateChild.css";

export default function UpdateChild() {
  const [childData, setChildData] = useState({
    name: "Emma",
    age: 5,
    gender: "Female",
    parent: "John Doe",
    healthNotes: "Peanut allergy"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChildData({ ...childData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Child Data:", childData);
    alert("✅ Child record updated successfully!");
  };

  return (
    <div className="create-container">
      <form className="create-form" onSubmit={handleSubmit}>
        <h1 className="form-title">✏️ Update Child Record</h1>

        <label>Child Name</label>
        <input
          type="text"
          name="name"
          value={childData.name}
          onChange={handleChange}
        />

        <label>Age</label>
        <input
          type="number"
          name="age"
          value={childData.age}
          onChange={handleChange}
        />

        <label>Gender</label>
        <select name="gender" value={childData.gender} onChange={handleChange}>
          <option value="Male">Boy</option>
          <option value="Female">Girl</option>
          <option value="Other">Other</option>
        </select>

        <label>Parent</label>
        <input
          type="text"
          name="parent"
          value={childData.parent}
          onChange={handleChange}
        />

        <label>Health Notes</label>
        <textarea
          name="healthNotes"
          value={childData.healthNotes}
          onChange={handleChange}
        ></textarea>

        <button type="submit" className="submit-btn">
          Update Record
        </button>
      </form>
    </div>
  );
}
