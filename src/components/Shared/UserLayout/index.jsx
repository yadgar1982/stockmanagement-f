import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBranding } from '../../../redux/slices/brandingSlice';
import { useSelector, useDispatch } from 'react-redux';
import {
  AuditOutlined,
  DollarOutlined,
  FileMarkdownOutlined,
  HomeOutlined,
  HomeTwoTone,
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

  const [collapsed, setCollapsed] = useState(true);
  const [isBroken, setIsBroken] = useState(false);


  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsBroken(window.innerWidth < 768);
    }
  }, []);

  const navigate = useNavigate();

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
          key: 'companyPayments',
          icon: <DollarOutlined className='!text-zinc-500 md:!text-xl' />,
          label: (
            <span className='text-zinc-500 font-semibold md:!text-lg'>
              Company
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
    {
      key: 'warehouse',
      icon: <HomeOutlined className='md:!text-xl !text-zinc-500 !font-semibold' />,
      label: <span className='md:!text-lg !text-zinc-500 font-semibold'>Ware House</span>,
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

      <Sider
        breakpoint="md"
        collapsedWidth={0}       // completely collapsed width
        trigger={null}           // we’ll use our own button
        collapsible
        collapsed={collapsed}
        // onBreakpoint={(broken) => {
        //   setIsBroken(broken);
        //   setCollapsed(broken);
        // }}
        className="!bg-zinc-200 "
        style={{
          position: 'fixed',      // overlay content
          zIndex: 1000,           // above everything
          height: '100vh',
          top: 0,
          left: 0,
          transition: 'all 0.3s', // smooth animation
        }}
      >
        {/* Logo + Always visible Collapse Button */}
        <div className="w-full flex items-center !shadow-sm !shadow-black justify-between px-3 !z-10 p-0.5 bg-[#B8860B]">
          <Avatar
            className="!text-2xl !bg-white !text-zinc-500 !font-bold"
            size={60}
            src={logo}
          />
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined className="!text-blue-100 !text-2xl" /> : <MenuFoldOutlined className="!text-blue-100 !text-2xl" />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 20,
              height: 20,
            }}
          />
        </div>

        {/* Menu Items */}
        <Menu
          className="!bg-zinc-200"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={items}
          onClick={(e) => {
            navigate(`/${e.key}`);
            // Auto-close on mobile
            if (isMobile) setCollapsed(true);
          }}
        />
      </Sider>


      <Layout>
        <Header style={{
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          zIndex: 100,
        }}
          className='!bg-[#B8860B] '>
          {collapsed && (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined className="!text-zinc-100 !text-2xl !ml-2" />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 20,
                height: 20,
              }}
            />
          )}
          <div className='flex w-full gap-3 !items-center justify-end '>
            <p className='text-white px-4 font-bold text-lg md:text-xl my-8'>{userInfo?.fullname}</p>
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
            minHeight: '95vh',
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