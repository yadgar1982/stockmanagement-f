import React, { useEffect, useState } from "react";
import { Input, Button, Card, Form, Select, Table, Popconfirm, Modal } from "antd"
const { TextArea } = Input;
import { fetchCurrency } from "../../../../redux/slices/currencySlice"
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

const ExchangeCalculator = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();



  //calculator modal
  const [opencalc, setOpenCalc] = useState(false)
  const [firstNumber, setFirstNumber] = useState(0)
  const [secondNumber, setSecondNumber] = useState(0)
  const [result, setResult] = useState(0)
  const [handleX, setHandleX] = useState(false)
  const [readResult, setReadResult] = useState(0)
  const { currencies, crloading, crerror } = useSelector((state) => state.currencies);
  const allCurrencies = currencies?.data || [];
  const currency = allCurrencies.map((item) => ({
    currencyName: item.currency,
    rate: item.rate,
    dealerId: item._id,
  }));
  const currencyOptions = currency.map((cur) => ({
    label: cur.currencyName,
    value: cur.rate,
  }))
  useEffect(() => {
    dispatch(fetchCurrency)
  }, [])

  //exchange calculator code
  const onCalculate = (data) => {
    if (!firstNumber) {
      return toast.error("Please Enter amont to exchange!")
    }
    if (handleX !== true) {
      const calculate1 = Number(firstNumber) * Number(secondNumber);
      setResult(calculate1);
    } else {
      const calculate2 = Number(firstNumber) / Number(secondNumber);
      setResult(calculate2);
    }

  };

  useEffect(() => {
    setReadResult(result)
    form.setFieldsValue({ result: result.toFixed(2) });
  }, [result]);

  const firstChange = (value) => {
    setFirstNumber(value)
  }
  const secondChange = (value) => {
    setSecondNumber(value)
  }



  return (
    <>
      <Button type="text" className="!flex !mt-5 !items-center !justify-center !px-4 !py-2 !rounded-lg !text-black !font-bold 
         !bg-gradient-to-r from-[#FFD700] to-[#FFE680]
         hover:from-[#FFE680] hover:to-[#FFD700]
         !transition-all !duration-300" onClick={() => setOpenCalc(true)}>
        Exchange
      </Button>

      <Modal
        footer={null}
        title={
          <div className="w-full flex ">
            <span className="text-1xl font-bold text-purple-600  w-[95%] ">
              EXCHANGE RATE
            </span>
          </div>
        }
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={opencalc}
        onCancel={() => setOpenCalc(false)}

      >
        <Form
          form={form}                
          className="!bg-white !p-6 !rounded-xl shadow-lg"
          layout="vertical"
          onFinish={onCalculate}      
          size="small"
        >
          {/* Toggle Button */}
          <div className="mb-4">
            <Button
              type="text"
              className="!h-8 !text-white w-full py-3 !shadow-md rounded-lg text-xl font-bold text-white !bg-purple-500 hover:!bg-blue-500 transition-all duration-300"
              onClick={() => setHandleX(prev => !prev)}
            >
              {handleX
                ? <span className="md:text-xl font-bold">USD <ArrowLeftOutlined/>  LOCAL</span>
                : <span className="md:text-xl font-bold">USD <ArrowRightOutlined/>  LOCAL</span>
              }
            </Button>
          </div>

          {/* Amount Input */}
          <Form.Item
            label={<span className="text-lg font-semibold text-gray-700">Enter Amount Here</span>}
            name="firstNumber"
          >
            <Input
              type="number"
              onChange={(e) => firstChange(e.target.value)}
              className="!text-2xl font-bold text-purple-700 !rounded-lg md:!h-12 border-2 border-purple-400 p-3 focus:!ring-2 focus:!ring-purple-300 focus:!border-purple-500 transition-all duration-200"
              placeholder="0.00"
            />
          </Form.Item>

          {/* Currency Select */}
          <Form.Item
            label={<span className="text-lg font-semibold text-gray-700">Select Currency</span>}
            name="secondNumber"
          >
            <Select
              showSearch
              placeholder="Enter Currency"
              optionFilterProp="label"
              options={currencyOptions}
              onChange={(value) => secondChange(value)}
              className="!text-2xl font-bold text-purple-700 !rounded-lg md:!h-12 border-2 border-purple-400 p-3 focus:!ring-2 focus:!ring-purple-300 focus:!border-purple-500 transition-all duration-200"
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item className="mt-4">
            <Button
              type="text"
              htmlType="submit"
              className="!h-8 !text-white w-full py-3 !shadow-md rounded-lg text-xl font-bold text-white !bg-purple-500 hover:!bg-blue-500 transition-all duration-300"
            >
              <span className="md:text-xl font-bold p-4">Get Your Exchanged Rate</span>
            </Button>
          </Form.Item>

          {/* Result TextArea */}
          <Form.Item label={<span className="text-lg font-semibold text-gray-700">Result</span>}>
          
            <Input.TextArea
              className=" !bg-zinc-50 !text-2xl font-bold text-purple-700 !rounded-lg md:!h-12 border-2 border-purple-400 p-3 focus:!ring-2 focus:!ring-purple-300 focus:!border-purple-500 transition-all duration-200"
              value={
                readResult
                  ? `${Number(readResult).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                  : ""
              }
              readOnly
            />
          </Form.Item>
        </Form>


      </Modal>
    </>
  )
}

export default ExchangeCalculator;