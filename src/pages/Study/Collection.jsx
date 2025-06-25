import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavBar, Empty, Toast, InfiniteScroll } from "antd-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { selectCollectedQuestions, removeCollectedQuestion } from "../../store/collect";
import styles from "./Collection.module.css";

export default function Collection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { course } = location.state || {};
    const dispatch = useDispatch();
    const collectedQuestions = useSelector(selectCollectedQuestions);
    const [displayQuestions, setDisplayQuestions] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 3;
    
    // 根据课程筛选收藏题目
    const filteredQuestions = course 
        ? collectedQuestions.filter(q => q.course === course)
        : collectedQuestions;

    // 重置显示的题目
    const resetDisplayQuestions = () => {
        const initialQuestions = filteredQuestions.slice(0, pageSize);
        setDisplayQuestions(initialQuestions);
        setHasMore(initialQuestions.length < filteredQuestions.length);
    };

    useEffect(() => {
        resetDisplayQuestions();
    }, [course, collectedQuestions]);

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
        navigate('/study', { state: { course } });
    };

    const handleRemoveCollection = (questionId) => {
        dispatch(removeCollectedQuestion(questionId));
        
        // 更新显示的题目列表
        const updatedDisplayQuestions = displayQuestions.filter(q => q._id !== questionId);
        setDisplayQuestions(updatedDisplayQuestions);
        
        // 如果当前显示的题目数量小于pageSize，尝试加载更多
        if (updatedDisplayQuestions.length < pageSize) {
            const remainingQuestions = filteredQuestions
                .filter(q => q._id !== questionId)
                .slice(updatedDisplayQuestions.length, pageSize);
            
            if (remainingQuestions.length > 0) {
                setDisplayQuestions([...updatedDisplayQuestions, ...remainingQuestions]);
            }
        }

        // 更新hasMore状态
        const totalRemaining = filteredQuestions.filter(q => q._id !== questionId).length;
        setHasMore(updatedDisplayQuestions.length < totalRemaining);

        Toast.show({
            icon: 'success',
            content: '已取消收藏'
        });
    };

    // 添加错误边界
    if (!Array.isArray(collectedQuestions)) {
        console.error('收藏数据格式错误：', collectedQuestions);
        return (
            <div>
                <NavBar onBack={handleBack}>我的收藏</NavBar>
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
                {course ? `${course}收藏题目(${filteredQuestions.length})` : `收藏题目(${collectedQuestions.length})`}
            </NavBar>
            <div className={styles.container}>
                {filteredQuestions.length === 0 ? (
                    <Empty
                        description={course ? `暂无${course}的收藏题目` : "暂无收藏题目"}
                        style={{
                            padding: '64px 0'
                        }}
                    />
                ) : (
                    <div className={styles.questionList}>
                        {displayQuestions.map((question, index) => (
                            <div key={question._id} className={styles.questionBox}>
                                <div className={styles.titleRow}>
                                    <div className={styles.title}>
                                        {index + 1}. {question.title}
                                    </div>
                                    <div 
                                        className={styles.removeButton}
                                        onClick={() => handleRemoveCollection(question._id)}
                                    >
                                        取消收藏
                                    </div>
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
                            </div>
                        ))}
                        <InfiniteScroll loadMore={loadMoreData} hasMore={hasMore} />
                    </div>
                )}
            </div>
        </>
    );
}