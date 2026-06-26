import React, { useState } from "react";
<<<<<<< HEAD
import { Form, Input, Button, Typography, Row, Col } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
=======
import { Form, Input, Button, Typography } from "antd";
>>>>>>> da2b565ddce62cf2ce9831f0f10f7286ea54c8f2
import { toast } from "react-toastify";
import { http } from "../../Modules/http";
import { useTranslation } from "react-i18next";

<<<<<<< HEAD
const { Title, Paragraph } = Typography;
const httpReq = http();
const { TextArea } = Input;
const ContactPage = () => {
  const [myform] = Form.useForm();

=======
const httpReq = http();
const { Title, Paragraph } = Typography;

const ContactPage = () => {
>>>>>>> da2b565ddce62cf2ce9831f0f10f7286ea54c8f2
  const { t } = useTranslation("about");
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
<<<<<<< HEAD
    setLoading(true);

    try {
      await httpReq.post("/api/auth/sendEmail", values);
      toast.success(t("Email sent successfully!"));
      myform.resetFields();
    } catch (error) {
      toast.error(error.response?.data?.message || t("Failed to send email"));
=======
    console.log("values", values);
    setLoading(true);
    try {
      await httpReq.post("/api/auth/sendEmail", values);
      toast.success("Email sent successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send email");
>>>>>>> da2b565ddce62cf2ce9831f0f10f7286ea54c8f2
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <section className=" py-20 px-4 md:px-10 bg-zinc-900">
      <div className="max-w-7xl mx-auto">
        <Title
          level={2}
          className="!text-center !text-4xl md:!text-5xl !font-bold !text-zinc-200"
        >
          {t("Get in Touch")}
        </Title>

        <Paragraph className="!text-center !text-lg !text-gray-600 !mb-16 !text-zinc-200">
          {t(
            "We'd love to hear from you. Contact us for inquiries, partnerships or product information.",
          )}
        </Paragraph>

        <Row
          gutter={[40, 40]}
          className="bg-white rounded-xl shadow-2xl overflow-hidden border border-yellow-500"
        >
          {/* LEFT SIDE */}

          <Col
            xs={24}
            md={8}
            className="bg-zinc-600 text-white p-10 flex flex-col justify-center"
          >
            <Title level={3} className="!text-yellow-500">
              {t("Contact Information")}
            </Title>

            <Paragraph className="!text-gray-300">
              {t(
                "Our team is ready to answer your questions and assist you with our premium dried fruit products.",
              )}
            </Paragraph>

            <div className="mt-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-yellow-500 flex justify-center items-center">
                  <MailOutlined className="text-black text-xl" />
                </div>

                <div>
                  <div className="font-bold">{t("Email")}</div>

                  <div className="text-gray-300">hadiagroup2023@gmail.com</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-yellow-500 flex justify-center items-center">
                  <PhoneOutlined className="text-black text-xl" />
                </div>

                <div>
                  <div className="font-bold">{t("Phone")}</div>

                  <div className="text-gray-300">+1 (747) 420-3722</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-yellow-500 flex justify-center items-center">
                  <EnvironmentOutlined className="text-black text-xl" />
                </div>

                <div>
                  <div className="font-bold">{t("Location")}</div>

                  <div className="text-gray-300">Almaty, Kazakhstan</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-yellow-500 flex justify-center items-center">
                  <GlobalOutlined className="text-black text-xl" />
                </div>

                <div>
                  <div className="font-bold">{t("Worldwide Supply")}</div>

                  <div className="text-gray-300">
                    {t("Premium Dried Fruits")}
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* RIGHT SIDE */}

          <Col xs={24} md={16} className="p-10 bg-zinc-200">
            <Form layout="vertical" onFinish={onFinish} form={myform}>
              <Row gutter={25}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={t("Name")}
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: t("Please enter your name"),
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder={t("Your Name")}
                      className="rounded-xl"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={t("Subject")}
                    name="subject"
                    rules={[
                      {
                        required: true,
                        message: t("Please enter your subject"),
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder={t("Subject")}
                      className="rounded-xl"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={t("Email")}
                name="email"
                rules={[
                  {
                    required: true,
                    message: t("Please enter your email"),
                  },
                  {
                    type: "email",
                    message: t("Please enter a valid email"),
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="example@email.com"
                  className="rounded-xl"
                />
              </Form.Item>

              <Form.Item
                label={t("Message")}
                name="message"
                rules={[
                  {
                    required: true,
                    message: t("Please enter your message"),
                  },
                ]}
              >
                <TextArea
                  rows={5}
                
                />
              </Form.Item>

              <Button
                htmlType="submit"
                loading={loading}
                size="large"
                className="
                  !w-full
                  !h-10
                  !rounded-sm
                  !bg-yellow-500
                  hover:!bg-yellow-200
                  hover:!shadow-sm
                  hover:!shadow-zinc-500
                  !text-black
                  !font-bold
                  !border-none
                  transition-all
                  duration-300
                  hover:scale-[1.02]
                "
              >
                {t("Send Message")}
              </Button>
            </Form>
          </Col>
        </Row>
      </div>
    </section>
=======
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
>>>>>>> da2b565ddce62cf2ce9831f0f10f7286ea54c8f2
  );
};

export default ContactPage;
