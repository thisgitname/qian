import React, { useState, useEffect } from 'react';
import styles from './Study.module.css';
import { Swiper, CapsuleTabs, Tag, ProgressBar, NavBar, Card, Grid, Toast } from 'antd-mobile'
import { useNavigate, useLocation } from 'react-router-dom';

const Study = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { course: initialCourse, practiceTime, examTime } = location.state || {};
  const [activeKey, setActiveKey] = useState('a');
  const [course, setCourse] = useState(initialCourse || "文学")
  const [courseList, setCourseList] = useState([{ id: 1, name: "文学", minutes: 0, days: 15 }, { id: 2, name: "历史", minutes: 0, days: 25 }, { id: 3, name: "政治", minutes: 0, days: 7 }])
  const [list, setList] = useState([]);

  // 监听 location.state 的变化，更新 course
  useEffect(() => {
    console.log('Study - location.state 变化:', location.state);
    if (location.state?.course) {
      console.log('Study - 更新 course 为:', location.state.course);
      setCourse(location.state.course);
      // 清除 state，防止重复触发
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // 记录 course 的变化
  useEffect(() => {
    console.log('Study - course 变化为:', course);
  }, [course]);

  // 获取当前课程的练习时间（秒转分钟，不足1分钟按1分钟计算）
  const getStudyMinutes = (courseName) => {
    let totalSeconds = 0;
    // 遍历localStorage，找到所有属于当前课程的练习时间
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`practiceTime_${courseName}_`)) {
        const time = localStorage.getItem(key) || '00:00:00';
        const [hours, minutes, seconds] = time.split(':').map(Number);
        totalSeconds += hours * 3600 + minutes * 60 + seconds;
      }
    }
    // 转换为分钟，不足1分钟按1分钟计算
    return Math.max(1, Math.ceil(totalSeconds / 60));
  };

  // 更新课程列表中的练习时间
  useEffect(() => {
    console.log('更新课程列表时间');
    const updatedCourseList = courseList.map(item => {
      const minutes = getStudyMinutes(item.name);
      console.log(`${item.name} 的学习时间：${minutes}分钟`);
      return {
        ...item,
        minutes: minutes
      };
    });
    setCourseList(updatedCourseList);
  }, [course, location.key]); // 添加 location.key 作为依赖项，确保每次导航都会更新

  // useEffect(() => {
  //   // 获取课程列表
  //   axios.get('/course/list').then(res => {
  //     if (res.data.code === 200) {
  //       setList(res.data.data);
  //     }
  //   });
  // }, []);

  const videoList = [
    { id: 1, course: "文学", title: "课程名称", img: "/img/文学史.png", tags: ["必考", "理论"], progress: 33 },
    { id: 2, course: "历史", title: "课程名称", img: "/img/课程.png", tags: ["必考", "理论"], progress: 40 },
    { id: 3, course: "政治", title: "课程名称", img: "/img/课程.png", tags: ["必考", "理论"], progress: 58 },
    { id: 4, course: "文学", title: "课程名称", img: "/img/古代文学概述.png", tags: ["必考", "理论"], progress: 75 },
    { id: 5, course: "历史", title: "课程名称", img: "/img/课程.png", tags: ["必考", "理论"], progress: 0 },
    { id: 6, course: "政治", title: "课程名称", img: "/img/课程.png", tags: ["必考", "理论"], progress: 25 },
    { id: 7, course: "文学", title: "课程名称", img: "/img/当代文学概述.png", tags: ["必考", "理论"], progress: 100 },
    { id: 8, course: "历史", title: "课程名称", img: "/img/课程.png", tags: ["选考", "理论"], progress: 20 },
    { id: 9, course: "政治", title: "课程名称", img: "/img/课程.png", tags: ["选考", "理论"], progress: 80 },
  ]
  const [state, setState] = useState(false)
  return (
    <div className={styles.container}>
      
      {/* 显示练习和考试时间 */}
      {(practiceTime || examTime) && (
        <div className={styles.timeInfo}>
          {practiceTime && (
            <div className={styles.timeItem}>
              <span>上次练习时长：</span>
              <span className={styles.timeValue}>{practiceTime}</span>
            </div>
          )}
          {examTime && (
            <div className={styles.timeItem}>
              <span>上次考试时长：</span>
              <span className={styles.timeValue}>{examTime}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.subject}>
            {course} <span className={styles.arrow} onClick={() => setState(!state)}>▼</span>
          </div>
          <div className={styles.courseList} style={{ display: state ? 'block' : 'none' }}>
            {courseList.map(i => (
              <div key={i.id} className={styles.courseItem} onClick={() => {
                setCourse(i.name);
                setState(false);
              }}>{i.name}</div>
            ))}
          </div>
          <div className={styles.todayTitle}>今日刷题</div>
          <div className={styles.progress}>
            <span className={styles.time}>{courseList.find(i => i.name === course)?.minutes || 0}</span>
            <span className={styles.totalTime}>/60分钟</span>
            <div className={styles.progressBar}>
              <div className={styles.progressInner} style={{ width: `${Math.min((courseList.find(i => i.name === course)?.minutes || 0) / 60 * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.daysCount}>{courseList.find(i => i.name === course)?.days || 0}天</div>
          <div className={styles.daysText}>距离考试</div>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.tools}>
          <div className={styles.toolItem}>
            <div className={styles.toolIcon} style={{ backgroundColor: '#FF6B6B' }} onClick={() => { navigate('/test', { state: { course: course } }) }}>
              <img src="/icons/试卷库.png" alt="试题库" />
            </div>
            <span className={styles.toolText}>试题库</span>
          </div>
          <div className={styles.toolItem}>
            <div className={styles.toolIcon} style={{ backgroundColor: '#4D96FF' }}
              onClick={() => {
                console.log('Study - 点击错题本，当前 course:', course);
                navigate('/wrong', { state: { course: course } });
              }}>
              <img src="/icons/错题本.png" alt="错题本" />
            </div>
            <span className={styles.toolText}>错题本</span>
          </div>
          <div className={styles.toolItem}>
            <div className={styles.toolIcon} style={{ backgroundColor: '#42CD71' }} onClick={() => { navigate('/collect', { state: { course: course } }) }}>
              <img src="/icons/收藏夹.png" alt="我的收藏" />
            </div>
            <span className={styles.toolText}>我的收藏</span>
          </div>
          <div className={styles.toolItem}>
            <div className={styles.toolIcon} style={{ backgroundColor: '#FFB74D' }} onClick={() => { navigate('/materials', { state: { course: course } }) }}>
              <img src="/icons/学习资料.png" alt="学习资料" />
            </div>
            <span className={styles.toolText}>学习资料</span>
          </div>
        </div>

        <div className={styles.banner}>
          <Swiper autoplay={2000} loop>
            <Swiper.Item className={styles.bannerImg}>
              <img src="/img/考前焦虑.png" alt="考前培训冲刺班" />
            </Swiper.Item>
            <Swiper.Item className={styles.bannerImg}>
              <img src="/img/百日冲刺.png" alt="考前培训冲刺班" />
            </Swiper.Item>
          </Swiper>
        </div>

        <div className={styles.tabs}>
          <div>
            <CapsuleTabs activeKey={activeKey} onChange={(key) => {
              setActiveKey(key);
            }}>
              <CapsuleTabs.Tab title="我的课程" key="a" />
              <CapsuleTabs.Tab title="其他课程" key="b" />
              <CapsuleTabs.Tab title="全部课程" key="c" />
            </CapsuleTabs>
          </div>
          <div className={styles.tabsContent}>
            {videoList.filter(item => item.course === course).map(i => (
              <div className={styles.tabsContentItem} key={i.id} onClick={() => navigate('/course', { state: { course: i.course } })}>
                <div>
                  <img src={i.img} alt="课程" />
                </div>
                <div style={{ width: '100%' }}>
                  <p className={styles.title}>{i.title}</p>
                  {i.tags.map(t => (
                    <Tag color="primary" fill='outline' style={{ marginRight: '10px' }} key={t}>{t}</Tag>
                  ))}
                  <ProgressBar percent={i.progress} text style={{ '--track-width': '8px', '--text-width': '81px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Grid columns={2} gap={8}>
          {list.map((item, index) => (
            <Grid.Item key={index}>
              <Card
                className={styles.card}
                onClick={() => navigate('/test', { state: { course: item.name } })}
              >
                <img src={item.img} alt={item.name} className={styles.cardImg} />
                <div className={styles.cardTitle}>{item.name}</div>
              </Card>
            </Grid.Item>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default Study; 