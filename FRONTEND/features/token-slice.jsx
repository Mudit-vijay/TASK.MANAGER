import { createSlice } from "@reduxjs/toolkit";

const tokenslice = createSlice({
  name: "token",
  initialState: "",
  reducers: {
    setToken: (state, action) => {
      return action.payload;  // ✅ return the new token value
    },
  },
});

export const { setToken } = tokenslice.actions;
export default tokenslice.reducer;
