import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useCheckOrdersQuery,
  useUpdateOrderByUserMutation,
} from '../../services/redux/query/users';
import Loading from '../../components/ui/Loading';

function VnpayReturnLayout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vnp_TxnRef = searchParams.get('vnp_TxnRef');
  const vnp_TransactionDate = searchParams.get('vnp_PayDate');
  const [order, setOrder] = useState(null);
  const [updateOrder] = useUpdateOrderByUserMutation();
  const {
    data: orderData,
    isSuccess: isSuccessOrder,
    isLoading: isLoadingOrder,
    isError: isErrorOrder,
    error: errorOrder,
  } = useCheckOrdersQuery(
    `vnp_TxnRef=${vnp_TxnRef}&vnp_TransactionDate=${vnp_TransactionDate}`,
    { skip: !vnp_TxnRef || !vnp_TransactionDate }
  );
  useEffect(() => {
    if (isSuccessOrder && orderData && orderData?.code === '00') {
      setOrder(orderData);
      updateOrder({ orderId: vnp_TxnRef, status: 'pending', isPaid: true });
    }
    if (isErrorOrder && errorOrder) {
      setOrder(errorOrder?.data);
    }
  }, [isSuccessOrder, orderData, isErrorOrder, errorOrder]);
  if (isLoadingOrder) return <Loading />;
  // const data = () => {
  //   const newObj = searchParams
  //     .toString()
  //     .split(['&'])
  //     .reduce((acc, data) => {
  //       console.log(acc);
  //       const [key, value] = data.split('=');
  //       acc[key] = decodeURIComponent(value);
  //       return acc;
  //     }, {});
  //   return newObj;
  // };
  // console.log(data());
  return (
    !isLoadingOrder && (
      <section className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 py-16 rounded-[4px] flex flex-col justify-center items-center gap-6'>
        <p className='text-2xl font-bold'>{order?.message}</p>
        <button
          className='bg-neutral-700 hover:bg-violet-500 text-white px-8 py-3 text-md rounded-[4px] transition-colors'
          onClick={() => navigate('/', { replace: true })}
        >
          Go Home
        </button>
      </section>
    )
  );
}

export default VnpayReturnLayout;
