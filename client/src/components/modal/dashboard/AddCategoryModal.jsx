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
import { usePostCategoryMutation } from '../../../services/redux/query/webInfo';
function AddCategoryModal() {
  const { state, setVisibleModal } = useContext(ModalContext);
  const [modalRef, clickOutside] = useClickOutside();
  const imgRef = useRef();
  const [form, setForm] = useState({
    name: '',
    title: '',
    image: null,
    content: '',
  });
  const [
    postCategory,
    {
      data: postCategoryData,
      isSuccess: isSuccessPostCategory,
      isLoading: isLoadingPostCategory,
      isError: isErrorPostCategory,
      error: errorPostCategory,
    },
  ] = usePostCategoryMutation();
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
    setVisibleModal('visibleAddCategoryModal');
    setForm(() => {
      return {
        name: '',
        title: '',
        image: null,
        content: '',
      };
    });
  }, [setVisibleModal]);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const data = new FormData();
      data.append('name', form.name);
      data.append('title', form.title);
      data.append('content', form.content);
      form.image && data.append('images', form.image);
      await postCategory(data);
    },
    [postCategory, form]
  );
  useEffect(() => {
    if (isSuccessPostCategory && postCategoryData) {
      setForm(() => {
        return {
          name: '',
          title: '',
          image: null,
          content: '',
        };
      });
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: postCategoryData?.message,
        },
      });
    }
    if (isErrorPostCategory && errorPostCategory) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorPostCategory?.data?.message,
        },
      });
    }
  }, [
    isSuccessPostCategory,
    postCategoryData,
    isErrorPostCategory,
    errorPostCategory,
    setVisibleModal,
  ]);
  return (
    <Modal>
      <section
        style={{ backgroundColor: 'rgba(51,51,51,0.9)' }}
        className={`fixed right-0 top-0 w-full h-full z-[100] flex justify-end overflow-hidden ${
          state.visibleAddCategoryModal ? 'translate-x-0' : 'translate-x-[100%]'
        } transition-all duration-200`}
        onClick={clickOutside}
      >
        <form
          className='w-full lg:w-1/2 h-full bg-slate-50 flex flex-col gap-12 text-neutral-700'
          ref={modalRef}
          onSubmit={handleSubmit}
        >
          <div className='px-4 py-4 sm:py-6 flex justify-between items-center gap-4 bg-neutral-200'>
            <h1 className='text-xl sm:text-2xl font-bold'>Add Category</h1>
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
                  placeholder='Enter Category name...'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='title'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Title
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <input
                  id='title'
                  name='title'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  type='text'
                  placeholder='Enter Category title...'
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
            </div>
            <div className='grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6'>
              <label
                htmlFor='content'
                className='block text-sm col-span-4 sm:col-span-2 font-medium'
              >
                Content
              </label>
              <div className='col-span-8 sm:col-span-4'>
                <input
                  id='content'
                  name='content'
                  className='block w-full h-12 border px-3 py-1 text-sm leading-5 rounded-md bg-gray-100 focus:border-gray-200 border-gray-200'
                  type='text'
                  placeholder='Enter Category content...'
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                />
              </div>
            </div>
            <div className='mt-auto flex justify-end items-stretch gap-4 font-bold'>
              <button
                type='button'
                className='border border-neutral-700 rounded px-4 py-2 hover:border-red-300 hover:text-red-400 transition-colors'
                onClick={closeModal}
                disabled={isLoadingPostCategory}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='bg-neutral-700 text-white rounded px-4 py-2 hover:bg-violet-500 transition-colors'
                disabled={isLoadingPostCategory}
              >
                Add Category
              </button>
            </div>
          </div>
        </form>
      </section>
    </Modal>
  );
}

export default AddCategoryModal;
