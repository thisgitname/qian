import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import dayjs from 'dayjs'
import styles from './stylemodules/GuwangchangQuanzi.module.css'

export default function PostDetail() {
  const location = useLocation()
  const [postDetail, setPostDetail] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  // 获取帖子详情
  const getPostDetail = async () => {
    try {
      const id = new URLSearchParams(location.search).get('id')
      const response = await axios.get(`http://localhost:3000/gk/dateQuanzi?id=${id}`)
      if (response.data && Array.isArray(response.data.find) && response.data.find.length > 0) {
        setPostDetail(response.data.find[0])
      } else {
        setPostDetail({})
      }
    } catch (error) {
      console.error('获取帖子详情失败:', error)
    }
  }

  // 获取评论列表
  const getComments = async () => {
    try {
      const id = new URLSearchParams(location.search).get('id')
      const response = await axios.get(`http://localhost:3000/gk/comments?postId=${id}`)
      setComments(response.data.comments || [])
    } catch (error) {
      console.error('获取评论失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPostDetail()
    getComments()
  }, [location.search])

  if (loading) {
    return <div>加载中...</div>
  }

  if (!postDetail) {
    return <div>未找到帖子</div>
  }

  return (
    <div className={styles['post-detail']}>
      {/* 帖子详情 */}
      <div className={styles['post-content']}>
        <div className={styles['post-header']}>
          <div className={styles['author-info']}>
            <img 
              width={'50px'} 
              height={'50px'} 
              style={{borderRadius:'50%'}} 
              src={postDetail.userid.avatar || ''} 
              alt="用户头像"
            />
            <div>
              <h4>{postDetail.userid.naem}</h4>
              <span>{dayjs(postDetail.time).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
          </div>
        </div>
        
        <div className={styles['post-body']}>
          <p>{postDetail.content}</p>
          <div className={styles['post-images']}>
            {postDetail.img && postDetail.img.map((item, index) => (
              <img 
                key={index} 
                width={'90px'} 
                height={'90px'} 
                src={item.img} 
                alt={`图片${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 评论列表 */}
      <div className={styles['comments-section']}>
        <h3>评论 ({comments.length})</h3>
        {comments.map((comment, index) => (
          <div key={index} className={styles['comment-item']}>
            <div className={styles['comment-header']}>
              <img 
                width={'40px'} 
                height={'40px'} 
                style={{borderRadius:'50%'}} 
                src={comment.user.avatar || ''} 
                alt="评论者头像"
              />
              <div>
                <h5>{comment.user.naem}</h5>
                <span>{dayjs(comment.time).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
            </div>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 