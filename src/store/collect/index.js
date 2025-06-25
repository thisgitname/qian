import { createSlice } from '@reduxjs/toolkit';

// 获取用户特定的收藏数据
const getUserCollections = (userId) => {
    if (!userId) {
        console.error('获取收藏数据失败: 未提供用户ID');
        return [];
    }

    try {
        const allCollections = JSON.parse(localStorage.getItem('allCollectedQuestions')) || {};
        const userCollections = allCollections[userId] || [];
        
        // 验证数据格式
        if (!Array.isArray(userCollections)) {
            console.error('收藏数据格式错误');
            return [];
        }

        // 验证每个收藏项的数据完整性
        return userCollections.filter(item => {
            if (!item || typeof item !== 'object') return false;
            if (!item._id || !item.title) return false;
            return true;
        });
    } catch (error) {
        console.error('获取收藏数据失败:', error);
        return [];
    }
};

// 保存用户特定的收藏数据
const saveUserCollections = (userId, collections) => {
    if (!userId) {
        console.error('保存收藏数据失败: 未提供用户ID');
        return;
    }

    if (!Array.isArray(collections)) {
        console.error('保存收藏数据失败: 数据格式错误');
        return;
    }

    try {
        const allCollections = JSON.parse(localStorage.getItem('allCollectedQuestions')) || {};
        // 过滤掉不完整的数据
        const validCollections = collections.filter(item => {
            if (!item || typeof item !== 'object') return false;
            if (!item._id || !item.title) return false;
            return true;
        });
        
        allCollections[userId] = validCollections;
        localStorage.setItem('allCollectedQuestions', JSON.stringify(allCollections));
    } catch (error) {
        console.error('保存收藏数据失败:', error);
    }
};

const initialState = {
    collectedQuestions: [],
    currentUserId: null
};

const collectSlice = createSlice({
    name: 'collect',
    initialState,
    reducers: {
        setCurrentUser: (state, action) => {
            const userId = action.payload;
            if (!userId) {
                console.error('设置用户ID失败: 无效的用户ID');
                return;
            }
            state.currentUserId = userId;
            state.collectedQuestions = getUserCollections(userId);
        },
        addCollectedQuestion: (state, action) => {
            if (!state.currentUserId) {
                console.error('添加收藏失败: 未设置用户ID');
                return;
            }

            const question = action.payload;
            if (!question || !question._id || !question.title) {
                console.error('添加收藏失败: 题目数据不完整');
                return;
            }

            // 检查是否已经收藏
            const exists = state.collectedQuestions.some(q => q._id === question._id);
            if (!exists) {
                state.collectedQuestions.push(question);
                // 保存到 localStorage
                saveUserCollections(state.currentUserId, state.collectedQuestions);
            }
        },
        removeCollectedQuestion: (state, action) => {
            if (!state.currentUserId) {
                console.error('取消收藏失败: 未设置用户ID');
                return;
            }

            const questionId = action.payload;
            if (!questionId) {
                console.error('取消收藏失败: 未提供题目ID');
                return;
            }

            state.collectedQuestions = state.collectedQuestions.filter(q => q._id !== questionId);
            // 更新 localStorage
            saveUserCollections(state.currentUserId, state.collectedQuestions);
        },
        clearUserCollections: (state) => {
            state.collectedQuestions = [];
            state.currentUserId = null;
            // 可选：清除localStorage中的数据
            try {
                localStorage.removeItem('allCollectedQuestions');
            } catch (error) {
                console.error('清除收藏数据失败:', error);
            }
        }
    }
});

export const { 
    setCurrentUser, 
    addCollectedQuestion, 
    removeCollectedQuestion,
    clearUserCollections 
} = collectSlice.actions;

export const selectCollectedQuestions = (state) => state.collect.collectedQuestions;
export const selectCurrentUserId = (state) => state.collect.currentUserId;

export default collectSlice.reducer; 