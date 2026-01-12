import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Row, Col, Typography, Card, Button } from "antd";
import { GlobalOutlined, TeamOutlined, StockOutlined } from "@ant-design/icons";
import "./AboutUs.css"; // We'll add CSS for animations and gradients
import HomeLayout from "../../Shared/HomeLayout";
import Contact from '../contact/index'
const { Title, Paragraph } = Typography;
import { useTranslation } from 'react-i18next';
const AboutUs = () => {

const statsImages = [
    "/a.jpeg",
    "/b.jpeg",
    "/c.jpeg",
    "/d.jpeg",
  ];

  const { t } = useTranslation('about');
  return (

    <HomeLayout>
      <div className="about-page md:px-0  " >

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
              <Card className="hover-card !bg-[#e0ddcb] md:!h-80">

                <Title level={3} className="!text-zinc-900 md:!text-2xl">{(t("Our Vision"))}</Title>
                <Paragraph className="!text-zinc-900 md:!text-xl">
                  {(t("Our vision is to become the leading premium dried fruit brand internationally, renowned for unmatched quality, freshness, and natural flavor, enhancing the health and enjoyment of our customers"))}
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="hover-card !bg-[#e0ddcb] md:!h-80">
                <Title level={3} className="!text-zinc-900 md:!text-2xl">{(t("Our Mission"))}</Title>
                <Paragraph className="!text-zinc-900 md:!text-xl">
                  {(t("Hadia Gold is committed to sourcing, selecting, and delivering the finest dried fruits with the highest standards of quality, precision, and integrity. Our mission is to provide products that combine superior taste, nutritional value, and consistent quality, making every bite a reliable and enjoyable experience for daily consumption or gifting."))}
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Core Values */}
        <div className="section-padding core-values !w-full  !bg-[#e0ddcb] md:!px-60 ">
          <Title level={2} className="!text-zinc-900 !font-bold !text-4xl md:ml-5">{(t("About Us"))}</Title>
          <Paragraph style={{ textAlign: "justify", margin: "0 auto", width: "100%", padding: 20 }} className="!text-zinc-900!w-full !text-sm md:!text-xl ">
            {(t("Hadia Gold is a pioneering company in the supply of a wide variety of high-quality dried fruits, fully compliant with international standards. The company delivers its products to customers while strictly adhering to quality and freshness standards, ensuring that every product retains its superior taste, nutritional value, and freshness.Established in 2023 in Almaty, Kazakhstan, Hadia Gold operates with the goal of providing the highest quality products and services to its customers and citizens. The company is managed by an experienced team and effective leadership with decades of expertise in international trade.The CEO, Mr. Mohammad Dad, assures customers that using high-quality products at fair prices will establish a trustworthy, strong, and long-lasting relationship with Hadia Gold.The Hadia Gold team carefully selects and packages the finest dried fruits, ensuring that the highest standards are maintained from supplier to customer. Every nut, fruit, and seed is meticulously packaged to preserve its flavor, nutrition, and quality, providing a safe, healthy, and enjoyable experience.Hadia Gold is committed to bringing the best of nature to your table, delivering a reliable, high-quality, and delightful experience to every customer."))}
          </Paragraph>
        </div>

        {/* Stats Section */}
        <div className="!section-padding !stats-section !bg-black !py-5 !px-9">
          <Slider
            dots={true}
            infinite={true}
            speed={500}
            slidesToShow={3}
            slidesToScroll={1}
            autoplay={true}
            autoplaySpeed={3000}
            responsive={[
              {
                breakpoint: 1024,
                settings: { slidesToShow: 3 },
              },
              {
                breakpoint: 768,
                settings: { slidesToShow: 2 },
              },
              {
                breakpoint: 480,
                settings: { slidesToShow: 1 },
              },
            ]}
          >
            {statsImages.map((img, idx) => (
              <div key={idx} className="!px-2">
                <Card
                  className="stats-card !w-full !h-72 !bg-cover !bg-center cursor-pointer !bg-no-repeat hover:!shadow-2xl transition-all duration-500"
                  style={{ backgroundImage: `url(${img})` }}
                />
              </div>
            ))}
          </Slider>
        </div>
       <div className="!h-auto">
         <Contact />
       </div>
      </div>
    </HomeLayout>
  );
};

export default AboutUs;
