import { useEffect, useState } from 'react';
import cancelImg from '../../assets/cancel.png';
import NotFoundLayout from '../NotFoundLayout/NotFoundLayout';
import {
  useGetOderDetailsQuery,
  useUpdateOrderByUserMutation,
} from '../../services/redux/query/users';
import { useNavigate, useSearchParams } from 'react-router-dom';
function CancelLayout() {
  const navigate = useNavigate();
  const [countDown, setCountDown] = useState(5);
  const [searchQuery] = useSearchParams();
  const code = searchQuery.get('orderCode');
  const status = searchQuery.get('status');
  const isCancel = searchQuery.get('cancel');
  const {
    data: dataOrder,
    isSuccess: isSuccessOrder,
    isError: isErrorOrder,
    error: errorOrder,
  } = useGetOderDetailsQuery(code, { skip: !code });
  const [updateOrder] = useUpdateOrderByUserMutation();
  useEffect(() => {
    if (isSuccessOrder) {
      const interval = setInterval(() => {
        setCountDown((prevCount) => {
          if (prevCount === 0) {
            return 0;
          } else {
            return (prevCount -= 1);
          }
        });
      }, 1000);
      const timeId = setTimeout(() => {
        navigate('/', { replace: true });
      }, 5000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeId);
      };
    }
  }, [isSuccessOrder, navigate]);
  useEffect(() => {
    if (
      isSuccessOrder &&
      status === 'CANCELLED' &&
      dataOrder?.order?.paymentInfo?.status !== 'cancel'
    ) {
      updateOrder({
        orderId: code,
        status: 'cancel',
      });
    }
  }, [code, status, isCancel, isSuccessOrder, dataOrder, updateOrder]);
  if (isErrorOrder && errorOrder) return <NotFoundLayout />;
  return (
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 py-16 rounded-[4px] bg-neutral-100 flex flex-col justify-center items-center gap-[20px]'>
      <div className='w-[180px] h-[180px]'>
        <img
          className='w-full h-ful object-cover'
          src={cancelImg}
          alt='cancel-img'
          {...{ fetchPriority: 'high' }}
        />
      </div>
      <h1 className='text-xl font-bold'>Payment cancelled!</h1>
      <p>
        We are sorry for the inconvenience this may cause and hope that you will
        find suitable products in the future.
      </p>
      <button
        className='bg-neutral-700 hover:bg-violet-500 text-white px-8 py-3 text-md rounded-[4px] transition-colors'
        onClick={() => router.replace('/')}
      >
        Go Home ({countDown}s)
      </button>
    </div>
  );
}

export default CancelLayout;
