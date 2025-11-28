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
import { AccountBookOutlined } from '@ant-design/icons';

const Inventory = () => {
  const dispatch = useDispatch()
  const [dealer, setDealer] = useState([]);
  const [dealerNo, setDealerNo] = useState(0)
  const [dealerComission, setDealerComission] = useState(0)
  const [dealerPayment, setDealerPayment] = useState(0)
  const [dealerBalance, setDealerBalance] = useState(0)
  const [totalStock, setTotalStock] = useState(0)

  const [supplier, setSupplier] = useState([]);
  const [supplierNo, setSupplierNo] = useState(0)
  const [sPayment, setSpayment] = useState(0)
  const [supplierBalance, setSupplierBalance] = useState(0)

  const [customer, setCustomer] = useState([]);
  const [customerNo, setCustomerNo] = useState(0)
  const [cPayment, setCPayment] = useState(0)
  const [customerBalance, setCustomerBalance] = useState(0)

  const [company, setCompany] = useState([]);
  const [companyNo, setCompanyNo] = useState(0)
  const [coPayment, setCoPayment] = useState(0)
  const [companyBalance, setCompanyBalance] = useState(0)


  const [mySales, setMySales] = useState([])
  const [mySalesQty, setMySalesQty] = useState([])
  const [myPurchase, setMyPurchase] = useState([])
  const [myPurchaseQty, setMyPurchaseQty] = useState([])
  const [myPayable, setMyPayable] = useState([])
  const [myReceivable, setMyReceivable] = useState([])

  const { dealers } = useSelector(state => state.dealers)
  const allDealers = dealers?.data || [];

  const { suppliers } = useSelector(state => state.suppliers)
  const allSuppliers = suppliers?.data || [];

  const { customers } = useSelector(state => state.customers)
  const allCustomers = customers?.data || [];

  const { companys } = useSelector(state => state.company)
  const allCompanies = companys?.data || [];

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
    setDealerNo(dealer.length);

    setSupplier(allSuppliers);
    setSupplierNo(supplier.length);

    setCustomer(allCustomers);
    setCustomerNo(customer.length);

    setCompany(allCompanies);
    setCompanyNo(customer.length);


    //dealer total balance calculation
    const totalComSale = allSales.reduce(
      (sum, sale) => sum + (sale.totalComission || 0),
      0
    );

    const totalComPur = allPurchases.reduce(
      (sum, purchase) => sum + (purchase.totalComission || 0),
      0
    );

    const dadvance = allPayments
      .filter(payment => payment.entity === "dealer" && payment?.paymentType === "cr")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const credit = Number(totalComSale) + Number(totalComPur) + Number(dadvance);
    setDealerComission(credit)
    const debit = allPayments
      .filter(payment => payment.entity === "dealer" && payment?.paymentType === "dr")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    setDealerPayment(debit)
    const dealer_bal = debit - credit
    setDealerBalance(dealer_bal)

    //supplier total balance calculation
    const scredit = allPurchases.reduce(
      (sum, purchase) => sum + (purchase.totalCost || 0), 0);

    //total purchae
    const { totalPurchaseQty, totalPurchaseCost } = (allPurchases || []).reduce(
      (acc, pur) => {
        acc.totalPurchaseQty += Number(pur.quantity || 0);
        acc.totalPurchaseCost += Number(pur.totalCost || 0);
        return acc;
      },
      { totalPurchaseQty: 0, totalPurchaseCost: 0 }
    );

    const sCrpayment = allPayments
      .filter(payment => payment?.entity === "supplier" && payment?.paymentType === "cr")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const totalSupplierCr = Number(totalPurchaseCost) + Number(sCrpayment)
    setMyPurchaseQty(totalPurchaseQty)
    setMyPurchase(totalSupplierCr)

    const sdebit = allPayments
      .filter(payment => payment?.entity === "supplier" && payment?.paymentType === "dr")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const supplier_bal = sdebit - scredit
    setSupplierBalance(supplier_bal)
    setSpayment(sdebit)

    
    //Customer total balance calculation
    const cCredit = allSales.reduce(
      (sum, sale) => sum + (sale.totalCost || 0), 0);

    //total sales
    const { totalSalesQty, totalSalesCost } = (allSales || []).reduce(
      (acc, sale) => {
        acc.totalSalesQty += Number(sale.quantity || 0);
        acc.totalSalesCost += Number(sale.totalCost || 0);
        return acc;
      },
      { totalSalesQty: 0, totalSalesCost: 0 }
    );

    const cusPayCredit = allPayments
      .filter(payment => payment.entity === "customer" && payment?.paymentType === "dr")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalCusCredit = Number(cusPayCredit) + Number(totalSalesCost)
    setMySalesQty(totalSalesQty)
    setMySales(totalCusCredit)

    const cDebit = allPayments
      .filter(payment => payment.entity === "customer" && payment?.paymentType === "cr")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const customer_bal = totalCusCredit - cDebit
    setCustomerBalance(customer_bal)
    setCPayment(cDebit)

    //stock balance:
    const stk = Number(myPurchaseQty) - Number(mySalesQty)
    setTotalStock(stk)


    // company total balance calculation
    const totalCredit = allSales.reduce(
      (sum, sale) => sum + (sale.totalCost || 0), 0);

    // all payments apart from purchae
    const debita = allPayments
      .filter(payment => payment.entity != "customer")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // purchase amounts
    const debitb = allPurchases.reduce(
      (sum, purchase) => sum + (purchase.totalCost || 0), 0);

    const totalDebit = Number(debita) + Number(debitb);

    const finalCredit = Number(totalCredit)
    const companyBal = totalDebit - finalCredit - dealerBalance;
    setCompanyBalance(Number(companyBal.toFixed(2)));

    const balances = {
      customer: Number(customerBalance),
      supplier: Number(supplierBalance),
      dealer: Number(dealerBalance),
    };


    // Initialize receivables and payables
    let receivables = 0;
    let payables = 0;

    // Check each balance
    Object.values(balances).forEach(balance => {
      if (balance > 0) {
        receivables += balance; // positive -> receivable
      } else if (balance < 0) {
        payables += Math.abs(balance); // negative -> payable
      }
    });

    // Set state (rounded to 2 decimals)
    setMyReceivable(Number(receivables.toFixed(2)));
    setMyPayable(Number(payables.toFixed(2)));

    //payments calcualtion:


  }, [dealer, sale, purchases, payments, customers, supplier, companys]);



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

        <Divider />

        <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 font-sans">
          {/* Header */}
          <header className="bg-white shadow-md py-6 px-8 mb-8 rounded-b-xl">
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Company Analytics Dashboard</h1>
            <p className="text-gray-500 mt-2 text-lg text-zinc-500 font-bold">Overview of dealers, customers, suppliers, warehouses, and company balance.</p>
          </header>

          {/* Cards Grid */}
          <div className="px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dealer Card */}
            <Card
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300"></div>

              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Dealers:</h2>
              </div>


              <div className="space-y-2">
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Dealers:{" "}
                  <span className="text-blue-500 font-bold text-xl">{dealerNo}</span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Comission + Adv:{" "}
                  <span
                    className={
                      dealerComission <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-orange-500 font-bold text-xl"
                    }
                  >
                    $ {dealerComission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Paid to Dealers:{" "}
                  <span
                    className={
                      dealerPayment <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-green-500 font-bold text-xl"
                    }
                  >
                    $ {dealerPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Dealers Balance:{" "}
                  <span
                    className={
                      dealerBalance <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-green-500 font-bold text-xl"
                    }
                  >
                    $ {dealerBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
              </div>

              {/* Background accent */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-8 translate-y-8"></div>
            </Card>

            {/* Supplier Card */}
            <Card
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6"
            >
              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300"></div>

              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Suppliers:</h2>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Suppliers:{" "}
                  <span className="text-blue-500 font-bold text-xl">{supplierNo}</span>
                </p>

                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Purchase Qty:{" "}
                  <span
                    className={
                      myPurchaseQty <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-blue-500 font-bold text-xl"
                    }
                  >
                    $ {myPurchaseQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Purchase + Adv:{" "}
                  <span
                    className={
                      myPurchase <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-orange-500 font-bold text-xl"
                    }
                  >
                    $ {myPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Payment Amt:{" "}
                  <span
                    className={
                      sPayment <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-blue-500 font-bold text-xl"
                    }
                  >
                    $ {sPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Supplier Balance:{" "}
                  <span
                    className={
                      supplierBalance <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-green-500 font-bold text-xl"
                    }
                  >
                    $ {supplierBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
              </div>

              {/* Background accent */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-8 translate-y-8"></div>
            </Card>
            {/* Customer Card */}
            <Card
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300"></div>

              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Customers:</h2>
              </div>


              <div className="space-y-2">
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Customers:{" "}
                  <span className="text-blue-500 font-bold text-xl">{customerNo}</span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Sales Qty:{" "}
                  <span
                    className={
                      mySalesQty <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-blue-500 font-bold text-xl"
                    }
                  >
                    $ {mySalesQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Sales + Adv:{" "}
                  <span
                    className={
                      mySales <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-orange-500 font-bold text-xl"
                    }
                  >
                    $ {mySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Received Amt:{" "}
                  <span
                    className={
                      cPayment <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-blue-500 font-bold text-xl"
                    }
                  >
                    $ {cPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Customers Bal:{" "}
                  <span
                    className={
                      customerBalance <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-green-500 font-bold text-xl"
                    }
                  >
                    $ {customerBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
              </div>

              {/* Background accent */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-8 translate-y-8"></div>
            </Card>
            {/* Company Balance Card */}
            <Card
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6"
            >
              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300"></div>
              <div className="relative z-10">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Company Balance:</h2>
                </div>
                <p className="text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Company: <span className="text-blue-500 font-bold text-xl">{companyNo}</span>
                </p>


                <p className="text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Payable: <span className="text-red-500 font-bold text-xl"> $ {myPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
                <p className="text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Receivable: <span className="text-green-500 font-bold text-xl"> $ {myReceivable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
              </div>

              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-8 translate-y-8"></div>
            </Card>

            {/* Payment Card */}
            <Card
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300"></div>

              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Payments:</h2>
              </div>


              <div className="space-y-2">

                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Received Amt:{" "}
                  <span
                    className={
                      cPayment <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-blue-500 font-bold text-xl"
                    }
                  >
                    $ {cPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Customers Bal:{" "}
                  <span
                    className={
                      customerBalance <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-green-500 font-bold text-xl"
                    }
                  >
                    $ {customerBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
              </div>

              {/* Background accent */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-8 translate-y-8"></div>
            </Card>

            {/* Gross Margin Card */}
            <Card
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300"></div>

              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Gross Margin:</h2>
              </div>


              <div className="space-y-2">

                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Purchase + Adv:{" "}
                  <span
                    className={
                      myPurchase <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-orange-500 font-bold text-xl"
                    }
                  >
                    $ {myPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Sales Amt:{" "}
                  <span
                    className={
                      customerBalance <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-green-500 font-bold text-xl"
                    }
                  >
                    $ {customerBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Comission + Adv:{" "}
                  <span
                    className={
                      dealerComission <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-orange-500 font-bold text-xl"
                    }
                  >
                    $ {dealerComission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-lg text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Current availible Stock:{" "}
                  <span
                    className={
                      totalStock <= 0
                        ? "text-red-500 font-bold text-xl"
                        : "text-orange-500 font-bold text-xl"
                    }
                  >
                    {totalStock.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
              </div>


              {/* Background accent */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-8 translate-y-8"></div>
            </Card>

          </div>
        </div>

      </div>
    </UserLayout>
  )
}

export default Inventory