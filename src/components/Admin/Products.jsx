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
const categories = [
  // Grains & Cereals
  { name: "Rice" },
  { name: "Wheat" },
  { name: "Dry Fruites" },
  { name: "Barley" },
  { name: "Corn" },


  // Fruits
  { name: "Apples" },
  { name: "Bananas" },
  { name: "Oranges" },
  { name: "Mangoes" },
  { name: "Dates" },
  { name: "Berries" },
  { name: "Grapes" },
  { name: "Pineapples" },

  // Vegetables
  { name: "Potatoes" },
  { name: "Tomatoes" },
  { name: "Onions" },
  { name: "Carrots" },
  { name: "Cabbage" },
  { name: "Spinach" },
  { name: "Broccoli" },
  { name: "Garlic" },

  // Dairy
  { name: "Milk" },
  { name: "Cheese" },
  { name: "Butter" },
  { name: "Yogurt" },

  // Meat & Poultry
  { name: "Beef" },
  { name: "Chicken" },
  { name: "Mutton" },
  { name: "Fish" },
  { name: "Eggs" },

  // Legumes & Nuts
  { name: "Lentils" },
  { name: "Beans" },
  { name: "Chickpeas" },
  { name: "Peanuts" },
  { name: "Almonds" },
  { name: "Cashews" },

  // Beverages
  { name: "Tea" },
  { name: "Coffee" },
  { name: "Juices" },
  { name: "Water" },

  // Spices & Condiments
  { name: "Salt" },
  { name: "Sugar" },
  { name: "Black Pepper" },
  { name: "Cumin" },
  { name: "Turmeric" },
  { name: "Chili Powder" },
  { name: "Cinnamon" },

  // Bakery & Snacks
  { name: "Bread" },
  { name: "Biscuits" },
  { name: "Cakes" },
  { name: "Pasta" },
  { name: "Noodles" },

  // Oils & Fats
  { name: "Olive Oil" },
  { name: "Vegetable Oil" },
  { name: "Ghee" },
  { name: "Butter" },

  // Frozen & Packaged Foods
  { name: "Frozen Vegetables" },
  { name: "Ice Cream" },
  { name: "Sauces" },
  { name: "Pickles" },
];

const Products = () => {
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [id, setId] = useState(null);

  const [form] = Form.useForm()
  const token = cookies.get("authToken")
  const { data: products, error: uError } = useSWR("/api/product/get/all", fetcher);
 
  useEffect(() => {
    if (products && products) {
      setId(products?.data || products)
      setProduct(products?.data)
    }
  }, [products])

 

console.log("product",product)
console.log("id",id)
  const onFinish = async (values) => {
    try {
      if(!token){
         toast.error("Your session has been expired please login again ")
        setTimeout(() => {
          navigate("/login")
        }, 1000);
       return
      }
      const httpReq = http(token);
      const data = { ...values, role: "product" };

      const res = await httpReq.post("/api/product/create", data);
      toast.success(res?.data?.msg)
      setFormData((prev) => ({ ...prev, ...res?.data?.product }))
      mutate("/api/product/get/all");
      form.resetFields();

    } catch (err) {
      if (err) {
        toast.error("Unable to Save Data", err.message)
      }
    }
  }

  const onUpdate = async (values) => {

    try {
      if(!token){
         toast.error("Your session has been expired please login again ")
        setTimeout(() => {
          navigate("/login")
        }, 1000);
       return
      }
      const httpReq = http(token);
      const data = { ...values };
      
      await httpReq.put(`/api/product/update/${id._id}`, data);
      toast.success("Product updated successfully");
      form.resetFields();

      setEdit(false)
      mutate("/api/product/get/all");
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
      title: 'Product Name',
      dataIndex: 'productName',
      key: "name"

    },
   
    {
      title: 'Description',
      dataIndex: 'description',
      key: "description"

    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: "category"

    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: "sku"

    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: "price"
    },
    {
      title: 'Sale Price',
      dataIndex: 'salePrice',
      key: "salePrice"
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
          title="Are you sure to delete this product?"
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

  //Edit
  let handleEdit = (record) => {
    setId(record);
    form.setFieldsValue(record);
      setEdit(true)
  }
  //delete
  const handleDelete = async (id) => {

    try {
      if(!token){
         toast.error("Your session has been expired please login again ")
        setTimeout(() => {
          navigate("/login")
        }, 1000);
       return
      }
      const httpReq = http(token);
      await httpReq.delete(`/api/product/delete/${id}`);
      mutate("/api/product/get/all");
      toast.success("Product Deleted Successfully")

    } catch (err) {
      console.log(err)
    }

  }



  return (
    <AdminLayout>
      <div className='  justify-center w-full bg-zinc-100 h-screen'>
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className='md:text-2xl text-center w-full p-2 px-12 text-zinc-500 text-left font-semibold'>Product Registeration Form</h2>

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
                    label="Product Name"
                    name="productName"
                    rules={[{ required: true, message: 'Please input your Product Name!' }]}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Description"
                    name="description"
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2  p-1">


                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Category"
                    name="category"
                    // rules={[{ required: true, message: 'Please input your country!' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Select a category"
                      className="w-full"
                    >
                      {categories.map((c)=>(
                        <Option key={c.code} value={c.name}></Option>
                      ))}

                    </Select>
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="SKU"
                    name="sku"
                  >
                   <Input className="w-full" />
                  </Form.Item>
                </div>
              
              </div>
               <div className="flex flex-col md:flex-row gap-2  p-1">

              
               <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Price"
                    name="price"
                    rules={[{ required: true, message: 'Please input your Price!' }]}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
                    <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Sale Price"
                    name="salePrice"
                    rules={[{ required: true, message: 'Please input your Price!' }]}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
              </div>

              <div>
                <div className="w-full md:w-1/2">
                  <Form.Item
                    label="Product Code"
                    name="productCode"
                    rules={[{ required: true, message: 'Please input your Price!' }]}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </div>
              </div>



              {/* Submit Button */}
              <div className="py-4">
                <Form.Item>
                  <Button type="text" htmlType="submit" className="md:!w-60 !bg-orange-500 !text-white !font-semibold hover:!bg-green-500 hover:!text-white hover:!shadow-lg hover:!shadow-black ">
                    {`${edit ? "Update Product" : "Add Product"}`}
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Card>

        </div>
        <h1 className=' text-xl md:text-2xl p-4 font-semibold !text-zinc-800'>Products List</h1>
       <div className='text-xs w-[96%] mx-auto'>
         <Table
          columns={columns}
          dataSource={product}
          rowKey="_id"  
          bordered
          size='small'
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

export default Products