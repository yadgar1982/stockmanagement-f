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
  DashboardOutlined
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
          key: 'branding',
          icon: <LogoutOutlined className='!text-zinc-500 md:!text-2xl ' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Branding
            </span>
          ),
        }
      ],
    },



  ];

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const avatar = userInfo.avatar;

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
        <div className="w-full flex items-center justify-center p-1 bg-zinc-300">
          <Avatar
            className="!text-2xl !bg-white !text-orange-500 !font-bold"
            size={55}
            src={avatar}
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
          marginLeft: collapsed ? 80 : siderWidth, // 👈 offset content based on collapsed state
          transition: 'margin-left 0.2s', // smooth animation
          minHeight: '100vh',
        }}
      >
        <Header
          style={{
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            zIndex: 20,
          }}
          className='!bg-zinc-300'
        >
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined className="!text-yellow-900 !text-2xl" />
              ) : (
                <MenuFoldOutlined className="!text-yellow-900 !text-2xl" />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
          />

          <Button
            className="!bg-green-500 !border-none !text-white !text-2xl !w-30 !h-8 !rounded-full !font-bold"
            onClick={() => navigate('/')}
          >
            <span className='!text-lg'>Logout</span>
            <LogoutOutlined />
          </Button>
        </Header>

        <Content
          style={{
            margin: 0,
            padding: 16,
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
