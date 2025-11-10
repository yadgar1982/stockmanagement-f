import React from 'react'
import dayjs from "dayjs"

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Table, Popconfirm, } from "antd"
const { Option } = Select;
import UserLayout from '../../Shared/UserLayout';
import TextArea from 'antd/es/input/TextArea';
import { DatePicker } from 'antd';
import { ToastContainer, toast } from "react-toastify";
import { http, fetcher } from "../../Modules/http";
import Cookies from "universal-cookie";
import useSWR, { mutate } from "swr";
import { CheckOutlined, DeleteOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';
import {countries} from '../../Shared/countries/countries.js'
const cookies = new Cookies();

import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomers } from '../../../redux/slices/customerSlice';
import { fetchProducts } from '../../../redux/slices/productSlice';
import { fetchStock } from '../../../redux/slices/stockSlice';
import { fetchCompany } from '../../../redux/slices/companySlice';
import { fetchDealer } from '../../../redux/slices/dealerSlice';
import { fetchCurrency } from '../../../redux/slices/currencySlice';


const Sales = () => {
  const dispatch = useDispatch();

  const token = cookies.get("authToken")
  const [purchases, setPurchases] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [unit, setUnit] = useState("");
  const [qty, setQty] = useState(0);
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
  const [cusId, setcusId] = useState("");
  const [open, setOpen] = useState(false);
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

  const getCustomerById = (customerArray, cusId) => {
    if (!Array.isArray(customerArray)) return null;
    return customerArray.find((item) => item.customerId === cusId) || null;
  };
  const selectedCustomer = getCustomerById(all, cusId);


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

  //branding


  useEffect(() => {
    dispatch(fetchCustomers())
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
      setSalesData(sales?.data || null);
    }
  }, [sales])


  //get all supppliers
  const handleCus = async (id) => {
    const httpReq = http();
    const { data } = await httpReq.get(`/api/customer/get/${id}`);
    return data;
  }


  //print function
 const handlePrint = async (record) => {
      const createdDate = new Date(record.createdAt);

      // Add 1 month
      const nextMonthDate = new Date(createdDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const formattedDate = nextMonthDate.toLocaleDateString();
    try {
      //  Fetch customer data first
      const customer = await handleCus(record.customerId);

      // Create a hidden iframe for printing
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.top = "0";
      iframe.style.left = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;


      const style = doc.createElement("style");
      style.textContent = `
      body {
        font-family: Arial, sans-serif;
        margin: 50px 20px 20px 20px; /* push down content */
      }
      header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
      }
      .company, .vendor {
        width: 48%;
      }
      .company img {
        max-width: 100px;
        margin-bottom: 10px;
      }
      h1 {
        text-align: center;
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      th, td {
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f0f0f0;
      }
      tfoot td {
        font-weight: bold;
      }
      .footer {
        margin-top: 30px;
        font-size: 0.9em;
      }
    `;
      doc.head.appendChild(style);

     // Add HTML content
      doc.body.innerHTML = `
      
      <header>
         <!-- LEFT: Company -->
        <div class="company">
          <img src="./logo.jpg" alt="Company Logo" width="55" />
          <br>
           <strong>Company Details::</strong><br>
          Seller:<strong>${branding[0]?.name}</strong><br>
          Address: ${branding[0]?.address || "-"}<br>
          Phone: ${branding[0]?.mobile || "-"}<br>
          Email: ${branding[0]?.email || "-"}<br>
          Invoice Date: ${record?.createdAt ? new Date(record.createdAt).toLocaleDateString() : "-"}<br>
          Last Due Date: ${formattedDate}<br>
          PO #: ${record._id}
        </div>

        <!-- RIGHT: Customer -->
        <div class="vendor">
          <strong>Customer Details:</strong><br>
          Buyer: ${customer.fullname || "-"}<br>
          Address: ${customer.country || "-"}<br>
          Phone: ${customer.mobile || "-"}<br>
          Email: ${customer.email || "-"}<br>
         
        </div>
      </header>

      <h1>Invoice — ${record.productName}</h1>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Details</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Unit-Price USD</th>
            <th>Exch Price (${record.currency})</th>
            <th>Belong-To</th>
            <th>Total USD</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>${record.productName}</td>
            <td>${record.quantity}</td>
            <td>${record.unit}</td>
            <td>${record.unitCost}</td>
            <td>${record.exchangedAmt}</td>
            <td>${record.companyName}</td>
            <td>${record.quantity * record.unitCost}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="7">Subtotal</td>
            <td>${record.quantity * record.unitCost}</td>
          </tr>
        </tfoot>
      </table>

      <div>Created by: ${record.userName}</div>
      <div class="footer">
        If you have any questions about this order, please contact the receiver.
      </div>
    `;

      iframe.contentWindow.focus();
      iframe.contentWindow.print();


      setTimeout(() => document.body.removeChild(iframe), 500);
    } catch (err) {
      console.error("Failed to fetch customer or print:", err);
    }
  };

  const customerChange = async (id) => {
    const httpReq = http();
    const { data } = await httpReq.get(`/api/customer/get/${id}`);
    return setCustomerData(data);
  }

  // get userName
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userName = userInfo?.fullname || "";




  //Delete 
  const handleDelete = async (obj) => {
    try {
       const salesId = obj._id;
      const httpReq = http(token);
      await httpReq.delete(`/api/sale/delete/${salesId}`);
      toast.success("Purchase record deleted successfully");
      mutate("/api/sale/get");
    } catch (err) {
      toast.error("Failed to delete purchase record", err);
    }
  }
const handleEdit = async (record) => {
    setCustomerData(record);

    form.setFieldsValue({
      ...record,
      customerId: record.customerId,
      salesDate:initialSalesDate,
    });
     setEdit(true);
};

 const handleIspassed=async(id)=>{
    try{
      const httpReq=http();
    await httpReq.put(`/api/sale/update/${id}`,{isPassed:true});
      toast.success("Purchase marked as passed!");
      mutate("/api/sale/get");
    }catch(err){
      toast.error("Failed to Pass!",err);
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
    { title: <span className="text-sm md:!text-1xl font-semibold">Qty</span>, dataIndex: 'quantity', key: 'quantity', width: 90 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Unit</span>, dataIndex: 'unit', key: 'unit', width: 80 },
    { title: <span className="text-sm md:!text-1xl font-semibold">customer</span>, dataIndex: 'customerName', key: 'customer', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Belong To</span>, dataIndex: 'companyName', key: 'company', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Warehouse</span>, dataIndex: 'warehouseName', key: 'warehouse', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Unit Cost</span>, dataIndex: 'unitCost', key: 'unitCost', width: 100 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Currency</span>, dataIndex: 'currency', key: 'currency', width: 100 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Exch Amt</span>, dataIndex: 'exchangedAmt', key: 'exchangedAmt', width: 100 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Country</span>, dataIndex: 'countryName', key: 'country', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Batch No</span>, dataIndex: 'batch', key: 'batch', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Dealer</span>, dataIndex: 'dealerName', key: 'dealer', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Fees</span>, dataIndex: 'comission', key: 'comission', width: 90 },
    {
      title: <span className="text-sm md:!text-1xl font-semibold">Pur-Date</span>, dataIndex: 'createdAt', key: 'createdAt', width: 110,
      render: (date) => date ? dayjs(date).format("MM/DD/YYYY") : "-", // format date
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
          <PrinterOutlined className=" !p-2 bg-zinc-700 flex justify-center h-[20px] !w-[30]   md:!w-[100%]  md:text-[15px]"/>
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
          className="!text-white  !w-[100px] !rounded-full"
        >
          <EditOutlined className=" !p-2 bg-blue-700 flex justify-center h-[20px] !w-[30]   md:!w-[100%]  md:text-[15px]" />
        </a>
      ),
    },
    {
      title: (
        <span className="text-sm md:!text-1xl font-semibold !text-white">
          Edit
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
          <a className="!text-white w-full  !rounded-full"><DeleteOutlined className="!p-2 bg-red-700 flex justify-center h-[20px] !w-[30]   md:!w-[100%]  md:text-[15px]" /></a>
        </Popconfirm>
      )


    }

  ];

 
 const dataSource = salesData
  ?.filter((item) => item.isPassed === false)
  .map((item) => ({
    ...item,
    key: item._id,
  })) || [];
  //currency change
  const currencyChange = (e) => {
    // e is the selected currency string, e.g., "AFN"
    const selectedCurrency = currency.find((i) => i.currencyName === e);

    if (selectedCurrency) {
      console.log("Selected currency object:", selectedCurrency);
      console.log("Rate:", selectedCurrency.rate);
      setCrncy(Number(selectedCurrency.rate))
    } else {
      console.log("Currency not found");
    }
  };

  const onFinish = async (values) => {
    const httpReq = http(token);

    try {
      // Find selected objects from arrays
      const selectedCustomer = customer.find(s => s.customerId === values.customerId);
      const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);

      const formattedValues = {
        ...values,
      
        salesDate: values.salesDate ? values.salesDate.toDate() : null,
        customerName: selectedCustomer?.customerName,
        productName: selectedProduct?.productName,
        companyName: selectedCompany?.companyName,
        warehouseName: selectedStock?.stockName,
        dealerName: selectedDealer?.dealerName,
        totalCost: (Number(values?.quantity) || 0) * (Number(values?.unitCost) || 0),
        totalLocalCost: (Number(values?.quantity) || 0) * (Number(values?.exchangedAmt) || 0),
        isPassed:false,
      };

      const data = await httpReq.post("/api/sale/create", formattedValues);
      toast.success("Sale record added successfully");
      mutate("/api/sale/get");
      form.resetFields();
      return data;

    } catch (err) {
        console.log(err);
      toast.error( `Failed: ${err?.response?.data?.message || err?.message || "Unknown error"}`);
    }
  };


  const onUpdate = async (values) => {

    try {
      const httpReq = http(token);
      const formattedValues = {
        ...values,
        customerId: customerData?._id,
        customerName: customerData?.fullname,
        totalCost: (Number(values?.quantity) || 0) * (Number(values?.unitCost) || 0),
        totalLocalCost: (Number(values?.quantity) || 0) * (Number(values?.exchangedAmt) || 0),
      };
      await httpReq.put(`/api/sale/update/${values._id}`, formattedValues)
      toast.success("Sale record updated successfully")
      mutate("/api/sale/get");
      setEdit(false)
      form.resetFields();
    } catch (err) {
      console.log(err);
      toast.error("Update Failed", err)
    }
  }


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
      {
        value: 'Inches',
        label: 'inche',
      },

    ]


