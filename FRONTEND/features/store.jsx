import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/auth-slice";
import userIdReducer from "./userID/userId-slics";
import tokenslice from "./token-slice.jsx";
const store = configureStore({
  reducer: {
    auth: authReducer,
    userId: userIdReducer,
    token:tokenslice,
  },
});

export default store;

