import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ToastContainer } from "react-toastify";
import CompanyPayment from './components/Shared/shared-components/payments/otherPayments';


// Lazy loaded components
const Home = lazy(() => import("./components/Home"));
const Login = lazy(() => import('./components/Home/Login'));
const Inventory = lazy(() => import('./components/Shared/shared-components/inventory'));
const Sales = lazy(() => import("./components/Shared/shared-components/sales"));
const Purchase = lazy(() => import('./components/Shared/shared-components/purchase'));
const SupPayments = lazy(() => import('./components/Shared/shared-components/payments/supplierPayments'));
const Warehouse = lazy(() => import('./components/Shared/shared-components/warehousemanagement'));
const CusPayment = lazy(() => import('./components/Shared/shared-components/payments/customerPayments'));
const OtherPayments = lazy(() => import('./components/Shared/shared-components/payments/otherPayments'));
const DelPayment = lazy(() => import('./components/Shared/shared-components/payments/dealerPayment'));
const User = lazy(() => import('./components/User/index'));
const Admin = lazy(() => import('./components/Admin/index'));
const UserRegister = lazy(() => import("./components/Admin/User"));
const SupplierRegister = lazy(() => import("./components/Admin/Supplier"));
const CustomerRegister = lazy(() => import("./components/Admin/Customer"));
const DealerRegister = lazy(() => import("./components/Admin/Dealer"));
const CompanyRegister = lazy(() => import("./components/Admin/Company"));
const BrandingRegister = lazy(() => import("./components/Admin/Branding"));
const Currency = lazy(() => import('./components/Admin/Currency'));
const Category = lazy(() => import('./components/Admin/Category'));
const Stock = lazy(() => import('./components/Admin/Stock'));
const Products = lazy(() => import('./components/Admin/Products'));

const NotFound = lazy(() => import("./components/Home/pages/NotFound"));

function App() {
  return (
    <Provider store={store}>
      <ToastContainer position="top-center" autoClose={1500} newestOnTop closeOnClick pauseOnHover />
      <Router>
        {/* Suspense fallback shows while lazy components load */}
        <Suspense fallback={<div style={{textAlign:'center', marginTop:'50px'}}>Loading...</div>}>
          <Routes>
            {/* Home related routes */}
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/*' element={<NotFound />} />

            {/* User related routes */}
            <Route path='/inventory' element={<Inventory />} />
            <Route path='/purchase' element={<Purchase />} />
            <Route path='/sales' element={<Sales />} />
            {/* Payments routes */}
            <Route path='/supplierPayments' element={<SupPayments />} />
            <Route path='/customerPayments' element={<CusPayment />} />
            <Route path='/dealerPayments' element={<DelPayment />} />
            <Route path='/otherPayments' element={<OtherPayments />} />
            <Route path='/warehouse' element={<Warehouse />} />
            
            <Route path='/user' element={<User />} />
            <Route path='/admin' element={<Admin />} />

            {/* Admin related routes */}
            <Route path="/register" element={<UserRegister />} />
            <Route path="/customer" element={<CustomerRegister />} />
            <Route path="/supplier" element={<SupplierRegister />} />
            <Route path="/dealer" element={<DealerRegister />} />
            <Route path="/company" element={<CompanyRegister />} />
            <Route path="/currency" element={<Currency />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/product" element={<Products />} />
            <Route path="/branding" element={<BrandingRegister />} />
            <Route path="/category" element={<Category />} />
          </Routes>
        </Suspense>
      </Router>
    </Provider>
  );
}

export default App;
