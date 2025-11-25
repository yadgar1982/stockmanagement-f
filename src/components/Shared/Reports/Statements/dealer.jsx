import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, Select, DatePicker, Modal } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import dayjs from "dayjs";
import { PrinterOutlined } from '@ant-design/icons';
import { fetchDealer } from '../../../../redux/slices/dealerSlice';
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

  const [dId, setDId] = useState(null);
  const [myDealersData, setMyDealersData] = useState(null);
  const [myPurchaseData, setMyPurchaseData] = useState([]);
  const [mySaleData, setMySaleData] = useState([]);
  const [myPaymentData, setMyPaymentData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [filteredStatement, setFilteredStatement] = useState([]);
  const [myCurrency, setMyCurrency] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { dealers } = useSelector(state => state.dealers);
  const allDealers = dealers?.data || [];

  const { purchase: purchases } = useSelector(state => state.purchase);
  const allPurchase = purchases || [];

  const { sale: sales } = useSelector(state => state.sale);
  const allSales = sales || [];

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
  const handleDealerStatement = (value) => {
    setDId(value);
  };
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
      date: new Date(p.paymentDate),
      description: p?.description || "Payment",
      credit: 0,
      debit: p?.amount || 0,
      localCredit: 0,
      localDebit: p?.exchangedAmt || 0,
      currency: p.currency,
    }));

    const allEntries = [...purchaseEntries, ...salesEntries, ...paymentEntries].sort((a, b) => a.date - b.date);

    // Extract currencies
    const currencies = [...new Set(allEntries.map(item => item.currency))];
    setMyCurrency(currencies);

    let runningBalance = 0;
    return allEntries.map(entry => {
      runningBalance += entry.credit - entry.debit;
      return { ...entry, balance: runningBalance };
    });
  }, [myPurchaseData, myPaymentData, mySaleData]);

  // Date filter
  useEffect(() => {
    if (!dateRange || dateRange.length !== 2 || !dateRange[0] || !dateRange[1]) {
      setFilteredStatement(statementWithBalance);
      return;
    }
    const [start, end] = dateRange;

    const filtered = statementWithBalance.filter(
      e =>
        dayjs(e.date).isSameOrAfter(start, "day") &&
        dayjs(e.date).isSameOrBefore(end, "day")
    );

    if (filtered.length === 0) {
      setFilteredStatement(null);
      return;
    }
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
         <p><strong>Name:</strong> ${myDealersData.fullname}</p>
         <p><strong>Account No:</strong> ${myDealersData.accountNo}</p>
         <p><strong>Mobile:</strong> ${myDealersData.mobile}</p>
         <p><strong>Currency: ${selectedCurrency}</strong></p>
       </div>
     </header>
 
     <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
       <thead>
         <tr>
           <th style="border:1px solid #dee2e6;padding:8px;">Date</th>
           <th style="border:1px solid #dee2e6;padding:8px;">Description</th>
           <th style="border:1px solid #dee2e6;padding:8px;">Credit</th>
           <th style="border:1px solid #dee2e6;padding:8px;">Debit</th>
           <th style="border:1px solid #dee2e6;padding:8px;">Balance</th>
         </tr>
       </thead>
       <tbody>
         ${dataToPrint.map((e) => {
      const credit = e.localCredit || 0;
      const debit = e.localDebit || 0;
      runningBalance += credit - debit; // running balance
      return `
             <tr>
               <td style="border:1px solid #dee2e6;padding:8px;">${dayjs(e.date).format("DD/MM/YYYY")}</td>
               <td style="border:1px solid #dee2e6;padding:8px;">${e.description || ""}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;">${credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;">${debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;color:${runningBalance < 0 ? "red" : "black"};">${runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
             </tr>
           `;
    }).join("")}
       </tbody>
       <tfoot>
         <tr>
           <td colspan="2" style="font-weight:bold;border:1px solid #dee2e6;padding:8px;">Totals</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
           <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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

    if (!myDealersData) return toast.error("Select a dealer first to get statement!");
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
     <div style="margin-top: 5px; text-align: left;">
     <h1 style="margin: 0; text-align: center; font-size: 24px; color: #5a5b5cff;">Financial Statement</h1>
     <p><strong>Name:</strong> ${myDealersData.fullname}
     </p>
     <p><strong>Account No:</strong> ${myDealersData.accountNo}
     </p>
     <p><strong>Mobile:</strong> ${myDealersData.mobile}
     </p>
     <p><strong>Currency: USD</strong></p>
   </div>
   </header>
      
   
         
         <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
           <thead>
             <tr>
               <th style="border:1px solid #dee2e6;padding:8px;">Date</th>
               <th style="border:1px solid #dee2e6;padding:8px;">Description</th>
               <th style="border:1px solid #dee2e6;padding:8px;">Credit</th>
               <th style="border:1px solid #dee2e6;padding:8px;">Debit</th>
               <th style="border:1px solid #dee2e6;padding:8px;">Balance</th>
             </tr>
           </thead>
           <tbody>
             ${dataToPrint
        .map((e) => {
          const credit = e.credit || 0;
          const debit = e.debit || 0;
          const balance = e.balance;
          return `
                 <tr>
                   <td style="border:1px solid #dee2e6;padding:8px;">${dayjs(
            e.date
          ).format("DD/MM/YYYY")}</td>
                   <td style="border:1px solid #dee2e6;padding:8px;">${e.description || ""}</td>
                   <td style="border:1px solid #dee2e6;padding:8px;text-align:right;">${credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                   <td style="border:1px solid #dee2e6;padding:8px;text-align:right;">${debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                   <td style="border:1px solid #dee2e6;padding:8px;text-align:right;color:${balance <= 0 ? "red" : "black"
            };">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                 </tr>
               `;
        })
        .join("")}
           </tbody>
           <tfoot>
             <tr>
               <td colspan="2" style="font-weight:bold;border:1px solid #dee2e6;padding:8px;">Totals</td>
               <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
          Dealer Financial Statements:
        </h1>
        <Button type="text" className='!bg-orange-400 !text-white md:!w-25 !w-25 md:!text-lg hover:!bg-green-500 !font-bold !shadow-lg !shadow-black' onClick={showModal}>
          <PrinterOutlined className='!font-bold md:!text-2xl' />
        </Button>

        <Modal title="Print Dealer Statement" footer={null} open={isModalOpen} onCancel={() => setIsModalOpen(false)} className='md:!w-100 !w-80'>
          <Form layout="vertical">
            <Form.Item label="Dealer Name" name="dealerId" rules={[{ required: true, message: "Please select a dealer" }]}>
              <Select onChange={handleDealerStatement} showSearch placeholder="Select a dealer" optionFilterProp="label" options={allDealers.map(s => ({ label: `${s.fullname}  ( Acc No: ${s.accountNo} )`, value: s._id }))} />
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