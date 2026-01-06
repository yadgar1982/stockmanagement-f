import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ConfigProvider,Spin } from "antd";
import { store } from "./redux/store";
import ProtectedRoute from "./components/Modules/ProtectedRoutes";



const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("antd: compatible")) {
    return; // ignore AntD version warning
  }
  originalWarn(...args);
};




// Lazy components
const Home = lazy(() => import("./components/Home"));
const About = lazy(() => import("./components/Home/about"));
const Contact = lazy(() => import("./components/Home/contact"));
const Login = lazy(() => import("./components/Home/Login"));
const User = lazy(() => import("./components/User/index"));
const NotFound = lazy(() => import("./components/Home/pages/NotFound"));

const Inventory = lazy(() => import("./components/Shared/shared-components/inventory"));
const Purchase = lazy(() => import("./components/Shared/shared-components/purchase"));
const Sales = lazy(() => import("./components/Shared/shared-components/sales"));
const Warehouse = lazy(() => import("./components/Shared/shared-components/warehousemanagement"));

const SupPayments = lazy(() => import("./components/Shared/shared-components/payments/supplierPayments"));
const CusPayment = lazy(() => import("./components/Shared/shared-components/payments/customerPayments"));
const DelPayment = lazy(() => import("./components/Shared/shared-components/payments/dealerPayment"));
const OtherPayments = lazy(() => import("./components/Shared/shared-components/payments/otherPayments"));
const CompanyPayments = lazy(() => import("./components/Shared/shared-components/payments/companyPayments"));


const Admin = lazy(() => import("./components/Admin"));

const UserRegister = lazy(() => import("./components/Admin/User"));
const SupplierRegister = lazy(() => import("./components/Admin/Supplier"));
const CustomerRegister = lazy(() => import("./components/Admin/Customer"));
const DealerRegister = lazy(() => import("./components/Admin/Dealer"));
const CompanyRegister = lazy(() => import("./components/Admin/Company"));
const BrandingRegister = lazy(() => import("./components/Admin/Branding"));
const Currency = lazy(() => import("./components/Admin/Currency"));
const Category = lazy(() => import("./components/Admin/Category"));
const Stock = lazy(() => import("./components/Admin/Stock"));
const Products = lazy(() => import("./components/Admin/Products"));

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider warning={() => null}>
        <ToastContainer position="top-center" autoClose={1500} />
      <Router>
        <Suspense  fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    }>
          <Routes>
            
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />

            {/* User */}
            <Route path="/inventory" element={<ProtectedRoute role="user"><Inventory /></ProtectedRoute>} />
            <Route path="/user" element={<ProtectedRoute role="user"><User /></ProtectedRoute>} />
            <Route path="/purchase" element={<ProtectedRoute role="user"><Purchase /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute role="user"><Sales /></ProtectedRoute>} />
            <Route path="/warehouse" element={<ProtectedRoute role="user"><Warehouse /></ProtectedRoute>} />
            <Route path="/supplierPayments" element={<ProtectedRoute role="user"><SupPayments /></ProtectedRoute>} />
            <Route path="/customerPayments" element={<ProtectedRoute role="user"><CusPayment /></ProtectedRoute>} />
            <Route path="/dealerPayments" element={<ProtectedRoute role="user"><DelPayment /></ProtectedRoute>} />
            <Route path="/companyPayments" element={<ProtectedRoute role="user"><CompanyPayments /></ProtectedRoute>} />
            <Route path="/otherPayments" element={<ProtectedRoute role="user"><OtherPayments /></ProtectedRoute>} />

            

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
            <Route path="/register" element={<ProtectedRoute role="admin"><UserRegister /></ProtectedRoute>} />
            <Route path="/supplier" element={<ProtectedRoute role="admin"><SupplierRegister /></ProtectedRoute>} />
            <Route path="/customer" element={<ProtectedRoute role="admin"><CustomerRegister /></ProtectedRoute>} />
            <Route path="/dealer" element={<ProtectedRoute role="admin"><DealerRegister /></ProtectedRoute>} />
            <Route path="/company" element={<ProtectedRoute role="admin"><CompanyRegister /></ProtectedRoute>} />
            <Route path="/branding" element={<ProtectedRoute role="admin"><BrandingRegister /></ProtectedRoute>} />
            <Route path="/currency" element={<ProtectedRoute role="admin"><Currency /></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute role="admin"><Stock /></ProtectedRoute>} />
            <Route path="/product" element={<ProtectedRoute role="admin"><Products /></ProtectedRoute>} />
            <Route path="/category" element={<ProtectedRoute role="admin"><Category /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

        </Suspense>
      </Router>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
