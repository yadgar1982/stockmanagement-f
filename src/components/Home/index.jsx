import React from "react";
import { Button, Typography } from "antd";
import HomeLayout from "../Shared/HomeLayout";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";

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

    </HomeLayout>
  );
};

export default Home;
