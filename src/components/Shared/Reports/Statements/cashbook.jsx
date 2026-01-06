import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, Select, DatePicker, Modal, notification, Tooltip } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import dayjs from "dayjs";
import { PrinterOutlined } from '@ant-design/icons';
import { fetchCompany } from '../../../../redux/slices/companySlice';
import { fetchCurrency } from '../../../../redux/slices/currencySlice';
import { fetchPurchase } from '../../../../redux/slices/purchaseSlice';
import { fetchSales } from '../../../../redux/slices/salesSlice';
import { fetchPayment } from '../../../../redux/slices/paymentSlice';
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { Table, Tag } from "antd";
import 'antd/dist/reset.css';

import { toast } from 'react-toastify';
const logo = import.meta.env.VITE_LOGO_URL;

//get branding info: 
const branding = JSON.parse(localStorage.getItem("branding"))

const { RangePicker } = DatePicker;

const Statements = () => {
  const dispatch = useDispatch();


  const [myData, setMyData] = useState(null);
  const [mySaleData, setMySaleData] = useState([]);
  const [myPurchaseData, setMyPurchaseData] = useState([]);
  const [myPaymentData, setMyPaymentData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [filteredStatement, setFilteredStatement] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [tableData, setTableData] = useState([]);
  const [closingBalance, setClosingBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { companys } = useSelector(state => state.company);
  const allCompanys = companys?.data || [];

  const { purchase: purchases } = useSelector(state => state.purchase);
  const allPurchase = purchases || [];

  const { sale: sales } = useSelector(state => state.sale);
  const allSales = sales || [];

  const { payment: payments } = useSelector(state => state.payments);
  const allPayment = payments || [];

  const { currencies, crloading, crerror } = useSelector((state) => state.currencies);

  const allCurrencies = currencies?.data || [];



  const currencyOptions = allCurrencies.map(item => ({
    label: item.currency,
    value: item.currency,
  }));

  // Fetch data
  useEffect(() => {
    dispatch(fetchCompany());
    dispatch(fetchCurrency());
    dispatch(fetchPurchase());
    dispatch(fetchPayment());
    dispatch(fetchSales());
  }, [dispatch]);




  // Prepare company data
  useEffect(() => {
    setMyData(allPayment);
    setFilteredStatement([]);
    setDateRange([]);
  }, [ allPayment]);



  // data to print
  const handleData = () => {
    if (!selectedCurrency) return toast.error("Select Currency to get Data");

    // Use filtered statement if exists, otherwise full statement
    if (filteredStatement === null) return toast.error("No data found for selected date range!");
    let dataToPrint = filteredStatement.length ? filteredStatement : statementWithBalance;

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


  // Prepare company data
  useEffect(() => {
    setMyData(allPayment);
    setFilteredStatement([]);
    setDateRange([]);
  }, [ allPayment]);

  // Statement with running balance
const statementWithBalance = useMemo(() => {
  if (!myData || myData.length === 0) return []; // <-- return empty array if null

  const paymentEntries = myData.map(p => ({
    date: new Date(p.paymentDate || p.createdAt),
    description: p?.description || "Payment",
    credit: p?.paymentType?.toLowerCase() === "cr" ? Number(p.amount) : 0,
    debit: p?.paymentType?.toLowerCase() === "dr" ? Number(p.amount) : 0,
    localCredit: p?.paymentType?.toLowerCase() === "cr" ? Number(p.exchangedAmt) : 0,
    localDebit: p?.paymentType?.toLowerCase() === "dr" ? Number(p.exchangedAmt) : 0,
    currency: p.currency,
    company:p.companyName
  }));

  const allEntries = [...paymentEntries].sort((a, b) => a.date - b.date);

  let runningBalance = 0;
  return allEntries.map(entry => {
    runningBalance += entry.credit - entry.debit;
    return { ...entry, balance: runningBalance };
  });
}, [myData]);



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
 


  const handleCurrencyStatement = (value) => {

    setSelectedCurrency(value);
  }



  // update table data based on filters
  useEffect(() => {


    // Start with full statement with balance
    let data = statementWithBalance;

    // Filter by selected currency if any
    if (selectedCurrency && selectedCurrency !=="") {
      data = data.filter(
        r => String(r.currency).toUpperCase() === String(selectedCurrency).toUpperCase()
      );
    }

    // Filter by date range if provided
   if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
  const [start, end] = dateRange;

  data = data.filter(r =>
    dayjs(r.transactionDate).startOf('day').isSameOrAfter(dayjs(start).startOf('day')) &&
    dayjs(r.transactionDate).startOf('day').isSameOrBefore(dayjs(end).startOf('day'))
  );
}
    // Recalculate running balance after filtering
    let runningBalance = 0;
    const finalData = data.map(item => {
      runningBalance += (item.credit || 0) - (item.debit || 0);
      return { ...item, balance: runningBalance };
    });

    setTableData(finalData);
  }, [ selectedCurrency, dateRange, statementWithBalance]);
  
  const handlePrintStatement = (dataToPrint) => {
    if (!selectedCurrency) return;

    const newWindow = window.open("", "_blank");
    if (!newWindow) return;
    const totalCredit = dataToPrint.reduce((sum, r) => sum + (r.localCredit || 0), 0);
    const totalDebit = dataToPrint.reduce((sum, r) => sum + (r.localDebit || 0), 0);
    const totalQty = dataToPrint.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const uniqueUnits = [...new Set(dataToPrint.map(e => e.unit).filter(Boolean))];
    const unit = uniqueUnits.length === 1 ? uniqueUnits[0] : "";
    const closingBalance = totalCredit - totalDebit;

    newWindow.document.title = `Ledger Statement`;
    let runningBalance = 0; // Initialize running balance
      const sortedData = [...dataToPrint].sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstDate = sortedData.length ? dayjs(sortedData[0].date).format("DD/MM/YYYY") : "-";
      const lastDate = sortedData.length ? dayjs(sortedData[sortedData.length - 1].date).format("DD/MM/YYYY") : "-";      
   
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
          
        </div>
      </div>

      <hr style="border: 1px solid #0077b6; margin: 15px auto 10px; width: 100%;" />

      <div style="text-align:left; margin-top:5px;">
        <div style="font-size:14px; font-weight:bold; color:#5a5b5cff;">Financial Ledger Statement</div>
        <br/><br/>
        <div style="font-size:12px; color:#5a5b5cff;"><strong>Currency: ${selectedCurrency}</strong></div>
          <div style="font-size:12px; color:#5a5b5cff; margin-top:2px;">
    <strong>Period:</strong> ${firstDate} - ${lastDate}
  </div>
      </div>
    </header>

   <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; color: #212529;">
  <thead>
    <tr style="background-color: #f8f9fa; text-align: left;">
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px;">Date</th>
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px;">Description</th>
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px;">Company</th>
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
      const company=e.company


      const rowColor = index % 2 === 0 ? '#ffffff' : '#f1f3f5'; // alternating row colors
      return `
        <tr style="background-color: ${rowColor};">
          <td style="padding:3px 6px;">${dayjs(e.date).format("DD/MM/YYYY")}</td>
          <td style="padding:3px 6px;">${e.description || ""}</td>
          <td style="padding:3px 6px;">${company || ""}</td>
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
    <tr style="font-weight:bold; border-top: 1px solid #dee2e6; background-color: #f8f9fa;">
      <td colspan="2" style="padding:4px 6px;">Totals</td>
      <td style="padding:4px 6px; text-align:right;">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td style="padding:4px 6px; text-align:right;">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td style="padding:4px 6px; text-align:right;">${closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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

    if (!myData) return toast.error("Select a company first to get statement!");
    if (!selectedCurrency) return toast.error("Select Currency");

    // Use filtered statement if exists, otherwise full statement

    if (filteredStatement === null) return toast.error("No data found for selected date range!");
    let dataToPrint = filteredStatement.length
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
    const sortedData = [...dataToPrint].sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstDate = sortedData.length ? dayjs(sortedData[0].date).format("DD/MM/YYYY") : "-";
      const lastDate = sortedData.length ? dayjs(sortedData[sortedData.length - 1].date).format("DD/MM/YYYY") : "-";      
    newWindow.document.title = `Ledger Statement`;

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
  <div style="font-size:14px; font-weight:bold; color:#5a5b5cff; width:100%; display:flex; justify:center;">Financial Ledger Statement</div>
  <br/><br/>
  <div style="font-size:12px; color:#5a5b5cff;"><strong>Currency: USD</strong></div>
  <div style="font-size:12px; color:#5a5b5cff; margin-top:2px;">
    <strong>Period:</strong> ${firstDate} - ${lastDate}
  </div>
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
      <th style="border-bottom: 1px solid #dee2e6; padding:4px 6px;">Company</th>
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
      const company=e.company
      return `
        <tr>
          <td style="padding:3px 6px;">${dayjs(e.date).format("DD/MM/YYYY")}</td>
          <td style="padding:3px 6px;">${e.description || ""}</td>
          <td style="padding:3px 6px;">${company || ""}</td>
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
      <td colspan="3" style="padding:4px 6px;">Totals</td>
      <td style="padding:4px 6px; text-align:end;">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td style="padding:4px 6px; text-align:end;">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td style="padding:4px 6px; text-align:end;">${closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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

  const showModal = () => {
    setIsModalOpen(true);
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
      title: "Company",
      dataIndex: "company",
      key: "company",
      render: (text) => <b>{text}</b>,
    },

    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      render: (amount, record) => `${amount} ${record.currency}`,
      sorter: (a, b) => a.credit - b.credit,
      align: "right",
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      render: (amount, record) => `${amount} ${record.currency}`,
      sorter: (a, b) => a.debit - b.debit,
      align: "right",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance, record) => `${balance} ${record.currency}`,

      align: "right",
    },

  ];

  return (

    <div className="w-screen  flex flex-col gap-6 overflow-auto bg-white !justify-center ">
      <h1 className="md:text-xl text-sm px-8  text-zinc-500 font-extrabold !mt-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Company Financial Statements:
      </h1>

      {/* Form container - small width on large screens, full width on mobile */}
      <div className=" md:w-[350px] bg-white flex pmb-9 p-4 mx-8 border border-zinc-200 items-center justify-center">
        <Form layout="horizontal" className="flex flex-col gap-0">

          <div className="flex gap-1 !justify-between">
           


            <Form.Item
              name="currency"
              rules={[{ required: true, message: "Please select a currency" }]}
              className="!rounded-none m-0"
            >
              <Select
                onChange={handleCurrencyStatement}
                showSearch
                placeholder="Currency"
                optionFilterProp="label"
                className="!h-8 text-sm !w-20 !overflow-hidden !rounded-none"
                options={currencyOptions}
              />
            </Form.Item>
          </div>

          {/* Date range picker */}
          <Form.Item name="dateRange" className="m-0">
            <RangePicker className="!w-[100%]" value={dateRange.length ? dateRange : undefined} onChange={(dates) => setDateRange(dates || [])} allowClear />
          </Form.Item>

          {/* Buttons row: two columns, no gap */}
          <div className="flex gap-2">
            <Button
              className="!bg-zinc-400 !text-lg hover:!bg-zinc-300 !border-zinc-400 !text-white hover:!text-black flex-1 !h-8 !rounded-none"
              onClick={handleData}
            >
              <PrinterOutlined />
            </Button>
            <Button
              className="!bg-zinc-400 !text-lg hover:!bg-zinc-300 !border-zinc-400 !text-white hover:!text-black flex-1 !h-8 !rounded-none ml-0"
              onClick={handleUSDData}
            >
              <PrinterOutlined />
              <span className="hidden md:inline"> All Statement in $</span>
            </Button>
          </div>
        </Form>

      </div>

      {/* Table Section - full width */}
      <div className="w-full bg-zinc-50 px-4 h-auto py-4 ">
        <h2 className="text-zinc-500 text-[10px] md:text-lg font-semibold mb-0">Statement</h2>

        <div className="w-full overflow-x-auto ">
          <Table
            columns={columns}
            dataSource={tableData.map((item, index) => ({ ...item, key: index }))}
            bordered
            pagination={{ pageSize: 5 }}
            scroll={{ x: '100%' }}
            className="w-full"
            size="small"
          />
        </div>

        {tableData.length > 0 && (
          <div className="text-right font-bold h-10 !text-[14px] md:text-base">
            Total Balance: $
            {tableData
              .reduce((sum, item) => sum + (item.credit || 0) - (item.debit || 0), 0)
              .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
      </div>
    </div>


  );
};

export default Statements;