import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar, Toast, Input, Button, Avatar } from 'antd-mobile';
import { HeartOutline, HeartFill, MessageOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import styles from './Source.module.css';

export default function Source() {
    const location = useLocation();
    const navigate = useNavigate();
    const { course, video } = location.state || {};

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(video?.like || 0);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(video?.comment || []);

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
        Toast.show({
            content: liked ? '已取消点赞' : '点赞成功',
            duration: 1000,
        });
    };

    const handleComment = () => {
        if (!commentText.trim()) {
            Toast.show({
                content: '请输入评论内容',
                duration: 1000,
            });
            return;
        }

        const newComment = {
            id: Date.now(),
            content: commentText,
            time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            user: {
                name: '我',
                avatar: 'https://picsum.photos/40'
            }
        };

        setComments(prev => [newComment, ...prev]);
        setCommentText('');
        Toast.show({
            content: '评论成功',
            duration: 1000,
        });
    };

    return (
        <div className={styles.container}>
            <NavBar onBack={() => navigate(-1)}>资料详情</NavBar>
            
            {/* 主要内容区域 */}
            <div className={styles.content}>
                <video src={video?.url} controls style={{ width: "100%", height: "100%" }} />
                <h2 className={styles.title}>{video?.title}</h2>
                <p className={styles.time}>{dayjs(video?.time).format('YYYY-MM-DD HH:mm:ss')}</p>
                <div className={styles.mainContent}>
                    {/* 这里可以放资料的主要内容 */}
                </div>
            </div>

            {/* 评论区域 */}
            {showComments && (
                <div className={styles.commentSection}>
                    <h3 className={styles.commentTitle}>全部评论 ({comments.length})</h3>
                    <div className={styles.commentList}>
                        {comments.map(comment => (
                            <div key={comment.id} className={styles.commentItem}>
                                <Avatar src={comment.user.avatar} className={styles.avatar} />
                                <div className={styles.commentContent}>
                                    <div className={styles.commentHeader}>
                                        <span className={styles.userName}>{comment.user.name}</span>
                                        <span className={styles.commentTime}>{comment.time}</span>
                                    </div>
                                    <p className={styles.commentText}>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 底部操作栏 */}
            <div className={styles.footer}>
                <div className={styles.inputWrapper}>
                    <Input
                        placeholder="写下你的评论..."
                        value={commentText}
                        onChange={setCommentText}
                    />
                    <Button size='small' onClick={handleComment}>发送</Button>
                </div>
                <div className={styles.actions}>
                    <div className={styles.actionItem} onClick={() => setShowComments(!showComments)}>
                        <MessageOutline />
                        <span>{comments.length}</span>
                    </div>
                    <div className={styles.actionItem} onClick={handleLike}>
                        {liked ? <HeartFill className={styles.liked} /> : <HeartOutline />}
                        <span>{likeCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}