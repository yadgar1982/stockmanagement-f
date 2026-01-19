import React, { useEffect, useMemo, useState } from 'react';
import { Card, Divider, Tabs, Button, Table, Tag, Tooltip, Select } from "antd";
import UserLayout from '../Shared/AdminLayout';
const logo = import.meta.env.VITE_LOGO_URL;
const branding = JSON.parse(localStorage.getItem("branding"))
import { fetchPurchase } from '../../redux/slices/purchaseSlice';
import { fetchPayment } from '../../redux/slices/paymentSlice';
import { fetchSales } from '../../redux/slices/salesSlice';
import { fetchCompany } from '../../redux/slices/companySlice'
import { fetchStock } from '../../redux/slices/stockSlice'
import { fetchSuppleirs } from '../../redux/slices/supplierSlice'
import { fetchCustomers } from '../../redux/slices/customerSlice'
import { fetchDealer } from '../../redux/slices/dealerSlice'
import { fetchProducts } from '../../redux/slices/productSlice';
import { useSelector, useDispatch } from 'react-redux';
import { FileExcelOutlined, PrinterOutlined } from '@ant-design/icons';
import ExchangeCalculator from '../Shared/shared-components/exchangeCalc';
import useSWR, { mutate } from "swr";
import { fetcher } from "../Modules/http";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  const [companyBalance, setCompanyBalance] = useState(0)


  const [mySales, setMySales] = useState([])
  const [mySalesQty, setMySalesQty] = useState([])
  const [myPurchase, setMyPurchase] = useState([])
  const [myPurchaseQty, setMyPurchaseQty] = useState([])
  const [myPayable, setMyPayable] = useState([])
  const [myReceivable, setMyReceivable] = useState([])



  const [productQty, setProductQty] = useState(null);
  const [productPurchaseQty, setProductPurchaseQty] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [productUnit, setProductUnit] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [totalPurchase, setTotalPurchase] = useState([])

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


  const { products, prloading, prerror } = useSelector((state) => state.products);
  const allProducts = products?.data || [];
  const product = allProducts.map((item) => ({
    productName: item.productName,
    productId: item._id,
  }));
  const productOptions = product.map((p) => ({
    label: p.productName,
    value: p.productId,
  }));

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
      (sum, sale) => sum + (sale?.totalComission || 0),
      0
    );

    const totalComPur = allPurchases.reduce(
      (sum, purchase) => sum + (purchase?.totalComission || 0),
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
        acc.totalPurchaseQty += Number(pur?.quantity * pur?.weight || 0);
        acc.totalPurchaseCost += Number(pur?.totalCost || 0);
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


  //fetch purchase all data
  const { data: purchaseData, error: pError } = useSWR("/api/purchase/get", fetcher);

  useEffect(() => {
    if (purchaseData && purchaseData?.data) {
      setTotalPurchase(purchaseData?.data);
    }
  }, [purchaseData])

  //fetch sales all data
  const { data: sales, error: saError } = useSWR("/api/sale/get", fetcher);

  useEffect(() => {
    if (sales && sales?.data) {
      setSalesData(sales?.data || null);
    }
  }, [sales])

  const handleProductChange = (value) => {
    setSelectedProduct(value);

    // Handle purchase quantities

    if (Array.isArray(allPurchases)) {
      const filteredPurchase = allPurchases.filter((p) => p.productId === value);

      const calculatedQty = filteredPurchase.reduce((sum, item) => sum + (item.weight) * (item.quantity), 0);
      const unit = filteredPurchase.length > 0 ? filteredPurchase[0].unit : null;
      const sprice = selectedProduct.salePrice;

      setProductUnit(unit);
      setProductPurchaseQty(calculatedQty);
    }
    if (Array.isArray(salesData)) {
      const filteredSales = allSales.filter((p) => p.productId === value);
      const calculatedSaleQty = filteredSales.reduce((total, item) => total + (item?.weight) * (item?.quantity), 0);
      const unit = filteredSales.length > 0 ? filteredSales[0].unit : null;

      setProductUnit(unit);
      setProductQty(calculatedSaleQty)
    }
    else {
      setProductQty(null);
      setProductPurchaseQty(null);
    }


  };



  useEffect(() => {
    dispatch(fetchCompany())
    dispatch(fetchCustomers())
    dispatch(fetchDealer())
    dispatch(fetchPayment())
    dispatch(fetchSuppleirs())
    dispatch(fetchStock())
    dispatch(fetchSales())
    dispatch(fetchPurchase())
    dispatch(fetchProducts())
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

  //export to excel
  const exportSales = (allSales) => {
    if (!allSales || allSales.length === 0) return;

    // Map Redux data to Excel rows
    const data = allSales.map((sale) => ({
      "Sales Date": sale.salesDate
        ? new Date(sale.salesDate).toLocaleDateString()
        : "",
      "Invoice No": sale.invoiceNo || "",
      "Product": sale.productName || "",
      "Category": sale.categoryName || "",
      "Quantity": sale.quantity || 0,
      "Unit": sale.unit || "",
      "Weight": sale.weight || 0,
      "Customer": sale.customerName || "",
      "Company": sale.companyName || "",
      "Warehouse": sale.warehouseName || "",
      "Unit Cost": sale.unitCost || 0,
      "Exchanged Amt": sale.exchangedAmt || 0,
      "Total Cost": sale.totalCost || 0,
      "Local Total": sale.totalLocalCost || 0,
      "Currency": sale.currency || "USD",
      "Commission": sale.totalComission || 0,
      "Dealer": sale.dealerName || "",
      "Country": sale.countryName || "",
      "Batch": sale.batch || "",
      "Created At": sale.createdAt
        ? new Date(sale.createdAt).toLocaleDateString()
        : "",
      "User Name": sale.userName || "",
      "Description": sale.description || "",
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, { origin: 3 });
    const colCount = Object.keys(data[0] || {}).length;

    // Add heading manually
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [`Sales Report`],
        [`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
        [] // empty row before table
      ],
      { origin: "A1" }
    );

    // Merge first row across all columns for the title
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }
    ];

    // Set column widths for readability
    worksheet["!cols"] = [
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 12 },
      { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
      { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 18 },
      { wch: 15 }, { wch: 30 }
    ];

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save
    saveAs(file, "SalesReport.xlsx");
  };

  const exportPurchase = (allPurchases) => {
    if (!allPurchases || allPurchases.length === 0) return;

    // Map Redux data to Excel rows
    const data = allPurchases.map((p) => ({
      "Purchase Date": p.purchaseDate
        ? new Date(p.purchaseDate).toLocaleDateString()
        : "",
      "Order No": p.orderNo || "",
      "Product": p.productName || "",
      "Category": p.categoryName || "",
      "Description": p.description || "",
      "Quantity": p.quantity || 0,
      "Unit": p.unit || "",
      "Weight": p.weight || 0,
      "Supplier": p.supplierName || "",
      "Party": p.party || "",
      "Company": p.companyName || "",
      "Warehouse": p.warehouseName || "",
      "Unit Cost": p.unitCost || 0,
      "Exchanged Amt": p.exchangedAmt || 0,
      "Total Cost": p.totalCost || 0,
      "Local Total": p.totalLocalCost || 0,
      "Currency": p.currency || "USD",
      "Commission": p.totalComission || 0,
      "Dealer": p.dealerName || "",
      "Country": p.countryName || "",
      "Batch": p.batch || "",
      "Created At": p.createdAt
        ? new Date(p.createdAt).toLocaleDateString()
        : "",
      "User Name": p.userName || "",

    }));

    // Create worksheet

    const worksheet = XLSX.utils.json_to_sheet(data, { origin: 3 }); // start table at row 4

    const colCount = Object.keys(data[0] || {}).length;

    // Add heading manually
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [`Purchase Report`],
        [`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
        [] // empty row before table
      ],
      { origin: "A1" }
    );

    // Merge first row across all columns for the title
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }
    ];
    // Optional: Set column widths for better formatting
    const colWidths = [
      { wch: 15 }, // Invoice No
      { wch: 15 }, // Order No
      { wch: 20 }, // Product
      { wch: 20 }, // Category
      { wch: 10 }, // Quantity
      { wch: 10 }, // Unit
      { wch: 10 }, // Weight
      { wch: 20 }, // Supplier
      { wch: 15 }, // Party
      { wch: 20 }, // Customer
      { wch: 20 }, // Company
      { wch: 20 }, // Warehouse
      { wch: 12 }, // Unit Cost
      { wch: 12 }, // Exchanged Amt
      { wch: 15 }, // Total Cost
      { wch: 15 }, // Local Total
      { wch: 10 }, // Currency
      { wch: 15 }, // Commission
      { wch: 18 }, // Dealer
      { wch: 15 }, // Country
      { wch: 15 }, // Batch
      { wch: 18 }, // Purchase Date
      { wch: 18 }, // Created At
      { wch: 15 }, // User Name
      { wch: 30 }, // Description
    ];
    worksheet["!cols"] = colWidths;

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Report");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save
    saveAs(file, "PurchaseReport.xlsx");
  };



  const exportPayment = (allPayments) => {
    if (!allPayments || allPayments.length === 0) return;

    // Sort payments by date (optional, for proper running balance)
    const sortedPayments = [...allPayments].sort(
      (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate)
    );

    let runningBalance = 0;

    // Map payments to Excel rows with Debit, Credit, and Balance
    const data = sortedPayments.map((p) => {
      const debit = p.paymentType === "dr" ? p.amount || 0 : 0;
      const credit = p.paymentType === "cr" ? p.amount || 0 : 0;

      runningBalance += debit - credit;

      return {
        "Payment Date": p.paymentDate
          ? new Date(p.paymentDate).toLocaleDateString()
          : "",
        "Payment No": p.paymentNo || "",
        "Company": p.companyName || "",
        "Transaction By": p.transBy || "",
        "Entity": p.entity || "",
        "Payment Type": p.paymentType || "",
        "Transaction Type": p.transactionType || "",
        "Party No": p.partyNo || "",
        "Description": p.description || "",

        "Created At": p.createdAt
          ? new Date(p.createdAt).toLocaleDateString()
          : "",
        "User Name": p.userName || "",
        Debit: debit,
        Credit: credit,
        Balance: runningBalance.toFixed(2),
      };
    });

    // Create worksheet starting at row 4
    const worksheet = XLSX.utils.json_to_sheet(data, { origin: 3 });
    const colCount = Object.keys(data[0] || {}).length;

    // Add main heading
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ["Payments Report"],
        [`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
        [] // empty row before table
      ],
      { origin: "A1" }
    );

    // Merge main title row
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }
    ];

    // Optional: Set column widths
    worksheet["!cols"] = [
      { wch: 15 }, // Payment No
      { wch: 25 }, // Supplier
      { wch: 20 }, // Company
      { wch: 20 }, // Transaction By
      { wch: 15 }, // Entity
      { wch: 15 }, // Payment Type
      { wch: 15 }, // Transaction Type
      { wch: 12 }, // Party No
      { wch: 30 }, // Description
      { wch: 18 }, // Payment Date
      { wch: 18 }, // Created At
      { wch: 15 }, // User Name
      { wch: 12 }, // Debit
      { wch: 12 }, // Credit
      { wch: 15 }, // Balance
    ];

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments Report");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(file, "PaymentsReport.xlsx");
  };


  return (
    <UserLayout>

      <div className="relative w-full md:w-full bg-orange-50 h-[95vh] ">
        <img src={logo} alt="Watermark" className="absolute inset-0 m-auto opacity-15 w-7/9 h-7/9 object-contain pointer-events-none" />


        <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 font-sans">
          {/* Header */}
          <header className="bg-white shadow-sm py-6 px-8 mb-8 ">
            <h1 className="md:text-3xl font-extrabold text-zinc-600 py-5 tracking-tight">{branding?.[0]?.name} Analytics Dashboard</h1>
            <hr className='!text-zinc-300' />
            <div className='mb-4 w-full  flex !text-start item-center  justify-start !px-5 p-2 gap-1 '>
              <ExchangeCalculator />
              <Tooltip title="Sales Report">
                <Button
                  type='text'
                  onClick={() => exportSales(allSales)}
                  className="!border !border-zinc-500 !rounded-sm hover:!bg-white hover:!text-zinc-600 !font-semibold !h-6 !mt-2 !px-2 !flex !justify-center !items-center !p-4  "
                >
                  <span className="!hidden lg:!flex md:!flex">Save Sales</span><FileExcelOutlined className='w-full !text-lg !text-green-700 ' />
                </Button>
              </Tooltip>
              <Tooltip title="Purchase Report">
                <Button
                  type='text'
                  onClick={() => exportPurchase(allPurchases)}
                  className="!border !border-zinc-500 !rounded-sm hover:!bg-white hover:!text-zinc-600 !font-semibold !h-6 !mt-2 !px-2 !flex !justify-center !items-center !p-4  "
                >
                  <span className="!hidden lg:!flex md:!flex">Save Purchase</span><FileExcelOutlined className='w-full !text-lg !text-green-700 ' />
                </Button>
              </Tooltip>
              <Tooltip title="Payments Report">
                <Button
                  type='text'
                  onClick={() => exportPayment(allPayments)}
                  className="!border !border-zinc-500 !rounded-sm hover:!bg-white hover:!text-zinc-600 !font-semibold !h-6 !mt-2 !px-2 !flex !justify-center !items-center !p-4  "
                >
                  <span className="!hidden lg:!flex md:!flex">Save Payments</span><FileExcelOutlined className='w-full !text-lg !text-green-700 ' />
                </Button>
              </Tooltip>




            </div>
          </header>

          <div className=' flex gap-2 flex flex-col w-auto h-full bg-zinc-200 item-center p-2 mb-2 px-4 md:px-8'>
            <Select
            size='small'
              showSearch={{ optionFilterProp: 'label', }}
              placeholder="Select a product to get Balance"
              options={productOptions}
              onChange={handleProductChange}
              className='!w-2/6 md:!w-2/14 !mb-1'
            />

           <div className='flex '> <span className='md:text-lg md:font-bold px-2'>Purchase: {Number(productPurchaseQty || 0).toFixed(2)} kg</span> |

            <span className='md:text-lg md:font-bold px-2'> Sales: {Number(productQty || 0).toFixed(2)} kg</span> | 
           
              
              <span  className={ parseFloat(productPurchaseQty || 0) -parseFloat(productQty || 0) <
                    0
                    ? "text-red-500  text-sm md:text-lg md:font-bold flex md:flex-row gap-4"
                    : "text-cyan-500 text-sm  md:text-lg md:font-bold flex  md:flex-row gap-4"
                }
                
              >
                <p className='text-black pl-2'> Balance:</p> {(
                  parseFloat(productPurchaseQty || 0) -
                  parseFloat(productQty || 0)
                ).toFixed(2)} kg
              </span></div>
           

          </div>
          {/* Cards Grid */}
          <div className="px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dealer Card */}
            <Card
              className="relative overflow-hidden !rounded-none  hover:shadow-xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-zinc-400"></div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Dealers:</h2>
              </div>


              <div className="space-y-2">
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Dealers:{" "}
                  <span className="text-blue-500 font-bold text-[12px] md:text-sm">{dealerNo}</span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Comission + Adv:{" "}
                  <span
                    className={
                      dealerComission <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-orange-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    $ {dealerComission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Paid to Dealers:{" "}
                  <span
                    className={
                      dealerPayment <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-green-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    $ {dealerPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Dealers Balance:{" "}
                  <span
                    className={
                      dealerBalance <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-green-500 font-bold text-[12px] md:text-sm"
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
              className="relative overflow-hidden !rounded-none  hover:shadow-xl transition-shadow duration-300 p-6"
            >
              <div className="absolute top-0 left-0 h-2 w-full bg-zinc-400"></div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Suppliers:</h2>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Suppliers:{" "}
                  <span className="text-blue-500 font-bold text-[12px] md:text-sm">{supplierNo}</span>
                </p>

                {/* <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Purchase Qty:{" "}
                  <span
                    className={
                      myPurchaseQty <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-blue-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    {(myPurchaseQty / 1000).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} tons

                  </span>
                </p> */}
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Purchase + Adv:{" "}
                  <span
                    className={
                      myPurchase <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-orange-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    $ {myPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Payment Amt:{" "}
                  <span
                    className={
                      sPayment <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-blue-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    $ {sPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Supplier Balance:{" "}
                  <span
                    className={
                      supplierBalance <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-green-500 font-bold text-[12px] md:text-sm"
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
              className="relative overflow-hidden !rounded-none  hover:shadow-xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-zinc-400"></div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Customers:</h2>
              </div>


              <div className="space-y-2">
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Customers:{" "}
                  <span className="text-blue-500 font-bold text-[12px] md:text-sm">{customerNo}</span>
                </p>
                {/* <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Sales Qty:{" "}
                  <span
                    className={
                      mySalesQty <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-blue-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    {(mySalesQty / 1000).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} Tons

                  </span>
                </p> */}
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Sales + Adv:{" "}
                  <span
                    className={
                      mySales <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-orange-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    $ {mySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Received Amt:{" "}
                  <span
                    className={
                      cPayment <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-blue-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    $ {cPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Customers Bal:{" "}
                  <span
                    className={
                      customerBalance <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-green-500 font-bold text-[12px] md:text-sm"
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
              className="relative overflow-hidden !rounded-none  hover:shadow-xl transition-shadow duration-300 p-6"
            >
              <div className="absolute top-0 left-0 h-2 w-full bg-zinc-400"></div>
              <div className="relative z-10">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Current Balance:</h2>
                </div>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Company: <span className="text-blue-500 font-bold text-[12px] md:text-sm">{companyNo}</span>
                </p>


                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Payable: <span className="text-red-500 font-bold text-[12px] md:text-sm"> $ {myPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Receivable: <span className="text-green-500 font-bold text-[12px] md:text-sm"> $ {myReceivable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
                {/* <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Availible: <span className="text-green-500 font-bold text-[12px] md:text-sm"> $ {myReceivable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p> */}
              </div>

              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-8 translate-y-8"></div>
            </Card>

            {/* Payment Card */}
            <Card
              className="relative overflow-hidden !rounded-none  hover:shadow-xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-zinc-400"></div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Payments:</h2>
              </div>


              <div className="space-y-2">

                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Other Payments:{" "}
                  <span
                    className={
                      totalOtherPayments <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-blue-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    $ {totalOtherPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Co Payments:{" "}
                  <span
                    className={
                      totalCompanyPayments <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-blue-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    $ {totalCompanyPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Rcvd:{" "}
                  <span
                    className={
                      totalCompanyPayments <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-green-500 font-bold text-[12px] md:text-sm"
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
              className="relative overflow-hidden !rounded-none  hover:shadow-xl transition-shadow duration-300 p-6"
            >

              <div className="absolute top-0 left-0 h-2 w-full bg-zinc-400"></div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Summary:</h2>
              </div>


              <div className="space-y-2">

                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Purchase + Adv:{" "}
                  <span
                    className={
                      myPurchase <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-orange-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    $ {myPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Sales Amt + Adv:{" "}
                  <span
                    className={
                      customerBalance <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-green-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    $ {customerBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Total Comission + Adv:{" "}
                  <span
                    className={
                      dealerComission <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-orange-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    $ {dealerComission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </p>
                {/* <p className="text-gray-600 text-[12px] md:text-sm text-blue-600 mb-1 w-full flex justify-between bg-zinc-50">
                  Current availible Stock:{" "}
                  <span
                    className={
                      totalStock <= 0
                        ? "text-red-500 font-bold text-[12px] md:text-sm"
                        : "text-orange-500 font-bold text-[12px] md:text-sm"
                    }
                  >
                    {(totalStock / 1000).toLocaleString(undefined, {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })} tons
                  </span>
                </p> */}
              </div>


              {/* Background accent */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-8 translate-y-8"></div>
            </Card>

          </div>

          <div className="w-full overflow-x-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 mt-4">
            <Table
              className="compact-table !px-1"
              columns={columns}
              dataSource={allAccountsBalance}
              bordered
              size="small"
              scroll={{ x: "max-content" }}
              pagination={{
                pageSize: 8,
                align: "center",
              }}
              title={() => (
                <div className="text-sm md:text-lg font-bold text-red-700 p-2 bg-zinc-200 flex flex-col md:flex-row md:items-center md:justify-between gap-2">


                  <Button
                    type="text"
                    icon={<PrinterOutlined className="!text-sm" />}
                    onClick={handlePrintBalances}
                    className="!bg-zinc-700 hover:!bg-green-500 !text-white !text-sm md:!text-lg !font-semibold"
                  >
                    Print All Accounts Balances
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