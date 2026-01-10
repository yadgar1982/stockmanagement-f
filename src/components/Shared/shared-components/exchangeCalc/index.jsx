"use client";
import React, { useEffect, useState } from "react";
import { Input, Button, Form, Select, Modal,Avatar } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrency } from "../../../../redux/slices/currencySlice";
import { toast } from "react-toastify";

const ExchangeCalculator = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [openCalc, setOpenCalc] = useState(false);
  const [handleX, setHandleX] = useState(false);
  const [result, setResult] = useState(null);

  const { currencies } = useSelector((state) => state.currencies);
  const allCurrencies = currencies?.data || [];

  const currencyOptions = allCurrencies.map((item) => ({
    label: item.currency,
    value: item.rate,
  }));

  // Fetch currencies
  useEffect(() => {
    dispatch(fetchCurrency());
  }, [dispatch]);

  // Calculation
  const onCalculate = (values) => {
    const { firstNumber, secondNumber } = values;

    if (!firstNumber || !secondNumber) {
      return toast.error("Please enter amount and select a currency!");
    }

    const num1 = Number(firstNumber);
    const num2 = Number(secondNumber);

    const calc = handleX ? num1 / num2 : num1 * num2;
    setResult(calc.toFixed(2));
  };

  return (
    <>
      <Button
        type="text"
        size="small"
        className="!bg-cyan-600 !text-white !font-semibold !h-6 !mt-2 !px-2 !p-4 !hidden lg:!flex md:!flex "
        onClick={() => setOpenCalc(true)}
      >
      $ Exch
      </Button>

      <Modal
        open={openCalc}
        onCancel={() => setOpenCalc(false)}
        footer={null}
        title={
          <span className="text-lg font-bold text-zinc-600">
            EXCHANGE CALCULATOR
          </span>
        }
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onCalculate}
          className="!bg-white !p-6 !rounded-sm shadow-lg"
        >
          {/* Toggle USD / LOCAL */}
          <Form.Item>
            <Button
              type="text"
              onClick={() => setHandleX((prev) => !prev)}
              className="!w-full !py-3 !bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-gray-50 hover:!to-zinc-100 !text-white hover:!text-blue-700 hover:!border-sm hover:!border-blue-500 !rounded-none font-bold text-lg transition-all duration-300"
            >
              {handleX ? (
                <>
                  USD <ArrowLeftOutlined className="!text-lg !px-4" /> LOCAL
                </>
              ) : (
                <>
                  USD <ArrowRightOutlined className="!text-lg !px-4" /> LOCAL
                </>
              )}
            </Button>
          </Form.Item>

          {/* Amount Input */}
          <Form.Item
            label="Enter Amount"
            name="firstNumber"
            rules={[{ required: true, message: "Please enter amount!" }]}
          >
            <Input
              type="number"
              placeholder="0.00"
              className="!text-2xl !font-bold !text-zinc-700 !rounded-none  p-3 focus:!ring-2 focus:!ring-zinc-300 focus:!border-zinc-500 transition-all duration-200"
            />
          </Form.Item>

          {/* Currency Select */}
          <Form.Item
            label="Select Currency"
            name="secondNumber"
            rules={[{ required: true, message: "Please select currency!" }]}
          >
            <Select
              placeholder="Select Currency"
              options={currencyOptions}
              showSearch
              optionFilterProp="label"
              className="!text-xl !font-bold !text-zinc-700 !rounded-none  p-3 focus:!ring-2 focus:!ring-zinc-300 focus:!border-zinc-500 transition-all duration-200"
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              htmlType="submit"
              className="!w-full !py-3 !bg-gradient-to-r from-blue-500 to-cyan-300 hover:from-blue-500 hover:to-blue-300 !text-white !rounded-none !font-bold !text-lg !transition-all !duration-300"
            >
              Get Exchanged Rate
            </Button>
          </Form.Item>

          {/* Result */}
          {result && (
            <Form.Item label="Result">
              <Input.TextArea
                value={Number(result).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                readOnly
                className="!text-2xl !font-bold !text-zinc-700 !rounded-sm !border-2 !border-blue-400 p-3 !bg-white transition-all duration-200"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default ExchangeCalculator;
