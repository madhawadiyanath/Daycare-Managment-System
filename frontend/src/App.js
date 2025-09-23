import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';

import Home from "./Components/Home/Home";
import AddUser from "./Components/AddBill/AddBill";
import Finace from "./Components/Finance/Finance";
import BillDetails from "./Components/BillDetails/BillDetails";
import SalaryDetails from "./Components/SalaryDetails/SalaryDetails";
import IncomeDetails from "./Components/IncomeDetails/IncomeDetails";
import ExpenseDetails from "./Components/ExpenseDetails/ExpenseDetails";
import ProfitLoss from "./Components/ProfitLoss/ProfitLoss";
import IncomesAndExpenses from "./Components/IncomesAndExpenses/IncomesAndExpenses";
import JoinUs from './Components/JoinUs/JoinUs';
import About from './Components/About/About';
import Login from './Components/Login/Login';
import ChildcareDashboard from './Components/ChildcareDashboard/ChildcareDashboard';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import TeacherDashboard from './Components/TeacherDashboard/TeacherDashboard';

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
          <Route path="/income-details" element={<IncomeDetails/>}/>
          <Route path="/expense-details" element={<ExpenseDetails/>}/>
          <Route path="/profit-loss" element={<ProfitLoss/>}/>
          <Route path="/incomes-expenses" element={<IncomesAndExpenses/>}/>
          <Route path="/JoinUs" element={<JoinUs/>}/>
          <Route path="/AboutUs" element={<About/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
          <Route path="/teacher/dashboard" element={<TeacherDashboard/>}/>
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
