import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  TruckOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  TeamOutlined,
  DollarOutlined,
  BarChartOutlined,
  MailOutlined,
  SettingFilled,
  SettingOutlined,
  ProductOutlined,
  DashboardOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const siderWidth = 200; // default Sider width

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const items = [
    {
      key: 'admin',
      icon: <DashboardOutlined className='!text-zinc-500 md:!text-2xl' />,
      label: (
        <span className='text-zinc-500 font-semibold md:!text-lg'>
          Dashboard
        </span>
      ),
    },
    {
      key: 'branding',
      icon: <FileImageOutlined className='!text-zinc-500 md:!text-2xl ' />,
      label: (
        <span className='text-zinc-500 font-semibold md:!text-lg'>
          Branding
        </span>
      ),
    },
    {
      key: 'register',
      icon: <UserOutlined className='!text-zinc-500 md:!text-2xl' />,
      label: (
        <span className='text-zinc-500 font-semibold md:!text-lg'>
          User
        </span>
      ),
    },
    {
      key: '1',
      icon: < SettingOutlined className='md:!text-2xl !text-zinc-600' />,
      label: <span className='!text-zinc-600 md:!text-lg !font-semibold'>Settings</span>,
      children: [
        {
          key: 'product',
          icon: <ProductOutlined className='!text-zinc-500 md:!text-2xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Products
            </span>
          ),
        },
        {
          key: 'supplier',
          icon: <TruckOutlined className='!text-zinc-500 md:!text-2xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Supplier
            </span>
          ),
        },
        {
          key: 'customer',
          icon: <ShoppingCartOutlined className='!text-zinc-500 md:!text-2xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Customer
            </span>
          ),
        },
        {
          key: 'dealer',
          icon: <SolutionOutlined className='!text-zinc-500 md:!text-2xl ' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Dealer
            </span>
          ),
        },
        {
          key: 'company',
          icon: <TeamOutlined className='!text-zinc-500 md:!text-2xl ' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Company
            </span>
          ),
        },
        {
          key: 'currency',
          icon: <DollarOutlined className='!text-zinc-500 md:!text-2xl ' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Currency
            </span>
          ),
        },
        {
          key: 'stock',
          icon: <BarChartOutlined className='!text-zinc-500 md:!text-2xl ' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Stock
            </span>
          ),
        },
        {
          key: 'category',
          icon: <ProductOutlined className='!text-zinc-500 md:!text-2xl ' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Category
            </span>
          ),
        },

      ],
    },



  ];

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const logout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Fixed Sider */}
      <Sider
        width={siderWidth}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="md"
        onBreakpoint={(broken) => setCollapsed(broken)}
        trigger={null}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
        className="!bg-zinc-50 !border-r !border-zinc-200"
      >

        <div className="w-full flex items-center !shadow-sm !shadow-black justify-center !z-10 p-0.5 ">
          <Avatar
            className="!text-2xl !bg-white !text-orange-500 !font-bold"
            size={60}
            // src="/logo.png"
            icon={<UserOutlined />}
          />
        </div>

        <Menu
          className="!bg-transparent  "
          mode="inline"
          defaultSelectedKeys={['1']}
          items={items}
          onClick={(e) => navigate(`/${e.key}`)}
        />
      </Sider>

      {/* Main layout */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : siderWidth, 
          transition: 'margin-left 0.2s',
          minHeight: '100vh',
        }}
      >
        <Header
          style={{
            position: 'fixed',       
            top: 0,                  
            left: 0,                
            width: '100%',           
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(152, 135, 135, 0.1)',
            zIndex: 1000,            // Make sure it stays above content
          }}
          className='!bg-cyan-500 !shadow-sm !shadow-zinc-500'
        >
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined className="!text-white !text-2xl" />
              ) : (
                <MenuFoldOutlined className="!text-white !text-2xl" />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
          />

          <div className='flex  gap-3 items-center'>
            <p className='text-white font-bold md:text-xl'>{userInfo?.fullname}</p>
            <Button
              className="px-4 py-2 rounded-lg text-black font-bold 
                         bg-gradient-to-r from-[#D4AF37] to-[#F7E27A] 
                         hover:from-[#F7E27A] hover:to-[#D4AF37] 
                         transition-all duration-300"
              onClick={logout}
            >
              <span className='!text-lg text-cyan-700'>Logout</span>
              <LogoutOutlined />

            </Button>
          </div>
        </Header>

        <Content
          style={{
            margin: 0,
            padding: 8,
            paddingTop: 75,
            background: colorBgContainer,
            minHeight: 'calc(100vh - 64px)', // subtract header height

          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
