import React, { useContext, useEffect } from 'react';
import { FaRegTrashCan, FaRegPenToSquare } from 'react-icons/fa6';
import { ModalContext } from '../../../../context/ModalProvider';
import { useDeleteCategoryMutation } from '../../../../services/redux/query/webInfo';
import { formatDate } from '../../../../services/utils/format';
function SingleCategory({ category }) {
  const { setVisibleModal } = useContext(ModalContext);
  const [
    deleteCategory,
    {
      data: deleteData,
      isLoading: isLoadingDelete,
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
    },
  ] = useDeleteCategoryMutation();
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
      <td className='p-4 text-center capitalize'>{category.name}</td>
      <td>
        <div className='flex justify-center items-center'>
          <img
            className='w-[42px] h-[42px] object-cover'
            src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${category?.image?.url}`}
            alt={category.name}
            {...{ fetchPriority: 'low' }}
          />
        </div>
      </td>
      <td
        title={category?.title}
        className='max-w-[120px] p-4 text-center capitalize truncate'
      >
        {category?.title}
      </td>
      <td
        title={category?.content}
        className='max-w-[180px] p-4 text-center capitalize truncate'
      >
        {category?.content}
      </td>
      <td className='p-4 text-center'>{formatDate(category?.created_at)}</td>
      <td className='p-4'>
        <div className='flex justify-center items-center gap-[12px]'>
          <button
            className='text-lg flex justify-center items-center hover:text-green-500 transition-colors'
            aria-label='update-btn'
            disabled={isLoadingDelete}
            onClick={() =>
              setVisibleModal({
                visibleUpdateCategoryModal: { ...category },
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
                  question: `Are you sure you want to delete this category?`,
                  description:
                    'This cannot be undone!',
                  loading: isLoadingDelete,
                  acceptFunc: () => deleteCategory(category?._id),
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

export default SingleCategory;
