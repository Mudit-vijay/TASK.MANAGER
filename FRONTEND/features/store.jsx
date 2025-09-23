/* eslint-disable no-unused-vars */
import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import authReducer from "./auth/auth-slice";
import userIdReducer from "./userID/userId-slics";
import tokenSlice from "./token-slice.jsx";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "userId", "token"], // reducers you want to persist
};

const rootReducer = combineReducers({
  auth: authReducer,
  userId: userIdReducer,
  token: tokenSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);
export default store;
