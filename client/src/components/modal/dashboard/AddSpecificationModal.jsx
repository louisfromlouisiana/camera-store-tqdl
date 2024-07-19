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
import { usePostSpecificationMutation } from '../../../services/redux/query/products';
import { ModalContext } from '../../../context/ModalProvider';
function AddSpecificationModal() {
  const { state, setVisibleModal } = useContext(ModalContext);
  const [modalRef, clickOutside] = useClickOutside();
  const imgRef = useRef();
  const [form, setForm] = useState({
    SKU: '',
    name: '',
    image: null,
    description: '',
    isSell: false,
    price: 0,
    quantity: 0,
  });
  const [
    postSpecification,
    {
      data: postSpecificationData,
      isSuccess: isSuccessPostSpecification,
      isLoading: isLoadingPostSpecification,
      isError: isErrorPostSpecification,
      error: errorPostSpecification,
    },
  ] = usePostSpecificationMutation();
  const handleUploadImg = () => {
    if (imgRef?.current) {
      imgRef.current.click();
    }
  };
  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    setForm({ ...form, image: file });
  };
  const closeModal = useCallback(() => {
    setVisibleModal('visibleAddSpecificationModal');
    setForm({
      name: '',
      image: null,
      description: '',
      isSell: false,
      price: 0,
      quantity: 0,
    });
  }, [setVisibleModal]);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const data = new FormData();
      data.append('SKU', form.SKU);
      data.append('name', form.name);
      form.image && data.append('images', form.image);
      data.append('value', form.description);
      data.append('isSell', JSON.stringify(form.isSell));
      form.isSell && data.append('price', form.price);
      form.isSell && data.append('quantity', form.quantity);
      await postSpecification(data);
    },
    [postSpecification, form]
  );
  useEffect(() => {
    if (isSuccessPostSpecification && postSpecificationData) {
      setForm({
        name: '',
        image: null,
        description: '',
        isSell: false,
        price: 0,
        quantity: 0,
      });
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: postSpecificationData?.message,
        },
      });
    }
    if (isErrorPostSpecification && errorPostSpecification) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorPostSpecification?.data?.message,
        },
      });
    }
  }, [
    isSuccessPostSpecification,
    postSpecificationData,
    isErrorPostSpecification,
    errorPostSpecification,
    setVisibleModal,
  ]);
  return (
    <Modal>
      <section
        style={{ backgroundColor: 'rgba(51,51,51,0.9)' }}
        className={`fixed right-0 top-0 w-full h-full z-[100] flex justify-end overflow-hidden ${
          state.visibleAddSpecificationModal
            ? 'translate-x-0'
            : 'translate-x-[100%]'
        } transition-all duration-200`}
        onClick={clickOutside}
      >
        <form
          className='w-full lg:w-1/2 h-full bg-slate-50 flex flex-col gap-12 text-neutral-700'
          ref={modalRef}
          onSubmit={handleSubmit}
        >
          <div className='px-4 py-4 sm:py-6 flex justify-between items-center gap-4 bg-neutral-200'>
            <h1 className='text-xl sm:text-2xl font-bold'>Add Specification</h1>
            <button type='button' aria-label='close-modal' onClick={closeModal}>
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
                  placeholder='Enter Specification SKU...'
                  value={form.SKU}
                  onChange={(e) => setForm({ ...form, SKU: e.target.value })}
                />
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
                  placeholder='Enter Specification name...'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                  placeholder='Enter Specification description...'
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='isSell'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Sell
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <button
                  type='button'
                  className={`relative w-[72px] h-[32px] ${
                    form.isSell ? 'bg-green-500' : 'bg-red-500'
                  } rounded-3xl flex justify-center items-center gap-2 text-sm font-bold text-white overflow-hidden`}
                  aria-label='toggle-btn'
                  onClick={() => setForm({ ...form, isSell: !form.isSell })}
                >
                  <span
                    className={`${
                      form.isSell ? 'opacity-100' : 'opacity-0'
                    } transition-colors`}
                  >
                    Yes
                  </span>
                  <span
                    className={`${
                      form.isSell ? 'opacity-0' : 'opacity-100'
                    } transition-colors`}
                  >
                    No
                  </span>
                  <span
                    className={`absolute w-[32px] h-full left-0 top-1/2 -translate-y-1/2 bg-white rounded-full ${
                      form.isSell ? 'translate-x-[125%]' : 'translate-x-0'
                    } transition-all duration-200`}
                  ></span>
                </button>
              </div>
            </div>
            {form.isSell && (
              <>
                <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
                  <label
                    htmlFor='price'
                    className='block text-sm col-span-4 sm:col-span-2 font-medium'
                  >
                    Price
                  </label>
                  <div className='col-span-8 sm:col-span-4 flex items-stretch rounded-md'>
                    <div className='flex justify-center items-center border border-gray-200 bg-gray-100 px-2'>
                      đ
                    </div>
                    <input
                      id='price'
                      name='price'
                      className='block w-full h-12 border px-3 py-1 text-sm leading-5 bg-gray-100 focus:border-gray-200 border-gray-200'
                      type='number'
                      placeholder='Enter Specification price...'
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
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
                  <div className='col-span-8 sm:col-span-4'>
                    <input
                      id='quantity'
                      name='quantity'
                      className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                      type='text'
                      placeholder='Enter Specification quantity...'
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                    />
                  </div>
                </div>
              </>
            )}
            <div className='mt-auto flex justify-end items-stretch gap-4 font-bold'>
              <button
                type='button'
                className='border border-neutral-700 rounded px-4 py-2 hover:border-red-300 hover:text-red-400 transition-colors'
                onClick={closeModal}
                disabled={isLoadingPostSpecification}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='bg-neutral-700 text-white rounded px-4 py-2 hover:bg-violet-500 transition-colors'
                disabled={isLoadingPostSpecification}
              >
                Add Specification
              </button>
            </div>
          </div>
        </form>
      </section>
    </Modal>
  );
}

export default AddSpecificationModal;
