import React, { useState, useEffect } from 'react'
import { useLocation,useNavigate } from 'react-router-dom'
import styles from './stylemodules/Xqing.module.css'
import styless from './stylemodules/GuwangchangQuanzi.module.css'
import axios from 'axios'
import dayjs from 'dayjs'
import { Input,Popup, Space, Button, NavBar,  Toast } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline, SmileOutline, CloseOutline, MoreOutline, SearchOutline } from 'antd-mobile-icons';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export default function Xqing() {
  const navigator = useNavigate()
  const location = useLocation()
  const [shows, setShows] = useState(false)
  const [postDetail, setPostDetail] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [visible1, setVisible1] = useState(false);
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('token')) || {});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [userList, setUserList] = useState({})
  const [token, setToken] = useState(JSON.parse(localStorage.getItem('token')) || {})

  const right = (<div style={{ fontSize: 24 }}>
    <Space style={{ '--gap': '16px' }}>
      <SearchOutline />
      <MoreOutline />
    </Space>
  </div>);
  const back = () => Toast.show(
    navigator('/quan/dt'),
    {
      content: '点击了返回区域',
      duration: 1000,
  });

  // 获取当前用户信息
  const getUser = () => {
    axios.get(`http://localhost:3000/lz/?studentId=${token.studentId}&&password=${token.password}`).then(res => {
      if (res.data && Array.isArray(res.data.find) && res.data.find.length > 0) {
        setUserList(res.data.find[0]);
      } else {
        setUserList({});
      }
    })
  }

  // 处理关注功能
  const handleFollow = () => {
    if (!userList._id || !postDetail?.userid._id) {
      console.error('缺少用户信息');
      return;
    }

    axios.put(`http://localhost:3000/gk/guanzhu?uid=${userList._id}&targetId=${postDetail.userid._id}`)
      .then(res => {
        if (res.data.code === 200) {
          setShows(res.data.isFollowed);
          console.log(res.data.msg);
          // 重新获取用户信息以更新关注状态
          getUser();
        }
      })
      .catch(err => {
        console.error('关注操作失败:', err);
      });
  }

  // 检查关注状态
  const isFollowed = Array.isArray(userList?.usernameGuanzhu) && 
                     userList.usernameGuanzhu.includes(postDetail?.userid._id);

  // 获取帖子详情
  const getPostDetail = async () => {
    try {
      const id = new URLSearchParams(location.search).get('id')
      await axios.get(`http://localhost:3000/gk/dateQuanzi/?uid=${id}`).then(res => {
        if (res.data && Array.isArray(res.data.find) && res.data.find.length > 0) {
          setPostDetail(res.data.find[0]);
        } else {
          setPostDetail({});
        }
      })
    } catch (error) {
      console.error('获取帖子详情失败:', error)
    }
  }

  // 获取评论列表
  const getComments = async () => {
    try {
      const id = new URLSearchParams(location.search).get('id')
      console.log(id)
      const response = await axios.get(`http://localhost:3000/gk/comments/?postId=${id}`).then(res => {
        setComments(res.data.find)
      })
    } catch (error) {
      console.error('获取评论失败:', error)
    }
  }

  
  // useEffect(()=>{
  //   console.log(user[0]._id,111)
  // },[])
  // 提交评论
  const submitComment = async () => {
    if (!value.trim()) {
      return;
    }
    try {
      const postId = new URLSearchParams(location.search).get('id');
      const response = await axios.post('http://localhost:3000/gk/addComment', {
        quanziid: postId,
        userId: user._id,
        content: value
      });
      
      if (response.data.code === 200) {
        // 清空输入框
        setValue('');
        // 关闭弹窗
        setVisible1(false);
        // 重新获取评论列表
        getComments();
      }
    } catch (error) {
      console.error('提交评论失败:', error);
    }
  };

  // 添加表情
  const addEmoji = (emoji) => {
    setValue(prev => prev + emoji.native)
    setShowEmojiPicker(false)
  }

  // 渲染表情文本
  const renderEmojiText = (text) => {
    return text
  }

  useEffect(() => {
    getPostDetail()
    getComments()
    getUser()
  }, [location.search])

  if (!postDetail) {
    return <div>未找到帖子</div>
  }

  return (
    // <></>
    <div className={styles.card}>
      <NavBar style={{margin:'0 0 0 -20px',padding:"0"}} onBack={back}>标题</NavBar>
      <div className={styles.header}>
        <img
          className={styles.avatar}
          src={postDetail.userid.avatar || './img1.png'}
          alt="头像"
        />
        <div className={styles.info}>
          <div className={styles.nickname}>{postDetail.userid.naem}</div>
          <div className={styles.time}>{dayjs(postDetail.time).format('YYYY-MM-DD HH:mm:ss')}</div>
        </div>
        <button onClick={handleFollow} className={isFollowed ? styless['follow-btns'] : styless['follow-btn']}>
          {isFollowed ? '已关注' : '+ 关注'}
        </button>
      </div>
      <div className={styles.content}>
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
      <div className={styles.actions}>
        <span className={styles.active}>评论 {comments.length}</span> 
      </div>

      {/* 评论列表 */}
      <div className={styles.comments}>
        {
          comments.length === 0 ?
          <div className={styles['no-comment']}>
            暂无评论，快去评论吧
          </div>
          :
          comments.map((comment, index) => (
            <div key={comment._id} className={styles.comment}>
              <div className={styles['comment-header']}>
                {/* <img 
                  width={'40px'} 
                  height={'40px'} 
                  style={{borderRadius:'50%'}} 
                  src={comment.userId.avatar || ''} 
                  alt="评论者头像"
                /> */}
                <div>
                  {/* <h5>{comment.userId.naem}</h5> */}
                  <span>{dayjs(comment.time).format('YYYY-MM-DD HH:mm:ss')}</span>
                </div>
              </div>
              <p>{renderEmojiText(comment.content)}</p>
            </div>
          ))               
        }
      </div>

      {/* 底部输入框 */}
      <div 
        className={styles['bottom-input']} 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setVisible1(true);
        }}
      >
        <Input
          placeholder='说点什么...'
          readOnly
          style={{
            border: "1px solid #CCC",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "14px",
            backgroundColor: "#f5f5f5"
          }}
        />
      </div>

      {/* 评论弹窗 */}
      <Popup 
        visible={visible1} 
        onMaskClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setVisible1(false);
          setShowEmojiPicker(false);
        }}
        onClose={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setVisible1(false);
          setShowEmojiPicker(false);
        }}
        bodyStyle={{ 
          height: showEmojiPicker ? '60vh' : '30vh', 
          maxHeight: showEmojiPicker ? '600px' : '300px',
          borderTopLeftRadius: "15px", 
          borderTopRightRadius: "15px",
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          backgroundColor: '#fff',
          zIndex: 1000
        }}
      >
        <div 
          className={styles['comment-box']}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className={styles['comment-input-wrapper']}>
            <div className={styles['input-container']}>
              <Input
                className={styles['comment-input']}
                placeholder='说点什么...'
                value={value}
                onChange={val => setValue(val)}
                style={{
                  border: "1px solid #CCC",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  maxHeight: '120px',
                  overflow: 'auto'
                }}
              />
              <div 
                className={styles['emoji-button']}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowEmojiPicker(!showEmojiPicker);
                }}
              >
                <SmileOutline />
              </div>
            </div>
          </div>
          {showEmojiPicker && (
            <div 
              className={styles['emoji-picker-container']}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Picker
                data={data}
                onEmojiSelect={addEmoji}
                theme="light"
                set="native"
                previewPosition="none"
                skinTonePosition="none"
              />
            </div>
          )}
          <div className={styles['comment-actions']}>
            <Button
              className={styles['cancel-btn']}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setVisible1(false);
                setShowEmojiPicker(false);
              }}
              style={{
                marginRight: "10px",
                color: "#666"
              }}
            >
              取消
            </Button>
            <Button
              className={styles['submit-btn']}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                submitComment();
              }}
              disabled={!value.trim()}
              style={{
                backgroundColor: value.trim() ? "#1677ff" : "#ccc",
                color: "#fff"
              }}
            >
              发送
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  )
}
