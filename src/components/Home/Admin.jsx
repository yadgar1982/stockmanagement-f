import React from "react";
import { Row, Col, Card, Statistic, Table, Tag } from "antd";
import {
  UserOutlined,
  TruckOutlined,
  AppstoreOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Bar } from "@ant-design/plots";
import AdminLayout from "../Shared/AdminLayout";

const Admin = () => {
  // Summary data
  const customers = 1204;
  const suppliers = 54;
  const totalProducts = 326;
  const warehouses = 5;

  // Product stock data
  const stockData = [
  { category: "Shirts", product: "Shirts", stock: 120 },
  { category: "Jeans", product: "Jeans", stock: 80 },
  { category: "Jackets", product: "Jackets", stock: 45 },
  { category: "Shoes", product: "Shoes", stock: 150 },
  { category: "Hoodies", product: "Hoodies", stock: 95 },
  { category: "Bags", product: "Bags", stock: 70 },
];
  // Multi-warehouse stock data
  const multiStock = [
    { warehouse: "Kabul", product: "Shirts", stock: 60 },
    { warehouse: "Herat", product: "Shirts", stock: 40 },
    { warehouse: "Mazar", product: "Shirts", stock: 20 },
    { warehouse: "Kabul", product: "Shoes", stock: 70 },
    { warehouse: "Mazar", product: "Shoes", stock: 80 },
  ];

  // Table columns
  const columns = [
    { title: "Warehouse", dataIndex: "warehouse", key: "warehouse" },
    { title: "Product", dataIndex: "product", key: "product" },
    {
      title: "Available Stock",
      dataIndex: "stock",
      key: "stock",
      render: (val) => <Tag color={val < 50 ? "volcano" : "green"}>{val}</Tag>,
    },
  ];

  // Multi-color Bar chart configuration
  const barConfig = {
  data: stockData,
  xField: "category",
  yField: "stock",
  seriesField: "product", // this makes each bar a separate series
  color: ({ product }) => {
    const colorMap = {
      Shirts: "#1677ff",
      Jeans: "#52c41a",
      Jackets: "#fa8c16",
      Shoes: "#722ed1",
      Hoodies: "#f5222d",
      Bags: "#13c2c2",
    };
    return colorMap[product] || "#1677ff";
  },
  label: { position: "top", style: { fill: "#595959", fontWeight: 600 } },
  legend: { position: "bottom" },
  barStyle: { radius: [4, 4, 0, 0] },
};

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📦 Stock Management Dashboard
        </h1>

        {/* Summary Cards */}
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable className="shadow-md">
              <Statistic
                title="All Customers"
                value={customers}
                prefix={<UserOutlined style={{ color: "#1677ff" }} />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card hoverable className="shadow-md">
              <Statistic
                title="All Suppliers"
                value={suppliers}
                prefix={<TruckOutlined style={{ color: "#52c41a" }} />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card hoverable className="shadow-md">
              <Statistic
                title="Available Products"
                value={totalProducts}
                prefix={<AppstoreOutlined style={{ color: "#722ed1" }} />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card hoverable className="shadow-md">
              <Statistic
                title="Warehouses"
                value={warehouses}
                prefix={<HomeOutlined style={{ color: "#fa8c16" }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Multi-Color Vertical Bar Chart */}
        <Card title="Product Stock Overview" className="mt-8 shadow-lg" hoverable>
          <Bar {...barConfig} />
        </Card>

        {/* Multi-Warehouse Stock Table */}
        <Card title="Stock by Warehouse" className="mt-8 shadow-md" hoverable>
          <Table
            columns={columns}
            dataSource={multiStock}
            pagination={false}
            rowKey={(record) => record.warehouse + record.product}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Admin;
