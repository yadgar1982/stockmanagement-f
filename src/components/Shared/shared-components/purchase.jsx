import React from 'react'
import dayjs from "dayjs"

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Table, Popconfirm, Tooltip, } from "antd"
import UserLayout from '../UserLayout';
import TextArea from 'antd/es/input/TextArea';
import { DatePicker } from 'antd';
import { ToastContainer, toast } from "react-toastify";
import { http, fetcher } from "../../Modules/http";
import Cookies from "universal-cookie";
import useSWR, { mutate } from "swr";
import { CheckOutlined, DeleteOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';
import { countries } from "../countries/countries";
const cookies = new Cookies();
const { Option } = Select;
import { useDispatch, useSelector } from 'react-redux'
import { fetchSuppleirs } from '../../../redux/slices/supplierSlice';
import { fetchProducts } from '../../../redux/slices/productSlice';
import { fetchStock } from '../../../redux/slices/stockSlice';
import { fetchCompany } from '../../../redux/slices/companySlice';
import { fetchDealer } from '../../../redux/slices/dealerSlice';
import { fetchCurrency } from '../../../redux/slices/currencySlice';
import ExchangeCalculator from './exchangeCalc';
const logo = import.meta.env.VITE_LOGO_URL;


const Purchase = () => {
  const dispatch = useDispatch();

  const token = cookies.get("authToken")
  const [unit, setUnit] = useState("");
  const [weight, setWeight] = useState(1);
  const [qty, setQty] = useState(0);
  const [quantity, setQuantity] = useState(0)
  const [unitCost, setUnitCost] = useState(0)
  const [exchange, setExchange] = useState(0)
  const [crncy, setCrncy] = useState("")
  const [exchangedAmt, setExchangedAmt] = useState(1)
  const [exComission, setExComission] = useState(1)
  const [productQty, setProductQty] = useState(null);
  const [productPurchaseQty, setProductPurchaseQty] = useState(null);
  const [purchasesData, setPurchasesData] = useState(null);
  const [productUnit, setProductUnit] = useState(null);
  const [totalPurchase, setTotalPurchase] = useState([])
  const [edit, setEdit] = useState(false)
  const [supplierData, setSupplierData] = useState(null);
  const [supplierEditData, setSupplierEditData] = useState("");
  const [purchase, setPurchase] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [isWeight, setIsWeight] = useState(false)
  const [btnText, setBtnText] = useState(edit ? "Update Purchase" : "Add Purchase");
  const [currencyName, setCurrencyName] = useState("")
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

  // get userName
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userName = userInfo?.fullname || "";

  //fetch all redux data
  useEffect(() => {
    dispatch(fetchSuppleirs())
    dispatch(fetchProducts())
    dispatch(fetchStock())
    dispatch(fetchCompany())
    dispatch(fetchCurrency())
    dispatch(fetchDealer())

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
      setPurchasesData(sales?.data || null);
    }
  }, [sales])

  //get all supppliers
  const handleSup = async (id) => {
    const httpReq = http();
    const { data } = await httpReq.get(`/api/supplier/get/${id}`);
    return data;
  }


  useEffect(() => {
    setBtnText(edit ? "Update Purchase" : "Add Purchase");
  }, [edit]);

  // Print function
  const handlePrint = async (record) => {

    const totalCost = Number(record?.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const totalLocalCost = Number(record?.totalLocalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })


    try {
      const createdDate = new Date(record.createdAt);
      const nextMonthDate = new Date(createdDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const formattedDate = nextMonthDate.toLocaleDateString();

      // Fetch supplier
      const supplier = await handleSup(record.supplierId);

      // Open print popup window
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (!printWindow) {
        alert("Please allow pop-ups to print the Order.");
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
  <title>Order - ${record.orderNo}</title>
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
    .Order-info { display:flex; justify-content: space-between; width: 100%; margin-bottom: 20px; }
  </style>
</head>

<body>

  <!-- Header: Company + supplier -->
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

    <!-- supplier Info -->
    <div class="vendor" style="text-align: left; padding-left: 100px; border-radius: 5px;">
      <strong>Supplier Details:</strong><br>
      Buyer: ${supplier.fullname || "-"}<br>
      Address: ${supplier.country || "-"}<br>
      Phone: ${supplier.mobile || "-"}<br>
      Email: ${supplier.email || "-"}<br>
    </div>
  </header>

  <!-- Order Info (Full Width) -->
  <div class="Order-info">
    <div>
      <div>Order Date: ${new Date(record.createdAt).toLocaleDateString()}</div>
      <div>Last Due Date: ${formattedDate}</div>
      <div>Party #: ${record.party}</div>
    </div>
   
  </div>

  <!-- Order Title -->
  <h2 style="text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">Order # ${record.orderNo}</h2>

  <!-- Table -->
  <table>
    <thead>
       <tr>
        <th style="font-size:14px; white-space:nowrap">No</th>
        <th style="max-width: 300px; white-space: normal; word-wrap: break-word;">Details</th>
        <th style="font-size:14px; white-space:nowrap">Qty</th>
        <th style="font-size:14px; white-space:nowrap">Weight</th>
        <th style="font-size:14px; white-space:nowrap">Total_Qty</th>
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
          ? Number(record.quantity) + " " + record.unit
          : Number(record.quantity) + " " + record.unit
        }</td>
           <td style=" white-space: nowrap;word-wrap: break-word">${record.weight && record.weight > 0
          ? Number(record.weight).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " kg"
          : record.quantity + " " + record.unit
        }</td>
        <td style=" white-space: nowrap;word-wrap: break-word">${(record.quantity * record.weight).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg</td>
        <td style="word-wrap: break-word white-space:nowrap">${(record.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="word-wrap: break-word white-space:nowrap">${(record.exchangedAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="word-wrap: break-word white-space:nowrap">${record.companyName}</td>
        <td style="word-wrap: break-word white-space:nowrap">${(record.totalLocalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
      console.error("Order print error:", err);
    }
  };

  // supplier change
  const supplierChange = async (id) => {
    const httpReq = http();
    const { data } = await httpReq.get(`/api/supplier/get/${id}`);
    return setSupplierData(data);
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


  //handle unitcost change
  const handleUnitCost = (e) => {
    setUnitCost(e.target.value);
  }
  //chandle Weight change
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

  //handle Product Change
  const handleProductChange = (value) => {

    setSelectedProduct(value);

    // Handle purchase quantities

    if (Array.isArray(totalPurchase)) {
      const filteredPurchase = totalPurchase.filter((p) => p.productId === value);

      const calculatedQty = filteredPurchase.reduce((sum, item) => sum + (item.weight) * (item.quantity), 0);
      const unit = filteredPurchase.length > 0 ? filteredPurchase[0].unit : null;
      const sprice = selectedProduct.salePrice;

      setProductUnit(unit);
      setProductQty(calculatedQty);
    }
    if (Array.isArray(purchasesData)) {
      const filteredSales = purchasesData.filter((p) => p.productId === value);
      const calculatedSaleQty = filteredSales.reduce((total, item) => total + (item.weight) * (item.quantity), 0);
      const unit = filteredSales.length > 0 ? filteredSales[0].unit : null;

      setProductUnit(unit);
      setProductPurchaseQty(calculatedSaleQty)
    }
    else {
      setProductQty(null);
      setProductPurchaseQty(null);
    }


    // Handle sales quantities
    if (Array.isArray(purchasesData)) {
      const filteredSales = purchasesData.filter((p) => p.productId === value);
      const calculatedSaleQty = filteredSales.reduce((sum, item) => sum + item.quantity, 0);
      const unit = filteredSales.length > 0 ? filteredSales[0].unit : null;

      setProductUnit(unit); // optional: override if you want sales unit
      setProductPurchaseQty(calculatedSaleQty); // use separate state for sales
    } else {
      setProductPurchaseQty(null);
    }
  };

  //Delete 
  const handleDelete = async (obj) => {
    try {
      const purchaseId = obj._id;

      const httpReq = http(token);

      // // Delete purchase and warehouse records
      await httpReq.delete(`/api/warehouse/delete/${purchaseId}`);
      await httpReq.delete(`/api/purchase/delete/${purchaseId}`);
      toast.success("Purchase record and supplier transaction deleted successfully");
      mutate("/api/purchase/get");
    } catch (err) {
      toast.error("Failed to delete purchase record");
    }
  };

  const handleEdit = async (record) => {
    toast.warning("Please refill the whole red color fields before updating! ")
    setSupplierEditData(record);

    setEdit(true);
    setIsWeight(true)
    form.setFieldsValue({
      ...record,
      purchaseDate: record?.purchaseDate ? dayjs(record?.purchaseDate) : record?.createdAt,
      qty: record?.quantity,
      supplier: record.supplierName,
      supplierId: record.supplierId,
    });

    setTimeout(() => {
      setEditText(" ")
    }, 3000);

    const httpReq = http();
    const { data: purchase } = await httpReq.get(`/api/purchase/get/${record._id}`);
    return setPurchase(purchase);

  };

  const handleIspassed = async (id) => {
    try {
      const httpReq = http();
      await httpReq.put(`/api/purchase/update/${id}`, { isPassed: true });
      toast.success("Purchase marked as passed!");
      mutate("/api/purchase/get");
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
    { title: <span className="text-sm md:!text-1xl font-semibold">Item</span>, dataIndex: 'productName', key: 'productName', width: 90 },
    {
      title: <span className="text-sm md:!text-1xl font-semibold">Qty</span>,
      dataIndex: 'quantity',
      key: 'quantity',
      width: 90,
      render: (_, record) => (
        <span>{record.quantity} {record.unit}</span>
      )
    },

    { title: <span className="text-sm md:!text-1xl font-semibold">Supplier</span>, dataIndex: 'supplierName', key: 'supplier', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Belong To</span>, dataIndex: 'companyName', key: 'company', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Warehouse</span>, dataIndex: 'warehouseName', key: 'warehouse', width: 120 },
    {
      title: <span className="text-sm md:!text-1xl font-semibold">Unit Cost $</span>, dataIndex: 'unitCost', key: 'unitCost',
      render: (_, record) => (
        <span className='w-full flex justify-between px-1 gap-1'>
          <span>{Number(record.unitCost).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
          </span>
          <span className='!text-blue-500'> USD</span>
        </span>
      ),
    },
    {
      title: "Total Amt $",
      dataIndex: "totalCost",
      key: "totalCost",
      render: (_, record) => (
        <span className="w-full flex justify-between px-1 gap-1">
          <span>{Number(record.totalCost).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</span>
          <span className='!text-blue-500'> USD</span>
        </span>
      ),
    },
    {
      title: "Unit Cost",
      dataIndex: "to",
      key: "exchangedAmt",
      render: (_, record) => (
        <span className="w-full flex justify-between px-1 gap-1">
          <span>{Number(record.exchangedAmt).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</span>
          <span className='!text-blue-500'>{record.currency}</span>
        </span>
      ),
    },
    {
      title: "Total Amt",
      dataIndex: "to",
      key: "exchangedAmt",
      render: (_, record) => (
        <span className="w-full flex justify-between px-1 gap-1">
          <span>{Number(record.totalLocalCost).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</span>
          <span className='!text-blue-500'>{record.currency}</span>
        </span>
      ),
    },
    { title: <span className="text-sm md:!text-1xl font-semibold">Country</span>, dataIndex: 'countryName', key: 'country', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Batch No</span>, dataIndex: 'batch', key: 'batch', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Dealer</span>, dataIndex: 'dealerName', key: 'dealer', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Fees</span>, dataIndex: 'comission', key: 'comission', width: 90 },
    {
      title: <span className="text-sm md:!text-1xl font-semibold">Pur-Date</span>, dataIndex: 'createdAt', key: 'createdAt', width: 110,
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "-", // format date
    },
    { title: <span className="text-sm md:!text-1xl font-semibold">Description</span>, dataIndex: 'description', key: 'description', width: 150 },

    // print
    {
      title: (
        <span className="text-sm md:!text-1xl font-semibold !text-white">
          Print
        </span>
      ),
      key: "print",
      width: 40,
      fixed: "right",
      render: (_, record) => (
        <span
          className="!text-white !w-full !w-[20px] !justify-center !rounded-full cursor-pointer"
          onClick={() => handlePrint(record)}
        >
          <PrinterOutlined className=" !p-2 bg-zinc-600 flex justify-center h-[20px] !w-[30]  md:!w-[100%]  md:text-[15px]" />
        </span>
      )
    }
    ,


    {
      title: (
        <span className="text-sm md:!text-1xl font-semibold !text-white">
          Edit
        </span>
      ),
      key: "edit",
      width: 20,
      fixed: "right",
      render: (_, record) => (
        <a
          onClick={() => handleEdit(record)}
          className="!text-white  !w-[100px] "
        >
          <EditOutlined className=" !p-2 bg-blue-700 flex justify-center h-[20px] !w-[30]   md:!w-[100%]  md:text-[15px]" />
        </a>
      ),
    },
    {
      title: (
        <span className="text-sm md:!text-1xl font-semibold !text-white">
          Pass
        </span>
      ),
      key: "ispassed",
      width: 20,
      fixed: "right",
      render: (_, record) => (

        <Popconfirm
          title="Are you sure to Pass this Purchase?"
          description="This action cannot be undone."
          okText="yes"
          cancelText="No"
          onConfirm={async () => handleIspassed(record._id)}
          className="!text-white  !w-[40px] !rounded-9"
        >

          <CheckOutlined className=" !p-2 bg-green-700 flex justify-center h-[20px] !w-[30]   md:!w-[100%]  md:text-[15px]" />
        </Popconfirm>
      ),
    },
    {
      title: <span className="text-sm md:!text-1xl font-semibold !text-white ">Delete</span>, key: 'delete',
      width: 20,
      fixed: "right",
      render: (_, obj) => (
        <Popconfirm
          title="Are you sure to delete this purchase record?"
          description="This action cannot be undone."
          okText="yes"
          cancelText="No"
          onConfirm={async () => handleDelete(obj)}
          className="!text-white w-full !w-[100px] !rounded-full"
        >
          <a className="!text-white w-full  !rounded-full"><DeleteOutlined className=" !p-2 bg-red-700 flex justify-center h-[20px] !w-[30]   md:!w-[100%]  md:text-[15px]" /></a>
        </Popconfirm>
      )


    }

  ];

  // data source
  const dataSource = purchaseData?.data.filter(item => item.isPassed === false).map((item) => ({
    ...item,
    key: item._Id
  }))

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
    const orderNo = `Or-${Math.floor(100000 + Math.random() * 900000)}`;
    const httpReq = http(token);

    try {
      const selectedSupplier = supplier.find(s => s.supplierId === values.supplierId);
      const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);

      const finalQty = weight && qty ? weight * qty : 1 || 0;
      const formattedValues = {
        ...values,
        orderNo,
        currency: currencyName || "",
        quantity: qty,
        purchaseDate: values.purchaseDate ? values.purchaseDate.toDate() : null,
        supplierName: selectedSupplier?.supplierName || "",
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
      const purchaseData = await httpReq.post("/api/purchase/create", formattedValues);
      const purchaseId = purchaseData?.data?.data?._id;

      const warehouseData = {

        ...values,
        orderNo,
        transaction: "purchase",
        transactionId: purchaseId,
        quantity: qty,
        currency: "USD",
        transactionDate: values.purchaseDate ? values.purchaseDate.toDate() : null,
        supplierName: selectedSupplier?.supplierName || "",
        productName: selectedProduct?.productName || "",
        companyName: selectedCompany?.companyName || "",
        warehouseName: selectedStock?.stockName || "",
        totalCost: finalQty * (Number(values?.unitCost) || 0),
        totalLocalCost: finalQty * (Number(values?.exchangedAmt) || 0),
        isPassed: false,
        transactionType: "In",
      }


      await httpReq.post("/api/warehouse/create", warehouseData)


      toast.success("Purchase record and transaction added successfully");
      mutate("/api/purchase/get");
      form.resetFields();
      setSupplierData("");

    } catch (err) {
      console.error("Error in onFinish:", err.response?.data || err.message);
      toast.error("Failed to register");
    } finally {
      setTimeout(() => {
        setBtnDisabled(false);
        setBtnText(edit ? "Update Purchase" : "Add Purchase");
      }, 2000);
    }
  };

  //update function
  const onUpdate = async (values) => {

    setBtnDisabled(true);
    setBtnText("Processing...");
    try {
      //  Find selected objects from arrays
      const selectedSupplier = supplier.find(s => s.supplierId === values.supplierId);
      const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);
      const httpReq = http(token);

      const qty = values.qty ?? supplierEditData.quantity ?? 0;
      const weight = values.weight ?? supplierEditData.weight ?? 1;
      const finalQty = weight * qty;
      const formattedValues = {
        ...supplierEditData,
        ...values,
        weight,
        currency: currencyName || "",
        purchaseDate: values.purchaeDate ? values.purchaseDate.toDate() : supplierEditData.purchaseDate,
        salePrice: selectedProduct?._id || values.salePrice,
        party: selectedProduct?._id || values.party,
        supplierId: selectedSupplier.supplierId,
        supplierName: selectedSupplier.supplierName,
        totalCost: (Number(values.unitCost) ?? Number(supplierEditData.unitCost) ?? 0) * finalQty,
        totalLocalCost: (Number(values.exchangedAmt) ?? Number(supplierEditData.exchangedAmt) ?? 0) * finalQty,
        productId: selectedProduct?._id || values.productId,
        productName: selectedProduct?.productName || values.productName,
        companyId: selectedCompany?._id || values.companyId,
        companyName: selectedCompany?.companyName || values.companyName,
        warehouseId: selectedStock?._id || values.warehouseId,
        warehouseName: selectedStock?.stockName || values.warehouseName,
        dealerId: selectedDealer?._id || values.dealerId,
        dealerName: selectedDealer?.dealerName || values.dealerName,
        totalComission: (Number(values.comission) ?? Number(supplierEditData.comission) ?? 0) * finalQty,
        totalExComission:
          ((Number(values.comission) ?? Number(supplierEditData.comission) ?? 0) * finalQty *
            (Number(exchange) ?? 1)),
        comission: Number(values.comission ?? supplierEditData.comission ?? 0),
      };
      // Update purchase
      const purchaseRes = await httpReq.put(`/api/purchase/update/${values._id}`, formattedValues);


      const purchaseId = purchaseRes?.data?.data?._id;
      const warehouseData = {
        ...values,
        transactionId: purchaseId,
        weight,
        currency: "USD",
        quantity,
        transactionDate: values.purchaeDate ? values.purchaseDate.toDate() : supplierEditData.purchaseDate,
        salePrice: selectedProduct?._id || values.salePrice,
        party: selectedProduct?._id || values.party,
        supplierId: selectedSupplier.supplierId,
        supplierName: selectedSupplier.supplierName,
        totalCost: (Number(values.unitCost) ?? Number(supplierEditData.unitCost) ?? 0) * finalQty,
        totalLocalCost: (Number(values.exchangedAmt) ?? Number(supplierEditData.exchangedAmt) ?? 0) * finalQty,
        productId: selectedProduct?._id || values.productId,
        productName: selectedProduct?.productName || values.productName,
        companyId: selectedCompany?._id || values.companyId,
        companyName: selectedCompany?.companyName || values.companyName,
        warehouseId: selectedStock?._id || values.warehouseId,
        warehouseName: selectedStock?.stockName || values.warehouseName,
        transactionType: "In",
      }

      await httpReq.put(`/api/warehouse/update/${purchaseId}`, warehouseData)
      toast.success("Supplier transaction updated successfully");
      form.resetFields();
      mutate("/api/purchase/get");

      setSupplierData("");
    } catch (err) {
      console.error("err", err);
      toast.error("Update Failed");
    } finally {
      // Re-enable after 2 seconds
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
      },

    ]

  //exchange rate effect
  useEffect(() => {
    const rate = crncy || 1;
    setExchange(rate);
  }, [crncy, unitCost, currency]);

  // sales price effect
  useEffect(() => {
    if (!products || !Array.isArray(products.data)) return;

    const product = products.data.find(
      (item) => String(item._id) === String(selectedProduct)
    );

    if (product) {
      setSalePrice(product.salePrice);
      form.setFieldsValue({ salePrice: product.salePrice });
    }
  }, [selectedProduct, products]);

  // exchange amount calculation effect
  useEffect(() => {
    const quantity = qty * weight
    setExchangedAmt(Number(unitCost) * exchange);
    setQuantity(quantity)
  }, [qty, unitCost, exchange, crncy]);

  useEffect(() => {
    form.setFieldsValue({ exchangedAmt: exchangedAmt });
  }, [exchangedAmt, form]);

  const initialPurchaseDate = supplierData?.purchaseDate
    ? dayjs(supplierData.purchaseDate, "DD-MM-YYYY")
    : null;

  return (
    <UserLayout>
      <div>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          className="mt-4"
          toastClassName="bg-gray-500 !text-zinc-700 md:text-lg font-semibold rounded-md shadow-lg"
         
        />
        <div className="p-4 bg-zinc-100">
          {/* Purchase Form */}
          <div className='flex w-full gap-4 items-center flex item-center justify-between bg-gradient-to-r from-zinc-300 to-orange-100  px-4'>
            <h2 className="text-sm md:text-4xl p-2 text-white font-bold [text-shadow:2px_2px_4px_rgba(1,2,2,0.5)]">Create Purchase Record</h2>
            <div> {productQty && (
              <div className='!text-yellow-200  bg-blue-900 mt-3 md:text-1xl text-sm mb-2 p-2'>
                <span className='text-white'>Availible Qty:</span> {Number(productQty) - Number(productPurchaseQty)},{productUnit || null}
              </div>

            )}</div>

            <div className='mb-4 w-[50%] flex justify-end p-2 '>
              <ExchangeCalculator />
            </div>


          </div>
          <Card className="mb-0 shadow-md !rounded-none !bg-zinc-50 ">
            <Form
              form={form}
              layout="vertical"
              onFinish={edit ? onUpdate : onFinish}
              initialValues={{ userName: userName, purchaseDate: initialPurchaseDate }}
            >
              <div className='md:grid md:grid-cols-8 gap-1'>

                <Form.Item name="_id" hidden>
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Product Name"
                  name="productId"
                  rules={[{ required: true, message: "Please select a product" }]}
                  className="!mb-0"
                >
                  <Select
                    showSearch
                    placeholder="Select a Product"
                    optionFilterProp="label"
                    onChange={handleProductChange}
                    options={productOptions}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className='text-red-500  font-semibold'>Quantity</span>}
                  name="quantity"
                  rules={[{ required: true, message: "Please enter item quantity" }]}
                >
                  <Input
                    placeholder="Enter item quantity"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                </Form.Item>
                <Form.Item
                  label={<span className='text-red-500  font-semibold'>Unit Cost</span>}
                  name="unitCost"
                  rules={[{ required: true, message: "Please enter item Price" }]}
                >
                  <Input
                    placeholder="Enter item Price"
                    value={unitCost}
                    onChange={handleUnitCost}
                  />
                </Form.Item>
                <Form.Item
                  label="Unit"
                  name="unit"
                  rules={[{ required: true, message: "Please enter unit name" }]}
                >
                  <Select
                    value={unit}
                    onChange={(e) => setUnit(e)}
                    showSearch
                    placeholder="Select a Unit"
                    optionFilterProp="label"
                    options={units}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className='text-red-500  font-semibold'>Weight</span>}
                  name="weight"
                  hidden={!(unit === "box" || isWeight)}
                >
                  <Input
                    value={weight}
                    onChange={handleWeightChange}
                  />
                </Form.Item>
                <Form.Item
                  label={<span className='text-red-500  font-semibold'>Currency</span>}
                  name="currency"
                >
                  <Select
                    value={currencyName}
                    showSearch
                    placeholder="Enter Currency"
                    optionFilterProp="label"
                    options={currencyOptions}
                    onChange={currencyChange}
                  />

                </Form.Item>

                <Form.Item
                  name="exchangedAmt"
                  label={<span className='text-blue-500  font-semibold'>Exch Amt</span>}
                >
                  <Input readOnly value={exchangedAmt} />
                </Form.Item>

                <Form.Item
                  label="Sale Price"
                  name="salePrice"
                >
                  <Input disabled value={salePrice} />
                </Form.Item>

                <Form.Item
                  label="Supplier Name"
                  name="supplierId"
                  rules={[{ required: true, message: "Please enter supplier name" }]}
                >
                  <Select
                    value={supplierData?.supplierId || undefined}
                    onChange={(e) => supplierChange(e)}
                    showSearch
                    placeholder="Select a Supplier"
                    optionFilterProp="label"
                    options={supplierOptions}
                  />
                </Form.Item>

                <Form.Item
                  label="Company"
                  name="companyId"
                  rules={[{ required: true, message: "Please Enter company name" }]}
                >
                  <Select
                    value={form.getFieldValue("companyId")}
                    showSearch
                    placeholder="Select a Company"
                    optionFilterProp="label"
                    options={companyOptions}
                  />
                </Form.Item>

                <Form.Item
                  label="Warehouse"
                  name="warehouseId"
                  rules={[{ required: true, message: "Please Enter warehouse name" }]}
                >
                  <Select
                    value={form.getFieldValue("warehouseId")}
                    showSearch
                    placeholder="Select a Warehouse"
                    optionFilterProp="label"
                    options={stockOptions}
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
                  label="Batch No"
                  name="batch"
                  rules={[{ required: true, message: "Please enter batch No" }]}
                >
                  <Input placeholder="Enter Batch No" />
                </Form.Item>

                <Form.Item
                  label="Party No"
                  name="party"
                  rules={[{ required: true, message: "Please enter Party No" }]}
                >
                  <Input placeholder="Enter Party No" />
                </Form.Item>

                <Form.Item
                  label="Dealer"
                  name="dealerId"
                >
                  <Select
                    value={form.getFieldValue("dealerId")}
                    showSearch
                    placeholder="Enter Dealer"
                    optionFilterProp="label"
                    options={dealerOptions}
                  />
                </Form.Item>

                <Form.Item
                  label="Comission"
                  name="comission"
                  rules={[{ required: true, message: "Please enter Comission" }]}
                >
                  <Input placeholder="Enter comission" />
                </Form.Item>

                <Form.Item
                  label="Purchase Date"
                  name="purchaseDate"
                >
                  <DatePicker className="w-full" format="MM/DD/YYYY" />
                </Form.Item>

                <Form.Item
                  label="userName"
                  name="userName"
                >
                  <Input disabled className='!text-red-600' />
                </Form.Item>

              </div>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please enter Description" }]}
              >
                <TextArea placeholder="Enter description" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="text"
                  htmlType="submit"
                  disabled={btnDisabled}
                  className={`w-[200px] md:!h-[30px] !shadow-zinc-500 !shadow-lg !text-white hover:!shadow-lg hover:!shadow-zinc-800 hover:!text-white !font-bold 
        ${edit ? "!bg-orange-500 hover:!bg-orange-600" : "!bg-blue-500 hover:!bg-green-500 !rounded-none"}
        ${btnDisabled ? "!bg-gray-400 hover:!bg-gray-400 cursor-not-allowed" : ""}`}
                >
                  {btnText}
                </Button>
              </Form.Item>
            </Form>

          </Card>


        </div>
        <div>
          <div className='text-zinc-600 md:text-lg text-sm p-4 font-bold'>Purchase Records:</div>
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
                tableLayout: 'fixed',
                borderRadius: 0,
              }}
            />

          </div>

        </div>


      </div>
    </UserLayout>


  )
}

export default Purchase;
