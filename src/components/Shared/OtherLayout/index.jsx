import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBranding } from '../../../redux/slices/brandingSlice';
import { useSelector, useDispatch } from 'react-redux';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DollarOutlined,
  HomeOutlined,
  LogoutOutlined,

} from '@ant-design/icons';
import { Avatar, Button, Divider, Layout, Menu, theme } from 'antd';
const { Header, Sider, Content } = Layout;

const OtherLayout = ({ children }) => {
  const navigate=useNavigate()
  const [collapsed, setCollapsed] = useState(false);
  const [isBroken, setIsBroken] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const logo = import.meta.env.VITE_LOGO_URL;
  const dispatch = useDispatch()


const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile) setCollapsed(true); // auto close on mobile
  };

  handleResize(); // run on mount
  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);
 
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
   
    // {
    //       key: 'mystatement',
    //       icon: <DollarOutlined className='!text-zinc-800 md:!text-[12px' />,
    //       label: (
    //         <span className='!text-zinc-900 font-semibold md:!text-[12px'>
              
    //         </span>
    //       ),
    //     },
    {
      type: 'divider',
      key: 'divider-4',
    },
   
  ]

  const logout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  }
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const avatar = userInfo.avatar;
  return (
    <Layout style={{ minHeight: "100vh" }}>
     <Sider
  trigger={null}
  collapsible
  collapsed={collapsed}
  collapsedWidth={isMobile ? 0 : 80}
  width={200}
  breakpoint="md"
  className="!bg-zinc-400"
  style={{
    position: isMobile ? "fixed" : "relative",
    height: "100vh",
    left: 0,
    top: 0,
    zIndex: 200,
  }}
>

        <div className="w-full flex items-center !shadow-sm !shadow-zinc-100 justify-between px-3 !z-10 p-0.5 bg-zinc-800">
          <Avatar
            className="!text-2xl !bg-white !text-zinc-900 !font-bold"
            size={60}
            src={logo}
          />
          {!collapsed && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined className="!text-white !text-2xl" /> : <MenuFoldOutlined className="!text-blue-100 !text-2xl" />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 20,
                height: 20,
              }}
            />
          )}
        </div>
        <Menu
          className='!bg-zinc-400'
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
          padding: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          zIndex: 100,
        }} className='!bg-zinc-800 !shadow-sm !shadow-zinc-100 '
        >
          {collapsed && (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined className="!text-white  !text-2xl !ml-10" />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 20,
                height: 20,
              }}
            />
          )}
          <div className='flex w-full gap-3 !items-center justify-end '>
            <Avatar className='!h-7 !bg-transparent !text-white px-4 font-bold text-[12px] md:text-xl !w-auto !justify-center !items-center !px-5 !h-8px  !hidden md:!block'>{userInfo?.fullname}</Avatar>
            <Button
              className="px-2  !rounded-none text-black !font-bold 
                bg-transparent
                hover:from-[#F7E27A] hover:to-[#D4AF37] 
                transition-all duration-300"
              onClick={logout}
            >
              <span className='!text-sm !font-semibold'>Logout</span>
              <LogoutOutlined />

            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: '1px 1px',
            padding: 1,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 0,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
export default OtherLayout;