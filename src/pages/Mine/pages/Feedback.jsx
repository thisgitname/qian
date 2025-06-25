import React, { useState, useCallback, useRef } from 'react';
import styles from '../pagescss.css/Feedback.module.css';
import { useNavigate } from 'react-router-dom';
import {Toast } from 'antd-mobile'
import axios from '../main';
// 防抖函数
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function Feedback() {
  let a=JSON.parse(localStorage.getItem('token'))
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userid:a._id,
    feedback: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    feedback: false,
    phone: false
  });
  const textareaRef = useRef(null);




  // 表单验证逻辑
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.feedback.trim()) {
      newErrors.feedback = '请输入反馈内容';
    } else if (formData.feedback.length < 10) {
      newErrors.feedback = '反馈内容至少需要10个字符';
    } else if (formData.feedback.length > 500) {
      newErrors.feedback = '反馈内容不能超过500个字符';
    }
    
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 处理输入变化，并自适应高度
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 实时清除错误状态
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'feedback' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [errors]);

  // 提交逻辑
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    // 触发表单所有字段，以显示所有错误
    setTouched({ feedback: true, phone: true });
    
    if (!validateForm()) {
      // 如果有错误，则阻止提交
      console.log('表单验证失败');
      return;
    }
    setIsSubmitting(true);
    try {
      // 模拟API调用
      const res = await axios.post('/yy/postfeedback', formData);
      console.log(res);
      Toast.show({
        icon: 'success',
        content: '反馈成功，感谢您的反馈',
      })
      navigate('/mine'); 
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, navigate]);

  return (
    <div className={styles.containerSimple}>
      <header className={styles.headerSimple}>
        <button 
          className={styles.backArrowSimple} 
          onClick={() => navigate(-1)}
          aria-label="返回"
        >
          &#60;
        </button>
        <h1 className={styles.titleSimple}>意见反馈</h1>
      </header>
      <main className={styles.contentSimple}>
        <form onSubmit={handleSubmit} autoComplete="off" aria-label="意见反馈表单" noValidate>
          <div className={styles.formBlockSimple}>
            <label htmlFor="feedback" className={styles.labelSimple}>反馈的问题</label>
            <textarea
              id="feedback"
              name="feedback"
              className={`${styles.textareaSimple} ${touched.feedback && errors.feedback ? styles.error : ''}`}
              placeholder="请详细描述您遇到的问题或建议（至少10个字符，最多500字符）"
              value={formData.feedback}
              onChange={handleInputChange}
              ref={textareaRef}
              rows={4}
              aria-invalid={!!(touched.feedback && errors.feedback)}
              aria-describedby={touched.feedback && errors.feedback ? 'feedback-error' : undefined}
            />
            {touched.feedback && errors.feedback && (
              <div id="feedback-error" className={styles.errorMessage} role="alert" aria-live="polite">
                {errors.feedback}
              </div>
            )}
          </div>
          <div className={styles.formBlockSimple}>
            <label htmlFor="phone" className={`${styles.labelSimple} ${styles.optionalLabel}`}>联系方式（选填）</label>
            <input
              id="phone"
              name="phone"
              className={`${styles.inputSimple} ${touched.phone && errors.phone ? styles.error : ''}`}
              placeholder="请留下您的手机号码"
              value={formData.phone}
              onChange={handleInputChange}
              type="tel"
              inputMode="numeric"
              maxLength={20}
              autoComplete="tel"
              aria-invalid={!!(touched.phone && errors.phone)}
              aria-describedby={touched.phone && errors.phone ? 'phone-error' : undefined}
            />
            {touched.phone && errors.phone && (
              <div id="phone-error" className={styles.errorMessage} role="alert" aria-live="polite">
                {errors.phone}
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className={styles.submitBtnSimple}
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? '提交中...' : '提交'}
          </button>
        </form>
      </main>
    </div>
  );
}
