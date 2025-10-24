import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from "./components/Home"
import Inventory from './components/Home/pages/inventory';
import Sales from "./components/Home/pages/sales";
import Purchase from './components/Home/pages/purchase';
import User from './components/Home/User';
import Admin from './components/Home/Admin';
import Login from './components/Home/Login';
import UserRegister from "./components/Admin/User";
import SupplierRegister from "./components/Admin/Supplier";
import CustomerRegister from "./components/Admin/Customer";
import DealerRegister from "./components/Admin/Dealer";
import CompanyRegister from "./components/Admin/Company";
import BrandingRegister from "./components/Admin/Branding";
import Currency from './components/Admin/Currency';
import Stock from './components/Admin/Stock';
import Products from './components/Admin/Products';
import NotFound from "./components/Home/pages/NotFound";

import "react-toastify/dist/ReactToastify.css";
import React from 'react'
import {Provider} from "react-redux";
import {store}from "./redux/store";

function App() {


  return (
   <Provider store={store}>
     <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/*' element={<NotFound />} />


        {/* user related routes */}
        <Route path='/inventory' element={<Inventory />} />
        <Route path='/purchase' element={<Purchase />} />
        <Route path='/sales' element={<Sales />} />
        <Route path='/user' element={<User />} />
        <Route path='/admin' element={<Admin />} />

        {/* Admin Related Route */}
        <Route path="/register" element={<UserRegister/>}></Route>
        <Route path="/customer" element={<CustomerRegister/>}></Route>
        <Route path="/supplier" element={<SupplierRegister/>}></Route>
        <Route path="/dealer" element={<DealerRegister/>}></Route>
        <Route path="/company" element={<CompanyRegister/>}></Route>
        <Route path="/currency" element={<Currency/>}></Route>
        <Route path="/stock" element={<Stock/>}></Route>
        <Route path="/product" element={<Products/>}></Route>
        <Route path="/branding" element={<BrandingRegister/>}></Route>
      </Routes>

    </Router>
   </Provider>
  )
}

export default App
