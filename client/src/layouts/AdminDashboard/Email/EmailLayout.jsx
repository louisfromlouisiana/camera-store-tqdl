import React, { useMemo, useState } from 'react';
import Table from '../../../components/ui/Table';
import NotFoundItem from '../../../components/ui/NotFoundItem';
import { useGetUserEmailsQuery } from '../../../services/redux/query/users';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate } from '../../../services/utils/format';
import ReplyModal from '../../../components/modal/dashboard/ReplyModal';
import useQueryString from '../../../hooks/useQueryString';
import useEnterKey from '../../../hooks/useEnterKey';
import { FaRegEye } from 'react-icons/fa6';
function EmailLayout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [createQueryString, deleteQueryString] = useQueryString();
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || ''
  );
  const { data: usersData, isSuccess: isSuccessUsers } = useGetUserEmailsQuery(
    `page=${searchParams.get('page') || 1}&search=${searchParams.get(
      'search'
    )}`,
    {
      pollingInterval: Number(import.meta.env.VITE_DEFAULT_POLLING),
      refetchOnFocus: true,
    }
  );
  const handleSearch = () => {
    if (searchValue === '') {
      deleteQueryString();
    } else {
      createQueryString('search', searchValue);
    }
  };
  const { inputRef, handleKeyDown } = useEnterKey(handleSearch);

  const renderedUsers = useMemo(() => {
    return (
      isSuccessUsers &&
      usersData?.users?.map((u) => {
        return (
          <tr key={u?._id}>
            <td
              title={u?.email}
              className='p-4 text-center truncate max-w-[120px]'
            >
              {u.email}
            </td>
            <td className='p-4 text-center truncate max-w-[180px]'>
              {u?.message}
            </td>
            <td className='p-4 text-center'>{formatDate(u?.created_at)}</td>
            <td className='p-4 text-center'>
              <p
                className={`m-auto w-max rounded-2xl px-2 text-sm font-bold ${
                  u?.isReply
                    ? 'bg-green-50 text-green-500 border border-green-500'
                    : 'bg-red-50 text-red-500 border border-red-500'
                }`}
              >
                {u?.isReply ? 'Responded' : 'No response yet'}
              </p>
            </td>
            <td className='p-4 text-center'>
              <button
                className='m-auto hover:text-green-500 transition-colors'
                aria-label='view-email'
                onClick={() => navigate(`/dashboard/admin/email/${u._id}`)}
              >
                <FaRegEye className='text-xl' />
              </button>
              {/* {!u?.isReply ? (
                <button
                  className='m-auto hover:text-green-500 transition-colors'
                  aria-label='reply-btn'
                  onClick={() =>
                    setVisibleModal({
                      visibleReplyModal: {
                        email: u?.email,
                        id: u?._id,
                      },
                    })
                  }
                >
                  <FaReply className='text-xl' />
                </button>
              ) : (
                '-'
              )} */}
            </td>
          </tr>
        );
      })
    );
  }, [isSuccessUsers, usersData]);
  return (
    <>
      <ReplyModal />
      <section className='col-span-1 lg:col-span-4 w-full flex flex-col gap-6 border border-neutral-300 p-4 sm:p-8 rounded-xl shadow-lg'>
        <div className='flex flex-col justify-between gap-6'>
          <div className='flex justify-between items-center gap-4'>
            <h1 className='text-xl sm:text-2xl font-bold'>Email</h1>
          </div>
          <div className='flex flex-col md:flex-row items-stretch gap-4'>
            <input
              ref={inputRef}
              className='border border-neutral-300 px-4 py-2 rounded'
              type='text'
              placeholder='Enter email...'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className='w-full md:w-auto flex items-stretch gap-4'>
              <button
                className='w-full px-8 py-2 bg-neutral-700 font-bold text-white rounded'
                onClick={deleteQueryString}
              >
                Reset
              </button>
              <button
                className='w-full px-8 py-2 bg-violet-500 font-bold text-white rounded'
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>
        </div>
        <div className='w-full h-full flex flex-col gap-8'>
          {isSuccessUsers && usersData?.users?.length > 0 && (
            <Table
              tHeader={['user', 'message', 'created at', 'reply', 'actions']}
              renderedData={renderedUsers}
              currPage={searchParams.get('page') || 1}
              totalPage={usersData?.totalPage}
            />
          )}
          {isSuccessUsers && usersData?.users?.length === 0 && (
            <NotFoundItem message='No User Yet!' />
          )}
        </div>
      </section>
    </>
  );
}

export default EmailLayout;
