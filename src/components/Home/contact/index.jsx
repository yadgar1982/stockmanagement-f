import React, { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { toast } from "react-toastify";
import { http } from "../../Modules/http";
import { useTranslation } from "react-i18next";

const httpReq = http();
const { Title, Paragraph } = Typography;

const ContactPage = () => {
  const { t } = useTranslation("about");
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
    <div className="w-full   px-2 flex items-center justify-center py-2  bg-white">
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-sm p-8 m-2 !md:p-16 border border-zinc-300">
        <Title
          level={2}
          className="text-center text-yellow-900 font-extrabold text-3xl md:text-4xl mb-4"
        >
          {t("Send Us a Message")}
        </Title>
        <Paragraph className="text-center text-yellow-800 text-lg mb-8">
          {t(
            "Have questions or want to work with us? Send a message and we will respond promptly!"
          )}
        </Paragraph>

        <Form layout="vertical" onFinish={onFinish} className="space-y-6">
          <Form.Item
            label={t("Name")}
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              placeholder={t("Your Name")}
              className="!rounded-none border !border-cyan-500 !focus:border-cyan-500 !focus:ring-2 !focus:ring-yellow-200 !shadow-sm !px-4 !py-3 !resize-none"
            />
          </Form.Item>

          <Form.Item
            label={t("Subject")}
            name="subject"
            rules={[{ required: true, message: "Please enter your subject" }]}
          >
            <Input
              placeholder={t("Your Subject")}
              className="!rounded-none border !border-cyan-500 !focus:border-cyan-500 !focus:ring-2 !focus:ring-yellow-200 !shadow-sm !px-4 !py-3 !resize-none"
            />
          </Form.Item>

          <Form.Item
            label={t("Email")}
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              placeholder="abc@gmail.com"
              className="!rounded-none border !border-cyan-500 !focus:border-cyan-500 !focus:ring-2 !focus:ring-yellow-200 !shadow-sm !px-4 !py-3 !resize-none"
            />
          </Form.Item>

          <Form.Item
            label={t("Message")}
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
            className="!min-h-200px"
          >
          <Input.TextArea
    placeholder={t("Your Message")}
    rows={8}             
    style={{ minHeight: 180, lineHeight: "1.5rem" }}
    className="!rounded-none border !border-cyan-500 !focus:border-cyan-500 !focus:ring-2 !focus:ring-yellow-200 !shadow-sm !px-4 !py-3 !resize-none"
  />
          </Form.Item>

          <Form.Item>
            <Button
              type="text"
              htmlType="submit"
              loading={loading}
              block
              className="!bg-yellow-600 hover:!bg-cyan-500 !text-white font-bold text-lg py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t("Send Message")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ContactPage;
