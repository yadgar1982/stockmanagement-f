import React from 'react'
import {Button}from "antd";
const Statements = () => {

  //handle supplier statement
  const handleSupplierStatement=()=>{
    alert()
  }
  return (
    <div className='bg-yellow-200 md:min-h-50 md:grid md:grid-cols-4'>
      <div className='bg-zinc-50'>
        <h1 className='md:text-lg font-bold mb-4'>Supplier Reports:</h1>
        <div className='px-2'>
          <Button  type='text' className='!bg-blue-500 !text-white hover:!bg-green-500 hover:!shadow-lg hover:!shadow-blue-200  !w-full !px-4'
          onClick={handleSupplierStatement}
          >Supplier Statement</Button>
        </div>
      </div>
      <div className='md:col-span-3 bg-blue-50 flex justify-center items-center'>
       
      </div>
    </div>
  )
}

export default Statements