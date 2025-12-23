import React, { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { toast } from "react-toastify";
import { http } from "../../Modules/http";
import HomeLayout from "../../Shared/HomeLayout"
const httpReq = http();
const { Title, Paragraph } = Typography;

const ContactPage = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    console.log("values", values);
    setLoading(true);
    try {
      await httpReq.post("/api/auth/sendEmail", values);
      toast.success("Email sent successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
   <HomeLayout>
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-blue-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <Title style={{ textAlign: "center", color: "#f97316" }}>Contact Us</Title>
        <Paragraph style={{ textAlign: "center", color: "#1e3a8a", fontSize: "16px", marginBottom: "40px" }}>
          Have questions or want to work with us? Send us a message and we will respond promptly!
        </Paragraph>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input 
              placeholder="Your Name"
              className="rounded-lg border-orange-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            />
          </Form.Item>

          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter your subject" }]}
          >
            <Input 
              placeholder="Your Subject"
              className="rounded-lg border-orange-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input 
              placeholder="abc@gmail.com"
              className="rounded-lg border-orange-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            />
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <Input.TextArea
              rows={5}
              placeholder="Your Message"
              className="rounded-lg border-orange-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-gradient-to-r from-orange-400 to-blue-500 hover:from-orange-500 hover:to-blue-600 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition-all duration-300"
            >
              Send Message
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
   </HomeLayout>
  );
};

export default ContactPage;
