import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavBar, Empty, Toast, InfiniteScroll } from "antd-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { selectWrongQuestions, setCurrentUser } from "../../store/wrong";
import styles from "./Wrongs.module.css";

// 格式化时间戳
const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default function Wrongs() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { course } = location.state || {};
    const wrongQuestions = useSelector(selectWrongQuestions);
    const [displayQuestions, setDisplayQuestions] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 3;
    
    // 初始化错题数据
    useEffect(() => {
        const userId = localStorage.getItem('userid');
        if (userId) {
            dispatch(setCurrentUser(userId));
        }
    }, [dispatch]);

    // 根据课程筛选错题
    const filteredQuestions = course 
        ? wrongQuestions.filter(q => q.course === course)
        : wrongQuestions;

    useEffect(() => {
        // 初始化显示第一页数据
        loadMoreData();
    }, [course, wrongQuestions]);

    const loadMoreData = async () => {
        // 模拟异步加载
        await new Promise((resolve) => setTimeout(resolve, 500));

        const currentLength = displayQuestions.length;
        const newQuestions = filteredQuestions.slice(
            currentLength,
            currentLength + pageSize
        );

        if (newQuestions.length > 0) {
            setDisplayQuestions([...displayQuestions, ...newQuestions]);
        }

        // 判断是否还有更多数据
        setHasMore(currentLength + newQuestions.length < filteredQuestions.length);
    };

    const handleBack = () => {
        console.log('Wrongs - 点击返回，当前 course:', course);
        navigate('/study', { state: { course } });
    };

    // 添加错误边界
    if (!Array.isArray(wrongQuestions)) {
        console.error('错题数据格式错误：', wrongQuestions);
        return (
            <div>
                <NavBar onBack={handleBack}>错题本</NavBar>
                <Empty description="数据加载错误" />
            </div>
        );
    }

    return (
        <>
            <NavBar
                onBack={handleBack}
                className={styles.navBar}
            >
                {course ? `${course}错题本(${filteredQuestions.length})` : `错题本(${wrongQuestions.length})`}
            </NavBar>
            <div className={styles.container}>
                {filteredQuestions.length === 0 ? (
                    <Empty
                        description={course ? `暂无${course}的错题记录` : "暂无错题记录"}
                        style={{
                            padding: '64px 0'
                        }}
                    />
                ) : (
                    <div className={styles.questionList}>
                        {displayQuestions.map((question, index) => (
                            <div key={question._id} className={styles.questionBox}>
                                <div className={styles.title}>
                                    {index + 1}. {question.title}
                                </div>
                                <div className={styles.options}>
                                    {question.options.map(option => (
                                        <div
                                            key={option.id}
                                            className={`${styles.option} 
                                                ${option.option === question.answer ? styles.correct : ''} 
                                                ${option.option === question.selectedAnswer ? styles.wrong : ''}`}
                                        >
                                            {option.option}、{option.content}
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.analysis}>
                                    <div className={styles.answerInfo}>
                                        <span className={styles.label}>正确答案：</span>
                                        <span className={styles.value}>{question.answer}</span>
                                    </div>
                                    <div className={styles.answerInfo}>
                                        <span className={styles.label}>你的答案：</span>
                                        <span className={styles.value}>{question.selectedAnswer}</span>
                                    </div>
                                    <div className={styles.courseInfo}>
                                        <span className={styles.label}>所属课程：</span>
                                        <span className={styles.value}>{question.course}</span>
                                    </div>
                                </div>
                                <div className={styles.timestamp}>
                                    加入时间：{formatTimestamp(question.timestamp)}
                                </div>
                            </div>
                        ))}
                        <InfiniteScroll loadMore={loadMoreData} hasMore={hasMore} />
                    </div>
                )}
            </div>
        </>
    );
}