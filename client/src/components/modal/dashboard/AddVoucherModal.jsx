import Modal from '@/Modal';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import useClickOutside from '../../../hooks/useClickOutside';
import { FaXmark } from 'react-icons/fa6';
import { ModalContext } from '../../../context/ModalProvider';
import { usePostVoucherMutation } from '../../../services/redux/query/products';
import {
  formatAndPreserveCursor,
  formatNumber,
} from '../../../services/utils/format';
function AddVoucherModal() {
  const { state, setVisibleModal } = useContext(ModalContext);
  const [modalRef, clickOutside] = useClickOutside();
  const [form, setForm] = useState({
    SKU: '',
    description: '',
    discount: 0,
    maxDiscount: '',
    minPrice: '',
    enabled: false,
    quantity: '',
  });
  const [
    postVoucher,
    {
      data: postVoucherData,
      isSuccess: isSuccessPostVoucher,
      isLoading: isLoadingPostVoucher,
      isError: isErrorPostVoucher,
      error: errorPostVoucher,
    },
  ] = usePostVoucherMutation();
  useEffect(() => {
    if (state.visibleAddVoucherModal) {
      setForm({
        SKU: '',
        description: '',
        discount: 0,
        maxDiscount: '',
        minPrice: '',
        enabled: false,
        quantity: '',
      });
    }
  }, [state.visibleAddVoucherModal]);
  const handleValidateDiscount = useCallback(
    (e) => {
      let discount;
      const { value } = e.target;
      if (Number(value) > 100) {
        discount = 100;
      } else if (Number(value) < 0) {
        discount = 0;
      } else {
        discount = Number(value);
      }
      setForm({ ...form, discount: discount });
    },
    [form]
  );
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
      await postVoucher({
        SKU: form.SKU,
        description: form.description,
        discount: form.discount,
        maxDiscount: form.maxDiscount,
        minPrice: form.minPrice,
        enabled: form.enabled,
        quantity: form.quantity,
      });
    },
    [postVoucher, form]
  );
  useEffect(() => {
    if (isSuccessPostVoucher && postVoucherData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: postVoucherData?.message,
        },
      });
    }
    if (isErrorPostVoucher && errorPostVoucher) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorPostVoucher?.data?.message,
        },
      });
    }
  }, [
    isSuccessPostVoucher,
    postVoucherData,
    isErrorPostVoucher,
    errorPostVoucher,
    setVisibleModal,
  ]);
  return (
    <Modal>
      <section
        style={{ backgroundColor: 'rgba(51,51,51,0.9)' }}
        className={`fixed right-0 top-0 w-full h-full z-[100] flex justify-end overflow-hidden ${
          state.visibleAddVoucherModal ? 'translate-x-0' : 'translate-x-[100%]'
        } transition-all duration-200`}
        onClick={clickOutside}
      >
        <form
          className='w-full lg:w-1/2 h-full bg-slate-50 flex flex-col gap-12 text-neutral-700'
          ref={modalRef}
          onSubmit={handleSubmit}
        >
          <div className='px-4 py-4 sm:py-6 flex justify-between items-center gap-4 bg-neutral-200'>
            <h1 className='text-xl sm:text-2xl font-bold'>Add Voucher</h1>
            <button
              type='button'
              aria-label='close-modal'
              onClick={() => setVisibleModal('visibleAddVoucherModal')}
            >
              <FaXmark className='text-2xl sm:text-3xl' />
            </button>
          </div>
          <div className='h-full flex flex-col gap-6 p-4 overflow-y-auto'>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='SKU'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                SKU
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <input
                  id='SKU'
                  name='SKU'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  type='text'
                  placeholder='Enter Voucher SKU...'
                  value={form.SKU}
                  onChange={(e) => setForm({ ...form, SKU: e.target.value })}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='description'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Description
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <input
                  id='description'
                  name='description'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  type='text'
                  placeholder='Enter Voucher description...'
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='discount'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Discount
              </label>
              <div className='col-span-8 sm:col-span-4 border rounded-md bg-gray-100 focus:border-gray-200 border-gray-200 flex items-stretch'>
                <span className='px-2 border-r border-gray-200 flex justify-center items-center'>
                  %
                </span>
                <input
                  id='discount'
                  name='discount'
                  className='block w-full h-12 px-3 py-1 text-sm leading-5 bg-gray-100'
                  type='number'
                  placeholder='Enter Voucher discount...'
                  value={form.discount}
                  max={100}
                  onChange={handleValidateDiscount}
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
              <div className='col-span-8 sm:col-span-4 border rounded-md bg-gray-100 focus:border-gray-200 border-gray-200 flex items-stretch'>
                <span className='px-2 border-r border-gray-200 flex justify-center items-center'>
                  đ
                </span>
                <input
                  id='maxDiscount'
                  name='maxDiscount'
                  className='block w-full h-12 px-3 py-1 text-sm leading-5 bg-gray-100'
                  placeholder='Enter Voucher max discount...'
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
                htmlFor='minPrice'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Min Price
              </label>
              <div className='col-span-8 sm:col-span-4 border rounded-md bg-gray-100 focus:border-gray-200 border-gray-200 flex items-stretch'>
                <span className='px-2 border-r border-gray-200 flex justify-center items-center'>
                  đ
                </span>
                <input
                  id='minPrice'
                  name='minPrice'
                  className='block w-full h-12 px-3 py-1 text-sm leading-5 bg-gray-100'
                  placeholder='Enter Voucher min price...'
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
                htmlFor='quantity'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Quantity
              </label>
              <div className='col-span-8 sm:col-span-4 border rounded-md bg-gray-100 focus:border-gray-200 border-gray-200 flex items-stretch'>
                <input
                  id='quantity'
                  name='quantity'
                  className='block w-full h-12 px-3 py-1 text-sm leading-5 bg-gray-100'
                  placeholder='Enter Voucher quantity...'
                  type='text'
                  value={formatNumber(form.quantity)} // Display the formatted value
                  onChange={(e) => {
                    handleInputNumberChange(e);
                    formatAndPreserveCursor(e);
                  }}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='enabled'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Enabled
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <button
                  type='button'
                  className={`relative w-[72px] h-[32px] ${
                    form.enabled ? 'bg-green-500' : 'bg-red-500'
                  } rounded-3xl flex justify-center items-center gap-2 text-sm font-bold text-white overflow-hidden`}
                  aria-label='toggle-btn'
                  onClick={() => setForm({ ...form, enabled: !form.enabled })}
                >
                  <span
                    className={`${
                      form.enabled ? 'opacity-100' : 'opacity-0'
                    } transition-colors`}
                  >
                    Yes
                  </span>
                  <span
                    className={`${
                      form.enabled ? 'opacity-0' : 'opacity-100'
                    } transition-colors`}
                  >
                    No
                  </span>
                  <span
                    className={`absolute w-[32px] h-full left-0 top-1/2 -translate-y-1/2 bg-white rounded-full ${
                      form.enabled ? 'translate-x-[125%]' : 'translate-x-0'
                    } transition-all duration-200`}
                  ></span>
                </button>
              </div>
            </div>
            <div className='mt-auto flex justify-end items-stretch gap-4 font-bold'>
              <button
                type='button'
                className='border border-neutral-700 rounded px-4 py-2 hover:border-red-300 hover:text-red-400 transition-colors'
                onClick={() => setVisibleModal('visibleAddVoucherModal')}
                disabled={isLoadingPostVoucher}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='bg-neutral-700 text-white rounded px-4 py-2 hover:bg-violet-500 transition-colors'
                disabled={isLoadingPostVoucher}
              >
                Add Voucher
              </button>
            </div>
          </div>
        </form>
      </section>
    </Modal>
  );
}

export default AddVoucherModal;
