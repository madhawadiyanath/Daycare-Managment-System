import React, { useState } from "react";
import "./ChildcareDashboard.css";
import Nav from "../Nav/Nav";
import CreateChild from "./CreateChild";
import ViewChildren from "./ViewChildren";
import UpdateChild from "./UpdateChild";
import DeleteChild from "./DeleteChild";

export default function ChildcareDashboard() {
  const [activeSection, setActiveSection] = useState("");

  return (
    <div>
      <Nav/>
      <div className="dashboard">
        <h1 className="title">Childcare Management Dashboard</h1>

        <div className="button-container">
          <button onClick={() => setActiveSection("create")}>➕ Create Child Record</button>
          <button onClick={() => setActiveSection("view")}>📖 View Records</button>
          <button onClick={() => setActiveSection("update")}>✏️ Update Progress</button>
          <button onClick={() => setActiveSection("delete")}>🗑️ Delete Records</button>
        </div>

        <div className="section-container">
          {activeSection === "create" && (
            <div className="section fade-in">
              <CreateChild/>
            </div>
          )}
          {activeSection === "view" && (
            <div className="section fade-in">
              <ViewChildren/>
            </div>
          )}
          {activeSection === "update" && (
            <div className="section fade-in">
              <UpdateChild/>
            </div>
          )}
          {activeSection === "delete" && (
            <div className="section fade-in">
              <DeleteChild/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
