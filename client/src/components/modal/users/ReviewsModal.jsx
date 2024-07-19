import Modal from '@/Modal';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa6';
import { ModalContext } from '../../../context/ModalProvider';
import useClickOutside from '../../../hooks/useClickOutside';
import { usePostReviewsMutation } from '../../../services/redux/query/users';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { FaXmark } from 'react-icons/fa6';
const ReviewsModal = () => {
  const { state, setVisibleModal } = useContext(ModalContext);
  const [
    postReview,
    {
      data: reviewData,
      isSuccess: isSuccessPost,
      isLoading: isLoadingPost,
      error: errorPost,
      isError: isErrorPost,
    },
  ] = usePostReviewsMutation();
  const [modalRef, clickOutside] = useClickOutside();
  const imgRef = useRef();
  const [rate, setRate] = useState(5);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [err, setErr] = useState(false);
  const product = useMemo(
    () => state.visibleReviewsModal?.product,
    [state.visibleReviewsModal]
  );
  const handleStarClick = (selectedRate) => {
    setRate(selectedRate);
  };

  const getRatingText = () => {
    switch (rate) {
      case 1:
        return 'Poor';
      case 2:
        return 'Not Satisfied';
      case 3:
        return 'Average';
      case 4:
        return 'Satisfied';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  };
  const renderedStars = useMemo(() => {
    return [...Array(5)].map((_, index) => {
      return (
        <div
          key={index}
          className='cursor-pointer'
          onClick={() => handleStarClick(index + 1)}
        >
          {rate >= index + 1 ? (
            <FaStar className='text-yellow-500' />
          ) : (
            <FaRegStar />
          )}
        </div>
      );
    });
  }, [rate]);
  const handleUploadImg = () => {
    if (imgRef?.current) {
      imgRef.current.click();
    }
  };
  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    setImages([...images, file]);
  };
  const handleReviews = useCallback(async () => {
    if (message) {
      setErr(false);
      const formData = new FormData();
      formData.append('productId', product?._id);
      formData.append('message', message);
      formData.append('rate', rate);
      formData.append('orderCode', state?.visibleReviewsModal?.orderCode);
      if (images.length > 0) {
        images.forEach((img) => {
          formData.append('images', img);
        });
      }
      await postReview(formData);
    } else {
      setErr(true);
    }
  }, [
    message,
    err,
    postReview,
    product,
    rate,
    state?.visibleReviewsModal,
    images,
  ]);
  useEffect(() => {
    if (isSuccessPost && reviewData) {
      setErr(false);
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: reviewData?.message,
        },
      });
    }
    if (isErrorPost && errorPost) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorPost?.data?.message,
        },
      });
    }
    setMessage('');
    setErr(false);
  }, [isSuccessPost, reviewData, isErrorPost, errorPost, setVisibleModal]);
  return (
    <Modal>
      <section
        style={{ backgroundColor: 'rgba(51,51,51,0.8)' }}
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center ${
          state.visibleReviewsModal
            ? 'w-full h-full z-[999] py-8'
            : 'w-0 h-0 -z-10'
        }`}
        onClick={clickOutside}
        aria-disabled={isLoadingPost}
      >
        <div
          className='bg-white max-h-[70vh] w-4/5 sm:w-3/4 lg:w-1/3 py-6 flex flex-col justify-between gap-4 rounded overflow-y-auto'
          ref={modalRef}
        >
          <div className='px-6 flex flex-col gap-4'>
            <p className='text-xl md:text-2xl font-bold'>Product reviews</p>
            <div className='flex gap-2'>
              <div className='text-sm flex flex-col gap-[4px]'>
                <p className='capitalize text-lg font-medium'>
                  {product?.name}
                </p>
              </div>
            </div>
            <div className='flex sm:flex-row items-center gap-4'>
              <p>Product quality:</p>
              <div className='flex items-center gap-4'>
                <div className='flex text-lg'>{renderedStars}</div>
                <p className='sm:block hidden text-yellow'>{getRatingText()}</p>
              </div>
            </div>
            <div className='flex gap-4'>
              <label
                htmlFor='images'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Images:
              </label>
              <div className='w-full flex flex-col gap-4'>
                <div className='border-2 border-dotted border-neutral-300 rounded-lg'>
                  <div
                    className='w-full h-full p-4 cursor-pointer flex flex-col items-center gap-2'
                    role='presentation'
                    onClick={handleUploadImg}
                  >
                    <IoCloudUploadOutline className='text-2xl text-violet-500' />
                    <p className='font-bold'>Upload your image here</p>
                    <p className='italic text-sm'>
                      (Only *.jpeg, *.webp and *.png images will be accepted)
                    </p>
                  </div>
                  <input
                    ref={imgRef}
                    accept='image/*,.jpeg,.jpg,.png,.webp'
                    type='file'
                    style={{ display: 'none' }}
                    onChange={handleFileSelected}
                    multiple
                  />
                </div>
                <div className='grid grid-cols-4 gap-4'>
                  {images?.map((img, key) => {
                    return (
                      <div
                        className='relative w-[96px] h-[96px]'
                        key={img.name}
                      >
                        {img && (
                          <img
                            className='w-full h-full object-cover'
                            src={URL.createObjectURL(img)}
                            alt={img.name}
                          />
                        )}
                        <button
                          type='button'
                          className='absolute top-1 right-1 border border-red-500 text-red-500 rounded-full p-1'
                          aria-label='remove-img'
                          onClick={() =>
                            setImages(
                              images.filter((_, index) => index !== key)
                            )
                          }
                        >
                          <FaXmark />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <textarea
              className={`border ${
                !message && err ? 'border-red' : 'border-gray'
              } focus:outline-none rounded-[4px] p-4`}
              name='reviews'
              id='reviews'
              placeholder='Please share what you like about this product with others.'
              cols={10}
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className='flex justify-end items-center gap-4'>
              <button onClick={() => setVisibleModal('visibleReviewsModal')}>
                Return
              </button>
              <button
                className='bg-violet-500 hover:bg-neutral-700 px-2 py-1 text-white rounded transition-colors'
                onClick={handleReviews}
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      </section>
    </Modal>
  );
};

export default ReviewsModal;
