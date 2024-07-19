import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUser } from '../../../services/redux/slice/userSlice';
import bgDashboard from '../../../assets/dashboard-profile.6b07701c.png';
import ChangePasswordModal from '../../../components/modal/ChangePasswordModal';
import { ModalContext } from '../../../context/ModalProvider';
import { FaPen, FaCheck, FaXmark } from 'react-icons/fa6';
import { useUpdateUserMutation } from '../../../services/redux/query/users';
function DashboardLayout() {
  const { setVisibleModal } = useContext(ModalContext);
  const user = useSelector(getUser);
  const [editUsername, setEditUsername] = useState(false);
  const [username, setUsername] = useState(() => user?.name);
  const [
    updateUser,
    {
      data: updateData,
      isSuccess: isSuccessUpdate,
      isLoading: isLoadingUpdate,
      isError: isErrorUpdate,
      error: errorUpdate,
    },
  ] = useUpdateUserMutation();
  useEffect(() => {
    if (isSuccessUpdate && updateData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: updateData?.message,
        },
      });
      setEditUsername(false);
    }
    if (isErrorUpdate && errorUpdate) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorUpdate?.data?.message,
        },
      });
    }
  }, [
    isSuccessUpdate,
    updateData,
    isErrorUpdate,
    isErrorUpdate,
    setVisibleModal,
  ]);
  return (
    <>
      <ChangePasswordModal />
      <section
        className='lg:col-span-4 w-full flex flex-col gap-6 border py-4 sm:py-8 border-neutral-300 rounded-xl shadow-lg text-neutral-700 bg-neutral-100'
        aria-disabled={isLoadingUpdate}
      >
        <div className='px-4 sm:px-8 border-l-4 border-violet-500 flex justify-between items-center gap-4'>
          <h1 className='text-xl sm:text-2xl font-bold'>Dashboard</h1>
        </div>
        <div className='px-4 sm:px-8 flex flex-col gap-2 text-gray-500'>
          <h2>
            Hello, <span className='font-bold'>{user?.name}</span>
          </h2>
          <p>
            Welcome to your personalized My Account Dashboard. Here, you have
            the power to manage your entire e-commerce experience in one place.
            Whether you're exploring the latest products or updating your
            profile, everything is at your fingertips
          </p>
        </div>
        <div className='p-4 sm:p-8'>
          <div className='relative h-[330px] bg-white rounded-lg p-4 flex flex-col gap-4 overflow-hidden'>
            <h2 className='text-lg md:text-xl font-medium'>
              Profile Information
            </h2>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-4'>
                <p className='w-1/6 md:w-1/12'>Role:</p>
                <p className='md:w-11/12 font-medium capitalize'>
                  {user?.role?.name}
                </p>
              </div>
              <div className='flex items-center gap-4'>
                <p className='w-1/6 md:w-1/12'>Name:</p>
                <div className='md:w-11/12 font-medium flex items-center gap-4'>
                  {!editUsername && <p>{user?.name}</p>}
                  {editUsername && (
                    <input
                      className='border border-neutral-300 px-2 rounded py-1'
                      type='text'
                      value={username}
                      placeholder='Enter new your name...'
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  )}
                  {!editUsername && (
                    <button
                      type='button'
                      className='hover:text-violet-500 transition-colors'
                      onClick={() => setEditUsername(true)}
                    >
                      <FaPen className='text-lg' />
                    </button>
                  )}
                  {editUsername && (
                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        className='hover:text-red-500 transition-colors'
                        onClick={() => setEditUsername(false)}
                        disabled={isLoadingUpdate}
                      >
                        <FaXmark className='text-2xl' />
                      </button>
                      <button
                        type='button'
                        className='hover:text-green-500 transition-colors'
                        onClick={async () =>
                          await updateUser({
                            id: user?._id,
                            body: { name: username },
                          })
                        }
                        disabled={isLoadingUpdate}
                      >
                        <FaCheck className='text-2xl' />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <p className='w-1/6 md:w-1/12'>Email:</p>
                <p className='md:w-11/12 font-medium'>{user?.email}</p>
              </div>
              {/* <div className='flex items-center gap-4'>
              <p className='w-1/6 md:w-1/12'>Phone:</p>
              <p className='md:w-11/12 font-medium'>
                {address ? address?.phone : 'No phone number yet.'}
              </p>
            </div> */}
              {/* <div className='flex items-center gap-4'>
                <p className='w-1/6 md:w-1/12'>Address:</p>
                <p className='md:w-11/12 font-medium'>
                  {address
                    ? `${address?.address}, ${address?.ward?.name}, ${address?.district?.name}, ${address?.province?.name}`
                    : 'No address yet.'}
                </p>
              </div> */}
              <div className='flex gap-4'>
                <p className='w-1/6 md:w-1/12'>Password:</p>
                <div className='w-full md:w-11/12 flex flex-col gap-4'>
                  <p>{user?.password.replace(/./g, '*').slice(0, 12)}</p>
                  <div className='w-full flex justify-end md:justify-start'>
                    <button
                      className='text-sm bg-neutral-700 hover:bg-violet-500 transition-colors text-white px-4 py-2 rounded'
                      onClick={() =>
                        setVisibleModal('visibleChangePasswordModal')
                      }
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className='absolute top-0 right-0 w-[350px] h-[350px] hidden md:block'>
              <img
                className='object-cover'
                src={bgDashboard}
                alt='bg-dashboard-img'
                {...{ fetchPriority: 'low' }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default DashboardLayout;
