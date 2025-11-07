import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, Select, DatePicker } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import dayjs from "dayjs";

import { fetchSuppleirs } from '../../../../redux/slices/supplierSlice';
import { fetchPurchase } from '../../../../redux/slices/purchaseSlice';
import { fetchPayment } from '../../../../redux/slices/paymentSlice';

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { toast } from 'react-toastify';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const { RangePicker } = DatePicker;

const Statements = () => {
  const dispatch = useDispatch();

  const [sId, setSId] = useState(null);
  const [mySupplierData, setMySupplierData] = useState(null);
  const [myPurchaseData, setMyPurchaseData] = useState([]);
  const [myPaymentData, setMyPaymentData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [filteredStatement, setFilteredStatement] = useState([]);
  const [myCurrency, setMyCurrency] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState([]);
  console.log("Selected Currency",selectedCurrency)
  const { suppliers } = useSelector(state => state.suppliers);
  const allSuppliers = suppliers?.data || [];
  const { purchase: purchases } = useSelector(state => state.purchase);
  const allPurchase = purchases || [];
  const { payment: payments } = useSelector(state => state.payments);
  const allPayment = payments || [];
   

  // Fetch data
  useEffect(() => {
    dispatch(fetchSuppleirs());
    dispatch(fetchPurchase());
    dispatch(fetchPayment());
  }, [dispatch]);
console.log("my cur",myCurrency)

  
  // Supplier selection
  const handleSupplierStatement = (value) => {
    setSId(value);
  };

  // Prepare supplier purchase/payment data
  useEffect(() => {
    if (!sId) return;
    const supplierData = allSuppliers.find(s => s._id === sId);
    setMySupplierData(supplierData);

    setMyPurchaseData(allPurchase.filter(p => p.supplierId === sId));
    setMyPaymentData(allPayment.filter(p => p.supplierId === sId));

      // Reset filter
    setFilteredStatement([]);
    setDateRange([]);
  }, [sId, allSuppliers, allPurchase, allPayment]);

  // Statement with running balance
  const statementWithBalance = useMemo(() => {
    const purchaseEntries = myPurchaseData.map(p => ({
      date: new Date(p.purchaseDate || p.createdAt),
      description: p.description || "Purchase",
      credit: p.totalCost || 0,
      debit: 0,
      localCredit:p?.exchangedAmt||0,
      localDebit:0,
      currency:p.currency,
    }));

    const paymentEntries = myPaymentData.map(p => ({
      date: new Date(p.createdAt),
      description: p?.description || "Payment",
      credit: 0,
      debit: p?.amount || 0,
      localCredit:0,
      localDebit:p?.exchangedAmt ||0,
      currency:p.currency,
    }));

    const allEntries = [...purchaseEntries, ...paymentEntries].sort((a, b) => a.date - b.date);
    
    //sort currency
   const currencies = [...new Set(allEntries.map((item) => item.currency))];
    setMyCurrency(
      currencies
    );      

    let runningBalance = 0;
    return allEntries.map(entry => {
      runningBalance += entry.credit - entry.debit;
      return { ...entry, balance: runningBalance };
    });
  }, [myPurchaseData, myPaymentData]);

  // Date filter
 useEffect(() => {
  if (!dateRange || dateRange.length !== 2 || !dateRange[0] || !dateRange[1]) {
    // If no dates selected, show full statement
    setFilteredStatement(statementWithBalance);
    return;
  }

  const [start, end] = dateRange;

  const filtered = statementWithBalance.filter(
    e =>
      dayjs(e.date).isSameOrAfter(start, "day") &&
      dayjs(e.date).isSameOrBefore(end, "day")
  );

  setFilteredStatement(filtered);
}, [dateRange, statementWithBalance]);


const handleCurrencyStatement=(e)=>{
  console.log("selectedCurrency",e)
  setSelectedCurrency(e)
}
  // const handleData=()=>{
  //    const dataToPrint = filteredStatement.length ? filteredStatement : statementWithBalance;
  //     if (!mySupplierData || !dataToPrint.length) return alert("No data to print!");
  //   // const totalCredit = dataToPrint.reduce((sum, r) => sum + (r.credit || 0), 0);
  //   // const totalLocalCredit = dataToPrint.reduce((sum, r) => sum + (r.localCredit || 0), 0);
  //   // const totalDebit = dataToPrint.reduce((sum, r) => sum + (r.debit || 0), 0);
  //   // const totalLocalDebit = dataToPrint.reduce((sum, r) => sum + (r.localDebit || 0), 0);
  //   // const closingBalance = totalCredit - totalDebit;
  //   // const closingBalanceLocal = totalLocalCredit - totalLocalDebit;
  //   if(selectedCurrency){
  //  handlePrintStatement(dataToPrint)
  //   }else{
  //     toast.error("Please select your currency")
  //   }
    
  // }

    // Print statement
//  const handlePrintStatement = (dataToPrint) => {
//   const newWindow = window.open("", "_blank");
//   if (!newWindow) return;

//   const totalCredit = dataToPrint.reduce((sum, r) => sum + (r.credit || 0), 0);
//   const totalDebit = dataToPrint.reduce((sum, r) => sum + (r.debit || 0), 0);
//   const closingBalance = totalCredit - totalDebit;

//   newWindow.document.title = `Statement - ${mySupplierData.fullname}`;

//   newWindow.document.body.innerHTML = `
//     <div style="font-family: Arial; padding: 10px; background: white; color: #212529;">
//       <header style="text-align: center; margin-bottom: 20px;">
//         <h1>Financial Statement</h1>
//         <h2>${mySupplierData.fullname}</h2>
//       </header>
//       <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
//         <thead>
//           <tr>
//             <th style="border:1px solid #dee2e6;padding:8px;">Date</th>
//             <th style="border:1px solid #dee2e6;padding:8px;">Description</th>
//             <th style="border:1px solid #dee2e6;padding:8px;">Credit</th>
//             <th style="border:1px solid #dee2e6;padding:8px;">Debit</th>
//             <th style="border:1px solid #dee2e6;padding:8px;">Balance</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${dataToPrint.map(e => `
//             <tr>
//               <td style="border:1px solid #dee2e6;padding:8px;">${dayjs(e.date).format("YYYY-MM-DD")}</td>
//               <td style="border:1px solid #dee2e6;padding:8px;">${e.description || ""}</td>
//               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;">${Number(e.credit || 0).toFixed(2)}</td>
//               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;">${Number(e.debit || 0).toFixed(2)}</td>
//               <td style="border:1px solid #dee2e6;padding:8px;text-align:right;color:${e.balance < 0 ? "red":"black"};">${Number(e.balance || 0).toFixed(2)}</td>
//             </tr>
//           `).join("")}
//         </tbody>
//         <tfoot>
//           <tr>
//             <td colspan="2" style="font-weight:bold;border:1px solid #dee2e6;padding:8px;">Totals</td>
//             <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalCredit.toFixed(2)}</td>
//             <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalDebit.toFixed(2)}</td>
//             <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${closingBalance.toFixed(2)}</td>
//           </tr>
//         </tfoot>
//       </table>
//       <footer style="margin-top:40px;text-align:center;font-size:12px;color:#868e96;">
//         Generated on ${dayjs().format("YYYY-MM-DD HH:mm")}<br/>
//         Powered by Your Company Name
//       </footer>
//     </div>
//   `;

//   newWindow.print();
// };

const handleData = () => {
  if (!mySupplierData) return alert("No supplier selected!");
  if (!selectedCurrency) return toast.error("Please select your currency");

  // Decide which data to use based on selected currency
  let dataToPrint = filteredStatement.length ? filteredStatement : statementWithBalance;

  if (selectedCurrency !== "USD") {
    // Filter only rows that match the selected local currency
    dataToPrint = dataToPrint.filter((r) => r.currency === selectedCurrency);
  }
  if (!dataToPrint.length) return alert("No data to print for selected currency!");

  // Totals
  const totalCredit = dataToPrint.reduce(
    (sum, r) => sum + (selectedCurrency === "USD" ? r.credit || 0 : r.localCredit || 0),
    0
  );
  const totalDebit = dataToPrint.reduce(
    (sum, r) => sum + (selectedCurrency === "USD" ? r.debit || 0 : r.localDebit || 0),
    0
  );
  const closingBalance = totalCredit - totalDebit;

  handlePrintStatement(dataToPrint);
};
const handlePrintStatement = (dataToPrint) => {
  if (!selectedCurrency) return;

  const newWindow = window.open("", "_blank");
  if (!newWindow) return;

  // Decide which values to use based on currency
  const isUSD = selectedCurrency === "USD";

  const totalCredit = dataToPrint.reduce(
    (sum, r) => sum + (isUSD ? r.credit || 0 : r.localCredit || 0),
    0
  );
  const totalDebit = dataToPrint.reduce(
    (sum, r) => sum + (isUSD ? r.debit || 0 : r.localDebit || 0),
    0
  );
  const closingBalance = totalCredit - totalDebit;

  newWindow.document.title = `Statement - ${mySupplierData.fullname}`;

  newWindow.document.body.innerHTML = `
    <div style="font-family: Arial; padding: 10px; background: white; color: #212529;">
      <header style="text-align: center; margin-bottom: 20px;">
        <h1>Financial Statement</h1>
        <h2>${mySupplierData.fullname}</h2>
      </header>
      <p><strong>Currency:</strong> ${selectedCurrency}</p>
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
              const credit = isUSD ? e.credit || 0 : e.localCredit || 0;
              const debit = isUSD ? e.debit || 0 : e.localDebit || 0;
              const balance = isUSD ? e.balance || 0 : (e.localCredit || 0) - (e.localDebit || 0);
              return `
              <tr>
                <td style="border:1px solid #dee2e6;padding:8px;">${dayjs(
                  e.date
                ).format("YYYY-MM-DD")}</td>
                <td style="border:1px solid #dee2e6;padding:8px;">${e.description || ""}</td>
                <td style="border:1px solid #dee2e6;padding:8px;text-align:right;">${credit.toFixed(
                  2
                )}</td>
                <td style="border:1px solid #dee2e6;padding:8px;text-align:right;">${debit.toFixed(
                  2
                )}</td>
                <td style="border:1px solid #dee2e6;padding:8px;text-align:right;color:${
                  balance < 0 ? "red" : "black"
                };">${balance.toFixed(2)}</td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="font-weight:bold;border:1px solid #dee2e6;padding:8px;">Totals</td>
            <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalCredit.toFixed(
              2
            )}</td>
            <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${totalDebit.toFixed(
              2
            )}</td>
            <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;">${closingBalance.toFixed(
              2
            )}</td>
          </tr>
        </tfoot>
      </table>
      <footer style="margin-top:40px;text-align:center;font-size:12px;color:#868e96;">
        Generated on ${dayjs().format("YYYY-MM-DD HH:mm")}<br/>
        Powered by Your Company Name
      </footer>
    </div>
  `;

  newWindow.print();
};

  return (
    <div className='bg-yellow-200 md:min-h-50 md:grid md:grid-cols-4 p-4'>
      <div className='bg-zinc-50 flex flex-col gap-4 p-2'>
        <h1 className='md:text-2xl font-bold mb-4 ml-2'>Supplier Reports:</h1>
        <Form layout="vertical">
          <Form.Item
            label="Supplier Name"
            name="supplierId"
            rules={[{ required: true, message: "Please select a supplier" }]}
          >
            <Select
              onChange={handleSupplierStatement}
              showSearch
              placeholder="Select a Supplier"
              optionFilterProp="label"
              options={allSuppliers.map(s => ({ label: s.fullname, value: s._id }))}
            />
          </Form.Item>
          <Form.Item
            label="Currency"
            name="currencyId"
            rules={[{ required: true, message: "Please select a supplier" }]}
          >
            <Select
              onChange={(e)=>handleCurrencyStatement(e)}
              showSearch
              placeholder="Select a Currency"
              optionFilterProp="label"
              options={myCurrency.map(s => ({ label: s, value: s }))}
            />
          </Form.Item>
        </Form>

        <div className=' justify-center w-full items-center'>
          <span className='font-semibold mr-2'>Select Date Range:</span>
          <RangePicker classname="!w-[600px]"
            value={dateRange.length ? dateRange : null} 
            onChange={(dates) => setDateRange(dates || [])} 
            allowClear
            style={{ width: '100%' }}
          />
            
        </div>

        <Button
          type="primary"
          onClick={handleData}
          disabled={!sId}
        >
          Print Statement
        </Button>
      </div>

      <div className='md:col-span-3 bg-blue-50 flex justify-center items-center'>
        {/* Optional live preview */}
      </div>
    </div>
  );
};

export default Statements;
