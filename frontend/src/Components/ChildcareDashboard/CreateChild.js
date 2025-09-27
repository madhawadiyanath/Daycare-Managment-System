import React, { useState } from "react";
import axios from "axios";
import "./CreateChild.css";

export default function CreateChild() {
  const [childData, setChildData] = useState({
    name: "",
    age: "",
    gender: "",
    parent: "",
    healthNotes: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChildData({ ...childData, [name]: value });
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!childData.name.trim() || !childData.age || !childData.gender || !childData.parent.trim()) {
      setError("Name, age, gender and parent are required");
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post("http://localhost:5000/child-requests", {
        name: childData.name.trim(),
        age: String(childData.age).trim(),
        gender: childData.gender,
        parent: childData.parent.trim(),
        healthNotes: childData.healthNotes?.trim?.() || "",
      });
      if (res.data?.success) {
        setSuccessMsg("Request submitted! A staff member will review and approve.");
        setChildData({ name: "", age: "", gender: "", parent: "", healthNotes: "" });
      } else {
        setError(res.data?.message || "Failed to submit request");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-container">

      <form className="create-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        {successMsg && <div className="form-success">{successMsg}</div>}
        <label>Child Name</label>
        <input
          type="text"
          name="name"
          value={childData.name}
          onChange={handleChange}
          placeholder="Enter child name"
          required
        />

        <label>Age</label>
        <input
          type="number"
          name="age"
          value={childData.age}
          onChange={handleChange}
          placeholder="Enter age"
          required
        />

        <label>Gender</label>
        <select name="gender" value={childData.gender} onChange={handleChange}>
          <option value="">Select gender</option>
          <option value="Male">Boy</option>
          <option value="Female">Girl</option>
          <option value="Other">Other</option>
        </select>

        <label>Parent/Guardian Name</label>
        <input
          type="text"
          name="parent"
          value={childData.parent}
          onChange={handleChange}
          placeholder="Enter parent name"
          required
        />

        <label>Health Notes</label>
        <textarea
          name="healthNotes"
          value={childData.healthNotes}
          onChange={handleChange}
          placeholder="Allergies, medical notes..."
        ></textarea>

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
