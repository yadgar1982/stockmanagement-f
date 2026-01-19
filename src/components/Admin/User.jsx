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


const User = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [roles, setRoles] = useState(null);
  const [edit, setEdit] = useState(false);
  const [userId, setUserId] = useState(null);


  const onChange = value => {
    setRoles(value)
  };
  const [form] = Form.useForm()
  const token = cookies.get("authToken")
  const { data: users, error: uError } = useSWR("/api/user/get/all", fetcher);
  useEffect(() => {
    if (users && users) {
      const filtered= (users?.data || users).filter((u)=>u.role==="admin" || u.role==="user");
      setUserData(filtered)

    }
  }, [users])


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
      const data = { ...values, role: roles };
      values.role = roles
      const res = await httpReq.post("/api/user/create", data);
      toast.success(res?.data?.msg)
      setFormData((prev) => ({ ...prev, ...res?.data?.user }))
      mutate("/api/user/get/all");
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
      toast.error("Your session has been expired please login again");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    const httpReq = http(token);

    const data = { ...values, role: roles };


    if (!data.password || data.password.trim() === "") {
      delete data.password;
    }

    await httpReq.put(`/api/user/update/${userId._id}`, data);

    toast.success("User updated successfully");
    form.resetFields();
    setEdit(false);
    mutate("/api/user/get/all");

  } catch (err) {
    toast.error("Unable to Update Data");
  }
};

  //Edit
  const handleEdit = (record) => {
    setUserId(record);
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
      await httpReq.delete(`/api/user/delete/${id}`);
      mutate("/api/user/get/all");
      toast.success("User Deleted Successfully")

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
      title: 'Role',
      dataIndex: 'role',
      key: "role"

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
          <EditOutlined className="w-[30px] bg-green-500 flex justify-center rounded-full h-[30px]" />
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
          <a className="!text-white w-[20px] !w-[200px] !rounded-full "><DeleteOutlined className="w-[30px] bg-red-500 flex justify-center rounded-full h-[30px]" /></a>
        </Popconfirm>
      )


    }
  ];




  return (
    <AdminLayout>
      <div className='  justify-center w-full bg-zinc-100 h-screen'>
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className='md:text-2xl text-center w-full p-2 px-12 mb-4 text-zinc-500 text-left font-semibold'>User User Registeration Form</h2>

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
                    label="Full Name"
                    name="fullname"
                    rules={[{ required: true, message: 'Please input your fullname!' }]}
                    className="!mb-1"
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                  className="!mb-1"
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
                    className="!mb-1"
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
                      options={countries}
                    />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                  className="!mb-1"
                    label="Role"
                    name="role"
                  >
                    <Select
                      showSearch
                      placeholder="Select a person"
                      optionFilterProp="label"
                      onChange={onChange}
                      options={[
                        {
                          value: 'admin',
                          label: 'Admin',
                        },
                        {
                          value: 'user',
                          label: 'User',
                        },
                        {
                          value: 'customer',
                          label: 'Customer',
                        },
                        {
                          value: 'supplier',
                          label: 'Supplier',
                        },
                        {
                          value: 'dealer',
                          label: 'Dealer',
                        },
                        {
                          value: 'company',
                          label: 'Company',
                        },
                      ]}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2  p-1">

                {/* Password */}

                <div className="w-full md:w-1/2">
                  <Form.Item
                  className="!mb-1"
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!' }]}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                  className="!mb-1"
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                  >
                    <Input.Password className="w-full" />
                  </Form.Item>
                </div>

              </div>

              {/* Submit Button */}
              <div className="py-4 !mb-1">
                <Form.Item>
                 
                  <Button type="text" htmlType="submit" className="md:!w-60 !bg-orange-500 !text-white !font-semibold hover:!bg-green-500 hover:!text-white hover:!shadow-lg hover:!shadow-black ">
                    {`${edit ? "Update User" : "Add User"}`}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Card>

        </div>
        <h1 className=' text-xl md:text-xl p-4 font-semibold !text-zinc-800'>Users</h1>
        <Table
        size='small'
          columns={columns}
          dataSource={userData}
          bordered
          rowKey="_id"
          scroll={{ x: 'max-content' }}
          sticky
          pagination={{ pageSize: 5 }}

        />

      </div>

    </AdminLayout>
  )
}

export default User