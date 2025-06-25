import React, { useState, useEffect, useRef } from 'react';
import styles from '../stylemodules/JxuanModule.module.css';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Space, Swiper } from 'antd-mobile'


const videoList = [
  'https://video.699pic.com/videos/97/58/62/b_0RMgc3IndDJY1599975862.mp4',
  'https://video.699pic.com/videos/53/77/34/a_nmggEV30VnwD1573537734.mp4',
  'https://video.699pic.com/videos/56/90/57/b_vpmz1heT8VBV1616569057.mp4',
  'https://video.699pic.com/videos/64/57/15/a_RjAkNKdYrMWG1564645715.mp4',
  'https://video.699pic.com/videos/25/64/24/b_erqRQiEUwnhK1548256424.mp4'
  // 你可以继续添加更多视频链接
];

export default function Gongkaike() {
  const navgiate = useNavigate()
  const [current, setCurrent] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

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

  const [list,setList] = useState([])
  function getDate(){
    axios.get('http://localhost:3000/gk/gongkais').then(res => {
      setList(res.data.find)
      console.log(res.data)
    })
  }
  useEffect(()=>{
    getDate()
  },[])

  const colors = ['#ace0ff', '#bcffbd', '#e4fabd', '#ffcfac']

const items = videoList.map((color, index) => (
  <Swiper.Item key={index}>
    <div className={styles.content} style={{ background: color }}>
    <video
          ref={videoRef}
          src={color}
          width="100%"
          height="200"
          muted
          controls={showControls}
          style={{ borderRadius: 8, objectFit: 'cover', cursor: 'pointer' }}
          onClick={handleVideoClick}
          onPlay={handlePlay}
          onPause={handlePause}
        />
    </div>
  </Swiper.Item>
))
  

  return (
    <div className={styles.container}>

      {/* 顶部大图 */}
      <div className={styles.banner} style={{ position: 'relative' }}>
        <Swiper slideSize={90} trackOffset={5} loop stuckAtBoundary={false}>
          {items}
        </Swiper>
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

      {/* 热门推荐标题和查看更多 */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>热门推荐</span>
        <button className={styles.headerBtn}>查看更多</button>
      </div>

      <div className={styles.list}>
        {
          list.map(item=>{
            return <div key={item._id} className={styles.listItem} onClick={()=>{navgiate(`/JingxuanXq/?id=${item._id}`)}}>
                      <div className={styles.listImgWrap}>
                        <img src={item.img} alt="cover" className={styles.listImg} />
                        <div className={styles.listPlay}>
                          <span className={styles.listPlayIcon}>▶</span>
                        </div>
                      </div>
                      <div className={styles.listContent}>
                        <div className={styles.listTitle}>{item.title}</div>
                        <div className={styles.listMeta}>
                          <span className={styles.listMetaTime}>🕒 {dayjs(item.date).format('YYYY-MM-DD')}</span>
                        </div>
                      </div>
                    </div>
          })
        }
      </div>
    </div>
  );
}
