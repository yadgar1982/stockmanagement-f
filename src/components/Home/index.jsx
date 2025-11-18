import React from "react";
import { Button, Typography } from "antd";
import HomeLayout from "../Shared/HomeLayout";

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <HomeLayout>
      <div
        className="p-0 h-[97vh] p-4 bg-cover bg-center bg-no-repeat bg-[url('/home.jpg')] p-25"
        // style={{
        //   height: "84vh",
        //   display: "flex",
        //   flexDirection: "column",
        //   justifyContent: "center",
        //   alignItems: "center",
        //   background: "linear-gradient(to right, #f0f2f5, #e6f7ff)",
        //   textAlign: "center",
        //   padding: "40px 20px",
        // }}
      >
        <Title level={1} style={{ marginBottom: 20 }}
          className="!text-4xl !font-bold !text-zinc-100"
        >
          Welcome to Stock Manager Pro
        </Title>
        <Paragraph style={{ fontSize: "18px", maxWidth: 600, color:"white"}}>
          Effortlessly manage your inventory and stay on top of your business.
          Click below to log in and get started.
        </Paragraph>

        <Button
          type="text"
          size="large"
          shape="round"
          style={{
            marginTop: 30,
            padding: "0 50px",
            height: 50,
            fontSize: 18,
          }}
          className="!bg-orange-400  !mt-9 !shadow-lg shadow-black !font-bold !text-white hover:!bg-orange-300 hover:!text-purple-400"
          onClick={() => (window.location.href = "/login")}
        >
          Login
        </Button>

      </div>

      <div className="w-full flex justify-center items-center p-3 bg-white height-[10vh]fixed bottom-0 left-0 border-t border-t-blue-200">
        Developped By Yadgar Tech
      </div>

    </HomeLayout>
  );
};

export default Home;
