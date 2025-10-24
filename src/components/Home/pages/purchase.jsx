import React from 'react'
import dayjs from "dayjs"

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Select, Table, Popconfirm, } from "antd"
import UserLayout from '../../Shared/UserLayout';
import TextArea from 'antd/es/input/TextArea';
import { DatePicker } from 'antd';
import { ToastContainer, toast } from "react-toastify";
import { http, fetcher } from "../../Modules/http";
import Cookies from "universal-cookie";
import useSWR, { mutate } from "swr";
import { CheckOutlined, DeleteOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';

const cookies = new Cookies();

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
  const [productQty, setProductQty] = useState(null);
  const [productUnit, setProductUnit] = useState(null);
  const [totalPurchase, setTotalPurchase] = useState([])
  const [edit, setEdit] = useState(false)
  const [supplierData, setSupplierData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [supId, setSupId] = useState("");
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  //get branding
  const branding = JSON.parse(localStorage.getItem("branding") || "null");
  console.log("branding", branding)




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

  const getSupplierById = (suppliersArray, supId) => {
    if (!Array.isArray(suppliersArray)) return null;
    return suppliersArray.find((item) => item.supplierId === supId) || null;
  };
  const selectedSupplier = getSupplierById(allSuppliers, supId);


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
  console.log("supplier", supplierData)

  // get userName
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userName = userInfo?.fullname || "";

  // calculation:
  const totalQty = purchases.reduce((acc, p) => {
    return acc += Number(p.quantity || 0);
  }, 0);


  //Delete 
  const handleDelete = async (id) => {
    try {
      const httpReq = http(token);
      await httpReq.delete(`/api/purchase/delete/${id}`);
      toast.success("Purchase record deleted successfully");
      mutate("/api/purchase/get");
    } catch (err) {
      toast.error("Failed to delete purchase record", err);
    }
  }

  const handleEdit = (record) => {
    form.setFieldsValue(record); // prefill form fields with row data
    setEdit(true); // set edit state with full rec

  };

    
  const handleIspassed=async(id)=>{
    try{
      const httpReq=http();
    await httpReq.put(`/api/purchase/update/${id}`,{isPassed:true});
      toast.success("Purchase marked as passed!");
      mutate("/api/purchase/get");
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
          <EditOutlined className=" !p-2 bg-blue-700 flex justify-center h-[20px] !w-[30]   md:!w-[100%]  md:text-[15px]"/>
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
          onConfirm={async () => handleDelete(obj._id)}
          className="!text-white w-full !w-[100px] !rounded-full"
        >
          <a className="!text-white w-full  !rounded-full"><DeleteOutlined className=" !p-2 bg-red-700 flex justify-center h-[20px] !w-[30]   md:!w-[100%]  md:text-[15px]" /></a>
        </Popconfirm>
      )


    }

  ];

const dataSource= purchaseData?.data.filter(item=>item.isPassed===false).map((item)=>({
  ...item,
  key:item._Id
}))
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
      const selectedSupplier = supplier.find(s => s.supplierId === values.supplierId);
      const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);

      const formattedValues = {
        ...values,
        purchaseDate: values.purchaseDate
          ? values.purchaseDate.format("MM-DD-YYYY")
          : null,

        supplierName: selectedSupplier?.supplierName,
        productName: selectedProduct?.productName,
        companyName: selectedCompany?.companyName,
        warehouseName: selectedStock?.stockName,
        dealerName: selectedDealer?.dealerName,
        isPassed:false,
      };

      const data = await httpReq.post("/api/purchase/create", formattedValues);
      toast.success("Purchase record added successfully");
      mutate("/api/purchase/get");
      form.resetFields();
      return data;

    } catch (err) {
      console.log(err);
      toast.error("Failed to register", err);
    }
  };


  const onUpdate = async (values) => {

    try {
      const httpReq = http(token);
      const formattedValues = {
        ...values,
        supplierId: supplierData?._id,
        supplierName: supplierData?.fullname,
      };
      await httpReq.put(`/api/purchase/update/${values._id}`, formattedValues)
      toast.success("Purchse record updated successfully")
      mutate("/api/purchase/get");
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


  const country = [
    { value: 'Afghanistan', label: 'Afghanistan' },
    { value: 'Albania', label: 'Albania' },
    { value: 'Algeria', label: 'Algeria' },
    { value: 'Andorra', label: 'Andorra' },
    { value: 'Angola', label: 'Angola' },
    { value: 'Antigua and Barbuda', label: 'Antigua and Barbuda' },
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Armenia', label: 'Armenia' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Austria', label: 'Austria' },
    { value: 'Azerbaijan', label: 'Azerbaijan' },
    { value: 'Bahamas', label: 'Bahamas' },
    { value: 'Bahrain', label: 'Bahrain' },
    { value: 'Bangladesh', label: 'Bangladesh' },
    { value: 'Barbados', label: 'Barbados' },
    { value: 'Belarus', label: 'Belarus' },
    { value: 'Belgium', label: 'Belgium' },
    { value: 'Belize', label: 'Belize' },
    { value: 'Benin', label: 'Benin' },
    { value: 'Bhutan', label: 'Bhutan' },
    { value: 'Bolivia', label: 'Bolivia' },
    { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina' },
    { value: 'Botswana', label: 'Botswana' },
    { value: 'Brazil', label: 'Brazil' },
    { value: 'Brunei Darussalam', label: 'Brunei Darussalam' },
    { value: 'Bulgaria', label: 'Bulgaria' },
    { value: 'Burkina Faso', label: 'Burkina Faso' },
    { value: 'Burundi', label: 'Burundi' },
    { value: 'Cabo Verde', label: 'Cabo Verde' },
    { value: 'Cambodia', label: 'Cambodia' },
    { value: 'Cameroon', label: 'Cameroon' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Central African Republic', label: 'Central African Republic' },
    { value: 'Chad', label: 'Chad' },
    { value: 'Chile', label: 'Chile' },
    { value: 'China', label: 'China' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'Comoros', label: 'Comoros' },
    { value: 'Congo (Congo-Brazzaville)', label: 'Congo (Congo-Brazzaville)' },
    { value: 'Costa Rica', label: 'Costa Rica' },
    { value: 'Croatia', label: 'Croatia' },
    { value: 'Cuba', label: 'Cuba' },
    { value: 'Cyprus', label: 'Cyprus' },
    { value: 'Czechia (Czech Republic)', label: 'Czechia (Czech Republic)' },
    { value: 'Denmark', label: 'Denmark' },
    { value: 'Djibouti', label: 'Djibouti' },
    { value: 'Dominica', label: 'Dominica' },
    { value: 'Dominican Republic', label: 'Dominican Republic' },
    { value: 'Ecuador', label: 'Ecuador' },
    { value: 'Egypt', label: 'Egypt' },
    { value: 'El Salvador', label: 'El Salvador' },
    { value: 'Equatorial Guinea', label: 'Equatorial Guinea' },
    { value: 'Eritrea', label: 'Eritrea' },
    { value: 'Estonia', label: 'Estonia' },
    { value: 'Eswatini', label: 'Eswatini' },
    { value: 'Ethiopia', label: 'Ethiopia' },
    { value: 'Fiji', label: 'Fiji' },
    { value: 'Finland', label: 'Finland' },
    { value: 'France', label: 'France' },
    { value: 'Gabon', label: 'Gabon' },
    { value: 'Gambia', label: 'Gambia' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Germany', label: 'Germany' },
    { value: 'Ghana', label: 'Ghana' },
    { value: 'Greece', label: 'Greece' },
    { value: 'Grenada', label: 'Grenada' },
    { value: 'Guatemala', label: 'Guatemala' },
    { value: 'Guinea', label: 'Guinea' },
    { value: 'Guinea-Bissau', label: 'Guinea-Bissau' },
    { value: 'Guyana', label: 'Guyana' },
    { value: 'Haiti', label: 'Haiti' },
    { value: 'Honduras', label: 'Honduras' },
    { value: 'Hungary', label: 'Hungary' },
    { value: 'Iceland', label: 'Iceland' },
    { value: 'India', label: 'India' },
    { value: 'Indonesia', label: 'Indonesia' },
    { value: 'Iran', label: 'Iran' },
    { value: 'Iraq', label: 'Iraq' },
    { value: 'Ireland', label: 'Ireland' },
    { value: 'Israel', label: 'Israel' },
    { value: 'Italy', label: 'Italy' },
    { value: 'Jamaica', label: 'Jamaica' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Jordan', label: 'Jordan' },
    { value: 'Kazakhstan', label: 'Kazakhstan' },
    { value: 'Kenya', label: 'Kenya' },
    { value: 'Kiribati', label: 'Kiribati' },
    { value: 'Korea (North)', label: 'Korea (North)' },
    { value: 'Korea (South)', label: 'Korea (South)' },
    { value: 'Kuwait', label: 'Kuwait' },
    { value: 'Kyrgyzstan', label: 'Kyrgyzstan' },
    { value: 'Laos', label: 'Laos' },
    { value: 'Latvia', label: 'Latvia' },
    { value: 'Lebanon', label: 'Lebanon' },
    { value: 'Lesotho', label: 'Lesotho' },
    { value: 'Liberia', label: 'Liberia' },
    { value: 'Libya', label: 'Libya' },
    { value: 'Liechtenstein', label: 'Liechtenstein' },
    { value: 'Lithuania', label: 'Lithuania' },
    { value: 'Luxembourg', label: 'Luxembourg' },
    { value: 'Madagascar', label: 'Madagascar' },
    { value: 'Malawi', label: 'Malawi' },
    { value: 'Malaysia', label: 'Malaysia' },
    { value: 'Maldives', label: 'Maldives' },
    { value: 'Mali', label: 'Mali' },
    { value: 'Malta', label: 'Malta' },
    { value: 'Marshall Islands', label: 'Marshall Islands' },
    { value: 'Mauritania', label: 'Mauritania' },
    { value: 'Mauritius', label: 'Mauritius' },
    { value: 'Mexico', label: 'Mexico' },
    { value: 'Micronesia', label: 'Micronesia' },
    { value: 'Moldova', label: 'Moldova' },
    { value: 'Monaco', label: 'Monaco' },
    { value: 'Mongolia', label: 'Mongolia' },
    { value: 'Montenegro', label: 'Montenegro' },
    { value: 'Morocco', label: 'Morocco' },
    { value: 'Mozambique', label: 'Mozambique' },
    { value: 'Myanmar', label: 'Myanmar' },
    { value: 'Namibia', label: 'Namibia' },
    { value: 'Nauru', label: 'Nauru' },
    { value: 'Nepal', label: 'Nepal' },
    { value: 'Netherlands', label: 'Netherlands' },
    { value: 'New Zealand', label: 'New Zealand' },
    { value: 'Nicaragua', label: 'Nicaragua' },
    { value: 'Niger', label: 'Niger' },
    { value: 'Nigeria', label: 'Nigeria' },
    { value: 'North Macedonia', label: 'North Macedonia' },
    { value: 'Norway', label: 'Norway' },
    { value: 'Oman', label: 'Oman' },
    { value: 'Pakistan', label: 'Pakistan' },
    { value: 'Palau', label: 'Palau' },
    { value: 'Panama', label: 'Panama' },
    { value: 'Papua New Guinea', label: 'Papua New Guinea' },
    { value: 'Paraguay', label: 'Paraguay' },
    { value: 'Peru', label: 'Peru' },
    { value: 'Philippines', label: 'Philippines' },
    { value: 'Poland', label: 'Poland' },
    { value: 'Portugal', label: 'Portugal' },
    { value: 'Qatar', label: 'Qatar' },
    { value: 'Romania', label: 'Romania' },
    { value: 'Russia', label: 'Russia' },
    { value: 'Rwanda', label: 'Rwanda' },
    { value: 'Saint Kitts and Nevis', label: 'Saint Kitts and Nevis' },
    { value: 'Saint Lucia', label: 'Saint Lucia' },
    { value: 'Saint Vincent and the Grenadines', label: 'Saint Vincent and the Grenadines' },
  ]


  useEffect(() => {



    // Use its rate, fallback to 1 if not found
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


    console.log("total Purchase", totalPurchase)
    if (Array.isArray(totalPurchase)) {
      // filter all matching items (returns an array)
      const filteredPurchase = totalPurchase.filter((p) => p.productId === value);
      console.log("filtered", filteredPurchase);

      // sum the quantities
      const calculatedQty = filteredPurchase.reduce((sum, item) => sum + item.quantity, 0);

      // get unit from first matched item
      const unit = filteredPurchase.length > 0 ? filteredPurchase[0].unit : null;

      setProductUnit(unit);
      setProductQty(calculatedQty);
    } else {
      setProductQty(null);
      setProductUnit(null);
    }


  }

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
              initialValues={{ userName: userName }}
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
                    placeholder="Select a Supplier"
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
                    showSearch
                    placeholder="Enter Country"
                    optionFilterProp="label"
                    options={country}
                    rules={[{ required: true, message: "Please Enter country name" }]}
                  />
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
                <Button type="text" htmlType="submit" className=" !bg-blue-500 !text-white hover:!bg-green-500 hover:!shadow-lg hover:!shadow-zinc-800 hover:!text-white !font-bold">
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