//exchange rate
  useEffect(() => {
   // Use its rate, 
    const rate = crncy || 1;

    setExchange(rate);
  }, [crncy, currency]);
  useEffect(() => {
    setexchangedAmt(Number(unitCost) * exchange);
  }, [qty, unitCost, exchange]); // only recalc when these change

  useEffect(() => {
    form.setFieldsValue({ exchangedAmt: exchangedAmt });
  }, [exchangedAmt, form]);



  const handleProductChange = (value) => {

    setSelectedProduct(value);
//purchase calculation
    if (Array.isArray(totalPurchase)) {
      // filter all matching items (returns an array)
      const filteredPurchase = totalPurchase.filter((p) => p.productId === value);
      // sum the quantities
      const calculatedQty = filteredPurchase.reduce((sum, item) => sum + item.quantity, 0);

      // get unit from first matched item
      const unit = filteredPurchase.length > 0 ? filteredPurchase[0].unit : null;

      setProductUnit(unit);
      setProductQty(calculatedQty);
    }
    if (Array.isArray(salesData)) {
      // filter all matching items (returns an array)
      const filteredSales = salesData.filter((p) => p.productId === value);
      // sum the quantities
      const calculatedSaleQty = filteredSales.reduce((total, item) => total + item.quantity, 0);
      // get unit from first matched item
      const unit = filteredSales.length > 0 ? filteredSales[0].unit : null;

      setProductUnit(unit);
      setProductSaleQty(calculatedSaleQty)
      
     } else {
      setProductQty(null);
      setProductSaleQty(null);
    }

  }

  const initialSalesDate = customerData?.salesDate 
      ? dayjs(customerData?.salesDate, "DD-MM-YYYY") 
      : null;
  
  return (
    <UserLayout>
      <div>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="p-4 bg-zinc-100">
          {/* Sales Form */}
          <div className='flex gap-4 items-center '>
            <h2 className='text-sm  md:text-2xl p-2 font-semibold text-zinc-600'>Record Sales:</h2>
            <div> {productQty && (
              <div className='text-red-500 mt-3 md:text-1xl text-sm mb-2'>
                Availible Qty: {productQty-productSaleQty},{productUnit || null}
              </div>
            )}</div>
          </div>
          <Card className="mb-0 shadow-md !rounded-none ">
            <Form
              layout="vertical"
              onFinish={edit ? onUpdate : onFinish}
              form={form}
              initialValues={{ userName: userName,salesDate: initialSalesDate }}
              size='small'


            >
              <div className='md:grid md:grid-cols-8  gap-2'>
                <Form.Item name="_id" hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Product Name"
                  name="productId"
                  rules={[{ required: true, message: "Please enter unit name" }]}
                >
                  <Select
                    value={selectedProduct}
                    onChange={handleProductChange}
                    showSearch
                    placeholder="Select a Unit"
                    optionFilterProp="label"
                    options={productOptions}
                  />
                </Form.Item>
                <Form.Item
                  label="Quantity"
                  name="quantity"
                  rules={[{ required: true, message: "Please enter item quantity" }]}
                >
                  <Input placeholder="Enter item quantity"
                    onChange={(e) => setQty(Number(e.target.value))} />
                </Form.Item>
                <Form.Item
                  label="Unit"
                  name="unit"
                  rules={[{ required: true, message: "Please enter unit name" }]}
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
                  label="Customer"
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
                  label="company"
                  name="companyId"
                  rules={[{ required: true, message: "Please Enter company name" }]}
                >
                  <Select
                    showSearch
                    placeholder="Select a customer"
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
                    showSearch
                    placeholder="Select a customer"
                    optionFilterProp="label"
                    options={stockOptions}
                  />
                </Form.Item>
                <Form.Item
                  label="Unit Cost"
                  name="unitCost"
                  rules={[{ required: true, message: "Please enter item Price" }]}
                >
                  <Input placeholder="Enter enter item Price" onChange={(e) => setUnitCost(Number(e.target.value))}
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
                  label="Batch No"
                  name="batch"
                  rules={[{ required: true, message: "Please enter batch No" }]}
                >
                  <Input placeholder="Enter enter Batch No"
                  />
                </Form.Item>
                <Form.Item
                  label="Dealer"
                  name="dealerId"
                >
                  <Select
                    showSearch
                    placeholder="Enter Dealer"
                    optionFilterProp="label"
                    options={dealerOptions}
                    rules={[{ required: true, message: "Please Enter dealer name" }]}
                  />
                </Form.Item>
                <Form.Item
                  label="Comission"
                  name="comission"
                  rules={[{ required: true, message: "Please enter Comission" }]}
                >
                  <Input placeholder="Enter enter comission"
                  />
                </Form.Item>
                <Form.Item
                  label="Sales Date"
                  name="salesDate"
                >
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
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
                  ${edit ? "!bg-orange-500 hover:!bg-orange-600" : "!bg-blue-500 hover:!bg-green-500"}
                `} >
                  {`${edit ? "Update" : "Submit"}`}
                </Button>
              </Form.Item>
            </Form>
          </Card>


        </div>
        <div>
          <div className='text-zinc-600 md:text-lg text-sm p-4 font-bold'>Sales Records:</div>
        </div>
        <div className="w-full   overflow-x-auto">


          <div className="text-xs w-[100%] mx-auto px-4">
            <Table
              columns={columns}
              dataSource={dataSource || ""}
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

export default Sales;