import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cart";
import wrongReducer from './wrong';
import collectReducer from './collect';

// 从 localStorage 获取持久化的状态
const persistedWrongState = localStorage.getItem('allWrongQuestions')
  ? { 
      wrongQuestions: [], // 初始化为空数组
      currentUserId: localStorage.getItem('userid') // 从 localStorage 获取当前用户ID
    }
  : undefined;

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wrong: wrongReducer,
    collect: collectReducer
  },
  preloadedState: {
    wrong: persistedWrongState
  }
});

// 不再需要这个订阅，因为 wrong reducer 自己处理持久化
// store.subscribe(() => {
//   const state = store.getState();
//   localStorage.setItem('wrongQuestions', JSON.stringify(state.wrong.wrongQuestions));
// });

export default store;
