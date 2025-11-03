import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, Select, DatePicker } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import dayjs from "dayjs";

import { fetchSuppleirs } from '../../../../redux/slices/supplierSlice';
import { fetchPurchase } from '../../../../redux/slices/purchaseSlice';
import { fetchPayment } from '../../../../redux/slices/paymentSlice';

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

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
    }));

    const paymentEntries = myPaymentData.map(p => ({
      date: new Date(p.createdAt),
      description: p.description || "Payment",
      credit: 0,
      debit: p.amount || 0,
    }));

    const allEntries = [...purchaseEntries, ...paymentEntries].sort((a, b) => a.date - b.date);

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

  // Print statement
  const handlePrintStatement = () => {
    const dataToPrint = filteredStatement.length ? filteredStatement : statementWithBalance;
    if (!mySupplierData || !dataToPrint.length) return alert("No data to print!");

    const totalCredit = dataToPrint.reduce((sum, r) => sum + (r.credit || 0), 0);
    const totalDebit = dataToPrint.reduce((sum, r) => sum + (r.debit || 0), 0);
    const closingBalance = totalCredit - totalDebit;

    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    newWindow.document.title = `Statement - ${mySupplierData.fullname}`;

    // Build HTML as string and set body
    newWindow.document.body.innerHTML = `
      <div style="font-family: Arial; padding: 10px; background: white; color: #212529;">
        <header style="text-align: center; margin-bottom: 20px;">
          <h1>Financial Statement</h1>
          <h2>${mySupplierData.fullname}</h2>
        </header>
        <div style="margin-bottom: 30px;">
          <p><strong>Address:</strong> ${mySupplierData.country || ""}</p>
          <p><strong>Phone:</strong> ${mySupplierData.mobile || ""}</p>
          <p><strong>Email:</strong> ${mySupplierData.email || ""}</p>
          <p><strong>Currency:</strong> ${mySupplierData.currency || "USD"}</p>
        </div>
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
            ${dataToPrint.map(e => `
              <tr>
                <td style="border:1px solid #dee2e6;padding:8px;text-align:left;font-size:14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;max-width:120px;">${dayjs(e.date).format("YYYY-MM-DD")}</td>
                <td style="border:1px solid #dee2e6;padding:8px;text-align:left;font-size:14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;max-width:120px;word-wrap: break-word;">${e.description || ""}</td>
                <td style="border:1px solid #dee2e6;padding:8px;text-align:right;font-size:14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;max-width:120px;">${Number(e.credit.toFixed(2)).toLocaleString(undefined, { minimumFractionDigits: 2, aximumFractionDigits: 2 })}</td>
                <td style="border:1px solid #dee2e6;padding:8px;text-align:right;font-size:14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;max-width:120px;">${Number(e.debit.toFixed(2)).toLocaleString(undefined, { minimumFractionDigits: 2, aximumFractionDigits: 2 })}</td>
                <td style="border:1px solid #dee2e6;padding:8px;text-align:right;font-size:14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;max-width:120px;color: ${e.balance < 0 ? 'red' : 'black'}">${Number(e.balance.toFixed(2)).toLocaleString(undefined, { minimumFractionDigits: 2, aximumFractionDigits: 2 })}</td>
      
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="font-weight:bold;border:1px solid #dee2e6;padding:8px;">Totals</td>
              <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;font-size:14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;max-width:120px;"">${Number(totalCredit.toFixed(2)).toLocaleString(undefined, { minimumFractionDigits: 2, aximumFractionDigits: 2 })}</td>
              <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px;text-align:right;font-size:14px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;max-width:120px;">${Number(totalDebit.toFixed(2)).toLocaleString(undefined, { minimumFractionDigits: 2, aximumFractionDigits: 2 })}
</td>
              <td style="font-weight:bold;border:1px solid #dee2e6;padding:8px; text-align:right;">${Number(closingBalance.toFixed(2)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
        </Form>

        <div>
          <span className='font-semibold mr-2'>Select Date Range:</span>
          <RangePicker
            value={dateRange.length ? dateRange : null} 
            onChange={(dates) => setDateRange(dates || [])} 
            allowClear
          />
        </div>

        <Button
          type="primary"
          onClick={handlePrintStatement}
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
