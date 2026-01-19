import React, { useState, useEffect } from 'react'
import { Button, Divider, FloatButton, Form, Input, Select, Table, Popconfirm, Card } from 'antd';
import { toast, ToastContainer } from "react-toastify";
import useSWR, { mutate } from "swr"
import { http, fetcher } from '../Modules/http';
import AdminLayout from '../Shared/AdminLayout'
import Cookies from 'universal-cookie';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { countries } from "../Shared/countries/countries"
const { Option } = Select;
const cookies = new Cookies();
import { useNavigate } from 'react-router-dom';


const Supplier = () => {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [formData, setFormData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [id, setId] = useState(null);

  const [form] = Form.useForm()
  const token = cookies.get("authToken")
  console.log(token)
  const { data: suppliers, error: uError } = useSWR("/api/supplier/get/all", fetcher);
  useEffect(() => {
    if (suppliers && suppliers) {
      setId(suppliers?.data || suppliers)
      setSupplier(suppliers?.data)
    }
  }, [suppliers])



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
     const data = { ...values, role: "supplier",password:values.email };

      await httpReq.post("/api/user/create", data);
      const res = await httpReq.post("/api/supplier/create", data);
      toast.success(res?.data?.msg)
      setFormData((prev) => ({ ...prev, ...res?.data?.supplier }))
      mutate("/api/supplier/get/all");
      form.resetFields();

    } catch (err) {
      if (err) {
        toast.error("Unable to Save Data", err.message)
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
      const data = { ...values };
      await httpReq.put(`/api/user/updatebyemail/${id.email}`, data);
      await httpReq.put(`/api/supplier/updatesupplier/${id._id}`, data);
      toast.success("Supplier updated successfully");
      form.resetFields();

      setEdit(false)
      mutate("/api/supplier/get/all");
    } catch (err) {
      toast.error('Unable to Update Data', err.message)
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
      title: 'Full Name',
      dataIndex: 'fullname',
      key: "name"

    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: "mobile"
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: "country"

    },
    {
      title: 'Account No',
      dataIndex: 'accountNo',
      key: "account"

    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: "email"

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
          onConfirm={async () => handleDelete(obj)}
        >
          <a className="!text-white w-[20px] !w-[200px] !rounded-full "><DeleteOutlined className="w-full  hover:!bg-blue-500  bg-red-500 flex justify-center md:text-lg h-6" /></a>
        </Popconfirm>
      )
    }
  ];

  //Edit
  let handleEdit = (record) => {
    setId(record);
    form.setFieldsValue(record);
    setEdit(true)
  }
  //delete
  const handleDelete = async (obj) => {

    try {
      if (!token) {
        toast.error("Your session has been expired please login again ")
        setTimeout(() => {
          navigate("/login")
        }, 1000);
        return
      }
      const httpReq = http(token);
      await httpReq.delete(`/api/supplier/delete/${obj._id}`);
      await httpReq.delete(`/api/user/deleteUserbyemail/${obj.email}`);
      mutate("/api/supplier/get/all");
      toast.success("Supplier Deleted Successfully")

    } catch (err) {
      console.log(err)
    }

  }



  return (
    <AdminLayout>
      <div className='  justify-center w-full bg-zinc-100 h-screen'>
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className='md:text-2xl text-center w-full p-2 px-12 text-zinc-500 text-left font-semibold mb-4'>Supplier Registeration Form</h2>

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
                  className='!mb-1'
                    label="Full Name"
                    name="fullname"
                    rules={[{ required: true, message: 'Please input your fullname!' }]}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                  className='!mb-1'
                    label="Mobile"
                    name="mobile"
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2  p-1">


                <div className="w-full md:w-1/2">
                  <Form.Item
                  className='!mb-1'
                    label="Country"
                    name="country"
                    rules={[{ required: true, message: 'Please input your country!' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Select a country"
                      className="w-full"
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                      options={countries} // directly pass your array
                    />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                  className='!mb-1'
                    label="Acc No"
                    name="accountNo"
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2  p-1">

           

                <div className="w-full md:w-1/2">
                  <Form.Item
                  className='!mb-1'
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!' }]}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                  className='!mb-1'
                    label="Address"
                    name="address"

                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>

              </div>

              {/* Submit Button */}
              <div className="py-4 !mb-1">
                <Form.Item>
                  <Button type="text" htmlType="submit" className="md:!w-60 !bg-orange-500 !text-white !font-semibold hover:!bg-green-500 hover:!text-white hover:!shadow-lg hover:!shadow-black ">
                    {`${edit ? "Update Supplier" : "Add Supplier"}`}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Card>

        </div>
        <h1 className='text-xl md:text-2xl ml-4 p-4 font-semibold !text-zinc-800'>Suppliers List</h1>
        <div className="text-xs w-[96%] mx-auto">
          <Table
          size='small'
            columns={columns}
            dataSource={supplier}
            bordered
            scroll={{ x: 'max-content' }}
            sticky
            pagination={{ pageSize: 5 }}
            className="compact-table"
            rowKey="_id"
          />

        </div>
      </div>

    </AdminLayout>
  )
}

export default Supplier