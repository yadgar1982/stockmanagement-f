import React from "react";
import { Card, Descriptions, Button, Divider,Divider,Descriptions,Modal } from "antd";
import { PrinterOutlined } from "@ant-design/icons";

const PrintPurchasePage = ({ printPurchase }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6 print:bg-white print:p-0">
      <Card
        title={
          <div className="text-center text-xl font-semibold">
            Purchase Report — {printPurchase.productName}
          </div>
        }
        className="w-full max-w-3xl shadow-lg print:shadow-none print:border-none"
        bordered
      >
        <Descriptions
          bordered
          column={1}
          size="middle"
          className="bg-white rounded-lg"
        >
          <Descriptions.Item label="Product Name">
            {printPurchase.productName}
          </Descriptions.Item>
          <Descriptions.Item label="Quantity">
            {printPurchase.quantity} {printPurchase.unit}
          </Descriptions.Item>
          <Descriptions.Item label="Batch No">
            {printPurchase.batch}
          </Descriptions.Item>
          <Descriptions.Item label="Warehouse">
            {printPurchase.warehouseName}
          </Descriptions.Item>
          <Descriptions.Item label="Supplier">
            {printPurchase.supplierName}
          </Descriptions.Item>
          <Descriptions.Item label="Dealer">
            {printPurchase.dealerName}
          </Descriptions.Item>
          <Descriptions.Item label="Company">
            {printPurchase.companyName}
          </Descriptions.Item>
          <Descriptions.Item label="Country">
            {printPurchase.countryName}
          </Descriptions.Item>
          <Descriptions.Item label="Currency">
            {printPurchase.currency}
          </Descriptions.Item>
          <Descriptions.Item label="Unit Cost">
            {printPurchase.unitCost} {printPurchase.currency}
          </Descriptions.Item>
          <Descriptions.Item label="Exchanged Amount">
            {printPurchase.exchangedAmt} {printPurchase.currency}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {printPurchase.description || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {printPurchase.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(printPurchase.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {new Date(printPurchase.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <div className="flex justify-between items-center mt-4 print:hidden">
          <span className="text-gray-500">
            Generated on {new Date().toLocaleString()}
          </span>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Print Page
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PrintPurchasePage
