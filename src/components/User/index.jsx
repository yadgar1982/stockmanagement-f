import React, { useState } from 'react';

import { Card, Divider, Tabs } from "antd";
import { StockOutlined, AccountBookOutlined } from '@ant-design/icons';
import UserLayout from '../Shared/UserLayout'
import SupplierStatements from '../Shared/Reports/Statements/supplier';
import CustomerStatements from '../Shared/Reports/Statements/customer';
const User = () => {
  const [size, setSize] = useState('small');

  const items = [
    {
      key: "1",
      label: "Supplier",
      icon: <AccountBookOutlined />,
      children: <div className='bg-white h-screen w-full'> <SupplierStatements /></div>, // component inside Tab 2
    },
    {
      key: "2",
      label: "Customer",
      icon: <StockOutlined />,
      children: <div className='bg-white h-screen w-full'><CustomerStatements /></div>, // component inside Tab 1
    },


  ];


  return (
    <UserLayout>

        <div className='w-full justify-center items-center flex p-5'> <h1 className='text-zinc-500 text-shadow-black text-shadow-lg md:text-6xl md:font-bold '>Reports and SupplierStatements:</h1></div>
        <div className="!w-screen !h-screen">
          <Tabs
            defaultActiveKey="1"
            type="card"
            size={size}
            items={items}
            className="h-full"
          />
        </div>

    </UserLayout>
  )
}

export default User