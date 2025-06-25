import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../main'
import styles from '../pagescss.css/Tell.module.css'

export default function Tell() {
  const [data, setData] = useState([])
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('token'))
  const myName = user.name

  useEffect(() => {
    axios.get('/yy/getlist').then(res => {
      setData(res.data.data || [])
    })
  }, [])

  return (
    <div className={styles.tellRoot}>
      {/* 顶部栏 */}
      <header className={styles.headerBar}>
        <button
          className={styles.backBtn}
          onClick={() => navigate('/mine')}
          aria-label="返回"
        >
          <span className={styles.backIcon}>←</span>
        </button>
        <span className={styles.headerTitle}>消息中心</span>
        <div className={styles.headerRight}></div>
      </header>

      {/* 好友消息列表 */}
      <section className={styles.listSection}>
        {data.filter(item => item.name !== myName).length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyEmoji}>💬</div>
            <div className={styles.emptyText}>暂无好友消息，快去和朋友聊聊吧！</div>
          </div>
        ) : (
          data.filter(item => item.name !== myName).map((item, index) => (
            <div
              className={styles.listItem}
              key={item.name + index}
              tabIndex={0}
              role="button"
              onClick={() => navigate('/chat', { state: { item } })}
            >
              <div className={styles.avatarWrap}>
                {item.avatar ? (
                  <img src={item.avatar} alt={item.name} className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarPlaceholder}>{item.name?.[0] || '?'}</div>
                )}
              </div>
              <div className={styles.infoWrap}>
                <div className={styles.nameRow}>
                  <span className={styles.friendName}>{item.name}</span>
                  <span className={styles.friendTime}>{item.time}</span>
                </div>
                <div className={styles.friendContent}>{item.content}</div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
