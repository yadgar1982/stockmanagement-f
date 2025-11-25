import React, { useState } from 'react';

import { Card, Divider, Tabs,Tooltip } from "antd";
import { StockOutlined, AccountBookOutlined, UserOutlined, ShopOutlined, TeamOutlined, BankOutlined } from '@ant-design/icons';
import UserLayout from '../Shared/UserLayout'
import SupplierStatements from '../Shared/Reports/Statements/supplier';
import CustomerStatements from '../Shared/Reports/Statements/customer';
import DealerStatements from '../Shared/Reports/Statements/dealer';
import Company from '../Shared/Reports/Statements/company';
import Warehouse from '../Shared/Reports/Statements/Warehouse';
const User = () => {
  const [size, setSize] = useState('small');

  const items = [
   {
  key: "1",
  label: (
    <Tooltip title="Supplier">
      <span className="hidden md:block">Supplier</span>
    </Tooltip>
  ),
  icon: (
    <Tooltip title="Supplier">
      <ShopOutlined className="md:!hidden flex justify-center items-center text-lg pt-4" />
    </Tooltip>
  ),
  children: (
    <div className="bg-white h-screen w-full">
      <SupplierStatements />
    </div>
  ),
},

{
  key: "2",
  label: (
    <Tooltip title="Customer">
      <span className="hidden md:block">Customer</span>
    </Tooltip>
  ),
  icon: (
    <Tooltip title="Customer">
      <TeamOutlined className="md:!hidden flex justify-center text-lg pt-4" />
    </Tooltip>
  ),
  children: (
    <div className="bg-white h-screen w-full">
      <CustomerStatements />
    </div>
  ),
},

{
  key: "3",
  label: (
    <Tooltip title="Dealer">
      <span className="hidden md:block">Dealer</span>
    </Tooltip>
  ),
  icon: (
    <Tooltip title="Dealer">
      <UserOutlined className="md:!hidden flex justify-center text-lg pt-4" />
    </Tooltip>
  ),
  children: (
    <div className="bg-white h-screen w-full">
      <DealerStatements/>
    </div>
  ),
},

{
  key: "4",
  label: (
    <Tooltip title="Belong-To">
      <span className="hidden md:block">Belong-to</span>
    </Tooltip>
  ),
  icon: (
    <Tooltip title="Belong-To">
      <BankOutlined className="md:!hidden flex justify-center text-lg pt-4" />
    </Tooltip>
  ),
  children: (
    <div className="bg-white h-screen w-full">
      <Company/>
    </div>
  ),
},
{
  key: "5",
  label: (
    <Tooltip title="Warehouse">
      <span className="hidden md:block">Warehouse</span>
    </Tooltip>
  ),
  icon: (
    <Tooltip title="Warehouse">
      <BankOutlined className="md:!hidden flex justify-center text-lg pt-4" />
    </Tooltip>
  ),
  children: (
    <div className="bg-white h-screen w-full">
      <Warehouse/>
    </div>
  ),
},



  ];


  return (
    <UserLayout>

      <div className='w-full justify-center items-center flex p-5'> <h1 className='text-blue-200 text-shadow-black text-shadow-lg md:text-6xl md:font-bold '>Reports & Statements:</h1></div>
      <div className="!w-screen !h-screen">
        
        <Tabs
          defaultActiveKey="1"
          type="card"
          size={size}
          items={items}
          className="h-full small-tabs !bg-white md:!w-[100%]"
        />
      </div>

    </UserLayout>
  )
}

export default User