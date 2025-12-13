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

  const { stocks } = useSelector(state => state.stocks);
  const allStock = stocks?.data || [];
  const { warehouse } = useSelector(state => state.warehouse);
  const allWarehouse = warehouse || [];


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
  const handleStockManagement = (value) => {
    setStId(value);
   let my_data = allWarehouse.filter(s => s.warehouseId === value); 
  setMystocksData(my_data);

  };


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
      drQty= qty;
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


  useEffect(() => {
    if (!stId) return;

    const warehouseData = allWarehouse.find(s => s._id === stId);
    setMystocksData(warehouseData);

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

   const handlePrintStatement = (dataToPrint) => {
    console.log("data to print",dataToPrint)
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
 
       <div style="margin-top: 5px; text-align: left;">
         <h1 style="margin: 0; text-align: center; font-size: 24px; color: #5a5b5cff;"> ${dataToPrint[0].warehouseName} Account Statement</h1>
         <p><strong>Name:</strong> ${dataToPrint[0].warehouseName}</p>
         <p><strong>Country:</strong> ${dataToPrint[0].countryName}</p>
         <p><strong>Currency: ${selectedCurrency}</strong></p>
       </div>
     </header>
 
     <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
       <thead>
         <tr>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Date</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Description</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Qty-In</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc; ">Amt-In</th>
           <th style="border:1px solid #dee2e6;padding:8px; background-color:#d9dddefc;">Qty-Out</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Amt-Out</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Amt-Blnce</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Qty-Blnce</th>
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
               <td style="border:1px solid #dee2e6;padding:8px;">${dayjs(e.transactionDate).format("DD/MM/YYYY")}</td>
               <td style="border:1px solid #dee2e6;padding:8px;">${e.description || ""}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;background-color:#cbe3cb;">${crQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}  </td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right; background-color:#cbe3cb;">${credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="border:1px solid #dee2e6;padding:8px;text-align:right;  background-color:#e3c2bc;">${drQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;background-color:#e3c2bc;">${debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="border:1px solid #dee2e602;padding:8px;text-align:right;color:${runningBalance < 0 ? "red" : "black"};">${runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;color:${qtyrBalance < 0 ? "red" : "black"};">${qtyrBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} "kg"</td>
             </tr>
           `;
    }).join("")}
       </tbody>
       <tfoot>
         <tr>
           <td colspan="2" style="font-weight:bold;border:1px solid #dee2e6;padding:8px;">Totals</td>
          <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalcrQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right; ">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${(totaldrQty/1000).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${(qtyClosingBalance/1000).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} "Tons" </td>
         </tr>
       </tfoot>
     </table>
 
     <p>Thank you for your business.</p>
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

   const showModal = () => setIsModalOpen(true);




  return (
    <div className="relative w-84 md:w-screen bg-orange-50 h-[77vh] ">
      <img src={logo} alt="Watermark" className="absolute inset-0 m-auto opacity-15 w-7/9 h-7/9 object-contain pointer-events-none" />
      <div className='flex flex-col gap-4 p-2'>
        <h1 className="md:text-3xl text-2xl text-orange-500 font-extrabold drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Stock Financial Statements:
        </h1>
        <Button type="text" className='!bg-orange-400 !text-white md:!w-25 !w-25 md:!text-lg hover:!bg-green-500 !font-bold !shadow-lg !shadow-black' onClick={showModal}>
          <PrinterOutlined className='!font-bold md:!text-2xl' />
        </Button>

        <Modal title="Print stock Statement" footer={null} open={isModalOpen} onCancel={() => setIsModalOpen(false)} className='md:!w-100 !w-80'>
          <Form layout="vertical">
            <Form.Item label="stock Name" name="warehouseId" rules={[{ required: true, message: "Please select a stock" }]}>
              <Select
                onChange={handleStockManagement}
                showSearch
                placeholder="Select a warehouse"
                optionFilterProp="label"
                options={allStock.map(s => ({ label: `${s.stockName}`, value: s._id }))}

              />
            </Form.Item>

            <Form.Item
              label="Currency"
              name="currencyId"
              rules={[{ required: true, message: "Please select a Currency" }]}
            >
              <Select
                onChange={(e) => handleCurrencyStatement(e)}
                showSearch
                placeholder="Select a Currency"
                optionFilterProp="label"
                options={[...new Set(allWarehouse.map(s => s.currency))].map(c => ({ label: c, value: c }))}
              />
            </Form.Item>
            <Form.Item label="Select Date">
              <RangePicker className="!w-[100%]" value={dateRange.length ? dateRange : undefined} onChange={(dates) => setDateRange(dates || [])} allowClear />
            </Form.Item>

            <Form.Item>
              <Button className='!bg-zinc-500' onClick={handleData}>
                <PrinterOutlined className='md:!text-2xl !w-full !font-bold !text-white !p-4' />
              </Button>
            </Form.Item>
          
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Statements;