import React, { useState, useEffect, useRef } from 'react';
import styles from '../stylemodules/JxuanModule.module.css';
import axios from 'axios';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavBar, Space, Toast } from 'antd-mobile'
import { CloseOutline, MoreOutline, SearchOutline } from 'antd-mobile-icons'


const videoList = [
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://www.w3schools.com/html/movie.mp4',
    // 你可以继续添加更多视频链接
  ];
export default function JingxuanXq() {
    const location = useLocation()
    const [list,setList] = useState([])
    const navgiate = useNavigate()
    const [current, setCurrent] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const id = location.search.slice(4)

 

    useEffect(() => {
        const timer = setInterval(() => {
          setCurrent(prev => (prev + 1) % videoList.length);
        }, 15000);
        return () => clearInterval(timer);
      }, []);
    
      useEffect(() => {
        setIsPlaying(false);
        setShowControls(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }, [current]);
    
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
    
      const handleVideoClick = () => {
        setShowControls(true);
        if (videoRef.current) {
          videoRef.current.play();
        }
      };

    
    const [data,setData] = useState([])
    function getDate(){
        axios.get(`http://localhost:3000/gk/gongkais/?id=${id}`).then(res => {
        if (res.data && Array.isArray(res.data.find) && res.data.find.length > 0) {
          setList(res.data.find[0].url);
          setData(res.data.find[0].title);
          console.log(res.data.find[0].title);
          console.log(res.data.find[0].url);
        } else {
          setList([]);
          setData('');
          console.log('');
          console.log('');
        }
        })
    }
    useEffect(()=>{
        getDate()
    },[])

    useEffect(()=>{
        console.log(data)
    },[data])

    const right = (
        <div style={{ fontSize: 24 }}>
          <Space style={{ '--gap': '16px' }}>
            <SearchOutline />
            <MoreOutline />
          </Space>
        </div>
      )
    
      const back = () =>
        Toast.show({
          content: '点击了返回区域',
          duration: 1000,
        }, navgiate('/jing/gk'))
    
  return (
    <div>
        <NavBar back='返回' onBack={back}>
          {data}
        </NavBar>
        <div>
            <div className={styles.banner} style={{ position: 'relative' }}>
            <video
            ref={videoRef}
            src={list}
            width="100%"
            height="200"
            muted
            controls={showControls}
            style={{ borderRadius: 8, objectFit: 'cover', cursor: 'pointer' }}
            onClick={handleVideoClick}
            onPlay={handlePlay}
            onPause={handlePause}
            />
            {!isPlaying && !showControls && (
            <div
                style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 48,
                color: 'rgba(255,255,255,0.8)',
                pointerEvents: 'none',
                userSelect: 'none',
                }}
            >
                ⏸
            </div>
            )}
        </div>
        </div>
    </div>
  )
}
