import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { TabBar } from "antd-mobile";
import { StarOutline, UserOutline } from "antd-mobile-icons";
import { FaGraduationCap } from "react-icons/fa";
import { CgLoadbarDoc } from "react-icons/cg";
import PostDetail from './pages/Quan/PostDetail'
import Xqing from './pages/Quan/Xqing'
import { useDispatch } from 'react-redux'
import { setCurrentUser as setCollectUser } from './store/collect'
import { setCurrentUser as setWrongUser } from './store/wrong'
import Router from './router'
import './App.css'

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch()

  // 获取当前路径的主段（第一段），默认为 'study'
  const getMainPath = (path) => {
    const pathSegments = path.split("/").filter(Boolean);
    return pathSegments[0] || "study";
  };

  const [activeKey, setActiveKey] = useState(getMainPath(location.pathname));

  // 监听路由变化
  useEffect(() => {
    setActiveKey(getMainPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    // 检查用户是否已登录
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // 从token中获取用户ID
        const userData = JSON.parse(token);
        // console.log(userData)
        const userId = userData._id;
        console.log(userId)
        
        if (!userId) {
          throw new Error('Token中缺少用户ID');
        }

        // 初始化收藏和错题本的用户ID
        dispatch(setCollectUser(userId));
        dispatch(setWrongUser(userId));
      } catch (error) {
        console.error('初始化用户数据失败：', error);
        // 如果token无效，清除它
        localStorage.removeItem('token');
        // 跳转到登录页
        navigate('/login');
      }
    }
  }, [dispatch, navigate]);

  const tabs = [
    {
      key: "study",
      title: "学习",
      icon: <FaGraduationCap />,
    },
    {
      key: "jing",
      title: "精选",
      icon: <StarOutline />,
    },
    {
      key: "quan",
      title: "圈子",
      icon: <CgLoadbarDoc />,
    },
    {
      key: "mine",
      title: "我的",
      icon: <UserOutline />,
    },
  ];

  const jump = (key) => {
    navigate(`/${key}`); // 确保导航到正确的路径
    setActiveKey(key);
  };

  return (
    <div style={{ paddingBottom: "50px", height: "100%" }}>
      <div style={{ paddingBottom: "50px" }}>
        <Outlet />
      </div>
      <TabBar
        style={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          height: "50px",
          backgroundColor: "#fff",
          zIndex: 1000,
        }}
        onChange={jump}
        activeKey={activeKey}
      >
        {tabs.map((tab) => (
          <TabBar.Item
            key={tab.key}
            icon={tab.icon}
            title={tab.title}
            selected={activeKey === tab.key}
          />
        ))}
      </TabBar>
    </div>
  );
}
