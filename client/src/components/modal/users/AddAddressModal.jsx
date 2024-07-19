import Modal from '@/Modal.jsx';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import useClickOutside from '../../../hooks/useClickOutside';
import { FaXmark } from 'react-icons/fa6';
import { ModalContext } from '../../../context/ModalProvider';
import { usePostAddressMutation } from '../../../services/redux/query/users';
import {
  useGetDistrictsQuery,
  useGetProvincesQuery,
  useGetWardsQuery,
} from '../../../services/redux/query/webInfo';
function AddAddressModal() {
  const { state, setVisibleModal } = useContext(ModalContext);
  const [modalRef, clickOutside] = useClickOutside();
  const [form, setForm] = useState({
    province: {
      id: '',
      code: '',
      name: '',
    },
    district: {
      id: '',
      code: '',
      name: '',
    },
    ward: {
      id: '',
      code: '',
      name: '',
    },
    address: '',
    phone: '',
    isDefault: false,
  });
  const { data: provincesData, isSuccess: isSuccessProvinces } =
    useGetProvincesQuery();
  const { data: districtsData, isSuccess: isSuccessDistricts } =
    useGetDistrictsQuery(form.province.code, { skip: !form.province.code });
  const { data: wardsData, isSuccess: isSuccessWards } = useGetWardsQuery(
    form.district.code,
    { skip: !form.district.code }
  );
  const [
    postAddress,
    {
      data: postAddressData,
      isSuccess: isSuccessPostAddress,
      isLoading: isLoadingPostAddress,
      isError: isErrorPostAddress,
      error: errorPostAddress,
    },
  ] = usePostAddressMutation();
  useEffect(() => {
    if (state.visibleAddAddressModal) {
      setForm({
        province: {
          id: '',
          code: '',
          name: '',
        },
        district: {
          id: '',
          code: '',
          name: '',
        },
        ward: {
          id: '',
          code: '',
          name: '',
        },
        phone: '',
        address: '',
        isDefault: false,
      });
    }
  }, [state.visibleAddAddressModal]);
  const handleChangeCode = useCallback(
    (e) => {
      const { name, value } = e.target;
      const selectedIndex = e.target.selectedIndex;
      const selectedOption = e.target.options[selectedIndex];
      const id = selectedOption.getAttribute('data-id');
      const code = selectedOption.getAttribute('data-code');
      setForm({
        ...form,
        [name]: {
          id: id,
          name: value,
          code: code,
        },
      });
    },
    [form]
  );
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await postAddress({
        province: form.province.id,
        district: form.district.id,
        ward: form.ward.id,
        address: form.address,
        phone: form.phone.toString(),
        isDefault: form.isDefault,
      });
    },
    [postAddress, form]
  );
  useEffect(() => {
    if (isSuccessPostAddress && postAddressData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: postAddressData?.message,
        },
      });
    }
    if (isErrorPostAddress && errorPostAddress) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorPostAddress?.data?.message,
        },
      });
    }
  }, [
    isSuccessPostAddress,
    postAddressData,
    isErrorPostAddress,
    errorPostAddress,
    setVisibleModal,
  ]);
  return (
    <Modal>
      <section
        style={{ backgroundColor: 'rgba(51,51,51,0.9)' }}
        className={`fixed right-0 top-0 w-full h-full z-[100] flex justify-end overflow-hidden ${
          state.visibleAddAddressModal ? 'translate-x-0' : 'translate-x-[100%]'
        } transition-all duration-200`}
        onClick={clickOutside}
      >
        <form
          className='w-full lg:w-1/2 h-full bg-slate-50 flex flex-col gap-12 text-neutral-700'
          ref={modalRef}
          onSubmit={handleSubmit}
        >
          <div className='px-4 py-4 sm:py-6 flex justify-between items-center gap-4 bg-neutral-200'>
            <h1 className='text-xl sm:text-2xl font-bold'>Add Address</h1>
            <button
              type='button'
              aria-label='close-modal'
              onClick={() => setVisibleModal('visibleAddAddressModal')}
            >
              <FaXmark className='text-2xl sm:text-3xl' />
            </button>
          </div>
          <div className='h-full flex flex-col gap-6 p-4 overflow-y-auto'>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='province'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Province
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <select
                  className='h-[48px] px-4 w-full border border-neutral-300 rounded focus:outline-none'
                  name='province'
                  id='province'
                  onChange={handleChangeCode}
                  value={form.province.name}
                >
                  <option value=''>Chose Province</option>
                  {isSuccessProvinces &&
                    provincesData?.map((p) => {
                      return (
                        <option
                          key={p._id}
                          data-id={p._id}
                          data-code={p.code}
                          value={p.name}
                        >
                          {p.name}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='district'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                District
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <select
                  className='h-[48px] px-4 w-full border border-neutral-300 rounded focus:outline-none'
                  name='district'
                  id='district'
                  onChange={handleChangeCode}
                  value={form.district.name}
                >
                  <option value=''>Chose District</option>
                  {isSuccessDistricts &&
                    districtsData?.map((d) => {
                      return (
                        <option
                          key={d._id}
                          data-id={d._id}
                          data-code={d.code}
                          value={d.name}
                        >
                          {d.name}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='ward'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Ward
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <select
                  className='h-[48px] px-4 w-full border border-neutral-300 rounded focus:outline-none'
                  name='ward'
                  id='ward'
                  onChange={handleChangeCode}
                  value={form.ward.name}
                >
                  <option value=''>Chose Ward</option>
                  {isSuccessWards &&
                    wardsData?.map((w) => {
                      return (
                        <option
                          key={w._id}
                          data-id={w._id}
                          data-code={w.code}
                          value={w.name}
                        >
                          {w.name}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='address'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Address
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <input
                  id='address'
                  name='address'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  type='text'
                  placeholder='Enter Address details...'
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='phone'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Phone
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <input
                  id='phone'
                  name='phone'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  type='number'
                  placeholder='Enter phone...'
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='isDefault'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Set Default
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <button
                  type='button'
                  className={`relative ${
                    form.isDefault ? 'bg-green-500' : 'bg-red-500'
                  } transition-all duration-200 text-white px-4 py-1 rounded-3xl text-sm font-bold flex justify-between gap-1`}
                  onClick={() =>
                    setForm({ ...form, isDefault: !form.isDefault })
                  }
                >
                  <span
                    className={`${
                      form.isDefault ? 'opacity-100' : 'opacity-0'
                    } transition-all duration-200`}
                  >
                    Yes
                  </span>
                  <span
                    className={`${
                      !form.isDefault ? 'opacity-100' : 'opacity-0'
                    }  transition-all duration-200`}
                  >
                    No
                  </span>
                  <span
                    className={`absolute top-1/2 -translate-y-1/2 left-0 bg-white w-8 h-full rounded-full z-10 ${
                      form.isDefault ? 'translate-x-[138%]' : 'translate-x-0'
                    } transition-all duration-200`}
                  ></span>
                </button>
              </div>
            </div>
            <div className='mt-auto flex justify-end items-stretch gap-4 font-bold'>
              <button
                type='button'
                className='border border-neutral-700 rounded px-4 py-2 hover:border-red-300 hover:text-red-400 transition-colors'
                onClick={() => setVisibleModal('visibleAddAddressModal')}
                disabled={isLoadingPostAddress}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='bg-neutral-700 text-white rounded px-4 py-2 hover:bg-violet-500 transition-colors'
                disabled={isLoadingPostAddress}
              >
                Add Address
              </button>
            </div>
          </div>
        </form>
      </section>
    </Modal>
  );
}

export default AddAddressModal;
