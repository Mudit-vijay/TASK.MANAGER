import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    name: "",
    email: "",
    isAuthenticated: false, // 👈 add this
  },
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    login: (state) => {
      state.isAuthenticated = true; // 👈 update on login
    },
    logout: (state) => {
      state.isAuthenticated = false; // 👈 update on logout
    },
  },
});

export const { setName, setEmail, setPassword, login, logout } =
  authSlice.actions;

export default authSlice.reducer;

