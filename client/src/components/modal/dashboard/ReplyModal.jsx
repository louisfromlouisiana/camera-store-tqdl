import React, { useCallback, useContext, useEffect, useState } from 'react';
import Modal from '@/Modal.jsx';
import { ModalContext } from '../../../context/ModalProvider';
import useClickOutside from '../../../hooks/useClickOutside';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { formats, modules } from '../../../config/quill';
import { useReplyEmailMutation } from '../../../services/redux/query/users';
function ReplyModal() {
  const { state, setVisibleModal } = useContext(ModalContext);
  const [modalRef, clickOutside] = useClickOutside();
  const [content, setContent] = useState('');
  const [
    replyEmail,
    {
      data: postData,
      isSuccess: isSuccessPost,
      isError: isErrorPost,
      error: errorPost,
      isLoading: isLoadingPost,
    },
  ] = useReplyEmailMutation();
  useEffect(() => {
    if (state.visibleReplyModal) {
      setContent('');
    }
  }, [state.visibleReplyModal]);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await replyEmail({
        email: state.visibleReplyModal?.email,
        id: state.visibleReplyModal?.id,
        content: content,
      });
    },
    [replyEmail, state.visibleReplyModal, content]
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
  }, [isSuccessPost, postData, isErrorPost, errorPost]);
  return (
    <Modal>
      <section
        className={`fixed top-0 left-0 z-50 ${
          state.visibleReplyModal ? 'w-full h-full px-4 py-8' : 'w-0 h-0'
        } flex justify-center items-center overflow-hidden`}
        style={{ backgroundColor: 'rgba(51,51,51,0.8)' }}
        onClick={clickOutside}
        aria-disabled={isLoadingPost}
      >
        <div
          className='w-full sm:w-2/3 lg:w-1/3 container m-auto bg-white rounded overflow-hidden py-8 px-6 flex flex-col gap-8'
          ref={modalRef}
          aria-disabled={isLoadingPost}
        >
          <h1 className='font-bold text-lg md:text-xl'>
            Reply {state.visibleReplyModal?.email}
          </h1>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='w-full'>
              <ReactQuill
                modules={modules}
                formats={formats}
                className='bg-white text-neutral-700 rounded '
                theme='snow'
                value={content}
                onChange={(value) => setContent(value)}
              />
            </div>
            <div className='my-4 grid grid-cols-2 gap-4'>
              <button
                type='button'
                className='py-2 border border-neutral-300 rounded font-medium'
                aria-disabled={isLoadingPost}
                onClick={() => setVisibleModal('visibleReplyModal')}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='bg-neutral-700 text-white rounded'
                aria-disabled={isLoadingPost}
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

export default ReplyModal;
