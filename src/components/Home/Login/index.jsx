import React, { useState } from "react";
import { Button, Form, Input, Modal } from 'antd';
import HomeLayout from "../../Shared/HomeLayout";
import Cookies from "universal-cookie";
import { http, trimData } from "../../Modules/http";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const cookies = new Cookies();

const Login = () => {
  const navigate = useNavigate();

  const [loader, setLoader] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);

//otp state
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
 
  const onFinish = async (values) => {
    setLoader(true);
    try {
      const finalObj = trimData(values);
      const httpReq = http();
      const { data } = await httpReq.post("/api/auth/login", finalObj);

      const { token, user } = data;

      localStorage.setItem("userInfo", JSON.stringify(user));
      cookies.set("authToken", token, { path: "/", maxAge: 3600 });

      if (user.role === "admin") return navigate("/admin");
      if (user.role === "user") return navigate("/inventory");
      navigate("/login");

    } catch (error) {
      toast.error(error.response?.data?.msg || "Login failed");
    } finally {
      setLoader(false);
    }
  };

  //Send Otp
  const sendOtp = async (values) => {
    setLoader(true);
    try {
      const httpReq = http();
      await httpReq.post("/api/auth/send-otp", values);
      setEmail(values.email);
      setStep(2);
      toast.success("OTP sent to email");
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
    setLoader(false);
  };

// verify Otp
  const verifyOtp = async (values) => {
    setLoader(true);
    try {
      const httpReq = http();
      await httpReq.post("/api/auth/verify-otp", {
        email,
        otp: values.otp
      });
      setOtp(values.otp);
      setStep(3);
      toast.success("OTP verified successfully");
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
    setLoader(false);
  };


//reset passwrod
  const resetPassword = async (values) => {
    if (values.passworda !== values.passwordb) {
      toast.error("Passwords do not match");
      return;
    }
    setLoader(true);
    try {
      const httpReq = http();
      await httpReq.post("/api/auth/reset-password", {
        email,
        otp,
        password: values.passworda
      });

      toast.success("Password reset successful");
      setForgotModal(false);
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Reset failed");
    }
    setLoader(false);
  };

  return (
    <HomeLayout>
      <div className="flex w-full items-center justify-center h-screen bg-gradient-to-br from-zinc-50 to-zinc-200  md:grid md:grid-cols-3 ">
        <div ></div>
       <div className="w-full px-4 md:w-[75%] h-screen  flex justify-center items-center"> 
        <div className=" w-full max-w-md bg-zinc-100 rounded-2xl shadow-2xl p-8">
          <h2 className="text-center text-2xl font-extrabold text-blue-900 mb-6">
            Login Here
          </h2>

          <Form onFinish={onFinish} layout="vertical" className="space-y-5 ">
            <Form.Item name="email" rules={[{ required: true, message: 'Please enter your email!' }]}>
              <Input
                placeholder="Email"
                className="rounded-sm border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400"
              />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password!' }]}>
              <Input.Password
                placeholder="Password"
                className="rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className="rounded-lg font-semibold  hover:from-indigo-500 hover:to-blue-500"
              loading={loader}
            >
              Login
            </Button>

            <Button
              type="link"
              block
              className="text-blue-500 hover:text-indigo-500 mt-2"
              onClick={() => setForgotModal(true)}
            >
              Forgot Password?
            </Button>
          </Form>
        </div></div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      <Modal
        open={forgotModal}
        footer={null}
        centered
        onCancel={() => {
          setForgotModal(false);
          setStep(1);
        }}
        className="rounded-2xl"
      >
        <div className="p-4">
          {step === 1 && (
            <Form onFinish={sendOtp} layout="vertical" className="space-y-4">
              <h3 className="text-center text-blue-900 font-bold mb-4 text-2xl">Send OTP</h3>
              <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
                <Input placeholder="Enter your email" className="rounded-lg" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500"
                loading={loader}
              >
                Send OTP
              </Button>
            </Form>
          )}

          {step === 2 && (
            <Form onFinish={verifyOtp} layout="vertical" className="space-y-4">
              <h3 className="text-center text-blue-900 font-bold mb-4 text-2xl">Verify OTP</h3>
              <Form.Item name="otp" rules={[{ required: true, message: 'Enter the OTP sent to your email' }]}>
                <Input placeholder="Enter OTP" className="rounded-lg" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500"
                loading={loader}
              >
                Verify OTP
              </Button>
            </Form>
          )}

          {step === 3 && (
            <Form onFinish={resetPassword} layout="vertical" className="space-y-4">
              <h3 className="text-center text-blue-900 font-bold mb-4">Reset Password</h3>
              <Form.Item name="passworda" rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}>
                <Input.Password placeholder="New Password" className="rounded-lg" />
              </Form.Item>
              <Form.Item name="passwordb" rules={[{ required: true, message: 'Confirm your password' }]}>
                <Input.Password placeholder="Confirm Password" className="rounded-lg" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500"
                loading={loader}
              >
                Reset Password
              </Button>
            </Form>
          )}
        </div>
      </Modal>
    </HomeLayout>

  );
};

export default Login;
