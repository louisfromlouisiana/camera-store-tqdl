import React, { useCallback, useContext, useEffect, useState } from 'react';
import logo from '../../../public/icons/logo-01.png';
import { Navigate, useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '../../services/utils/validate';
import {
  FaCheck,
  FaLightbulb,
  FaXmark,
  FaRegEye,
  FaRegEyeSlash,
} from 'react-icons/fa6';
import { useSignUpUserMutation } from '../../services/redux/query/users';
import { ModalContext } from '../../context/ModalProvider';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, setToken } from '../../services/redux/slice/userSlice';

function RegisterLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const { setVisibleModal } = useContext(ModalContext);
  const [curType, setCurType] = useState('password');
  const [focusInput, setFocusInput] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [
    signUp,
    {
      data: signUpData,
      isLoading: isLoadingSignUp,
      isSuccess: isSuccessSignUp,
      isError: isErrorSignUp,
      error: errorSignUp,
    },
  ] = useSignUpUserMutation();
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await signUp(form);
    },
    [signUp, form]
  );
  useEffect(() => {
    if (isSuccessSignUp && signUpData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: signUpData?.message,
        },
      });
      dispatch(setToken(signUpData.token));
    }
    if (isErrorSignUp && errorSignUp) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorSignUp?.data?.message,
        },
      });
    }
    setForm({ name: '', email: '', password: '' });
  }, [
    isSuccessSignUp,
    signUpData,
    isErrorSignUp,
    errorSignUp,
    dispatch,
    setVisibleModal,
  ]);
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
        <h1 className='text-xl sm:text-2xl font-bold'>Register</h1>
        <img src={logo} alt='' />
        <div className='my-4 w-full relative py-2'>
          <label
            className={`absolute h-full w-full top-1/2 left-0 flex items-center px-2 ${
              focusInput === 'name' || form.name
                ? '-translate-y-[100%]'
                : '-translate-y-1/2'
            }  transition-transform duration-300 cursor-pointer`}
            htmlFor='name'
            onClick={() => setFocusInput('name')}
          >
            Name
          </label>
          <input
            name='name'
            id='name'
            className='w-full focus:outline-none p-2 text-sm'
            type='name'
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <span className='absolute bottom-0 left-0 w-full h-[3px] rounded bg-neutral-500 z-10'></span>
          <span
            className={`absolute bottom-0 left-0 ${
              focusInput === 'name' ? 'w-full' : 'w-0'
            } h-[3px] rounded bg-violet-500 z-20 transition-all duration-300`}
          ></span>
        </div>
        <div className='my-4 w-full relative py-2'>
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
            <div className='absolute top-1/2 right-1 -translate-y-1/2 bg-red-500 rounded-full p-1 font-bold'>
              <FaCheck className='text-white text-sm' />
            </div>
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
          {form.password && !validatePassword(form.password) && (
            <div className='absolute top-1/2 right-[5%] -translate-y-1/2 bg-red-500 rounded-full p-1 font-bold'>
              <FaXmark className='text-white text-sm' />
            </div>
          )}
          {form.password && validatePassword(form.password) && (
            <div className='absolute top-1/2 right-[5%] -translate-y-1/2 bg-green-500 rounded-full p-1 font-bold'>
              <FaCheck className='text-white text-sm' />
            </div>
          )}
          <span className='absolute bottom-0 left-0 w-full h-[3px] rounded bg-neutral-500'></span>
          <span
            className={`absolute bottom-0 left-0 ${
              focusInput === 'password' ? 'w-full' : 'w-0'
            } h-[3px] rounded bg-violet-500 z-20 transition-all duration-300`}
          ></span>
        </div>
        <div className='flex items-center gap-2'>
          <FaLightbulb className='text-xl' />
          <span>:</span>
          <p className='text-sm font-bold'>
            The password must be longer than 6 characters and contain at least 1
            uppercase letter.
          </p>
        </div>
        <button
          className={`font-bold w-full bg-violet-500 text-white h-[48px] rounded-[26px] hover:bg-neutral-700 transition-colors duration-300 ${
            isLoadingSignUp ||
            !validateEmail(form.email) ||
            !validatePassword(form.password)
              ? 'cursor-not-allowed'
              : 'cursor-pointer'
          }`}
          type='submit'
          disabled={
            isLoadingSignUp ||
            !validateEmail(form.email) ||
            !validatePassword(form.password)
          }
        >
          Register
        </button>
        <div className='my-4 w-full flex justify-center items-center gap-2'>
          <p className='font-medium'>Already Have account?</p>
          <button
            type='button'
            className='font-bold'
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </form>
    </section>
  );
}

export default RegisterLayout;
