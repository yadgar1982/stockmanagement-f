import React, { useState, useEffect } from 'react'
import { Button, Divider, FloatButton, Form, Input, Select, Table, Popconfirm, Card } from 'antd';
import { toast, ToastContainer } from "react-toastify";
import useSWR, { mutate } from "swr"
import { http, fetcher } from '../Modules/http';
import AdminLayout from '../Shared/AdminLayout'
import Cookies from 'universal-cookie';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
const { Option } = Select;
const cookies = new Cookies();


const Currency = () => {
  const [currencyData, setCurrencyData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [roles, setRoles] = useState(null);
  const [edit, setEdit] = useState(false);
  const [id, setId] = useState(null);


  const [form] = Form.useForm()
  const token = cookies.get("authToken")
  const { data: currencys, error: curError } = useSWR("/api/currency/get/all", fetcher);
  useEffect(() => {
    if (currencys && currencys) {
      setCurrencyData(currencys?.data || currencys)

    }
  }, [currencys])


  const onFinish = async (values) => {

  
    try {
      if (!token) {
        toast.error("Your session has been expired please login again ")
        setTimeout(() => {
          navigate("/login")
        }, 1000);
        return null
      }
      const httpReq = http(token);
      const data = { ...values};

      const res = await httpReq.post("/api/currency/create", data);
      toast.success(res?.data?.msg)
      setFormData((prev) => ({ ...prev, ...res?.data?.Currency }))
      mutate("/api/currency/get/all");
      form.resetFields();

    } catch (err) {
      if (err) {
        console.log(err)
        toast.error(err.response.data.message||"Unable to Save Data")
      }
    }
  }

  const onUpdate = async (values) => {

    try {
      if (!token) {
        toast.error("Your session has been expired please login again ")
        setTimeout(() => {
          navigate("/login")
        }, 1000);
        return null
      }
      const httpReq = http(token);
      const data = { ...values, role: roles };
      await httpReq.put(`/api/currency/update/${id._id}`, data);
      toast.success("Currency updated successfully");
      form.resetFields();
      setEdit(false)
      mutate("/api/currency/get/all");
    } catch (err) {
      toast.error('Unable to Update Data', err.message)
    }
  }

  //Edit
  const handleEdit = (record) => {
    setId(record);
    form.setFieldsValue(record);
    setEdit(true)
  }
  //delete
  const handleDelete = async (id) => {

    try {
      if (!token) {
        toast.error("Your session has been expired please login again ")
        setTimeout(() => {
          navigate("/login")
        }, 1000);
        return
      }
      const httpReq = http(token);
      await httpReq.delete(`/api/currency/delete/${id}`);
      mutate("/api/currency/get/all");
      toast.success("Currency Deleted Successfully")

    } catch (err) {
      console.log(err)
    }

  }

  const countries = [
    { name: "Afghanistan", currency: "AFN", flag: "🇦🇫" },
    { name: "Tajikistan", currency: "TJS", flag: "🇹🇯" },
    { name: "Uzbekistan", currency: "UZS", flag: "🇺🇿" },
    { name: "Kazakhstan", currency: "KZT", flag: "🇰🇿" },
    { name: "Kyrgyzstan", currency: "KGS", flag: "🇰🇬" },
    { name: "India", currency: "INR", flag: "🇮🇳" },
    { name: "Pakistan", currency: "PKR", flag: "🇵🇰" },
    { name: "United States", currency: "USD", flag: "🇺🇸" },
    { name: "Eurozone", currency: "EUR", flag: "🇪🇺" },
    { name: "China", currency: "CNY", flag: "🇨🇳" },
    { name: "Iran", currency: "IRR", flag: "🇮🇷" },
    { name: "All in USD", currency: "All", flag: "US" },
  ];
  const columns = [
    {
      title: 'S No',
      key: "sNo",
      render: (text, record, index) => index + 1,
      width: 70,

    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      key: "currency"

    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: "rate"
    },

    {
      title: "Edit",
      key: "edit",
      width: 90,
      // fixed: "right",
      render: (_, record) => ( // ✅ use record (row data)
        <a
          onClick={() => handleEdit(record)} // pass full row object
          className="!text-white w-full !w-[200px] !rounded-full"
        >
          <EditOutlined className="w-full  hover:!bg-blue-500  bg-green-500 flex justify-center md:text-lg h-6" />
        </a>
      ),
    },
    {
      title: "Delete",
      key: 'delete',
      width: 90,
      // fixed: "right",

      render: (_, obj) => (
        <Popconfirm
          title="Are you sure to delete this purchase record?"
          description="This action cannot be undone."
          okText="yes"
          cancelText="No"
          onConfirm={async () => handleDelete(obj._id)}
        >
          <a className="!text-white w-[20px] !w-[200px] !rounded-full "><DeleteOutlined className="w-full  hover:!bg-blue-500  bg-red-500 flex justify-center md:text-lg h-6" /></a>
        </Popconfirm>
      )


    }
  ];




  return (
    <AdminLayout>
      <div className='  justify-center w-full bg-zinc-100 h-screen'>
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className='md:text-2xl text-center w-full p-2 px-12 text-zinc-500 text-left font-semibold'>Currency Registeration Form</h2>

        <div className='w-full bg-zinc-100 px-9' >
          <Card className='!bg-zinc-50 !shadow !border !rounded-none !border-zinc-300 !shadow-sm'>
            <Form
              form={form}
              layout="vertical"
              name="basic"
              onFinish={edit ? onUpdate : onFinish}
              autoComplete="off"
              className="px-4 space-y-2"
            >
              {/* Group container */}
              <div className="flex flex-col md:flex-row gap-2 bg-zinc-50 p-1">

                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Currency Code"
                    name="currency"
                    rules={[{ required: true, message: "Please select a currency!" }]}
                  >
                    <Select
                      placeholder="Select currency"
                      className="w-full"
                      showSearch
                      optionLabelProp="label"
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase()) // search by country name
                      }
                    >
                      {countries.map((c) => (
                        <Option
                          key={c.currency}
                          value={c.currency} // selected value = currency code
                          label={c.name} // used for searching
                        >
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                            <span>({c.currency})</span>
                          </span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Rate"
                    name="rate"
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
              </div>




              {/* Submit Button */}
              <div className="py-4">
                <Form.Item>
                  <Button type="text" htmlType="submit" className="md:!w-60 !bg-orange-500 !text-white !font-semibold hover:!bg-green-500 hover:!text-white hover:!shadow-lg hover:!shadow-black ">
                    {`${edit ? "Update Currency" : "Add Currency"}`}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Card>

        </div>
         <h1 className='text-xl md:text-2xl ml-4 p-4 font-semibold !text-zinc-800'>Currency</h1>
               <div className="text-xs w-[96%] mx-auto">
                 <Table
                  columns={columns}
                  dataSource={currencyData}
                  bordered
                   rowKey="_id"
                  scroll={{ x: 'max-content' }}
                  sticky
                  pagination={{ pageSize: 5 }}
                  className="compact-table"
        
                />
        
               </div>

       
      </div>

    </AdminLayout>
  )
}

export default Currency