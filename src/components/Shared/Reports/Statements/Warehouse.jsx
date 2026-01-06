import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, Select, DatePicker, Modal } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import dayjs from "dayjs";
import { PrinterOutlined } from '@ant-design/icons';
import { fetchStock } from '../../../../redux/slices/stockSlice';
import { fetchWarehouse } from '../../../../redux/slices/warehouseSlice';

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { toast } from 'react-toastify';
import { all } from 'axios';

import { Table, Tag } from "antd";
import 'antd/dist/reset.css';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const { RangePicker } = DatePicker;

const branding = JSON.parse(localStorage.getItem("branding"));

const Statements = () => {
  const dispatch = useDispatch();
  const logo = import.meta.env.VITE_LOGO_URL;

  const [stId, setStId] = useState(null);
  const [mystocksData, setMystocksData] = useState(null);

  // const [formData, setFormData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [filteredStatement, setFilteredStatement] = useState([]);
  const [myCurrency, setMyCurrency] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [curData, setCurData] = useState([]);
  const [dateData, setDateData] = useState([]);
  const { stocks } = useSelector(state => state.stocks);
  const allStock = stocks?.data || [];
  const { warehouse } = useSelector(state => state.warehouse);
  const allWarehouse = warehouse || [];
  console.log("allwarehious", allWarehouse)

  // Fetch data
  useEffect(() => {
    dispatch(fetchWarehouse());
    dispatch(fetchStock());
  }, [dispatch]);

  useEffect(() => {
    if (myCurrency.length && !selectedCurrency) {
      setSelectedCurrency(myCurrency[0]);
    }
  }, [myCurrency]);

  // stock selection
  const handleStockStatement = (value) => {
    setStId(value);

    let my_data = allWarehouse.filter(s => s.warehouseId === value);
    setMystocksData(my_data);

  };


  useEffect(() => {
    if (!stId) return;
    // setMystocksData(warehouseData);
    const warehouseData = allWarehouse.find(s => s._id === stId);
    setTableData(warehouseData ? [warehouseData] : []);

    // Extract all currencies available in this warehouse
    const currencies = allWarehouse
      .filter(w => w._id === stId)
      .map(w => w.currency)
      .filter((v, i, a) => a.indexOf(v) === i); // unique
    setMyCurrency(currencies);

    setFilteredStatement([]);
    setDateRange([]);
  }, [stId, allWarehouse]);
  const handleCurrencyStatement = (e) => {
    setSelectedCurrency(e);
  }

  const handleData = () => {
    if (!selectedCurrency) return toast.error("Select Currency to get report!");
    if (!stId) return toast.error("Select a stock first to get statement!");

    // Step 1: Filter transactions for selected stock & currency
    let filteredData = allWarehouse.filter(
      r => r.warehouseId === stId && String(r.currency).toUpperCase() === String(selectedCurrency).toUpperCase()
    );

    if (!filteredData.length) return toast.error("No data to print for selected stock & currency!");

    // Step 2: Optionally filter by date range
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const [start, end] = dateRange;

      filteredData = filteredData.filter(t =>
        dayjs(t.transactionDate).isSameOrAfter(start, "day") &&
        dayjs(t.transactionDate).isSameOrBefore(end, "day")
      );

      if (!filteredData.length) return toast.error("No data found in the selected date range!");
    }

    // Step 3: Sort by transactionDate
    filteredData.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));

    // Step 4: Compute running balances
    let runningAmount = 0;
    let runningQty = 0;

    const statement = filteredData.map(t => {

      const qty = (t.quantity || 0) * (t.weight || 1);
      let credit = 0, debit = 0, crQty = 0, drQty = 0;

      if (t.transactionType === "In") {
        credit = t.totalCost || 0;
        crQty = qty;
      } else if (t.transactionType === "Out") {
        debit = t.totalCost || 0;
        drQty = qty;
      }

      runningAmount += credit - debit;
      runningQty += crQty - drQty;

      return {
        ...t,
        credit,
        debit,
        crQty,
        drQty,
        balance: runningAmount,
        qtyBalance: runningQty
      };
    });


    handlePrintStatement(statement, {
      totalCredit: statement.reduce((sum, r) => sum + r.credit, 0),
      totalDebit: statement.reduce((sum, r) => sum + r.debit, 0),
      totalcrQty: statement.reduce((sum, r) => sum + r.crQty, 0),
      totaldrQty: statement.reduce((sum, r) => sum + r.drQty, 0),
      closingBalance: statement.reduce((sum, r) => sum + r.credit - r.debit, 0),
      qtyClosingBalance: statement.reduce((sum, r) => sum + r.crQty - r.drQty, 0)
    });
  };

  // update table data based on filters
  useEffect(() => {
    if (!stId || !mystocksData?.length) {

      return;
    }

    let data = [...mystocksData]; // clone the array

    if (selectedCurrency) {
      data = data.filter(
        r => String(r.currency).toUpperCase() === String(selectedCurrency).toUpperCase()
      );

    }

    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const [start, end] = dateRange;

      data = data.filter(r =>
        dayjs(r.transactionDate).startOf('day').isSameOrAfter(dayjs(start).startOf('day')) &&
        dayjs(r.transactionDate).startOf('day').isSameOrBefore(dayjs(end).startOf('day'))
      );
    }
    // Add crQty/drQty and credit/debit
    data = data.map(item => {
      const crQty = item.transactionType === "In" ? item.quantity || 0 : 0;
      const drQty = item.transactionType === "Out" ? item.quantity || 0 : 0;
      const credit = item.transactionType === "In" ? item.totalCost || 0 : 0;
      const debit = item.transactionType === "Out" ? item.totalCost || 0 : 0;
      return { ...item, crQty, drQty, credit, debit };
    });


    let runningBalance = 0;
    const finalData = data.map(item => {
      runningBalance += (item.credit || 0) - (item.debit || 0);
      return { ...item, balance: runningBalance };
    });

    setTableData(finalData);

  }, [stId, selectedCurrency, dateRange, mystocksData]);




  const handlePrintStatement = (dataToPrint) => {

    if (!selectedCurrency) return;

    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    newWindow.document.title = `Financial Statement - ${dataToPrint[0].warehouseName}`;

    const totalCredit = dataToPrint.reduce((sum, r) => sum + (r.credit || 0), 0);
    const totalDebit = dataToPrint.reduce((sum, r) => sum + (r.debit || 0), 0);
    const totalcrQty = dataToPrint.reduce((sum, r) => sum + (r.crQty || 0), 0);
    const totaldrQty = dataToPrint.reduce((sum, r) => sum + (r.drQty || 0), 0);
    const closingBalance = totalCredit - totalDebit;
    const qtyClosingBalance = totalcrQty - totaldrQty;
    let runningBalance = 0;
    let qtyrBalance = 0;

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
           <h2 style="margin: 0; font-size: 22px; color: #023e8a;">${branding[0].name}</h2>
           <p style="margin: 3px 0; font-size: 13px; color: #555;">${branding[0].address}</p>
           <p style="margin: 3px 0; font-size: 13px; color: #555;">${branding[0].mobile}</p>
           <a href="mailto:${branding[0].email}" style="font-size: 13px; color: #0077b6; text-decoration: none;">
             ${branding[0].email}
           </a>
         </div>
       </div>
 
       <hr style="border: 1px solid #0077b6; margin: 15px auto 10px; width: 100%;" />
        <div style="text-align:left; margin-top:5px;">
        <div style="font-size:14px; font-weight:bold; color:#5a5b5cff;"> ${dataToPrint[0].warehouseName} Account Statement</div>
        <div style="font-size:12px; color:#5a5b5cff;"><strong>Name:</strong> ${dataToPrint[0].warehouseName}</div>
        <div style="font-size:12px; color:#5a5b5cff;"><strong>Country:</strong> ${dataToPrint[0].countryName}</div>
        <div style="font-size:12px; color:#5a5b5cff;"><strong>Mobile:</strong>${selectedCurrency}</div>
        <div style="font-size:12px; color:#5a5b5cff;"><strong>Currency: USD</strong></div>
      </div>
     </header>
 
     <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
       <thead>
         <tr style="font-size:14px">
           <th style="border:1px solid #dee2e6;padding:4px;background-color:#F2F2F3;">Date</th>
           <th style="border:1px solid #dee2e6;padding:4px;background-color:#F2F2F3;">Description</th>
           <th style="border:1px solid #dee2e6;padding:4px;background-color:#F2F2F3;">Qty-In</th>
           <th style="border:1px solid #dee2e6;padding:4px;background-color:#F2F2F3; ">Amt-In</th>
           <th style="border:1px solid #dee2e6;padding:4px;background-color:#F2F2F3;">Qty-Out</th>
           <th style="border:1px solid #dee2e6;padding:4px;background-color:#F2F2F3;">Amt-Out</th>
           <th style="border:1px solid #dee2e6;padding:4px;background-color:#F2F2F3;">Amt-Blnce</th>
           <th style="border:1px solid #dee2e6;padding:4px;background-color:#F2F2F3;">Qty-Blnce</th>
         </tr>
       </thead>
       <tbody>
        ${dataToPrint.map(e => {
      const credit = e.credit || 0;
      const debit = e.debit || 0;
      const crQty = e.crQty || 0;
      const drQty = e.drQty || 0;
      const totalCredit = dataToPrint.reduce((sum, r) => sum + (r.credit || 0), 0);
      const totalDebit = dataToPrint.reduce((sum, r) => sum + (r.debit || 0), 0);
      const totalcrQty = dataToPrint.reduce((sum, r) => sum + (r.crQty || 0), 0);
      const totaldrQty = dataToPrint.reduce((sum, r) => sum + (r.drQty || 0), 0);
      const closingBalance = totalCredit - totalDebit;
      const qtyClosingBalance = totalcrQty - totaldrQty;


      runningBalance += credit - debit;
      qtyrBalance += crQty - drQty;

      return `
             <tr>
               <td style="padding:3px;font-size:14px; 6px">${dayjs(e.transactionDate).format("DD/MM/YYYY")}</td>
               <td style="padding:3px;font-size:14px; 6px">${e.description || ""}</td>
               <td style="padding:3px;font-size:14px; 6px">${crQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}  </td>
               <td style="padding:3px;font-size:14px; 6px; text-align:right;">${credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style=padding:3px;font-size:14px; 6px">${drQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="padding:3px;font-size:14px; 6px ;text-align:right">${debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="padding:3px;font-size:14px; 6px;padding:8px;text-align:right;color:${runningBalance < 0 ? "red" : "black"};">${runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="padding:3px;font-size:14px; 6px;text-align:right;color:${qtyrBalance < 0 ? "red" : "black"};">${qtyrBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} "kg"</td>
             </tr>
           `;
    }).join("")}
       </tbody>
       <tfoot>
         <tr>
           <td colspan="2" style="font-weight:bold;border:1px solid #dee2e6;padding:8px;">Totals</td>
          <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalcrQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right; ">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${(totaldrQty / 1000).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${(qtyClosingBalance / 1000).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} "Tons" </td>
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
       Generated on ${dayjs().format("DD/MM/YYYY")}<br/>
       Powered by ${branding[0].name}
     </footer>
 </div>
     `;


    newWindow.print();
  };


  //all warehouse balance
const AllWarehouseBalance = useMemo(() => {
  if (!Array.isArray(allWarehouse) || allWarehouse.length === 0) return [];

  const map = new Map();

  allWarehouse.forEach(txn => {
    const key = txn.warehouseId;

    if (!map.has(key)) {
      map.set(key, {
        key,
        warehouseName: txn.warehouseName || "Unknown Warehouse",
        QtyCredit: 0,   // not in transaction
        QtyDebit: 0,      // not in transaction
        credit: 0,
        debit: 0,
      });
    }

    const item = map.get(key);

    if (txn.transactionType === "In") {
      item.credit += Number(txn.totalCost || 0);
      item.QtyCredit += Number(txn.quantity * txn.weight || 0);
    }

    if (txn.transactionType === "Out") {
      item.debit += Number(txn.totalCost || 0);
       item.QtyDebit += Number(txn.quantity * txn.weight || 0);
    }
  });

  return Array.from(map.values()).map(w => ({
    ...w,
    balance: w.credit - w.debit,
    qty_balance: w.QtyCredit - w.QtyDebit,
  }));
}, [allWarehouse]);


const handlePrintAllwareHouse = () => {
  if (!Array.isArray(AllWarehouseBalance) || AllWarehouseBalance.length === 0) {
    toast.error("No warehouse data available to print!");
    return;
  }

  if (!branding?.length) {
    toast.error("Branding information missing!");
    return;
  }

  const newWindow = window.open("", "_blank");
  if (!newWindow) return;

  const totalBalance = AllWarehouseBalance.reduce(
    (sum, s) => sum + Number(s.balance || 0),
    0
  );
  const totalQtyBalance = AllWarehouseBalance.reduce(
    (sum, s) => sum + Number(s.qty_balance || 0),
    0
  );

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>All Warehouses Balances</title>
  <style>
    body { font-family: Arial, sans-serif; color: #212529; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { padding: 4px 6px; }
    th { border-bottom: 1px solid #dee2e6; background: #f8f9fa; }
    tfoot td { font-weight: bold; background: #f8f9fa; border-top: 1px solid #dee2e6; }
  </style>
</head>
<body>

<div style="padding:10px;">
  <header style="text-align:center; position:relative;">
    <img src="${logo}" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); height:65px;" />

    <h2 style="margin:0; font-size:16px; color:#023e8a;">${branding[0].name}</h2>
    <p style="margin:2px 0; font-size:12px;">${branding[0].address}</p>
    <p style="margin:2px 0; font-size:12px;">${branding[0].mobile}</p>
    <p style="margin:2px 0; font-size:12px;">${branding[0].email}</p>

    <hr />
    <strong>All Warehouses Balances</strong><br/>
    <span style="font-size:12px;">
      Generated on: ${dayjs().format("DD/MM/YYYY HH:mm")}
    </span>
  </header>

  <table>
    <thead>
      <tr>
        <th>Warehouse</th>
        
        <th style="text-align:right;"></th>
        <th style="text-align:right;"></th>
        <th style="text-align:right;">Quantity Balance</th>
        <th style="text-align:right;">Balance</th>
      </tr>
    </thead>
    <tbody>
      ${AllWarehouseBalance.map((s, i) => `
        <tr style="background:${i % 2 === 0 ? "#fff" : "#f1f3f5"};">
          <td>${s.warehouseName}</td>
          <td></td>
          <td></td>
        
          <td style="text-align:right; color:${s.qty_balance < 0 ? "red" : "black"};">
            ${s.qty_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} kg
          </td>
          <td style="text-align:right; color:${s.balance < 0 ? "red" : "black"};">
            ${(s.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
          </td>
        </tr>
      `).join("")}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3">Total Warehouse Balance</td>
        <td style="text-align:right; color:${totalQtyBalance < 0 ? "red" : "black"};">
          ${(totalQtyBalance/1000).toLocaleString(undefined, { minimumFractionDigits: 3})} Tons
        </td>
        <td style="text-align:right; color:${totalBalance < 0 ? "red" : "black"};">
          ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
        </td>
      </tr>
    </tfoot>
  </table>

  <footer style="position:fixed; bottom:0; width:100%; text-align:center; font-size:12px;">
    Powered by ${branding[0].name}
  </footer>
</div>

</body>
</html>
`;

  // ✅ Correct usage
  newWindow.document.documentElement.innerHTML = html;

  // ✅ Wait for images before printing
  const images = newWindow.document.images;
  let loaded = 0;

  if (images.length === 0) {
    newWindow.print();
    newWindow.close();
  } else {
    for (let img of images) {
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === images.length) {
          newWindow.print();
          newWindow.close();
        }
      };
    }
  }
};



  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => text ? dayjs(text).format("DD/MM/YYYY") : "",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "W-House",
      dataIndex: "warehouseName",
      key: "warehouseName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <b>{text || ""}</b>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty, record) => (
        <div>
          {record.crQty >= 1 && (
            <span style={{ color: "green", fontWeight: "bold" }}>
              {record.crQty * record.weight} kg
            </span>
          )}
          {record.drQty >= 1 && (
            <span style={{ color: "red", fontWeight: "bold", marginLeft: 8 }}>
              {record.drQty * record.weight}  kg
            </span>
          )}
        </div>
      ),
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
    },
    {
      title: "TrnsType",
      dataIndex: "transactionType",
      key: "trnstype",
      render: (transactionType) => {
        let color = "black";
        if (transactionType === "In") color = "green";
        else if (transactionType === "Out") color = "red";

        return (
          <span style={{ color, fontWeight: "bold" }}>
            {transactionType || " "}
          </span>
        );
      },
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      render: (amount, record) => (
        <span style={{ color: "green", fontWeight: "bold" }}>
          {(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {record.currency || ""}
        </span>
      ),
      sorter: (a, b) => (a.credit || 0) - (b.credit || 0),
      align: "right",
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      render: (amount, record) => (
        <span style={{ color: "red", fontWeight: "bold" }}>
          {(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {record.currency || ""}
        </span>
      ),
      sorter: (a, b) => (a.debit || 0) - (b.debit || 0),
      align: "right",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance, record) => (
        <span style={{ color: balance < 0 ? "red" : "black", fontWeight: "bold" }}>
          {(balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {record.currency || ""}
        </span>
      ),
      align: "right",
    },
  ];


  return (
    <div className="w-screen  flex flex-col gap-6 overflow-auto bg-white !justify-center ">
      <h1 className="md:text-xl text-sm px-8  text-zinc-500 font-extrabold !mt-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Warehouse Financial Statements:
      </h1>
      <Button
        type="default"
        onClick={handlePrintAllwareHouse} // your print function
        className=" !mx-8 !text-white !font-bold !bg-green-600 hover:!bg-green-500 !w-[10rem] text-white"
      >
        Print All warehouses
      </Button>
      {/* Form container - small width on large screens, full width on mobile */}
      <div className=" md:w-[350px] bg-white flex pmb-9 p-4 mx-8 border border-zinc-200 items-center justify-center">
        <Form layout="horizontal" className="flex flex-col gap-0">

          <div className="flex gap-1 !justify-between">
            <Form.Item
              name="warehouseId"
              rules={[{ required: true, message: "Please select a customer" }]}
              className="m-0 "

            >
              <Select
                onChange={handleStockStatement}
                showSearch
                placeholder="Select a warehouse"
                optionFilterProp="label"
                options={allStock.map(s => ({ label: `${s.stockName}`, value: s._id }))}

              />
            </Form.Item>


            <Form.Item
              name="currencyId"
              rules={[{ required: true, message: "Please select a currency" }]}
              className="!rounded-none m-0"
            >
              <Select
                onChange={(e) => handleCurrencyStatement(e)}
                showSearch
                placeholder="Select a Currency"
                optionFilterProp="label"
                options={[...new Set(allWarehouse.map(s => s.currency))].map(c => ({ label: c, value: c }))}
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