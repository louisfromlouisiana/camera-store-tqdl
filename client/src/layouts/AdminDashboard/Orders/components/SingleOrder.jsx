import React, { useContext, useEffect, useMemo } from 'react';
import {
  formatDate,
  formatNumberWithDot,
} from '../../../../services/utils/format';
import { FetchDataContext } from '../../../../context/FetchDataProvider';
import { FaRegEye } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useUpdateOrderByAdminMutation } from '../../../../services/redux/query/users';
import { ModalContext } from '../../../../context/ModalProvider';
function SingleOrder({ order }) {
  const navigate = useNavigate();
  const { statusOrders } = useContext(FetchDataContext);
  const { setVisibleModal } = useContext(ModalContext);
  const {
    user,
    paymentMethod,
    paymentInfo,
    created_at,
    updated_at,
    isPaid,
    isProcessing,
    totalPrice,
  } = order;
  const selectedStatus = useMemo(() => {
    return order?.paymentInfo?.status;
  }, [order]);
  const [
    updateOrder,
    {
      data: updateData,
      isSuccess: isSuccessUpdate,
      isLoading: isLoadingUpdate,
      isError: isErrorUpdate,
      error: errorUpdate,
    },
  ] = useUpdateOrderByAdminMutation();
  useEffect(() => {
    if (isSuccessUpdate && updateData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: updateData?.message,
        },
      });
    }
    if (isErrorUpdate && errorUpdate) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorUpdate?.data?.message,
        },
      });
    }
  }, [
    isSuccessUpdate,
    updateData,
    isErrorUpdate,
    errorUpdate,
    setVisibleModal,
  ]);
  return (
    <tr
      aria-disabled={
        isLoadingUpdate ||
        paymentInfo?.status === 'received' ||
        paymentInfo?.status === 'cancel'
      }
    >
      <td className='p-4 text-center'>{paymentInfo.orderCode}</td>
      <td className='p-4 text-center'>{user?.email}</td>
      <td className='p-4 text-center'>{formatDate(updated_at)}</td>
      <td className='p-4 text-center uppercase'>{paymentMethod}</td>
      <td className='p-4 text-center capitalize'>
        <select
          className='p-2 capitalize focus:outline-none border border-neutral-300 bg-neutral-200 rounded text-sm'
          name='status'
          id='status'
          value={selectedStatus}
          disabled={
            paymentInfo?.status === 'received' ||
            paymentInfo?.status === 'cancel'
          }
          onChange={async (e) =>
            await updateOrder({
              orderId: order?.paymentInfo?.orderCode,
              status: e.target.value,
              userId: order?.user?._id,
              paymentMethod: order?.paymentMethod,
            })
          }
        >
          {statusOrders?.map((s) => {
            return (
              <option className='p-2' key={s._id} value={s.name}>
                {s.name}
              </option>
            );
          })}
        </select>
      </td>
      <td className='p-4 text-center'>{isPaid ? 'Paid' : 'Unpaid'}</td>
      <td className='p-4 text-center'>
        {isProcessing ? 'Processed' : 'No process'}
      </td>
      <td className='p-4 text-center'>{formatNumberWithDot(totalPrice)}</td>
      <td className='p-4'>
        <button
          className='m-auto flex justify-center items-center'
          aria-label='view-order'
          onClick={() =>
            navigate(`/dashboard/admin/orders/${paymentInfo.orderCode}`)
          }
        >
          <FaRegEye className='text-xl' />
        </button>
      </td>
    </tr>
  );
}

export default SingleOrder;
