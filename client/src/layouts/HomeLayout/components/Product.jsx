import React, { useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProductsQuery } from '../../../services/redux/query/products';
import { formatNumberWithDot } from '../../../services/utils/format';
import { IoHeartOutline, IoHeartSharp } from 'react-icons/io5';
import { usePostFavoriteMutation } from '../../../services/redux/query/users';
import { ModalContext } from '../../../context/ModalProvider';
import { useSelector } from 'react-redux';
import { getFavorite, getUser } from '../../../services/redux/slice/userSlice';
import { scrollElement } from '../../../services/utils/scrollElement';
function Product() {
  const navigate = useNavigate();
  const user = useSelector(getUser);
  const { setVisibleModal } = useContext(ModalContext);
  const favorite = useSelector(getFavorite);
  const { data: productsData, isSuccess: isSuccessProductsData } =
    useGetProductsQuery(`page=1`);
  const [
    postFavorite,
    {
      isLoading: isLoadingPostFavorite,
      isError: isErrPostFavorite,
      error: errorPostFavorite,
    },
  ] = usePostFavoriteMutation();
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
  useEffect(() => {
    if (isErrPostFavorite && errorPostFavorite) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorPostFavorite?.data?.message,
        },
      });
    }
  }, [isErrPostFavorite, errorPostFavorite]);
  return (
    <section className='container m-auto flex flex-col items-center gap-8 md:gap-16 text-neutral-700 px-4'>
      <div className='flex flex-col items-center'>
        <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold'>
          Our Products
        </h2>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {isSuccessProductsData &&
          productsData?.products?.map((p) => {
            const isFavorite = favorite?.products?.find(
              (product) => product._id === p._id
            );
            return (
              <article className='flex flex-col gap-4'>
                <div className='h-[420px] border border-neutral-300 overflow-hidden'>
                  <img
                    className='object-cover w-full h-full hover:scale-110 transition-all duration-300 cursor-pointer'
                    src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                      p?.images[0]?.url
                    }`}
                    alt={p.name}
                    fetchPriority='low'
                  />
                </div>
                <div className='flex justify-between gap-4'>
                  <div>
                    <button onClick={() => navigate(`/shop/${p._id}`)}>
                      <p className='font-bold truncate max-w-[180px]'>
                        {p.name}
                      </p>
                    </button>
                    <p>{formatNumberWithDot(p.price)} </p>
                  </div>
                  <div>
                    <button
                      className={`hover:text-violet-500 transition-colors`}
                      aria-label='favorite-btn'
                      disabled={isLoadingPostFavorite}
                      onClick={() => handlePostFavorite(p?._id)}
                    >
                      {isFavorite ? (
                        <IoHeartSharp className='text-2xl text-violet-500' />
                      ) : (
                        <IoHeartOutline className='text-2xl' />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
      </div>
      <button
        className='font-bold px-4 py-2 bg-neutral-700 text-white hover:bg-violet-500 transition-colors rounded-3xl'
        onClick={() => {
          scrollElement();
          navigate('/shop?page=1');
        }}
      >
        View More
      </button>
    </section>
  );
}

export default Product;
