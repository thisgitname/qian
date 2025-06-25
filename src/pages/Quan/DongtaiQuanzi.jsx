import React, { useState, useEffect } from 'react'
import styles from './stylemodules/GuwangchangQuanzi.module.css'
import style_Dong from './stylemodules/DongtaiQuanzi.module.css'
import styless from './stylemodules/GuwangchangQuanzi.module.css'
import axios from 'axios'
import dayjs from 'dayjs'
import { useStore } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ListQuanzi from './commponent/ListQuanzi'

export default function DongtaiQuanzi() {
  const navigate = useNavigate()
  const arr = ['最新','精选','关注','收藏']
  const [list, setList] = useState([])
  const [sortedList, setSortedList] = useState([])
  const [show, setShow] = useState(0)
  const [userList, setUserList] = useState({})
  const [token, setToken] = useState(JSON.parse(localStorage.getItem('token')) || {})
  const [comments, setComments] = useState([])

  function getUser() {
    axios.get(`http://localhost:3000/lz/?studentId=${token.studentId}&&password=${token.password}`).then(res => {
      console.log(res.data.find)
      if (res.data && Array.isArray(res.data.find) && res.data.find.length > 0) {
        setUserList(res.data.find[0])
      } else {
        setUserList({})
      }
    })
  }

  const showButton = (id) => {
    console.log(id, userList._id)
    // Check if the post is already liked
    const isLiked = userList.usernamexihuan.indexOf(id) !== -1;
    
    // Create updated usernamexihuan array
    let updatedXihuan = [...userList.usernamexihuan];
    if (isLiked) {
      // Remove the id if already liked
      updatedXihuan = updatedXihuan.filter(postId => postId !== id);
    } else {
      // Add the id if not liked
      updatedXihuan.push(id);
    }

    // Update the user data with the new usernamexihuan array
    axios.put(`http://localhost:3000/gk/xihuanGuangcheng/?sid=${id}&&uid=${userList._id}`, {
      usernamexihuan: updatedXihuan
    }).then(res => {
      console.log('修改成功')
      // 更新本地帖子列表中的点赞数
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
    axios.get('http://localhost:3000/gk/dateQuanzi').then(res => {
      console.log(res.data.find)
      setList([...res.data.find])
    })
  }, [])

  useEffect(() => {
    axios.get('http://localhost:3000/gk/comments').then(res => {
      setComments(res.data.find)
    })
  }, [])

  useEffect(() => {
    if (show === 0) {
      // 最新，按时间降序
      setSortedList([...list].sort((a, b) => new Date(b.time) - new Date(a.time)))
    }else if (show === 1) {
      // 精选，按照评论数降序
      setSortedList([...list].sort((a, b) => {
        const aCount = comments.filter(item => item.quanziid === a._id).length;
        const bCount = comments.filter(item => item.quanziid === b._id).length;
        return bCount - aCount;
      }))
    }else if (show === 3){
      setSortedList([...list].sort((a, b) => new Date(b.xihuan) - new Date(a.xihuan)))
    } else {
      // 其他标签，原样展示
      setSortedList(list)
    }
  }, [show, list, comments])

  useEffect(() => {
    getUser()
  }, [])

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',margin:'30px 0'}}>
        {
          arr.map((item,index)=>{
            return <span 
            key={index}
            className={show==index?style_Dong['span']:style_Dong['spans']} 
            onClick={()=>{ setShow(index) }}
            >{item}</span>
          })
        }
      </div>
      <ListQuanzi data={sortedList} comments={comments} userList={userList} onFollow={handleFollow} />
    </div>
  )
}
