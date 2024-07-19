import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ModalContext } from '../../context/ModalProvider';
import bgImg from '../../assets/bg-01.jpg';
import { FaRegEnvelope } from 'react-icons/fa6';
import { usePostUserEmailMutation } from '../../services/redux/query/users';
import { validateEmail } from '../../services/utils/validate';

function ContactLayout() {
  const { setVisibleModal } = useContext(ModalContext);
  const [isFocus, setIsFocus] = useState(false);
  const [isErr, setIsErr] = useState(false);
  const [form, setForm] = useState({
    email: '',
    message: '',
  });
  const [
    postUserEmail,
    {
      data: postData,
      isLoading: isLoadingPost,
      isSuccess: isSuccessPost,
      error: errorPost,
      isError: isErrorPost,
    },
  ] = usePostUserEmailMutation();
  const handleKeyDown = async (e) => {
    if (!validateEmail(form.email) || !form.message) {
      setIsErr(true);
    } else {
      setIsErr(false);
      if (isFocus) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          await postUserEmail({ email: form.email, message: form.message });
        }
      }
    }
  };
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateEmail(form.email) || !form.message) {
        setIsErr(true);
      } else {
        setIsErr(false);
        await postUserEmail({ email: form.email, message: form.message });
      }
    },
    [isErr, form, postUserEmail]
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
    setForm({ email: '', message: '' });
    setIsErr(false);
  }, [isSuccessPost, postData, isErrorPost, errorPost, setVisibleModal]);
  return (
    <div className='flex flex-col gap-8'>
      <section className='relative h-[180px] overflow-hidden'>
        <div className='w-full h-full'>
          <img
            src={bgImg}
            alt='bg-contact-page'
            className='w-full h-full object-cover'
            {...{ fetchPriority: 'high' }}
          />
        </div>
        <h2
          className='absolute top-1/2 left-1/2 z-20 text-white text-2xl md:text-4xl font-bold'
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          Contact
        </h2>
      </section>
      <section className='px-4 md:px-0'>
        <div className='m-auto lg:w-1/2 order-2 lg:order-1 p-8 flex flex-col items-center gap-[20px] border border-neutral-300 shadow-lg'>
          <p className='text-lg md:text-xl font-medium'>Send Us A Message</p>
          <form
            className='w-full text-sm flex flex-col gap-8'
            onSubmit={handleSubmit}
          >
            <div className='relative w-full h-full'>
              <input
                name='email'
                className='w-full border border-neutral-300 px-12 py-4 rounded-[4px]'
                type='text'
                placeholder='Your Email Address'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                // required
              />
              <FaRegEnvelope className='absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-700' />
              {isErr && !validateEmail(form.email) && (
                <p className='absolute left-[1%] -bottom-[40%] text-red-500 font-bold'>
                  Invalid email!
                </p>
              )}
            </div>
            <div className='relative w-full h-full'>
              <textarea
                className='w-full p-4 border border-neutral-300 rounded-[4px] focus:outline-none'
                name='message'
                cols={30}
                rows={10}
                placeholder='How Can We Help?'
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onKeyDown={handleKeyDown}
              />
              {isErr && !form.message && (
                <p className='absolute left-[1%] -bottom-[10%] text-red-500 font-bold'>
                  Message can not be null!
                </p>
              )}
            </div>
            <button
              className='w-full bg-neutral-700 hover:bg-violet-500 text-white py-4 rounded-[24px] transition-colors font-bold'
              type='submit'
              disabled={isLoadingPost}
            >
              Submit
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ContactLayout;
