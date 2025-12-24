import React from "react";
import { Row, Col, Typography, Card, Button } from "antd";
import { GlobalOutlined, TeamOutlined, StockOutlined } from "@ant-design/icons";
import "./AboutUs.css"; // We'll add CSS for animations and gradients
import HomeLayout from "../../Shared/HomeLayout";
import Contact from '../contact/index'
const { Title, Paragraph } = Typography;

const AboutUs = () => {
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

                <Title level={3} className="!text-[#FFD700] md:!text-2xl">Our Vision</Title>
                <Paragraph className="!text-white md:!text-xl">
                  To be the leading premium dry fruit brand in Kazakhstan and beyond, renowned for uncompromising quality, freshness, and the natural goodness we deliver to every table.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="hover-card !bg-cyan-700 md:!h-80">
                <Title level={3} className="!text-[#FFD700] md:!text-2xl">Our Mission</Title>
                <Paragraph className="!text-white md:!text-xl">
                  Hadia Gold is dedicated to sourcing, selecting, and delivering the finest dry fruits with care, integrity, and excellence. We strive to enhance the health and enjoyment of our customers through products that combine superior taste, nutrition, and consistent quality, making every bite a trusted experience—whether for daily consumption or gifting.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Core Values */}
        <div className="section-padding core-values !w-full bg-zinc-500 !bg-cyan-700 ">
          <Title level={2} style={{ textAlign: "center", marginBottom: 20 }} className="!text-[#FFD700] !font-bold !text-4xl">About Us</Title>
          <Paragraph style={{ textAlign: "justify", maxWidth: 1100, margin: "0 auto", width: "100%" }} className="!text-white !w-full !text-sm md:!text-xl ">
            Hadia Gold is a premium supplier of high-quality dry fruits, dedicated to delivering freshness, taste, and health in every product. Established in Almaty, Kazakhstan in 2023, the company operates with a strong commitment to quality, integrity, and customer satisfaction.

            Under the leadership of our Director, Alidad Mohammad Dad, who officially assumed his role on May 10, 2024, Hadia Gold ensures that all financial, banking, and operational processes are conducted with transparency and excellence. Our team carefully selects and sources only the finest dry fruits, maintaining the highest standards from supplier to customer.

            At Hadia Gold, we are committed to bringing nature’s best to your table—every nut, fruit, and seed is packed with care, flavor, and nutrition. Whether for daily consumption or gifting, our products are crafted to deliver both taste and quality you can trust.
          </Paragraph>
        </div>

        {/* Stats Section */}
        <div className="section-padding stats-section !bg-black">
          <Row gutter={[32, 32]} justify="center">
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
