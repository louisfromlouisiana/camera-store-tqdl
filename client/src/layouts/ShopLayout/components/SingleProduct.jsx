import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { getFavorite, getUser } from '../../../services/redux/slice/userSlice';
import { IoHeartSharp, IoCartSharp } from 'react-icons/io5';
import { formatNumberWithDot } from '../../../services/utils/format';
import {
  usePostCartMutation,
  usePostFavoriteMutation,
} from '../../../services/redux/query/users';
import { ModalContext } from '../../../context/ModalProvider';
import { useNavigate } from 'react-router-dom';
import { scrollElement } from '../../../services/utils/scrollElement';

function SingleProduct({ product }) {
  const user = useSelector(getUser);
  const navigate = useNavigate();
  const { setVisibleModal } = useContext(ModalContext);
  const [curProduct, setCurProduct] = useState(null);
  const favorite = useSelector(getFavorite);
  const [
    postFavorite,
    {
      data: postFavoriteData,
      isLoading: isLoadingPostFavorite,
      isSuccess: isSuccessPostFavorite,
      isError: isErrorPostFavorite,
      error: errorPostFavorite,
    },
  ] = usePostFavoriteMutation();
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
  const isFav = useMemo(() => {
    return favorite?.products?.find((p) => p._id === product._id);
  }, [favorite, product]);
  useEffect(() => {
    if (isSuccessPostFavorite && postFavoriteData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: postFavoriteData?.message,
        },
      });
    }
    if (isErrorPostFavorite && errorPostFavorite) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorPostFavorite?.data?.message,
        },
      });
    }
  }, [
    isSuccessPostFavorite,
    postFavoriteData,
    isErrorPostFavorite,
    errorPostFavorite,
  ]);
  useEffect(() => {
    if (isSuccessPostCart && postCartData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: postCartData?.message,
        },
      });
    }
    if (isErrorPostCart && errorPostCart) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorPostCart?.data?.message,
        },
      });
    }
  }, [isSuccessPostCart, postCartData, isErrorPostCart, errorPostCart]);
  const handleRedirect = useCallback(
    (link) => {
      navigate(`/shop/${link}`);
      scrollElement();
    },
    [navigate]
  );
  const handlePostFavorite = useCallback(
    async (id) => {
      if (!user) {
        navigate('/login');
      } else {
        await postFavorite(id);
      }
    },
    [navigate, postFavorite]
  );
  const handlePostCart = useCallback(
    async (id) => {
      if (!user) {
        navigate('/login');
      } else {
        await postCart({
          productId: id,
          quantity: 1,
        });
      }
    },
    [navigate, postCart]
  );
  return (
    <article
      aria-disabled={isLoadingPostFavorite || isErrorPostCart}
      className='flex flex-col gap-2'
      key={product?._id}
    >
      <div
        className='relative h-[350px] border-2 border-neutral-300 overflow-hidden cursor-pointer'
        onMouseEnter={() => setCurProduct(product._id)}
        onMouseLeave={() => setCurProduct(null)}
      >
        <img
          className='w-full h-full object-cover'
          src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
            product?.images[0]?.url
          }`}
          alt={product.name}
          fetchPriority='low'
        />
        {product.coupon && (
          <span className='absolute top-0 right-0 z-[100] bg-violet-500 px-4 py-2 text-white font-bold'>
            {product.coupon.discount}%
          </span>
        )}
        <div
          style={{ background: 'rgba(255, 255, 255, 0.8)' }}
          className={`absolute top-0 left-0 w-full h-full flex justify-center items-center gap-2 ${
            curProduct === product._id ? 'opacity-100' : 'opacity-0'
          } transition-all duration-200`}
        >
          <button
            className={`text-white p-3 hover:bg-violet-500 ${
              curProduct === product._id
                ? 'translate-y-0 opacity-100'
                : 'translate-y-1/2 opacity-0'
            }  ${
              isFav ? 'bg-violet-500' : 'bg-neutral-700'
            } transition-all duration-200`}
            aria-label='heart-btn'
            onClick={() => handlePostFavorite(product._id)}
          >
            <IoHeartSharp className='text-2xl' />
          </button>
          <button
            className={`bg-neutral-700 text-white p-3 hover:bg-violet-500 ${
              curProduct === product._id
                ? 'translate-y-0 opacity-100'
                : 'translate-y-1/2 opacity-0'
            } transition-all duration-200`}
            aria-label='cart-btn'
            disabled={isLoadingPostCart}
            onClick={() => handlePostCart(product._id)}
          >
            <IoCartSharp className='text-2xl' />
          </button>
        </div>
      </div>
      <div>
        <div className='flex flex-col items-center gap-1'>
          <h3
            className='md:text-lg cursor-pointer truncate max-w-[280px]'
            title={product.name}
            onClick={() => handleRedirect(product._id)}
          >
            {product.name}
          </h3>
          <p className='text-lg font-bold text-violet-500 flex items-center gap-4'>
            <span
              className={`${
                product?.coupon ? 'line-through text-red-500 text-base' : ''
              }`}
            >
              {formatNumberWithDot(product.price)}
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
      </div>
    </article>
  );
}

export default SingleProduct;
