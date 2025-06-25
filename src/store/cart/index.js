import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        cart: []
    },
    reducers: {
        addCart: (state, action) => {
            // 检查是否已存在相同的题目
            const exists = state.cart.some(q => q._id === action.payload._id);
            if (!exists) {
                state.cart.push(action.payload);
            }
        }
    }
});

export const { addCart } = cartSlice.actions;
export default cartSlice.reducer; 
