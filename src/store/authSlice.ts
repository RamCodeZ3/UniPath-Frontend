// src/store/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  profile: any | null;
  loading: boolean;
  emailConfirmed: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  emailConfirmed: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
    },
    setProfile(state, action: PayloadAction<any>) {
      state.profile = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.profile = null;
      state.loading = false;
    },
    setEmailConfirmed(state, action: PayloadAction<boolean>) {
  state.emailConfirmed = action.payload;
    },
  },
});

  export const { setUser, setProfile, setLoading, clearAuth, setEmailConfirmed } = authSlice.actions;
export default authSlice.reducer;