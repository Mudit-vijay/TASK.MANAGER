import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/auth-slice";
import userIdReducer from "./userID/userId-slics";
const store = configureStore({
  reducer: {
    auth: authReducer,
    userId: userIdReducer,
  },
});

export default store;
