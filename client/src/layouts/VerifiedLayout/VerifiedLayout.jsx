import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUser } from '../../services/redux/slice/userSlice';
import { useNavigate } from 'react-router-dom';
import NotFoundLayout from '../NotFoundLayout/NotFoundLayout';
import {
  useResendCodeMutation,
  useVerifiedAccountMutation,
} from '../../services/redux/query/users';
import { ModalContext } from '../../context/ModalProvider';

function VerifiedLayout() {
  const navigate = useNavigate();
  const { setVisibleModal } = useContext(ModalContext);
  const [code, setCode] = useState('');
  const user = useSelector(getUser);
  if (user == null) return <NotFoundLayout />;
  if (user && user?.isVerified) navigate('/', { replace: true });
  const [
    verifiedAccount,
    {
      data: verifiedData,
      isSuccess: isSuccessVerified,
      isLoading: isLoadingVerified,
      isError: isErrorVerified,
      error: errorVerified,
    },
  ] = useVerifiedAccountMutation();
  const [
    resendCode,
    {
      data: codeData,
      isSuccess: isSuccessCode,
      isLoading: isLoadingCode,
      isError: isErrorCode,
      error: errorCode,
    },
  ] = useResendCodeMutation();
  useEffect(() => {
    if (isSuccessVerified && verifiedData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: verifiedData?.message,
        },
      });
    }
    if (isErrorVerified && errorVerified) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorVerified?.data?.message,
        },
      });
    }
  }, [
    isSuccessVerified,
    verifiedData,
    isErrorVerified,
    errorVerified,
    setVisibleModal,
  ]);
  useEffect(() => {
    if (isSuccessCode && codeData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: codeData?.message,
        },
      });
    }
    if (isErrorCode && errorCode) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorCode?.data?.message,
        },
      });
    }
  }, [isSuccessCode, codeData, isErrorCode, errorCode, setVisibleModal]);
  return (
    <main className='py-32'>
      <div className='bg-neutral-50 absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[8px] shadow-lg'>
        <h1 className='px-[16px] py-[18px] text-[20px] font-bold'>
          Enter the code from your email
        </h1>
        <div className='p-[16px] text-neutral-700 flex flex-col gap-[20px] border-t border-b border-neutral-100'>
          <p>
            Let us know that this email address belongs to you. Enter the code
            from the email sent to{' '}
            <span className='font-bold'>{user?.email}</span>.
          </p>
          <input
            className='w-[136px] border border-neutral-200 rounded-[4px] p-[16px]'
            type='text'
            aria-label='code'
            placeholder='Enter code...'
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            className='mr-auto text-[#1877f2]'
            onClick={async () => resendCode()}
          >
            Send Email Again
          </button>
        </div>
        <div className='flex justify-end p-4'>
          <button
            className={`${
              !code || isLoadingCode || isLoadingVerified
                ? 'bg-gray-300'
                : 'bg-[#1877f2]'
            } text-white w-[145px] h-[36px] rounded-[4px]`}
            disabled={!code || isLoadingCode || isLoadingVerified}
            onClick={async () => await verifiedAccount(code)}
          >
            {isLoadingCode || isLoadingVerified ? '...Loading' : 'Continue'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default VerifiedLayout;
