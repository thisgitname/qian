import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NavBar, CapsuleTabs, Button } from "antd-mobile";
import styles from "./Test.module.css";

// 导入图片
import 古代文学 from '../../../public/img/古代文学概述.png';
import 当代文学 from '../../../public/img/当代文学概述.png';
import 文学史 from '../../../public/img/文学史.png';

export default function Test() {
    const navigate = useNavigate();
    const location = useLocation();
    const { course, practiceTime, examTime } = location.state || {};
    const [activeKey, setActiveKey] = useState('a');
    const [list, setList] = useState([
        { id: 1, title: "古典文学", cate: "practice", course: "文学", img: 古代文学, page: 1 },
        { id: 2, title: "现代文学", cate: "practice", course: "文学", img: 文学史, page: 2 },
        { id: 3, title: "当代文学考试", cate: "test", course: "文学", img: 当代文学, page: 1 },
        { id: 4, title: "近代文学考试", cate: "test", course: "文学", img: 文学史, page: 2 },
        { id: 5, title: "政治练习1", cate: "practice", course: "政治", img: 文学史, page: 1 },
        { id: 6, title: "政治练习2", cate: "practice", course: "政治", img: 文学史, page: 2 },
        { id: 7, title: "政治模拟考试1", cate: "test", course: "政治", img: 文学史, page: 1 },
        { id: 8, title: "政治模拟考试2", cate: "test", course: "政治", img: 文学史, page: 2 },
        { id: 9, title: "历史练习1", cate: "practice", course: "历史", img: 文学史, page: 1 },
        { id: 10, title: "历史练习2", cate: "practice", course: "历史", img: 文学史, page: 2 },
        { id: 11, title: "历史模拟考试1", cate: "test", course: "历史", img: 文学史, page: 1 },
        { id: 12, title: "历史模拟考试2", cate: "test", course: "历史", img: 文学史, page: 2 },
    ]);

    // 处理返回按钮点击
    const handleBack = () => {
        navigate("/study", { 
            state: { 
                course,
                practiceTime: practiceTime || localStorage.getItem('practiceTime'),
                examTime: examTime || localStorage.getItem('examTime')
            } 
        });
    };

    // 根据课程筛选列表
    const filteredPracticeList = list.filter(item => 
        item.cate === 'practice' && item.course === course
    );

    const filteredTestList = list.filter(item => 
        item.cate === 'test' && item.course === course
    );

    return (
        <div>
            <NavBar onBack={handleBack}>试题库</NavBar>
            <div className={styles.tabs}>
                <CapsuleTabs activeKey={activeKey} onChange={setActiveKey}>
                    <CapsuleTabs.Tab title="练习模式" key="a" className={styles.tabsItem}>
                        <div className={styles.tabsContent}>
                            {filteredPracticeList.length > 0 ? (
                                filteredPracticeList.map((item, index) => (
                                    <div key={item.id} className={styles.tabsContentItem}>
                                        <div>
                                            <img src={item.img} alt="课程" />
                                        </div>
                                        <div style={{ width: '100%' }}>
                                            <p className={styles.title}>{item.title}</p>
                                            <div className={styles.actions}>
                                                <Button 
                                                    className={styles.startButton} 
                                                    onClick={() => navigate("/practice", { 
                                                        state: { 
                                                            course: course, 
                                                            page: item.page, 
                                                            cate: 'practice'
                                                        } 
                                                    })}
                                                >
                                                    开始练习
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyTip}>暂无练习内容</div>
                            )}
                        </div>
                    </CapsuleTabs.Tab>
                    <CapsuleTabs.Tab title="考试模式" key="b" className={styles.tabsItem}>
                        <div className={styles.tabsContent}>
                            {filteredTestList.length > 0 ? (
                                filteredTestList.map((item, index) => (
                                    <div key={item.id} className={styles.tabsContentItem}>
                                        <div>
                                            <img src={item.img} alt="课程" />
                                        </div>
                                        <div style={{ width: '100%' }}>
                                            <p className={styles.title}>{item.title}</p>
                                            <div className={styles.actions}>
                                                <Button 
                                                    className={styles.startButton} 
                                                    onClick={() => navigate("/exam", { 
                                                        state: { 
                                                            course: course, 
                                                            page: item.page, 
                                                            cate: 'test',
                                                            title: item.title
                                                        } 
                                                    })}
                                                >
                                                    开始考试
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyTip}>暂无考试内容</div>
                            )}
                        </div>
                    </CapsuleTabs.Tab>
                </CapsuleTabs>
            </div>
        </div>
    );
}