import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { formatNumberWithDot } from '../../../../services/utils/format';
import { FaCartPlus } from 'react-icons/fa6';
import { IoAddSharp, IoRemoveSharp } from 'react-icons/io5';
import {
  useGetAllCartQuery,
  usePostCartMutation,
} from '../../../../services/redux/query/users';
import { ModalContext } from '../../../../context/ModalProvider';
import { getToken, getUser } from '../../../../services/redux/slice/userSlice';
import { useSelector } from 'react-redux';

function ProductDetails({ product }) {
  const { setVisibleModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const [isBuyNow, setIsBuyNow] = useState(false);
  const initialState = {
    count: 1,
  };
  const reducer = (state, action) => {
    switch (action.type) {
      case 'SET_QUANTITY':
        if (action.payload > product?.availableQuantity)
          return {
            count: (state.count = product?.availableQuantity),
          };
        if (action.payload < 1) return { count: (state.count = 1) };
        return { count: (state.count = action.payload) };
      case 'INCREASE_QUANTITY':
        if (state.count === product?.availableQuantity)
          return {
            count: (state.count = product?.availableQuantity),
          };
        return { count: state.count + 1 };
      case 'DECREASE_QUANTITY':
        if (state.count < 2) return { count: (state.count = 1) };
        return { count: state.count - 1 };
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const [
    postCart,
    {
      data: postCartData,
      isLoading: isLoadingPostCart,
      isSuccess: isSuccessPostCart,
      isError: isErrorPostCart,
      error: errorPostCart,
    },
  ] = usePostCartMutation();
  const accessToken = useSelector(getToken);
  const user = useSelector(getUser);
  const { data: cartData, isSuccess: isSuccessCart } = useGetAllCartQuery(
    null,
    {
      skip: !isBuyNow || !accessToken || !user || user?.role?.value === 1,
    }
  );
  const handleAddToCart = useCallback(async () => {
    if (!user) {
      navigate('/login');
    } else {
      await postCart({
        productId: product?._id,
        quantity: state.count,
      });
    }
  }, [postCart, navigate, state]);
  const handleBuyNow = useCallback(async () => {
    if (!user) {
      navigate('/login');
    } else {
      await postCart({
        productId: product?._id,
        quantity: state.count,
      });
      setIsBuyNow(true);
    }
  }, [postCart, state, isBuyNow, navigate]);
  useEffect(() => {
    if (isSuccessPostCart && postCartData && !isBuyNow) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: postCartData?.message,
        },
      });
    }
    if ((isErrorPostCart, errorPostCart)) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorPostCart?.data?.message,
        },
      });
    }
  }, [
    isSuccessPostCart,
    postCartData,
    isErrorPostCart,
    errorPostCart,
    setVisibleModal,
    isBuyNow,
    navigate,
  ]);
  useEffect(() => {
    if (
      isSuccessPostCart &&
      postCartData &&
      isSuccessCart &&
      cartData &&
      user?.isVerified &&
      isBuyNow
    ) {
      window.localStorage.setItem('isBuyNow', product?._id);
      navigate('/checkout?isBuyNow=yes');
    }
  }, [
    isSuccessCart,
    postCartData,
    isSuccessCart,
    cartData,
    user,
    isBuyNow,
    navigate,
  ]);
  return (
    <div className='lg:col-span-1 flex flex-col gap-4 md:gap-8 border-b border-neutral-300 pb-8'>
      <h1
        className='text-2xl md:text-3xl font-bold truncate max-w-max'
        title={product?.name}
      >
        {product?.name}
      </h1>
      <div className='grid grid-cols-6 gap-8'>
        <p className='col-span-2 sm:col-span-1'>Category</p>
        <p
          className='col-span-4 sm:col-span-5 font-bold capitalize truncate w-max'
          title={product?.category?.name}
        >
          {product?.category?.name}
        </p>
      </div>
      <div className='grid grid-cols-6 gap-8'>
        <p className='col-span-2 sm:col-span-1'>Price</p>
        <p className='col-span-2 sm:col-span-1 font-bold text-lg md:text-2xl flex items-center gap-4'>
          <span
            className={`${
              product?.coupon ? 'line-through text-red-500 text-base' : ''
            }`}
          >
            {formatNumberWithDot(product?.price)}
          </span>
          {product.coupon && (
            <span>
              {formatNumberWithDot(
                product.price -
                  ((product.price * product.coupon.discount) / 100 >
                  product.coupon.maxDiscount
                    ? product.coupon.maxDiscount
                    : (product.price * product.coupon.discount) / 100)
              )}
            </span>
          )}
        </p>
      </div>
      <div className='grid sm:grid-cols-6 gap-2 sm:gap-8'>
        <p className='col-span-2 sm:col-span-1'>Quantity</p>
        <div
          className='col-span-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-8'
          aria-disabled={product?.availableQuantity === 0 || isLoadingPostCart}
        >
          <div className='max-w-[120px] flex items-center border border-neutral-300 rounded'>
            <button
              className='w-[32px] p-2 border-r border-neutral-300'
              aria-label='minus'
              onClick={() => dispatch({ type: 'DECREASE_QUANTITY' })}
            >
              <IoRemoveSharp />
            </button>
            <input
              className='w-full text-center'
              type='number'
              value={state.count}
              onChange={(e) =>
                dispatch({
                  type: 'SET_QUANTITY',
                  payload: Number(e.target.value),
                })
              }
            />
            <button
              className='w-[32px] p-2 border-l border-neutral-300'
              aria-label='plus'
              onClick={() => dispatch({ type: 'INCREASE_QUANTITY' })}
            >
              <IoAddSharp />
            </button>
          </div>
          {product?.availableQuantity > 0 && (
            <p className='text-sm text-gray-500'>
              ( {product?.availableQuantity}{' '}
              {product?.availableQuantity > 1 ? 'products' : 'product'}{' '}
              available)
            </p>
          )}
          {product?.availableQuantity === 0 && (
            <p className='text-sm text-gray-500'>
              (The product is currently out of stock)
            </p>
          )}
        </div>
      </div>
      <div className='flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4'>
        <button
          className='w-full sm:max-w-[200px] h-[48px] flex justify-center items-center gap-4 px-8 py-2 bg-violet-100 text-violet-500 border border-violet-500'
          disabled={isLoadingPostCart || product?.availableQuantity === 0}
          onClick={handleAddToCart}
        >
          <FaCartPlus className='text-2xl' />
          <span>Add To Cart</span>
        </button>
        <button
          className='w-full sm:max-w-[180px] h-[48px]  flex justify-center items-center gap-4 px-8 py-2 bg-violet-500 text-white'
          disabled={isLoadingPostCart || product?.availableQuantity === 0}
          onClick={handleBuyNow}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;
