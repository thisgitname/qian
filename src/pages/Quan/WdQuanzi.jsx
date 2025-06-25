import React, { useState, useRef, useEffect } from 'react'
import styles from './stylemodules/WdQuanzi.module.css'
import stylesss from './stylemodules/GuwangchangQuanzi.module.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import dayjs from 'dayjs'

const user = JSON.parse(localStorage.getItem('token')) || {}
// const user = {
//   avatar: '../img2.png',
//   nickname: '莘莘学子',
//   signature: '学海无涯苦作舟',
//   stats: [
//     { label: '发布', value: 28 },
//     { label: '关注', value: 168 },
//     { label: '粉丝', value: 80 },
//   ],
// }

const tabs = ['发布', '回复', '收藏', '点赞']

export default function WdQuanzi() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const tabRefs = useRef([])
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    if (tabRefs.current[activeTab]) {
      const node = tabRefs.current[activeTab]
      setSliderStyle({
        left: node.offsetLeft,
        width: node.offsetWidth
      })
    }
  }, [activeTab])

  const [list, setList] = useState([])
  const [shows, setShows] = useState(false)
  const [userList, setUserList] = useState({})
  const [token, setToken] = useState(JSON.parse(localStorage.getItem('token')) || {})

  const userInfo = JSON.parse(localStorage.getItem('token')) || {};

  async function getList() {
    await axios.get(`http://localhost:3000/gk/dateQuanzi?id=${user._id}`).then(res => {
      setList([...res.data.find])
    })
  }

  const getUserData = () => {
    const tokenData = localStorage.getItem('token');
    console.log(tokenData);
    if (!tokenData) {
      throw new Error('未登录');
    }
    try {
      const userData = JSON.parse(tokenData);
      if (!userData.studentId) {
        throw new Error('未设置学生ID');
      }
      return userData;
    } catch (error) {
      throw new Error('登录信息无效');
    }
  };

  function getUser() {
    axios.get(`http://localhost:3000/lz?studentId=${token.studentId}&&password=${token.password}`).then(res => {
      if (res.data && Array.isArray(res.data.find) && res.data.find.length > 0) {
        setUserList(res.data.find[0]);
      } else {
        setUserList({});
      }
    })
  }

  const showButton = (id) => {
    const usernamexihuan = userList?.usernamexihuan || [];
    const isLiked = usernamexihuan.indexOf(id) !== -1;
    let updatedXihuan = [...usernamexihuan];
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

  const delButton = (id) => {
    axios.delete(`http://localhost:3000/gk/deleteDateQuanzi/?id=${id}`).then(res => {
      if(res.data.code == 200){
        getList()
      }
    })
  }


  const [comments, setComments] = useState([])
  useEffect(() => {
    axios.get('http://localhost:3000/gk/comments').then(res => {
      setComments(res.data.find)
    })
  }, [])

  const [pinglun,setPinglun] = useState([])
    function getComments () {
      axios.get('http://localhost:3000/gk/comments').then(res => {
        setPinglun(res.data.find)
      })
    }

  useEffect(() => {
    getList()
    getUser()
    getComments()
  }, [])

  const [use,setUse] = useState(JSON.parse(localStorage.getItem('user')) || {})
  // userList 用户信息
  // comments 评论
  const ShowButton = (tab, idx) => {
    setActiveTab(idx)
  }

  // 渲染前过滤
  let filteredList = [];
  const myId = String(userList?._id || '');

  if (activeTab === 1) {
    const repliedIds = (pinglun || comments)
      .filter(item => String(item.userId) === myId)
      .map(item => String(item.quanziid));
    filteredList = list.filter(post => repliedIds.includes(String(post._id)));
  } else if (activeTab === 2) {
    const guanzhuIds = (userList?.usernameGuanzhu || []).map(String);
    filteredList = list.filter(post => guanzhuIds.includes(String(post.userid)));
  } else if (activeTab === 3) {
    const xihuanIds = (userList?.usernamexihuan || []).map(String);
    filteredList = list.filter(post => xihuanIds.includes(String(post._id)));
  } else {
    filteredList = list;
  }

  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/gk/dateList')
      .then(res => setAllUsers(res.data.find));
  }, []);

  // 统计数据
  const publishCount = list.filter(post => String(post.userid._id) === String(userList._id)).length;
  const fansCount = allUsers.filter(u =>
    Array.isArray(u.usernameGuanzhu) && u.usernameGuanzhu.includes(String(userList._id))
  ).length;
  const stats = [
    { label: '发布', value: publishCount },
    { label: '关注', value: fansCount },
    // { label: '粉丝', value: ... } // 如有粉丝数据可补充
  ];

  return (
    <div className={styles.profileContainer}>
      {/* 头部 */}
      <div className={styles.header}>
        <img className={styles.avatar} src={userInfo.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="头像" />
        <div className={styles.info}>
          <div className={styles.nickname}>{userInfo.name}</div>
          <div className={styles.signature}>{userInfo.tag}</div>
        </div>
        <button className={styles.publishBtn} onClick={()=>{navigate('/fb')}}>+ 发布</button>
      </div>
      {/* 统计栏 */}  
      <div className={styles.stats}>
        {stats.map((item, idx) => (
          <div className={styles.statItem} key={item.label}>
            <div className={styles.statNum}>{item.value}</div>
            <div className={styles.statLabel}>{item.label}</div>
          </div>
        ))}
      </div>
      {/* Tab栏 */}
      <div className={styles.tabs}>
        {tabs.map((tab, idx) => (
          <div
            key={tab}
            ref={el => tabRefs.current[idx] = el}
            className={idx === activeTab ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => ShowButton(tab,idx)}
          >
            {tab}
          </div>
        ))}
        <div
          className={styles.slider}
          style={{
            left: sliderStyle.left,
            width: sliderStyle.width
          }}
        />
      </div>
      {/* 帖子卡片 */}
      {/* 帖子列表 */}
      <div className="posts-list" >
          {filteredList.map((post,index) => {
            return  <div key={post._id} style={{display:"flex"}} onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/xq/?id=${post._id}`);
            }}>
                <div>
                <img width={'50px'} height={'50px'} style={{borderRadius:'50%'}} src=''/>
                  {/* {
                    post.img.map(item => {
                        return <img key={item.index} width={'50px'} height={'50px'} style={{borderRadius:'50%'}} src={item.img}/>
                    })
                  } */}
                </div>
                <div className={stylesss['post-item']}>
                <div className={stylesss['post-header']}>
                  <div className={stylesss['author-info']}>
                    <h4>{post.userid.name}</h4>
                    <span>{dayjs(post.time).format('YYYY-MM-DD HH:mm:ss')}</span>
                  </div>
                  <span 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      delButton(post._id);
                    }} 
                    style={{color:'red',fontSize:'13px',cursor:'pointer'}}
                  >
                    删除
                  </span>
                </div>
                <div className={stylesss['post-content']}>
                  <p style={{fontSize:'13px',textAlign:'left'}}>{post.content}</p>
                    <div className={stylesss['post-images']}>
                      {
                        post.img.map(item => {
                          return <img key={item.index} width={'90px'} height={'90px'} src={item.img}/>
                        })
                      }
                    </div>
                  </div>
                  {/* //交互标签 */}
                  <div className={stylesss['post-actions']}>
                    <span>
                      <i className={`${stylesss.iconfont} ${stylesss['icon-zhuanfa']}`}></i> {post.zf}
                    </span>
                    <span>
                      <i className={`${stylesss.iconfont} ${stylesss['icon-pinglun']}`}></i> {pinglun.filter(item => item.quanziid === post._id).length}
                    </span>
                    <span>
                      <i 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          showButton(post._id);
                        }} 
                        className={(userList?.usernamexihuan || []).indexOf(post._id)!==-1?`${stylesss.iconfont} ${stylesss['icon-xihuan']}`:stylesss['box_span']}
                      ></i>
                      <i 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          showButton(post._id);
                        }} 
                        className={(userList?.usernamexihuan || []).indexOf(post._id)!==-1?stylesss['box_span']:`${stylesss.iconfont} ${stylesss['icon-xihuan1']}`}
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
           })} 
      </div>
      {/* 其他Tab内容可按需补充 */}
    </div>
  )
}
