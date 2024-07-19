import React, { useContext, useMemo } from 'react';
import {
  formatDate,
  formatNumberWithDot,
} from '../../../../services/utils/format';
import { FetchDataContext } from '../../../../context/FetchDataProvider';
import { FaRegEye } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

function SingleOrder({ order }) {
  const navigate = useNavigate();
  const { statusOrders } = useContext(FetchDataContext);
  const {
    paymentMethod,
    paymentInfo,
    created_at,
    updated_at,
    isPaid,
    isProcessing,
    totalPrice,
  } = order;
  const curStatus = useMemo(() => {
    return statusOrders.find((s) => s.name === paymentInfo.status);
  }, [order, statusOrders]);
  return (
    <tr>
      <td className='p-4 text-center'>{paymentInfo.orderCode}</td>
      <td className='p-4 text-center'>{formatDate(created_at)}</td>
      <td className='p-4 text-center'>{formatDate(updated_at)}</td>
      <td className='p-4 text-center uppercase'>{paymentMethod}</td>
      <td className='p-4 text-center capitalize'>
        <p
          style={{
            color: `${curStatus.color}`,
            backgroundColor: `${curStatus.backgroundColor}`,
          }}
          className='m-auto w-max px-2 rounded-3xl text-sm'
        >
          {curStatus.name}
        </p>
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
            navigate(`/dashboard/users/orders/${paymentInfo.orderCode}`)
          }
        >
          <FaRegEye className='text-xl' />
        </button>
      </td>
    </tr>
  );
}

export default SingleOrder;
