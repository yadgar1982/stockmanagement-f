import React, { useState, useEffect } from 'react'
import { Button, message, Upload, Form, Input, Select, Table, Popconfirm, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import useSWR, { mutate } from "swr"
import { http, fetcher } from '../Modules/http';
import AdminLayout from '../Shared/AdminLayout'
import Cookies from 'universal-cookie';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const cookies = new Cookies();




const Branding = () => {
  const navigate = useNavigate();
  const [brandingData, setBrandingData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [id, setId] = useState(null);

  const [form] = Form.useForm()
  const token = cookies.get("authToken")
  const { data: brandings, error: cError } = useSWR("/api/branding/get/all", fetcher);
  useEffect(() => {
    if (brandings && brandings) {
      setBrandingData(brandings?.data || brandings)

    }
  }, [brandings])


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
      const data = { ...values, role: "branding" };
      const res = await httpReq.post("/api/branding/create", data);
      toast.success(res?.data?.msg)
      setFormData((prev) => ({ ...prev, ...res?.data?.branding }))
      mutate("/api/branding/get/all");
      form.resetFields();

    } catch (err) {
      if (err) {
        toast.error("Unable to Save Data", err?.response?.data?.msg)
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
      const data = { ...values, role: "branding" };
      await httpReq.put(`/api/branding/update/${id._id}`, data);
      toast.success("Branding updated successfully");
      form.resetFields();
      setEdit(false)
      mutate("/api/branding/get/all");
    } catch (err) {
      toast.error('Unable to Update branding', err.message)
    }
  }



  //Edit

  const handleEdit = (id) => {

    setId(id);
    form.setFieldsValue(id);
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
      await httpReq.delete(`/api/branding/delete/${id}`);
      mutate("/api/branding/get/all");
      toast.success("branding Deleted Successfully")

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
      title: 'Comapany Name ',
      dataIndex: 'name',
      key: "name"

    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: "mobile"
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: "address"

    },

    {
      title: 'Email',
      dataIndex: 'email',
      key: "email"

    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: "logo"

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
        <h2 className='md:text-2xl text-center w-full p-2 px-12 text-zinc-500 text-left font-semibold'>branding Registeration Form</h2>

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
                    label="Company Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input your fullname!' }]}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Address"
                    name="address"
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2  p-1">
                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Mobile"
                    name="mobile"
                    rules={[{ required: true, message: 'Please input your Mobile!' }]}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Email"
                    name="email"
                  >

                    <Input className="w-full" />
                  </Form.Item>
                </div>
              </div>
              
                           {/* Submit Button */}
              <div className="py-4">
                <Form.Item>
                  <Button type="text" htmlType="submit" className="md:!w-60 !bg-orange-500 !text-white !font-semibold hover:!bg-green-500 hover:!text-white hover:!shadow-lg hover:!shadow-black ">
                    {`${edit ? "Update branding" : "Add branding"}`}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Card>

        </div>
        <h1 className='text-xl md:text-2xl ml-4 p-4 font-semibold !text-zinc-800'>brandings</h1>
        <div className="text-xs w-[96%] mx-auto">
          <Table
            columns={columns}
            dataSource={brandingData}
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

export default Branding