import React, { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';

 const logo = import.meta.env.VITE_LOGO_URL;
import { Avatar, Button, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;

const UserLayout = ({ children }) => {
  const location = useLocation(); // Get current URL path
  const currentPath = location.pathname;

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  

  return (
    <Layout className='h-screen'>
   
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} className='!bg-cyan-500 !text-blue-500   flex justify-between items-center !px-5'>
          {/* <Avatar className='!text-2xl !bg-white !text-orange-500 !font-bold' size={60}
            src="/logo.png"
          >

          </Avatar> */}
          <div className="!w-full !flex !flex-col !justify-start !items-end !items-center ">
                    {currentPath == "/" && (
        <Button
          type="text"
          size="small"
          shape="round"
          style={{
            padding: "0 50px",
            height: 30,
            fontSize: 14,
            width: 50,
          }}
          className="!bg-blue-200 !shadow-sm shadow-black !font-bold !text-black hover:!bg-yellow-300 hover:!text-black"
          onClick={() =>navigate("/login")}
        >
          Login
        </Button>
      )}

      {/* Show Home button only if not on home page */}
      {(currentPath === "/login" || currentPath === "/about") &&(
        <Button
          type="text"
          size="small"
          shape="round"
          style={{
            padding: "0 50px",
            height: 30,
            fontSize: 14,
            width: 50,
          }}
          className="!bg-blue-200 !shadow-sm shadow-black !font-bold !text-black hover:!bg-yellow-300 hover:!text-black"
          onClick={() => navigate("/")}
        >
          Home
        </Button>
      )}
                  </div>
        
        </Header>
        <Content
          style={{
            margin: '0px 0px',
            padding: 1,
            minHeight: 280,
            // background: colorBgContainer,

          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
export default UserLayout;