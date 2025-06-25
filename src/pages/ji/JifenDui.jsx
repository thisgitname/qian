import React from 'react'
import Navbar from '../component/Navbar'
import { useNavigate } from 'react-router-dom'
import styles from './Jifen.module.css'

export default function JifenDui() {
  const navigate = useNavigate();
  return (
    <div className={styles.jifenduiPage}>
      <div className={styles.navbar}><Navbar title="兑换成功"/></div>
      <div className={styles.jifenduiContent}>
        <div className={styles.jifenduiIconBox}>
          {/* 绿色对勾SVG */}
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#f6ffed" stroke="#52c41a" strokeWidth="4" />
            <polyline points="30,55 46,70 72,38" fill="none" stroke="#52c41a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className={styles.jifenduiTip}>订单支付成功</div>
        <div className={styles.jifenduiBtnBox}>
          <button className={styles.jifenduiBtnOutline} onClick={()=>navigate('/')}>返回首页</button>
          <button className={styles.jifenduiBtnPrimary} onClick={()=>navigate('/dingdan')}>查看订单</button>
        </div>
      </div>
    </div>
  )
}
