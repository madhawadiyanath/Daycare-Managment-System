import React from 'react'
import Nav from "../Nav/Nav";
import {Link} from "react-router-dom";
function Finance() {
  return (
    <div>
      
      <Nav/>
      <main class="main-content">
      
      <Link to="/AddBill"  class="nav-link"> <button>Add Bill Cal</button></Link>
      <Link to="/BillDetails"  class="nav-link"> <button>Bill Details</button></Link>
      
      </main>
     

    </div>
  )
}

export default Finance
