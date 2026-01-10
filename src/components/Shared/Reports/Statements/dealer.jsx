import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, Select, DatePicker, Modal, notification, Tooltip } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import dayjs from "dayjs";
import { PrinterOutlined } from '@ant-design/icons';
import { fetchDealer } from '../../../../redux/slices/dealerSlice';
import { fetchPurchase } from '../../../../redux/slices/purchaseSlice';
import { fetchSales } from '../../../../redux/slices/salesSlice';
import { fetchPayment } from '../../../../redux/slices/paymentSlice';
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { Table, Tag } from "antd";
import 'antd/dist/reset.css';
import UserLayout from '../../UserLayout';
import { toast } from 'react-toastify';
const logo = import.meta.env.VITE_LOGO_URL;
import { CalendarOutlined } from "@ant-design/icons";
//get branding info: 
const branding = JSON.parse(localStorage.getItem("branding"))

const { RangePicker } = DatePicker;

const Statements = () => {
  const dispatch = useDispatch();

  const [dId, setDId] = useState(null);
  const [myDealersData, setMyDealersData] = useState(null);
  const [mySaleData, setMySaleData] = useState([]);
  const [myPurchaseData, setMyPurchaseData] = useState([]);
  const [myPaymentData, setMyPaymentData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [filteredStatement, setFilteredStatement] = useState([]);
  const [myCurrency, setMyCurrency] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [closingBalance, setClosingBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { dealers } = useSelector(state => state.dealers);
  const allDealers = dealers?.data || [];
  const { sale: sales } = useSelector(state => state.sale);
  const allSales = sales || [];

  const { purchase: purchases } = useSelector(state => state.purchase);
  const allPurchase = purchases || [];

  const { payment: payments } = useSelector(state => state.payments);
  const allPayment = payments || [];

  // Fetch data
  useEffect(() => {
    dispatch(fetchDealer());
    dispatch(fetchPurchase());
    dispatch(fetchPayment());
    dispatch(fetchSales());
  }, [dispatch]);


  // dealer selection
  const handleDealersStatement = (value) => {
    setDId(value);
  };

  // Prepare dealer data
  useEffect(() => {
    if (!dId) return;
    const dealerData = allDealers.find(s => s._id === dId);
    setMyDealersData(dealerData);
    setMySaleData(allSales.filter(p => p.dealerId === dId));
    setMyPurchaseData(allPurchase.filter(p => p.dealerId === dId));
    setMyPaymentData(allPayment.filter(p => p.dealerId === dId));

    setFilteredStatement([]);
    setDateRange([]);
  }, [dId, allDealers, allPurchase, allPayment, allSales]);




  // data to print

  const handleData = () => {
    if (!myDealersData) return toast.error("Select a dealer first to get statement!");
    if (!selectedCurrency) return toast.error("Select Currency");

    // Use filtered statement if exists, otherwise full statement
    if (filteredStatement === null) return toast.error("No data found for selected date range!");

    let dataToPrint = filteredStatement.length
      ? filteredStatement
      : statementWithBalance;

    // Filter by selected currency — USD or any other
    dataToPrint = dataToPrint.filter(
      r => String(r.currency).toUpperCase() === String(selectedCurrency).toUpperCase()
    );

    if (!dataToPrint.length) return toast.alert("No data to print for selected currency!");

    // Totals (use localCredit/localDebit)
    const totalCredit = dataToPrint.reduce((sum, r) => sum + (r.localCredit || 0), 0);
    const totalDebit = dataToPrint.reduce((sum, r) => sum + (r.localDebit || 0), 0);
    const closingBalance = totalCredit - totalDebit;

    handlePrintStatement(dataToPrint);
  };


  // Prepare dealer data
  useEffect(() => {
    if (!dId) return;
    const dealerData = allDealers.find(s => s._id === dId);
    setMyDealersData(dealerData);
    setMySaleData(allSales.filter(p => p.dealerId === dId));
    setMyPurchaseData(allPurchase.filter(p => p.dealerId === dId));
    setMyPaymentData(allPayment.filter(p => p.dealerId === dId));

    setFilteredStatement([]);
    setDateRange([]);
  }, [dId, allDealers, allPurchase, allPayment, allSales]);

  // Statement with running balance
  const statementWithBalance = useMemo(() => {
    const purchaseEntries = myPurchaseData.map(p => ({
      date: new Date(p.purchaseDate || p.createdAt),
      description: p.description || "Purchase",
      credit: p.totalComission || 0,
      debit: 0,
      localCredit: p?.totalExComission || 0,
      localDebit: 0,
      currency: p.currency,
      quantity: p.quantity,
      unit: p.unit
    }));

    const salesEntries = mySaleData.map(p => ({
      date: new Date(p.saleDate || p.createdAt),
      description: p.description || "Sale",
      credit: p.totalComission || 0,
      debit: 0,
      localCredit: p?.totalExComission || 0,
      localDebit: 0,
      currency: p.currency,
      quantity: p.quantity,
      unit: p.unit
    }));

    const paymentEntries = myPaymentData.map(p => ({
      date: new Date(p.paymentDate || p.createdAt),
      description: p?.description || "Payment",
      credit: p?.paymentType?.toLowerCase() === "cr" ? Number(p.amount) : 0,
      debit: p?.paymentType?.toLowerCase() === "dr" ? Number(p.amount) : 0,
      localCredit: p?.paymentType?.toLowerCase() === "cr" ? Number(p.exchangedAmt) : 0,
      localDebit: p?.paymentType?.toLowerCase() === "dr" ? Number(p.exchangedAmt) : 0,
      currency: p.currency,
    }));

    const allEntries = [...purchaseEntries, ...salesEntries, ...paymentEntries].sort((a, b) => a.date - b.date);

    //sort currency
    const currencies = [...new Set(allEntries.map((item) => item.currency))];
    setMyCurrency(currencies);

    let runningBalance = 0;
    return allEntries.map(entry => {
      runningBalance += Number(entry.credit) - Number(entry.debit);
      return { ...entry, balance: Number(runningBalance.toFixed(2)) };
    });

  }, [mySaleData, myPaymentData]);


  // Date filter
  useEffect(() => {
    // No date range → show all data
    if (!dateRange || dateRange.length !== 2 || !dateRange[0] || !dateRange[1]) {
      setFilteredStatement(statementWithBalance);
      return;
    }

    const [start, end] = dateRange;

    const filtered = statementWithBalance.filter(
      e =>
        dayjs(e.date).startOf('day').isSameOrAfter(dayjs(start).startOf('day')) &&
        dayjs(e.date).startOf('day').isSameOrBefore(dayjs(end).startOf('day'))
    );
    setFilteredStatement(filtered.length ? filtered : []);

    // Matches found
    setFilteredStatement(filtered);
  }, [dateRange, statementWithBalance]);


  const handleCurrencyStatement = (e) => {

    setSelectedCurrency(e)
  }







  // update table data based on filters
  useEffect(() => {
    if (!dId) {
      setTableData([]);
      return;
    }

    // Start with full statement with balance
    let data = statementWithBalance;

    // Filter by selected currency if any
    if (selectedCurrency) {
      data = data.filter(
        r => String(r.currency).toUpperCase() === String(selectedCurrency).toUpperCase()
      );
    }

    // Filter by date range if provided
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const [start, end] = dateRange;
      data = data.filter(
        e =>
          dayjs(e.date).isSameOrAfter(start, "day") &&
          dayjs(e.date).isSameOrBefore(end, "day")
      );
    }

    // Recalculate running balance after filtering
    let runningBalance = 0;
    const finalData = data.map(item => {
      runningBalance += (item.credit || 0) - (item.debit || 0);
      return { ...item, balance: runningBalance };
    });

    setTableData(finalData);
  }, [dId, selectedCurrency, dateRange, statementWithBalance]);

  const handlePrintStatement = (dataToPrint) => {
    if (!selectedCurrency) return;

    const newWindow = window.open("", "_blank");
    if (!newWindow) return;
    const totalCredit = dataToPrint.reduce((sum, r) => sum + (r.localCredit || 0), 0);
    const totalDebit = dataToPrint.reduce((sum, r) => sum + (r.localDebit || 0), 0);
    const closingBalance = totalCredit - totalDebit;

    newWindow.document.title = `Statement - ${myDealersData.fullname}`;
    let runningBalance = 0; // Initialize running balance

    newWindow.document.body.innerHTML = `
<div style="font-family: Arial; padding: 10px; background: white; color: #212529;">
  <div style="
    display: flex; 
    align-items: center; 
    justify-content: center; 
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
  ">
    <header style="width: 100%; text-align: center; margin-bottom: 20px;">
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        position: relative;
        margin-bottom: 10px;
      ">
        <div style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);">
          <img 
            src="${logo}" 
            alt="${branding[0].name} Logo" 
            style="height: 65px; width: auto; object-fit: contain;"
          />
        </div>
        <div style="text-align: center;">
          <h2 style="margin: 0; font-size: 14px; color: #023e8a;">${branding[0].name}</h2>
          <p style="margin: 3px 0; font-size: 14px; color: #555;">${branding[0].address}</p>
          <p style="margin: 3px 0; font-size: 14px; color: #555;">${branding[0].mobile}</p>
          <a href="mailto:${branding[0].email}" style="font-size: 12px; color: #0077b6; text-decoration: none;">
            ${branding[0].email}
          </a>
        </div>
      </div>

      <hr style="border: 1px solid #0077b6; margin: 15px auto 10px; width: 100%;" />

      <div style="text-align:left; margin-top:5px;">
        <div style="font-size:14px; font-weight:bold; color:#5a5b5cff;">Financial Statement</div>
        <div style="font-size:12px; color:#5a5b5cff;"><strong>Name:</strong> ${myDealersData.fullname}</div>
        <div style="font-size:12px; color:#5a5b5cff;"><strong>Account No:</strong> ${myDealersData.accountNo}</div>
        <div style="font-size:12px; color:#5a5b5cff;"><strong>Mobile:</strong> ${myDealersData.mobile}</div>
        <div style="font-size:12px; color:#5a5b5cff;"><strong>Currency: USD</strong></div>
      </div>
    </header>

   <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; color: #212529;">
  <thead>
    <tr style="background-color: #f8f9fa; text-align: left;">
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px;">Date</th>
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px;">Description</th>
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px; text-align:right;">Credit</th>
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px; text-align:right;">Debit</th>
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px; text-align:right;">Balance</th>
    </tr>
  </thead>
  <tbody>
    ${dataToPrint.map((e, index) => {
      const credit = e.localCredit || 0;
      const debit = e.localDebit || 0;
      runningBalance += credit - debit; // running balance
      const rowColor = index % 2 === 0 ? '#ffffff' : '#f1f3f5'; // alternating row colors
      return `
        <tr style="background-color: ${rowColor};">
          <td style="padding:3px 6px;">${dayjs(e.date).format("DD/MM/YYYY")}</td>
          <td style="padding:3px 6px;">${e.description || ""}</td>
          <td style="padding:3px 6px; text-align:right;">${credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="padding:3px 6px; text-align:right;">${debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="padding:3px 6px; text-align:right; color:${runningBalance < 0 ? "red" : "black"};">
            ${runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>
      `;
    }).join('')}
  </tbody>
 <tfoot>
    <tr style="font-weight:bold; border-top: 1px solid #dee2e6;">
      <td colspan="2" style="padding:4px 6px;">Totals</td>
      <td style="padding:4px 6px; text-align:end;">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td style="padding:4px 6px; text-align:end;">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
     <td 
      style="padding:4px 6px; text-align:end; color:${closingBalance < 0 ? 'red' : 'black'};">
      ${closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </td>
    </tr>
  </tfoot>
</table>


    <p style="font-weight:bold;font-size:12px; border-top: 1px solid #dee2e6; background-color: #f8f9fa;">Thank you for your business.</p>
    <footer style="
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      text-align: center;
      font-size: 12px;
      color: #868e96;
      background: white;
      padding: 8px 0;
      border-top: 1px solid #dee2e6;
    ">
      Generated on ${dayjs().format("DD/MM/YYYY HH:mm")}<br/>
      Powered by ${branding[0].name}
    </footer>
</div>
    `;

    newWindow.print();
  };

  //USD statement
  const handleUSDData = () => {

    if (!myDealersData) return toast.error("Select a dealer first to get statement!");
    if (!selectedCurrency) return toast.error("Select Currency");

    // Use filtered statement if exists, otherwise full statement
    if (filteredStatement === null) {
      return toast.error("No data found for selected date range!");
    }

    let dataToPrint =
      Array.isArray(filteredStatement) && filteredStatement.length > 0
        ? filteredStatement
        : statementWithBalance;

    handleUSDStatement(dataToPrint);
  };

  const handleUSDStatement = (dataToPrint) => {
    if (!selectedCurrency) return;

    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    const totalCredit = dataToPrint.reduce((sum, r) => sum + (r.credit || 0), 0);
    const totalDebit = dataToPrint.reduce((sum, r) => sum + (r.debit || 0), 0);
    const closingBalance = totalCredit - totalDebit;
    newWindow.document.title = `Statement - ${myDealersData.fullname}`;

    newWindow.document.body.innerHTML = `
    <div style="font-family: Arial; padding: 10px; background: white; color: #212529;">
       <div style="
    display: flex; 
    align-items: center; 
    justify-content: center; 
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
  ">
     <header style="width: 100%; text-align: center; margin-bottom: 20px;">
  <div style="
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
    margin-bottom: 10px;
  ">
    <!-- Left-aligned logo -->
    <div style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);">
      <img 
        src="${logo}" 
        alt="${branding[0].name} Logo" 
        style="height: 65px; width: auto; object-fit: contain;"
      />
    </div>

    <!-- Centered company info -->
    <div style="text-align: center;">
      <h2 style="margin: 0; font-size: 22px; color: #023e8a;">${branding[0].name}</h2>
      <p style="margin: 3px 0; font-size: 13px; color: #555;">${branding[0].address}</p>
      <p style="margin: 3px 0; font-size: 13px; color: #555;">${branding[0].mobile}</p>
      <a href="mailto:${branding[0].email}" 
         style="font-size: 13px; color: #0077b6; text-decoration: none;">
        ${branding[0].email}
      </a>
    </div>
  </div>

  <!-- Divider line -->
  <hr style="border: 1px solid #0077b6; margin: 15px auto 10px; width: 100%;" />

  <!-- Statement Title -->
  <div style="text-align:left; margin-top:5px;">
  <div style="font-size:14px; font-weight:bold; color:#5a5b5cff;">Financial Statement</div>
  <div style="font-size:12px; color:#5a5b5cff;"><strong>Name:</strong> ${myDealersData.fullname}</div>
  <div style="font-size:12px; color:#5a5b5cff;"><strong>Account No:</strong> ${myDealersData.accountNo}</div>
  <div style="font-size:12px; color:#5a5b5cff;"><strong>Mobile:</strong> ${myDealersData.mobile}</div>
  <div style="font-size:12px; color:#5a5b5cff;"><strong>Currency: USD</strong></div>
</div>
</header>
   

      
      <table style="
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-top: 15px;
    color: #212529;
">
  <thead>
    <tr style="background-color: #f1f3f5; text-align: left;">
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px;">Date</th>
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px;">Description</th>
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px; text-align:right;">Credit</th>
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px; text-align:right;">Debit</th>
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px; text-align:right;">Balance</th>
    </tr>
  </thead>
  <tbody>
    ${dataToPrint.map(e => {
      const credit = e.credit || 0;
      const debit = e.debit || 0;
      const balance = e.balance;
      return `
        <tr>
          <td style="padding:3px 6px;">${dayjs(e.date).format("DD/MM/YYYY")}</td>
          <td style="padding:3px 6px;">${e.description || ""}</td>
          <td style="padding:3px 6px; text-align:right;">${credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="padding:3px 6px; text-align:right;">${debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="padding:3px 6px; text-align:right; color:${balance <= 0 ? "red" : "black"};">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>
      `;
    }).join('')}
  </tbody>
  <tfoot>
    <tr style="font-weight:bold; border-top: 1px solid #dee2e6;">
      <td colspan="2" style="padding:4px 6px;">Totals</td>
      <td style="padding:4px 6px; text-align:end;">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td style="padding:4px 6px; text-align:end;">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
     <td 
      style="padding:4px 6px; text-align:end; color:${closingBalance < 0 ? 'red' : 'black'};">
      ${closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </td>
    </tr>
  </tfoot>
</table>

      <p style="font-weight:bold; border-top: 1px solid #dee2e6;font-size:12px; background-color: #f8f9fa;">Thank you for your business.</p>
      <footer style="
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #868e96;
  background: white;
  padding: 8px 0;
  border-top: 1px solid #dee2e6;
">
  Generated on ${dayjs().format("DD/MM/YYYY HH:mm")}<br/>
  Powered by ${branding[0].name}
</footer>
    </div>
  `;

    newWindow.print();
  };

  //all dealers balance
  const allDealersBalance = useMemo(() => {
    if (!allDealers?.length) return [];

    return allDealers.map(dealer => {
      // Dealer sales commission
      const salesCommission = allSales
        .filter(s => s.dealerId === dealer._id)
        .reduce((sum, s) => sum + Number(s.totalComission || 0), 0);

      // Dealer purchase commission
      const purchaseCommission = allPurchase
        .filter(p => p.dealerId === dealer._id)
        .reduce((sum, p) => sum + Number(p.totalComission || 0), 0);

      // Payments already paid to dealer
      const paidAmount = allPayment
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
  }, [allDealers, allSales, allPurchase, allPayment]);


  const handlePrintAllDealers = () => {
    if (!allDealersBalance || allDealersBalance.length === 0) {
      return toast.error("No dealer data available to print!");
    }

    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    const totalBalance = allDealersBalance.reduce((sum, s) => sum + s.balance, 0);

    newWindow.document.title = "All dealers Balances";

    newWindow.document.body.innerHTML = `
    <div style="font-family: Arial; padding: 10px; background: white; color: #212529;">
      <header style="width: 100%; text-align: center; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; position: relative; margin-bottom: 10px;">
          <div style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);">
            <img 
              src="${logo}" 
              alt="${branding[0].name} Logo" 
              style="height: 65px; width: auto; object-fit: contain;"
            />
          </div>
          <div style="text-align: center;">
            <h2 style="margin: 0; font-size: 16px; color: #023e8a;">${branding[0].name}</h2>
            <p style="margin: 3px 0; font-size: 12px; color: #555;">${branding[0].address}</p>
            <p style="margin: 3px 0; font-size: 12px; color: #555;">${branding[0].mobile}</p>
            <a href="mailto:${branding[0].email}" style="font-size: 12px; color: #0077b6; text-decoration: none;">
              ${branding[0].email}
            </a>
          </div>
        </div>

        <hr style="border: 1px solid #686a6cff; margin: 15px auto 10px; width: 100%;" />

        <div style="text-align:left; margin-top:5px;">
          <div style="font-size:14px; font-weight:bold; color:#5a5b5cff;">All dealers Balances</div>
          <div style="font-size:12px; color:#5a5b5cff;">Generated on: ${dayjs().format("DD/MM/YYYY HH:mm")}</div>
        </div>
      </header>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; color: #212529;">
        <thead>
          <tr style="background-color: #f8f9fa; text-align: left;">
            <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px;">dealer</th>
            <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px;">Account No</th>
            <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px;">Mobile</th>
            <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px; text-align:right;">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${allDealersBalance.map((s, index) => {
      const rowColor = index % 2 === 0 ? "#ffffff" : "#f1f3f5";
      return `
              <tr style="background-color: ${rowColor};">
                <td style="padding:3px 6px;">${s.dealerName}</td>
                <td style="padding:3px 6px;">${s.accountNo || ""}</td>
                <td style="padding:3px 6px;">${s.mobile || ""}</td>
                <td style="padding:3px 6px; text-align:right; color:${s.balance < 0 ? "red" : "black"};">
                  ${s.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   USD
                </td>
              </tr>
            `;
    }).join('')}
        </tbody>
        <tfoot>
          <tr style="font-weight:bold; border-top: 1px solid #dee2e6; background-color: #f8f9fa;">
            <td colspan="3" style="padding:4px 6px;">Total dealer Balance</td>
            <td style="padding:4px 6px; text-align:right; color: ${totalBalance < 0 ? "red" : "black"};">
                  ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </td>
          </tr>
        </tfoot>
      </table>

     
      <footer style="
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        text-align: center;
        font-size: 12px;
        color: #868e96;
        background: white;
        padding: 8px 0;
        border-top: 1px solid #dee2e6;
      ">
        Powered by ${branding[0].name}
      </footer>
    </div>
  `;

    newWindow.print();
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty, record) => `${qty} ${record.unit}`,
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      render: (amount, record) =>
        `${Number(amount).toFixed(2)} ${record.currency}`,
      sorter: (a, b) => a.credit - b.credit,
      align: "right",
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      render: (amount, record) =>
        `${Number(amount).toFixed(2)} ${record.currency}`,
      sorter: (a, b) => a.debit - b.debit,
      align: "right",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance, record) => (
        <span style={{ color: balance < 0 ? "red" : "black" }}>
          {Number(balance).toFixed(2)} {record.currency}
        </span>
      ),
      align: "right",
    }

  ];

  return (

    <UserLayout>

      <div className='px-2'>
        <h1 className="md:text-xl text-sm px-2 !mb-3 text-yellow-700 font-extrabold " style={{ fontFamily: 'Poppins, sans-serif' }}>
          Dealers Financial Statements:
        </h1>

        {/* Form container - small width on large screens, full width on mobile */}
        <div className=" !w-full bg-white flex  !p mb-9 p-4  border border-zinc-200 items-center justify-left !top-5">
          <Form layout="horizontal" className="flex flex-col !px-2 md:flex-row-hidden lg:flex-row xl:flex-row sxl:flex-row  gap-2">


            <Form.Item
              name="dealerId"
              rules={[{ required: true, message: "Please select a supplier" }]}
              className="m-0"
            >
              <Select
              style={{ width: "100%",minWidth:"200px" }}
                showSearch
                placeholder="Dealers"
                onChange={handleDealersStatement}
                optionLabelProp="label"
                filterOption={(input, option) =>
                  option?.searchText
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={allDealers.map((s) => ({
                  value: s._id,
                  searchText: `${s.fullname} ${s.accountNo}`, // 👈 searchable text
                  label: (
                    <span
                      className="truncate block text-[12px] font-semibold"
                      title={`${s.fullname} (Acc No: ${s.accountNo})`}
                    >
                      {`${s.fullname} (Acc No: ${s.accountNo})`}
                    </span>
                  ),
                }))}
              />
            </Form.Item>


            <Form.Item
              name="currencyId"
              rules={[{ required: true, message: "Please select a currency" }]}
              className=" m-0"

            >
              <Select
              style={{ width: "100%",minWidth:"120px" }}
                onChange={handleCurrencyStatement}
                showSearch
                placeholder="Currency"
                optionFilterProp="label"
                options={myCurrency.map(s => ({ label: s, value: s }))}
              />

            </Form.Item>


            {/* Date range picker */}
            <Form.Item name="dateRange" className="m-0 !rounded-none">

              <RangePicker
                style={{ width: "100%",minWidth:"120px" }}
                size="small"
                value={dateRange.length ? dateRange : undefined}
                onChange={(dates) => setDateRange(dates || [])}
                allowClear
                suffixIcon={<CalendarOutlined className='!text-[25px]  !px-4 !md:px-0 !text-zinc-500' />}
              />
            </Form.Item>

            {/* Buttons row: two columns, no gap */}

            <Button
              className="!bg-zinc-400  hover:!bg-zinc-300 !border-zinc-400 !text-white !font-bold hover:!text-black flex-1  !rounded-none"
              onClick={handleData}
            >
              <PrinterOutlined />
              <span className="!text-transparent">a</span>
            </Button>
            <Button
              className="!bg-zinc-400  hover:!bg-zinc-300 !border-zinc-400 !text-white !font-semibold hover:!text-black flex-1  !rounded-none ml-0"
              onClick={handleUSDData}
            >
              <PrinterOutlined />
              <span className=" "> All in $</span>
            </Button>
            <Button
              type="default"
              onClick={handlePrintAllDealers} // your print function
              className=" !bg-zinc-400  hover:!bg-zinc-300 !border-zinc-400 !text-white !font-semibold hover:!text-black flex-1  !rounded-none ml-0"
            >
              <PrinterOutlined />
              <span className=" "> All-Dealers</span>
            </Button>

          </Form>

        </div>

        {/* Table Section - full width */}
        <div className="w-full  bg-zinc-50 px-2 h-auto py-4">
          <h2 className="text-zinc-500 text-[10px] md:text-lg font-semibold mb-0">Statement</h2>

          
            <Table
              columns={columns}
              dataSource={tableData.map((item, index) => ({ ...item, key: index }))}
              bordered
              pagination={{ pageSize: 5 }}
             scroll={{ x: 'max-content'}}
              className="!w-full !h-[100%] !text-[10px] "
              size="small"
            />


          {/* bal table */}
          {tableData.length > 0 && (() => {
            const total = tableData.reduce(
              (sum, item) => sum + (item.credit || 0) - (item.debit || 0),
              0
            );

            return (
              <div
                className={`text-right font-bold h-10 !text-[14px] md:text-base ${total < 0 ? 'text-red-500' : ''
                  }`}
              >
                Total Balance: $
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </UserLayout>

  );
};

export default Statements;