import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string;
}

interface LoginPayload {
  access_token: string;
  refresh_token: string;
  is_admin: boolean;
  username: string;
}

const initialState: UserState = {
  isLoggedIn: !!localStorage.getItem('access_token'),
  isAdmin: localStorage.getItem('is_admin') === 'true',
  username: localStorage.getItem('username') || ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginPayload>) => {
      state.isLoggedIn = true;
      state.isAdmin = action.payload.is_admin;
      state.username = action.payload.username;
      localStorage.setItem('access_token', action.payload.access_token);
      localStorage.setItem('refresh_token', action.payload.refresh_token);
      localStorage.setItem('is_admin', String(action.payload.is_admin));
      localStorage.setItem('username', action.payload.username);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.isAdmin = false;
      state.username = '';
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('is_admin');
      localStorage.removeItem('username');
    }
  }
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;