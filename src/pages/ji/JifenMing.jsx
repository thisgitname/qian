import React, { useEffect, useState } from 'react'
import Navbar from '../component/Navbar'
import styles from './Jifen.module.css'
import axios from 'axios'

export default function JifenMing() {
  const [type, setType] = useState('income'); // income or outcome
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userid, setUserid] = useState('');
  const [totalJifen, setTotalJifen] = useState(0);

  useEffect(() => {
    // 从localStorage获取用户ID
    const storedUserid = localStorage.getItem('userid');
    if (!storedUserid) {
      setError('请先登录');
      setLoading(false);
      return;
    }
    setUserid(storedUserid);
    fetchJifenMingxi(storedUserid);
    fetchTotalJifen(storedUserid);
  }, [type]);

  // 获取积分明细
  const fetchJifenMingxi = async (userid) => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/ss/jifenmingxi', { 
        params: { userid, type },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (res.data.code === 200) {
        setList(res.data.data);
      } else {
        setError(res.data.msg || '获取积分明细失败');
      }
    } catch (err) {
      console.error('获取积分明细失败:', err);
      setError('获取积分明细失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取当前总积分
  const fetchTotalJifen = async (userid) => {
    try {
      const res = await axios.get('http://localhost:3000/ss/jifen/total', {
        params: { userid },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (res.data && res.data.code === 200) {
        setTotalJifen(res.data.total);
      }
    } catch (err) {
      // 忽略错误
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className={styles.jifenmingPage}>
        <div className={styles.navbar}><Navbar title="积分明细"/></div>
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className={styles.jifenmingPage}>
        <div className={styles.navbar}><Navbar title="积分明细"/></div>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.jifenmingPage}>
      <div className={styles.navbar}><Navbar title="积分明细"/></div>
      {/* 当前积分展示 */}
      <div className={styles.jifenCard} style={{margin:'16px 12px 0 12px',padding:'16px 0',textAlign:'center',fontWeight:'bold',fontSize:'22px',color:'#1677ff',letterSpacing:'1px'}}>当前积分：{totalJifen}</div>
      <div className={styles.jifenmingCard}>
        <div className={styles.jifenmingHeader}>
          <span className={styles.jifenmingTitle}>积分明细</span>
          <div className={styles.jifenmingTabs}>
            <button 
              className={type === 'income' ? styles.tabActive : ''} 
              onClick={() => setType('income')}
            >
              收入
            </button>
            <button 
              className={type === 'outcome' ? styles.tabActive : ''} 
              onClick={() => setType('outcome')}
            >
              支出
            </button>
          </div>
        </div>
        <div className={styles.jifenmingList}>
          {list.length === 0 ? (
            <div className={styles.empty}>暂无数据</div>
          ) : (
            list.map((item, idx) => (
              <div className={styles.jifenmingItem} key={item._id || idx}>
                <div className={styles.jifenmingRow}>
                  <span className={styles.jifenmingDesc}>{item.title}</span>
                  <span style={{color: item.newjifen > 0 ? '#ff7d00' : '#1dbf73',fontWeight:600,fontSize:'17px'}}>
                    {item.newjifen > 0 ? '+' : ''}{item.newjifen}
                  </span>
                </div>
                <div className={styles.jifenmingTime}>{formatTime(item.time)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function formatTime(time) {
  if (!time) return '';
  const d = new Date(time);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const h = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${y}-${m}-${day}  ${h}:${min}`;
}
