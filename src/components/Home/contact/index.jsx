import React, { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { toast } from "react-toastify";
import { http } from "../../Modules/http";

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

    <div className="w-full flex items-center justify-center bg-cyan-700 p-4">
      <div className="md:w-3/5 bg-zinc-100  shadow-2xl p-10 md:p-16">
        <Title style={{ textAlign: "center", color: "#1067a4ff", fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Send Us a Message
        </Title>
        <Paragraph style={{ textAlign: "center", color: "#1e3a8a", fontSize: "1.125rem", marginBottom: "2rem" }}>
          Have questions or want to work with us? Send a message and we'll respond promptly!
        </Paragraph>

        <Form layout="vertical" onFinish={onFinish} className="space-y-6">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              placeholder="Your Name"
              className="rounded-xl border border-orange-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm"
            />
          </Form.Item>

          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter your subject" }]}
          >
            <Input
              placeholder="Your Subject"
              className="rounded-xl border border-orange-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm"
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
              className="rounded-xl border border-orange-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm"
            />
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Your Message"
              className="rounded-xl border border-orange-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm resize-none"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-gradient-to-r from-orange-400 to-blue-500 hover:from-orange-500 hover:to-blue-600 text-white font-bold text-lg py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Send Message
            </Button>
          </Form.Item>
        </Form>
      </div>

    </div>

  );
};

export default ContactPage;
