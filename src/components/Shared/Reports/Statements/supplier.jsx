import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, Select, DatePicker, Modal, notification } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import dayjs from "dayjs";
import { PrinterOutlined } from '@ant-design/icons';
import { fetchSuppleirs } from '../../../../redux/slices/supplierSlice';
import { fetchPurchase } from '../../../../redux/slices/purchaseSlice';
import { fetchPayment } from '../../../../redux/slices/paymentSlice';

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { toast } from 'react-toastify';

//get branding info: 
const branding = JSON.parse(localStorage.getItem("branding"))
console.log("b", branding)
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
  const [isModalOpen, setIsModalOpen] = useState(false);


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
      localCredit: p?.totalLocalCost || 0,
      localDebit: 0,
      currency: p.currency,
      quantity: p.quantity,
      unit: p.unit
    }));

    const paymentEntries = myPaymentData.map(p => ({
      date: new Date(p.createdAt),
      description: p?.description || "Payment",
      credit: 0,
      debit: p?.amount || 0,
      localCredit: 0,
      localDebit: p?.exchangedAmt || 0,
      currency: p.currency,
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


  const handleCurrencyStatement = (e) => {

    setSelectedCurrency(e)
  }

  // data to print

  const handleData = () => {
    // if (!mySupplierData) return message.error("No supplier selected!");
    if (!mySupplierData) return toast.error("Select a supplier first to get statetment!");
    if (!selectedCurrency) return toast.error("Select Currency");

    // Decide which data to use based on selected currency
    let dataToPrint = filteredStatement.length ? filteredStatement : statementWithBalance;

    if (selectedCurrency !== "USD") {
      // Filter only rows that match the selected local currency
      dataToPrint = dataToPrint.filter((r) => r.currency === selectedCurrency);
    }
    if (!dataToPrint.length) return toast.alert("No data to print for selected currency!");

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
        src="https://stockmanagement-f.vercel.app/logo.png" 
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
  <p><strong>Name:</strong> ${mySupplierData.fullname}
  </p>
  <p><strong>Account No:</strong> ${mySupplierData.accountNo}
  </p>
  <p><strong>Mobile:</strong> ${mySupplierData.mobile}
  </p>
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
                <td style="border:1px solid #dee2e6;padding:8px;text-align:right;color:${balance < 0 ? "red" : "black"
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
  Generated on ${dayjs().format("YYYY-MM-DD HH:mm")}<br/>
  Powered by ${branding[0].name}
</footer>
    </div>
  `;


    newWindow.print();
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  return (
    <div className=' md:min-h-50 md:grid md:grid-cols-4 p-4'>
      <div className=' flex flex-col gap-4 p-2'>
       
        <Button
          type="text"
          className='!bg-orange-400 !text-white !text-lg hover:!bg-blue-300 !font-bold !shadow-sm'
          onClick={showModal}
        >
          Print Supplier Statement
        </Button>
        <Modal
          title="Print Supplier Statement"
          footer={null}
          // closable={{ 'aria-label': 'Custom Close Button' }}
          open={isModalOpen}
          // onOk={()=>setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        >
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
              rules={[{ required: true, message: "Please select a Currency" }]}
            >
              <Select
                onChange={(e) => handleCurrencyStatement(e)}
                showSearch
                placeholder="Select a Currency"
                optionFilterProp="label"
                options={myCurrency.map(s => ({ label: s, value: s }))}
              />
            </Form.Item>
            <Form.Item
              label="Select Date"
            >
              <RangePicker classname="!w-[600px]"
                value={dateRange.length ? dateRange : null}
                onChange={(dates) => setDateRange(dates || [])}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item

            >
              <Button
                className='!bg-zinc-500'
                onClick={handleData}
              // disabled={!sId}
              >
                <PrinterOutlined className='md:!text-2xl !w-full !font-bold !text-white !p-4' />
              </Button>
            </Form.Item>

          </Form>

        </Modal>


      </div>

      <div className='md:col-span-3 bg-blue-50 flex justify-center items-center'>
        {/* Optional live preview */}
      </div>
    </div>
  );
};

export default Statements;
