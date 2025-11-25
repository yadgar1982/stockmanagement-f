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
import { Avatar, Button, Divider, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;

const UserLayout = ({ children }) => {

  const logo = import.meta.env.VITE_LOGO_URL;
  const dispatch = useDispatch()
  const [controlledCollapsed, setControlledCollapsed] = useState(false);
  const [isBroken, setIsBroken] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsBroken(window.innerWidth < 768);
    }
  }, []);

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
      icon: <StockOutlined className='md:!text-xl !text-zinc-500 !font-semibold' />,
      label: <span className='md:!text-lg !text-zinc-500 font-semibold'>Inventory</span>,
    },
    {
      type: 'divider',
      key: 'divider-1',
    },
    {
      key: 'purchase',
      icon: < ShoppingCartOutlined className='md:!text-xl !text-zinc-500 font-semibold' />,
      label: <span className='md:!text-lg !text-zinc-500 font-semibold'>Purchase</span>,
    },
    {
      key: 'sales',
      icon: < ShopOutlined className='md:!text-xl !text-zinc-500 font-semibold' />,
      label: <span className='md:!text-lg !text-zinc-500 font-semibold'>Sales</span>,
    },
    {
      type: 'divider',
      key: 'divider-2',
    },
    {
      key: 'user',
      icon: < AuditOutlined className='md:!text-xl !text-zinc-500 font-semibold' />,
      label: <span className='md:!text-lg !text-zinc-500 font-semibold'>Reports</span>,
    },
    {
      type: 'divider',
      key: 'divider-3',
    },
    {
      key: '1',
      icon: < PayCircleOutlined className='md:!text-2xl !text-zinc-500' />,
      label: <span className='!text-zinc-500 md:!text-lg !font-semibold'>Payments</span>,
      children: [
        {
          key: 'supplierPayments',
          icon: <DollarOutlined className='!text-zinc-500 md:!text-xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Supplier
            </span>
          ),
        },
        {
          key: 'customerPayments',
          icon: <DollarOutlined className='!text-zinc-500 md:!text-xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Customer
            </span>
          ),
        },
        {
          key: 'dealerPayments',
          icon: <DollarOutlined className='!text-zinc-500 md:!text-xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Dealer
            </span>
          ),
        },
        {
          key: 'otherPayments',
          icon: <DollarOutlined className='!text-zinc-500 md:!text-xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Other
            </span>
          ),
        }
      ],
    },
  ]

  const logout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  }
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const avatar = userInfo.avatar;
  return (
    <Layout className='h-screen'>
      <Sider breakpoint="md"
        collapsedWidth={80}
        collapsed={controlledCollapsed}
        onBreakpoint={(broken) => {
          setIsBroken(broken);
          setControlledCollapsed(broken);
        }} className='!bg-zinc-200 !border-r !border-zinc-200 !border-sm'>

        <div className='w-full flex items-center !shadow-sm !shadow-black justify-center !z-10 p-0.5 bg-[#B8860B]'>
          <Avatar className='!text-2xl !bg-white !text-zinc-500 !font-bold' size={60}
            src={logo}
          >

          </Avatar>
        </div>
        <Menu
          className='!bg-zinc-200 '
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
          className='!bg-[#B8860B]'>
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
          <div className='flex  gap-3 items-center '>
            <p className='text-white font-bold md:text-xl'>{userInfo?.fullname}</p>
            <Button
              className="px-4 py-2 rounded-lg text-black font-bold 
                bg-gradient-to-r from-[#D4AF37] to-[#F7E27A] 
                hover:from-[#F7E27A] hover:to-[#D4AF37] 
                transition-all duration-300"
              onClick={logout}
            >
              <span className='!text-lg'>Logout</span>
              <LogoutOutlined />

            </Button>
          </div>

        </Header>
        <Content
          style={{
            margin: 0,
            padding: 0,
            minHeight: '81vh',
            backgroundImage: isMobile ? "url('/statement.jpg')" : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'width 0.2s',
          }}
        >
          {children}
        </Content>

      </Layout>
    </Layout>
  );
};
export default UserLayout;