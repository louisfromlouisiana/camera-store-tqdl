import Modal from '@/Modal.jsx';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ModalContext } from '../../../context/ModalProvider';
import {
  useGetAllAddressQuery,
  useUpdateAddressMutation,
} from '../../../services/redux/query/users';
import { useSelector } from 'react-redux';
import { getCurDelivery } from '../../../services/redux/slice/userSlice';
import useClickOutside from '../../../hooks/useClickOutside';

function ListAddressModal() {
  const { state, setVisibleModal } = useContext(ModalContext);
  const [modalRef, clickOutside] = useClickOutside();
  const curAddress = useSelector(getCurDelivery);
  const [defaultAddress, setDefaultAddress] = useState({
    _id: '',
    address: null,
  });
  const { data: addressData, isSuccess: isSuccessAddress } =
    useGetAllAddressQuery();
  const [
    updateAddress,
    {
      data: updateData,
      isSuccess: isSuccessUpdate,
      isLoading: isLoadingUpdate,
      isError: isErrorUpdate,
      error: errorUpdate,
    },
  ] = useUpdateAddressMutation();
  const handleUpdate = useCallback(async () => {
    if (curAddress?._id === defaultAddress._id) {
      setVisibleModal('visibleListAddressModal');
    } else {
      await updateAddress({
        id: defaultAddress._id,
        body: {
          province: defaultAddress?.address?.province?._id,
          district: defaultAddress?.address?.district?._id,
          ward: defaultAddress?.address?.ward._id,
          address: defaultAddress?.address?.address,
          phone: defaultAddress?.address?.phone,
          isDefault: true,
        },
      });
    }
  }, [setVisibleModal, curAddress, defaultAddress, updateAddress]);
  console.log(defaultAddress);
  useEffect(() => {
    if (curAddress && state.visibleListAddressModal) {
      setDefaultAddress({
        _id: curAddress._id,
        address: curAddress,
      });
    }
  }, [curAddress, state.visibleListAddressModal]);
  useEffect(() => {
    if (isSuccessUpdate && updateData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: updateData?.message,
        },
      });
    }
    if (isErrorUpdate && errorUpdate) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorUpdate?.data?.message,
        },
      });
    }
  }, [isSuccessUpdate, updateData, isErrorUpdate, errorUpdate]);
  return (
    <Modal>
      <section
        className={`fixed top-0 left-0 z-50 ${
          state.visibleListAddressModal ? 'w-full h-full px-4 py-8' : 'w-0 h-0'
        } flex justify-center items-center`}
        style={{ backgroundColor: 'rgba(51,51,51,0.8)' }}
        onClick={clickOutside}
        aria-disabled={isLoadingUpdate}
      >
        <div
          className='w-full sm:w-2/3 lg:w-1/2 container m-auto bg-white rounded overflow-hidden'
          ref={modalRef}
        >
          <h1 className='text-xl md:text-2xl font-bold border-b-2 border-neutral-300 p-4 bg-neutral-200'>
            Address
          </h1>
          <div className='p-4 flex flex-col gap-4 h-[60vh] overflow-y-auto'>
            {isSuccessAddress &&
              addressData?.address?.length > 0 &&
              addressData?.address?.map((a) => {
                return (
                  <article
                    className='py-4 flex gap-4 border-b border-neutral-300'
                    key={a._id}
                  >
                    <button
                      className={`my-1 relative w-4 h-4 border-2 ${
                        defaultAddress._id === a._id
                          ? 'border-violet-500'
                          : 'border-neutral-300'
                      } rounded-full`}
                      aria-label='btn-isDefault'
                      onClick={() =>
                        setDefaultAddress({ _id: a._id, address: a })
                      }
                    >
                      {defaultAddress._id === a._id && (
                        <span
                          className={`absolute w-2 h-2 rounded-full bg-violet-500 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2`}
                        ></span>
                      )}
                    </button>
                    <div className='w-full flex flex-col gap-2'>
                      <div className='flex justify-between gap-4'>
                        <div className='flex flex-col gap-1'>
                          <p>
                            {a?.address}, {a?.ward?.name}, {a?.district?.name},{' '}
                            {a?.province?.name}
                          </p>
                          <p className='font-medium'>{a?.phone}</p>
                        </div>
                        <div className='flex justify-end'>
                          <button
                            className='text-violet-500 font-bold'
                            onClick={() =>
                              setVisibleModal({
                                visibleUpdateAddressModal: { ...a },
                              })
                            }
                          >
                            Change
                          </button>
                        </div>
                      </div>
                      {a?.isDefault && (
                        <p className='w-max px-4 py-1 border border-violet-500 text-violet-500 text-sm font-bold'>
                          Default
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            {isSuccessAddress && addressData?.address?.length === 0 && (
              <p className='text-center text-lg font-bold'>No Address Yet!</p>
            )}
          </div>
          <div className='p-4 flex flex-col md:flex-row justify-between gap-4'>
            <button
              className='px-8 py-2 bg-neutral-700 text-white hover:bg-violet-500 transition-colors rounded'
              onClick={() => setVisibleModal('visibleAddAddressModal')}
              disabled={isLoadingUpdate}
            >
              Add address
            </button>
            <div className='flex justify-end gap-4'>
              <button
                className='border border-neutral-700 px-8 py-2 rounded'
                onClick={() => setVisibleModal('visibleListAddressModal')}
                disabled={isLoadingUpdate}
              >
                Cancel
              </button>
              <button
                className='px-8 py-2 bg-neutral-700 text-white hover:bg-violet-500 transition-colors rounded'
                onClick={handleUpdate}
                disabled={isLoadingUpdate}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </section>
    </Modal>
  );
}

export default ListAddressModal;
