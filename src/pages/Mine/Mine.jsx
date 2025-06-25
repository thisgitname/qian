import React, { memo, useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { 
  ClockCircleOutlined,
  UserOutlined,
  UnorderedListOutlined,
  BookOutlined,
  IdcardOutlined,
  ShoppingOutlined,
  QuestionCircleOutlined,
  EnvironmentOutlined,
  MessageOutlined,
  BellOutlined,
  SettingOutlined,
  SwapOutlined
} from '@ant-design/icons'
import styles from './Mine.module.css'

// Constants
const MENU_ITEMS = [
  { icon: UserOutlined, text: '我的班级', path: '/myClass' },
  { icon: ClockCircleOutlined, text: '我的预约', path: '/res' },
  { icon: UnorderedListOutlined, text: '考试记录', path: '/kaoji' },
  { icon: BookOutlined, text: '学习记录', path: '/studyji' },
]

const TOOL_ITEMS = [
  { icon: IdcardOutlined, text: '个人资料',path:"/profile" },
  { icon: ShoppingOutlined, text: '我的订单',path:"/dingdan" },
  { icon: QuestionCircleOutlined, text: '帮助指南',path:'/ai'},
  { icon: EnvironmentOutlined, text: '我的地址',path:"/address" },
  { icon: MessageOutlined, text: '意见反馈', path: '/feedback' },
  { icon: BellOutlined, text: '消息中心', path: '/tell' },
  { icon: SettingOutlined, text: '设置',path:"/setting" }
]

// Memoized Components
const MenuItem = memo(({ icon: Icon, text, path, onClick }) => (
  <div className={styles.menuItem} onClick={onClick}>
    <Icon className={styles.menuIcon} />
    <span className={styles.menuText}>{text}</span>
  </div>
))

const ToolItem = memo(({ icon: Icon, text, path, onClick }) => (
  <div className={styles.toolItem} onClick={onClick}>
    <Icon className={styles.toolIcon} />
    <span className={styles.toolText}>{text}</span>
  </div>
))

const Mine = () => {
  const navigate = useNavigate()
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  const [username, setusername] = useState(userInfo.name)
  const [jifen, setJifen] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  let user=JSON.parse(localStorage.getItem("token"))
  const handleNavigation = useCallback((path) => {
    if (path) {
      navigate(path)
    }
  }, [navigate])

  useEffect(() => {
    const userid = localStorage.getItem('user');
    if (!userid) {
      setError('请先登录');
      setLoading(false);
      return;
    }
    const fetchUserJifen = async () => {
      try {
        const res = await window.axios
          ? window.axios.get('http://localhost:3000/ss/jifen/total', {
              params: { userid },
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            })
          : await import('axios').then(({ default: axios }) =>
              axios.get('http://localhost:3000/ss/jifen/total', {
                params: { userid },
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
              })
            );
        if (res.data && res.data.code === 200) {
          setJifen(res.data.total || 0);
        } else {
          setJifen(0);
        }
      } catch (err) {
        setJifen(0);
      } finally {
        setLoading(false);
      }
    };
    fetchUserJifen();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>个人中心</header>
      
      <section className={styles.userInfo}>
        <img 
          src={userInfo.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
          alt="用户头像" 
          className={styles.avatar}
          loading="lazy"
          onError={e => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'; }}
        />
        <div className={styles.userContent}>
          <h1 className={styles.userName}>{userInfo.name}</h1>
          <p className={styles.userDesc}>指起袖子加油干</p>
        </div>
        <div className={styles.calendarIcon}>
          <div className={styles.iconCircle}>
            <ClockCircleOutlined />
          </div>
        </div>
      </section>

      <section className={styles.courseCard}>
        <div className={styles.courseMain}>
          <h2 className={styles.courseName}>文史学</h2>
          <p className={styles.courseDate}>课程截止时间：2023-01-18</p>
        </div>
        <div className={styles.courseArrow}>
          <SwapOutlined rotate={90} />
        </div>
      </section>

      <section className={styles.menuGrid}>
        {MENU_ITEMS.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            text={item.text}
            path={item.path}
            onClick={() => handleNavigation(item.path)}
          />
        ))}
      </section>

      <section className={styles.pointsCard}>
        <div className={styles.pointsInfo}>
          <p className={styles.pointsLabel}>积分：</p>
          <h2 className={styles.points}>{loading ? '...' : jifen}</h2>
          <p className={styles.pointsDesc}>每天学习可获得20积分</p>
        </div>
        <button 
          className={styles.exchangeButton}
          onClick={() => handleNavigation('/myjifen')}
        >
          立即兑换
        </button>
      </section>

      <section className={styles.toolsSection}>
        <h2 className={styles.toolsTitle}>常用工具</h2>
        <div className={styles.toolsGrid}>
          {TOOL_ITEMS.map((item, index) => (
            <ToolItem
              key={index}
              icon={item.icon}
              text={item.text}
              path={item.path}
              onClick={() => handleNavigation(item.path)}
            />
          ))}
        </div>
      </section>
      {console.log()
      }
      {error && <div style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>{error}</div>}
    </div>
  )
}

export default memo(Mine)
