import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';

import Home from "./Components/Home/Home";
import AddUser from "./Components/AddBill/AddBill";
import Finace from "./Components/Finance/Finance";
import BillDetails from "./Components/BillDetails/BillDetails";
import SalaryDetails from "./Components/SalaryDetails/SalaryDetails";
import JoinUs from './Components/JoinUs/JoinUs';
import About from './Components/About/About';
import Login from './Components/Login/Login';
import ChildcareDashboard from './Components/ChildcareDashboard/ChildcareDashboard';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';

function App() {
  return (
    <div className="App">
     
     
     <React.Fragment>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/goHome" element={<Home/>}/>
          <Route path="/mainfina" element={<Finace/>}/>
          <Route path="/ChildcareDashboard" element={<ChildcareDashboard/>}/>
          <Route path="/AddBill" element={<AddUser/>}/>
          <Route path="/BillDetails" element={<BillDetails/>}/>
          <Route path="/SalaryDetails" element={<SalaryDetails/>}/>
          <Route path="/JoinUs" element={<JoinUs/>}/>
          <Route path="/AboutUs" element={<About/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
