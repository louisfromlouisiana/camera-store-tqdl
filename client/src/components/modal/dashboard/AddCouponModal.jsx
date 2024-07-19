import Modal from '@/Modal';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import useClickOutside from '../../../hooks/useClickOutside';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { FaXmark } from 'react-icons/fa6';
import { ModalContext } from '../../../context/ModalProvider';
import { useCreateCouponMutation } from '../../../services/redux/query/products';
import { FetchDataContext } from '../../../context/FetchDataProvider';
import {
  formatAndPreserveCursor,
  formatNumber,
} from '../../../services/utils/format';
function AddCouponModal() {
  const { categories } = useContext(FetchDataContext);
  const { state, setVisibleModal } = useContext(ModalContext);
  const [modalRef, clickOutside] = useClickOutside();
  const imgRef = useRef();
  const [form, setForm] = useState({
    name: '',
    category: '',
    discount: 0,
    minPrice: '',
    maxDiscount: '',
    start_date: '',
    end_date: '',
    image: null,
  });
  const [
    createCoupon,
    {
      data: postData,
      isSuccess: isSuccessPost,
      isLoading: isLoadingPost,
      isError: isErrorPost,
      error: errorPost,
    },
  ] = useCreateCouponMutation();
  useEffect(() => {
    if (state.visibleAddCouponModal) {
      setForm({
        name: '',
        category: '',
        discount: 0,
        minPrice: '',
        maxDiscount: '',
        start_date: '',
        end_date: '',
        image: null,
      });
    }
  }, [state.visibleAddCouponModal]);
  const handleUploadImg = () => {
    if (imgRef?.current) {
      imgRef.current.click();
    }
  };
  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    setForm({ ...form, image: file });
  };
  const handleInputNumberChange = (e) => {
    const { name } = e.target;
    const value = e.target.value.replace(/\D/g, '');
    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      setForm({ ...form, [name]: numericValue });
    }
  };
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const data = new FormData();
      data.append('name', form.name);
      data.append('category', form.category);
      data.append('discount', form.discount);
      data.append('minPrice', form.minPrice);
      data.append('maxDiscount', form.maxDiscount);
      data.append('start_date', form.start_date);
      data.append('end_date', form.end_date);
      form.image && data.append('images', form.image);
      await createCoupon(data);
    },
    [createCoupon, form]
  );
  useEffect(() => {
    if (isSuccessPost && postData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: postData?.message,
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
  }, [isSuccessPost, postData, isErrorPost, errorPost, setVisibleModal]);
  return (
    <Modal>
      <section
        style={{ backgroundColor: 'rgba(51,51,51,0.9)' }}
        className={`fixed right-0 top-0 w-full h-full z-[100] flex justify-end overflow-hidden ${
          state.visibleAddCouponModal ? 'translate-x-0' : 'translate-x-[100%]'
        } transition-all duration-200`}
        onClick={clickOutside}
      >
        <form
          className='w-full lg:w-1/2 h-full bg-slate-50 flex flex-col gap-12 text-neutral-700'
          ref={modalRef}
          onSubmit={handleSubmit}
        >
          <div className='px-4 py-4 sm:py-6 flex justify-between items-center gap-4 bg-neutral-200'>
            <h1 className='text-xl sm:text-2xl font-bold'>Add Coupon</h1>
            <button
              type='button'
              aria-label='close-modal'
              onClick={() => setVisibleModal('visibleAddCouponModal')}
            >
              <FaXmark className='text-2xl sm:text-3xl' />
            </button>
          </div>
          <div className='h-full flex flex-col gap-6 p-4 overflow-y-auto'>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='images'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Image
              </label>
              <div className='col-span-8 sm:col-span-4 flex flex-col gap-4'>
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
                  />
                </div>
                {form.image && (
                  <div className='relative w-[96px] h-[96px]'>
                    <img
                      className='w-full h-full object-cover'
                      src={URL.createObjectURL(form.image)}
                      alt={form.image.name}
                    />
                    <button
                      className='absolute top-1 right-1 border border-red-500 text-red-500 rounded-full p-1'
                      aria-label='remove-img'
                      type='button'
                      onClick={() =>
                        setForm({
                          ...form,
                          image: null,
                        })
                      }
                    >
                      <FaXmark />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='name'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Name
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <input
                  id='name'
                  name='name'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  type='text'
                  placeholder='Enter coupon name...'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='category'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Category
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <select
                  className='focus:outline-none block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  name='category'
                  id='category'
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value=''>Category</option>
                  {categories?.map((c) => {
                    return (
                      <option className='capitalize' key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='discount'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Discount
              </label>
              <div className='col-span-8 sm:col-span-4 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex items-stretch'>
                <span className='px-2 flex justify-center items-center'>%</span>
                <input
                  id='discount'
                  name='discount'
                  className='block w-full h-12 px-3 py-1 text-sm leading-5 bg-gray-100'
                  type='text'
                  placeholder='Enter coupon discount...'
                  value={form.discount}
                  max={100}
                  onChange={(e) =>
                    setForm({ ...form, discount: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='minPrice'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Min Price
              </label>
              <div className='col-span-8 sm:col-span-4 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex items-stretch'>
                <span className='px-2 flex justify-center items-center'>đ</span>
                <input
                  id='minPrice'
                  name='minPrice'
                  className='block w-full h-12 px-3 py-1 text-sm leading-5 bg-gray-100'
                  placeholder='Enter coupon min price...'
                  type='text'
                  value={formatNumber(form.minPrice)} // Display the formatted value
                  onChange={(e) => {
                    handleInputNumberChange(e);
                    formatAndPreserveCursor(e);
                  }}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='maxDiscount'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Max Discount
              </label>
              <div className='col-span-8 sm:col-span-4 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex items-stretch'>
                <span className='px-2 flex justify-center items-center'>đ</span>
                <input
                  id='maxDiscount'
                  name='maxDiscount'
                  className='block w-full h-12 px-3 py-1 text-sm leading-5 bg-gray-100'
                  placeholder='Enter coupon max discount...'
                  type='text'
                  value={formatNumber(form.maxDiscount)} // Display the formatted value
                  onChange={(e) => {
                    handleInputNumberChange(e);
                    formatAndPreserveCursor(e);
                  }}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='start_date'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Start Date
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <input
                  id='start_date'
                  name='start_date'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  type='datetime-local'
                  placeholder='Enter coupon start date...'
                  value={form.start_date}
                  onChange={(e) =>
                    setForm({ ...form, start_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='end_date'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                End Date
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <input
                  id='end_date'
                  name='end_date'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  type='datetime-local'
                  placeholder='Enter coupon end date...'
                  value={form.end_date}
                  onChange={(e) =>
                    setForm({ ...form, end_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className='mt-auto flex justify-end items-stretch gap-4 font-bold'>
              <button
                type='button'
                className='border border-neutral-700 rounded px-4 py-2 hover:border-red-300 hover:text-red-400 transition-colors'
                onClick={() => setVisibleModal('visibleAddCouponModal')}
                disabled={isLoadingPost}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='bg-neutral-700 text-white rounded px-4 py-2 hover:bg-violet-500 transition-colors'
                disabled={isLoadingPost}
              >
                Add Coupon
              </button>
            </div>
          </div>
        </form>
      </section>
    </Modal>
  );
}

export default AddCouponModal;
