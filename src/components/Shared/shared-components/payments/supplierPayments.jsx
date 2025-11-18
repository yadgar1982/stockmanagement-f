import React from 'react'
import dayjs from "dayjs"


import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Table, Popconfirm, Modal } from "antd"
import UserLayout from '../../UserLayout';
import ExchangeCalculator from '../exchangeCalc/index'
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
import { fetchSuppleirs } from '../../../../redux/slices/supplierSlice';
import { fetchPurchase } from '../../../../redux/slices/purchaseSlice';
// import { fetchStock } from '../../../redux/slices/stockSlice';
import { fetchCompany } from '../../../../redux/slices/companySlice';
// import { fetchDealer } from '../../../redux/slices/dealerSlice';
import { fetchCurrency } from '../../../../redux/slices/currencySlice';




const SupplierPayment = () => {
  const dispatch = useDispatch();

  const token = cookies.get("authToken")
  const [unit, setUnit] = useState("");
  const [amount, setAmount] = useState(0);
  const [exchange, setExchange] = useState(0)
  const [crncy, setCrncy] = useState("") // this is for currency state for payment data entry 
  const [cr, setCr] = useState("") // this is for Due amount showing currency
  const [exchangedAmt, setexchangedAmt] = useState(1)
  const [productamount, setProductamount] = useState(null);
  const [productUnit, setProductUnit] = useState(null);
  const [totalpayment, setTotalpayment] = useState([])
  const [edit, setEdit] = useState(false)
  const [supplierData, setSupplierData] = useState(null);

  //for supplier financial calculation states
  const [payment, setpayment] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalxPaid, setTotalxPaid] = useState(0);
  const [totalPurchasedAmount, setTotalPurchasedAmt] = useState(0);
  const [totalxPurchasedAmount, setTotalxPurchasedAmt] = useState(0);
  const [supplierId, setSupplierId] = useState("");

  //calculator modal
  const [opencalc, setOpenCalc] = useState(false)
  const [firstNumber, setFirstName] = useState(0)
  const [secondNumber, setSecondNumber] = useState(0)
  const [result, setResult] = useState(0)


  const [form] = Form.useForm();
  //get branding
  const branding = JSON.parse(localStorage.getItem("branding") || "null");

  // fetch data from redux:
  const { suppliers, loading, error } = useSelector((state) => state.suppliers);
  const allSuppliers = suppliers?.data || [];
  const supplier = allSuppliers.map((item) => ({
    supplierName: item.fullname,
    supplierId: item._id,
    supplierAcc: item.accountNo,
    supplierMobile: item.mobile,
    supplierCountry: item.country,
    supplierEmail: item.email,
  }))

  const supplierOptions = supplier.map((s) => ({
    label: s.supplierName,
    value: s.supplierId
  }))
  const { purchase, prloading, prerror } = useSelector((state) => state.purchase);
  const allPurchase = purchase?.data || [];
  const purchased = allPurchase.map((item) => ({
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
    dispatch(fetchSuppleirs())
    dispatch(fetchPurchase())
    // dispatch(fetchStock())
    dispatch(fetchCompany())
    dispatch(fetchCurrency())
    // dispatch(fetchDealer())

  }, [])

  const transactionType = [
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
  const handleSup = async (id) => {
    const httpReq = http();
    const { data } = await httpReq.get(`/api/supplier/get/${id}`);
    setSupplierId(data)
    return data;
  }

  const supplierChange = async (id) => {
    await handleSup(id);

    const httpReq = http();
    const { data } = await httpReq.get(`/api/supplier/get/${id}`);

    const supplierPayments = totalpayment.filter(i => i.supplierId === id);
    const totalPaid = supplierPayments.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalExPaid = supplierPayments.reduce((sum, item) => sum + (item.exchangedAmt || 0), 0);
    const mycurrency = purchase.find(cr => cr.supplierId === id);
    const myNewCrncy = mycurrency?.currency

    setCr(myNewCrncy)
    console.log("my cur", cr)
    setTotalPaid(totalPaid || 0)
    setTotalxPaid(totalExPaid || 0)
    const supplierPurchase = purchase.filter(i => i.supplierId == id);
    const totalPurchaseAmount = supplierPurchase.reduce((sum, item) => sum + (item.totalCost || 0), 0)
    const totalxPurchaseAmount = supplierPurchase.reduce((sum, item) => sum + (item.quantity * item.exchangedAmt || 0), 0)
    setTotalPurchasedAmt(totalPurchaseAmount)
    setTotalxPurchasedAmt(totalxPurchaseAmount)
    setSupplierData(data);
  };


  // calculation of payments
  const amt = amount || 0;
  const totalPaidtoSupplier = totalPaid || 0
  const totalSupplierPurchase = totalPurchasedAmount || 0
  const totalDueAmount = Number(amt) + Number(totalPaidtoSupplier) - Number(totalSupplierPurchase)

  const exAmt = exchangedAmt || 0;
  const totalExPaidtoSupplier = totalPaid || 0
  const totalSupplierExPurchase = totalxPurchasedAmount || 0
  const totalExDueAmount = Number(exAmt) + Number(totalExPaidtoSupplier) - Number(totalSupplierExPurchase)

  // get userName
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userName = userInfo?.fullname || "";

  //print function
  const handlePrint = async (record) => {
    try {
      const supplier = await handleSup(record.supplierId);


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
        <title>Supplier Payment Receipt - ${record._id}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            margin: 40px;
            color: #222;
            background-color: #fff;
          }
         
          .company { width: 45%; font-size: 14px; line-height: 1.5; }
          .company strong { font-size: 15px; color: #111; }
          .supplier { font-size: 14px; line-height: 1.5; margin-bottom: 20px; }
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
   
        <div class="supplier">
          <strong>Receiver:</strong><br>
          Name: ${supplier?.fullname || "-"}<br>
          Address: ${supplier?.country || "-"}<br>
          Phone: ${supplier?.mobile || "-"}<br>
          Email: ${supplier?.email || "-"}<br>
          Doc_No:   ${record?.paymentNo || "-"}<br>
        </div>
        <h1>Supplier Payment Receipt</h1>
        <table>
          <thead>
            <tr>
              <th>No</th><th>Payment Type</th><th>Tr-Type</th>
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
        <div style="clear:both"></div>
        <p class="supplier"><strong>processed by:</strong> ${userName}</p>
        <br><br>
        <div class="supplier">
          <strong>Supplier Signature: </strong>
          <span style="font-family: 'Brush Script MT', cursive; font-size:18px;color:blue;">
            ${supplier?.fullname || "......................."}
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
      toast.success("SupplierPayment record and supplier transaction deleted successfully");
      mutate("/api/payment/get");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete payment record");
    }
  };

  const handleEdit = async (record) => {
    setSupplierData(record);
    setAmount(Number(record.amount));
    form.setFieldsValue({
      ...record,
      supplierId: record.supplierId,
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
      toast.success("SupplierPayment marked as passed!");
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
    {
      title: <span className="text-sm md:!text-1xl font-semibold">Trans-Type</span>, dataIndex: 'paymentType', key: 'p-type', width: 60,
      render: (text) => (
        <span
          style={{
            color: text.toLowerCase() === 'dr' ? 'red' : 'inherit', // red if 'dr', default otherwise
            fontWeight: 'bold',
          }}>
          {text}
        </span>
      )
    },
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
          title="Are you sure to Pass this SupplierPayment?"
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
    .filter(item => item.isPassed === false && item.entity === 'supplier')
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
      const selectedSupplier = supplier.find(s => s.supplierId === values.supplierId);
      // const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      // const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      // const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);

      // 2 Prepare formatted values for payment
      const formattedValues = {
        ...values,
        purchaseDate: values.purchaseDate ? values.purchaseDate.toDate() : null,
        supplierName: selectedSupplier?.supplierName,
        transBy: selectedSupplier?.supplierName,
        entity: "supplier",
        // productName: selectedProduct?.productName,
        companyName: selectedCompany?.companyName,
        // warehouseName: selectedStock?.stockName,
        // dealerName: selectedDealer?.dealerName,
        isPassed: false,
      };
      // Create payment

      await httpReq.post("/api/payment/create", formattedValues);
      toast.success("SupplierPayment record and transaction added successfully");
      mutate("/api/payment/get");
      form.resetFields();
      setSupplierData("");

    } catch (err) {
      console.error("Error in onFinish:", err);
      toast.error("Failed to register");
    }
  };


  const onUpdate = async (values) => {
    try {

      // 1️⃣ Find selected objects from arrays
      const selectedSupplier = supplier.find(s => s.supplierId === values.supplierId);
      // const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      // const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      // const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);
      const httpReq = http(token);

      const formattedValues = {
        ...values,
        supplierId: selectedSupplier?._id || values.supplierId,
        supplierName: selectedSupplier.supplierName || values.supplierName,
        transBy: selectedSupplier?.supplierName,
        entity: "supplier",
        companyId: selectedCompany?._id || values.companyId,
        companyName: selectedCompany?.companyName || values.companyName,
      };

      // Update payment
      await httpReq.put(`/api/payment/update/${values._id}`, formattedValues);
      mutate("/api/payment/get");
      form.resetFields();
      toast.success("Payment transaction updated successfully");
      setSupplierData("");
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
    setexchangedAmt(Number(amount) * exchange);
  }, [amount, exchange]); // only recalc when these change

  useEffect(() => {
    form.setFieldsValue({ exchangedAmt: exchangedAmt });
  }, [exchangedAmt, form]);
  const handleAmount = (value) => {
    setSelectAmount(value);

    if (Array.isArray(totalpayment)) {
      const filteredpayment = totalpayment.filter((p) => p.supplierId === value)

      const calculatedamount = filteredpayment.reduce((sum, item) => sum + item.amount, 0);

      const unit = filteredpayment.length > 0 ? filteredpayment[0].unit : null;
      setProductUnit(unit);
      setProductamount(calculatedamount);
    } else {
      setProductamount(null);
      setProductUnit(null);
    }


  }

  const initialpaymentDate = supplierData?.paymentDate
    ? dayjs(supplierData.paymentDate, "DD-MM-YYYY")
    : null;



  return (
    <UserLayout>
      <div>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="p-4 bg-zinc-100">
          {/* SupplierPayment Form */}
          <div className='flex gap-4 items-center '>
            <h2 className='text-sm  md:text-2xl p-2 font-semibold text-zinc-600'>Make Payment to Supplier</h2>
            <div> {supplierData && (
              <div className=' mt-3 md:text-1xl text-white text-sm mb-2 bg-blue-800 p-2'>Total due Amount:
                <span className='font-bold text-yellow-400'> {totalDueAmount} USD  {totalExDueAmount} {cr}</span>
              </div>
            )}</div>
          </div>
          <Card className="mb-0 shadow-md !rounded-none ">
            <Form
              layout="vertical"
              onFinish={edit ? onUpdate : onFinish}
              form={form}
              initialValues={{ userName: userName, paymentDate: initialpaymentDate }}
              size='small'


            >
              <div className='md:grid md:grid-cols-8  gap-2'>
                <Form.Item name="_id" hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Supplier Name"
                  name="supplierId"
                  rules={[{ required: true, message: "Please enter supplier name" }]}
                >
                  <Select
                    onChange={(e) => supplierChange(e)}
                    showSearch
                    placeholder="Select a Supplier"
                    optionFilterProp="label"
                    options={supplierOptions}
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
                <Form.Item
                  label="Amount"
                  name="amount"
                  rules={[{ required: true, message: "Please enter amount" }]}
                >
                  <Input placeholder="Enter item amount"
                    onChange={(e) => setAmount(Number(e.target.value))} />
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
                  label="Tr-Type"
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
                  {`${edit ? "Update SupplierPayment" : "Add SupplierPayment"}`}
                </Button>
              </Form.Item>
            </Form>

          </Card>


        </div>
        <div>
          <div className='text-zinc-500 md:text-lg text-sm p-4 font-bold'>SupplierPayment Records:</div>
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

      {/* calculation modal */}

    </UserLayout>



  )
}

export default SupplierPayment;
