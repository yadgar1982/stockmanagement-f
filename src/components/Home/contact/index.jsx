import React, { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { toast } from "react-toastify";
import { http } from "../../Modules/http";
import { useTranslation } from 'react-i18next'
const httpReq = http();
const { Title, Paragraph } = Typography;

const ContactPage = () => {
   const { t } = useTranslation('about');
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

    <div className="w-full flex items-center justify-center bg-[#ffee8d] ">
      <div className="md:w-full bg-[#e8e1b8]  shadow-2xl p-10 md:p-16">
        <Title style={{ textAlign: "center", color: "#4c4102ff", fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          {(t('Send Us a Message'))}
        </Title>
        <Paragraph style={{ textAlign: "center", color: "#2c2604ff", fontSize: "1.125rem", marginBottom: "2rem" }}>
          {(t('Have questions or want to work with us? Send a message and we will respond promptly!'))}
        </Paragraph>

        <Form layout="vertical" onFinish={onFinish} className="space-y-6">
          <Form.Item
            label={(t('Name'))}
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              placeholder={(t("Your Name"))}
              className="rounded-xl border border-orange-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm"
            />
          </Form.Item>

          <Form.Item
            label={(t("Subject"))}
            name="subject"
            rules={[{ required: true, message: "Please enter your subject" }]}
          >
            <Input
              placeholder={(t("Your Subject"))}
              className="rounded-xl border border-orange-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm"
            />
          </Form.Item>

          <Form.Item
            label={(t("Email"))}
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
            label={(t("Message"))}
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <Input.TextArea
              rows={6}
              placeholder={(t("Your Message"))}
              className="rounded-xl border border-orange-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm resize-none"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="text"
              htmlType="submit"
              loading={loading}
              block
              className="!bg-[#6b5c06] hover:!bg-orange-700 !text-white font-bold text-lg py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {(t("Send Message"))}
            </Button>
          </Form.Item>
        </Form>
      </div>

    </div>

  );
};

export default ContactPage;
