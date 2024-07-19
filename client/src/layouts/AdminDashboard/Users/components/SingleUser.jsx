import React, { useContext, useEffect } from 'react';
import { formatDate } from '../../../../services/utils/format';
import {
  useBanUserMutation,
  useDisBanUserMutation,
} from '../../../../services/redux/query/users';
import { ModalContext } from '../../../../context/ModalProvider';

function SingleUser({ user }) {
  const { setVisibleModal } = useContext(ModalContext);
  const [
    banUser,
    {
      data: banData,
      isSuccess: isSuccessBan,
      isLoading: isLoadingBan,
      isError: isErrorBan,
      error: errorBan,
    },
  ] = useBanUserMutation();
  const [
    disBanUser,
    {
      data: disBanData,
      isSuccess: isSuccessDisBan,
      isLoading: isLoadingsDisBan,
      isError: isErrorsDisBan,
      error: errorsDisBan,
    },
  ] = useDisBanUserMutation();
  useEffect(() => {
    if (isSuccessBan && banData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: banData?.message,
        },
      });
    }
    if (isErrorBan && errorBan) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorBan?.data?.message,
        },
      });
    }
  }, [isSuccessBan, banData, isErrorBan, errorBan, setVisibleModal]);
  useEffect(() => {
    if (isSuccessDisBan && disBanData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: disBanData?.message,
        },
      });
    }
    if (isErrorsDisBan && errorsDisBan) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorsDisBan?.data?.message,
        },
      });
    }
  }, [
    isSuccessDisBan,
    disBanData,
    isErrorsDisBan,
    errorsDisBan,
    setVisibleModal,
  ]);
  return (
    <tr>
      <td className='p-4 text-center'>
        <p title={user._id} className='m-auto max-w-[120px] truncate'>
          {user.id}
        </p>
      </td>
      <td className='p-4 text-center truncate w-max'>{user.name}</td>
      <td className='p-4 text-center truncate w-max'>{user.email}</td>
      <td className='p-4 text-center'>
        <div className='m-auto w-[72px] h-[72px]'>
          <img
            className='w-full h-full object-cover'
            src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${user?.image?.url}`}
            alt={user.name}
            {...{ fetchPriority: 'low' }}
          />
        </div>
      </td>
      <td className='p-4 text-center'>{formatDate(user.created_at)}</td>
      <td className='p-4 text-center'>{formatDate(user.updated_at)}</td>
      <td className='p-4 text-center'>
        <p
          className={`truncate w-max px-2 rounded-[24px] text-sm ${
            user.isBanned
              ? 'bg-red-100 border border-red-300 text-red-500'
              : 'bg-green-100 border border-green-300 text-green-500'
          }`}
          title={user.isBanned ? 'Banned' : 'Active'}
        >
          {user.isBanned ? 'Banned' : 'Active'}
        </p>
      </td>
      <td className='p-4 text-center'>
        <div>
          {user?.isBanned && (
            <button
              className='text-violet-500 px-2 text-sm'
              disabled={isLoadingBan || isLoadingsDisBan}
              onClick={() =>
                setVisibleModal({
                  visibleConfirmModal: {
                    question: `Are you sure you want to unban this user?`,
                    description: 'Make sure you know what you are doing',
                    loading: isLoadingsDisBan,
                    acceptFunc: () => disBanUser(user?._id),
                  },
                })
              }
            >
              Unban user
            </button>
          )}
          {!user?.isBanned && (
            <button
              className='text-violet-500 px-2 text-sm'
              disabled={isLoadingBan || isLoadingsDisBan}
              onClick={() =>
                setVisibleModal({
                  visibleConfirmModal: {
                    question: `Are you sure you want to ban this user?`,
                    description: 'Make sure you know what you are doing',
                    loading: isLoadingBan,
                    acceptFunc: () => banUser(user?._id),
                  },
                })
              }
            >
              Ban user
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default SingleUser;
