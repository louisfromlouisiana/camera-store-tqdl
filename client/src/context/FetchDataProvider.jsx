import { createContext, useEffect, useState } from 'react';
import {
  useGetCategoriesQuery,
  useGetStatusOrdersQuery,
} from '../services/redux/query/webInfo';
import { useDispatch, useSelector } from 'react-redux';
import {
  getToken,
  getUser,
  setCart,
  setCurDelivery,
  setFavorite,
  setUser,
} from '../services/redux/slice/userSlice';
import {
  useGetAllCartQuery,
  useGetAllFavoriteQuery,
  useGetDefaultAddressQuery,
  useGetUserQuery,
} from '../services/redux/query/users';

export const FetchDataContext = createContext();

export const FetchDataProvider = ({ children }) => {
  const dispatch = useDispatch();
  const accessToken = useSelector(getToken);
  const user = useSelector(getUser);
  const [statusOrders, setStatusOrders] = useState();
  const [categories, setCategories] = useState();
  const {
    data: userData,
    isSuccess: isSuccessUserData,
    refetch: refetchUser,
  } = useGetUserQuery(null, { skip: !accessToken });
  const { data: categoriesData, isSuccess: isSuccessCategories } =
    useGetCategoriesQuery();
  const { data: statusOrdersData, isSuccess: isSuccessStatusOrders } =
    useGetStatusOrdersQuery();
  const { data: favoriteData, isSuccess: isSuccessFavorite } =
    useGetAllFavoriteQuery(null, {
      skip: !accessToken || !user || user?.role?.value === 1,
    });
  const {
    data: cartData,
    isSuccess: isSuccessCart,
    refetch: refetchCart,
  } = useGetAllCartQuery(null, {
    skip: !accessToken || !user || user?.role?.value === 1,
  });
  const { data: addressData, isSuccess: isSuccessAddress } =
    useGetDefaultAddressQuery(null, { skip: !user });
  useEffect(() => {
    if (accessToken) {
      refetchUser();
    }
  }, [accessToken]);
  useEffect(() => {
    if (isSuccessUserData && userData) {
      dispatch(setUser(userData.user));
    }
  }, [isSuccessUserData, userData, dispatch]);
  useEffect(() => {
    if (isSuccessStatusOrders && statusOrdersData) {
      setStatusOrders(statusOrdersData.statusorders);
    }
  }, [isSuccessStatusOrders, statusOrdersData]);
  useEffect(() => {
    if (isSuccessCategories && categoriesData) {
      setCategories(categoriesData?.categories);
    }
  }, [isSuccessCategories, categoriesData]);
  useEffect(() => {
    if (isSuccessFavorite && favoriteData) {
      dispatch(setFavorite(favoriteData?.favorite));
    }
  }, [isSuccessFavorite, favoriteData]);
  useEffect(() => {
    if (isSuccessCart && cartData) {
      dispatch(setCart(cartData?.cart));
    }
  }, [isSuccessCart, cartData]);
  useEffect(() => {
    if (isSuccessAddress && addressData) {
      dispatch(setCurDelivery(addressData.address));
    }
  }, [isSuccessAddress, addressData]);
  return (
    <FetchDataContext.Provider
      value={{ statusOrders, categories, refetchCart }}
    >
      {children}
    </FetchDataContext.Provider>
  );
};
