import React, { useContext, useEffect } from 'react';
import { FaRegTrashCan, FaRegPenToSquare } from 'react-icons/fa6';
import {
  formatDate,
  formatNumberWithDot,
} from '../../../../services/utils/format';
import { ModalContext } from '../../../../context/ModalProvider';
import { useDeleteProductMutation } from '../../../../services/redux/query/products';

function SingleProduct({ product }) {
  const { setVisibleModal } = useContext(ModalContext);
  const [
    deleteProduct,
    {
      data: deleteData,
      isLoading: isLoadingDelete,
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
    },
  ] = useDeleteProductMutation();
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
      {/* <td
        className='p-4 max-w-[120px] text-center truncate'
        title={product?._id}
      >
        {product?._id}
      </td> */}
      <td
        title={product?.name}
        className='p-4 max-w-[220px] text-center truncate'
      >
        {product?.name}
      </td>
      <td className='p-4'>
        <div className='flex justify-center items-center'>
          <img
            className='w-[42px] h-[42px] object-cover'
            src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
              product?.images[0]?.url
            }`}
            alt={product.name}
            {...{ fetchPriority: 'low' }}
          />
        </div>
      </td>
      <td className='p-4 text-center capitalize'>{product?.category?.name}</td>
      <td className='p-4 text-center capitalize'>
        {product?.availableQuantity}
      </td>
      <td className='p-4 text-center capitalize'>{product?.quantity}</td>
      <td
        className='p-4 text-center capitalize truncate max-w-[120px]'
        title={`${formatNumberWithDot(product?.price)}`}
      >
        {formatNumberWithDot(product?.price)}
      </td>
      <td className='p-4 text-center'>{formatDate(product?.created_at)}</td>
      <td className='p-4 text-center'>{formatDate(product?.updated_at)}</td>
      <td className='p-4'>
        <div className='flex justify-center items-center gap-[12px]'>
          <button
            className='text-lg flex justify-center items-center hover:text-green-500 transition-colors'
            aria-label='update-btn'
            onClick={() =>
              setVisibleModal({
                visibleUpdateProductModal: product,
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
                  question: `Are you sure you want to delete this product?`,
                  description: 'This cannot be undone!',
                  loading: isLoadingDelete,
                  acceptFunc: () => deleteProduct(product?._id),
                },
              })
            }
          >
            <FaRegTrashCan />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default SingleProduct;
