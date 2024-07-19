import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../services/redux/slice/userSlice';
import { Navigate } from 'react-router-dom';
import { getAuthToken } from '../services/utils/token';
import { useGetUserQuery } from '../services/redux/query/users';
import Loading from '../components/ui/Loading';
function ProtectedRoute({ children }) {
  const token = getAuthToken();
  const dispatch = useDispatch();
  const {
    data: userData,
    isSuccess: isSuccessUserData,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    error: errorUser,
  } = useGetUserQuery(null, { skip: !token });

  useEffect(() => {
    if (isSuccessUserData && userData) {
      dispatch(setUser(userData.user));
      if (!userData?.user?.isVerified) {
        <Navigate to='/verified' replace />;
      }
    }
  }, [isSuccessUserData, userData, dispatch]);
  if (isLoadingUser) return <Loading />;
  if (isErrorUser && errorUser) return <Navigate to='/login' replace />;
  return children;
}

export default ProtectedRoute;
