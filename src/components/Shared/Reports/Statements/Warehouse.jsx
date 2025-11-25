import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, Select, DatePicker, Modal } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import dayjs from "dayjs";
import { PrinterOutlined } from '@ant-design/icons';
import { fetchStock } from '../../../../redux/slices/stockSlice';
import { fetchPurchase } from '../../../../redux/slices/purchaseSlice';
import { fetchSales } from '../../../../redux/slices/salesSlice';
import { fetchPayment } from '../../../../redux/slices/paymentSlice';
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { toast } from 'react-toastify';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const { RangePicker } = DatePicker;

const branding = JSON.parse(localStorage.getItem("branding"));

const Statements = () => {
  const dispatch = useDispatch();
  const logo = import.meta.env.VITE_LOGO_URL;

  const [stId, setStId] = useState(null);
  const [mystocksData, setMystocksData] = useState(null);
  console.log("my stock data", mystocksData)
  const [myPurchaseData, setMyPurchaseData] = useState([]);
  const [mySaleData, setMySaleData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [filteredStatement, setFilteredStatement] = useState([]);
  const [myCurrency, setMyCurrency] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { stocks } = useSelector(state => state.stocks);
  const allStocks = stocks?.data || [];
  const { purchase: purchases } = useSelector(state => state.purchase);
  const allPurchase = purchases || [];

  const { sale: sales } = useSelector(state => state.sale);
  const allSales = sales || [];

  // Fetch data
  useEffect(() => {
    dispatch(fetchStock());
    dispatch(fetchPurchase());
    dispatch(fetchPayment());
    dispatch(fetchSales());
  }, [dispatch]);

  // stock selection
  const handleStockManagement = (value) => {
    setStId(value);
  };
  const handleData = () => {
    if (!mystocksData) return toast.error("Select a stock first to get statement!");
    if (!selectedCurrency) return toast.error("Select Currency to get report");

    // Use filtered statement if exists, otherwise full statement
    let dataToPrint = filteredStatement.length ? filteredStatement : statementWithBalance;
    console.log("data to print",dataToPrint)
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

  // Prepare stock data
  useEffect(() => {
    if (!stId) return;
    const stockData = allStocks.find(s => s._id === stId);
    setMystocksData(stockData);
    setMySaleData(allSales.filter(p => p.warehouseId === stId));
    setMyPurchaseData(allPurchase.filter(p => p.warehouseId === stId));

    setFilteredStatement([]);
    setDateRange([]);
  }, [stId, allStocks, allPurchase, allSales]);

  // Statement with running balance
  const statementWithBalance = useMemo(() => {
    const purchaseEntries = myPurchaseData.map(p => ({
      date: new Date(p.purchaseDate || p.createdAt),
      description: p.description || "Purchase",
      credit: p.totalCost || 0,
      debit: 0,
      localCredit: p?.totalLocalCost || 0,
      localDebit: 0,
      currency: p.currency,
      crQuantity: p.quantity,
      unit: p.unit
    }));

    const salesEntries = mySaleData.map(p => ({
      date: new Date(p.saleDate || p.createdAt),
      description: p.description || "Sale",
      credit: 0,
      debit: p.totalCost || 0,
      localCredit: 0,
      localDebit: p?.totalLocalCost || 0,
      currency: p.currency,
      drQuantity: p.quantity,
      unit: p.unit
    }));



    const allEntries = [...purchaseEntries, ...salesEntries,].sort((a, b) => a.date - b.date);
    // Extract currencies
    const currencies = [...new Set(allEntries.map(item => item.currency))];
    setMyCurrency(currencies);


    let runningBalance = 0;
    return allEntries.map(entry => {
      runningBalance += entry.credit - entry.debit;
      return { ...entry, balance: runningBalance };
    });
  }, [myPurchaseData, mySaleData]);

  // Date filter
  useEffect(() => {
    if (!dateRange || dateRange.length !== 2 || !dateRange[0] || !dateRange[1]) {
      setFilteredStatement(statementWithBalance);
      return;
    }

    const [start, end] = dateRange;
    const filtered = statementWithBalance.filter(
      e => dayjs(e.date).isSameOrAfter(start, "day") && dayjs(e.date).isSameOrBefore(end, "day")
    );
    setFilteredStatement(filtered);
  }, [dateRange, statementWithBalance]);

  const handleCurrencyStatement = (e) => {

    setSelectedCurrency(e);
  }

  const handlePrintStatement = (dataToPrint) => {
    if (!selectedCurrency) return;

    const newWindow = window.open("", "_blank");
    if (!newWindow) return;
    const totalCredit = dataToPrint.reduce((sum, r) => sum + (r.localCredit || 0), 0);
    const totalcrQty = dataToPrint.reduce((sum, r) => sum + (r.crQuantity || 0), 0);
    const totalDebit = dataToPrint.reduce((sum, r) => sum + (r.localDebit || 0), 0);
    const totaldrQty = dataToPrint.reduce((sum, r) => sum + (r.drQuantity || 0), 0);
    const closingBalance = totalCredit - totalDebit;
    const qtyClosingBalance = totalcrQty - totaldrQty;
    const unit = dataToPrint[0]?.unit || "";
    newWindow.document.title = `Statement - ${mystocksData.fullname}`;
    let runningBalance = 0; // Initialize running balance
    let qtyrBalance = 0; // Initialize running balance

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
         <h1 style="margin: 0; text-align: center; font-size: 24px; color: #5a5b5cff;">Financial Statement</h1>
         <p><strong>Name:</strong> ${mystocksData.stockName}</p>
         <p><strong>Warehouse Manager:</strong> ${mystocksData.stockManager}</p>
         <p><strong>Country:</strong> ${mystocksData.country}</p>
         <p><strong>Currency: ${selectedCurrency}</strong></p>
       </div>
     </header>
 
     <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
       <thead>
         <tr>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Date</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Description</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">PurchaseQty</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc; ">PurchaseAmt</th>
           <th style="border:1px solid #dee2e6;padding:8px; background-color:#d9dddefc;">SalesQty</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">SalesAmt</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Amt-Blnce</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Qty-Blnce</th>
         </tr>
       </thead>
       <tbody>
         ${dataToPrint.map((e) => {
      const credit = e.localCredit || 0;
      const debit = e.localDebit || 0;
      const crQty = e.crQuantity || 0;
      const drQty = e.drQuantity || 0;
      const unit = e.unit || "";
      runningBalance += credit - debit; // running balance
      qtyrBalance += crQty - drQty; // running balance
      return `
             <tr>
               <td style="border:1px solid #dee2e6;padding:8px;">${dayjs(e.date).format("DD/MM/YYYY")}</td>
               <td style="border:1px solid #dee2e6;padding:8px;">${e.description || ""}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;background-color:#cbe3cb;">${crQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right; background-color:#cbe3cb;">${credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="border:1px solid #dee2e6;padding:8px;text-align:right;  background-color:#e3c2bc;">${drQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;background-color:#e3c2bc;">${debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;color:${runningBalance < 0 ? "red" : "black"};">${runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;color:${qtyrBalance < 0 ? "red" : "black"};">${qtyrBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
             </tr>
           `;
    }).join("")}
       </tbody>
       <tfoot>
         <tr>
           <td colspan="2" style="font-weight:bold;border:1px solid #dee2e6;padding:8px;">Totals</td>
          <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalcrQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right; ">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totaldrQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${qtyClosingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
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
       Generated on ${dayjs().format("DD/MM/YYYY HH:mm")}<br/>
       Powered by ${branding[0].name}
     </footer>
 </div>
     `;


    newWindow.print();
  };
  //USD statement
  const handleUSDData = () => {

    if (!mystocksData) return toast.error("Select a stock first to get statement!");
    if (!selectedCurrency) return toast.error("Select Currency");

    // Use filtered statement if exists, otherwise full statement
    let dataToPrint = filteredStatement.length ? filteredStatement : statementWithBalance;

    handleUSDStatement(dataToPrint);
  };

  const handleUSDStatement = (dataToPrint) => {
    if (!selectedCurrency) return;

    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    const totalCredit = dataToPrint.reduce((sum, r) => sum + (r.credit || 0), 0);
    const totalcrQty = dataToPrint.reduce((sum, r) => sum + (r.crQuantity || 0), 0);
    const totalDebit = dataToPrint.reduce((sum, r) => sum + (r.debit || 0), 0);
    const totaldrQty = dataToPrint.reduce((sum, r) => sum + (r.drQuantity || 0), 0);
    const closingBalance = totalCredit - totalDebit;
    const qtyClosingBalance = totalcrQty - totaldrQty;
    const unit = dataToPrint[0]?.unit || "";
    let runningBalance = 0; // Initialize running balance
    let qtyrBalance = 0; // Initialize running balance
    newWindow.document.title = `Statement - ${mystocksData.fullname}`;

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
         <h1 style="margin: 0; text-align: center; font-size: 24px; color: #5a5b5cff;">Financial Statement</h1>
         <p><strong>Name:</strong> ${mystocksData.stockName}</p>
         <p><strong>Warehouse Manager:</strong> ${mystocksData.stockManager}</p>
         <p><strong>Country:</strong> ${mystocksData.country}</p>
         <p><strong>Currency: ${selectedCurrency}</strong></p>
       </div>
     </header>
 
     <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
       <thead>
         <tr>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Date</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Description</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">PurchaseQty</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc; ">PurchaseAmt</th>
           <th style="border:1px solid #dee2e6;padding:8px; background-color:#d9dddefc;">SalesQty</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">SalesAmt</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Amt-Blnce</th>
           <th style="border:1px solid #dee2e6;padding:8px;background-color:#d9dddefc;">Qty-Blnce</th>
         </tr>
       </thead>
       <tbody>
         ${dataToPrint.map((e) => {
      const credit = e.credit || 0;
      const debit = e.debit || 0;
      const crQty = e.crQuantity || 0;
      const drQty = e.drQuantity || 0;
      const unit = e.unit || "";
      runningBalance += credit - debit; // running balance
      qtyrBalance += crQty - drQty; // running balance
      return `
             <tr>
               <td style="border:1px solid #dee2e6;padding:8px;">${dayjs(e.date).format("DD/MM/YYYY")}</td>
               <td style="border:1px solid #dee2e6;padding:8px;">${e.description || ""}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;background-color:#cbe3cb;">${crQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right; background-color:#cbe3cb;">${credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="border:1px solid #dee2e6;padding:8px;text-align:right;  background-color:#e3c2bc;">${drQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;background-color:#e3c2bc;">${debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;color:${runningBalance < 0 ? "red" : "black"};">${runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;color:${qtyrBalance < 0 ? "red" : "black"};">${qtyrBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
             </tr>
           `;
    }).join("")}
       </tbody>
       <tfoot>
         <tr>
           <td colspan="2" style="font-weight:bold;border:1px solid #dee2e6;padding:8px;">Totals</td>
          <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalcrQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right; ">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totaldrQty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${qtyClosingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}</td>
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
       Generated on ${dayjs().format("DD/MM/YYYY HH:mm")}<br/>
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
          stock Financial Statements:
        </h1>
        <Button type="text" className='!bg-orange-400 !text-white md:!w-25 !w-25 md:!text-lg hover:!bg-green-500 !font-bold !shadow-lg !shadow-black' onClick={showModal}>
          <PrinterOutlined className='!font-bold md:!text-2xl' />
        </Button>

        <Modal title="Print stock Statement" footer={null} open={isModalOpen} onCancel={() => setIsModalOpen(false)} className='md:!w-100 !w-80'>
          <Form layout="vertical">
            <Form.Item label="stock Name" name="warehouseId" rules={[{ required: true, message: "Please select a stock" }]}>
              <Select onChange={handleStockManagement} showSearch placeholder="Select a stock" optionFilterProp="label" options={allStocks.map(s => ({ label: `${s.stockName}  `, value: s._id }))} />
            </Form.Item>

            <Form.Item label="Currency" name="currencyId" rules={[{ required: true, message: "Please select a Currency" }]}>
              <Select onChange={handleCurrencyStatement} showSearch placeholder="Select a Currency" optionFilterProp="label" options={myCurrency.map(s => ({ label: s, value: s }))} />
            </Form.Item>

            <Form.Item label="Select Date">
              <RangePicker className="!w-[100%]" value={dateRange.length ? dateRange : undefined} onChange={(dates) => setDateRange(dates || [])} allowClear />
            </Form.Item>

            <Form.Item>
              <Button className='!bg-zinc-500' onClick={handleData}>
                <PrinterOutlined className='md:!text-2xl !w-full !font-bold !text-white !p-4' />
              </Button>
            </Form.Item>

            <Form.Item>
              <span className='p-2 items-center flex'>Click here to get all Statement in USD</span>
              <hr className='!text-zinc-200 mb-3' />
              <Button className='!bg-blue-500 !text-white' onClick={handleUSDData}>
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
