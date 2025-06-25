import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import Navbar from '../component/Navbar';
import styles from './Jifen.module.css';
import axios from 'axios';
import { Toast } from 'antd-mobile';

// 我的积分主页面组件
export default function MyJifen() {
  const navigate = useNavigate();
  // 当前积分
  const [jifen, setJifen] = useState(0);
  // 今日日期字符串
  const [today, setToday] = useState('');
  // 签到按钮是否禁用
  const [signDisabled, setSignDisabled] = useState(false);
  // 错误信息
  const [error, setError] = useState('');
  // 页面加载状态
  const [loading, setLoading] = useState(true);
  // 签到成功提示
  const [signSuccess, setSignSuccess] = useState(false);
  // 已签到日期数组
  const [signedDates, setSignedDates] = useState([]);
  // 积分明细列表
  const [jifenList, setJifenList] = useState([]);
  // 任务中心任务列表
  const [tasks, setTasks] = useState([
    { id: 1, title: '每日学习30分钟', points: 5, type: 'study', completed: false },
    { id: 2, title: '完成一次答题考试', points: 10, type: 'exam', completed: false },
    { id: 3, title: '圈子发帖', points: 3, type: 'post', completed: false }
  ]);

  // 检查用户是否登录，加载用户数据和签到数据
  useEffect(() => {
    const userid = localStorage.getItem('user');
    if (!userid) {
      setError('请先登录');
      setLoading(false);
      return;
    }
    fetchUserData();
    loadSignedDates();
  }, []);

  // 加载已签到日期（从后端获取）
  const loadSignedDates = async () => {
    try {
      const userid = localStorage.getItem('user');
      if (!userid) return;
      // 请求后端接口，获取签到记录
      const res = await axios.get(`http://localhost:3000/ss/signin/${userid}`);
      if (res.data.code === 200) {
        // 将签到日期字符串转为Date对象
        const dates = res.data.data.map(signin => new Date(signin.date));
        setSignedDates(dates);
        // 检查今天是否已签到
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isTodaySigned = dates.some(date => 
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate()
        );
        setSignDisabled(isTodaySigned);
      }
    } catch (error) {
      console.error('获取签到记录失败:', error);
    }
  };

  // 初始化用户积分记录（首次操作时自动补初始积分）
  const initUserJifen = async () => {
    try {
      const userid = localStorage.getItem('user');
      if (!userid) {
        Toast.show({ icon: 'fail', content: '请先登录' });
        navigate('/login');
        return;
      }
      // 检查是否存在积分记录
      const checkRes = await axios.get(`http://localhost:3000/api/jifenxiang/check/${userid}`);
      // 如果不存在积分记录，创建初始记录
      if (!checkRes.data.exists) {
        await axios.post('http://localhost:3000/api/jifenxiang/init', {
          userid: userid,
          title: '初始积分',
          oldjifen: 0,
          newjifen: 100,
          totaljifen: 100,
          time: new Date()
        });
        Toast.show({ icon: 'success', content: '积分初始化成功' });
      }
    } catch (error) {
      console.error('初始化积分失败:', error);
      Toast.show({ icon: 'fail', content: '初始化积分失败' });
    }
  };

  // 获取积分明细列表
  const getJifenList = async () => {
    try {
      const userid = localStorage.getItem('user');
      console.log(userid);
      
      if (!userid) {
        Toast.show({ icon: 'fail', content: '请先登录' });
        navigate('/login');
        return;
      }
      // 先初始化积分
      await initUserJifen();
      const res = await axios.get(`http://localhost:3000/api/jifenxiang/${userid}`);
      if (res.data && res.data.length > 0) {
        setJifenList(res.data);
        setJifen(res.data[0].totaljifen);
      }
    } catch (error) {
      console.error('获取积分明细失败:', error);
      Toast.show({ icon: 'fail', content: '获取积分明细失败' });
    }
  };

  // 获取用户当前积分等数据
  const fetchUserData = async () => {
    try {
      const userid = localStorage.getItem('user');
      if (!userid) {
        setError('请先登录');
        setLoading(false);
        return;
      }
      // 获取积分
      const res = await axios.get('http://localhost:3000/ss/jifen/total', { 
        params: { userid },
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      // 检查返回的是否是HTML
      if (typeof res.data === 'string' && res.data.includes('<!doctype html>')) {
        throw new Error('接口返回格式错误，请检查接口地址');
      }
      // 验证返回数据
      if (!res.data) {
        throw new Error('获取数据失败');
      }
      // 根据实际返回的数据结构获取积分
      let total = 0;
      if (res.data.code === 200) {
        // 如果返回的是数组，取第一条记录的积分
        if (Array.isArray(res.data.data)) {
          total = res.data.data[0]?.total || 0;
        } 
        // 如果返回的是对象，直接获取total
        else if (typeof res.data.data === 'object') {
          total = res.data.data.total || 0;
        }
        // 如果直接返回total
        else {
          total = res.data.total || 0;
        }
      } else {
        throw new Error(res.data.msg || '获取积分失败');
      }
      // 确保total是数字
      total = Number(total);
      if (isNaN(total)) {
        total = 0;
      }
      setJifen(total);
      // 获取今天日期
      const d = new Date();
      setToday(`${d.getMonth() + 1}月${d.getDate()}日`);
    } catch (err) {
      console.error('获取数据失败:', err);
      if (err.code === 'ECONNABORTED') {
        setError('网络请求超时，请稍后重试');
      } else if (err.response) {
        setError(err.response.data?.msg || '服务器错误，请稍后重试');
      } else {
        setError(err.message || '获取数据失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 签到按钮点击事件
  const handleSign = async () => {
    if (signDisabled) return;
    const userid = localStorage.getItem('user');
    if (!userid) {
      setError('请先登录');
      return;
    }
    try {
      setLoading(true);
      // 请求后端签到接口
      const res = await axios.post('http://localhost:3000/ss/signin', {
        userid
      });
      if (res.data.code === 200) {
        // 更新积分显示
        setJifen(res.data.data.newJifen);
        // 按钮变暗
        setSignDisabled(true);
        // 显示签到成功提示
        setSignSuccess(true);
        // 3秒后隐藏成功提示
        setTimeout(() => setSignSuccess(false), 3000);
        // 更新签到日历
        loadSignedDates();
      } else {
        setError(res.data.msg || '签到失败，请稍后重试');
      }
    } catch (err) {
      console.error('签到失败:', err);
      if (err.response) {
        setError(err.response.data?.msg || '签到失败，请稍后重试');
      } else {
        setError('签到失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 任务中心点击事件处理
  const handleTaskClick = (taskType) => {
    switch(taskType) {
      case 'study':
        navigate('/study');
        break;
      case 'exam':
        navigate('/study');
        break;
      case 'post':
        navigate('/quan');
        break;
      default:
        break;
    }
  };

  // 加载状态渲染
  if (loading) {
    return (
      <div className={styles.jifenPage}>
        <div className={styles.navbar}><Navbar title="我的积分"/></div>
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  // 错误状态渲染
  if (error) {
    return (
      <div className={styles.jifenPage}>
        <div className={styles.navbar}><Navbar title="我的积分"/></div>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  // 生成最近5天的日期（用于签到横向展示）
  const getRecentDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  // 页面渲染
  return (
    <div className={styles.jifenPage}>
      {/* 导航栏 */}
      <div className={styles.navbar}><Navbar title="我的积分"/></div>
      {/* 积分卡片 */}
      <div className={styles.jifenCard}>
        <div className={styles.jifenHeader}>
          <span className={styles.jifenTitle}>我的积分</span>
          <span className={styles.jifenValue}>{jifen}</span>
        </div>
        <div className={styles.qiandaoRow}>
          <span className={styles.qiandaoTip}>签到将获得 <span className={styles.qiandaoAdd}>+2积分</span></span>
          <span className={styles.qiandaoCalendar} onClick={()=>{navigate('/jifenli')}}>签到日历 &gt;</span>
        </div>
        <div className={styles.qiandaoList}>
          {getRecentDates().map((date, index) => {
            const isSigned = signedDates.some(signedDate => 
              signedDate.getDate() === date.getDate() && 
              signedDate.getMonth() === date.getMonth() && 
              signedDate.getFullYear() === date.getFullYear()
            );
            return (
              <div key={index} className={`${styles.qiandaoItem} ${isSigned ? styles.qiandaoActive : ''}`}>
                <div className={styles.qiandaoCircle}>{isSigned ? '已领\n+2' : '+2'}</div>
                <div className={styles.qiandaoDate}>{`${date.getMonth() + 1}月${date.getDate()}日`}</div>
              </div>
            );
          })}
        </div>
        <button 
          className={`${styles.qiandaoBtn} ${signDisabled ? styles.qiandaoBtnDisabled : ''}`} 
          disabled={signDisabled} 
          onClick={handleSign}
        >
          {signDisabled ? '已签到' : '立即签到'}
        </button>
        {signSuccess && <div className={styles.signSuccess}>签到成功！+2积分</div>}
      </div>
      {/* 快捷入口 */}
      <div className={styles.quickEntry}>
        <div className={styles.entryItem} onClick={()=>{navigate('/jifenshop')}}>
          <div className={styles.entryIcon + ' ' + styles.shopIcon}></div>
          <div className={styles.entryText}>积分商城</div>
        </div>
        <div className={styles.entryItem} onClick={()=>{navigate('/jifenming')}}>
          <div className={styles.entryIcon + ' ' + styles.detailIcon}></div>
          <div className={styles.entryText}>积分明细</div>
        </div>
      </div>
      {/* 任务中心 */}
      <div className={styles.taskCenter}>
        <div className={styles.taskTitle}>任务中心</div>
        <div className={styles.taskList}>
          <div className={styles.taskItem}>
            <div className={styles.taskIcon + ' ' + styles.iconGift}></div>
            <div className={styles.taskInfo}>
              <div className={styles.taskName}>每日登陆</div>
              <div className={styles.taskDesc}>每天登陆获得 <span className={styles.taskJifen}>+2积分</span></div>
            </div>
            <div className={`${styles.taskBtn} ${signDisabled ? styles.taskBtnDone : ''}`}>
              {signDisabled ? '已完成' : '去完成'}
            </div>
          </div>
          <div className={styles.taskItem} onClick={() => handleTaskClick('study')}>
            <div className={styles.taskIcon + ' ' + styles.iconStudy}></div>
            <div className={styles.taskInfo}>
              <div className={styles.taskName}>每日学习30分钟</div>
              <div className={styles.taskDesc}>获得 <span className={styles.taskJifen}>+10积分</span></div>
            </div>
            <div className={styles.taskBtn}>去完成</div>
          </div>
          <div className={styles.taskItem} onClick={() => handleTaskClick('exam')}>
            <div className={styles.taskIcon + ' ' + styles.iconExam}></div>
            <div className={styles.taskInfo}>
              <div className={styles.taskName}>完成一次答题考试</div>
              <div className={styles.taskDesc}>获得 <span className={styles.taskJifen}>+10积分</span></div>
            </div>
            <div className={styles.taskBtn}>去完成</div>
          </div>
          <div className={styles.taskItem} onClick={() => handleTaskClick('post')}>
            <div className={styles.taskIcon + ' ' + styles.iconPost}></div>
            <div className={styles.taskInfo}>
              <div className={styles.taskName}>圈子发帖</div>
              <div className={styles.taskDesc}>获得 <span className={styles.taskJifen}>+10积分</span></div>
            </div>
            <div className={styles.taskBtn}>去完成</div>
          </div>
        </div>
      </div>
    </div>
  )
}
