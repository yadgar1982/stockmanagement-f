import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, Select, DatePicker, Modal, notification, Tooltip } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import dayjs from "dayjs";
import { PrinterOutlined } from '@ant-design/icons';
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

  const [party, setParty] = useState(null);
  const [mySaleData, setMySaleData] = useState([]);
  const [myPurchaseData, setMyPurchaseData] = useState([]);
  const [myPaymentData, setMyPaymentData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [filteredStatement, setFilteredStatement] = useState([]);
  const [myCurrency, setMyCurrency] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [transactionType, setTransactionType] = useState(null);
  const [closingBalance, setClosingBalance] = useState(0);

  console.log("party", party)

  const { sale: sales } = useSelector(state => state.sale);
  const allSales = sales || [];

  const { purchase: purchases } = useSelector(state => state.purchase);
  const allPurchase = purchases || [];

  const { payment: payments } = useSelector(state => state.payments);
  const allPayment = payments || [];


  // Fetch data
  useEffect(() => {

    dispatch(fetchPurchase());
    dispatch(fetchPayment());
    dispatch(fetchSales());
  }, [dispatch]);


  // party selection
  const handlePartyStatement = (value) => {
    setParty(value);
  };

  // Prepare party data
  useEffect(() => {
  if (!party) return;

  let filteredSales = allSales.filter(p => p.party === party);
  let filteredPurchase = allPurchase.filter(p => p.party === party);
  let filteredPayment = allPayment.filter(p => p.partyNo === party);

  switch (transactionType) {
    case "sales":
      filteredPurchase = [];
      filteredPayment = [];
      break;
    case "purchase":
      filteredSales = [];
      filteredPayment = [];
      break;
    case "payment":
      filteredSales = [];
      filteredPurchase = [];
      break;
    case "sales-payment":
      filteredPurchase = [];
      break;
    case "purchase-payment":
      filteredSales = [];
      break;
    case "all":
    default:
      break; // keep all
  }

  setMySaleData(filteredSales);
  setMyPurchaseData(filteredPurchase);
  setMyPaymentData(filteredPayment);

  setFilteredStatement([]);
  setDateRange([]);
}, [party, allPurchase, allPayment, allSales, transactionType]);


  // data to print

  const handleData = () => {
    if (!selectedCurrency) return toast.error("Select Currency");
    if (!tableData || tableData.length === 0)
      return toast.error("No data available to print!");
    if (filteredStatement === null) return toast.error("No data found for selected date range!");

    // Start with filtered statement or full statement
    let dataToPrint = filteredStatement.length ? filteredStatement : statementWithBalance;

    // Filter by currency
    dataToPrint = dataToPrint.filter(
      r => String(r.currency).toUpperCase() === String(selectedCurrency).toUpperCase()
    );

    // Filter by transaction type (sale / purchase / payment)
    const filters = {
      "all": [],
      "sales": ["sale"],
      "purchase": ["purchase"],
      "payment": ["payment"],
      "sales-payment": ["sale", "payment"],
      "purchase-payment": ["purchase", "payment"],
    };

    if (transactionType && filters[transactionType]) {
      dataToPrint = dataToPrint.filter(d =>
        filters[transactionType].some(keyword => d.description.toLowerCase().includes(keyword))
      );
    }

    // Filter by date range if provided
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const [start, end] = dateRange;
      dataToPrint = dataToPrint.filter(d =>
        dayjs(d.date).isSameOrAfter(start, "day") &&
        dayjs(d.date).isSameOrBefore(end, "day")
      );
    }

    if (!dataToPrint.length) return toast.error("No data available to print for selected filters!");

    handlePrintStatement(dataToPrint);
  };

  const handleCurrencyStatement = (e) => {
    setSelectedCurrency(e)
  }


  // Statement with running balance
  const statementWithBalance = useMemo(() => {
    const purchaseEntries = myPurchaseData.map(p => ({
      date: new Date(p.purchaseDate || p.createdAt),
      description: p.description || "Purchase",
      credit: 0,
      debit: p.totalCost || 0,
      localCredit: p?.totalLocalCost || 0,
      localDebit: 0,
      currency: p.currency,
      quantity: p.quantity,
      unit: p.unit
    }));

    const salesEntries = mySaleData.map(p => ({
      date: new Date(p.saleDate || p.createdAt),
      description: p.description || "Sale",
      credit: p.totalCost || 0,
      debit: 0,
      localCredit: p?.totalLocalCost || 0,
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

    // Get unique currencies
    const currencies = [...new Set(allEntries.map((item) => item.currency))];
    setMyCurrency(currencies);

    // running balance
    let runningBalance = 0;
    return allEntries.map(entry => {
      runningBalance += Number(entry.credit) - Number(entry.debit);
      return { ...entry, balance: Number(runningBalance.toFixed(2)) };
    });
  }, [mySaleData, myPurchaseData, myPaymentData]);


  // Date filter
  useEffect(() => {
    if (!party) {
      setTableData([]);
      return;
    }

    let data = [...statementWithBalance];

    // Filter by selected currency if any
    if (selectedCurrency) {
      data = data.filter(d => String(d.currency).toUpperCase() === String(selectedCurrency).toUpperCase());
    }

    // Filter by transaction type if selected
    if (transactionType) {
      if (transactionType === 'purchase') {
        data = data.filter(d => d.description.toLowerCase().includes('purchase'));
      } else if (transactionType === 'sales') {
        data = data.filter(d => d.description.toLowerCase().includes('sale'));
      } else if (transactionType === 'payment') {
        data = data.filter(d => d.description.toLowerCase().includes('payment'));
      } else if (transactionType === 'all') {
        // do nothing, keep all entries
      }
    }

    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      data = data.filter(d =>
        dayjs(d.date).isSameOrAfter(start, "day") &&
        dayjs(d.date).isSameOrBefore(end, "day")
      );
    }

    // Recalculate running balance
    let runningBalance = 0;
    const finalData = data.map(d => {
      runningBalance += (d.credit || 0) - (d.debit || 0);
      return { ...d, balance: runningBalance };
    });

    setTableData(finalData);
  }, [party, selectedCurrency, transactionType, dateRange, statementWithBalance]);


  useEffect(() => {
    if (!party) {
      setTableData([]);
      return;
    }

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
  }, [party, selectedCurrency, dateRange, statementWithBalance]);

  const handlePrintStatement = (tableData) => {


    if (!selectedCurrency) return;

    const newWindow = window.open("", "_blank");
    if (!newWindow) return;
    const totalCredit = tableData.reduce((sum, r) => sum + (r.credit || 0), 0);
    const totalDebit = tableData.reduce((sum, r) => sum + (r.debit || 0), 0);
    const closingBalance = totalCredit - totalDebit;

    newWindow.document.title = `Statement - ${party}`;

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
  <div style="font-size:12px; color:#5a5b5cff;"><strong>Party: ${party}</strong> </div>

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
    ${tableData.map(e => {
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

    if (!tableData) return toast.error("Select a party first to get statement!");
    if (!selectedCurrency) return toast.error("Select Currency");
    if (!tableData || tableData.length === 0)
      return toast.error("No data available to print!");
    // Use filtered statement if exists, otherwise full statement
    if (filteredStatement === null) {
      return toast.error("No data found for selected date range!");
    }

    const dataToPrint =
      Array.isArray(filteredStatement) && filteredStatement.length > 0
        ? filteredStatement
        : statementWithBalance;

    handleUSDStatement(dataToPrint);
  };

  const handleUSDStatement = (tableData) => {
    if (!selectedCurrency) return toast.error("Select Currency");;
    if (!tableData || tableData.length === 0)
      return toast.error("No data available to print!");
    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    const totalCredit = tableData.reduce((sum, r) => sum + (r.credit || 0), 0);
    const totalDebit = tableData.reduce((sum, r) => sum + (r.debit || 0), 0);
    const closingBalance = totalCredit - totalDebit;
    newWindow.document.title = `Statement - ${party}`;

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
  <div style="font-size:12px; color:#5a5b5cff;"><strong>Party:${party}</strong> </div>

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
    ${tableData.map(e => {
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



  const columns = [
    { title: "Date", dataIndex: "date", key: "date", render: text => dayjs(text).format("DD/MM/YYYY"), sorter: (a, b) => new Date(a.date) - new Date(b.date) },
    { title: "Description", dataIndex: "description", key: "description", render: text => <b>{text}</b> },
   {
  title: "Quantity",  dataIndex: "quantity",  key: "quantity", render: (qty, record) => {return record.unit ? `${qty} ${record.unit}` : "Payment";}},
    { title: "Credit", dataIndex: "credit", key: "credit", render: (c, r) => `${Number(c).toFixed(2)} ${r.currency}`, sorter: (a, b) => a.credit - b.credit, align: "right" },
    { title: "Debit", dataIndex: "debit", key: "debit", render: (d, r) => `${Number(d).toFixed(2)} ${r.currency}`, sorter: (a, b) => a.debit - b.debit, align: "right" },
    { title: "Balance", dataIndex: "balance", key: "balance", render: (b, r) => <span style={{ color: b < 0 ? "red" : "black" }}>{b.toFixed(2)} {r.currency}</span>, align: "right" }
  ];

  return (

    <UserLayout>

      <div className='px-2'>
        <h1 className="md:text-xl text-sm px-2 !mb-3 text-yellow-700 font-extrabold " style={{ fontFamily: 'Poppins, sans-serif' }}>
          Dealers Financial Statements:
        </h1>

        {/* Form container - small width on large screens, full width on mobile */}
        <div className=" !w-full bg-white flex  !p mb-9 p-4  border border-zinc-200 items-center justify-left !top-5">
          <Form layout="horizontal" className="flex flex-col !px-2 md:!flex-row-hidden lg:flex-row xl:flex-row sxl:flex-row  gap-2">


            <Form.Item
              name="party"
              rules={[{ required: true, message: "Please select a supplier" }]}
              className="!m-0 !w-content"
            >
              <Select
                showSearch
                placeholder="Party"
                onChange={handlePartyStatement}
                style={{ width: "100%", minWidth: "120px" }}
                optionLabelProp="label"
                filterOption={(input, option) =>
                  option?.searchText
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={[...new Set([...allSales, ...allPurchase, ...allPayment].map(p => p.party))].map(p => ({
                  value: p,
                  searchText: p,
                  label: <span>{p}</span>,
                }))}
              />
            </Form.Item>


            <Form.Item
              name="currencyId"
              rules={[{ required: true, message: "Please select a currency" }]}
              className=" m-0"

            >
              <Select
                style={{ width: "100%", minWidth: "120px" }}
                onChange={handleCurrencyStatement}
                showSearch
                placeholder="Currency"
                optionFilterProp="label"

                options={myCurrency.map(s => ({ label: s, value: s }))}
              />

            </Form.Item>
            <Form.Item name="transactionType" className="m-0">
              <Select
                placeholder="Transaction-Type (Opt)"
                onChange={(value) => setTransactionType(value)}
                allowClear
                options={[
                  { label: "All", value: "all" },
                  { label: "Purchase", value: "purchase" },
                  { label: "Sales", value: "sales" },
                  { label: "Payment", value: "payment" },
                  { label: "Purchase + Payment", value: "purchase-payment" },
                  { label: "Sales + Payment", value: "sales-payment" },
                ]}
                style={{ width: "100%", minWidth: "120px" }}
              />
            </Form.Item>


            {/* Date range picker */}
            <Form.Item name="dateRange" className="m-0 !rounded-none">

              <RangePicker
                style={{ width: "100%", minWidth: "120px" }}
                size="small"
                value={dateRange.length ? dateRange : undefined}
                onChange={(dates) => setDateRange(dates || [])}
                allowClear
                suffixIcon={<CalendarOutlined className='!text-[25px]  !px-4 !md:px-0 !text-zinc-500' />}
              />
            </Form.Item>

            {/* Buttons row: two columns, no gap */}

            {/* <Button
              className="!bg-zinc-400  hover:!bg-zinc-300 !border-zinc-400 !text-white !font-bold hover:!text-black flex-1  !rounded-none"
              onClick={handleData}
            >
              <PrinterOutlined />
              <span className=" !text-transparent"> All $</span>
            </Button> */}
            <Button
              className="!bg-zinc-400  hover:!bg-zinc-300 !border-zinc-400 !text-white !font-semibold hover:!text-black flex-1  !rounded-none ml-0"
              onClick={handleUSDData}
            >
              <PrinterOutlined />
              <span className=" !text-transparent"> All $</span>
            </Button>

          </Form>

        </div>

        {/* Table Section - full width */}
      <Table
          columns={columns}
          dataSource={tableData.map((item, index) => ({ ...item, key: index }))}
          bordered
          pagination={{ pageSize: 5 }}
          scroll={{ x: 'max-content' }}
          className="!w-full !text-[10px] md:!text-sm"
          size="small"
        />
      
        {/* Totals */}
        {tableData.length > 0 && (() => {
          const totals = tableData.reduce(
            (acc, item) => {
              acc.totalCredit += item.credit || 0;
              acc.totalDebit += item.debit || 0;
              return acc;
            },
            { totalCredit: 0, totalDebit: 0 }
          );
      
          const closingBalance = totals.totalCredit - totals.totalDebit;
      
          // Detect currency from first row (fallback to USD)
          const currency = tableData[0]?.currency || "USD";
      
          return (
            <div className=" text-right space-y-1 flex flex-col  px-2">
              <hr className='!text-zinc-200 mb-3' />
              <div 
                className={`font-bold !text-[12px] md:!text-sm  w-full  flex justify-between  ${totals.totalCredit < 0 ? 'text-red-500' : ''}`}
              > 
              <span>Total Credit:</span>
                 {totals.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </div>
              <div
                className={`font-bold !text-[12px] md:!text-sm  flex  w-full !justify-between ${totals.totalDebit < 0 ? 'text-red-500' : ''}`}
              >
                <span>Total Debit:</span>
                <span>{totals.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
              </div>
              <div
                className={`font-bold !text-[12px] md:!text-sm  flex w-full  justify-between ${closingBalance < 0 ? 'text-red-500' : ''}`}
              >
                <span>Total Balance:</span>
                <span>{closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
              </div>
            </div>
          );
        })()}
      </div>

    </UserLayout>

  );
};

export default Statements;