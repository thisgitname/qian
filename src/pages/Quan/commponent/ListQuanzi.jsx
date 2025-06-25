import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import stylesss from '../stylemodules/GuwangchangQuanzi.module.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import dayjs from 'dayjs'

// 将帖子项抽取为单独的组件
const PostItem = memo(({ post, userList, onLike, comments, onFollow }) => {
    const navigate = useNavigate()

    const handleClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/xq/?id=${post._id}`);
    }, [post._id, navigate]);

    const isLiked = useMemo(() => 
        Array.isArray(userList?.usernamexihuan) && userList.usernamexihuan.indexOf(post._id) !== -1,
        [userList?.usernamexihuan, post._id]
    );

    // 本地点赞状态，保证点击后立即切换
    const [localLiked, setLocalLiked] = useState(isLiked);
    useEffect(() => {
        setLocalLiked(isLiked);
    }, [isLiked]);

    const handleLike = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLocalLiked(prev => !prev); // 本地立即切换
        if (onLike) await onLike(post._id);
    }, [onLike, post._id]);

    // 检查关注状态
    const checkFollowStatus = useMemo(() => 
        Array.isArray(userList?.usernameGuanzhu) && userList.usernameGuanzhu.includes(post._id),
        [userList?.usernameGuanzhu, post._id]
    );

    // 本地关注状态，保证点击后立即切换
    const [localFollow, setLocalFollow] = useState(checkFollowStatus);
    useEffect(() => {
        setLocalFollow(checkFollowStatus);
    }, [checkFollowStatus]);

    const handleFollow = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLocalFollow(prev => !prev); // 本地立即切换
        if (onFollow) await onFollow(post._id);
    }, [onFollow, post._id]);

    const [pinglun,setPinglun] = useState([])
    useEffect(() => {
        if (comments) {
            setPinglun(comments)
        } else {
            axios.get('http://localhost:3000/gk/comments').then(res => {
                setPinglun(res.data.find)
            })
        }
    }, [comments])

    return (
        <div style={{display:"flex"}} onClick={handleClick}>
            <div>
                <img width={'50px'} height={'50px'} style={{borderRadius:'50%'}} src=''/>
            </div>
            <div className={stylesss['post-item']}>
                <div className={stylesss['post-header']}>
                    <div className={stylesss['author-info']}>
                        {/* {console.log(post.userid)} */}
                        <h4>{post.userid.name}</h4>
                        <span>{dayjs(post.time).format('YYYY-MM-DD HH:mm:ss')}</span>
                    </div>
                    <button onClick={handleFollow} className={localFollow ? stylesss['follow-btns'] : stylesss['follow-btn']}> 
                        {localFollow ? '已关注' : '+ 关注'}
                    </button>
                </div>
                <div className={stylesss['post-content']}>
                    <p style={{fontSize:'13px',textAlign:'left'}}>{post.content}</p>
                    <div className={stylesss['post-images']}>
                        {post.img.map(item => (
                            <img key={item.index} width={'90px'} height={'90px'} src={item.img}/>
                        ))}
                    </div>
                </div>
                <div className={stylesss['post-actions']}>
                    <span>
                        <i className={`${stylesss.iconfont} ${stylesss['icon-zhuanfa']}`}></i> {post.zf}
                    </span>
                    <span>
                        <i className={`${stylesss.iconfont} ${stylesss['icon-pinglun']}`}></i> {pinglun.filter(item => item.quanziid === post._id).length}
                    </span>
                    <span>
                        <i 
                            onClick={handleLike}
                            className={localLiked ? `${stylesss.iconfont} ${stylesss['icon-xihuan']}` : stylesss['box_span']}
                        ></i>
                        <i 
                            onClick={handleLike}
                            className={localLiked ? stylesss['box_span'] : `${stylesss.iconfont} ${stylesss['icon-xihuan1']}`}
                        ></i>
                    </span>
                </div>
            </div>
        </div>
    );
});

const ListQuanzi = memo(({ userId, showDelete = false, data, comments, userList, onFollow }) => {
    const [list, setList] = useState([])
    const [localUserList, setLocalUserList] = useState({})
    const [token, setToken] = useState(JSON.parse(localStorage.getItem('token')) || {})

    // 优先使用外部传入的用户信息，如果没有则使用本地获取的
    const finalUserList = userList || localUserList

    const getList = useCallback(async () => {

        const url = userId 
            ? `http://localhost:3000/gk/dateQuanzi/?id=${userId}`
            : 'http://localhost:3000/gk/dateQuanzi'
            // console.log(userId)
        await axios.get(url).then(res => {
            setList([...res.data.find])
        })
    }, [userId])

    const getUser = useCallback(() => {
        axios.get(`http://localhost:3000/lz/?studentId=${token.studentId}&&password=${token.password}`).then(res => {
            if (res.data && Array.isArray(res.data.find) && res.data.find.length > 0) {
                setLocalUserList(res.data.find[0]);
            } else {
                setLocalUserList({});
            }
        })
    }, [token.studentId, token.password])

    const showButton = useCallback((id) => {
        const isLiked = Array.isArray(finalUserList?.usernamexihuan) && finalUserList.usernamexihuan.indexOf(id) !== -1;
        let updatedXihuan = Array.isArray(finalUserList?.usernamexihuan) ? [...finalUserList.usernamexihuan] : [];
        if (isLiked) {
            updatedXihuan = updatedXihuan.filter(postId => postId !== id);
        } else {
            updatedXihuan.push(id);
        }

        axios.put(`http://localhost:3000/gk/xihuanGuangcheng/?sid=${id}&&uid=${finalUserList._id}`, {
            usernamexihuan: updatedXihuan
        }).then(res => {
            setList(prevList => prevList.map(post => {
                if (post._id === id) {
                    return {
                        ...post,
                        xihuan: isLiked ? (post.xihuan || 0) - 1 : (post.xihuan || 0) + 1
                    };
                }
                return post;
            }));
            if (!userList) {
                getUser()
            }
        })
    }, [finalUserList, getUser, userList])

    const delButton = useCallback((id) => {
        axios.delete(`http://localhost:3000/gk/deleteDateQuanzi/?id=${id}`).then(res => {
            if(res.data.code == 200){
                getList()
            }
        })
    }, [getList])

    useEffect(() => {
        if (!data) {
            getList()
        }
        if (!userList) {
            getUser()
        }
    }, [getList, getUser, data, userList])

    // 优先渲染外部传入的数据
    const renderList = data || list

    const memoizedList = useMemo(() => 
        renderList.map((post) => (
            <PostItem
                key={post._id}
                post={post}
                userList={finalUserList}
                onLike={showButton}
                comments={comments}
                onFollow={onFollow}
            />
        )),
        [renderList, finalUserList, showButton, comments, onFollow]
    )

    return (
        <div className="posts-list">
            {memoizedList}
        </div>
    )
})

export default ListQuanzi
