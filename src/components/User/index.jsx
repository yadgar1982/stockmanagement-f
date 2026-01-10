import React, { useState } from 'react';

import { Card, Divider, Tabs, Tooltip } from "antd";
import { StockOutlined, AccountBookOutlined, UserOutlined, ShopOutlined, TeamOutlined, BankOutlined, SolutionOutlined, HomeOutlined } from '@ant-design/icons';
import UserLayout from '../Shared/UserLayout'
import SupplierStatements from '../Shared/Reports/Statements/supplier';
import CustomerStatements from '../Shared/Reports/Statements/customer';
import DealerStatements from '../Shared/Reports/Statements/dealer';
import Company from '../Shared/Reports/Statements/company';
import Warehouse from '../Shared/Reports/Statements/Warehouse';
import Cashbook from '../Shared/Reports/Statements/cashbook';
const User = () => {
  const [size, setSize] = useState('small');

  const items = [
    {
      key: "1",
      label: (
        <div className="bg-yellow-600 hover:bg-blue-600 text-white px-4 py-4 mx-1  flex items-center justify-center font-bold">
          <Tooltip title="Supplier">
            <span className="hidden md:block text-center">Supplier</span>
             <TeamOutlined className="md:!hidden text-lg" />
          </Tooltip>
        </div>
      ),
     
      children: (
        <div className="!bg-zinc-100 w-full h-full">
          <SupplierStatements />
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div className="bg-yellow-600 hover:bg-blue-600 text-white px-4 py-4 flex items-center justify-center font-bold">
          <Tooltip title="Customer">
            <span className="hidden md:block text-center">Customer</span>
            <UserOutlined className="block md:!hidden text-lg" />

          </Tooltip>
        </div>
      ),
     
      children: (
        <div className="!bg-zinc-100 h-full w-full">
          <CustomerStatements />
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div className="bg-yellow-600  hover:bg-blue-600 text-white px-4 py-4 flex mx-1 items-center justify-center font-bold">
          <Tooltip title="Dealer">
            <span className="hidden md:block text-center">Dealer</span>
              <SolutionOutlined className="md:!hidden text-lg" />
          </Tooltip>
        </div>
      ),
      children: (
        <div className="!bg-zinc-100 h-full w-full">
          <DealerStatements />
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <div className="bg-yellow-600  hover:bg-blue-600 text-white px-4 py-4  flex  items-center justify-center font-bold">
          <Tooltip title="Belong-To">
            <span className="hidden md:block text-center">Belong-to</span>
            <BankOutlined className="md:!hidden text-lg" />
          </Tooltip>
        </div>
      ),
      children: (
        <div className="!bg-zinc-100 h-full w-full">
          <Company />
        </div>
      ),
    },
    {
      key: "5",
      label: (
        <div className="bg-yellow-600  hover:bg-blue-600 text-white px-4 py-4 mx-1 flex items-center justify-center font-bold">
          <Tooltip title="Warehouse">
            <span className="hidden md:block text-center text-center">Warehouse</span>
             <HomeOutlined className="md:!hidden text-lg" />
          </Tooltip>
        </div>
      ),
     
      children: (
        <div className="!bg-zinc-100 h-full w-full">
          <Warehouse />
        </div>
      ),
    },
    {
      key: "6",
      label: (
        <div className="bg-yellow-600 w-full hover:bg-blue-600 text-white px-4 py-4  flex items-center justify-center font-bold">
          <Tooltip title="Cashbook">
            <span className="hidden md:block text-center">Cashbook</span>
            <AccountBookOutlined className="md:!hidden text-lg" />
          </Tooltip>
        </div>
      ),
     
      children: (
        <div className="!bg-zinc-100 h-full w-full">
          <Cashbook />
        </div>
      ),
    },
  ];



  return (
    <UserLayout>

      <div className="w-full !bg-zinc-50 flex justify-center items-center py-6">
        <h1
          className="
      text-orange-500
      text-center
      text-xl
      sm:text-3xl
      md:text-5xl
      font-bold
      drop-shadow-lg
    "
        >
          Reports & Statements
        </h1>
      </div>
      <div
        className="w-full h-auto bg-zinc-50 flex flex-col justify-center items-center "
      >

        <Tabs
          defaultActiveKey="1"

          size={size}
          items={items}
          className="!w-full !bg-white"
          tabBarGutter={0}
        
          tabBarStyle={{ height: 55, display: "flex", alignItems: "center" }}
        />

      </div>

    </UserLayout>
  )
}

export default User