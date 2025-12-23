import React from "react";
import { Row, Col, Typography, Card, Button } from "antd";
import { GlobalOutlined, TeamOutlined, StockOutlined } from "@ant-design/icons";
import "./AboutUs.css"; // We'll add CSS for animations and gradients
import HomeLayout from "../../Shared/HomeLayout";
const { Title, Paragraph } = Typography;

const AboutUs = () => {
  return (

    <HomeLayout>
      <div className="about-page md:px-10 " >

        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-overlay" />
          <div className="hero-content !w-full !h-[95vh] !bg-cover !bg-center cursor-pointer !bg-no-repeat !bg-[url('/home.jpg')] " onClick={() => window.open("/contact", "_blank")}>
          
          </div>

        </div>

        {/* Vision & Mission */}
        <div className="section-padding section-gradient">
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={12}>
              <Card className="hover-card !bg-cyan-900 md:!h-80">

                <Title level={3} className="!text-[#FFD700] md:!text-2xl">Our Vision</Title>
                <Paragraph className="!text-white md:!text-xl">
                  To become Kazakhstan’s most trusted gateway for global trade, connecting businesses worldwide with reliable, high-quality products and fostering sustainable economic growth.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="hover-card !bg-cyan-900 md:!h-80">
                <Title level={3} className="!text-[#FFD700] md:!text-2xl">Our Mission</Title>
                <Paragraph className="!text-white md:!text-xl">
                  Facilitate seamless and transparent import-export operations with efficiency and professionalism.

                  Deliver high-quality goods to international markets while ensuring timely and secure transactions.

                  Build lasting partnerships with suppliers and clients by prioritizing trust, integrity, and mutual growth.

                  Leverage innovation and global market insights to expand trade opportunities for Kazakhstan and beyond.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Core Values */}
        <div className="section-padding core-values">
          <Title level={2} style={{ textAlign: "center", marginBottom: 20 }} className="!text-[#FFD700] !font-bold !text-4xl">Our Core Values</Title>
          <Paragraph style={{ textAlign: "center", maxWidth: 800, margin: "0 auto" }} className="!text-zinc-200 !text-xl ">
            Integrity, reliability, innovation, customer satisfaction, and sustainable growth guide every decision we make at Hadia Gold Group.
          </Paragraph>
        </div>

        {/* Stats Section */}
        <div className="section-padding stats-section">
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={8}>
              <Card className="stats-card">
                <StockOutlined className="stats-icon" />
                <Title level={3}>50+</Title>
                <Paragraph>Countries Exported To</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="stats-card">
                <TeamOutlined className="stats-icon" />
                <Title level={3}>200+</Title>
                <Paragraph>Business Partners Worldwide</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="stats-card">
                <GlobalOutlined className="stats-icon" />
                <Title level={3}>10+</Title>
                <Paragraph>Years of Experience</Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </HomeLayout>
  );
};

export default AboutUs;
