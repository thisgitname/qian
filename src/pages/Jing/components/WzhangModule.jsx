import React, { useEffect, useState } from 'react';
import styles from '../stylemodules/WzhangModule.module.css';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { NavBar } from 'antd-mobile'

const tabs = [
  { key: 'recommend', label: '推荐' },
  { key: 'exam', label: '考试' },
  { key: 'hot', label: '热点' },
  { key: 'selected', label: '精选' },
];

const articleList = [
  {
    id: 1,
    title: '自律学习，如何培养学习资料，增强学习爱好',
    date: '2022-12-02',
    views: 8528,
    img: 'https://img.icons8.com/ios/100/000000/student-male--v2.png',
  },
  {
    id: 2,
    title: '自律学习，如何培养学习资料，增强学习爱好',
    date: '2022-12-02',
    views: 8528,
    img: 'https://img.icons8.com/ios/100/000000/student-male--v2.png',
  },
];



export default function WzhangModule() {
  const navgaite = useNavigate()
  const [list,setList] = useState([])
function getDate(){
  axios.get('http://localhost:3000/gk/wenzhang').then(res=>{
    setList(res.data.find)
    console.log(res.data.find)
  })
}
useEffect(()=>{
  getDate()
},[])


  return (
    <div>
      <div className={styles.container}>
      {/* 顶部标签栏 */}
      <div className={styles.tabs}>
        {tabs.map((tab, idx) => (
          <button
            key={tab.key}
            className={
              idx === 0
                ? `${styles.tabBtn} ${styles.tabBtnActive}`
                : styles.tabBtn
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 顶部大图 */}
      <div className={styles.banner}>
        <img
          src="https://ts1.tc.mm.bing.net/th/id/OIP-C.alxKpKUDazUU4w2VBABQkgHaE7?w=156&h=107&c=8&rs=1&qlt=70&o=7&cb=iavawebp1&dpr=1.3&pid=3.1&rm=3"
          alt="banner"
          className={styles.bannerImg}
        />
        <div className={styles.bannerText}>
          学习是一个不断重复的过程形成一种思维的方式
        </div>
      </div>

      {/* 文章列表表头和查看更多 */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>文章列表</span>
        <button className={styles.headerBtn}>查看更多</button>
      </div>

      {/* 文章列表 */}
      <div className={styles.list} >
        {
          list.map(item=>{
            return(
              <div key={item._id} className={styles.listItem} onClick={()=>{navgaite(`/xqing/?id=${item._id}`)}}>
                  <div className={styles.listImgWrap}>
                    <img src={item.img} alt="cover" className={styles.listImg} />
                  </div>
                  <div className={styles.listContent}>
                    <div className={styles.listTitle}>{item.title}</div>
                    <div className={styles.listMeta}>
                      <span className={styles.listMetaTime}>🕒 { dayjs(item.date).format('YYYY-MM-DD')}</span>
                    </div>
                  </div>
              </div>
            )
          })
        }
      </div>
    </div>
    </div>
  );
}
