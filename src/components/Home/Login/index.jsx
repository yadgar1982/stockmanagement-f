import React, { useState } from "react";
import { Avatar, Button, Checkbox, Form, Input } from 'antd';
import HomeLayout from "../../Shared/HomeLayout/index";
import Cookies from "universal-cookie";
import { http, trimData } from "../../Modules/http";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const cookies = new Cookies();



const Login = () => {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  //states collections
  const [loader, setLoader] = useState(false);

  //create cookies expiry date
  const expires = new Date();
  expires.setTime(expires.getTime() + 6 * 60 * 60 * 1000); // 6 hours


  const onFinish = async (values) => {
    setLoader(true);
    try {
      const finalObj = trimData(values);
  
      const httpReq = http();
      const { data } = await httpReq.post("/api/auth/login", finalObj);
      const { token, user } = data;



      // store token
      localStorage.setItem("userInfo", JSON.stringify(user));
      cookies.set("authToken", token, { path: "/", maxAge:1*60*60 });

      // navigate by role
      if (user.role === "admin") return navigate("/admin");
      if (user.role === "user") return navigate("/user");
      return navigate("/login");

    } catch (error) {
      if (error?.response?.data?.msg) {
        toast.error("Login Failed: " + error.response.data.msg);
      } else {
        toast.error(error.response?.data || "Login failed");
      }
    } finally {
      setLoader(false);
    }
  };






  return (
    <HomeLayout>
      <div className="!w-full flex !bg-orange-50 !justify-center items-center h-screen">

        <div className="p-4 bg-[#08678f] md:w-100 h-screen justify-center items-center  shadow-black flex flex-col gap-9">

          <Form
            name="basic"

            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={(errorInfo) => console.log("Validation failed:", errorInfo)}
            autoComplete="off"
            className="bg-zinc-200 !p-3 !rounded-[8px] border !w-full !border-[10px] border-white shadow-lg shadow-black"
          >
            <ToastContainer position="top-right" autoClose={3000} />
            <h3 className="w-full flex justify-center text-[#08678f] font-bold py-4 text-xl">Login Here</h3>
            <Form.Item
              label="Username"
              name="email"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password />
            </Form.Item>
            {/* 
            <Form.Item name="remember" valuePropName="checked" label={null}>
              <Checkbox>Remember me</Checkbox>
            </Form.Item> */}

            <Form.Item label={null}>
              <Button
                type="text"
                htmlType="submit"

                className="w-full !bg-blue-500 !text-white hover:!bg-blue-500 hover:!text-white !font-bold"
                loading={loader}
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>

      </div>
    </HomeLayout>
  )
};


export default Login;