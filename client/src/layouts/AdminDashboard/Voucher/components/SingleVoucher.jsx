import React, { useContext, useEffect } from 'react';
import {
  formatDate,
  formatNumberWithDot,
} from '../../../../services/utils/format';
import { FaRegTrashCan, FaRegPenToSquare } from 'react-icons/fa6';
import { ModalContext } from '../../../../context/ModalProvider';
import { useDeleteVoucherMutation } from '../../../../services/redux/query/products';

function SingleVoucher({ voucher }) {
  const { setVisibleModal } = useContext(ModalContext);
  const [
    deleteVoucher,
    {
      data: deleteData,
      isLoading: isLoadingDelete,
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
    },
  ] = useDeleteVoucherMutation();
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
      <td title={voucher.SKU} className='p-4 max-w-[120px] truncate'>
        {voucher.SKU}
      </td>
      <td
        title={voucher?.description}
        className='max-w-[120px] p-4 text-center capitalize truncate'
      >
        {voucher?.description}
      </td>
      <td className='p-4 text-center capitalize'>{voucher?.discount}%</td>
      <td className='p-4 text-center capitalize'>
        {formatNumberWithDot(voucher?.maxDiscount)}
      </td>
      <td className='p-4 text-center capitalize'>
        {formatNumberWithDot(voucher?.minPrice)}
      </td>
      <td className='p-4 text-center capitalize'>{voucher?.quantity}</td>
      <td className='p-4 text-center capitalize'>
        <p
          className={`px-2 text-sm font-bold rounded-[26px] ${
            !voucher.enabled
              ? 'text-red-500 border border-red-400'
              : 'text-green-500 border border-green-400'
          }`}
        >
          {voucher?.enabled ? 'Active' : 'Disabled'}
        </p>
      </td>
      <td className='p-4 text-center'>{formatDate(voucher?.created_at)}</td>

      <td className='p-4'>
        <div className='flex justify-center items-center gap-[12px]'>
          <button
            className='text-lg flex justify-center items-center hover:text-green-500 transition-colors'
            aria-label='update-btn'
            disabled={isLoadingDelete}
            onClick={() =>
              setVisibleModal({
                visibleUpdateVoucherModal: { ...voucher },
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
                  question: `Are you sure you want to delete this voucher?`,
                  description:
                    'This cannot be undone!',
                  loading: isLoadingDelete,
                  acceptFunc: () => deleteVoucher(voucher?.SKU),
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

export default SingleVoucher;
