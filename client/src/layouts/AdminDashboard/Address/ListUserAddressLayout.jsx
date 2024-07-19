import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import NotFoundItem from '../../../components/ui/NotFoundItem';
import { useGetListUserAddressQuery } from '../../../services/redux/query/users';
import SingleAddress from './components/SingleAddress';
function ListUserAddressLayout() {
  const [searchParams] = useSearchParams();
  const { data: usersAddressData, isSuccess: isSuccessUserAddress } =
    useGetListUserAddressQuery(`page=${searchParams.get('page') || 1}`, {
      pollingInterval: import.meta.env.VITE_DEFAULT_POLLING_ORDER,
      refetchOnFocus: true,
    });
  const renderedUsersAddress = useMemo(() => {
    return (
      isSuccessUserAddress &&
      usersAddressData?.address?.map((a) => {
        return <SingleAddress address={a} key={a._id} />;
      })
    );
  }, [isSuccessUserAddress && usersAddressData]);
  return (
    <section className='col-span-1 lg:col-span-4 w-full flex flex-col gap-6 border border-neutral-300 p-4 sm:p-8 rounded-xl shadow-lg'>
      <div className='flex justify-between items-center gap-4'>
        <h1 className='text-xl sm:text-2xl font-bold'>List Address Users</h1>
      </div>
      <div className='w-full h-full flex flex-col gap-8'>
        {isSuccessUserAddress && usersAddressData?.address?.length > 0 && (
          <Table
            tHeader={[
              'user',
              'province',
              'district',
              'ward',
              'address',
              'default',
              'actions',
            ]}
            renderedData={renderedUsersAddress}
            totalPage={usersAddressData?.totalPage}
            currPage={searchParams.get('page') || 1}
          />
        )}
        {isSuccessUserAddress && usersAddressData?.users?.length === 0 && (
          <NotFoundItem message='No User Address Yet!' />
        )}
      </div>
    </section>
  );
}

export default ListUserAddressLayout;
