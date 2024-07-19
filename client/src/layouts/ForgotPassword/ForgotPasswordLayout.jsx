import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForgotPasswordMutation } from '../../services/redux/query/users';
import { ModalContext } from '../../context/ModalProvider';
import { getUser } from '../../services/redux/slice/userSlice';
import { useSelector } from 'react-redux';

function ForgotPasswordLayout() {
  const navigate = useNavigate();
  const { setVisibleModal } = useContext(ModalContext);
  const user = useSelector(getUser);
  const [email, setEmail] = useState();
  const [
    forgotPassword,
    {
      data: forgotData,
      isSuccess: isSuccessForgot,
      isLoading: isLoadingForgot,
      isError: isErrorForgot,
      error: errorForgot,
    },
  ] = useForgotPasswordMutation();
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);
  useEffect(() => {
    if (isSuccessForgot && forgotData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: forgotData?.message,
        },
      });
    }
    if (isErrorForgot && errorForgot) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorForgot?.data?.message,
        },
      });
    }
  }, [
    isSuccessForgot,
    forgotData,
    isErrorForgot,
    errorForgot,
    setVisibleModal,
  ]);
  return (
    <section className='w-full h-full container m-auto px-0 sm:px-8 py-16 flex justify-center items-center text-sm sm:text-base'>
      <div className='w-[300px] sm:w-[460px] lg:w-[640px] border border-neutral-300 rounded-xl text-neutral-700 flex flex-col shadow-lg bg-white'>
        <h1 className='p-4 text-xl sm:text-2xl font-bold'>Find your account</h1>
        <div className='p-4 border-b-2 border-t-2 border-neutral-300 flex flex-col gap-4'>
          <p>Please enter your email to search for your account.</p>
          <input
            className='p-4 w-full border border-neutral-300 rounded'
            type='email'
            placeholder='Enter email...'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='w-full flex justify-end gap-4 p-4'>
          <button
            className='w-[92px] bg-neutral-200 font-bold px-4 py-2 rounded'
            disabled={isLoadingForgot}
            onClick={() => navigate('/login')}
          >
            Cancel
          </button>
          <button
            className='w-[92px] bg-violet-500 text-white hover:bg-neutral-700 transition-colors font-bold px-4 py-2 rounded'
            disabled={isLoadingForgot}
            onClick={() => forgotPassword(email)}
          >
            Find
          </button>
        </div>
      </div>
    </section>
  );
}

export default ForgotPasswordLayout;
