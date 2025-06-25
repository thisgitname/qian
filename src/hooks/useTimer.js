import { useState, useEffect, useCallback } from 'react';

export const useTimer = (isRunning = true) => {
    const [totalSeconds, setTotalSeconds] = useState(0);

    // 格式化时间显示
    const formatTime = (value) => {
        return String(value).padStart(2, '0');
    };

    // 获取时、分、秒
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // 获取总时间字符串
    const getTimeString = useCallback(() => {
        return `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
    }, [hours, minutes, seconds]);

    // 获取总秒数
    const getTotalSeconds = useCallback(() => {
        return totalSeconds;
    }, [totalSeconds]);

    // 更新计时器
    useEffect(() => {
        let timer;
        if (isRunning) {
            timer = setInterval(() => {
                setTotalSeconds(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [isRunning]);

    return {
        hours,
        minutes,
        seconds,
        formatTime,
        getTimeString,
        getTotalSeconds
    };
}; 
