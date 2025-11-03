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
import { fetchPurchase } from '../../../redux/slices/purchaseSlice';
// import { fetchStock } from '../../../redux/slices/stockSlice';
import { fetchCompany } from '../../../redux/slices/companySlice';
// import { fetchDealer } from '../../../redux/slices/dealerSlice';
import { fetchCurrency } from '../../../redux/slices/currencySlice';



const SupplierPayment = () => {
  const dispatch = useDispatch();

  const token = cookies.get("authToken")
  const [unit, setUnit] = useState("");
  const [amount, setAmount] = useState(0);
  const [exchange, setExchange] = useState(0)
  const [crncy, setCrncy] = useState("")
  const [exchangedAmt, setexchangedAmt] = useState(1)
  const [productamount, setProductamount] = useState(null);
  const [productUnit, setProductUnit] = useState(null);
  const [totalpayment, setTotalpayment] = useState([])
  const [edit, setEdit] = useState(false)
  const [supplierData, setSupplierData] = useState(null);
 
 //for supplier financial calculation states
  const [payment, setpayment] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPurchasedAmount,setTotalPurchasedAmt]=useState(0);
  const [supplierId, setSupplierId] = useState("");

  
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
 
  setTotalPaid(totalPaid|| 0)
    const supplierPurchase=purchase.filter(i=>i.supplierId==id);
  const totalPurchaseAmount= supplierPurchase.reduce((sum,item)=> sum +(item.totalCost || 0),0)
  setTotalPurchasedAmt(totalPurchaseAmount)  
  setSupplierData(data);
};


  // calculation of payments
 const amt=amount||0;
 const totalPaidtoSupplier=totalPaid||0
 const totalSupplierPurchase=totalPurchasedAmount ||0
 const total=Number(amt)+Number(totalPaidtoSupplier)
 console.log("total",total)



  
  
  //print function

