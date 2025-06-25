import React, { useEffect, useState, useCallback, memo, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../pagescss.css/Kaodetail.module.css'

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in exam detail:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center', 
          color: '#666',
          animation: `${styles.fadeIn} 0.3s ease-out`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <h3 style={{ 
            fontSize: '18px', 
            color: '#1a1a1a', 
            marginBottom: '12px',
            fontWeight: '600' 
          }}>
            页面加载出现问题
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#666', 
            marginBottom: '24px',
            maxWidth: '300px',
            margin: '0 auto 24px'
          }}>
            抱歉，页面加载时遇到了一些问题。请尝试重新加载或返回上一页。
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                border: 'none',
                background: '#1890ff',
                color: 'white',
                borderRadius: '24px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '15px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(24,144,255,0.15)'
              }}
            >
              重新加载
            </button>
            <button 
              onClick={() => window.history.back()}
              style={{
                padding: '10px 24px',
                border: '1px solid #d9d9d9',
                background: 'transparent',
                color: '#666',
                borderRadius: '24px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '15px',
                transition: 'all 0.2s'
              }}
            >
              返回上一页
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 加载动画组件
const LoadingSpinner = () => (
  <div style={{ 
    display: 'inline-block',
    width: '30px',
    height: '30px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #1890ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }}>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// 加载状态组件
const LoadingState = () => (
  <div style={{ 
    padding: '40px', 
    textAlign: 'center', 
    color: '#999',
    animation: `${styles.fadeIn} 0.3s ease-out`
  }}>
    <LoadingSpinner />
    <div style={{ marginTop: '16px', fontSize: '15px', color: '#666' }}>
      加载中...
    </div>
  </div>
);

// 记分卡组件
const ScoreCard = memo(({ score, accuracyRate, correctCount, wrongCount, unansweredCount }) => (
  <div className={styles.resultCard}>
    <div className={styles.resultHeader}>
      <span className={styles.resultTitle}>
        📝 共{correctCount + wrongCount + unansweredCount}题，总分100分
      </span>
      <button className={styles.reviewButton}>
        考试回顾
      </button>
    </div>

    <div className={styles.scoreSection}>
      <div className={styles.scoreBlock}>
        <div className={styles.score}>{score}</div>
        <div className={styles.scoreLabel}>考试分数</div>
      </div>
      <div className={styles.scoreBlock}>
        <div className={styles.accuracyRate}>{accuracyRate}%</div>
        <div className={styles.accuracyLabel}>正确率</div>
      </div>
    </div>

    <div className={styles.statsRow}>
      <div className={styles.statItem}>
        <div className={styles.statValue} style={{color: '#1890ff'}}>{correctCount}</div>
        <div className={styles.statLabel}>正确</div>
      </div>
      <div className={styles.statItem}>
        <div className={styles.statValue} style={{color: '#ff4d4f'}}>{wrongCount}</div>
        <div className={styles.statLabel}>错误</div>
      </div>
      <div className={styles.statItem}>
        <div className={styles.statValue} style={{color: '#8c8c8c'}}>{unansweredCount}</div>
        <div className={styles.statLabel}>未答</div>
      </div>
    </div>
  </div>
));

// 问题网格组件
const QuestionGrid = memo(({ questions }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleQuestionClick = useCallback((index) => {
    setSelectedQuestion(index);
    // TODO: 实现题目详情查看功能
    console.log(`Question ${index + 1} clicked`);
  }, []);

  return (
    <div className={styles.questionSection}>
      <div className={styles.questionHeader}>
        <div className={styles.questionTitle}>
          试题
          <span className={styles.totalQuestions}>共{questions.length}题</span>
        </div>
      </div>
      <div className={styles.questionList}>
        {questions.map((question, index) => {
          const isCorrect = question.answer === question.userAnswer;
          const isAnswered = !!question.userAnswer;
          const status = isAnswered ? (isCorrect ? 'correct' : 'wrong') : 'unanswered';
          const isSelected = selectedQuestion === index;

          return (
            <div 
              key={index}
              className={`${styles.questionItem} ${styles[status]} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleQuestionClick(index)}
              role="button"
              tabIndex={0}
              aria-label={`题目 ${index + 1}, 状态: ${
                status === 'correct' ? '正确' : 
                status === 'wrong' ? '错误' : '未答'
              }`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleQuestionClick(index);
                }
              }}
            >
              {index + 1}
              <div className={`${styles.questionDot} ${styles[status]}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
});

// 空状态组件
const EmptyState = ({ onBack }) => (
  <div style={{ 
    padding: '40px 20px', 
    textAlign: 'center', 
    color: '#666',
    animation: `${styles.fadeIn} 0.3s ease-out`
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
    <h3 style={{ 
      fontSize: '18px', 
      color: '#1a1a1a', 
      marginBottom: '12px',
      fontWeight: '600' 
    }}>
      暂无考试记录
    </h3>
    <p style={{ 
      fontSize: '14px', 
      color: '#666', 
      marginBottom: '24px',
      maxWidth: '300px',
      margin: '0 auto 24px'
    }}>
      您还没有参加过考试，请先完成一次考试后查看详情。
    </p>
    <button 
      onClick={onBack}
      style={{
        padding: '10px 24px',
        border: 'none',
        background: '#1890ff',
        color: 'white',
        borderRadius: '24px',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '15px',
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(24,144,255,0.15)'
      }}
    >
      返回
    </button>
  </div>
);

export default function Kaodetail() {
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadExamData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = localStorage.getItem('examRecords');
      if (data) {
        const parsedData = JSON.parse(data);
        setExamData(parsedData[0]); // 获取最新的考试记录
      }
    } catch (error) {
      console.error('Error parsing exam data:', error);
    } finally {
      // 添加一个小延迟以确保加载动画显示完整
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, []);

  useEffect(() => {
    loadExamData();
  }, [loadExamData]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!examData) {
    return <EmptyState onBack={() => navigate(-1)} />;
  }

  const correctCount = examData.questions.filter(q => q.answer === q.userAnswer).length;
  const wrongCount = examData.questions.filter(q => q.answer !== q.userAnswer && q.userAnswer).length;
  const unansweredCount = examData.questions.filter(q => !q.userAnswer).length;
  const accuracyRate = Math.round((correctCount / examData.questions.length) * 100);
  const score = examData.score || 75;

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <header className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="返回"
          >
            ←
          </button>
          <h1 className={styles.title}>考试详情</h1>
        </header>

        <div className={styles.examInfo}>
          <div className={styles.examTitle}>{examData.title || "当代文学考试"}</div>
          <div className={styles.examDuration}>
            <span>⏱️</span>
            <span>考试时长：60分钟</span>
          </div>
          <div className={styles.pencilIcon}>✏️</div>
        </div>

        <Suspense fallback={<LoadingState />}>
          <ScoreCard 
            score={score}
            accuracyRate={accuracyRate}
            correctCount={correctCount}
            wrongCount={wrongCount}
            unansweredCount={unansweredCount}
          />

          <QuestionGrid questions={examData.questions} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
