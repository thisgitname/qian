import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavBar, Toast, Button, Modal, DotLoading } from 'antd-mobile';
import { StarFill, StarOutline } from 'antd-mobile-icons';
import axios from './axios';
import styles from './Practice.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { addCollectedQuestion, removeCollectedQuestion, selectCollectedQuestions } from '../../store/collect';
import { addWrongQuestion } from '../../store/wrong';
import { useTimer } from '../../hooks/useTimer';

export default function Practice() {
    const navigate = useNavigate();
    const location = useLocation();
    const { course, page, cate } = location.state || {};//获取课程和页码
    const [list, setList] = useState([]);//题目列表
    const [current, setCurrent] = useState(1);//当前题目
    const [total, setTotal] = useState(0);//总题目数
    const [selectedOption, setSelectedOption] = useState(null);//选中的选项
    const [showAnswer, setShowAnswer] = useState(false);//是否显示答案
    const [answers, setAnswers] = useState([]); // 存储所有题目的答题状态
    const dispatch = useDispatch();
    const collectedQuestions = useSelector(selectCollectedQuestions);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const { getTimeString, getTotalSeconds } = useTimer(isTimerRunning);
    const [loading, setLoading] = useState(true); // 添加loading状态

    // 获取当前练习的存储键
    const getStorageKey = () => {
        return `practiceTime_${course}_${page}`;
    };

    // 获取所有练习的总时间
    const getTotalPracticeTime = () => {
        // 获取当前练习的时间
        const currentTime = getTotalSeconds();
        
        // 获取之前的时间（如果有）
        const previousTime = localStorage.getItem(getStorageKey()) || '00:00:00';
        const [prevHours, prevMinutes, prevSeconds] = previousTime.split(':').map(Number);
        const previousSeconds = prevHours * 3600 + prevMinutes * 60 + prevSeconds;
        
        // 计算总秒数
        const totalSeconds = previousSeconds + currentTime;
        
        // 转换回时分秒格式
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // 获取课程的总练习时间
    const getCourseTotalTime = () => {
        let totalSeconds = 0;
        // 遍历localStorage，找到所有属于当前课程的练习时间
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`practiceTime_${course}_`)) {
                const time = localStorage.getItem(key) || '00:00:00';
                const [hours, minutes, seconds] = time.split(':').map(Number);
                totalSeconds += hours * 3600 + minutes * 60 + seconds;
            }
        }
        
        // 转换回时分秒格式
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // 处理返回按钮点击
    const handleBack = useCallback(() => {
        setIsTimerRunning(false); // 停止计时器
        Modal.confirm({
            title: '确认离开',
            content: '离开后将丢失当前的答题进度，确定要离开吗？',
            confirmText: '确认',
            cancelText: '取消',
            onConfirm: () => {
                // 保存当前练习的时间
                const currentPracticeTime = getTotalPracticeTime();
                localStorage.setItem(getStorageKey(), currentPracticeTime);
                
                // 计算课程的总练习时间
                const courseTotalTime = getCourseTotalTime();
                
                // 导航并传递时间信息
                navigate("/test", { 
                    state: { 
                        course, 
                        practiceTime: courseTotalTime // 传递课程的总练习时间
                    } 
                });
            },
            onCancel: () => {
                setIsTimerRunning(true); // 重新启动计时器
            }
        });
    }, [navigate, course, getTotalSeconds]);

    useEffect(() => {
        const initializeData = async () => {
            try {
                // 验证用户登录状态
                getUserData();
                // 获取题目数据
                await getData();
            } catch (error) {
                Toast.show({
                    icon: 'fail',
                    content: error.message
                });
                if (error.message === '未登录' || error.message === '未设置用户ID' || error.message === '登录信息无效') {
                    navigate('/login');
                } else {
                    navigate('/study');
                }
            }
        };

        initializeData();
    }, []);

    // 获取题目
    const getData = async () => {
        try {
            setLoading(true); // 开始加载
            if (!course || !page) {
                Toast.show({
                    icon: 'fail',
                    content: '参数错误'
                });
                navigate('/study');
                return;
            }

            const res = await axios.get("/lz/list", {
                params: { course: course, page: page, cate: cate }
            });

            if (!res.data || !Array.isArray(res.data.data)) {
                throw new Error('返回数据格式错误');
            }

            setList(res.data.data);
            setTotal(res.data.data.length);
        } catch (error) {
            console.error('获取题目失败：', error);
            Toast.show({
                icon: 'fail',
                content: error.message === '返回数据格式错误' ? '数据格式错误' : '获取题目失败'
            });
            navigate('/study');
        } finally {
            setLoading(false); // 结束加载
        }
    }

    // 获取用户数据
    const getUserData = () => {
        const tokenData = localStorage.getItem('token');
        console.log(tokenData)
        if (!tokenData) {
            throw new Error('未登录');
        }
        try {
            const userData = JSON.parse(tokenData);
            if (!userData.studentId) {
                throw new Error('未设置学生ID');
            }
            return userData;
        } catch (error) {
            throw new Error('登录信息无效');
        }
    };

    // 处理选项选择
    const handleOptionSelect = async (option) => {
        if (showAnswer) return;
        if (!option) return;

        setSelectedOption(option);

        try {
            const userData = getUserData();
            const currentQuestion = list[current - 1];
            if (!currentQuestion || !currentQuestion._id) {
                throw new Error('题目数据不完整');
            }

            // 更新题目状态，state=0 表示已做题
            await axios.post("/lz/updateState", {
                id: currentQuestion._id,
                state: 0,
                studentId: userData.studentId  // 修改这里，使用 studentId 替代 userId
            });
            
            // 检查当前题目是否已经有答案
            const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQuestion._id);
            
            if (existingAnswerIndex !== -1) {
                // 如果已经有答案，更新现有答案
                const updatedAnswers = [...answers];
                updatedAnswers[existingAnswerIndex] = {
                    ...updatedAnswers[existingAnswerIndex],
                    userAnswer: option
                };
                setAnswers(updatedAnswers);
            } else {
                // 如果没有答案，添加新答案
                setAnswers([
                    ...answers,
                    {
                        questionId: currentQuestion._id,
                        title: currentQuestion.title,
                        userAnswer: option,
                        correctAnswer: currentQuestion.answer,
                        isCorrect: null, // 暂不判断对错
                        options: currentQuestion.options
                    }
                ]);
            }
        } catch (error) {
            console.error('更新题目状态失败：', error);
            if (error.message === '未登录' || error.message === '未设置用户ID' || error.message === '登录信息无效') {
                navigate('/login');
            }
            Toast.show({
                icon: 'fail',
                content: error.message === '题目数据不完整' ? '题目数据不完整' : '更新状态失败'
            });
        }
    };

    // 检查答案
    const handleCheckAnswer = async () => {
        const currentQuestion = list[current - 1];
        setShowAnswer(true);

        try {
            // 更新题目状态，state=0 表示已做题
            await axios.post("/lz/updateState", {
                id: currentQuestion._id,
                state: 0
            });

            // 保存当前题目的答题状态（不判断对错）
            const answerState = {
                questionId: currentQuestion._id,
                title: currentQuestion.title,
                userAnswer: selectedOption,
                correctAnswer: currentQuestion.answer,
                isCorrect: null, // 暂不判断对错
                options: currentQuestion.options
            };
            setAnswers(prev => [...prev, answerState]);
        } catch (error) {
            console.error('更新答题状态失败：', error);
            Toast.show({
                icon: 'fail',
                content: error.message === '题目数据不完整' ? '题目数据不完整' : '更新状态失败'
            });
        }
    };

    // 处理下一题
    const handleNext = () => {
        if (current < total) {
            setCurrent(current + 1);
            // 检查下一题是否已经有答案
            const nextQuestionId = list[current]._id;
            const existingAnswer = answers.find(a => a.questionId === nextQuestionId);
            setSelectedOption(existingAnswer?.userAnswer || null);
            setShowAnswer(false);
        } else {
            // 最后一题，检查是否有未完成的题目
            const answeredQuestionIds = answers.map(a => a.questionId);
            const unansweredQuestions = list.filter(q => !answeredQuestionIds.includes(q._id));
            const unansweredCount = unansweredQuestions.length;

            if (unansweredCount > 0) {
                Modal.confirm({
                    title: '提示',
                    content: `还有 ${unansweredCount} 道题目未完成，是否继续提交？`,
                    confirmText: '继续提交',
                    cancelText: '继续作答',
                    onConfirm: async () => {
                        // 将未答题的题目标记为未作答
                        const newAnswers = [
                            ...answers,
                            ...unansweredQuestions.map(q => ({
                                questionId: q._id,
                                title: q.title,
                                userAnswer: null,
                                correctAnswer: q.answer,
                                isCorrect: null, // 暂不判断对错
                                options: q.options
                            }))
                        ];

                        // 在提交时判断所有题目的对错
                        const judgedAnswers = await Promise.all(
                            newAnswers.map(async (answer) => {
                                if (answer.userAnswer !== null) {
                                    const isCorrect = answer.userAnswer === answer.correctAnswer;
                                    // 更新题目状态
                                    await axios.post("/lz/judge", {
                                        id: answer.questionId,
                                        status: isCorrect ? 2 : 1
                                    });
                                    // 如果答错了，添加到错题本
                                    if (!isCorrect) {
                                        const wrongQuestion = {
                                            _id: answer.questionId,
                                            title: answer.title,
                                            options: answer.options.map((option, index) => ({
                                                id: index,
                                                option: option.option,
                                                content: option.content
                                            })),
                                            answer: answer.correctAnswer,
                                            selectedAnswer: answer.userAnswer,
                                            course: course,
                                            timestamp: new Date().toISOString()
                                        };
                                        console.log('添加错题:', wrongQuestion);
                                        dispatch(addWrongQuestion(wrongQuestion));
                                    }
                                    return { ...answer, isCorrect };
                                }
                                return answer;
                            })
                        );
                        
                        // 计算正确率和得分
                        const correctCount = judgedAnswers.filter(a => a.isCorrect).length;
                        const score = Math.round((correctCount / total) * 100);
                        
                        // 如果有错题，显示提示
                        const wrongCount = judgedAnswers.filter(a => a.userAnswer !== null && !a.isCorrect).length;
                        if (wrongCount > 0) {
                            Toast.show({
                                content: '错题已加入错题本',
                                duration: 1000,
                            });
                        }

                        navigate("/result", { 
                            state: { 
                                course: course, 
                                page: page,
                                cate: cate,
                                answers: judgedAnswers,
                                score: score,
                                total: total,
                                correctCount: correctCount,
                                wrongCount: total - correctCount
                            } 
                        });
                    },
                    onCancel: () => {
                        // 跳转到第一个未完成的题目
                        const firstUnansweredIndex = list.findIndex(q => 
                            !answers.some(a => a.questionId === q._id)
                        );
                        if (firstUnansweredIndex !== -1) {
                            setCurrent(firstUnansweredIndex + 1);
                            // 检查当前题目是否已经有答案
                            const currentQuestionId = list[firstUnansweredIndex]._id;
                            const existingAnswer = answers.find(a => a.questionId === currentQuestionId);
                            setSelectedOption(existingAnswer?.userAnswer || null);
                            setShowAnswer(false);
                        }
                    }
                });
            } else {
                // 所有题目都已完成，判断对错并提交
                Modal.confirm({
                    title: '提示',
                    content: '确定要提交答案吗？',
                    confirmText: '确定',
                    cancelText: '取消',
                    onConfirm: async () => {
                        // 判断所有题目的对错
                        const judgedAnswers = await Promise.all(
                            answers.map(async (answer) => {
                                const isCorrect = answer.userAnswer === answer.correctAnswer;
                                // 更新题目状态
                                await axios.post("/lz/judge", {
                                    id: answer.questionId,
                                    status: isCorrect ? 2 : 1
                                });
                                // 如果答错了，添加到错题本
                                if (!isCorrect) {
                                    const wrongQuestion = {
                                        _id: answer.questionId,
                                        title: answer.title,
                                        options: answer.options.map((option, index) => ({
                                            id: index,
                                            option: option.option,
                                            content: option.content
                                        })),
                                        answer: answer.correctAnswer,
                                        selectedAnswer: answer.userAnswer,
                                        course: course,
                                        timestamp: new Date().toISOString()
                                    };
                                    console.log('添加错题:', wrongQuestion);
                                    dispatch(addWrongQuestion(wrongQuestion));
                                }
                                return { ...answer, isCorrect };
                            })
                        );
                        
                        // 计算正确率和得分
                        const correctCount = judgedAnswers.filter(a => a.isCorrect).length;
                        const score = Math.round((correctCount / total) * 100);
                        
                        // 如果有错题，显示提示
                        const wrongCount = judgedAnswers.filter(a => !a.isCorrect).length;
                        if (wrongCount > 0) {
                            Toast.show({
                                content: '错题已加入错题本',
                                duration: 1000,
                            });
                        }

                        navigate("/result", { 
                            state: { 
                                course: course, 
                                page: page,
                                cate: cate,
                                answers: judgedAnswers,
                                score: score,
                                total: total,
                                correctCount: correctCount,
                                wrongCount: wrongCount
                            } 
                        });
                    }
                });
            }
        }
    };

    // 获取选项的样式
    const getOptionStyle = (option) => {
        // 只显示选中状态，不显示对错
        return selectedOption === option.option ? styles.selected : '';
    };

    // 添加收藏功能
    const handleCollect = (question) => {
        // 验证登录状态
        const token = localStorage.getItem('token');
        if (!token) {
            Toast.show({
                icon: 'fail',
                content: '请先登录',
                afterClose: () => {
                    navigate('/login');
                }
            });
            return;
        }

        // 验证题目数据完整性
        if (!question || !question._id || !question.title) {
            Toast.show({
                icon: 'fail',
                content: '题目数据不完整'
            });
            return;
        }

        try {
            const isCollected = collectedQuestions.some(q => q._id === question._id);
            if (isCollected) {
                dispatch(removeCollectedQuestion(question._id));
                Toast.show({
                    icon: 'success',
                    content: '已取消收藏'
                });
            } else {
                dispatch(addCollectedQuestion(question));
                Toast.show({
                    icon: 'success',
                    content: '收藏成功'
                });
            }
        } catch (error) {
            console.error('收藏操作失败：', error);
            Toast.show({
                icon: 'fail',
                content: '操作失败，请重试'
            });
        }
    };

    return (
        <div className={styles.container}>
            <NavBar 
                onBack={handleBack}
                right={
                    <div className={styles.timer}>
                        {getTimeString()}
                    </div>
                }
            >
                {course}练习 {current}/{total}
            </NavBar>
            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <DotLoading color='primary' />
                        <span className={styles.loadingText}>题目加载中...</span>
                    </div>
                ) : (
                    list.slice((current - 1) * 1, current * 1).map((item, index) => (
                        <div key={index} className={styles.questionCard}>
                            <div className={styles.question}>
                                <div className={styles.questionHeader}>
                                    <h3>{current}. {item.title}</h3>
                                    <div 
                                        className={styles.starIcon}
                                        onClick={() => handleCollect(item)}
                                    >
                                        {collectedQuestions.some(q => q._id === item._id) 
                                            ? <StarFill color='#ffd700' fontSize={24} />
                                            : <StarOutline color='#999' fontSize={24} />
                                        }
                                    </div>
                                </div>
                                <div className={styles.options}>
                                    {item.options.map((option, optionIndex) => (
                                        <div
                                            key={optionIndex}
                                            className={`${styles.option} ${getOptionStyle(option)}`}
                                            onClick={() => handleOptionSelect(option.option)}
                                        >
                                            {option.option}. {option.content}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <Button 
                                    className={styles.submitButton}
                                    onClick={handleNext}
                                >
                                    {showAnswer ? (current >= total ? '完成' : '下一题') : '确认答案'}
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}