const handlePrint = async (record) => {
  try {
    // 1️⃣ Fetch supplier data
    const supplier = await handleSup(record.supplierId);

    // 2️⃣ Open a new tab/window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups for this site to view the receipt.");
      return;
    }

    // 3️⃣ Build HTML content
    const branding = [{ name: "Your Company Name", address: "Address", mobile: "+1 555 555 5555", email: "info@example.com" }];
    const doc = printWindow.document;

    doc.open();
    doc.write(`
      <html>
      <head>
        <title>Supplier Payment Receipt - ${record._id}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            margin: 40px;
            color: #222;
            background-color: #fff;
          }
          header {
            display: flex;
            justify-content: flex-start; /* Only company in header */
            border-bottom: 2px solid #444;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .company {
            width: 45%;
            font-size: 14px;
            line-height: 1.5;
          }
          .company strong {
            color: #111;
            font-size: 15px;
          }
          .supplier {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 20px;
          }
          .supplier strong {
            color: #111;
          }
          h1 {
            text-align: center;
            margin: 10px 0 25px;
            color: #004085;
            font-size: 22px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .receipt-info {
            text-align: center;
            font-size: 14px;
            color: #666;
            margin-bottom: 25px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #999;
            padding: 8px 10px;
            text-align: center;
            font-size: 14px;
          }
          th {
            background-color: #f5f7fa;
            color: #333;
          }
          tfoot td {
            font-weight: bold;
            background-color: #f2f2f2;
          }
          .summary {
            margin-top: 25px;
            float: right;
            width: 300px;
            border: 1px solid #999;
            border-radius: 5px;
            padding: 12px;
            background-color: #f9f9f9;
          }
          .summary div {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
          }
          .summary strong {
            color: #111;
          }
          .footer {
            text-align: center;
            font-size: 13px;
            color: #777;
            margin-top: 50px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="company">
            <img src="./logo.jpg" alt="Company Logo" width="55" />
            <br><strong>${branding[0]?.name || "Company Name"}</strong><br>
            Address: ${branding[0]?.address || "-"}<br>
            Phone: ${branding[0]?.mobile || "-"}<br>
            Email: ${branding[0]?.email || "-"}<br>
          </div>
        </header>

        <!-- Supplier details moved below header -->
        <div class="supplier">
          <strong>Receiver: </strong><br>
          Name: ${supplier?.fullname || "-"}<br>
          Address: ${supplier?.country || "-"}<br>
          Phone: ${supplier?.mobile || "-"}<br>
          Email: ${supplier?.email || "-"}<br>
        </div>

        <h1>Supplier Payment Receipt</h1>

        <div class="receipt-info">
          <div><strong>Receipt ID:</strong> ${record._id}</div>
          <div><strong>Date:</strong> ${new Date(record.createdAt).toLocaleDateString()}</div>
          <div><strong>Processed By:</strong> ${record.userName || "-"}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Payment Type</th>
              <th>Transaction Type</th>
              <th>Currency</th>
              <th>Amount</th>
              <th>Exchanged Amount (${record.currency})</th>
              <th>Belongs To</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>${record.paymentType || "-"}</td>
              <td>${record.transactionType || "-"}</td>
              <td>${record.currency || "-"}</td>
              <td>${record.amount || "-"}</td>
              <td>${record.exchangedAmt || "-"}</td>
              <td>${record.companyName || "-"}</td>
              <td>${record.description || "-"}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary">
          <div><span>Subtotal:</span> <strong>${record.amount}</strong></div>
          <div><span>Exchange (${record.currency}):</span> <strong>${record.exchangedAmt}</strong></div>
          <hr>
          <div><span><strong>Total Paid (USD):</strong></span> <strong>${record.amount}</strong></div>
        </div>

        <div style="clear:both"></div>

        <div class="footer">
          Thank you for your payment!<br>
          <br><br><br><br><br>
          If you have any questions, please contact our accounting department.
        </div>

        <script>
          window.onload = () => window.print();
        </script>
      </body>
      </html>
    `);

    doc.close();
  } catch (error) {
    console.error("Error printing:", error);
  }
};


  // get userName
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userName = userInfo?.fullname || "";


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
    { title: <span className="text-sm md:!text-1xl font-semibold">Supplier</span>, dataIndex: 'supplierName', key: 'productName', width: 90 },
    {
      title: <span className="text-sm md:!text-1xl font-semibold">Pur-Date</span>, dataIndex: 'createdAt', key: 'createdAt', width: 110,
      render: (date) => date ? dayjs(date).format("MM/DD/YYYY") : "-", 
    },
    { title: <span className="text-sm md:!text-1xl font-semibold">Amount</span>, dataIndex: 'amount', key: 'amount', width: 80 },
     { title: <span className="text-sm md:!text-1xl font-semibold">Belong To</span>, dataIndex: 'companyName', key: 'company', width: 120 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Currency</span>, dataIndex: 'currency', key: 'currency', width: 100 },
    { title: <span className="text-sm md:!text-1xl font-semibold">Exched Amt</span>, dataIndex: 'exchangedAmt', key: 'exchangedAmt', width: 100 },  
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
          title="Are you sure to Pass this SupplierPayment?"
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
          title="Are you sure to delete this payment record?"
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

  const dataSource = paymentData?.data.filter(item => item.isPassed === false).map((item) => ({
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
      const selectedSupplier = supplier.find(s => s.supplierId === values.supplierId);
      // const selectedProduct = product.find(p => p.productId === values.productId);
      const selectedCompany = company.find(c => c.companyId === values.companyId);
      // const selectedStock = stock.find(s => s.stockId === values.warehouseId);
      // const selectedDealer = dealer.find(d => d.dealerId === values.dealerId);

      // 2 Prepare formatted values for payment
      const formattedValues = {
        ...values,
        paymentDate: values.paymentDate ? values.paymentDate.format("DD-MM-YYYY") : null,
        supplierName: selectedSupplier?.supplierName,
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
        supplierName: selectedSupplier.supplierName ||values.supplierName,
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

    console.log("supplierData",supplierData)
  return (
    <UserLayout>
      <div>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="p-4 bg-zinc-100">
          {/* SupplierPayment Form */}
          <div className='flex gap-4 items-center '>
            <h2 className='text-sm  md:text-2xl p-2 font-semibold text-zinc-600'>Make Payment to Supplier</h2>
            <div> {totalPaidtoSupplier && (
              <div className=' mt-3 md:text-1xl text-white text-sm mb-2 bg-blue-800 p-2'>Due Amount:
                <span className='font-bold text-yellow-400'> {totalSupplierPurchase } USD </span> <span className='text-white font-semibold'> and total Paid Amount to { supplierData.fullname } is: <span className='font-bold text-yellow-400's>{totalPaidtoSupplier} USD.</span> Do you want to pay more? </span>
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
                  label="Amount"
                  name="amount"
                  rules={[{ required: true, message: "Please enter amount" }]}
                 >
                  <Input placeholder="Enter item amount"
                    onChange={(e) => setAmount(Number(e.target.value))} />
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
                  {`${edit ? "Update SupplierPayment" : "Add SupplierPayment"}`}
                </Button>
              </Form.Item>
            </Form>
          </Card>


        </div>
        <div>
          <div className='text-zinc-600 md:text-lg text-sm p-4 font-bold'>SupplierPayment Records:</div>
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

export default SupplierPayment;
