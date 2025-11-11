import React from 'react'
import dayjs from "dayjs"

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Table, Popconfirm, } from "antd"
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



const Purchase = () => {
  const dispatch = useDispatch();

  const token = cookies.get("authToken")
  const [purchases, setPurchases] = useState([]);
  const [unit, setUnit] = useState("");
  const [qty, setQty] = useState(0);
  const [unitCost, setUnitCost] = useState(0)
  const [exchange, setExchange] = useState(0)
  const [crncy, setCrncy] = useState("")
  const [exchangedAmt, setexchangedAmt] = useState(1)
  const [exComission, setExComission] = useState(1)
  const [productQty, setProductQty] = useState(null);
  const [productUnit, setProductUnit] = useState(null);
  const [totalPurchase, setTotalPurchase] = useState([])
  const [edit, setEdit] = useState(false)
  const [supplierData, setSupplierData] = useState(null);

  const [purchase, setPurchase] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");

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

  //branding


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


  //get all supppliers
  const handleSup = async (id) => {

    const httpReq = http();
    const { data } = await httpReq.get(`/api/supplier/get/${id}`);
    return data;
  }

  //print function
  const handlePrint = async (record) => {

    try {
      // 1️⃣ Fetch supplier data first
      const supplier = await handleSup(record.supplierId);

      // 2️⃣ Create a hidden iframe for printing
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

      // 4️⃣ Add HTML content
      doc.body.innerHTML = `
      <header>
        <!-- LEFT: Company -->
        <div class="company">
          <img src="./logo.jpg" alt="Company Logo" width="55" />
          <br>
          <strong>${branding[0]?.name}</strong><br>
          Address: ${branding[0]?.address || "-"}<br>
          Phone: ${branding[0]?.mobile || "-"}<br>
          Email: ${branding[0]?.email || "-"}<br>
          Date: ${branding[0]?.createdAt ? new Date(branding[0].createdAt).toLocaleDateString() : "-"}<br>
          PO #: ${record._id}
        </div>

        <!-- RIGHT: Vendor -->
        <div class="vendor">
          <strong>Vendor:</strong><br>
          Vendor: ${supplier.fullname || "-"}<br>
          Address: ${supplier.country || "-"}<br>
          Phone: ${supplier.mobile || "-"}<br>
          Email: ${supplier.email || "-"}<br>
          Date: ${new Date(record.createdAt).toLocaleDateString()}
        </div>
      </header>

      <h1>Purchase Receiver — ${record.productName}</h1>

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
      console.error("Failed to fetch supplier or print:", err);
    }
  };


  const supplierChange = async (id) => {
    const httpReq = http();
    const { data } = await httpReq.get(`/api/supplier/get/${id}`);
    return setSupplierData(data);
  }

  // get userName
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userName = userInfo?.fullname || "";


  //Delete 
  const handleDelete = async (obj) => {
    try {
      const purchaseId = obj._id;

      const httpReq = http(token);

      // // Delete purchase
      await httpReq.delete(`/api/purchase/delete/${purchaseId}`);
      toast.success("Purchase record and supplier transaction deleted successfully");
      mutate("/api/purchase/get");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete purchase record");
    }
  };

  const handleEdit = async (record) => {
    setSupplierData(record);

    form.setFieldsValue({
      ...record,
      supplierId: record.supplierId,
      purchaseDate:initialPurchaseDate
    });

    setEdit(true); // set edit state with full rec

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
    { title: <span className="text-sm md:!text-1xl font-semibold">Qty</span>, dataIndex: 'quantity', key: 'quantity', width: 90 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Unit</span>, dataIndex: 'unit', key: 'unit', width: 80 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Supplier</span>, dataIndex: 'supplierName', key: 'supplier', width: 120 },
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

  const dataSource = purchaseData?.data.filter(item => item.isPassed === false).map((item) => ({
    ...item,
    key: item._Id
  }))

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
    const selectedSupplier = supplier.find(s => s.supplierId === values.supplierId);
    const selectedProduct = product.find(p => p.productId === values.productId);
    const selectedCompany = company.find(c => c.companyId === values.companyId);
    const selectedStock = stock.find(s => s.stockId === values.warehouseId);
    const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);

    const formattedValues = {
      ...values,
      purchaseDate: values.purchaseDate ? values.purchaseDate.toDate() : null,
      supplierName: selectedSupplier?.supplierName || "",
      productName: selectedProduct?.productName || "",
      companyName: selectedCompany?.companyName || "",
      warehouseName: selectedStock?.stockName || "",
      dealerName: selectedDealer?.dealerName || "",
      totalCost: (Number(values?.quantity) || 0) * (Number(values?.unitCost) || 0),
      totalLocalCost: (Number(values?.quantity) || 0) * (Number(values?.exchangedAmt) || 0),
      isPassed: false,
      totalComission:(Number(values?.comission ||0)*(Number(values?.quantity) || 0)),
       totalExComission: ((Number(values?.comission) || 0) * (Number(values?.quantity) || 0) * (Number(exchange) || 1))
    };

    console.log("Payload to backend:", formattedValues);

    await httpReq.post("/api/purchase/create", formattedValues);

    toast.success("Purchase record and transaction added successfully");
    mutate("/api/purchase/get");
    form.resetFields();
    setSupplierData("");

  } catch (err) {
    console.error("Error in onFinish:", err.response?.data || err.message);
    toast.error("Failed to register");
  }
};

  const onUpdate = async (values) => {
    try {

      //  Find selected objects from arrays
      const selectedSupplier = supplier.find(s => s.supplierId === values.supplierId);
      const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);
      const httpReq = http(token);

      const formattedValues = {
        ...values,
        supplierId: selectedSupplier.supplierId,
        supplierName: selectedSupplier.supplierName,
        totalCost: (Number(values?.quantity) || 0) * (Number(values?.unitCost) || 0),
        totalLocalCost: (Number(values?.quantity) || 0) * (Number(values?.exchangedAmt) || 0),
        productId: selectedProduct?._id || values.productId,
        productName: selectedProduct?.productName || values.productName,

        companyId: selectedCompany?._id || values.companyId,
        companyName: selectedCompany?.companyName || values.companyName,

        warehouseId: selectedStock?._id || values.warehouseId,
        warehouseName: selectedStock?.stockName || values.warehouseName,

        dealerId: selectedDealer?._id || values.dealerId,
        dealerName: selectedDealer?.dealerName || values.dealerName,
        totalComission:(Number(values?.comission ||0)*(Number(values?.quantity) || 0)),
         totalExComission: ((Number(values?.comission) || 0) * (Number(values?.quantity) || 0) * (Number(exchange) || 1))
      };

      // Update purchase
      await httpReq.put(`/api/purchase/update/${values._id}`, formattedValues);
      mutate("/api/purchase/get");
      form.resetFields();
      toast.success("Supplier transaction updated successfully");
      setSupplierData("");
      setEdit(false);
    } catch (err) {
      console.error(err);
      toast.error("Update Failed");
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
      {
        value: 'Inches',
        label: 'inche',
      },

    ]


  useEffect(() => {



    // Use its rate, fallback to 1 if not found
    const rate = crncy || 1;

    setExchange(rate);
  }, [crncy, currency]);


  useEffect(() => {
    setexchangedAmt(Number(unitCost) * exchange);
  }, [qty, unitCost, exchange]); 

  useEffect(() => {
    form.setFieldsValue({ exchangedAmt: exchangedAmt });
  }, [exchangedAmt, form]);



  const handleProductChange = (value) => {
    setSelectedProduct(value);

    if (Array.isArray(totalPurchase)) {
      const filteredPurchase = totalPurchase.filter((p) => p.productId === value)
      const calculatedQty = filteredPurchase.reduce((sum, item) => sum + item.quantity, 0);

      const unit = filteredPurchase.length > 0 ? filteredPurchase[0].unit : null;
      setProductUnit(unit);
      setProductQty(calculatedQty);
    } else {
      setProductQty(null);
      setProductUnit(null);
    }


  }

  const initialPurchaseDate = supplierData?.purchaseDate 
    ? dayjs(supplierData.purchaseDate, "DD-MM-YYYY") 
    : null;

  return (
    <UserLayout>
      <div>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="p-4 bg-zinc-100">
          {/* Purchase Form */}
          <div className='flex gap-4 items-center '>
            <h2 className='text-sm  md:text-2xl p-2 font-semibold text-zinc-600'>Create Purchase Record</h2>
            <div> {productQty && (
              <div className='text-red-500 mt-3 md:text-1xl text-sm mb-2'>
                Availible Qty: {productQty},{productUnit || null}
              </div>
            )}</div>
          </div>
          <Card className="mb-0 shadow-md !rounded-none ">
            <Form
              layout="vertical"
              onFinish={edit ? onUpdate : onFinish}
              form={form}
              initialValues={{ userName: userName,purchaseDate: initialPurchaseDate }}
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
                  label="Warehouse"
                  name="warehouseId"
                  rules={[{ required: true, message: "Please Enter warehouse name" }]}
                >
                  <Select
                    showSearch
                    placeholder="Select a Supplier"
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
                  label="Purchase Date"
                  name="purchaseDate"
                >
                  <DatePicker className="w-full" format="MM/DD/YYYY" />
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
                  {`${edit ? "Update Purchase" : "Add Purchase"}`}
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
