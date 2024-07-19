import Modal from '@/Modal.jsx';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ModalContext } from '../../context/ModalProvider';
import useClickOutside from '../../hooks/useClickOutside';
import { useChangePasswordMutation } from '../../services/redux/query/users';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
function ChangePasswordModal() {
  const { state, setVisibleModal } = useContext(ModalContext);
  const [modalRef, clickOutside] = useClickOutside();
  const [curTypeOldPwd, setCurTypeOldPwd] = useState('password');
  const [curTypeNewPwd, setCurTypeNewPwd] = useState('password');
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [
    changePassword,
    {
      data: postData,
      isLoading: isLoadingPost,
      isSuccess: isSuccessPost,
      isError: isErrorPost,
      error: errorPost,
    },
  ] = useChangePasswordMutation();
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await changePassword({ ...form });
    },
    [changePassword, form]
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
    setForm({ oldPassword: '', newPassword: '' });
  }, [isSuccessPost, postData, errorPost, isErrorPost, setVisibleModal]);
  return (
    <Modal>
      <section
        className={`fixed top-0 left-0 z-50 ${
          state.visibleChangePasswordModal
            ? 'w-full h-full px-4 py-8'
            : 'w-0 h-0'
        } flex justify-center items-center overflow-hidden`}
        style={{ backgroundColor: 'rgba(51,51,51,0.8)' }}
        onClick={clickOutside}
      >
        <div
          className='w-full sm:w-2/3 lg:w-1/3 container m-auto bg-white rounded overflow-hidden py-4 px-6 flex flex-col gap-8'
          ref={modalRef}
          aria-disabled={isLoadingPost}
        >
          <h1 className='font-bold text-lg md:text-xl'>Change Password</h1>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <label className='font-medium' htmlFor='oldPassword'>
                Old Password
              </label>
              <div className='w-full h-full relative'>
                <input
                  className='w-full border border-neutral-300 rounded px-2 py-2'
                  type={curTypeOldPwd}
                  placeholder='Enter your old password...'
                  value={form.oldPassword}
                  onChange={(e) =>
                    setForm({ ...form, oldPassword: e.target.value })
                  }
                />
                {curTypeOldPwd === 'text' && (
                  <button
                    type='button'
                    className='absolute top-1/2 -translate-y-1/2 right-2'
                    aria-label='hidden-btn'
                    onClick={() => setCurTypeOldPwd('password')}
                  >
                    <FaRegEye className='text-xl' />
                  </button>
                )}
                {curTypeOldPwd === 'password' && (
                  <button
                    type='button'
                    className='absolute top-1/2 -translate-y-1/2 right-2'
                    aria-label='hidden-btn'
                    onClick={() => setCurTypeOldPwd('text')}
                  >
                    <FaRegEyeSlash className='text-xl' />
                  </button>
                )}
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <label className='font-medium' htmlFor='newPassword'>
                New Password
              </label>
              <div className='relative w-full'>
                <input
                  className='w-full border border-neutral-300 rounded px-2 py-2'
                  type={curTypeNewPwd}
                  placeholder='Enter your new password...'
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                />
                {curTypeNewPwd === 'text' && (
                  <button
                    type='button'
                    className='absolute top-1/2 -translate-y-1/2 right-2'
                    aria-label='hidden-btn'
                    onClick={() => setCurTypeNewPwd('password')}
                  >
                    <FaRegEye className='text-xl' />
                  </button>
                )}
                {curTypeNewPwd === 'password' && (
                  <button
                    type='button'
                    className='absolute top-1/2 -translate-y-1/2 right-2'
                    aria-label='hidden-btn'
                    onClick={() => setCurTypeNewPwd('text')}
                  >
                    <FaRegEyeSlash className='text-xl' />
                  </button>
                )}
              </div>
            </div>
            <div className='my-4 grid grid-cols-2 gap-4'>
              <button
                type='button'
                className='py-2 border border-neutral-300 rounded font-medium'
                onClick={() => setVisibleModal('visibleChangePasswordModal')}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='bg-neutral-700 text-white rounded'
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      </section>
    </Modal>
  );
}

export default ChangePasswordModal;
