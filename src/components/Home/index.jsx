import React from "react";
import { Button, Typography } from "antd";
import HomeLayout from "../Shared/HomeLayout";

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <HomeLayout>
      <div
        className="!w-full !flex flex-col p-0 h-[97vh] p-4 bg-cover bg-center bg-no-repeat bg-[url('/home.jpg')] p-25 justify-start items-start"

      >
        <Title level={1} style={{ marginBottom: 20 }}
          className="!text-2xl !text-center md:!text-4xl !font-bold !text-yellow-500 !text-shadow-sm !text-shadow-black"
        >
          Welcome to Stock Manager Pro
        </Title>
        <div className="flex flex-col gap-16 ">
          <Paragraph className="!w-full !text-center md:!text-left !flex !flex-col !items-center !justify-center !text-lg font-bold md:!text-3xl !text-white !text-shadow-lg !text-shadow-black !hidden md:!block ">
          Effortlessly manage your inventory and stay on top of your business.<br />
          Click below to log in and get started.

          
        </Paragraph>
        <Button
            type="text"
            size="large"
            shape="round"
            style={{
              padding: "0 50px",
              height: 50,
              fontSize: 18,
              width:150,
              marginTop:40
              }}
            className="!bg-orange-400 !shadow-lg shadow-black !font-bold !text-white hover:!bg-orange-300 hover:!text-blue-400"
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </Button>
        </div>



      </div>

      <div className="w-full flex justify-center items-center p-3 bg-white height-[10vh]fixed bottom-0 left-0 border-t border-t-blue-200">
        Developped By Yadgar Tech
      </div>

    </HomeLayout>
  );
};

export default Home;
