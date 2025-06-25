import React, { useState, useEffect } from 'react';
import './Rili.module.css';
import Navbar from '../component/Navbar';
import 'antd-mobile/es/global';
import axios from 'axios';

// 星期几的显示文本
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 积分签到日历主组件
const PointsCalendar = () => {
  // 当前显示的月份
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // 用户已签到的所有日期
  const [signedDates, setSignedDates] = useState([]);
  // 小圆点颜色，默认黄色
  const [dotColor, setDotColor] = useState(() => localStorage.getItem('signedDotColor') || '#ffc300');
  // 签到点形状，默认圆形
  const [dotShape, setDotShape] = useState(() => localStorage.getItem('signedDotShape') || 'circle');

  // 颜色选择器变更
  const handleColorChange = (e) => {
    setDotColor(e.target.value);
    localStorage.setItem('signedDotColor', e.target.value);
  };
  // 形状选择器变更
  const handleShapeChange = (e) => {
    setDotShape(e.target.value);
    localStorage.setItem('signedDotShape', e.target.value);
  };

  // 组件挂载或月份切换时，从后端加载签到数据
  useEffect(() => {
    // 加载当前用户所有签到日期
    const loadSignedDates = async () => {
      const userid = localStorage.getItem('user');
      if (!userid) return;
      try {
        // 请求后端接口，获取签到记录
        const res = await axios.get(`http://localhost:3000/ss/signin/${userid}`);
        if (res.data.code === 200) {
          // 将签到日期字符串转为Date对象
          setSignedDates(res.data.data.map(item => new Date(item.date)));
        } else {
          setSignedDates([]);
        }
      } catch (e) {
        setSignedDates([]);
      }
    };
    loadSignedDates();
  }, [currentMonth]); // 切换月份时也重新加载
  
  // 生成当前月份的日历数据（包含上月补位、本月天数）
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month, 1).getDay();
    // 获取当月的天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // 日历数据数组
    const calendarDays = [];
    // 添加上个月的日期（用于填充日历开头的空白）
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDay = new Date(year, month, -i).getDate();
      calendarDays.push({
        day: prevMonthDay,
        isCurrentMonth: false,
        isChecked: false,
        isToday: false
      });
    }
    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date();
      // 判断是否为今天
      const isToday = (
        currentDate.getFullYear() === year &&
        currentDate.getMonth() === month &&
        currentDate.getDate() === i
      );
      // 检查该日期是否已签到（用后端返回的signedDates判断）
      const isChecked = signedDates.some(date => 
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === i
      );
      calendarDays.push({
        day: i,
        isCurrentMonth: true,
        isChecked,
        isToday
      });
    }
    return calendarDays;
  };
  
  // 切换到上个月
  const goToPrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };
  // 切换到下个月
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };
  // 渲染日历单元格
  const renderDayCell = (dayData, index) => {
    const { day, isCurrentMonth, isChecked, isToday } = dayData;
    // 形状样式映射
    let shapeStyle = {};
    if (dotShape === 'circle') {
      shapeStyle = { borderRadius: '50%' };
    } else if (dotShape === 'square') {
      shapeStyle = { borderRadius: '2px' };
    } else if (dotShape === 'triangle') {
      // 用css画三角形
      shapeStyle = {
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderBottom: `10px solid ${dotColor}`,
        background: 'none',
        margin: '2px auto 0 auto',
      };
    }
    return (
      <div 
        key={index}
        className={
          `${styles.dayCell} ` +
          (isCurrentMonth ? styles.currentMonth : styles.otherMonth) +
          (isChecked ? ' ' + styles.checkedDay : '') +
          (isToday ? ' ' + styles.today : '')
        }
      >
        <span>{day}</span>
        {/* 已签到显示自定义形状和颜色 */}
        {isChecked && dotShape !== 'triangle' && (
          <div className={styles.signedDot} style={{background: dotColor, ...shapeStyle}}></div>
        )}
        {isChecked && dotShape === 'triangle' && (
          <div style={shapeStyle}></div>
        )}
      </div>
    );
  };
  
  // 组件渲染
  return (
   <div>
     <div>
      {/* 顶部导航栏 */}
      <Navbar title="积分日历"/>
     </div>
     {/* 颜色和形状选择器 */}
     <div
       style={{
         display: 'flex',
         alignItems: 'center',
         gap: '8px',
         margin: '12px 12px 0 12px',
         height: '36px',
         flexWrap: 'wrap'
       }}
     >
       {/* 颜色选择器 */}
       <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
         <label htmlFor="dotColorPicker" style={{ fontSize: '15px', whiteSpace: 'nowrap' }}>颜色</label>
         <input
           id="dotColorPicker"
           type="color"
           value={dotColor}
           onChange={handleColorChange}
           style={{
             width: '32px',
             height: '32px',
             border: 'none',
             background: 'none',
             padding: 0,
             verticalAlign: 'middle'
           }}
         />
       </div>
       {/* 形状选择器 */}
       <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
         <label htmlFor="dotShapePicker" style={{ fontSize: '15px', whiteSpace: 'nowrap' }}>形状</label>
         <select
           id="dotShapePicker"
           value={dotShape}
           onChange={handleShapeChange}
           style={{
             height: '32px',
             fontSize: '15px',
             minWidth: '70px',
             maxWidth: '120px',
             borderRadius: '6px',
             border: '1px solid #ccc',
             padding: '0 10px',
             lineHeight: '32px',
             verticalAlign: 'middle',
             boxSizing: 'border-box',
             background: '#fff'
           }}
         >
           <option value="circle">圆形</option>
           <option value="square">方形</option>
           <option value="triangle">三角形</option>
         </select>
       </div>
     </div>
     <div className={styles.calendarContainer}>
       {/* 头部 - 月份显示和导航 */}
       <div className={styles.calendarHeader}>
         <button 
           className={styles.prevButton} 
           onClick={goToPrevMonth}
         >
           &lt;
         </button>
         <h2 className={styles.monthTitle}>
           {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
         </h2>
         <button 
           className={styles.nextButton} 
           onClick={goToNextMonth}
         >
           &gt;
         </button>
       </div>
       {/* 星期表头 */}
       <div className={styles.weekdays}>
         {WEEKDAYS.map((day, index) => (
           <div key={index} className={styles.weekday}>
             {day}
           </div>
         ))}
       </div>
       {/* 日历主体 */}
       <div className={styles.calendarGrid}>
         {generateCalendar().map(renderDayCell)}
       </div>
     </div>
   </div>
  );
};

export default PointsCalendar;
