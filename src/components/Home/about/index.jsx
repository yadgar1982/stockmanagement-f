import React from "react";
import { Row, Col, Typography, Card, Button } from "antd";
import { GlobalOutlined, TeamOutlined, StockOutlined } from "@ant-design/icons";
import "./AboutUs.css"; // We'll add CSS for animations and gradients
import HomeLayout from "../../Shared/HomeLayout";
import Contact from '../contact/index'
const { Title, Paragraph } = Typography;
import { useTranslation } from 'react-i18next';
const AboutUs = () => {
   const { t } = useTranslation('about');
  return (

    <HomeLayout>
      <div className="about-page md:px-10  " >

        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-overlay" />
          <div className="hero-content !w-full !h-[80vh] !bg-cover !bg-center cursor-pointer !bg-no-repeat !bg-[url('/home.jpg')] ">

          </div>

        </div>

        {/* Vision & Mission */}
        <div className="section-padding section-gradient">
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={12}>
              <Card className="hover-card !bg-cyan-700 md:!h-80">

                <Title level={3} className="!text-[#FFD700] md:!text-2xl">{(t("Our Vision"))}</Title>
                <Paragraph className="!text-white md:!text-xl">
                  {(t("Our vision is to become the leading premium dried fruit brand internationally, renowned for unmatched quality, freshness, and natural flavor, enhancing the health and enjoyment of our customers"))}
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="hover-card !bg-cyan-700 md:!h-80">
                <Title level={3} className="!text-[#FFD700] md:!text-2xl">{(t("Our Mission"))}</Title>
                <Paragraph className="!text-white md:!text-xl">
                  {(t("Hadia Gold is committed to sourcing, selecting, and delivering the finest dried fruits with the highest standards of quality, precision, and integrity. Our mission is to provide products that combine superior taste, nutritional value, and consistent quality, making every bite a reliable and enjoyable experience for daily consumption or gifting."))}
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Core Values */}
        <div className="section-padding core-values !w-full bg-zinc-500 !bg-cyan-700 ">
          <Title level={2}  className="!text-[#FFD700] !font-bold !text-4xl">{(t("About Us"))}</Title>
          <Paragraph style={{ textAlign: "justify", margin: "0 auto", width: "100%" }} className="!text-white !w-full !text-sm md:!text-xl ">
            {(t("Hadia Gold is a pioneering company in the supply of a wide variety of high-quality dried fruits, fully compliant with international standards. The company delivers its products to customers while strictly adhering to quality and freshness standards, ensuring that every product retains its superior taste, nutritional value, and freshness.Established in 2023 in Almaty, Kazakhstan, Hadia Gold operates with the goal of providing the highest quality products and services to its customers and citizens. The company is managed by an experienced team and effective leadership with decades of expertise in international trade.The CEO, Mr. Mohammad Dad, assures customers that using high-quality products at fair prices will establish a trustworthy, strong, and long-lasting relationship with Hadia Gold.The Hadia Gold team carefully selects and packages the finest dried fruits, ensuring that the highest standards are maintained from supplier to customer. Every nut, fruit, and seed is meticulously packaged to preserve its flavor, nutrition, and quality, providing a safe, healthy, and enjoyable experience.Hadia Gold is committed to bringing the best of nature to your table, delivering a reliable, high-quality, and delightful experience to every customer."))}
          </Paragraph>
        </div>

        {/* Stats Section */}
        <div className="section-padding stats-section !bg-blue-100">
          <Row gutter={[25, 32]} justify="center">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card className="stats-card !w-full !h-72 !bg-cover !bg-center cursor-pointer !bg-no-repeat !bg-[url('/a.jpeg')] "></Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card className="stats-card !w-full !h-72 !bg-cover !bg-center cursor-pointer !bg-no-repeat !bg-[url('/b.jpeg')] "></Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card className="stats-card !w-full !h-72 !bg-cover !bg-center cursor-pointer !bg-no-repeat !bg-[url('/c.jpeg')] "></Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card className="stats-card !w-full !h-72 !bg-cover !bg-center cursor-pointer !bg-no-repeat !bg-[url('/d.jpeg')] "></Card>
            </Col>
          </Row>
        </div>
        <Contact />
      </div>
    </HomeLayout>
  );
};

export default AboutUs;
