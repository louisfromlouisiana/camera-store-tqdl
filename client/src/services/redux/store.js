import { configureStore } from '@reduxjs/toolkit';
import { productApi } from './query/products';
import { userApi } from './query/users';
import { webApi } from './query/webInfo';
import userSlice from './slice/userSlice';
export const store = configureStore({
  reducer: {
    user: userSlice,
    [productApi.reducerPath]: productApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [webApi.reducerPath]: webApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      productApi.middleware,
      userApi.middleware,
      webApi.middleware
    ),
});
