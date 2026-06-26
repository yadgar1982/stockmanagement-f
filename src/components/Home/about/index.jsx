import React from "react";
import { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Row, Col, Typography, Card, Button } from "antd";
import { Typewriter } from "react-simple-typewriter";
import {
  GlobalOutlined,
  TeamOutlined,
  StockOutlined,
  EyeOutlined,
  AimOutlined,
  StarOutlined,
} from "@ant-design/icons";
import "./AboutUs.css"; // We'll add CSS for animations and gradients
import HomeLayout from "../../Shared/HomeLayout";
import Contact from "../contact/index";
const { Title, Paragraph } = Typography;
import { useTranslation } from "react-i18next";
const AboutUs = () => {
  const statsImages = ["/a.jpeg", "/b.jpeg", "/c.jpeg", "/d.jpeg"];

  const { t } = useTranslation("about");

  const products = [
    {
      image: "/a.jpeg",
      title: t("Naturally Sweet"),
      subtitle: t("Freshly Selected from the Finest Harvests"),
    },
    {
      image: "/b.jpeg",
      title: t("Rich in Nutrition"),
      subtitle: t("Packed with Natural Energy and Goodness"),
    },
    {
      image: "/c.jpeg",
      title: t("Exceptional Quality"),
      subtitle: t("Carefully Packed to Preserve Freshness"),
    },
    {
      image: "/d.jpeg",
      title: t("Taste of Nature"),
      subtitle: t("Pure, Fresh and Delicious Every Day"),
    },
  ];

  // slide show coding
const [slidesToShow, setSlidesToShow] = useState(3);

useEffect(() => {
  const updateSlides = () => {
    if (window.innerWidth < 768) {
      setSlidesToShow(1);
    } else if (window.innerWidth < 1024) {
      setSlidesToShow(2);
    } else {
      setSlidesToShow(3);
    }
  };

  updateSlides();
  window.addEventListener("resize", updateSlides);

  return () => window.removeEventListener("resize", updateSlides);
}, []);
  return (
    <HomeLayout>
      <div className="about-page md:px-0  ">
        {/* Hero Section */}

        {/* Content */}
        <section className="bg-black text-white px-5 " id="home">
          <div
            className="
              relative
              mt-15
              w-full
              h-[35vh]
              sm:h-[45vh]
              md:h-screen
              bg-[url('/home.png')]
              bg-cover
              bg-center
              bg-no-repeat
            "
          >
            {/* Optional dark overlay */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Typewriter */}
            <div className="absolute inset-0 flex items-center justify-center px-4 mt-30 md:mt-60 shadow-lg ">
              <h1 className=" text-2xl md:text-5xl font-bold text-yellow-400">
                <Typewriter
                  words={[
                    t("Premium Dried Fruits"),
                    t("Naturally Delicious"),
                    t("Healthy Every Day"),
                    t("Freshness You Can Trust"),
                    t("From Nature to Your Table"),
                  ]}
                  loop={0}
                  cursor
                />
              </h1>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}

        <section
          className="bg-gradient-to-b from-[#fdf8ef] to-[#f5efe0] py-20 px-6 md:px-20"
          id="vision"
        >
          <div className="text-center mb-14">
            <Title className="!text-4xl md:!text-5xl !font-bold !text-zinc-900">
              {t("Our Purpose")}
            </Title>

            <Paragraph className="!text-lg !text-zinc-600 !max-w-3xl !mx-auto">
              {t(
                "Guided by excellence, quality and integrity, we strive to deliver the finest dried fruits to customers.",
              )}
            </Paragraph>
          </div>

          <Row gutter={[40, 40]} justify="center">
            {/* Vision */}

            <Col xs={24} lg={12}>
              <Card
                bordered={false}
                className="
          !rounded-3xl
          !bg-white
          !shadow-xl
          hover:!shadow-yellow-500/20
          hover:-translate-y-2
          transition-all
          duration-500
          !p-6
          !border-t-4
          !border-yellow-500
        "
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                    <StarOutlined className="!text-yellow-600 !text-4xl" />
                  </div>
                </div>

                <Title level={3} className="!text-center !text-zinc-900 !mb-6">
                  {t("Our Vision")}
                </Title>

                <Paragraph className="!text-center !text-zinc-600 !leading-8 md:!text-lg">
                  {t(
                    "Our vision is to become the leading premium dried fruit brand internationally, renowned for unmatched quality, freshness, and natural flavor, enhancing the health and enjoyment of our customers",
                  )}
                </Paragraph>
              </Card>
            </Col>

            {/* Mission */}

            <Col xs={24} lg={12}>
              <Card
                bordered={false}
                className="
                !rounded-3xl
                !bg-white
                !shadow-xl
                hover:!shadow-yellow-500/20
                hover:-translate-y-2
                transition-all
                duration-500
                !p-6
                !border-t-4
                !border-yellow-500
              "
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AimOutlined className="!text-yellow-600 !text-4xl" />
                  </div>
                </div>

                <Title level={3} className="!text-center !text-zinc-900 !mb-6">
                  {t("Our Mission")}
                </Title>

                <Paragraph className="!text-center !text-zinc-600 !leading-8 md:!text-lg">
                  {t(
                    "Hadia Gold is committed to sourcing, selecting, and delivering the finest dried fruits with the highest standards of quality, precision, and integrity. Our mission is to provide products that combine superior taste, nutritional value, and consistent quality, making every bite a reliable and enjoyable experience for daily consumption or gifting.",
                  )}
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </section>
        {/* Stats Section */}

        <div className="bg-black py-20 px-4 md:px-10" id="product">
          <Title className=" !text-2xl md:!text-5xl !text-center  !text-yellow-500 !mb-3">
            {t("Our Premium Collection")}
          </Title>

          <Paragraph className="!text-center !text-gray-300 md:!text-xl !mb-12">
            {t("Carefully selected premium dried fruits")}
          </Paragraph>

          <Slider
            dots
            infinite
            arrows={false}
            autoplay
            autoplaySpeed={2500}
            speed={800}
            pauseOnHover
            slidesToShow={slidesToShow}
            slidesToScroll={1}
          >
            {products.map((product, index) => (
  <div key={index} className="px-4">
    <div className="relative overflow-hidden rounded-xl shadow-xl group h-[420px]">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 p-6">
        <h3 className="text-white text-2xl font-bold">
          {product.title}
        </h3>

        <p className="text-gray-200 mt-2">
          {product.subtitle}
        </p>
      </div>
    </div>
  </div>
))}
          </Slider>
        </div>

        {/* Core Values */}
        {/* About Us */}
        <div className="bg-[#F8F6EF] py-20 px-6 md:px-20" id="about">
          <Title
            level={2}
            className="!text-center !text-zinc-900 !font-bold !text-4xl md:!text-5xl !mb-16"
          >
            {t("About Us")}
          </Title>

          <Row gutter={[70, 30]} align="middle">
            {/* Left Image */}

            <Col xs={24} md={10}>
              <div className="overflow-hidden  w-[70%">
                <img
                  src="/a.jpeg"
                  alt="About Hadia Gold"
                  className="
                  w-[70%]
                  object-centered
                  transition-transform
                  duration-700
                  hover:scale-105
                "
                />
              </div>
            </Col>

            {/* Right Content */}

            <Col xs={24} md={14}>
              <Paragraph
                className="
          !text-zinc-700
          !text-base
          md:!text-lg
          !leading-8
          !text-justify
        "
              >
                {t(
                "Hadia Gold is a pioneering company in the supply of a wide variety of high-quality dried fruits, fully compliant with international standards. The company delivers its products to customers while strictly adhering to quality and freshness standards, ensuring that every product retains its superior taste, nutritional value, and freshness.Established in 2023 in Almaty, Kazakhstan, Hadia Gold operates with the goal of providing the highest quality products and services to its customers and citizens. The company is managed by an experienced team and effective leadership with decades of expertise in international trade.The CEO, Mr. Mohammad Dad, assures customers that using high-quality products at fair prices will establish a trustworthy, strong, and long-lasting relationship with Hadia Gold.The Hadia Gold team carefully selects and packages the finest dried fruits, ensuring that the highest standards are maintained from supplier to customer. Every nut, fruit, and seed is meticulously packaged to preserve its flavor, nutrition, and quality, providing a safe, healthy, and enjoyable experience.Hadia Gold is committed to bringing the best of nature to your table, delivering a reliable, high-quality, and delightful experience to every customer.",
              )}
              </Paragraph>

              <Paragraph
                className="
          !text-zinc-700
          !text-base
          md:!text-lg
          !leading-8
          !text-justify
        "
              >
                {t(
                  "The Hadia Gold team carefully selects and packages the finest dried fruits, ensuring that the highest standards are maintained from supplier to customer. Every product is prepared with care to preserve its flavor, nutrition, and freshness, delivering a safe, healthy, and enjoyable experience.",
                )}
              </Paragraph>

              {/* Features */}

              <Row gutter={[16, 16]} className="mt-10">
                <Col xs={24} sm={12}>
                  <div className="bg-white rounded-xl shadow p-4 font-semibold text-zinc-800">
                    ✅ {t("Premium Quality")}
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="bg-white rounded-xl shadow p-4 font-semibold text-zinc-800">
                    ✅ {t("International Standards")}
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="bg-white rounded-xl shadow p-4 font-semibold text-zinc-800">
                    ✅ {t("Fresh & Natural")}
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="bg-white rounded-xl shadow p-4 font-semibold text-zinc-800">
                    ✅ {t("Customer Satisfaction")}
                  </div>
                </Col>
              </Row>

              {/* Quote */}

              <div className="mt-10 border-l-4 border-yellow-500 pl-6">
                <p className="italic text-lg md:text-xl text-zinc-700">
                  {t(
                    "Bringing the best of nature to your table with quality you can trust.",
                  )}
                </p>
              </div>
            </Col>
          </Row>
        </div>

        <div className="!h-auto !w-full" id="contact">
          {/* Core Values */}
        

          <div className="!h-auto !w-full p-2">
            <Contact />
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default AboutUs;
