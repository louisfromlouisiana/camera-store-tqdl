import React, { useCallback, useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ModalContext } from '../../../context/ModalProvider';
import { scrollElement } from '../../../services/utils/scrollElement';
import { useSelector } from 'react-redux';
import {
  getCart,
  getFavorite,
  getUser,
} from '../../../services/redux/slice/userSlice';
import { IoCartOutline, IoHeartOutline } from 'react-icons/io5';
import { FaArrowRightFromBracket, FaRegCircleUser } from 'react-icons/fa6';
function DesktopHeader({ handleLogout }) {
  const navigate = useNavigate();
  const { setVisibleModal, closeAllModal } = useContext(ModalContext);
  const favorite = useSelector(getFavorite);
  const cart = useSelector(getCart);
  const [dropdown, setDropdown] = useState();
  const user = useSelector(getUser);
  const handleRedirect = useCallback(
    (link) => {
      if (link === 'login' || link === 'register' || link === '') {
        navigate(`/${link}`);
      }
      closeAllModal();
      scrollElement();
    },
    [closeAllModal, scrollElement, dropdown]
  );
  const handleDropdown = useCallback(
    (dropdown) => {
      setDropdown((prevDropdown) => {
        if (prevDropdown === dropdown) return null;
        return dropdown;
      });
    },
    [dropdown]
  );
  return (
    <>
      <ul className='hidden lg:flex items-center gap-6 font-bold'>
        <li>
          <NavLink
            to='/about'
            className={({ isActive }) =>
              isActive ? 'text-violet-500 w-max' : 'w-max'
            }
            onClick={() => handleRedirect('about')}
            end
          >
            About
          </NavLink>
        </li>
        <li>
          <li>
            <NavLink
              to='/shop'
              className={({ isActive }) =>
                isActive ? 'text-violet-500 w-max' : 'w-max'
              }
              onClick={() => handleRedirect('shop')}
              end
            >
              Shop
            </NavLink>
          </li>
        </li>
        <li>
          <li>
            <NavLink
              to='/compare'
              className={({ isActive }) =>
                isActive ? 'text-violet-500 w-max' : 'w-max'
              }
              onClick={() => handleRedirect('compare')}
              end
            >
              Compare
            </NavLink>
          </li>
        </li>
        <li>
          <li>
            <NavLink
              to='/contact'
              className={({ isActive }) =>
                isActive ? 'text-violet-500 w-max' : 'w-max'
              }
              onClick={() => handleRedirect('contact')}
              end
            >
              Contact
            </NavLink>
          </li>
        </li>
      </ul>
      {!user && (
        <ul className='w-full hidden lg:flex justify-end items-center gap-6'>
          <li>
            <button
              className='font-bold'
              onClick={() => handleRedirect('login')}
            >
              Login
            </button>
          </li>
          <li>
            <button
              className='font-bold bg-neutral-700 text-white px-4 py-2 rounded-3xl text-sm'
              onClick={() => handleRedirect('register')}
            >
              Register
            </button>
          </li>
        </ul>
      )}
      {user && (
        <ul className='w-full hidden lg:flex justify-end items-center gap-4'>
          <li className='relative'>
            <button
              className='text-3xl flex justify-center items-center hover:text-violet-500 transition-colors'
              aria-label='heart-btn'
              onClick={() => {
                setVisibleModal('visibleFavoriteModal');
                setDropdown(null);
              }}
            >
              <IoHeartOutline />
            </button>
            {favorite.total > 0 && (
              <span className='absolute -top-[10px] -right-[6px] px-1 bg-violet-500 text-white text-sm'>
                {favorite.total}
              </span>
            )}
          </li>
          <li className='relative'>
            <button
              className='text-3xl flex justify-center items-center hover:text-violet-500 transition-colors'
              aria-label='heart-btn'
              onClick={() => {
                setVisibleModal('visibleCartModal');
                setDropdown(null);
              }}
            >
              <IoCartOutline />
              {cart.total > 0 && (
                <span className='absolute -top-[10px] -right-[6px] px-1 bg-violet-500 text-white text-sm'>
                  {cart.total}
                </span>
              )}
            </button>
          </li>
          <li className='relative'>
            <button
              className='border-2 border-neutral-300 rounded-full p-[2px]'
              onClick={() => handleDropdown('user')}
            >
              <img
                className='w-[32px] h-[32px] object-cover rounded-full shadow-lg'
                src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${user?.image?.url}`}
                alt={user.name}
              />
            </button>
            <div
              className={`absolute right-4 z-10 ${
                dropdown === 'user'
                  ? 'h-[76px] border border-neutral-300'
                  : 'h-0'
              } shadow-lg w-max px-4 rounded flex flex-col bg-white font-bold overflow-hidden transition-all duration-200`}
            >
              <button
                className='py-2 flex items-center gap-4 border-b-2 border-neutral-300'
                onClick={() => {
                  setDropdown(null);
                  navigate('/dashboard/users');
                }}
              >
                <FaRegCircleUser className='text-lg' />
                <span className='text-sm'>My account</span>
              </button>
              <button
                className='py-2 flex items-center gap-4'
                onClick={() => {
                  setDropdown(null);
                  handleLogout();
                }}
              >
                <FaArrowRightFromBracket className='text-lg' />
                <span className='text-sm'>Logout</span>
              </button>
            </div>
          </li>
        </ul>
      )}
    </>
  );
}

export default DesktopHeader;
