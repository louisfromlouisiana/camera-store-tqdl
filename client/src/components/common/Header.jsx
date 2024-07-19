import React, {
  Suspense,
  lazy,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../public/icons/logo-01.png';
import { ModalContext } from '../../context/ModalProvider';
import { scrollElement } from '../../services/utils/scrollElement';
import { useDispatch, useSelector } from 'react-redux';
import {
  getToken,
  getUser,
  setCart,
  setFavorite,
  setToken,
  setUser,
} from '../../services/redux/slice/userSlice';
import DesktopHeader from './components/DesktopHeader';
import MobileHeader from './components/MobileHeader';
import { useSignOutUserMutation } from '../../services/redux/query/users';
import { deleteToken } from '../../services/utils/token';
const CartModal = lazy(() => import('../modal/users/CartModal'));
const FavoriteModal = lazy(() => import('../modal/users/FavoriteModal'));
function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setVisibleModal, closeAllModal } = useContext(ModalContext);
  const accessToken = useSelector(getToken);
  const user = useSelector(getUser);
  const [
    logout,
    {
      data: logoutData,
      isSuccess: isSuccessLogout,
      isError: isErrorLogout,
      error: errorLogout,
    },
  ] = useSignOutUserMutation();
  const handleRedirect = useCallback(() => {
    navigate(`/`);
    closeAllModal();
    scrollElement();
  }, [closeAllModal, scrollElement]);
  const handleLogout = useCallback(async () => {
    await logout(accessToken);
  }, [logout, accessToken]);
  useEffect(() => {
    if (isSuccessLogout && logoutData) {
      dispatch(setUser(null));
      dispatch(setToken(null));
      dispatch(setFavorite(null));
      dispatch(setCart(null));
      deleteToken();
      navigate('/');
    }
    if (isErrorLogout && errorLogout) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorLogout?.data?.message,
        },
      });
    }
  }, [
    isSuccessLogout,
    logoutData,
    isErrorLogout,
    errorLogout,
    dispatch,
    navigate,
  ]);
  return (
    <header className='fixed z-50 w-full h-[72px] py-6 border border-b shadow-md text-neutral-700 bg-white flx justify-center items-center'>
      <section className='container m-auto px-4 flex items-center gap-32 h-full'>
        <div className='cursor-pointer'>
          <img
            className='min-w-[150px] min-h-[15px] h-auto object-cover'
            src={logo}
            alt='logo'
            onClick={handleRedirect}
            {...{ fetchPriority: 'high' }}
          />
        </div>
        <DesktopHeader handleLogout={handleLogout} />
        <MobileHeader handleLogout={handleLogout} />
      </section>
      {user && (
        <Suspense>
          <CartModal />
          <FavoriteModal />
        </Suspense>
      )}
    </header>
  );
}

export default Header;
