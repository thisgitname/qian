import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../pagescss.css/Kaoji.module.css'
import axios from '../main'
import dayjs from 'dayjs'

export default function Studyji() {
  const navigate = useNavigate();
  const [kaojiData, setKaojiData] = useState([]);
  
  const getKaojiData = async () => {
    const res = await axios.get('/yy/getcourses').then(res => {
      setKaojiData(res.data.data);
    })
  }
  
  useEffect(() => {
    getKaojiData();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button 
          className={styles.backButton} 
          onClick={() => navigate('/mine')}
        >
          ←
        </button>
        <h1 className={styles.title}>学习记录</h1>
      </header>
      <div className={styles.content}>
        {kaojiData.filter(item=>item.study === true).map((item,index)=>(
          <div key={index} className={styles.courseItem} onClick={()=>{navigate(`/detail`)}}>
            <div className={styles.leftPart}>
              <img src={item.img} alt={item.video.title} />
            </div>
            <div className={styles.rightPart}>
              <div className={styles.courseName}>{item.video.title}</div>
              <div className={styles.courseTime}>
                <span>○</span>
                {dayjs(item.video.createdAt).format('YYYY-MM-DD HH:mm-10:00')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

