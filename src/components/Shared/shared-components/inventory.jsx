import React, { useEffect, useMemo, useState } from 'react';
import { Card, Divider, Tabs, Button, Table, Tag } from "antd";
import UserLayout from '../UserLayout';
const logo = import.meta.env.VITE_LOGO_URL;
const branding = JSON.parse(localStorage.getItem("branding"))
import { fetchPurchase } from '../../../redux/slices/purchaseSlice';
import { fetchPayment } from '../../../redux/slices/paymentSlice';
import { fetchSales } from '../../../redux/slices/salesSlice';
import { fetchCompany } from '../../../redux/slices/companySlice'
import { fetchStock } from '../../../redux/slices/stockSlice'
import { fetchSuppleirs } from '../../../redux/slices/supplierSlice'
import { fetchCustomers } from '../../../redux/slices/customerSlice'
import { fetchDealer } from '../../../redux/slices/dealerSlice'
import { useSelector, useDispatch } from 'react-redux';
import { PrinterOutlined } from '@ant-design/icons';


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

  const [currentPage,setCurrentPage]=useState(1);
  const pageSize=5;


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

  const totalOtherPayments = allPayments
    .filter(payment => payment.entity?.toLowerCase() === 'other' &&
      payment.paymentType?.toLowerCase() != "cr")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const totalCompanyPayments = allPayments
    .filter(payment => payment.entity?.toLowerCase() != 'other' &&
      payment.paymentType?.toLowerCase() != "cr")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const totalReceived = allPayments
    .filter(payment => payment.paymentType?.toLowerCase() != 'dr')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);



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
        acc.totalPurchaseQty += Number(pur.quantity * pur.weight || 0);
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

    //total sales
    const { totalSalesQty, totalSalesCost } = (allSales || []).reduce(
      (acc, sale) => {
        acc.totalSalesQty += Number(sale.quantity * sale.weight || 0);
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
  // all accounts balance
  const allCompaniesBalance = useMemo(() => {
    if (!allCompanies?.length) return [];

    return allCompanies.map(company => {
      const totalSales = allSales
        .filter(s => s.companyId === company._id)
        .reduce((sum, s) => sum + Number(s.totalCost || 0), 0);

      const totalPurchases = allPurchases
        .filter(p => p.companyId === company._id)
        .reduce((sum, p) => sum + Number(p.totalCost || 0), 0);
      const { totalCr, totalDr } = allPayments
        .filter(p => p.companyId === company._id)
        .reduce(
          (acc, p) => {
            const amount = Number(p.amount || 0);
            if (p.paymentType?.toLowerCase() === "cr") acc.totalCr += amount;
            if (p.paymentType?.toLowerCase() === "dr") acc.totalDr += amount;
            return acc;
          },
          { totalCr: 0, totalDr: 0 }
        );

      const netPayments = totalCr - totalDr;
      const balance = netPayments - (totalSales - totalPurchases);

      return {
        key: company._id,
        companysName: company.fullname,
        accountNo: company.accountNo,
        mobile: company.mobile,
        balance,
      };
    });
  }, [allCompanies, allSales, allPurchases, allPayments]);


  //all customer balance
  const allCustomerBalance = useMemo(() => {
    if (!allCustomers?.length) return [];

    return allCustomers.map(customer => {
      const customerSales = allSales.filter(s => s.customerId === customer._id);
      const customerPayments = allPayments.filter(p => p.customerId === customer._id);

      const totalDebit =
        customerSales.reduce((sum, s) => sum + Number(s.totalCost || 0), 0) +
        customerPayments.reduce(
          (sum, p) => (p.paymentType?.toLowerCase() === "dr" ? sum + Number(p.amount || 0) : sum),
          0
        );

      const totalCredit = customerPayments.reduce(
        (sum, p) => (p.paymentType?.toLowerCase() === "cr" ? sum + Number(p.amount || 0) : sum),
        0
      );

      const balance = totalDebit - totalCredit;

      return {
        key: customer._id,
        customerName: customer.fullname,
        accountNo: customer.accountNo,
        mobile: customer.mobile,
        balance,
      };
    });
  }, [allCustomers, allSales, allPayments]);

  //all dealers balance
  const allDealersBalance = useMemo(() => {
    if (!allDealers?.length) return [];

    return allDealers.map(dealer => {
      const salesCommission = allSales
        .filter(s => s.dealerId === dealer._id)
        .reduce((sum, s) => sum + Number(s.totalComission || 0), 0);

      const purchaseCommission = allPurchases
        .filter(p => p.dealerId === dealer._id)
        .reduce((sum, p) => sum + Number(p.totalComission || 0), 0);

      const paidAmount = allPayments
        .filter(p => p.dealerId === dealer._id)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const balance = paidAmount - (salesCommission + purchaseCommission);

      return {
        key: dealer._id,
        dealerName: dealer.fullname,
        accountNo: dealer.accountNo,
        mobile: dealer.mobile,
        balance,
      };
    });
  }, [allDealers, allSales, allPurchases, allPayments]);


  //all dealers balance
  const allSupplierBalances = useMemo(() => {
    if (!allSuppliers || allSuppliers.length === 0) return [];

    return allSuppliers.map(supplier => {
      const supplierPurchases = allPurchases.filter(p => p.supplierId === supplier._id);
      const supplierPayments = allPayments.filter(p => p.supplierId === supplier._id);

      const totalCredit = supplierPayments.reduce(
        (sum, p) => (p.paymentType?.toLowerCase() === "dr" ? sum + Number(p.amount || 0) : sum),
        0
      );

      const totalDebit =
        supplierPurchases.reduce((sum, p) => sum + Number(p.totalCost || 0), 0) +
        supplierPayments.reduce(
          (sum, p) => (p.paymentType?.toLowerCase() === "cr" ? sum + Number(p.amount || 0) : sum),
          0
        );

      const balance = totalCredit - totalDebit;

      return {
        key: supplier._id,
        supplierName: supplier.fullname,
        accountNo: supplier.accountNo,
        mobile: supplier.mobile,
        balance,
      };
    });
  }, [allSuppliers, allPurchases, allPayments]);



  const handlePrintBalances = () => {
    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    // Base HTML structure
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>All Balances</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h2 { text-align: left; margin-bottom: 10px; font-size:16px; color:#75644c}
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { border: 1px solid #3e3a3aff; padding: 8px; }
    th { background-color: #f0f0f0; text-align: left; }
    td { text-align: right; }
    td.left { text-align: left; font-size: 14px; }
    td.positive { color: blue; font-weight: bold; }
    td.negative { color: red; font-weight: bold; }
  </style>
  <div style="text-align: center;">
    <h2 style="margin: 0; font-size: 16px; color: #023e8a;text-align: center">${branding[0].name}</h2>
    <p style="margin: 3px 0; font-size: 12px; color: #555;">${branding[0].address}</p>
    <p style="margin: 3px 0; font-size: 12px; color: #555;">${branding[0].mobile}</p>
    <a href="mailto:${branding[0].email}" style="font-size: 12px; color: #0077b6; text-decoration: none;">
      ${branding[0].email}
    </a>
    <hr/>
    <h3>All Balances</h3>
  </div>
</head>

<body>

${allCompaniesBalance.length ? `
<h2 >Companies Balance:</h2>
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Account No</th>
      <th>Mobile</th>
      <th>Balance</th>
    </tr>
  </thead>
  <tbody>
    ${allCompaniesBalance.map(c => `
      <tr>
        <td class="left">${c.companysName}</td>
        <td class="left">${c.accountNo || ""}</td>
        <td class="left">${c.mobile || ""}</td>
        <td class="${c.balance < 0 ? "negative" : "positive"}">
          ${c.balance.toFixed(2)} USD
        </td>
      </tr>
    `).join("")}
  </tbody>
</table>
` : ""}

${allCustomerBalance.length ? `
<h2>Customers Balance:</h2>
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Account No</th>
      <th>Mobile</th>
      <th>Balance</th>
    </tr>
  </thead>
  <tbody>
    ${allCustomerBalance.map(c => `
      <tr>
        <td class="left">${c.customerName}</td>
        <td class="left">${c.accountNo || ""}</td>
        <td class="left">${c.mobile || ""}</td>
        <td class="${c.balance < 0 ? "negative" : "positive"}">
          ${c.balance.toFixed(2)} USD
        </td>
      </tr>
    `).join("")}
  </tbody>
</table>
` : ""}

${allDealersBalance.length ? `
<h2>Dealers Balance:</h2>
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Account No</th>
      <th>Mobile</th>
      <th>Balance</th>
    </tr>
  </thead>
  <tbody>
    ${allDealersBalance.map(d => `
      <tr>
        <td class="left">${d.dealerName}</td>
        <td class="left">${d.accountNo || ""}</td>
        <td class="left">${d.mobile || ""}</td>
        <td class="${d.balance < 0 ? "negative" : "positive"}">
          ${d.balance.toFixed(2)} USD
        </td>
      </tr>
    `).join("")}
  </tbody>
</table>
` : ""}

${allSupplierBalances.length ? `
<h2>Suppliers Balance:</h2>
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Account No</th>
      <th>Mobile</th>
      <th>Balance</th>
    </tr>
  </thead>
  <tbody>
    ${allSupplierBalances.map(s => `
      <tr>
        <td class="left">${s.supplierName}</td>
        <td class="left">${s.accountNo || ""}</td>
        <td class="left">${s.mobile || ""}</td>
        <td class="${s.balance < 0 ? "negative" : "positive"}">
          ${s.balance.toFixed(2)} USD
        </td>
      </tr>
    `).join("")}
  </tbody>
</table>
` : ""}

</body>
</html>
`;

    newWindow.document.documentElement.innerHTML = html;
    // Force print after slight delay to ensure DOM is fully rendered
    setTimeout(() => {
      newWindow.focus();
      newWindow.print();
    }, 300); // 300ms delay usually works
  };

  const allAccountsBalance = [
    ...allCompaniesBalance.map(c => ({
      key: `company-${c._id || c.companysName}`,
      type: "Company",
      name: c.companysName,
      accountNo: c.accountNo,
      mobile: c.mobile,
      balance: c.balance,
    })),
    ...allCustomerBalance.map(c => ({
      key: `customer-${c._id || c.customerName}`,
      type: "Customer",
      name: c.customerName,
      accountNo: c.accountNo,
      mobile: c.mobile,
      balance: c.balance,
    })),
    ...allDealersBalance.map(d => ({
      key: `dealer-${d._id || d.dealerName}`,
      type: "Dealer",
      name: d.dealerName,
      accountNo: d.accountNo,
      mobile: d.mobile,
      balance: d.balance,
    })),
    ...allSupplierBalances.map(s => ({
      key: `supplier-${s._id || s.supplierName}`,
      type: "Supplier",
      name: s.supplierName,
      accountNo: s.accountNo,
      mobile: s.mobile,
      balance: s.balance,
    })),
  ];
  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      width: 120,
      render: type => {
        const colors = {
          Company: "blue",
          Customer: "green",
          Dealer: "orange",
          Supplier: "purple",
        };
        return <Tag color={colors[type]} className='!w-25'>{type}</Tag>;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      ellipsis: true,
    },
    {
      title: "Account No",
      dataIndex: "accountNo",
      width: 150,
      render: v => v || "—",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      width: 150,
      render: v => v || "—",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      width: 160,
      align: "right",
      render: balance => (
        <span
          style={{
            fontWeight: 600,
            color: balance < 0 ? "#cf1322" : "#0958d9",
          }}
        >
          {balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          USD
        </span>
      ),
    },
  ];

  
  return (
    <UserLayout>

      <div className="relative w-full md:w-full bg-orange-50 h-[95vh] ">
        <img src={logo} alt="Watermark" className="absolute inset-0 m-auto opacity-15 w-7/9 h-7/9 object-contain pointer-events-none" />


        <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 font-sans">
          {/* Header */}
          <header className="bg-white shadow-md py-6 px-8 mb-8 rounded-b-xl">
            <h1 className="md:text-4xl font-extrabold text-orange-600 tracking-tight">Company Analytics Dashboard</h1>

          </header>

         
          {/* Cards Grid */}
          <div className="px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dealer Card */}
            <Card
              className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-orange-400 via-red-400 to-orange-400"></div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Dealers:</h2>
              </div>


              <div className="space-y-2">
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Dealers:{" "}
                  <span className="text-blue-500 font-bold text-[12px] md:text-xl">{dealerNo}</span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Comission + Adv:{" "}
                  <span
                    className={
                      dealerComission <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-orange-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {dealerComission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Paid to Dealers:{" "}
                  <span
                    className={
                      dealerPayment <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-green-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {dealerPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Dealers Balance:{" "}
                  <span
                    className={
                      dealerBalance <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-green-500 font-bold text-[12px] md:text-xl"
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
              className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
            >
              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-orange-400 via-red-400 to-orange-400"></div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Suppliers:</h2>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Suppliers:{" "}
                  <span className="text-blue-500 font-bold text-[12px] md:text-xl">{supplierNo}</span>
                </p>

                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Purchase Qty:{" "}
                  <span
                    className={
                      myPurchaseQty <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-blue-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    {(myPurchaseQty / 1000).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tons

                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Purchase + Adv:{" "}
                  <span
                    className={
                      myPurchase <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-orange-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {myPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Payment Amt:{" "}
                  <span
                    className={
                      sPayment <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-blue-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {sPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Supplier Balance:{" "}
                  <span
                    className={
                      supplierBalance <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-green-500 font-bold text-[12px] md:text-xl"
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
              className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-orange-400 via-red-400 to-orange-400"></div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Customers:</h2>
              </div>


              <div className="space-y-2">
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Customers:{" "}
                  <span className="text-blue-500 font-bold text-[12px] md:text-xl">{customerNo}</span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Sales Qty:{" "}
                  <span
                    className={
                      mySalesQty <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-blue-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    {(mySalesQty / 1000).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} Tons

                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Sales + Adv:{" "}
                  <span
                    className={
                      mySales <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-orange-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {mySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Received Amt:{" "}
                  <span
                    className={
                      cPayment <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-blue-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {cPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Customers Bal:{" "}
                  <span
                    className={
                      customerBalance <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-green-500 font-bold text-[12px] md:text-xl"
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
              className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
            >
              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-orange-400 via-red-400 to-orange-400"></div>
              <div className="relative z-10">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Company Balance:</h2>
                </div>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Company: <span className="text-blue-500 font-bold text-[12px] md:text-xl">{companyNo}</span>
                </p>


                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Payable: <span className="text-red-500 font-bold text-[12px] md:text-xl"> $ {myPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Receivable: <span className="text-green-500 font-bold text-[12px] md:text-xl"> $ {myReceivable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
              </div>

              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-8 translate-y-8"></div>
            </Card>

            {/* Payment Card */}
            <Card
              className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-orange-400 via-red-400 to-orange-400"></div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Payments:</h2>
              </div>


              <div className="space-y-2">

                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Other Payments:{" "}
                  <span
                    className={
                      totalOtherPayments <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-blue-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {totalOtherPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Co Payments:{" "}
                  <span
                    className={
                      totalCompanyPayments <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-blue-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {totalCompanyPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Rcvd:{" "}
                  <span
                    className={
                      totalCompanyPayments <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-green-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
              </div>

              {/* Background accent */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-8 translate-y-8"></div>
            </Card>

            {/* Gross Margin Card */}
            <Card
              className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-orange-400 via-red-400 to-orange-400"></div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Summary:</h2>
              </div>


              <div className="space-y-2">

                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Purchase + Adv:{" "}
                  <span
                    className={
                      myPurchase <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-orange-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {myPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Sales Amt + Adv:{" "}
                  <span
                    className={
                      customerBalance <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-green-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {customerBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Comission + Adv:{" "}
                  <span
                    className={
                      dealerComission <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-orange-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    $ {dealerComission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-xl text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Current availible Stock:{" "}
                  <span
                    className={
                      totalStock <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-xl"
                        : "text-orange-500 font-bold text-[12px] md:text-xl"
                    }
                  >
                    {(totalStock / 1000).toLocaleString(undefined, {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })} tons
                  </span>
                </p>
              </div>


              {/* Background accent */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-8 translate-y-8"></div>
            </Card>

          </div>
          <div className='px-8 mt-4'>
            <Table
              columns={columns}
              dataSource={allAccountsBalance}
              bordered
              size="large"
             pagination={{
              pageSize: 8,
              align:"center"
             }}
              title={() => (
                <div className='text-xl font-bold text-red-700 p-4 bg-orange-200 flex justify-between '>
                  All Accounts Balance
                   
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={handlePrintBalances}
              className='!bg-zinc-700 hover:!bg-green-500 !text-white !shadow-lg !font-semibold '
            >
              Print All Accouns Balances
            </Button>
         
                </div>
              )}
            />
          </div>
        </div>

      </div>
    </UserLayout>
  )
}

export default Inventory