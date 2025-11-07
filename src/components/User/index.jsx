import React, { useState } from 'react';

import { Card, Divider, Tabs } from "antd";
import { StockOutlined,  AccountBookOutlined } from '@ant-design/icons';
import UserLayout from '../Shared/UserLayout'
import Statements from '../Shared/Reports/Statements';
const User = () => {
  const [size, setSize] = useState('small');

  const items = [
     {
      key: "1",
      label: "F-Statements",
      icon: <AccountBookOutlined />,
      children: <div className='bg-white w-full'> <Statements /></div>, // component inside Tab 2
    },
    {
      key: "2",
      label: "Stock Statements",
      icon: <StockOutlined />,
      children: <div className='bg-white w-full'> Stock Coponent</div>, // component inside Tab 1
    },
   
   
  ];


  return (
    <UserLayout>

      <div className='bg-zinc-400 border-none'>
        <div className='w-full justify-center items-center flex p-5'> <h1 className='text-zinc-500 text-shadow-black text-shadow-lg md:text-6xl md:font-bold '>Reports and Statements:</h1></div>
        <div className=' bg-zinc-50 pt-4  md:!h-[80vh]'>

          <Tabs
            defaultActiveKey="1"
            type="card"
            size={size}
            style={{ marginBottom: 32 }}
            items={items}
          />
        </div>

      </div>
    </UserLayout>
  )
}

export default User