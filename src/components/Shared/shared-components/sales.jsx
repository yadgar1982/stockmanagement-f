import React from 'react'
import dayjs from "dayjs"

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Table, Popconfirm, Tooltip, } from "antd"
const { Option } = Select;
import UserLayout from '../../Shared/UserLayout';
import TextArea from 'antd/es/input/TextArea';
import { DatePicker } from 'antd';
import { ToastContainer, toast } from "react-toastify";
import { http, fetcher } from "../../Modules/http";
import Cookies from "universal-cookie";
import useSWR, { mutate } from "swr";
import { CheckOutlined, DeleteOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';
import { countries } from '../../Shared/countries/countries.js'
const cookies = new Cookies();

import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomers } from '../../../redux/slices/customerSlice';
import { fetchProducts } from '../../../redux/slices/productSlice';
import { fetchStock } from '../../../redux/slices/stockSlice';
import { fetchCompany } from '../../../redux/slices/companySlice';
import { fetchDealer } from '../../../redux/slices/dealerSlice';
import { fetchCurrency } from '../../../redux/slices/currencySlice';
import { fetchCategory } from '../../../redux/slices/categorySlice.js';
import ExchangeCalculator from './exchangeCalc/index.jsx';
const logo = import.meta.env.VITE_LOGO_URL;

