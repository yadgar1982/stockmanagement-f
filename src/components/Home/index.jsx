import React from "react";
import { Button, Typography } from "antd";
import HomeLayout from "../Shared/HomeLayout";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <HomeLayout>
      <div
        className="!w-full !h-[85vh] !flex !flex-col !justify-start !items-start !text-start !cursor-pointer !bg-cover !bg-center !bg-no-repeat !bg-[url('/home1.jpg')] p-4 active:scale-95 transition-transform"
        onClick={() => window.open("/about", "_blank")}

      >
        
       
        
         <div className=" !flex !flex-col !justify-start md:!items-start md:ml-15 md:mt-25 md:!hidden cursor-pointer">
            <Button
              type="primary"
           
              shape="round"
              style={{
                padding: "0 25px",
                height: 25,
                fontSize: 14,
                fontWeight: 300,
                borderRadius: 8,
                background: "linear-gradient(90deg, #ff7f50, #ff4500)", 
                color: "#fff",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
              }}
              className="hover:scale-105 hover:shadow-xl hover:opacity-90"
              onClick={() => window.open("/about", "_blank")}
            >
              See Who We Are
            </Button>
          </div>
        <div className="flex flex-col gap-16 hidden md:flex flex-col mt-45 gap-16 w-full">
          
         
          
        </div>



      </div>

      <div className="w-full flex justify-center items-center p-3 bg-zinc-600 height-[15vh]fixed bottom-0 left-0  text-zinc-100 flex-col font-semibold">
        <span><MailOutlined className="!text-yellow-300 !font-bold" />   : hadiagold@gmail.com</span>

        <span><PhoneOutlined className="!text-yellow-300 !font-bold" />   : +9999999999<br /></span>


      </div>

    </HomeLayout>
  );
};

export default Home;
