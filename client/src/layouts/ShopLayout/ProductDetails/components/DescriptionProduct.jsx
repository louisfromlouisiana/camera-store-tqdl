import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useGetReviewsProductQuery } from '../../../../services/redux/query/products';
import { FaStar, FaStarHalfStroke } from 'react-icons/fa6';
import Pagination from '../../../../components/ui/Pagination';
import { formatTime } from '../../../../services/utils/format';
import { ModalContext } from '../../../../context/ModalProvider';
import ImageModal from '../../../../components/modal/ImageModal';

function DescriptionProduct({ product }) {
  const { state, setVisibleModal } = useContext(ModalContext);
  const tabs = ['description', 'information', 'FAQ', 'reviews'];
  const [curTab, setCurTab] = useState('description');
  const [hoverTab, setHoverTab] = useState(null);
  const { data: reviewsData, isSuccess: isSuccessReviews } =
    useGetReviewsProductQuery(product._id, {
      skip: !product._id,
      pollingInterval: 1000 * 60 * 5,
      refetchOnFocus: true,
    });
  const renderedTabs = useMemo(() => {
    return tabs.map((t) => {
      return (
        <li
          className='relative py-2'
          key={t}
          onMouseEnter={() => setHoverTab(t)}
          onMouseLeave={() => setHoverTab(null)}
        >
          <button
            className={`capitalize font-medium hover:text-violet-500 ${
              curTab === t ? 'text-violet-500' : 'text-neutral-700'
            }`}
            onClick={() => setCurTab(t)}
          >
            {t}
          </button>
          <span
            className={`absolute bottom-0 left-0 ${
              curTab === t || hoverTab === t ? 'w-1/12 sm:w-4/5' : 'w-0'
            } h-[2px] bg-violet-500 transition-all duration-200`}
          ></span>
        </li>
      );
    });
  }, [curTab, hoverTab]);
  const renderStars = useCallback((rate, size) => {
    const fullStars = Math.floor(rate);
    const decimalPart = rate - fullStars;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`text-violet-500 w-[${size}px] h-[${size}px]`}
        />
      );
    }
    if (decimalPart > 0) {
      stars.push(
        <FaStarHalfStroke
          key={fullStars}
          className={`text-violet-500 w-[${size}px] h-[${size}px]`}
        />
      );
    }
    const remainingStars = 5 - Math.ceil(rate);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FaStar key={fullStars + i} className={`w-[${size}px] h-[${size}px]`} />
      );
    }

    return stars;
  }, []);
  const renderedReviews = useMemo(() => {
    return (
      isSuccessReviews &&
      reviewsData?.reviews?.map((r) => {
        return (
          <article className='py-4 border-b border-neutral-300' key={r?._id}>
            <div className='w-full flex gap-4 text-sm'>
              <div className='my-2 w-[42px] h-[42px] rounded-full overflow-hidden'>
                <img
                  className='w-full h-full object-cover'
                  src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                    r?.user?.image?.url
                  }`}
                  alt={r?.user?.email}
                  {...{ fetchPriority: 'low' }}
                />
              </div>
              <div className='w-full flex flex-col gap-4'>
                <div className='w-full flex flex-col md:flex-row md:items-center gap-2'>
                  <div className='flex flex-col gap-2'>
                    <p>{r?.user?.email}</p>
                    <div className='flex items-center'>
                      {renderStars(r?.rate, 16)}
                    </div>
                  </div>
                  <div className='w-full flex md:justify-end'>
                    <p>{formatTime(r?.created_at)}</p>
                  </div>
                </div>
                <p className='font-medium'>{r?.message}</p>
                <div className='flex flex-wrap gap-4'>
                  {r?.images?.map((img, index) => {
                    return (
                      <div
                        className='w-[72px] h-[72px] hover:cursor-zoom-in'
                        key={index}
                        onClick={() =>
                          setVisibleModal({
                            visibleImageModal: {
                              curImage: 0,
                              totalImages: r.images.length,
                              images: r.images,
                            },
                          })
                        }
                      >
                        <img
                          className='w-full h-full object-cover'
                          src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                            img.url
                          }`}
                          alt={img.name}
                          fetchPriority='low'
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>
        );
      })
    );
  }, [isSuccessReviews, reviewsData, setVisibleModal]);
  return (
    <>
      {state.visibleImageModal && <ImageModal />}
      <div className='w-full py-4 flex flex-col gap-4 md:gap-8'>
        <ul className='py-4 flex flex-col sm:flex-row justify-center sm:items-center gap-4 border-b-2 border-neutral-300'>
          {renderedTabs}
        </ul>
        {curTab === 'description' && (
          <div className='md:px-8'>
            {product?.description && (
              <div
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              ></div>
            )}
          </div>
        )}
        {curTab === 'information' && (
          <>
            {product?.specifications?.length > 0 ? (
              <ul className='md:px-8 flex flex-col gap-2'>
                {product?.specifications?.map((s, index) => {
                  return (
                    <li
                      className='flex items-center gap-2 overflow-hidden'
                      key={s?._id}
                    >
                      <p>{index + 1}.</p>
                      <div className='w-full grid grid-cols-5 font-bold'>
                        <p className='col-span-2 md:col-span-1'>{s?.name}:</p>
                        <p
                          title={s?.value}
                          className='col-span-3 sm:col-span-4 w-max truncate'
                        >
                          {s?.value}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className='flex justify-center items-center text-xl font-bold'>
                <p>This product does not have technical specifications yet!</p>
              </div>
            )}
          </>
        )}
        {curTab === 'FAQ' && (
          <>
            {product?.questions?.length > 0 ? (
              <ul className='md:px-8 flex flex-col gap-2'>
                {product?.questions?.map((q, index) => {
                  console.log(q);
                  return (
                    <li className='flex gap-2' key={index}>
                      <p>{index + 1}.</p>
                      <div className='w-full flex flex-col gap-2 font-bold'>
                        <p>{q?.title}</p>
                        <p>{q?.answer}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className='flex justify-center items-center text-xl font-bold'>
                <p>This product has no FAQ yet!</p>
              </div>
            )}
          </>
        )}
        {curTab === 'reviews' && (
          <>
            {reviewsData?.totalReviews > 0 ? (
              <div className='w-full sm:w-4/5 m-auto flex flex-col gap-8 items-start'>
                <div className='w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                  <div className='order-2 sm:order-1 flex flex-col gap-4 text-violet-500'>
                    <p className='font-medium flex gap-[5px] text-2xl'>
                      <span className='text-3xl'>{reviewsData?.avgRate}</span>
                      <span>out of</span>
                      <span>5</span>
                    </p>
                    {/* <div className='flex items-center h-[2px]'>
                    {renderStars(reviewsData?.avgRate, 20)}
                  </div> */}
                  </div>
                  <div className='order-1 sm:order-2 flex sm:justify-end'>
                    <p className='font-bold'>
                      ( {reviewsData?.totalReviews} people rated it)
                    </p>
                  </div>
                </div>
                <div className='w-full flex flex-col gap-[10px]'>
                  {renderedReviews}
                </div>
                {reviewsData?.totalPage > 1 && (
                  <Pagination totalPage={reviewsData?.totalPage} />
                )}
              </div>
            ) : (
              <div className='flex justify-center items-center text-xl font-bold'>
                <p>This product has no reviews yet!</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default DescriptionProduct;
