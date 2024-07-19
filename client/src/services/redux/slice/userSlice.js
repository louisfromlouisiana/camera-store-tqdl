import { createSlice } from '@reduxjs/toolkit';
import { getAuthToken } from '../../utils/token';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    token: getAuthToken() || null,
    favorite: {
      total: 0,
      products: [],
    },
    cart: {
      cartId: null,
      total: 0,
      products: [],
    },
    curDelivery: null,
  },
  reducers: {
    setToken: (state, action) => {
      window.localStorage.setItem('camera-shop-mern-token', action.payload);
      state.token = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setFavorite: (state, action) => {
      const item = action.payload;
      state.favorite.total = item?.products?.length ? item?.products.length : 0;
      state.favorite.products = item?.products ? item?.products : [];
    },
    setCart: (state, action) => {
      const item = action.payload;
      state.cart.cartId = item?._id ? item._id : null;
      state.cart.total = item?.products?.length ? item?.products.length : 0;
      state.cart.products = item?.products ? item?.products : [];
    },
    setCurDelivery: (state, action) => {
      state.curDelivery = action.payload;
    },
  },
});

export const getToken = (state) => state.user.token;
export const getUser = (state) => state.user.user;
export const getFavorite = (state) => state.user.favorite;
export const getCart = (state) => state.user.cart;
export const getCurDelivery = (state) => state.user.curDelivery;
export const { setToken, setUser, setFavorite, setCart, setCurDelivery } =
  userSlice.actions;

export default userSlice.reducer;
