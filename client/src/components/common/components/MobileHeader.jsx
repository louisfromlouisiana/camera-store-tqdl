import React, { useContext, useMemo, useState } from 'react';
import {
  FaAlignRight,
  FaRightToBracket,
  FaHouseChimney,
  FaCircleInfo,
  FaStore,
  FaNewspaper,
  FaHeart,
  FaCartShopping,
  FaPhone,
  FaCircleUser,
  FaArrowRightFromBracket,
  FaXmark,
  FaCodeCompare,
} from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import { getUser } from '../../../services/redux/slice/userSlice';
import { ModalContext } from '../../../context/ModalProvider';
import { Link, NavLink } from 'react-router-dom';
function MobileHeader({ handleLogout }) {
  const [activeHeader, setActiveHeader] = useState(false);
  const { setVisibleModal, closeAllModal } = useContext(ModalContext);
  const user = useSelector(getUser);
  const routes = [
    {
      link: '/',
      icon: <FaHouseChimney className='text-base' />,
    },
    {
      link: 'about',
      icon: <FaCircleInfo className='text-base' />,
    },
    {
      link: 'shop?page=1',
      icon: <FaStore className='text-base' />,
    },
    {
      link: 'compare',
      icon: <FaCodeCompare className='text-base' />,
    },
    // { link: 'blog?page=1', icon: <FaNewspaper className='text-base' /> },
    {
      link: 'contact',
      icon: <FaPhone className='text-base' />,
    },
  ];
  const route = useMemo(() => {
    return routes.map((r, index) => {
      return (
        <li key={index} className='capitalize'>
          <NavLink
            to={r.link}
            className={({ isActive }) =>
              isActive ? 'text-violet-500 w-max' : 'w-max'
            }
            // onClick={redirect}
            // state={{ prevUrl: location.pathname }}
            onClick={() => {
              closeAllModal();
              setActiveHeader(false);
            }}
            end
          >
            <div className='flex items-center gap-4'>
              {r.icon}
              <p>{r.link === '/' ? 'home' : r.link.split('?')[0]}</p>
            </div>
          </NavLink>
        </li>
      );
    });
  }, [routes]);
  return (
    <>
      <div className='w-full flex justify-end lg:hidden'>
        <button
          className='text-2xl'
          onClick={() => {
            closeAllModal();
            setActiveHeader(true);
          }}
        >
          <FaAlignRight />
        </button>
      </div>
      <div
        className={`fixed top-0 left-0 ${
          activeHeader ? 'translate-x-0' : '-translate-x-[100%]'
        } w-full h-full py-8 bg-white z-[100] lg:hidden text-neutral-700 font-bold transition-all duration-200 overflow-hidden`}
      >
        <div className='px-8 w-full flex justify-end'>
          <button
            aria-label='close-dropdown'
            onClick={() => {
              closeAllModal();
              setActiveHeader(false);
            }}
          >
            <FaXmark className='text-2xl font-bold' />
          </button>
        </div>
        <div className='mx-8 py-4 border-b-2 border-semiBoldGray flex flex-col gap-[32px]'>
          {user ? (
            <>
              <div className='flex items-center gap-[20px]'>
                <img
                  className='w-[36px] h-[36px] rounded-full'
                  src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                    user?.image?.url
                  }`}
                  alt={user.name}
                />
                <p>{user.name}</p>
              </div>
              <div className='flex flex-col gap-[20px]'>
                <button
                  className='flex items-center gap-[15px]'
                  onClick={() => {
                    setVisibleModal('visibleFavoriteModal');
                    setActiveHeader(false);
                  }}
                >
                  <FaHeart className='text-base' />
                  <span>Favorites</span>
                </button>
                <button
                  className='flex items-center gap-[15px]'
                  onClick={() => {
                    setVisibleModal('visibleCartModal');
                    setActiveHeader(false);
                  }}
                >
                  <FaCartShopping className='text-base' />
                  <span>Cart</span>
                </button>
                <Link
                  to='/dashboard/users'
                  className='flex items-center gap-[15px]'
                  onClick={() => {
                    closeAllModal();
                    setActiveHeader(false);
                  }}
                >
                  <FaCircleUser className='text-base' />
                  <span>My Account</span>
                </Link>
              </div>
            </>
          ) : (
            <Link
              to='/login'
              className='flex items-center gap-[20px]'
              onClick={() => {
                closeAllModal();
                setActiveHeader(false);
              }}
            >
              <FaRightToBracket className='text-base' />
              <p>Login</p>
            </Link>
          )}
        </div>
        <ul className='m-8 pb-4 h-max flex flex-col gap-[24px] border-b-2 border-semiBoldGray'>
          {route}
        </ul>
        {user && (
          <button
            className='mx-8 mb-4 flex items-center gap-4'
            onClick={handleLogout}
          >
            <FaArrowRightFromBracket />
            <p>Logout</p>
          </button>
        )}
      </div>
    </>
  );
}

export default MobileHeader;
