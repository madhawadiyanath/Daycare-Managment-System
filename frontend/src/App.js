import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';

import Home from "./Components/Home/Home";
import AddUser from "./Components/AddBill/AddBill";
import Finace from "./Components/Finance/Finance";
import BillDetails from "./Components/BillDetails/BillDetails";
function App() {
  return (
    <div className="App">
     
     
     <React.Fragment>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/goHome" element={<Home/>}/>
          <Route path="/mainfina" element={<Finace/>}/>
          <Route path="/AddBill" element={<AddUser/>}/>
          <Route path="/BillDetails" element={<BillDetails/>}/>
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
