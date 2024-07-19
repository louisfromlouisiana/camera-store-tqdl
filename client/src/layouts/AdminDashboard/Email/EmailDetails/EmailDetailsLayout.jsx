import React, { useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeftLong, FaReply } from 'react-icons/fa6';
import { useGetUserEmailDetailsQuery } from '../../../../services/redux/query/users';
import { formatDate } from '../../../../services/utils/format';
import ReplyModal from '../../../../components/modal/dashboard/ReplyModal';
import Loading from '../../../../components/ui/Loading';
import { ModalContext } from '../../../../context/ModalProvider';
function EmailDetailsLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setVisibleModal } = useContext(ModalContext);
  const {
    data: emailData,
    isSuccess: isSuccessEmail,
    isLoading: isLoadingEmail,
    isError: isErrorEmail,
  } = useGetUserEmailDetailsQuery(id);
  useEffect(() => {
    if (isErrorEmail) {
      navigate('/not-found');
    }
  }, [isErrorEmail]);
  if (isLoadingEmail) return <Loading />;
  return (
    <>
      <ReplyModal />
      <section className='lg:col-span-4 w-full flex flex-col gap-8 border py-4 sm:py-8 border-neutral-300 rounded-xl shadow-lg bg-neutral-100'>
        <button
          className='mx-4 sm:mx-8 w-max flex items-center gap-2 rounded bg-neutral-700 text-white px-4 py-1'
          onClick={() => navigate('/dashboard/admin/email')}
        >
          <FaArrowLeftLong className='text-xl' />
          <p className='text-lg font-bold'>Back</p>
        </button>
        <div className='px-4 sm:px-8 border-l-4 border-violet-500 flex justify-between items-center gap-4'>
          <h1 className='text-xl sm:text-2xl font-bold'>Email Details</h1>
        </div>
        {isSuccessEmail && (
          <div className='h-full px-4 md:px-8 flex flex-col gap-6'>
            <div className='pb-4 border-b-2 border-neutral-300'>
              <div className='flex items-center gap-6'>
                <h1 className='md:text-xl font-bold'>Status</h1>
                <p
                  className={`rounded-2xl px-2 text-sm font-bold ${
                    emailData?.user?.isReply
                      ? 'bg-green-50 text-green-500 border border-green-500'
                      : 'bg-red-50 text-red-500 border border-red-500'
                  }`}
                >
                  {emailData?.user?.isReply ? 'Responded' : 'No response'}
                </p>
              </div>
            </div>
            <div className='h-full flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <p className='font-bold'>User</p>
                <p className='font-medium'>{emailData?.user?.email}</p>
              </div>
              <div className='flex flex-col gap-2'>
                <p className='font-bold'>Send Time</p>
                <p className='text-sm italic'>
                  {formatDate(emailData?.user?.created_at)}
                </p>
              </div>
              <div className='flex flex-col gap-2 overflow-hidden'>
                <p className='font-bold'>Message</p>
                <p style={{ wordWrap: 'break-word' }}>
                  {emailData?.user?.message}
                </p>
              </div>
              {!emailData?.user?.isReply && (
                <div className='mt-auto flex items-end'>
                  <button
                    className='ml-auto w-max flex items-center gap-2 bg-violet-500 hover:bg-neutral-700 text-white transition-colors px-4 py-2 rounded'
                    onClick={() =>
                      setVisibleModal({
                        visibleReplyModal: {
                          email: emailData?.user?.email,
                          id: emailData?.user?._id,
                        },
                      })
                    }
                  >
                    <FaReply />
                    <p>Response</p>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default EmailDetailsLayout;
