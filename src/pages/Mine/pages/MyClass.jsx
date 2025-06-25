import React, { useState, useRef, useEffect } from 'react';
import styles from '../pagescss.css/MyClass.module.css';
import { useNavigate } from 'react-router-dom';
import axios from '../main'
const tabs = [
  { key: 'teacher', label: '班主任信息' },
  { key: 'notice', label: '班级公告' },
  { key: 'members', label: '班级成员' },
];

export default function MyClass() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('teacher');
  const cardRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [classData, setClassData] = useState([])
  const getclassData = async () => {
     await axios.get('/yy/getlist').then(res => {
      setClassData(res.data.data);
    })
  }
  useEffect(() => {
    getclassData();
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      if (!cardRef.current) return;
      const { top } = cardRef.current.getBoundingClientRect();
      setIsSticky(top <= 16); // 16px为页面padding
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backIcon} aria-label="返回" onClick={()=>{navigate('/mine')}}>←</button>
        <h1 className={styles.title}>我的班级</h1>
      </header>
      <div className={styles.topBgWrap}></div>
      <section
        className={styles.card}
        aria-label="班级信息"
        ref={cardRef}
      >
        <div className={styles.classInfo}>
          <div className={styles.classTextBox}>
            <div className={styles.className}>文史学</div>
            <div className={styles.classCount}>班级人数：22</div>
          </div>
          
        </div>
      </section>
      <div className={styles.tabWrap}>
        <nav className={styles.tabs} aria-label="班级导航">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? styles.activeTab : ''}
              aria-current={activeTab === tab.key ? 'page' : undefined}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <section className={styles.tabContent}>
          {activeTab === 'teacher' && (
            <>
              <section className={styles.teacherSection} aria-label="班主任信息">
                <img className={styles.avatar} src="/avatar.jpg" alt="班主任头像" />
                <div className={styles.teacherInfo}>
                  <div className={styles.teacherName}>何春华</div>
                  <div className={styles.teacherTitle}>清华大学教授</div>
                  <div className={styles.teacherDesc}>撸起袖子加油干</div>
                </div>
                
              </section>
              <section className={styles.section} aria-label="个人介绍">
                <h2 className={styles.sectionTitle}>个人介绍</h2>
                <p className={styles.sectionContent}>
                  何春华教授毕业于哈佛大学，深耕文史学领域多年。教学上，其主讲课程广受学生好评，培育众多优秀人才；科研成果丰硕，于国内外期刊发表多篇论文，出版多部专著，见解独到。积极参与学术交流，以严谨治学态度成为行业杰出代表。
                </p>
              </section>
              <section className={styles.section} aria-label="履职记录">
                <h2 className={styles.sectionTitle}>履职记录</h2>
                <div className={styles.resumeItemBlock}>
                  <div className={styles.resumeItem}>
                    <div className={styles.resumeDate}>2019.03—2019.10</div>
                    <div className={styles.resumeSchool}>某某学校内容内容</div>
                  </div>
                  <div className={styles.resumeWorkLabel}>工作成绩：</div>
                  <div className={styles.resumeWorkContent}>内容内容内容</div>
                </div>
                <div className={styles.resumeItemBlock}>
                  <div className={styles.resumeItem}>
                    <div className={styles.resumeDate}>2019.10—2021.08</div>
                    <div className={styles.resumeSchool}>某某学校内容内容</div>
                  </div>
                  <div className={styles.resumeWorkLabel}>工作成绩：</div>
                  <div className={styles.resumeWorkContent}>内容内容内容</div>
                </div>
              </section>
            </>
          )}
          {activeTab === 'notice' && (
            <section className={styles.section} aria-label="班级公告">
              <h2 className={styles.sectionTitle}>班级公告</h2>
              <div className={styles.sectionContent}>
                暂无公告。
              </div>
            </section>
          )}
          {activeTab === 'members' && (
            <section className={styles.section} aria-label="班级成员">
              <h2 className={styles.sectionTitle}>班级成员</h2>
              <div className={styles.sectionContent}>
                {classData.length > 0 ? (
                  <div className={styles.membersList}>
                    {classData.map((item, index) => (
                      <div key={index} className={styles.memberListItem}>
                        <div className={styles.memberAvatar}>
                          {item.name.charAt(0)}
                        </div>
                        <div className={styles.memberInfo}>
                          <div className={styles.memberName}>{item.name}</div>
                          <div className={styles.memberRole}>学生</div>
                        </div>
                        <div className={styles.memberActions}>
                          <span className={styles.memberNumber}>#{String(index + 1).padStart(2, '0')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyMessage}>暂无成员列表</div>
                )}
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
