import { useEffect, useState } from 'react';
import successImg from '../../assets/successful.png';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NotFoundLayout from '../NotFoundLayout/NotFoundLayout';
import {
  useGetOderDetailsQuery,
  useUpdateOrderByUserMutation,
} from '../../services/redux/query/users';
function SuccessLayout() {
  const [searchQuery] = useSearchParams();
  const navigate = useNavigate();
  const [countDown, setCountDown] = useState(5);
  const code = searchQuery.get('orderCode');
  const status = searchQuery.get('status');
  const paymentMethod = searchQuery.get('paymentMethod');
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
    if (isSuccessOrder && status === 'PAID') {
      updateOrder({ orderId: code, status: 'pending', isPaid: true });
    }
  }, [isSuccessOrder, dataOrder, code, status, updateOrder]);
  if (errorOrder && isErrorOrder) return <NotFoundLayout />;
  return (
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 py-16 rounded-[4px] bg-neutral-100 flex flex-col justify-center items-center gap-[20px]'>
      <div className='w-[180px] h-[180px]'>
        <img
          className='w-[180px] h-[180px]'
          width={180}
          height={180}
          src={successImg}
          alt='success-img'
          {...{ fetchPriority: 'high' }}
        />
      </div>
      {paymentMethod === 'payos' && (
        <h1 className='text-xl font-bold'>Payment success!</h1>
      )}
      {paymentMethod === 'payos' && (
        <p>
          Thank you very much for choosing us. Your support means a lot to us.
        </p>
      )}
      {paymentMethod === 'cod' && (
        <h1 className='text-xl font-bold'>Order success!</h1>
      )}
      {paymentMethod === 'cod' && (
        <p>
          Thank you for ordering from us. We will deliver the goods as soon as
          possible.
        </p>
      )}
      <button
        className='bg-neutral-700 hover:bg-violet-500 text-white px-8 py-3 text-md rounded-[4px] transition-colors'
        onClick={() => navigate('/', { replace: true })}
      >
        Go Home ({countDown}s)
      </button>
    </div>
  );
}

export default SuccessLayout;
