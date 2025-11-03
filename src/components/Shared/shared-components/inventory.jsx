import React from 'react';
import { Card, Divider, Tabs } from "antd";
import { StockOutlined, PieChartOutlined, AccountBookOutlined } from '@ant-design/icons';
import UserLayout from '../UserLayout';

const Inventory = () => {





  return (
    <UserLayout>

      <div>
        <h1 className='p-4 md:text-xl text-blue-500 -mb-6 font-semibold '>Outstading Figures:</h1>
        <Divider />
        <div className='!text-red-500 md:grid md:grid-cols-5 gap-4 p-4 '>
          <Card title={<p className='text-white' >Suppliers</p>}
            className="custom-card"
          >
            <p className='!text-semibold'>Total Suppliers:<span className='text-blue-500 font-bold'> 4</span></p>
            <p className='!text-semibold'>Total Suppliers Balance:<span className='text-blue-500 font-bold'> $ 12,000</span></p>
          </Card>
          <Card title={<p className='text-white' >Customer</p>}
            className="custom-card"
          >
            <p className='!text-semibold'>Total Customers:<span className='text-blue-500 font-bold'> 4</span></p>
            <p className='!text-semibold'>Total Customers Balance:<span className='text-blue-500 font-bold'> $ 12,000</span></p>
          </Card>
          <Card title={<p className='text-white' >Dealers</p>}
            className="custom-card"
          >
            <p className='!text-semibold'>Total Dealers:<span className='text-blue-500 font-bold'> 4</span></p>
            <p className='!text-semibold'>Total Dealers Balance:<span className='text-blue-500 font-bold'> $ 12,000</span></p>
          </Card>
          <Card title={<p className='text-white' >Stock</p>}
            className="custom-card"
          >
            <p className='!text-semibold'>Total Stock:<span className='text-blue-500 font-bold'> 4</span></p>
            <p className='!text-semibold'>Total Balance:<span className='text-blue-500 font-bold'> $ 12,000</span></p>
          </Card>
         
        </div>
        
      <h1 className='p-4 md:text-xl text-blue-500 -mb-6 font-semibold '>Analysis:</h1>
      <Divider />
        <div className=' bg-zinc-100 '>
         
        </div>

      </div>
    </UserLayout>
  )
}

export default Inventory