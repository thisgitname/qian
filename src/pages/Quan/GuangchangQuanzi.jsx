import React, { useState, useEffect } from 'react'
import styles from './stylemodules/GuwangchangQuanzi.module.css'
import styless from './stylemodules/GuwangchangQuanzi.module.css'
import axios from 'axios'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import ListQuanzi from './commponent/ListQuanzi'

export default function GuangchangQuanzi() {
  const navigate = useNavigate()
  const hotTopics = [
    { id: '01', title: '学霸是如何学习的' },
    { id: '02', title: '学会学习技巧，事半功倍' },
    { id: '03', title: '当年你是如何拼的，如何学习的' }
  ]

  const [list, setList] = useState([])
  const [shows, setShows] = useState(false)
  const [userList, setUserList] = useState({})
  const [token, setToken] = useState(JSON.parse(localStorage.getItem('token')) || {})

  async function getList() {
    await axios.get('http://localhost:3000/gk/dateQuanzi').then(res => {
      setList([...res.data.find])
    })
  }

  function getUser() {
    axios.get(`http://localhost:3000/lz/?studentId=${token.studentId}&&password=${token.password}`).then(res => {
      if (res.data && Array.isArray(res.data.find) && res.data.find.length > 0) {
        setUserList(res.data.find[0]);
      } else {
        setUserList({});
      }
    })
  }

  const showButton = (id) => {
    const isLiked = userList.usernamexihuan && userList.usernamexihuan.indexOf(id) !== -1;
    let updatedXihuan = userList.usernamexihuan ? [...userList.usernamexihuan] : [];
    if (isLiked) {
      updatedXihuan = updatedXihuan.filter(postId => postId !== id);
    } else {
      updatedXihuan.push(id);
    }

    axios.put(`http://localhost:3000/gk/xihuanGuangcheng/?sid=${id}&&uid=${userList._id}`, {
      usernamexihuan: updatedXihuan
    }).then(res => {
      setList(prevList => prevList.map(post => {
        if (post._id === id) {
          return {
            ...post,
            likes: isLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1
          };
        }
        return post;
      }));
      getUser()
    })
  }

  // 处理关注功能
  const handleFollow = (targetUserId) => {
    if (!userList._id || !targetUserId) {
      console.error('缺少用户信息');
      return;
    }

    axios.put(`http://localhost:3000/gk/guanzhu?uid=${userList._id}&targetId=${targetUserId}`)
      .then(res => {
        if (res.data.code === 200) {
          console.log(res.data.msg);
          // 重新获取用户信息以更新关注状态
          getUser();
        }
      })
      .catch(err => {
        console.error('关注操作失败:', err);
      });
  }

  useEffect(() => {
    getList()
    getUser()
  }, [])

  return (
    <div>
      <div className={styles['quanzi-container']}>
        <div>
            
        </div>
        {/* 搜索框 */}
        <div className={styles['search-bar']}>
          <span className={`${styles.iconfont} ${styles['icon-sousuo']}`}></span>
          <input type="text" placeholder="请输入内容" />
        </div>

        {/* 热门话题 */}
        <div className={styles['hot-topics']}>
          <div className={styles['section-header']}>
            <h3>热门话题</h3>
            <span className={styles.more}>查看更多</span>
          </div>
          <div className={styles['topics-list']}>
            {hotTopics.map(topic => (
              <div key={topic.id} className={styles['topic-item']}>
                <span className={styles['topic-id']}>{topic.id}</span>
                <span className={styles['topic-title']}>{topic.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 帖子列表 */}
        <ListQuanzi userList={userList} onFollow={handleFollow} />
      </div>
    </div>
  )
}
