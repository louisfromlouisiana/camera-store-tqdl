import React, { useCallback, useContext, useEffect, useState } from 'react';
import logo from '../../../public/icons/logo-01.png';
import { Navigate, useNavigate } from 'react-router-dom';
import { validateEmail } from '../../services/utils/validate';
import { FaCheck, FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import { useSignInUserMutation } from '../../services/redux/query/users';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, setToken } from '../../services/redux/slice/userSlice';
import { ModalContext } from '../../context/ModalProvider';

function LoginLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const { setVisibleModal } = useContext(ModalContext);
  const [focusInput, setFocusInput] = useState(null);
  const [curType, setCurType] = useState('password');
  const [form, setForm] = useState({ email: '', password: '' });
  const [
    login,
    {
      data: loginData,
      isLoading: isLoadingLogin,
      isSuccess: isSuccessLogin,
      isError: isErrorLogin,
      error: errorLogin,
    },
  ] = useSignInUserMutation();
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await login(form);
    },
    [login, form]
  );
  useEffect(() => {
    if (isSuccessLogin && loginData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: loginData?.message,
        },
      });
      dispatch(setToken(loginData.token));
    }
    if (isErrorLogin && errorLogin) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorLogin?.data?.message,
        },
      });
    }
    setForm({ email: '', password: '' });
  }, [
    isSuccessLogin,
    loginData,
    isErrorLogin,
    errorLogin,
    dispatch,
    setVisibleModal,
  ]);
  if (user?.role?.value === 1) {
    return <Navigate to='/dashboard/admin' replace />;
  }
  if (user !== null && !user?.isVerified) {
    return <Navigate to='/verified' replace />;
  }
  if (user !== null && user?.isVerified) {
    return <Navigate to='/' replace />;
  }
  return (
    <section className='w-full h-full container m-auto px-0 sm:px-8 py-16 flex justify-center items-center text-sm sm:text-base'>
      <form
        onSubmit={handleSubmit}
        className='w-[300px] sm:w-[460px] lg:w-[640px] p-4 py-12 sm:py-20 px-8 border border-neutral-300 rounded-2xl text-neutral-700 flex flex-col gap-8 items-center shadow-lg bg-white'
      >
        <h1 className='text-xl sm:text-2xl font-bold'>Welcome</h1>
        <img src={logo} alt='' />
        <div className='w-full relative py-2'>
          <label
            className={`absolute h-full w-full top-1/2 left-0 flex items-center px-2 ${
              focusInput === 'email' || form.email
                ? '-translate-y-[100%]'
                : '-translate-y-1/2'
            }  transition-transform duration-300 cursor-pointer`}
            htmlFor='email'
            onClick={() => setFocusInput('email')}
          >
            Email
          </label>
          <input
            name='email'
            id='email'
            className='w-full focus:outline-none p-2 text-sm'
            type='email'
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {form.email && !validateEmail(form.email) && (
            <p className='absolute top-1/2 right-1 -translate-y-1/2 text-red-500 font-bold'>
              Email contains @!
            </p>
          )}
          {form.email && validateEmail(form.email) && (
            <div className='absolute top-1/2 right-1 -translate-y-1/2 bg-green-500 rounded-full p-1 font-bold'>
              <FaCheck className='text-white text-sm' />
            </div>
          )}
          <span className='absolute bottom-0 left-0 w-full h-[3px] rounded bg-neutral-500 z-10'></span>
          <span
            className={`absolute bottom-0 left-0 ${
              focusInput === 'email' ? 'w-full' : 'w-0'
            } h-[3px] rounded bg-violet-500 z-20 transition-all duration-300`}
          ></span>
        </div>
        <div className='my-4 w-full relative py-2'>
          <label
            className={`absolute h-full w-full top-1/2 left-0 flex items-center px-2 ${
              focusInput === 'password' || form.password
                ? '-translate-y-[100%]'
                : '-translate-y-1/2'
            } transition-transform duration-300 cursor-pointer`}
            htmlFor='password'
            onClick={() => setFocusInput('password')}
          >
            Password
          </label>
          <input
            name='password'
            id='password'
            className='w-full focus:outline-none p-2 text-sm'
            type={curType}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {curType === 'text' && (
            <button
              type='button'
              className='absolute top-1/2 -translate-y-1/2 right-0'
              aria-label='hidden-btn'
              onClick={() => setCurType('password')}
            >
              <FaRegEye className='text-xl' />
            </button>
          )}
          {curType === 'password' && (
            <button
              type='button'
              className='absolute top-1/2 -translate-y-1/2 right-0'
              aria-label='hidden-btn'
              onClick={() => setCurType('text')}
            >
              <FaRegEyeSlash className='text-xl' />
            </button>
          )}
          <span className='absolute bottom-0 left-0 w-full h-[3px] rounded bg-neutral-500'></span>
          <span
            className={`absolute bottom-0 left-0 ${
              focusInput === 'password' ? 'w-full' : 'w-0'
            } h-[3px] rounded bg-violet-500 z-20 transition-all duration-300`}
          ></span>
        </div>
        <button
          className={`font-bold w-full bg-violet-500 text-white h-[48px] rounded-[26px] hover:bg-neutral-700 transition-colors duration-300 ${
            isLoadingLogin || !validateEmail(form.email)
              ? 'cursor-not-allowed'
              : 'cursor-pointer'
          }`}
          type='submit'
          disabled={isLoadingLogin || !validateEmail(form.email)}
        >
          Login
        </button>
        <button type='button'
          className='font-bold text-neutral-700 hover:text-violet-500 transition-colors'
          onClick={() => navigate('/forgot_password')}
        >
          Forgot password?
        </button>
        <div className='my-4 w-full flex justify-center items-center gap-2'>
          <p className='font-medium'>Don't have an account?</p>
          <button
            type='button'
            className='font-bold'
            onClick={() => navigate('/register')}
          >
            Sign Up
          </button>
        </div>
      </form>
    </section>
  );
}

export default LoginLayout;
