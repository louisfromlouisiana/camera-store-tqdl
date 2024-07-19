import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import NotFoundItem from '../../../components/ui/NotFoundItem';
import { useGetListUsersQuery } from '../../../services/redux/query/users';
import SingleUser from './components/SingleUser';
function ListUsersLayout() {
  const [searchParams] = useSearchParams();
  const { data: usersData, isSuccess: isSuccessUser } = useGetListUsersQuery(
    `page=${searchParams.get('page') || 1}`,
    {
      pollingInterval: import.meta.env.VITE_DEFAULT_POLLING_ORDER,
      refetchOnFocus: true,
    }
  );
  const renderedUsers = useMemo(() => {
    return (
      isSuccessUser &&
      usersData?.users?.map((u) => {
        return <SingleUser user={u} key={u._id} />;
      })
    );
  }, [isSuccessUser && usersData]);
  return (
    <section className='col-span-1 lg:col-span-4 w-full flex flex-col gap-6 border border-neutral-300 p-4 sm:p-8 rounded-xl shadow-lg'>
      <div className='flex justify-between items-center gap-4'>
        <h1 className='text-xl sm:text-2xl font-bold'>List Users</h1>
      </div>
      <div className='w-full h-full flex flex-col gap-8'>
        {isSuccessUser && usersData?.users?.length > 0 && (
          <Table
            tHeader={[
              'id',
              'name',
              'email',
              'image',
              'created at',
              'updated at',
              'status',
              'actions',
            ]}
            renderedData={renderedUsers}
            totalPage={usersData?.totalPage}
            currPage={searchParams.get('page') || 1}
          />
        )}
        {isSuccessUser && usersData?.users?.length === 0 && (
          <NotFoundItem message='No User Yet!' />
        )}
      </div>
    </section>
  );
}

export default ListUsersLayout;
