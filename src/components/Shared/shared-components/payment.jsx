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
import { countries } from '../countries/countries';
const cookies = new Cookies();
const { Option } = Select;
import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomers } from '../../../redux/slices/customerSlice';
import { fetchProducts } from '../../../redux/slices/productSlice';
import { fetchStock } from '../../../redux/slices/stockSlice';
import { fetchCompany } from '../../../redux/slices/companySlice';
import { fetchDealer } from '../../../redux/slices/dealerSlice';
import { fetchCurrency } from '../../../redux/slices/currencySlice';
import { fetchSuppleirs } from '../../../redux/slices/supplierSlice';



const Payments = () => {
  const dispatch = useDispatch();

  const token = cookies.get("authToken")
  const [sales, setSales] = useState([]);
  const [unit, setUnit] = useState("");
  const [amt, setAmt] = useState(0);
  const [unitCost, setUnitCost] = useState(0)
  const [exchange, setExchange] = useState(0)
  const [crncy, setCrncy] = useState("")
  const [exchangedAmt, setexchangedAmt] = useState(1)
  const [productQty, setProductQty] = useState(null);
  const [productUnit, setProductUnit] = useState(null);
  const [totalsale, setTotalsale] = useState([])
  const [edit, setEdit] = useState(false)
  const [customerData, setCustomerData] = useState(null);
  const [sale, setSale] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");

  const [form] = Form.useForm();
  //get branding
  const branding = JSON.parse(localStorage.getItem("branding") || "null");

  // fetch data from redux:
  const { customers, loading, error } = useSelector((state) => state.customers);
  const allcustomers = customers?.data || [];
  const customer = allcustomers.map((item) => ({
    customerName: item.fullname,
    customerId: item._id,
    customerAcc: item.accountNo,
    cusotmerMobile: item.mobile,
    customerCountry: item.country,
    customerEmail: item.email,
  }))

  const customerOptions = customer.map((s) => ({
    label: s.customerName,
    value: s.customerId
  }))

  // fetch data from redux:
  const { suppliers, sloading, serror } = useSelector((state) => state.suppliers);
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


  //fetch sale all data
  const { data: saleData, error: pError } = useSWR("/api/sale/get", fetcher);

  useEffect(() => {
    if (saleData && saleData?.data) {
      setTotalsale(saleData?.data);
    }
  }, [saleData])


  //get all supppliers
  const handleSup = async (id) => {

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
      // 1️⃣ Fetch customer data first
      const customer = await handleSup(record.customerId);

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
            <th>Amt</th>
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

  // // calculation:
  // const totalQty = sale.reduce((acc, p) => {
  //   return acc += Number(p.quantity || 0);
  // }, 0);


  //Delete 
  const handleDelete = async (obj) => {
    try {
      const saleId = obj._id;

      const httpReq = http(token);

      // // Delete sale
      await httpReq.delete(`/api/sale/delete/${saleId}`);
      toast.success("sale record and customer transaction deleted successfully");
      mutate("/api/sale/get");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete sale record");
    }
  };

  const handleEdit = async (record) => {
    setCustomerData(record);
    console.log("record", record)
    form.setFieldsValue({
      ...record,
      customerId: record.customerId
    });

    setEdit(true); // set edit state with full rec
    const httpReq = http();
    const { data: sales } = await httpReq.get(`/api/sale/get/${record._id}`);
    console.log("sales data", sales)
    return setSales(sales);

  };

  const handleIspassed = async (id) => {
    try {
      const httpReq = http();
      await httpReq.put(`/api/sale/update/${id}`, { isPassed: true });
      toast.success("sale marked as passed!");
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
    },
    { title: <span className="text-sm md:!text-1xl font-semibold">Item</span>, dataIndex: 'productName', key: 'productName', width: 90 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Amt</span>, dataIndex: 'amount', key: 'quantity', width: 90 },
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
          title="Are you sure to Pass this sale?"
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
          title="Are you sure to delete this sale record?"
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

  const dataSource = saleData?.data.filter(item => item.isPassed === false).map((item) => ({
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
      // Find selected objects from arrays
      const selectedcustomer = customer.find(s => s.customerId === values.customerId);
      const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);

      // Prepare formatted values for payments
      const formattedValues = {
        ...values,
      
        customerName: selectedcustomer?.customerName,
        productName: selectedProduct?.productName,
        companyName: selectedCompany?.companyName,
        warehouseName: selectedStock?.stockName,
        dealerName: selectedDealer?.dealerName,
        isPassed: false,
      };
      //Create payments

      await httpReq.post("/api/sale/create", formattedValues);
      toast.success("sale record and transaction added successfully");
      mutate("/api/sale/get");
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
      const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);
      const httpReq = http(token);

      const formattedValues = {
        ...values,
        customerId: selectedcustomer._id,
        customerName: selectedcustomer.customerName,
        productId: selectedProduct?._id || values.productId,
        productName: selectedProduct?.productName || values.productName,

        companyId: selectedCompany?._id || values.companyId,
        companyName: selectedCompany?.companyName || values.companyName,

        warehouseId: selectedStock?._id || values.warehouseId,
        warehouseName: selectedStock?.stockName || values.warehouseName,

        dealerId: selectedDealer?._id || values.dealerId,
        dealerName: selectedDealer?.dealerName || values.dealerName,
      };

      // Update sale
      await httpReq.put(`/api/sale/update/${values._id}`, formattedValues);
      mutate("/api/sale/get");
      form.resetFields();
      toast.success("customer transaction updated successfully");
      setCustomerData("");
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
    setexchangedAmt(Number(amt) * exchange);
  }, [ amt, exchange]); // only recalc when these change

  useEffect(() => {
    form.setFieldsValue({ exchangedAmt: exchangedAmt });
  }, [exchangedAmt, form]);



  const handleProductChange = (value) => {
    setSelectedProduct(value);

    if (Array.isArray(totalsale)) {
      const filteredsale = totalsale.filter((p) => p.productId === value)
      const calculatedQty = filteredsale.reduce((sum, item) => sum + item.quantity, 0);

      const unit = filteredsale.length > 0 ? filteredsale[0].unit : null;
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
          {/* sale Form */}
          <div className='flex gap-4 items-center '>
            <h2 className='text-sm  md:text-2xl p-2 font-semibold text-zinc-600'>Make a Paymnet</h2>
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
                  label="Company"
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
                  rules={[{ required: true, message: "Please enter item amount" }]}
                >
                  <Input placeholder="Enter Amount"
                    onChange={(e) => setAmt(Number(e.target.value))} />
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
                 <Input type='Date'value={paymentDate}/>
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
          <div className='text-zinc-600 md:text-lg text-sm p-4 font-bold'>sale Records:</div>
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

export default Payments;
