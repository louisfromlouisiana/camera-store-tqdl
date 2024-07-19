import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getToken,
  getUser,
  setCart,
  setFavorite,
  setToken,
  setUser,
} from '../../../services/redux/slice/userSlice';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  IoBarChartOutline,
  IoCubeOutline,
  IoPeopleOutline,
  IoBasketOutline,
  IoCamera,
  IoPricetagsOutline,
} from 'react-icons/io5';

import {
  FaWater,
  FaRegMoneyBill1,
  FaList,
  FaArrowRightFromBracket,
  FaRegEnvelope,
  FaPercent,
  FaRegComments,
} from 'react-icons/fa6';

import {
  useSignOutUserMutation,
  useUpdateUserMutation,
} from '../../../services/redux/query/users';
import { deleteToken } from '../../../services/utils/token';
import { ModalContext } from '../../../context/ModalProvider';

function Aside() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setVisibleModal } = useContext(ModalContext);
  const accessToken = useSelector(getToken);
  const user = useSelector(getUser);
  const [hoverImage, setHoverImage] = useState(false);
  const imgRef = useRef();
  const [
    logout,
    {
      data: logoutData,
      isSuccess: isSuccessLogout,
      isError: isErrorLogout,
      error: errorLogout,
    },
  ] = useSignOutUserMutation();
  const [
    updateUser,
    {
      data: updateData,
      isSuccess: isSuccessUpdate,
      isError: isErrorUpdate,
      error: errorUpdate,
    },
  ] = useUpdateUserMutation();
  const routes = [
    {
      name: 'figures',
      icon: <IoBarChartOutline className='text-2xl' />,
    },
    {
      name: 'banners',
      icon: <FaWater className='text-2xl' />,
    },
    {
      name: 'categories',
      icon: <FaList className='text-2xl' />,
    },
    {
      name: 'fees',
      icon: <FaRegMoneyBill1 className='text-2xl' />,
    },
    {
      name: 'products',
      icon: <IoCubeOutline className='text-2xl' />,
    },
    {
      name: 'vouchers',
      icon: <IoPricetagsOutline className='text-2xl' />,
    },
    {
      name: 'coupons',
      icon: <FaPercent className='text-2xl' />,
    },
    {
      name: 'messages',
      icon: <FaRegComments className='text-2xl' />,
    },
    {
      name: 'users',
      icon: <IoPeopleOutline className='text-2xl' />,
    },
    {
      name: 'orders',
      icon: <IoBasketOutline className='text-2xl' />,
    },
    {
      name: 'email',
      icon: <FaRegEnvelope className='text-2xl' />,
    },
  ];
  const renderedRoutes = useMemo(() => {
    return routes.map((r) => {
      return (
        <li className='text-lg border-neutral-300' key={r.name}>
          <NavLink
            to={`/dashboard/admin/${r.name}`}
            className={({ isActive }) =>
              isActive
                ? 'text-violet-500 bg-violet-100 flex items-center gap-4 font-bold py-4 px-4 sm:px-8 '
                : 'flex items-center gap-4 font-bold py-4 px-4 sm:px-8 '
            }
          >
            {r.icon}
            <p className='capitalize'>{r.name}</p>
          </NavLink>
        </li>
      );
    });
  }, [routes]);
  const handleUploadImg = () => {
    if (imgRef.current) {
      imgRef.current.click();
    }
  };
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    const formData = new FormData();
    formData.append('images', file);
    formData.append('name', user?.name);
    formData.append('email', user?.email);
    formData.append('oldImage', JSON.stringify(user?.image));
    await updateUser({ id: user?._id, body: formData });
  };
  const handleLogout = useCallback(async () => {
    await logout(accessToken);
  }, [logout, accessToken]);
  useEffect(() => {
    if (isSuccessUpdate && updateData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: updateData?.message,
        },
      });
    }
    if (errorUpdate && isErrorUpdate) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorUpdate?.data?.message,
        },
      });
    }
  }, [
    isSuccessUpdate,
    updateData,
    isErrorUpdate,
    errorUpdate,
    setVisibleModal,
    dispatch,
  ]);
  useEffect(() => {
    if (isSuccessLogout && logoutData) {
      dispatch(setUser(null));
      dispatch(setToken(null));
      dispatch(setFavorite(null));
      dispatch(setCart(null));
      deleteToken();
      navigate('/', { replace: true });
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
    <section className='col-span-1 border border-neutral-300 shadow-lg py-8 flex flex-col rounded-xl'>
      <div className='w-full px-4 sm:px-8 py-8 border-b-2 border-neutral-300 flex justify-center items-center'>
        <div
          className='relative border-2 border-neutral-300 rounded-full cursor-pointer overflow-hidden'
          onMouseEnter={() => setHoverImage(true)}
          onMouseLeave={() => setHoverImage(false)}
          onClick={handleUploadImg}
        >
          <img
            className='w-[72px] h-[72px] object-cover rounded-full'
            src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${user?.image?.url}`}
            alt={user?.name}
          />
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-neutral-700 flex justify-center items-center z-10 ${
              hoverImage ? 'opacity-80' : 'opacity-0'
            } transition-opacity duration-200`}
          >
            <IoCamera className='text-2xl text-white' />
            <input
              accept='image/*,.jpeg,.jpg,.png,.webp'
              type='file'
              style={{ display: 'none' }}
              ref={imgRef}
              onChange={handleFileSelected}
            />
          </div>
        </div>
      </div>
      <div>
        <ul className='flex flex-col'>{renderedRoutes}</ul>
      </div>
      <div className='px-4 py-4 sm:mx-8 my-4 flex flex-col justify-center items-center border-t-2 border-neutral-300 gap-4'>
        <button
          type='button'
          className='w-full py-2 text-lg font-bold text-white bg-neutral-700 transition-colors rounded-md flex justify-center items-center gap-4'
          onClick={() => setVisibleModal('visibleChangePasswordModal')}
        >
          <span>Change Password</span>
        </button>
        <button
          type='button'
          className='w-full py-2 text-lg font-bold bg-violet-500 text-white hover:bg-neutral-700 transition-colors rounded-md flex justify-center items-center gap-4'
          onClick={handleLogout}
        >
          <FaArrowRightFromBracket />
          <span>Logout</span>
        </button>
      </div>
    </section>
  );
}

export default Aside;
