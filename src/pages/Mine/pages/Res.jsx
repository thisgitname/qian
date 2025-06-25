import React, { useState, useEffect } from 'react'
import styles from '../pagescss.css/Res.module.css'
import { useNavigate } from 'react-router-dom'
import axios from '../main'
import dayjs from 'dayjs'

export default function Res() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const getdata=()=>{
    axios.get('/yy/getcourses').then(res => {
      setData(res.data.data)
    })
  }

  useEffect(() => {
    getdata()
  }, [])
const concal=(_id)=>{
  axios.post(`/yy/concalres?_id=${_id}`).then(res=>{
    getdata()
  })
}
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <button className={styles.backBtn} onClick={() => navigate('/mine')}>
          <span className={styles.arrow}>&larr;</span>
        </button>
        <div className={styles.header}>我的预约</div>
      </div>
      {data.map(item => (
        item.video.status === 1 && (
          <div className={styles.card} key={item._id}>
            <div className={styles.title}>{item.video.title}</div>
            <div className={styles.infoRow}>
              <span className={styles.status}>未开始</span>
              <span className={styles.time}>
                <span className={styles.clock}>⏰</span>
                {dayjs(item.video.createdAt).format('YYYY-MM-DD HH:mm')}
              </span>
              <button className={styles.cancelBtn} onClick={()=>{concal(item._id)}}>取消预约</button>
            </div>
          </div>
        )
      ))}
    </div>
  )
}
