import React, { useState, useEffect } from "react";
import "./CreateChild.css";

export default function ViewChildren() {
  const [children, setChildren] = useState([]);

  useEffect(() => {
    // 🚀 Fetch children from backend later
    const dummyData = [
      { id: 1, name: "Emma", age: 5, gender: "Female", parent: "John Doe" },
      { id: 2, name: "Liam", age: 4, gender: "Male", parent: "Sarah Smith" },
    ];
    setChildren(dummyData);
  }, []);

  return (
    <div className="create-container">
      <div className="create-form">
        <h1 className="form-title">👶 Children Records</h1>
        <table className="child-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Parent</th>
            </tr>
          </thead>
          <tbody>
            {children.map((child) => (
              <tr key={child.id}>
                <td>{child.name}</td>
                <td>{child.age}</td>
                <td>{child.gender}</td>
                <td>{child.parent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
