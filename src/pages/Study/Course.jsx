import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { NavBar, DatePicker, Toast } from 'antd-mobile'
import dayjs from 'dayjs'
import axios from './axios'
import styles from './Course.module.css'

export default function Course() {
    const navigate = useNavigate()
    const location = useLocation()
    const { course, date: initialDate } = location.state || {}
    const [videoList, setVideoList] = useState([])
    const [date, setDate] = useState(initialDate || dayjs(Date.now()).format('YYYY-MM-DD'))
    const [datePickerVisible, setDatePickerVisible] = useState(false)
    // 设置固定的最小和最大日期
    const minDate = new Date('2024-01-01')
    const maxDate = new Date('2026-12-31')

    useEffect(() => {
        axios.get('/lz/data', { params: { course: course } }).then(res => {
            // console.log(res)
            setVideoList(res.data.data)
        })
    }, [])
    const minutes = Math.floor(Math.random() * (18 - 8 + 1)) + 8
    console.log(videoList)

    // 更新视频状态
    const updateVideoState = async (id) => {
        try {
            const res = await axios.post('/lz/updateState', {
                id,
                state: true  // true 表示已观看
            })
            if (res.data.code === 200) {
                console.log('状态更新成功')
            }
        } catch (err) {
            console.error('更新状态失败:', err)
            Toast.show({
                icon: 'fail',
                content: '更新状态失败'
            })
        }
    }

    const handleClick = async (item) => {
        // 先更新状态
        await updateVideoState(item._id)
        // 然后跳转到视频页面
        navigate('/detail', {
            state: {
                course,
                data: item
            }
        })
    }

    return (
        <div>
            <NavBar back="返回" onBack={() => navigate('/study', { state: { course } })} right={<div onClick={() => setDatePickerVisible(true)}>...</div>} className={styles.nav} />
            <h1>{course}</h1>
            <p>{date}</p>
            {videoList.filter(i => dayjs(i.video.createdAt).format('YYYY-MM-DD') === date).map(i => (
                // { console.log(i) }
                < div key={i._id} className={styles.courseItem} onClick={() => handleClick(i)}>
                    <div>
                        <img src={i.img} alt="" />
                    </div>
                    <div>
                        <p className={styles.title}>{i.video.title}</p>
                        <p className={styles.teacher}>{i.teacher}</p>
                        <p className={styles.time}>{dayjs(i.video.createdAt).format('YYYY-MM-DD')}---{dayjs(i.video.updatedAt).format('YYYY-MM-DD')}
                            {minutes}:00---{minutes + 2}:00</p>
                    </div>
                </div>
            ))
            }

            <DatePicker
                visible={datePickerVisible}
                onClose={() => setDatePickerVisible(false)}
                precision='day'
                onConfirm={(val) => {
                    setDate(dayjs(val).format('YYYY-MM-DD'))
                    setDatePickerVisible(false)
                }}
                max={maxDate}
                min={minDate}
                defaultValue={new Date()}
            />
        </div >
    )
}