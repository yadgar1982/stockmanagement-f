import React from "react";
import { Button, Typography } from "antd";
import HomeLayout from "../Shared/HomeLayout";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
<<<<<<< HEAD
import { Typewriter } from "react-simple-typewriter";
import { useTranslation } from "react-i18next";
const { Title, Paragraph } = Typography;

const Home = () => {
  const { t } = useTranslation("about");
  return (
    <HomeLayout>
      {/* Hero Section */}
      <div
        className="
      mb-5
      w-full
      h-[35vh]
      sm:h-[45vh]
      md:h-[70vh]
      bg-[url('/home1.png')]
      bg-cover
      bg-center
      bg-no-repeat
    "
      />

      {/* Content */}
      <section className="bg-black text-white -mt-5 md:py-5 px-5 !w-full h-150 md:h-100">
        <div className="max-w-5xl mx-auto flex  flex-col items-center text-center">
          <Button
            size="large"
            type="primary"
            className="
          !bg-yellow-500
          !text-black
          hover:!text-white
          !font-bold
          !rounded-full
          !border-none
          !px-5
          !h-8
          mt-9
          md:!h-10
          mb-5
          !text-base
          md:!text-lg
          !transition-all
          !duration-300
          !shadow
          !shadow-white
          hover:scale-105
          hover:!bg-rose-500
        "
            onClick={() => (window.location.href = "/about")}
          >
            {t("Explore Our Website")}
          </Button>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-zinc-200">
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
          </h2>

          <p className="mt-6 max-w-3xl text-gray-300 text-base md:text-lg leading-8 !w-full">
            {t(
              "Bringing you premium dried fruits with freshness and quality in every bite.",
            )}
          </p>
          
        </div>
      </section>

      {/* Footer */}
      <footer
      className="
      bg-black
      border-t
      border-yellow-500/40
      text-yellow-500
      py-5
      px-4
      fixed
      bottom-0
      w-full
    "
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center items-center gap-3 md:gap-12 text-sm md:text-base">
          <div className="flex items-center gap-2">
            <MailOutlined />
            hadiagroup2023@gmail.com
          </div>

          <div className="flex items-center gap-2">
            <PhoneOutlined />
            +7 (747) 420-3722
          </div>
        </div>
      </footer>
=======

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <HomeLayout>
      <div
        className="!w-full !h-[100vh] !flex !flex-col !justify-start !items-start !text-start !cursor-pointer !bg-cover !bg-center !bg-no-repeat !bg-[url('/home1.jpg')]  active:scale-95 transition-transform"
        onClick={() => window.open("/about", "_blank")}

      >

     
      <div className="flex flex-col gap-16 hidden md:flex flex-col mt-45 gap-16 w-full">
      </div>



      </div>

      <div className="w-full flex flex-col justify-center items-center bg-black !shadow !shadow-yellow-500 h-[7vh] fixed !bottom-0 left-0  text-yellow-500 flex-col font-semibold">
       <div> <MailOutlined/> - hadiagroup2023@gmail.com</div>
        
        <div><PhoneOutlined/> - 007-747-420-3722</div>


      </div>

>>>>>>> da2b565ddce62cf2ce9831f0f10f7286ea54c8f2
    </HomeLayout>
  );
};

export default Home;
