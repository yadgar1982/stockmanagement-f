import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBranding } from '../../../redux/slices/brandingSlice';
import { useSelector, useDispatch } from 'react-redux';
import {
  AuditOutlined,
  DollarOutlined,
  FileMarkdownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PayCircleOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  StockOutlined,

} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;

const UserLayout = ({ children }) => {
  const dispatch = useDispatch()


  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();


  const { brandings, loading, error } = useSelector((state) => state.brandings)



  useEffect(() => {
    dispatch(fetchBranding())

  }, [])
  useEffect(() => {
    // save to localStorage **after brandings are loaded**
    if (brandings && brandings.length > 0) {
      localStorage.setItem("branding", JSON.stringify(brandings));
      console.log("Saved to localStorage:", brandings);
    }
  }, [brandings]);

  const items = [
    {
      key: 'inventory',
      icon: <StockOutlined className='md:!text-xl !text-purple-500 !font-semibold' />,
      label: <span className='md:!text-lg !text-purple-500 font-semibold'>Inventory</span>,
    },
    {
      type: 'divider', // This will render a divider
      key: 'divider-1', // unique key for the divider
    },
    {
      key: 'purchase',
      icon: < ShoppingCartOutlined className='md:!text-xl !text-purple-500 font-semibold' />,
      label: <span className='md:!text-lg !text-purple-500 font-semibold'>Purchase</span>,
    },
    {
      key: 'sales',
      icon: < ShopOutlined className='md:!text-xl !text-purple-500 font-semibold' />,
      label: <span className='md:!text-lg !text-purple-500 font-semibold'>Sales</span>,
    },
    {
      type: 'divider', // This will render a divider
      key: 'divider-2', // unique key for the divider
    },
    {
      key: 'user',
      icon: < AuditOutlined className='md:!text-xl !text-purple-500 font-semibold' />,
      label: <span className='md:!text-lg !text-purple-500 font-semibold'>Reports</span>,
    },
    {
      key: '1',
      icon: < PayCircleOutlined className='md:!text-2xl !text-zinc-800' />,
      label: <span className='!text-zinc-800 md:!text-lg !font-semibold'>Payments</span>,
      children: [
        {
          key: 'supplierPayments',
          icon: <DollarOutlined className='!text-zinc-500 md:!text-2xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Supplier Payments
            </span>
          ),
        },
        {
          key: 'customerPayments',
          icon: <DollarOutlined className='!text-zinc-500 md:!text-2xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Customer Payments
            </span>
          ),
        },
        {
          key: 'dealerPayments',
          icon: <DollarOutlined className='!text-zinc-500 md:!text-2xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Dealer Payments
            </span>
          ),
        },
        {
          key: 'otherPayments',
          icon: <DollarOutlined className='!text-zinc-500 md:!text-2xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Other Payments
            </span>
          ),
        }
      ],
    },
  ]

  const logout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  }
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const avatar = userInfo.avatar;
  return (
    <Layout className='h-screen'>
      <Sider trigger={null} collapsible collapsed={collapsed} className='!bg-zinc-100 !border-r !border-zinc-200 !border-sm'>
        <div className="demo-logo-vertical" />
        <div className='w-full flex items-center !shadow-sm !shadow-black justify-center !z-10 p-0.5 bg-purple-400'>
          <Avatar className='!text-2xl !bg-white !text-purple-500 !font-bold' size={60}
            src={avatar ? avatar : "./logo.jpg"}
          >

          </Avatar>
        </div>
        <Menu
          className='!bg-zinc-100 '
          mode="inline"
          defaultSelectedKeys={['1']}
          items={items}
          onClick={(e) => navigate(`/${e.key}`)}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          zIndex: 20,
        }}
          className='!bg-blue-900'>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined className='!text-blue-100 !text-2xl' /> : <MenuFoldOutlined className='!text-blue-100 !text-2xl' />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 45,
              height: 64,
            }}
          />
          <Button
            className="!bg-blue-500 !border-none !text-white !text-2xl !w-30 !h-8 !rounded-full !font-bold"
            onClick={() => navigate('/')}
          >
            <span className='!text-lg'>Logout</span>
            <LogoutOutlined />
          </Button>
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