import React from 'react'
import dayjs from "dayjs"


import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Table, Popconfirm, } from "antd"
import UserLayout from '../../UserLayout';
import TextArea from 'antd/es/input/TextArea';
import { DatePicker } from 'antd';
import { ToastContainer, toast } from "react-toastify";
import { http, fetcher } from "../../../Modules/http";
import Cookies from "universal-cookie";
import useSWR, { mutate } from "swr";
import { CheckOutlined, DeleteOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';
import { countries } from "../../countries/countries";
const cookies = new Cookies();
const { Option } = Select;
import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomers } from '../../../../redux/slices/customerSlice';
import { fetchSales } from '../../../../redux/slices/salesSlice';
// import { fetchStock } from '../../../redux/slices/stockSlice';
import { fetchCompany } from '../../../../redux/slices/companySlice';
// import { fetchDealer } from '../../../redux/slices/dealerSlice';
import { fetchCurrency } from '../../../../redux/slices/currencySlice';
import ExchangeCalculator from '../exchangeCalc';



const CustomerPayment = () => {
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const token = cookies.get("authToken")
  const [unit, setUnit] = useState("");
  const [amount, setAmount] = useState(0);
  const [exchange, setExchange] = useState(0)
  const [crncy, setCrncy] = useState("") // this is for currency state for payment data entry 
  const [cr, setCr] = useState("") // this is for Due amount showing currency
  const [exchangedAmt, setExchangedAmt] = useState(1)
  const [productamount, setProductamount] = useState(null);
  const [productUnit, setProductUnit] = useState(null);
  const [totalpayment, setTotalpayment] = useState([])
  const [edit, setEdit] = useState(false)
  const [customerData, setCustomerData] = useState(null);

  //for customer financial calculation states
  const [payment, setpayment] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalxPaid, setTotalxPaid] = useState(0);
  const [totalSaleAmount, setTotalSaleAmount] = useState(0);
  const [totalxSaleAmount, setTotalxSaleAmount] = useState(0);
  const [customerId, setCustomerId] = useState("");



  //get branding
  const branding = JSON.parse(localStorage.getItem("branding") || "null");

  // fetch data from redux:
  const { customers, loading, error } = useSelector((state) => state.customers);
  const allCustomers = customers?.data || [];
  const customer = allCustomers.map((item) => ({
    customerName: item.fullname,
    customerId: item._id,
    customerAcc: item.accountNo,
    customerMobile: item.mobile,
    customerCountry: item.country,
    customerEmail: item.email,

  }))

  const customerOptions = customer.map((s) => ({
    label: s.customerName,
    value: s.customerId
  }))
  const { sale, srloading, srerror } = useSelector((state) => state.sale);
  const allSales = sale?.data || [];
  const sold = allSales.map((item) => ({
    productName: item.productName,
    productId: item._id,
  }));


  const { companys, cloading, cerror } = useSelector((state) => state.company);
  const allCompanies = companys?.data || [];
  const company = allCompanies.map((item) => ({
    companyName: item.fullname,
    companyId: item._id
  }));
  const companyOptions = company.map((com) => ({
    label: com.companyName,
    value: com.companyId
  }))

  const { currencies, crloading, crerror } = useSelector((state) => state.currencies);
  const allCurrencies = currencies?.data || [];
  const currency = allCurrencies.map((item) => ({
    currencyName: item.currency,
    rate: item.rate,
    dealerId: item._id,
  }));
  const currencyOptions = currency.map((cur) => ({
    label: cur.currencyName,
    value: cur.currencyName,
  }))

  useEffect(() => {
    dispatch(fetchCustomers())
    dispatch(fetchSales())
    // dispatch(fetchStock())
    dispatch(fetchCompany())
    dispatch(fetchCurrency())
    // dispatch(fetchDealer())

  }, [])

  const transactionType=[
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'mobile_payment', label: 'Mobile Payment' },
  { value: 'other', label: 'Other' },
  ]

   const paymentType = [
  { value: 'cr', label: 'Credit' },
  { value: 'dr', label: 'Debit' },
 ];
  //fetch payment all data
  const { data: paymentData, error: pError } = useSWR("/api/payment/get", fetcher);

  useEffect(() => {
    if (paymentData && paymentData?.data) {
      setTotalpayment(paymentData?.data);
    }
  }, [paymentData])



  //get all supppliers
  const handleCus = async (id) => {
    const httpReq = http();
    const { data } = await httpReq.get(`/api/customer/get/${id}`);
    setCustomerId(data)
    return data;
  }

  const customerChange = async (id) => {
    await handleCus(id);

    const httpReq = http();
    const { data } = await httpReq.get(`/api/customer/get/${id}`);

    const CustomerPayments = totalpayment.filter(i => i.customerId === id);
    const totalPaid = CustomerPayments.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalExPaid = CustomerPayments.reduce((sum, item) => sum + (item.exchangedAmt || 0), 0);
    const mycurrency = sale.find(cr => cr.customerId === id);
    const myNewCrncy = mycurrency?.currency

    setCr(myNewCrncy)
    setTotalPaid(totalPaid || 0)
    setTotalxPaid(totalExPaid || 0)
    const customerSale = sale.filter(i => i.customerId === id);
    const totalSaleAmount = customerSale.reduce((sum, item) => sum + (item.totalCost || 0), 0)
    const totalxSaleAmount = customerSale.reduce((sum, item) => sum + (item.quantity * item.exchangedAmt || 0), 0)
    setTotalSaleAmount(totalSaleAmount)
    setTotalxSaleAmount(totalxSaleAmount)
    setCustomerData(data);
  };

  // calculation of payments
  const amt = amount || 0;
  const totalReceivedFromCustomer = totalPaid || 0
  const totalCustomerSale = totalSaleAmount || 0
  console.log('t',totalCustomerSale)
  const totalDueAmount = Number(amt) + Number(totalReceivedFromCustomer) - Number(totalCustomerSale)

  const exAmt = exchangedAmt || 0;
  const totalxReceivedFromCustomer = totalPaid || 0
  const totalCustomerxSale = totalxSaleAmount || 0
  const totalExDueAmount = Number(exAmt) + Number(totalxReceivedFromCustomer) - Number(totalCustomerxSale)

  // get userName
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userName = userInfo?.fullname || "";

  //print function
    const handlePrint = async (record) => {
    try {
      const customer = await handleCus(record.customerId);
    

      // Open a new blank window
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (!printWindow) {
        alert("Please allow pop-ups for this site to view the receipt.");
        return;
      }

      // Use iframe with srcdoc — fully modern, avoids document.write
      const iframe = printWindow.document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      printWindow.document.body.appendChild(iframe);

      // HTML content
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>customer Payment Slip - ${record._id}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            margin: 40px;
            color: #222;
            background-color: #fff;
          }
         
          .company { width: 45%; font-size: 14px; line-height: 1.5; }
          .company strong { font-size: 15px; color: #111; }
          .customer { font-size: 14px; line-height: 1.5; margin-bottom: 20px; }
          h1 { text-align: center; margin: 10px 0 25px; font-size: 22px; text-transform: uppercase; color:#004085; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border:1px solid #999; padding:8px 10px; text-align:center; font-size:14px; }
          th { background-color:#f5f7fa; color:#333; }
          .summary { margin-top:25px; float:right; width:300px; border:1px solid #999; border-radius:5px; padding:12px; background-color:#f9f9f9; }
          .summary div { display:flex; justify-content:space-between; margin:4px 0; }
          .footer { text-align:center; font-size:13px; color:#777; margin-top:50px; border-top:1px solid #ccc; padding-top:10px; }
        </style>
      </head>
      <body>
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

</header>
   
        <div class="customer">
          <strong>Paid by:</strong><br>
          Name: ${customer?.fullname || "-"}<br>
          Address: ${customer?.country || "-"}<br>
          Phone: ${customer?.mobile || "-"}<br>
          Email: ${customer?.email || "-"}<br>
          Doc_No:   ${record?.paymentNo || "-"}<br>
        </div>
        <h1>customer Payment Receipt</h1>
        <table>
          <thead>
            <tr>
              <th>No</th><th>Payment Type</th><th>Transaction Type</th>
              <th>Currency</th><th>Amount</th><th>Exchanged Amount (${record.currency})</th>
              <th>Belongs To</th><th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>${record.paymentType || "-"}</td>
              <td>${record.transactionType || "-"}</td>
              <td>${record.currency || "-"}</td>
              <td>${Number(record.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${Number(record.exchangedAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${record.companyName || "-"}</td>
              <td>${record.description || "-"}</td>
            </tr>
          </tbody>
        </table>
      <div class="summary">
        <div>
          <span>Subtotal:</span> 
          <strong>${Number(record.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>
        <div>
          <span>Exchange (${record.currency}):</span> 
          <strong>${Number(record.exchangedAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>
        <hr>
        <div>
          <span><strong>Total Paid (USD):</strong></span> 
          <strong>${Number(record.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>
      </div>
          
        <div class="customer">
        <br><br><br>
          <strong>Processed by </strong>
          <span style="font-family: 'Brush Script MT', cursive; font-size:18px;color:blue;">
            ${userName || "......................."}
          </span>
        </div>
        <div class="footer" style="position: absolute; bottom: 0; width: 100%; text-align: center; font-size: 13px; color: #777; border-top: 1px solid #ccc; padding: 10px 0;">
                Thank you for your business with us!<br>
            If you have any questions, please contact our accounting department.
        </div>
        <script>
          window.onload = () => window.print(); 
        </script>
      </body>
      </html>
    `;

      // Set iframe srcdoc
      iframe.srcdoc = htmlContent;

    } catch (error) {
      console.error("Error printing:", error);
    }
  };


  //Delete 
  const handleDelete = async (obj) => {
    try {
      const paymentId = obj._id;

      const httpReq = http(token);

      // // Delete payment
      await httpReq.delete(`/api/payment/delete/${paymentId}`);
      toast.success("CustomerPayment record and customer transaction deleted successfully");
      mutate("/api/payment/get");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete payment record");
    }
  };
  
  const handleEdit = async (record) => {
    setCustomerData(record);
    setAmount(Number(record.amount));

    form.setFieldsValue({
      ...record,
      customerId: record.customerId,
      paymentDate: initialpaymentDate
    });

    setEdit(true); // set edit state with full rec

    const httpReq = http();
    const { data: payment } = await httpReq.get(`/api/payment/get/${record._id}`);
    return setpayment(payment);

  };

  const handleIspassed = async (id) => {
    try {
      const httpReq = http();
      await httpReq.put(`/api/payment/update/${id}`, { isPassed: true });
      toast.success("CustomerPayment marked as passed!");
      mutate("/api/payment/get");
    } catch (err) {
      toast.error("Failed to Pass!", err);
    }
  }

  //Table data
  const columns = [
    {
      title: "S.No",
      key: "Sno",
      width: 60,
      render: (text, record, index) => index + 1,
    },
    { title: <span className="text-sm md:!text-1xl font-semibold">Trans By</span>, dataIndex: 'transBy', key: 'transactionBy', width: 90 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Pay #</span>, dataIndex: 'paymentNo', key: 'paymentNo', width: 90 },
    {
      title: <span className="text-sm md:!text-1xl font-semibold">Pur-Date</span>, dataIndex: 'createdAt', key: 'createdAt', width: 110,
      render: (date) => date ? dayjs(date).format("MM/DD/YYYY") : "-",
    },
    { title: <span className="text-sm md:!text-1xl font-semibold">Amount</span>, dataIndex: 'amount', key: 'amount', width: 80 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Currency</span>, dataIndex: 'currency', key: 'currency', width: 20 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Exched Amt</span>, dataIndex: 'exchangedAmt', key: 'exchangedAmt', width: 60 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Trans-Type</span>, dataIndex: 'paymentType', key: 'p-type', width: 60 ,
       render: (text) => (
    <span
      style={{
        color: text.toLowerCase() === 'dr' ? 'red' : 'inherit', // red if 'dr', default otherwise
        fontWeight: 'bold',
      }}>
      {text}
    </span>
    )},
    { title: <span className="text-sm md:!text-1xl font-semibold">Belong To</span>, dataIndex: 'companyName', key: 'company', width: 60 },
    
    { title: <span className="text-sm md:!text-1xl font-semibold">Description</span>, dataIndex: 'description', key: 'description', width: 150 },

    // print
    {
      title: (
        <span className="text-sm md:text-base font-semibold text-white flex  md:!w-[8px]">
          Print
        </span>
      ),
      key: "print",
      fixed: "right",
      width: "0.5%",

      render: (_, record) => (
        <span
          onClick={() => handlePrint(record)}
          className="flex items-center justify-center cursor-pointer "
        >
          <PrinterOutlined className="!text-white !bg-zinc-600 p-2 rounded text-[14px]" />
        </span>
      ),
    },
    {
      title: (
        <span className="text-sm md:!text-1xl font-semibold !text-white flex  md:!w-[8px]">
          Edit
        </span>
      ),
      key: "edit",
      fixed: "right",
      width: "0.5%",
      render: (_, record) => (
        <a
          onClick={() => handleEdit(record)}
          className="flex items-center justify-center cursor-pointer"
        >
          <EditOutlined className="!text-white !bg-zinc-600 p-2 rounded text-[14px]" />
        </a>
      ),
    },

    {
      title: (
        <span className="text-sm md:!text-1xl font-semibold !text-white flex  md:!w-[8px]">
          Pass
        </span>
      ),
      key: "ispassed",
      width: "0.5%",
      align: "center",
      fixed: "right",
      render: (_, record) => (

        <Popconfirm
          title="Are you sure to Pass this CustomerPayment?"
          description="This action cannot be undone."
          okText="yes"
          cancelText="No"
          onConfirm={async () => handleIspassed(record._id)}
          className="flex items-center justify-center cursor-pointer"
        >

          <CheckOutlined className="!text-white !bg-green-600 p-2 rounded text-[14px]" />
        </Popconfirm>
      ),
    },
    {
      title: <span className="text-sm md:!text-1xl font-semibold  !text-white flex p-1 md:!w-[12px]">
        Trash
      </span>,
      key: 'delete',
      width: "0.5%",
      align: "center",
      fixed: "right",
      render: (_, obj) => (
        <Popconfirm
          title="Are you sure to delete this payment record?"
          description="This action cannot be undone."
          okText="yes"
          cancelText="No"
          onConfirm={async () => handleDelete(obj)}
          className="!text-white w-full !w-[100px] !rounded-full"
        >
          <a className="!text-white w-full  !rounded-full !justify-center"><DeleteOutlined className="!text-white !bg-red-600 p-2 rounded text-[14px]" /></a>
        </Popconfirm>
      )


    }

  ];

  const dataSource = paymentData?.data
  .filter(item => item.isPassed === false && item.entity === 'customer')
  .map(item => ({
    ...item,
    key: item._id, 
  }));
  //currency change
  const currencyChange = (e) => {

    const selectedCurrency = currency.find((i) => i.currencyName === e);
    if (selectedCurrency) {
      setCrncy(Number(selectedCurrency.rate))
    } else {
      console.log("Currency not found");
    }
  };



  const onFinish = async (values) => {
    const httpReq = http(token);

    try {
      // Find selected objects from arrays
      const selectedcustomer = customer.find(s => s.customerId === values.customerId);
      // const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      // const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      // const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);

      // 2 Prepare formatted values for payment
      const formattedValues = {
        ...values,
        soldate: values.soldate ? values.soldate.toDate() : null,
        customerName: selectedcustomer?.customerName,
        transBy: selectedcustomer?.customerName,
         entity: "customer",
        // productName: selectedProduct?.productName,
        companyName: selectedCompany?.companyName,
        // warehouseName: selectedStock?.stockName,
        // dealerName: selectedDealer?.dealerName,
        isPassed: false,
      };
      // Create payment

      await httpReq.post("/api/payment/create", formattedValues);
      toast.success("CustomerPayment record and transaction added successfully");
      mutate("/api/payment/get");
      form.resetFields();
      setCustomerData("");

    } catch (err) {
      console.error("Error in onFinish:", err);
      toast.error("Failed to register");
    }
  };


  const onUpdate = async (values) => {
    try {

      // 1️⃣ Find selected objects from arrays
      const selectedcustomer = customer.find(s => s.customerId === values.customerId);
      // const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      // const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      // const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);
      const httpReq = http(token);

      const formattedValues = {
        ...values,
        customerId: selectedcustomer?._id || values.customerId,
        customerName: selectedcustomer.customerName || values.customerName,
        transBy: selectedcustomer?.customerName,
        entity: "customer",
        // productId: selectedProduct?._id || values.productId,
        // productName: selectedProduct?.productName || values.productName,

        companyId: selectedCompany?._id || values.companyId,
        companyName: selectedCompany?.companyName || values.companyName,

        // warehouseId: selectedStock?._id || values.warehouseId,
        // warehouseName: selectedStock?.stockName || values.warehouseName,

        // dealerId: selectedDealer?._id || values.dealerId,
        // dealerName: selectedDealer?.dealerName || values.dealerName,
      };

      // Update payment
      await httpReq.put(`/api/payment/update/${values._id}`, formattedValues);
      mutate("/api/payment/get");
      form.resetFields();
      toast.success("Payment transaction updated successfully");
      setCustomerData("");
      setEdit(false);
    } catch (err) {
      console.error(err);
      toast.error("Update Failed");
    }
  };




  useEffect(() => {

    // Use its rate, fallback to 1 if not found
    const rate = crncy || 1;

    setExchange(rate);
  }, [crncy, currency]);


  useEffect(() => {
    setExchangedAmt(Number(amount) * exchange);
  }, [amount, exchange,crncy]); // only recalc when these change

  useEffect(() => {
    form.setFieldsValue({ exchangedAmt: exchangedAmt });
  }, [exchangedAmt, form]);



  const handleAmount = (value) => {
    setSelectAmount(value);

    if (Array.isArray(totalpayment)) {
      const filteredpayment = totalpayment.filter((p) => p.customerId === value)

      const calculatedamount = filteredpayment.reduce((sum, item) => sum + item.amount, 0);

      const unit = filteredpayment.length > 0 ? filteredpayment[0].unit : null;
      setProductUnit(unit);
      setProductamount(calculatedamount);
    } else {
      setProductamount(null);
      setProductUnit(null);
    }


  }

  const initialpaymentDate = customerData?.paymentDate
    ? dayjs(customerData.paymentDate, "DD-MM-YYYY")
    : null;
  return (
    <UserLayout>
      <div>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="p-4 bg-zinc-100">
          {/* CustomerPayment Form */}
          <div className='flex gap-4 items-center '>
            <h2 className='text-sm  md:text-2xl p-2 font-semibold text-zinc-600'>Make Payment to Customer</h2>
            <div> {customerData && (
              <div className=' mt-3 md:text-1xl text-white text-sm mb-2 bg-blue-800 p-2'>Total due Amount:
                <span className='font-bold text-yellow-400'> {(totalDueAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD </span>
              </div>
            )}</div>
          </div>
          <Card className="mb-0 shadow-md !rounded-none ">
            <Form
              form={form}
              layout="vertical"
              onFinish={edit ? onUpdate : onFinish}
              
              initialValues={{ userName: userName, paymentDate: initialpaymentDate }}
              size='small'


            >
              <div className='md:grid md:grid-cols-8  gap-2'>
                <Form.Item name="_id" hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  label="customer Name"
                  name="customerId"
                  rules={[{ required: true, message: "Please enter customer name" }]}
                >
                  <Select
                    onChange={(e) => customerChange(e)}
                    showSearch
                    placeholder="Select a customer"
                    optionFilterProp="label"
                    options={customerOptions}
                  />
                </Form.Item>
                <Form.Item
                  label="P-No"
                  name="paymentNo"
                  rules={[{ required: true, message: "Please enter Number" }]}
                >
                  <Input placeholder="Enter item payment Number" />
                </Form.Item>


                <Form.Item
                  label="company"
                  name="companyId"
                  rules={[{ required: true, message: "Please Enter company name" }]}
                >
                  <Select
                    showSearch
                    placeholder="Select a Company"
                    optionFilterProp="label"
                    options={companyOptions}
                  />
                </Form.Item>

                <Form.Item
                  label="Amount"
                  name="amount"
                  rules={[{ required: true, message: "Please enter amount" }]}
                >
                  <Input placeholder="Enter item amount"
                    onChange={(e) => setAmount(Number(e.target.value))} />
                </Form.Item>
                 <Form.Item
                  label="Currnecy"
                  name="currency"
                >
                  <Select
                    showSearch
                    placeholder="Enter Currency"
                    optionFilterProp="label"
                    options={currencyOptions}
                    onChange={(value) => currencyChange(value)}
                  />
                </Form.Item>
                <Form.Item label="Exch Amt" name="exchangedAmt">
                  <Input readOnly
                  />
                </Form.Item>
                <Form.Item
                  label="Country"
                  name="countryName"
                >
                  <Select
                    placeholder="Select a country"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {countries.map((country) => (
                      <Option key={country.value} value={country.value}>
                        {country.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>



                <Form.Item
                  label="Payment Date"
                  name="paymentDate"
                >
                  <DatePicker className="w-full" format="MM/DD/YYYY" />
                </Form.Item>
                 <Form.Item
                  label="Trns Type"
                  name="transactionType"
                  rules={[{ required: true, message: "Please Enter company name" }]}
                >
                  <Select
                    showSearch
                    placeholder="Select a transaction Type"
                    optionFilterProp="label"
                    options={transactionType}
                  />
                </Form.Item>
                <Form.Item
                  label="Payment Type"
                  name="paymentType"
                  rules={[{ required: true, message: "Please Enter Payment Type" }]}
                >
                  <Select
                    showSearch
                    placeholder="Select a payment Type"
                    optionFilterProp="label"
                    options={paymentType}
                  />
                </Form.Item>

                <Form.Item
                  label="userName"
                  name="userName"
                  value={userName}
                >
                  <Input value={userName}
                    disabled
                    className='!text-red-600'
                  />
                </Form.Item>
                 <Form.Item className='!flex !justify-center  !w-full !items-center'>

                  <div>
                    <ExchangeCalculator />
                  </div>
                </Form.Item>
              </div>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please enter Description" }]}
              >
                <TextArea placeholder="Enter enter description"
                />
              </Form.Item>
              <Form.Item>
                <Button type="text" htmlType="submit" className={`md:!w-full md:!h-[30px] !text-white hover:!shadow-lg hover:!shadow-zinc-800 hover:!text-white !font-bold 
                  ${edit ? "!bg-orange-500 hover:!bg-orange-600" : "!bg-purple-900 hover:!bg-green-500"}
                `} >
                  {`${edit ? "Update CustomerPayment" : "Add CustomerPayment"}`}
                </Button>
              </Form.Item>
            </Form>
          </Card>


        </div>
        <div>
          <div className='text-zinc-500 md:text-lg text-sm p-4 font-bold'>CustomerPayment Records:</div>
        </div>
        <div className="w-full   overflow-x-auto">


          <div className="text-xs w-[100%] mx-auto px-4">
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={dataSource}
              bordered
              scroll={{ x: 'max-content' }}
              sticky
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              className="compact-table"
              style={{
                tableLayout: 'auto',
                borderRadius: 0,
              }}
            />

          </div>

        </div>


      </div>
    </UserLayout>


  )
}

export default CustomerPayment;
