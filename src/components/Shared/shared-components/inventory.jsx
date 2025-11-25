import React, { useEffect, useState } from 'react';
import { Card, Divider, Tabs } from "antd";
import UserLayout from '../UserLayout';
const logo = import.meta.env.VITE_LOGO_URL;

import { fetchPurchase } from '../../../redux/slices/purchaseSlice';
import { fetchPayment } from '../../../redux/slices/paymentSlice';
import { fetchSales } from '../../../redux/slices/salesSlice';
import { fetchCompany } from '../../../redux/slices/companySlice'
import { fetchStock } from '../../../redux/slices/stockSlice'
import { fetchSuppleirs } from '../../../redux/slices/supplierSlice'
import { fetchCustomers } from '../../../redux/slices/customerSlice'
import { fetchDealer } from '../../../redux/slices/dealerSlice'
import { useSelector, useDispatch } from 'react-redux';

const Inventory = () => {
  const dispatch = useDispatch()
  const [dealer, setDealer] = useState([]);
  const [dealerNo, setDealerNo] = useState(null)
  const [dealerBalance, setDealerBalance] = useState(0)

  const [mySales, setMySales] = useState([])
  const [myPurchase, setMyPurchase] = useState([])
  const [myPyments, setMypayments] = useState([])

  const { dealers } = useSelector(state => state.dealers)
  const allDealers = dealers?.data || [];

  const { purchase: purchases } = useSelector(state => state.purchase)
  const allPurchases = purchases || [];

  const { sale } = useSelector(state => state.sale);
  const allSales = sale || [];
  const { payment: payments } = useSelector(state => state.payments);
  const allPayments = payments || [];
  const { stocks } = useSelector(state => state.stocks);
  const allStocks = stocks?.data || [];



  useEffect(() => {
    setDealer(allDealers);
    setDealerNo(dealer.length)

    setMySales(allSales);
    setMyPurchase(allPurchases)
    setMypayments(payments)

    //dealer total balance calculation
    const totalComSale = allSales.reduce(
      (sum, sale) => sum + (sale.totalComission || 0),
      0
    );
    const totalComPur = allPurchases.reduce(
      (sum, sale) => sum + (sale.totalComission || 0),
      0
    );

    const credit = totalComSale + totalComPur;
    const debit = allPayments
      .filter(payment => payment.entity === "dealer")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const dealer_bal = credit - debit
    setDealerBalance(dealer_bal)

    //end  of dealer total balance calculation


  }, [dealer, sale, purchases, payments]);



  useEffect(() => {
    dispatch(fetchCompany())
    dispatch(fetchCustomers())
    dispatch(fetchDealer())
    dispatch(fetchPayment())
    dispatch(fetchSuppleirs())
    dispatch(fetchStock())
    dispatch(fetchSales())
    dispatch(fetchPurchase())
  }, []);

  return (
    <UserLayout>

      <div className="relative w-full md:w-full bg-orange-50 h-[95vh] ">
        <img src={logo} alt="Watermark" className="absolute inset-0 m-auto opacity-15 w-7/9 h-7/9 object-contain pointer-events-none" />
        <h1 className='p-4 md:text-xl text-blue-500 -mb-6 font-semibold '>Outstading Figures:</h1>
        <Divider />

        <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 font-sans">
          {/* Header */}
          <header className="bg-white shadow-md py-6 px-8 mb-8 rounded-b-xl">
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Company Analytics Dashboard</h1>
            <p className="text-gray-500 mt-2 text-lg text-zinc-500 font-bold">Overview of dealers, customers, suppliers, warehouses, and company balance.</p>
          </header>

          {/* Cards Grid */}
          <div className="px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

            {/* Dealers Card */}
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-8 border-blue-500">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Dealers</h2>
                <p className="text-gray-600 mb-2">
                  Total Dealers: <span className="text-blue-500 font-bold text-xl">{dealerNo}</span>
                </p>
                <p className="text-gray-600">
                  Total Dealers Balance: <span className={dealerBalance <= 0 ? "text-red-500 font-bold" : "text-blue-500 font-bold"}>
                    $ {dealerBalance.toLocaleString()}
                  </span>
                </p>
              </div>
            </Card>

            {/* Customers Card */}
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-8 border-purple-500">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Customers</h2>
                <p className="text-gray-600 mb-2">
                  Total Customers: <span className="text-blue-500 font-bold text-xl">{dealerNo}</span>
                </p>
                <p className="text-gray-600">
                  Total Customer Balance: <span className={dealerBalance <= 0 ? "text-red-500 font-bold" : "text-blue-500 font-bold"}>
                    $ {dealerBalance.toLocaleString()}
                  </span>
                </p>
              </div>
            </Card>

            {/* Suppliers Card */}
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-8 border-green-500">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Suppliers</h2>
                <p className="text-gray-600 mb-2">
                  Total Suppliers: <span className="text-blue-500 font-bold text-xl">{dealerNo}</span>
                </p>
                <p className="text-gray-600">
                  Total Suppliers Balance: <span className={dealerBalance <= 0 ? "text-red-500 font-bold" : "text-blue-500 font-bold"}>
                    $ {dealerBalance.toLocaleString()}
                  </span>
                </p>
              </div>
            </Card>

            {/* Warehouses Card */}
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-8 border-yellow-500">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Warehouses</h2>
                <p className="text-gray-600 mb-2">
                  Total Warehouses: <span className="text-blue-500 font-bold text-xl">{dealerNo}</span>
                </p>
                <p className="text-gray-600">
                  Total Suppliers Balance: <span className={dealerBalance <= 0 ? "text-red-500 font-bold" : "text-blue-500 font-bold"}>
                    $ {dealerBalance.toLocaleString()}
                  </span>
                </p>
              </div>
            </Card>

            {/* Company Balance Card */}
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-8 border-indigo-500">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Company Balance</h2>
                <p className="text-gray-600 mb-1">
                  Total Purchase: <span className="text-blue-500 font-bold text-xl">{dealerNo}</span>
                </p>
                <p className="text-gray-600 mb-1">
                  Total Sales: <span className="text-blue-500 font-bold text-xl">{dealerNo}</span>
                </p>
                <p className="text-gray-600 mb-1">
                  Total Payments: <span className="text-blue-500 font-bold text-xl">{dealerNo}</span>
                </p>
                <p className="text-gray-600 mb-1">
                  Total Asset: <span className="text-blue-500 font-bold text-xl">{dealerNo}</span>
                </p>
                <p className="text-gray-600">
                  Current Balance: <span className={dealerBalance <= 0 ? "text-red-500 font-bold" : "text-blue-500 font-bold"}>
                    $ {dealerBalance.toLocaleString()}
                  </span>
                </p>
              </div>
            </Card>

          </div>
        </div>



        <h1 className='p-4 md:text-xl text-blue-500 -mb-6 font-semibold '>Analysis:</h1>
        <Divider />
        <div className=' bg-zinc-100 '>

        </div>

      </div>
    </UserLayout>
  )
}

export default Inventory