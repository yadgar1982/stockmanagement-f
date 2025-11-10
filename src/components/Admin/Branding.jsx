import React, { useState, useEffect } from "react";
const EPI_URL=import.meta.env.VITE_API_URL
import {
  Button,
  message,
  Upload,
  Form,
  Input,
  Table,
  Image,
  Popconfirm,
  Card,
} from "antd";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import useSWR, { mutate } from "swr";
import { http, fetcher } from "../Modules/http";
import AdminLayout from "../Shared/AdminLayout";
import Cookies from "universal-cookie";
import { DeleteOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";

const cookies = new Cookies();

const Branding = () => {
  const navigate = useNavigate();
  const [brandingData, setBrandingData] = useState(null);
  const [file, setFile] = useState(null); // ✅ new state for logo
  const [edit, setEdit] = useState(false);
  const [id, setId] = useState(null);

  const [form] = Form.useForm();
  const token = cookies.get("authToken");

  // Fetch all branding records
  const { data: brandings } = useSWR("/api/branding/get/all", fetcher);
  useEffect(() => {
    if (brandings) {
      setBrandingData(brandings?.data || brandings);
    }
  }, [brandings]);

  // Create New Branding
  const onFinish = async (values) => {
    try {
      if (!token) {
        toast.error("Your session has expired. Please login again.");
        setTimeout(() => navigate("/login"), 1000);
        return;
      }

      const httpReq = http(token);

      // Build FormData for file + text fields
      const formData = new FormData();
      for (let key in values) formData.append(key, values[key]);
      if (file) formData.append("logo", file);

      const res = await httpReq.post("/api/branding/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res?.data?.msg || "Brand created successfully!");
      mutate("/api/branding/get/all");
      form.resetFields();
      setFile(null);
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Unable to save data");
    }
  };

  //  Update Branding
  const onUpdate = async (values) => {
    try {
      if (!token) {
        toast.error("Your session has expired. Please login again.");
        setTimeout(() => navigate("/login"), 1000);
        return;
      }

      const httpReq = http(token);
      const formData = new FormData();
      for (let key in values) formData.append(key, values[key]);
      if (file) formData.append("logo", file);

      const res = await httpReq.put(`/api/branding/update/${id._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Branding updated successfully");
      mutate("/api/branding/get/all");
      form.resetFields();
      setFile(null);
      setEdit(false);
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Unable to update branding");
    }
  };

  // Edit mode
  const handleEdit = (record) => {
    setId(record);
    form.setFieldsValue(record);
    setEdit(true);
  };

  //  Delete
  const handleDelete = async (id) => {
    try {
      if (!token) {
        toast.error("Your session has expired. Please login again.");
        setTimeout(() => navigate("/login"), 1000);
        return;
      }

      const httpReq = http(token);
      await httpReq.delete(`/api/branding/delete/${id}`);
      mutate("/api/branding/get/all");
      toast.success("Brand deleted successfully");
    } catch (err) {
      toast.error("Failed to delete brand");
    }
  };

  //  Table Columns
  const columns = [
    {
      title: "S.No",
      key: "sNo",
      render: (text, record, index) => index + 1,
      width: 70,
    },
    {
      title: "Company Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
  title: "Logo",
  dataIndex: "logo",
  key: "logo",
  render: (logo) =>
    logo ? (
      <Image
        width={60}
        height={60}
        src={`${EPI_URL}${logo}`} 
        alt="brand-logo"
        style={{ objectFit: "contain", borderRadius: 4 }}
      />
    ) : (
      "No logo"
    ),
},
    {
      title: "Edit",
      key: "edit",
      width: 90,
      render: (_, record) => (
        <a onClick={() => handleEdit(record)}>
          <EditOutlined className="text-green-500 hover:text-blue-500" />
        </a>
      ),
    },
    {
      title: "Delete",
      key: "delete",
      width: 90,
      render: (_, obj) => (
        <Popconfirm
          title="Are you sure to delete this brand?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => handleDelete(obj._id)}
        >
          <DeleteOutlined className="text-red-500 hover:text-blue-500" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="justify-center w-full bg-zinc-100 min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className="text-2xl text-center font-semibold p-2 text-zinc-600">
          Branding Registration
        </h2>

        <div className="px-9">
          <Card className="!bg-zinc-50 !shadow !border !rounded-none !border-zinc-300 !shadow-sm">
            <Form
              form={form}
              layout="vertical"
              onFinish={edit ? onUpdate : onFinish}
              autoComplete="off"
            >
              <div className="flex flex-col md:flex-row gap-2 p-1">
                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Company Name"
                    name="name"
                    rules={[{ required: true, message: "Please enter company name!" }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item label="Address" name="address">
                    <Input />
                  </Form.Item>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2 p-1">
                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Mobile"
                    name="mobile"
                    rules={[{ required: true, message: "Please enter mobile!" }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item label="Email" name="email">
                    <Input />
                  </Form.Item>
                </div>
              </div>

              {/* ✅ File Upload Field */}
              <div className="flex flex-col md:flex-row gap-2 p-1">
                <div className="w-full md:w-1/2">
                  <Form.Item label="Brand Logo">
                    <Upload
                      beforeUpload={(file) => {
                        setFile(file); // store file in state
                        return false; // prevent auto-upload
                      }}
                      showUploadList={file ? [{ name: file.name }] : []}
                    >
                      <Button icon={<UploadOutlined />}>Select Logo</Button>
                    </Upload>
                    {edit && id.logo && !file && (
                      <img
                        src={`${EPI_URL}${logo}${id.logo}`}
                        alt="Current Logo"
                        style={{ width: 50, height: 50, marginTop: 10 }}
                      />
                    )}
                  </Form.Item>
                </div>
              </div>

              <div className="py-4">
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="!w-60 !bg-orange-500 hover:!bg-green-500"
                  >
                    {edit ? "Update Branding" : "Add Branding"}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Card>
        </div>

        <h1 className="text-2xl ml-4 p-4 font-semibold text-zinc-800">
          Branding List
        </h1>
        <div className="text-xs w-[96%] mx-auto">
          <Table
            columns={columns}
            dataSource={brandingData}
            bordered
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: "max-content" }}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Branding;
