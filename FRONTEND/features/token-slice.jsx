import { createSlice } from "@reduxjs/toolkit";

const tokenslice = createSlice({
  name: "token",
  initialState: {
    token:"",
  },
  reducers: {
    setToken: (state, action) => {
      state.token= action.payload;  // ✅ return the new token value
    },
  },
});

export const { setToken } = tokenslice.actions;
export default tokenslice.reducer;
