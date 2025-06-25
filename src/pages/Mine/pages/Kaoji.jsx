import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../pagescss.css/Kaoji.module.css'
import dayjs from 'dayjs'

export default function Kaoji() {
  const navigate = useNavigate();
  const kaojiData = JSON.parse(localStorage.getItem('examRecords')) || [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button 
          className={styles.backButton} 
          onClick={() => navigate('/mine')}
        >
          ←
        </button>
        <h1 className={styles.title}>考试记录</h1>
      </header>
      <div>
        {kaojiData.map((item, index) => (
          <div key={index} className={styles.examCard}>
            <div className={styles.examInfo}>
              <div className={styles.examName}>
                <span className={styles.examIcon}>📝</span>
                {item.title}
              </div>
              <div className={styles.examTime}>
                考试时间: {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
              </div>
            </div>
            <button className={styles.detailButton} onClick={() => navigate('/kaodetail')}>
              考试详情
            </button>
          </div>
        ))}
        {kaojiData.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#999',
            padding: '40px 0'
          }}>
            暂无考试记录
          </div>
        )}
      </div>
    </div>
  )
}
