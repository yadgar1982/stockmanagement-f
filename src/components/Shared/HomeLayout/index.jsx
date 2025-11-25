import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

 const logo = import.meta.env.VITE_LOGO_URL;
import { Avatar, Button, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;

const UserLayout = ({ children }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  

  return (
    <Layout className='h-screen'>
   
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} className='!bg-[#1192c7] !text-blue-500 !shadow-sm !shadow-black z-1 flex justify-between items-center !px-5'>
          <Avatar className='!text-2xl !bg-white !text-orange-500 !font-bold' size={60}
            src="/logo.png"
          >

          </Avatar>
       
        </Header>
        <Content
          style={{
            margin: '0px 0px',
            padding: 1,
            minHeight: 280,
            background: colorBgContainer,

          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
export default UserLayout;