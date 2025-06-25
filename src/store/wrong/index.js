import { createSlice } from '@reduxjs/toolkit';

// 获取用户特定的错题数据
const getUserWrongQuestions = (userId) => {
    try {
        const allWrongQuestions = JSON.parse(localStorage.getItem('allWrongQuestions')) || {};
        // 如果数据是数组格式，则将其转换为正确的格式
        if (Array.isArray(allWrongQuestions)) {
            const convertedData = {
                [userId]: allWrongQuestions
            };
            localStorage.setItem('allWrongQuestions', JSON.stringify(convertedData));
            return allWrongQuestions;
        }
        // 如果是对象格式，但用户ID是对象
        if (allWrongQuestions[userId] && typeof allWrongQuestions[userId] === 'object' && !Array.isArray(allWrongQuestions[userId])) {
            // 提取第一个键的值作为错题数组
            const firstKey = Object.keys(allWrongQuestions[userId])[0];
            if (Array.isArray(allWrongQuestions[userId][firstKey])) {
                return allWrongQuestions[userId][firstKey];
            }
        }
        return allWrongQuestions[userId] || [];
    } catch (error) {
        console.error('获取错题数据失败:', error);
        return [];
    }
};

// 保存用户特定的错题数据
const saveUserWrongQuestions = (userId, questions) => {
    try {
        const allWrongQuestions = JSON.parse(localStorage.getItem('allWrongQuestions')) || {};
        // 确保 allWrongQuestions 是一个对象
        if (Array.isArray(allWrongQuestions)) {
            const convertedData = {
                [userId]: questions
            };
            localStorage.setItem('allWrongQuestions', JSON.stringify(convertedData));
        } else {
            allWrongQuestions[userId] = questions;
            localStorage.setItem('allWrongQuestions', JSON.stringify(allWrongQuestions));
        }
        // 打印存储后的数据，用于调试
        console.log('保存的错题数据:', JSON.parse(localStorage.getItem('allWrongQuestions')));
    } catch (error) {
        console.error('保存错题数据失败:', error);
    }
};

// 获取当前用户ID
const getCurrentUserId = () => {
    const userId = localStorage.getItem('userid');
    console.log('当前用户ID:', userId);
    return userId || null;
};

const initialState = {
    wrongQuestions: [],
    currentUserId: getCurrentUserId()
};

// 如果有当前用户ID，立即加载该用户的错题
if (initialState.currentUserId) {
    initialState.wrongQuestions = getUserWrongQuestions(initialState.currentUserId);
    console.log('初始化加载的错题:', initialState.wrongQuestions);
}

const wrongSlice = createSlice({
    name: 'wrong',
    initialState,
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUserId = action.payload;
            state.wrongQuestions = getUserWrongQuestions(action.payload);
        },
        addWrongQuestion: (state, action) => {
            if (!state.currentUserId) {
                console.error('未设置用户ID');
                return;
            }

            try {
                // 数据验证
                if (!action.payload || !action.payload._id || !action.payload.title) {
                    console.error('错题数据格式不正确：', action.payload);
                    return;
                }

                // 检查是否已存在相同的题目
                const exists = state.wrongQuestions.some(q => q._id === action.payload._id);
                
                if (!exists) {
                    // 确保数据结构完整
                    const wrongQuestion = {
                        _id: action.payload._id,
                        title: action.payload.title,
                        options: Array.isArray(action.payload.options) ? action.payload.options : [],
                        answer: action.payload.answer || '',
                        selectedAnswer: action.payload.selectedAnswer || '',
                        course: action.payload.course || '',
                        timestamp: new Date().toISOString()
                    };
                    
                    state.wrongQuestions.push(wrongQuestion);
                    
                    // 更新 localStorage
                    saveUserWrongQuestions(state.currentUserId, state.wrongQuestions);
                }
            } catch (error) {
                console.error('添加错题失败：', error);
            }
        },
        removeWrongQuestion: (state, action) => {
            if (!state.currentUserId) {
                console.error('未设置用户ID');
                return;
            }

            try {
                state.wrongQuestions = state.wrongQuestions.filter(q => q._id !== action.payload);
                // 更新 localStorage
                saveUserWrongQuestions(state.currentUserId, state.wrongQuestions);
            } catch (error) {
                console.error('删除错题失败：', error);
            }
        },
        clearUserWrongQuestions: (state) => {
            state.wrongQuestions = [];
            state.currentUserId = null;
            // 清除 localStorage 中的数据
            if (state.currentUserId) {
                saveUserWrongQuestions(state.currentUserId, []);
            }
        }
    }
});

export const { 
    setCurrentUser, 
    addWrongQuestion, 
    removeWrongQuestion,
    clearUserWrongQuestions 
} = wrongSlice.actions;

export const selectWrongQuestions = (state) => state.wrong.wrongQuestions;
export const selectCurrentUserId = (state) => state.wrong.currentUserId;

export default wrongSlice.reducer; 