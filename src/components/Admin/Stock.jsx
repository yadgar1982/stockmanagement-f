import React, { useState, useEffect } from 'react'
import { Button, Divider, FloatButton, Form, Input, Select, Table, Popconfirm, Card } from 'antd';
import { toast, ToastContainer } from "react-toastify";
import useSWR, { mutate } from "swr"
import { http, fetcher } from '../Modules/http';
import AdminLayout from '../Shared/AdminLayout'
import Cookies from 'universal-cookie';
import { countries } from "../Shared/countries/countries"
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
const { Option } = Select;
const cookies = new Cookies();


const Stock = () => {
  const [stockData, setstockData] = useState(null);
  const [formData, setFormData] = useState(null);

  const [edit, setEdit] = useState(false);
  const [id, setId] = useState(null);


  const [form] = Form.useForm()
  const token = cookies.get("authToken")
  const { data: stocks, error: stError } = useSWR("/api/stock/get/all", fetcher);
  useEffect(() => {
    if (stocks && stocks) {
      setstockData(stocks?.data || stocks)

    }
  }, [stocks])

    const onFinish = async (values) => {


    try {
      if (!token) {
        toast.error("Your session has been expired please login again ")
        setTimeout(() => {
          navigate("/login")
        }, 1000);
        return
      }
      const httpReq = http(token);
      const data = { ...values };

      const res = await httpReq.post("/api/stock/create", data);
      toast.success(res?.data?.msg)
      setFormData((prev) => ({ ...prev, ...res?.data?.stock }))
      mutate("/api/stock/get/all");
      form.resetFields();

    } catch (err) {
      if (err) {
        console.log(err)
        toast.error(err.response?.data?.message || "Unable to Save Data")
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
        return
      }
      const httpReq = http(token);
      const data = { ...values, values };
      await httpReq.put(`/api/stock/update/${id._id}`, data);
      toast.success("stock updated successfully");
      form.resetFields();
      setEdit(false)
      mutate("/api/stock/get/all");
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
      await httpReq.delete(`/api/stock/delete/${id}`);
      mutate("/api/stock/get/all");
      toast.success("stock Deleted Successfully")

    } catch (err) {
      console.log(err)
    }

  }

  const columns = [
    {
      title: 'S No',
      key: "sNo",
      render: (text, record, index) => index + 1,
      width: 70,

    },
    {
      title: 'Stock Name',
      dataIndex: 'stockName',
      key: "stockName"

    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: "country"
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: "address"
    },
    {
      title: 'Stock Manager',
      dataIndex: 'stockManager',
      key: "stockManager"
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
        <h2 className='md:text-2xl text-center w-full p-2 px-12 text-zinc-500 text-left font-semibold'>stock Registeration Form</h2>

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
                    label="Stock Name"
                    name="stockName"
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">

                  <Form.Item
                    label="country"
                    name="country"
                    rules={[{ required: true, message: "Please select a Country!" }]}
                  >
                    <Select
                      showSearch
                      placeholder="Select a country"
                      className="w-full"
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                      options={countries}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 bg-zinc-50 p-1">
                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Address"
                    name="address"
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Stock Manager"
                    name="stockManager"
                  >
                    <Input className="w-full" />
                  </Form.Item>

                </div>
              </div>




              {/* Submit Button */}
              <div className="py-4">
                <Form.Item>
                  <Button type="text" htmlType="submit" className="md:!w-60 !bg-orange-500 !text-white !font-semibold hover:!bg-green-500 hover:!text-white hover:!shadow-lg hover:!shadow-black ">
                    {`${edit ? "Update stock" : "Add stock"}`}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Card>

        </div>
        <h1 className='text-xl md:text-2xl ml-4 p-4 font-semibold !text-zinc-800'>Stock List</h1>
        <div className="text-xs w-[96%] mx-auto">
          <Table
            columns={columns}
            dataSource={stockData}
            bordered
            scroll={{ x: 'max-content' }}
            sticky
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            className="compact-table"

          />

        </div>
      </div>

    </AdminLayout>
  )
}

export default Stock;