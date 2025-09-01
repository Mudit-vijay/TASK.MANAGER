import { createSlice } from "@reduxjs/toolkit";
const tokenslice = createSlice({
  name: "token",
  initialState: null,
  reducers: {
    setToken: (state, action) => {
      state = action.payload;
    },
  },
});
export const { setToken } = tokenslice.actions;
export default tokenslice.reducer;
