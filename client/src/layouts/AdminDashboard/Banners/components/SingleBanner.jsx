import React, { useContext, useEffect } from 'react';
import { FaRegTrashCan, FaRegPenToSquare } from 'react-icons/fa6';
import { ModalContext } from '../../../../context/ModalProvider';
import { useDeleteBannerMutation } from '../../../../services/redux/query/webInfo';
function SingleBanner({ banner }) {
  const { setVisibleModal } = useContext(ModalContext);

  const [
    deleteBanner,
    {
      data: deleteData,
      isLoading: isLoadingDelete,
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
    },
  ] = useDeleteBannerMutation();
  useEffect(() => {
    if (isSuccessDelete && deleteData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: deleteData?.message,
        },
      });
    }
    if (isErrorDelete && errorDelete) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorDelete?.data?.message,
        },
      });
    }
  }, [
    isSuccessDelete,
    deleteData,
    isErrorDelete,
    errorDelete,
    setVisibleModal,
  ]);
  return (
    <tr>
      <td
        title={banner.title}
        className='p-4 max-w-[120px] text-center truncate'
      >
        {banner.title}
      </td>
      <td className='p-4'>
        <div className='flex justify-center items-center'>
          <img
            className='w-[42px] h-[42px] object-cover'
            src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${banner?.image?.url}`}
            alt={banner.title}
            {...{ fetchPriority: 'low' }}
          />
        </div>
      </td>
      <td
        title={banner?.content}
        className='max-w-[180px] p-4 text-center capitalize truncate'
      >
        {banner?.content}
      </td>
      <td title={banner?.category?.name} className='p-4 text-center capitalize'>
        {banner?.category?.name}
      </td>

      <td className='p-4'>
        <div className='flex justify-center items-center gap-[12px]'>
          <button
            className='text-lg flex justify-center items-center hover:text-green-500 transition-colors'
            aria-label='update-btn'
            disabled={isLoadingDelete}
            onClick={() =>
              setVisibleModal({
                visibleUpdateBannerModal: { ...banner },
              })
            }
          >
            <FaRegPenToSquare />
          </button>
          <button
            className='text-lg flex justify-center items-center hover:text-red-500 transition-colors'
            aria-label='delete-btn'
            onClick={() =>
              setVisibleModal({
                visibleConfirmModal: {
                  icon: <FaRegTrashCan className='text-red-500' />,
                  question: `Are you sure you want to delete this banner?`,
                  description:
                    'This cannot be undone!',
                  loading: isLoadingDelete,
                  acceptFunc: () => deleteBanner(banner?._id),
                },
              })
            }
            disabled={isLoadingDelete}
          >
            <FaRegTrashCan />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default SingleBanner;
