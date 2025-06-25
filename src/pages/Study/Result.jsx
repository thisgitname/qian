import React, { useState } from "react";
import { NavBar, Button, Modal } from "antd-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Result.module.css";

export default function Result() {
    const navigate = useNavigate();
    const location = useLocation();
    const { 
        course, 
        answers = [], 
        score = 0, 
        total = 0, 
        correctCount = 0, 
        wrongCount = 0 
    } = location.state || {};

    const [selectedQuestion, setSelectedQuestion] = useState(null);

    // 计算各类题目数量
    const calculateStats = (answers) => {
        const total = answers.length;
        const correctCount = answers.filter(a => a.isCorrect === true).length;
        const wrongCount = answers.filter(a => a.isCorrect === false && a.userAnswer !== null).length;
        const unansweredCount = answers.filter(a => a.userAnswer === null).length;
        const score = Math.round((correctCount / total) * 100);

        return {
            total,
            correctCount,
            wrongCount,
            unansweredCount,
            score
        };
    };

    // 获取题目的状态样式
    const getQuestionStyle = (answer) => {
        if (answer.userAnswer === null) {
            return styles.unanswered;
        }
        return answer.isCorrect ? styles.correct : styles.wrong;
    };

    // 渲染题目列表
    const renderQuestions = () => {
        return answers.map((answer, index) => (
            <div
                key={answer.questionId}
                className={`${styles.questionCircle} ${getQuestionStyle(answer)}`}
                onClick={() => showQuestionDetail(answer)}
            >
                {index + 1}
            </div>
        ));
    };

    // 计算统计数据
    const stats = calculateStats(answers);

    const handleBack = () => {
        navigate("/test", { state: { course } });
    };

    const handleRetry = () => {
        navigate("/practice", { 
            state: { 
                course: course,
                page: location.state?.page,
                cate: location.state?.cate
            } 
        });
    };

    const showQuestionDetail = (answer) => {
        setSelectedQuestion(answer);
        Modal.show({
            content: (
                <div className={styles.questionDetail}>
                    <h3>{answer.title}</h3>
                    <div className={styles.optionsList}>
                        {answer.options.map((option, index) => (
                            <div
                                key={index}
                                className={`${styles.optionItem} 
                                    ${option.option === answer.correctAnswer ? styles.correct : ''} 
                                    ${option.option === answer.userAnswer ? 
                                        (option.option === answer.correctAnswer ? styles.correct : styles.wrong) 
                                        : ''}`}
                            >
                                {option.option}. {option.content}
                            </div>
                        ))}
                    </div>
                    {answer.userAnswer === null ? (
                        <div className={styles.answerStatus}>
                            <span className={styles.unanswered}>未作答</span>
                            <span className={styles.correctAnswer}>
                                正确答案：{answer.correctAnswer}
                            </span>
                        </div>
                    ) : (
                        <div className={styles.answerStatus}>
                            <span>你的答案：{answer.userAnswer}</span>
                            <span className={styles.correctAnswer}>
                                正确答案：{answer.correctAnswer}
                            </span>
                        </div>
                    )}
                </div>
            ),
            closeOnMaskClick: true,
            showCloseButton: true,
        });
    };

    return (
        <div className={styles.container}>
            <NavBar onBack={handleBack}>答题结果</NavBar>
            <div className={styles.content}>
                <div className={styles.scoreCard}>
                    <div className={styles.score}>{stats.score}</div>
                    <div className={styles.scoreLabel}>总分：{stats.score}</div>
                </div>
                <div className={styles.statsContainer}>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>{stats.total}</div>
                        <div className={styles.statLabel}>总题数</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>{stats.correctCount}</div>
                        <div className={styles.statLabel}>答对</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>{stats.wrongCount}</div>
                        <div className={styles.statLabel}>答错</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>{stats.unansweredCount}</div>
                        <div className={styles.statLabel}>未作答</div>
                    </div>
                </div>
                <div className={styles.questionsGrid}>
                    {renderQuestions()}
                </div>
                <div className={styles.legend}>
                    <div className={styles.legendItem}>
                        <div className={`${styles.legendDot} ${styles.correct}`}></div>
                        <span>答对题目</span>
                    </div>
                    <div className={styles.legendItem}>
                        <div className={`${styles.legendDot} ${styles.wrong}`}></div>
                        <span>答错题目</span>
                    </div>
                    <div className={styles.legendItem}>
                        <div className={`${styles.legendDot} ${styles.unanswered}`}></div>
                        <span>未作答</span>
                    </div>
                </div>
                <div className={styles.buttonGroup}>
                    <Button className={styles.retryButton} onClick={handleRetry}>
                        重新练习
                    </Button>
                    <Button className={styles.backButton} onClick={handleBack}>
                        返回题库
                    </Button>
                </div>
            </div>
        </div>
    );
}