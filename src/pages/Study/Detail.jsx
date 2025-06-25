import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavBar, Toast, Dialog } from "antd-mobile";
import styles from './Detail.module.css'
import dayjs from "dayjs";
import axios from "axios";

export default function Detail() {
    const location = useLocation()
    const navigate = useNavigate()
    const { data: initialData, course} = location.state || {}
    const video = useRef(null)
    const [isLoading, setIsLoading] = useState(true)
    const [savedTime, setSavedTime] = useState(0)
    const [hasUnsavedProgress, setHasUnsavedProgress] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [list, setList] = useState([])
    const [recommendingId, setRecommendingId] = useState(null)

    // 防抖保存进度的定时器
    const saveTimerRef = useRef(null)

    // 检查是否有必要的数据
    useEffect(() => {
        if (!initialData || !initialData.video || !initialData.video.url) {
            Toast.show({
                content: '视频数据加载失败',
                duration: 2000,
            })
            navigate('/course', { replace: true })
            return
        }
    }, [initialData, navigate])

    // 组件挂载时恢复进度
    useEffect(() => {
        if (!initialData?.video) return

        const savedTimeStr = localStorage.getItem(`video_progress_${initialData._id}`)
        if (savedTimeStr !== null && !isNaN(parseFloat(savedTimeStr))) {
            const time = parseFloat(savedTimeStr)
            setSavedTime(time)
            console.log(`找到保存的进度: ${time}秒`)
        } else {
            setSavedTime(0)
        }
    }, [initialData?._id])
    useEffect(() => {
        axios.get('/lz/data', { params: { course: course } }).then(res => {
            setList(res.data.data)
        })
    }, [list])

    // 视频加载完成后设置进度
    const handleLoadedMetadata = () => {
        if (savedTime > 0) {
            video.current.currentTime = savedTime
            Toast.show({
                content: `已恢复到上次观看位置: ${formatTime(savedTime)}`,
                duration: 2000,
            })
        }
        setIsLoading(false)
    }

    // 防抖保存进度
    const saveProgress = (currentTime) => {
        // 清除之前的定时器
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current)
        }

        // 设置新的定时器，2秒后保存
        saveTimerRef.current = setTimeout(() => {
            if (initialData?.video) {
                localStorage.setItem(`video_progress_${initialData._id}`, currentTime.toString())
                setHasUnsavedProgress(false)
                console.log(`进度已保存: ${currentTime}秒`)
            }
        }, 2000)
    }

    // 格式化时间显示
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // 处理返回逻辑
    const handleBack = () => {
        // 如果有未保存的进度，提示用户
        if (hasUnsavedProgress && currentTime > 0) {
            Dialog.confirm({
                content: `检测到未保存的观看进度 (${formatTime(currentTime)})，是否保存？`,
                onConfirm: () => {
                    // 立即保存进度
                    if (initialData?.video) {
                        localStorage.setItem(`video_progress_${initialData._id}`, currentTime.toString())
                        Toast.show({
                            content: '进度已保存',
                            duration: 1500,
                        })
                    }
                    navigate('/course', { replace: true, state: { course, date: dayjs(initialData.video.createdAt).format('YYYY-MM-DD') } })
                },
                onCancel: () => {
                    navigate('/course', { replace: true, state: { course, date: dayjs(initialData.video.createdAt).format('YYYY-MM-DD') } })
                }
            })
        } else {
            navigate('/course', { replace: true, state: { course, date: dayjs(initialData.video.createdAt).format('YYYY-MM-DD') } })
        }
    }

    // 清理定时器
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current)
            }
        }
    }, [])

    // 如果没有数据，显示加载状态
    if (!initialData || !initialData.video) {
        return (
            <div>
                <NavBar back='返回' onBack={() => navigate('/course', { replace: true, state: { course } })}></NavBar>
                <div className={styles.loading}>
                    <div>正在加载视频数据...</div>
                </div>
            </div>
        )
    }

    const recommend = async (id) => {
        if (recommendingId) return;
        setRecommendingId(id);
        try {
            const res = await axios.post('/lz/recommend', { id });
            if (res.data.code === 200) {
                setList(prevList => prevList.map(item => {
                    if (item._id === id) {
                        return {
                            ...item,
                            video: {
                                ...item.video,
                                status: item.video.status === 0 ? 1 : 0
                            }
                        }
                    }
                    return item;
                }));
                Toast.show({
                    content: res.data.msg || '操作成功',
                    duration: 1500,
                });
            }
        } catch (error) {
            console.error('预约操作失败:', error);
            Toast.show({
                content: '操作失败，请稍后重试',
                duration: 1500,
            });
        } finally {
            setRecommendingId(null);
        }
    }

    return (
        <div>
            <NavBar back='返回' onBack={handleBack}></NavBar>

            {isLoading && (
                <div className={styles.loading}>
                    <div>正在加载视频...</div>
                </div>
            )}

            <video
                src={initialData.video.url || ""}
                className={styles.video}
                controls
                ref={video}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={() => {
                    if (video.current && !isLoading) {
                        const time = video.current.currentTime
                        setCurrentTime(time)
                        setHasUnsavedProgress(true)
                        saveProgress(time)
                    }
                }}
                onEnded={() => {
                    // 视频播放完成时清除保存的进度
                    localStorage.removeItem(`video_progress_${initialData._id}`)
                    setHasUnsavedProgress(false)
                    Toast.show({
                        content: '视频播放完成！',
                        duration: 2000,
                    })
                }}
                onError={(e) => {
                    console.error('视频加载错误:', e)
                    Toast.show({
                        content: '视频加载失败，请检查网络连接',
                        duration: 3000,
                    })
                }}
            ></video>

            {savedTime > 0 && (
                <div className={styles.progressInfo}>
                    上次观看位置: {formatTime(savedTime)}
                </div>
            )}

            {hasUnsavedProgress && (
                <div className={styles.unsavedInfo}>
                    当前进度: {formatTime(currentTime)} (未保存)
                </div>
            )}
            推荐课程
            <div className={styles.recommend}>
                {list.filter(item => item.course === course).filter(item => item.video.title !== initialData.video.title).map(i => (
                    <div key={i._id} className={styles.recommendItem}>
                        <div>
                            <img src={i.img} alt="" style={{ width: "50px", marginRight: "10px" }} />
                        </div>
                        <div>
                            <p className={styles.title}>{i.video.title}</p>
                            <p>
                                <span
                                    className={
                                        dayjs(i.video.createdAt).isAfter(dayjs(initialData.video.createdAt)) ? styles.status1 :
                                            dayjs(i.video.createdAt).isSame(dayjs(initialData.video.createdAt)) ? styles.status2 :
                                                styles.status3
                                    }>
                                    {dayjs(i.video.createdAt).isAfter(dayjs(initialData.video.createdAt)) ? "未开始" :
                                        dayjs(i.video.createdAt).isSame(dayjs(initialData.video.createdAt)) ? "进行中" :
                                            "已结束"}
                                </span>
                                <span className={styles.date}>{dayjs(i.video.createdAt).format('YYYY-MM-DD')}</span>
                                {dayjs(i.video.createdAt).isAfter(dayjs(initialData.video.createdAt)) ? (
                                    i.video.status === 0
                                        ? <button
                                            className={styles.unrecommendButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                recommend(i._id);
                                            }}
                                            disabled={recommendingId === i._id}
                                        >
                                            {recommendingId === i._id ? '预约中...' : '预约'}
                                        </button>
                                        : <button
                                            className={styles.recommendButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                recommend(i._id);
                                            }}
                                            disabled={recommendingId === i._id}
                                        >
                                            {recommendingId === i._id ? '取消中...' : '已预约'}
                                        </button>
                                ) : (
                                    <button
                                        className={dayjs(i.video.createdAt).isSame(dayjs(initialData.video.createdAt)) ? styles.playing : styles.end}
                                        onClick={() => navigate('/detail', { state: { data: i, course: course, list: list } })}
                                    >
                                        查看
                                    </button>
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