const Sales = () => {
  const dispatch = useDispatch();

  const token = cookies.get("authToken")
  // const [purchases, setPurchases] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [unit, setUnit] = useState("");
  const [weight, setWeight] = useState(1);
  const [qty, setQty] = useState(0);
  const [quantity, setQuantity] = useState(0)
  const [unitCost, setUnitCost] = useState(0)
  const [exchange, setExchange] = useState(0)
  const [crncy, setCrncy] = useState("")
  const [exchangedAmt, setexchangedAmt] = useState(1)
  const [productQty, setProductQty] = useState(null);
  const [productSaleQty, setProductSaleQty] = useState(null);
  const [productUnit, setProductUnit] = useState(null);
  const [totalPurchase, setTotalPurchase] = useState([])
  const [edit, setEdit] = useState(false)
  const [customerData, setCustomerData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [customerEditData, setCustomerEditData] = useState("");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [isWeight, setIsWeight] = useState(false)
  const [btnText, setBtnText] = useState(edit ? "Update Purchase" : "Add Purchase");
  const [myCategory, setMyCategory] = useState(false);
  const [currencyName, setCurrencyName] = useState("");
  const [form] = Form.useForm();

  //get branding
  const branding = JSON.parse(localStorage.getItem("branding") || "null");

  // fetch data from redux:
  const { customers, loading, error } = useSelector((state) => state.customers);
  const all = customers?.data || [];
  const customer = all.map((item) => ({
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

  const { products, prloading, prerror } = useSelector((state) => state.products);
  const allProducts = products?.data || [];
  const product = allProducts.map((item) => ({
    productName: item.productName,
    productId: item._id,
  }));
  const productOptions = product.map((p) => ({
    label: p.productName,
    value: p.productId,
  }));

  const { stocks, sloading, serror } = useSelector((state) => state.stocks);
  const allStock = stocks?.data || [];
  const stock = allStock.map((item) => ({
    stockName: item.stockName,
    stockId: item._id
  }));

  const stockOptions = stock.map((st) => ({
    label: st.stockName,
    value: st.stockId
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
  const { dealers, dloading, derror } = useSelector((state) => state.dealers);
  const allDealers = dealers?.data || [];
  const dealer = allDealers.map((item) => ({
    dealerName: item.fullname,
    dealerId: item._id
  }));
  const dealerOptions = dealer.map((dl) => ({
    label: dl.dealerName,
    value: dl.dealerId
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

  const { category, catloading, caterror } = useSelector((state) => state.category);
  const allCaterogies = category?.data || [];
  const categories = allCaterogies.map((item) => ({
    categoryName: item.categoryName,
    categoryId: item._id,
  }));
  const categoryOptions = categories.map((cat) => ({
    label: cat.categoryName,
    value: cat.categoryName,
  }))

  // get userName
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userName = userInfo?.fullname || "";

  //fetch all redux data
  useEffect(() => {
    dispatch(fetchCustomers())
    dispatch(fetchProducts())
    dispatch(fetchStock())
    dispatch(fetchCompany())
    dispatch(fetchCurrency())
    dispatch(fetchDealer())
    dispatch(fetchCategory())

  }, [])

  //fetch purchase all data
  const { data: purchaseData, error: pError } = useSWR("/api/purchase/get", fetcher);

  useEffect(() => {
    if (purchaseData && purchaseData?.data) {
      setTotalPurchase(purchaseData?.data);
    }
  }, [purchaseData])

  //fetch sales all data
  const { data: sales, error: saError } = useSWR("/api/sale/get", fetcher);

  useEffect(() => {
    if (sales && sales?.data) {
      setSalesData(sales?.data || null);
    }
  }, [sales])

  //get all customer
  const handleCus = async (id) => {
    const httpReq = http();
    const { data } = await httpReq.get(`/api/customer/get/${id}`);
    return data;
  }

  useEffect(() => {
    setBtnText(edit ? "Update Purchase" : "Add Purchase");
  }, [edit]);

  //print function
  const handlePrint = async (record) => {
    const totalCost = Number(record?.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const totalLocalCost = Number(record?.totalLocalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })


    try {
      const createdDate = new Date(record.createdAt);
      const nextMonthDate = new Date(createdDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const formattedDate = nextMonthDate.toLocaleDateString();

      // Fetch customer
      const customer = await handleCus(record.customerId);

      // Open print popup window
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (!printWindow) {
        alert("Please allow pop-ups to print the invoice.");
        return;
      }

      // Create iframe inside popup
      const iframe = printWindow.document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      printWindow.document.body.appendChild(iframe);

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title style="width:100%; justify-content:center">Invoice - ${record._id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; box-sizing: border-box; }
    header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; width: 100%; }
    .company, .vendor { width: 48%; }
    .company-logo { width: 70px; height: 70px; border-radius: 8px; background:white; border:1px solid #ddd; display:flex; align-items:center; justify-content:center; padding:5px; }
    .company-info { font-size: 12px; line-height:1.4; color:#444; }
    .company-info .name { font-weight:bold; font-size:14px; color:#111; }
    h1 { text-align: center; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background: #f0f0f0; }
    tfoot td { font-weight: bold; }
    .footer { margin-top: 30px; font-size: 0.9em; }
    .invoice-info { display:flex; justify-content: space-between; width: 100%; margin-bottom: 20px; }
  </style>
</head>

<body>

  <!-- Header: Company + Customer -->
  <header>
    <!-- Company Info -->
    <div class="company" style="text-align: left; border: 1px solid #000; padding: 10px; border-radius: 5px;display:flex; gap:10px; align-items:center;">
      <div class="company-logo" >
        <img src="${logo}" width="60" style="object-fit:contain;" crossorigin="anonymous" />
      </div>
      <div class="company-info ">
        <div class="name">${branding[0]?.name}</div>
        <div>${branding[0]?.address || "-"}</div>
        <div>${branding[0]?.mobile || "-"}</div>
        <div>
          <a href="mailto:${branding[0]?.email}" style="color:#0077b6; text-decoration:none;">
            ${branding[0]?.email}
          </a>
        </div>
      </div>
    </div>

    <!-- Customer Info -->
    <div class="vendor" style="text-align: left; padding-left: 100px; border-radius: 5px;">
      <strong>Customer Details:</strong><br>
      Buyer: ${customer.fullname || "-"}<br>
      Address: ${customer.country || "-"}<br>
      Phone: ${customer.mobile || "-"}<br>
      Email: ${customer.email || "-"}<br>
    </div>
  </header>

  <!-- Invoice Info (Full Width) -->
  <div class="invoice-info">
    <div>
      <div>Invoice Date: ${new Date(record.createdAt).toLocaleDateString()}</div>
      <div>Last Due Date: ${formattedDate}</div>
      <div>Party #: ${record.party}</div>
    </div>
   
  </div>

  <!-- Invoice Title -->
 <h2 style="text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
  Invoice # ${record.invoiceNo}
</h2>

  <!-- Table -->
  <table>
    <thead>
      <tr>
        <th style="font-size:14px; white-space:nowrap">No</th>
        <th style="max-width: 300px; white-space: normal; word-wrap: break-word;">Details</th>
        <th style="font-size:14px; white-space:nowrap">Qty</th>
        <th style="font-size:14px; white-space:nowrap">Weight</th>
        <th style="font-size:14px; white-space:nowrap">Total-Qty</th>
        <th style="font-size:14px; white-space:nowrap">Unit-Price USD</th>
        <th style="font-size:14px; white-space:nowrap">Exch Price (${record.currency})</th>
        <th style="font-size:14px; white-space:nowrap">Belongs To</th>
        <th style="font-size:14px; white-space:nowrap">Total (${record.currency})</th>
        <th style="font-size:14px; white-space:nowrap">Total USD</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td style="max-width: 300px; white-space: normal; word-wrap: break-word;">${record.description}</td>
        <td style=" white-space: nowrap;word-wrap: break-word">${record.weight && record.weight > 0
          ? Number(record.quantity)
          : Number(record.quantity)
        }</td>
           <td style=" white-space: nowrap;word-wrap: break-word">${record.weight && record.weight > 0
          ? Number(record.weight).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " kg"
          : record.quantity + " " + record.unit
        }</td>
        <td style=" white-space: nowrap;word-wrap: break-word">${(record.quantity * record.weight).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg</td>
        <td style="word-wrap: break-word; white-space:nowrap">${(record.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="word-wrap: break-word">${(record.exchangedAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="word-wrap: break-word">${record.companyName}</td>
        <td style="word-wrap: break-word">${(record.totalLocalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${(record.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="8">Subtotal</td>
        <td>${totalLocalCost}</td>
     
         <td>${totalCost}</td>
      </tr>
    </tfoot>
  </table>

  <!-- Footer -->
  <div >Created by:<span style="font-family: 'Brush Script MT', cursive; font-size:24px;color:blue;"> ${record.userName} </span></div>

  <div class="footer">
    Signature: .............
  </div>

  <script>
    window.onload = () => window.print();
  </script>

</body>
</html>
`;

      iframe.srcdoc = htmlContent;

    } catch (err) {
      console.error("Invoice print error:", err);
    }
  };

  //customer change
  const customerChange = async (id) => {
    const httpReq = http();
    const { data } = await httpReq.get(`/api/customer/get/${id}`);
    return setCustomerData(data);
  }

  //handle unitcost change
  const handleUnitCost = (e) => {
    setUnitCost(e.target.value);
  }
  //currency change
  const currencyChange = (e) => {
    setCurrencyName(e)
    const selectedCurrency = currency.find((i) => i.currencyName === e);

    if (selectedCurrency) {
      setCrncy(Number(selectedCurrency.rate))
    } else {
      console.log("Currency not found");
    }
  };

  //handle weight change
  const handleWeightChange = (e) => {
    if (unit.toLowerCase() === "box") {
      const value = e.target.value;
      // allow empty or valid float numbers
      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setWeight(value);
        form.setFieldsValue({ weight: value });
      }
    }
  };

  //handle Product change
  const handleProductChange = (value) => {

    setSelectedProduct(value);
    //purchase calculation
    if (Array.isArray(totalPurchase)) {
      const filteredPurchase = totalPurchase.filter((p) => p.productId === value);
      // sum the quantities
      const calculatedQty = filteredPurchase.reduce((sum, item) => sum + (item.weight) * (item.quantity), 0);

      // get unit from first matched item
      const unit = filteredPurchase.length > 0 ? filteredPurchase[0].unit : null;

      setProductUnit(unit);
      setProductQty(calculatedQty);
    }
    if (Array.isArray(salesData)) {
      const filteredSales = salesData.filter((p) => p.productId === value);
      const calculatedSaleQty = filteredSales.reduce((total, item) => total + (item.weight) * (item.quantity), 0);
      const unit = filteredSales.length > 0 ? filteredSales[0].unit : null;

      setProductUnit(unit);
      setProductSaleQty(calculatedSaleQty)

    } else {
      setProductQty(null);
      setProductSaleQty(null);
    }

  }

  //handle category change
  const handleCategoryChange = (values) => {
    setMyCategory(values);
  }

  //Delete Function
  const handleDelete = async (obj) => {
    try {
      const salesId = obj._id;
      const httpReq = http(token);
      await httpReq.delete(`/api/warehouse/delete/${salesId}`);
      await httpReq.delete(`/api/sale/delete/${salesId}`);
      toast.success("Purchase record deleted successfully");
      mutate("/api/sale/get");
    } catch (err) {
      toast.error("Failed to delete purchase record", err);
    }
  }

  //handle Edit
  const handleEdit = async (record) => {
    toast.warning("Please refill the whole red color fields before updating! ")
    setCustomerEditData(record);
    setEdit(true);
    setIsWeight(true)
    form.setFieldsValue({
      ...record,
      salesDate: record?.salesDate ? dayjs(record?.salesDate) : record?.createdAt,
      category: record?.categoryName,
      qty: record?.quantity,
      customer: record.customerName,
      customerId: record.customerId
    });

  };

  //handle Pass
  const handleIspassed = async (id) => {
    try {
      const httpReq = http();
      await httpReq.put(`/api/sale/update/${id}`, { isPassed: true });
      toast.success("Purchase marked as passed!");
      mutate("/api/sale/get");
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
    fixed: "left",
  },
  { 
    title: "Item", 
    dataIndex: 'productName', 
    key: 'productName', 
    ellipsis: true, 
    minWidth: 120 
  },
  {
    title: "Qty",
    dataIndex: 'quantity',
    key: 'quantity',
    minWidth: 80,
    render: (_, record) => `${record.quantity} ${record.unit}`,
  },
  { title: "Customer", dataIndex: 'customerName', key: 'customerName', minWidth: 120, ellipsis: true },
  { title: "Belong To", dataIndex: 'companyName', key: 'companyName', minWidth: 120, ellipsis: true },
  { title: "Warehouse", dataIndex: 'warehouseName', key: 'warehouseName', minWidth: 120, ellipsis: true },
  {
    title: "Unit Cost $",
    dataIndex: 'unitCost',
    key: 'unitCost',
    minWidth: 100,
    render: (_, record) => (
      <span className="flex justify-between">
        <span>{Number(record.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className="text-blue-500">USD</span>
      </span>
    ),
  },
  {
    title: "Total Amt $",
    dataIndex: "totalCost",
    key: "totalCost",
    minWidth: 110,
    render: (_, record) => (
      <span className="flex justify-between">
        <span>{Number(record.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className="text-blue-500">USD</span>
      </span>
    ),
  },
  {
    title: "Unit Cost (Local)",
    dataIndex: "exchangedAmt",
    key: "exchangedAmt",
    minWidth: 110,
    render: (_, record) => (
      <span className="flex justify-between">
        <span>{Number(record.exchangedAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className="text-blue-500">{record.currency}</span>
      </span>
    ),
  },
  {
    title: "Total Amt (Local)",
    dataIndex: "totalLocalCost",
    key: "totalLocalCost",
    minWidth: 120,
    render: (_, record) => (
      <span className="flex justify-between">
        <span>{Number(record.totalLocalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className="text-blue-500">{record.currency}</span>
      </span>
    ),
  },
  { title: "Country", dataIndex: 'countryName', key: 'countryName', minWidth: 100, ellipsis: true },
  { title: "Batch No", dataIndex: 'batch', key: 'batch', minWidth: 100, ellipsis: true },
  { title: "Dealer", dataIndex: 'dealerName', key: 'dealerName', minWidth: 100, ellipsis: true },
  { title: "Fees", dataIndex: 'comission', key: 'comission', minWidth: 80, ellipsis: true },
  {
    title: "Pur-Date",
    dataIndex: 'createdAt',
    key: 'createdAt',
    minWidth: 110,
    render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "-",
  },
  { title: "Description", dataIndex: 'description', key: 'description', minWidth: 150, ellipsis: true },

  // Actions (fixed right)
  {
    title: "Print",
    key: "print",
    fixed: "right",
    width: 60,
    render: (_, record) => (
      <PrinterOutlined
        onClick={() => handlePrint(record)}
        className="!text-white !cursor-pointer !bg-zinc-500 !p-2 !rounded"
      />
    ),
  },
  {
    title: "Edit",
    key: "edit",
    fixed: "right",
    width: 60,
    render: (_, record) => (
      <EditOutlined
        onClick={() => handleEdit(record)}
        className="!text-white !cursor-pointer !bg-zinc-500 !p-2 !rounded"
      />
    ),
  },
  {
    title: "Pass",
    key: "isPassed",
    fixed: "right",
    width: 60,
    render: (_, record) => (
      <Popconfirm
        title="Are you sure to Pass this Purchase?"
        onConfirm={() => handleIspassed(record._id)}
      >
        <CheckOutlined className="!text-white !cursor-pointer !bg-zinc-500 !p-2 !rounded" />
      </Popconfirm>
    ),
  },
  {
    title: "Delete",
    key: "delete",
    fixed: "right",
    width: 60,
    render: (_, record) => (
      <Popconfirm
        title="Are you sure to delete this purchase record?"
        onConfirm={() => handleDelete(record)}
      >
        <DeleteOutlined className="!text-white !cursor-pointer !bg-red-500 !p-2 !rounded" />
      </Popconfirm>
    ),
  },
];


  // data source
  const dataSource = salesData
    ?.filter((item) => item.isPassed === false)
    .map((item) => ({
      ...item,
      key: item._id,
    })) || [];

  //unit change effect
  useEffect(() => {
    if (unit.toLowerCase() === "kg" || unit.toLowerCase() === "each") {
      setWeight("1");
      form.setFieldsValue({ weight: "1" });
    } else if (unit.toLowerCase() === "tons") {
      setWeight("1000");
      form.setFieldsValue({ weight: "1000" });
    } else if (unit.toLowerCase() === "box") {
      setWeight(""); // allow user input
      form.setFieldsValue({ weight: "" });
    }
  }, [unit]);

  //submit funciton
  const onFinish = async (values) => {
    setBtnDisabled(true);
    setBtnText("Submitting...");
    const invoiceNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`; // e.g., INV-123456
    const httpReq = http(token);

    try {
      // Find selected objects from arrays
      const selectedCustomer = customer.find(s => s.customerId === values.customerId);
      const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);


      const finalQty = weight && qty ? weight * qty : 1 || 0;

      const formattedValues = {
        ...values,
        invoiceNo,
        quantity: qty,
        currency: currencyName || "",
        weight: finalQty,
        salesDate: values.salesDate ? values.salesDate.toDate() : null,
        customerName: customerData?.fullname || "",
        customerId: customerData?._id || "",
        productName: selectedProduct?.productName || "",
        companyName: selectedCompany?.companyName || "",
        warehouseName: selectedStock?.stockName || "",
        dealerName: selectedDealer?.dealerName || "",
        totalCost: finalQty * (Number(values?.unitCost) || 0),
        totalLocalCost: finalQty * (Number(values?.exchangedAmt) || 0),
        isPassed: false,
        totalComission: (Number(values?.comission) || 0) * finalQty,
        totalExComission:
          (Number(values?.comission) || 0) *
          finalQty *
          (Number(exchange) || 1),

      };


      const data = await httpReq.post("/api/sale/create", formattedValues);
      const salesId = data?.data?.data?._id;
      const warehouseData = {
        ...values,
        invoiceNo,
        transaction: "sale",
        currency: "USD",
        transactionId: String(salesId),
        quantity: qty,
        transactionDate: values.salesDate ? values.salesDate.toDate() : null,
        customerName: selectedCustomer?.customerName || "",
        productName: selectedProduct?.productName || "",
        companyName: selectedCompany?.companyName || "",
        warehouseName: selectedStock?.stockName || "",
        totalCost: finalQty * (Number(values?.unitCost) || 0),
        totalLocalCost: finalQty * (Number(values?.exchangedAmt) || 0),
        isPassed: false,
        transactionType: "Out",
      }

      await httpReq.post("/api/warehouse/create", warehouseData)

      toast.success("Sale record added successfully");
      mutate("/api/sale/get");
      form.resetFields();
      return data;

    } catch (err) {
      console.log("err", err);
      toast.error(`Failed: ${err?.response?.data?.message || err?.message || "Unknown error"}`);
    }
    finally {
      setTimeout(() => {
        setBtnDisabled(false);
        setBtnText(edit ? "Update Purchase" : "Add Purchase");
      }, 2000);
    }
  };

  //update function
  const onUpdate = async (values) => {


    setBtnDisabled(true);
    setBtnText("Submitting...");
    try {
      const httpReq = http(token);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      // Calculate final quantity: prefer updated qty & weight, fallback to existing
      const qty = values.qty ?? customerEditData.quantity ?? 0;
      const weight = values.weight ?? customerEditData.weight ?? 1;
      const finalQty = weight * qty;

      const formattedValues = {
        ...customerEditData,
        ...values,
        weight,
        currency: currencyName || "",
        salesDate: values.salesDate ? values.salesDate.toDate() : customerEditData.salesDate,
        customerName: customerData?.fullname ?? customerEditData.customerName,
        customerId: values.customerId ?? customerEditData.customerId,
        totalCost: (Number(values.unitCost) ?? Number(customerEditData.unitCost) ?? 0) * finalQty,
        totalLocalCost: (Number(values.exchangedAmt) ?? Number(customerEditData.exchangedAmt) ?? 0) * finalQty,
        totalComission: (Number(values.comission) ?? Number(customerEditData.comission) ?? 0) * finalQty,
        totalExComission:
          ((Number(values.comission) ?? Number(customerEditData.comission) ?? 0) * finalQty *
            (Number(exchange) ?? 1)),

        comission: Number(values.comission ?? customerEditData.comission ?? 0),
      };

      //update sales
      const sales = await httpReq.put(`/api/sale/update/${values._id}`, formattedValues);
      const salesId = sales?.data?.data?._id;
      const warehouseData = {
        ...values,
        weight,
        currency: "USD",
        quantity,
        transactionDate: values.salesDate ? values.salesDate.toDate() : customerEditData.salesDate,
        customerName: customerData?.fullname ?? customerEditData.customerName,
        customerId: values.customerId ?? customerEditData.customerId,
        totalCost: (Number(values.unitCost) ?? Number(customerEditData.unitCost) ?? 0) * finalQty,
        totalLocalCost: (Number(values.exchangedAmt) ?? Number(customerEditData.exchangedAmt) ?? 0) * finalQty,
        productName: selectedProduct?.productName || "",
        companyName: selectedCompany?.companyName || "",
        warehouseName: selectedStock?.stockName || "",
        isPassed: false,
        transactionType: "Out",
      }
      await httpReq.put(`/api/warehouse/update/${salesId}`, warehouseData)

      toast.success("Sale record updated successfully");
      mutate("/api/sale/get");
      form.resetFields();
    } catch (err) {
      console.log("err", err);
      toast.error("Update Failed", err);
    } finally {
      setTimeout(() => {
        setBtnDisabled(false);
        setBtnText(edit ? "Update Purchase" : "Add Purchase");
        setEdit(false);
      }, 2000);
    }
  };

  const units =
    [
      {
        value: 'kg',
        label: 'Kg',
      },
      {
        value: 'tons',
        label: 'Tons',
      },
      {
        value: 'each',
        label: 'Each',
      },
      {
        value: 'box',
        label: 'Box',
      },]


  //exchange rate effect
  useEffect(() => {
    const rate = crncy || 1;
    setExchange(rate);
  }, [crncy, currency, unitCost]);

  // exchange amount calculation effect
  useEffect(() => {
    const quantity = qty * weight
    setexchangedAmt(Number(unitCost) * exchange);
    setQuantity(quantity)
  }, [qty, unitCost, exchange, crncy]); // only recalc when these change

  useEffect(() => {
    form.setFieldsValue({ exchangedAmt: exchangedAmt });
  }, [exchangedAmt, form]);

  const initialSalesDate = customerData?.salesDate
    ? dayjs(customerData?.salesDate, "DD-MM-YYYY")
    : null;

  return (
    <UserLayout>
      <div>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          className="mt-4"
          toastClassName="bg-gray-500 !text-zinc-700 !text-sm font-semibold  shadow-lg"

        />
        <div className="p-4  bg-zinc-100">
          {/* Sales Form */}
          <div className='flex w-[100%] gap-4 items-center flex item-center justify-between bg-gradient-to-r from-zinc-300 to-orange-100  px-4'>
            <h2 className='text-sm md:text-4xl p-2 text-white font-bold [text-shadow:2px_2px_4px_rgba(1,2,2,0.5)]'>Create Sale Record</h2>
            <div> {productQty && (
              <div className='!text-yellow-200  bg-blue-900 mt-3 md:text-1xl text-sm mb-2 p-2'>
                <span className='text-white'>Availible Qty:</span> {productQty - productSaleQty},{productUnit || null}
              </div>
            )}</div>
             <div className='mb-4 w-[50%] flex justify-end !px-25 p-2 '>
              <ExchangeCalculator />
            </div>

          </div>
          <Card className="!mb-0  shadow-sm rounded-none bg-zinc-50 flex flex-wrap ">
            <Form
              form={form}
              layout="vertical"
              onFinish={edit ? onUpdate : onFinish}
              initialValues={{ userName: userName, salesDate: initialSalesDate }}
            >
              <div className=" !w-full grid grid-cols-2 sm:!grid-cols-2 md:!grid-cols-4 lg:!grid-cols-8 xl:!grid-cols-9 gap-x-1 gap-y-2">
                <Form.Item name="_id" hidden>
                  <Input />
                </Form.Item>

                <Form.Item
                  className="!mb-1"
                  label={<span className="text-[12px] text-gray-600">Product</span>}
                  name="productId"
                  rules={[{ required: true, message: "Please enter product Name" }]}
                >
                  <Select
                    value={selectedProduct}
                    onChange={handleProductChange}
                    showSearch
                    placeholder="Select a product"
                    optionFilterProp="label"
                    options={productOptions}

                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[12px] text-gray-600 font-semibold">Category</span>}
                  name="categoryName"
                  rules={[{ required: true, message: "Please enter category" }]}
                  className="!mb-1"
                >
                  <Select

                    value={myCategory}
                    onChange={handleCategoryChange}
                    showSearch
                    placeholder="Select a category"
                    optionFilterProp="label"
                    options={categoryOptions}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className='text-[12px] text-red-600 font-semibold'>Qty</span>}
                  name="quantity"
                  rules={[{ required: true, message: "Please enter item quantity" }]}
                  className="!mb-1"
                >
                  <Input

                    placeholder="Enter item quantity"
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                </Form.Item>
                <Form.Item
                  label={<span className='text-[12px] text-red-600 font-semibold'>Unit Cost</span>}
                  name="unitCost"
                  className="!mb-1"
                  rules={[{ required: true, message: "Please enter item Price" }]}
                >
                  <Input

                    value={unitCost}
                    onChange={handleUnitCost}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="!text-[12px] text-gray-600">Unit</span>}
                  name="unit"
                  rules={[{ required: true, message: "Please enter unit name" }]}
                  className="!mb-1"
                >
                  <Select
                    onChange={(e) => setUnit(e)}

                    showSearch
                    placeholder="Select a Unit"
                    optionFilterProp="label"
                    options={units}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[12px] text-red-600">Weight</span>}
                  name="weight"
                  hidden={!(unit === "box" || isWeight)}
                  className="!mb-1"
                >
                  <Input value={weight} onChange={handleWeightChange} />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[12px] text-red-600">Currency</span>}
                  name="currency"
                  className="!mb-1">

                  <Select
                    showSearch

                    placeholder="Enter Currency"
                    optionFilterProp="label"
                    options={currencyOptions}
                    onChange={currencyChange}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[12px] text-blue-600">Exch Amt</span>}
                  name="exchangedAmt"
                  className="!mb-1"
                >
                  
                  <Input readOnly />
                </Form.Item>
                <Form.Item
                  label={<span className="text-[12px] text-gray-600">Customer</span>}
                  name="customerId"
                  rules={[{ required: true, message: "Please enter customer name" }]}
                  className="!mb-1"
                >
                  <Select
                    onChange={(e) => customerChange(e)}
                    showSearch

                    optionFilterProp="label"
                    options={customerOptions}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[12px] text-gray-600">Company</span>}
                  name="companyId"
                  rules={[{ required: true, message: "Please Enter company name" }]}
                  className="!mb-1"
                >
                  <Select
                    showSearch

                    optionFilterProp="label"
                    options={companyOptions}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[12px] text-gray-600">Warehouse</span>}
                  name="warehouseId"
                  rules={[{ required: true, message: "Please Enter warehouse name" }]}
                  className="!mb-1"
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={stockOptions}

                  />
                </Form.Item>




                <Form.Item label={<span className="text-[12px] text-gray-600">Country</span>}
                  name="countryName"
                  className="!mb-1">

                  <Select

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
                  label={<span className="text-[12px] text-gray-600">Batch</span>}
                  name="batch"
                  rules={[{ required: true, message: "Please enter batch No" }]}
                  className="!mb-1"
                >
                  <Input placeholder="Enter enter Batch No" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[12px] text-gray-600">Party</span>}
                  name="party"
                  className="!mb-1"
                  rules={[{ required: true, message: "Please enter Party No" }]}
                >
                  <Input placeholder="Enter enter Party No" />
                </Form.Item>

                <Form.Item label={<span className="text-[12px] text-gray-600">Dealer</span>}
                  name="dealerId"
                  className="!mb-1"
                >
                  <Select
                    showSearch
                    placeholder="Enter Dealer"
                    optionFilterProp="label"
                    options={dealerOptions}

                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[12px] text-gray-600">Commission</span>}
                  name="comission"
                  rules={[{ required: true, message: "Please enter Comission" }]}
                  className="!mb-1"
                >
                  <Input placeholder="Enter enter comission" />
                </Form.Item>

                <Form.Item label={<span className="text-[12px] text-gray-600">Date</span>}
                  name="salesDate"
                  className="!mb-1">
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item label={<span className="text-[12px] text-gray-600">User</span>}
                  name="userName"
                  className="!mb-1">
                  <Input disabled className="!text-red-600" />
                </Form.Item>
              </div>

              <Form.Item
                label={<span className="text-[10px] text-gray-600">Description</span>}
                name="description"
                rules={[{ required: true, message: "Required" }]}
                className="!mt-1 !rounded-none"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Enter description"
                  className="!rounded-none !resize-y !w-full"
                />
              </Form.Item>
              <Form.Item className="!mt-2">
                <Button
                  type="text"
                  htmlType="submit"
                  disabled={btnDisabled}
                  className={`px-6 !text-xs !font-semibold !text-white
          ${edit ? "!bg-orange-500" : "!bg-blue-500"}
          ${btnDisabled ? "!bg-gray-400 !cursor-not-allowed" : ""}
        `}
                >
                  {btnText}
                </Button>
              </Form.Item>
            </Form>

          </Card>


        </div>
        <div>
          <div className='text-zinc-600 md:text-lg text-sm p-4 font-bold'>Sales Records:</div>
        </div>
        <div className="w-full   overflow-x-auto">


          <div className="text-xs w-full  px-4">
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={dataSource || []}
              bordered
              scroll={{ x: 'max-content' }}
              sticky
              size='small'
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
              }}
              className="compact-table"
              style={{
                width: '100%',
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

export default Sales;