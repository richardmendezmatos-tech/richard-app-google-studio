import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppUser } from '@/types/types';

interface UserState {
    user: AppUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<AppUser>) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
