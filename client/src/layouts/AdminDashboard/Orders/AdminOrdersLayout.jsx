import React, { useContext, useMemo } from 'react';
import { FetchDataContext } from '../../../context/FetchDataProvider';
import { useGetOrdersByAdminQuery } from '../../../services/redux/query/users';
import { useSearchParams } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import NotFoundItem from '../../../components/ui/NotFoundItem';
import SingleOrder from './components/SingleOrder';
import useQueryString from '../../../hooks/useQueryString';

function AdminOrdersLayout() {
  const { statusOrders } = useContext(FetchDataContext);
  const [createQueryString, deleteQueryString] = useQueryString();
  const [searchParams] = useSearchParams();
  const { data: ordersData, isSuccess: isSuccessOrders } =
    useGetOrdersByAdminQuery(
      `page=${searchParams.get('page') || 1}&status=${searchParams.get(
        'status'
      )}`,
      {
        pollingInterval: import.meta.env.VITE_DEFAULT_POLLING_ORDER,
        refetchOnFocus: true,
      }
    );
  const renderedOrders = useMemo(() => {
    return (
      isSuccessOrders &&
      ordersData?.orders?.map((o) => {
        return <SingleOrder key={o._id} order={o} />;
      })
    );
  }, [isSuccessOrders, ordersData]);
  return (
    <section className='lg:col-span-4 w-full flex flex-col gap-8 border py-4 sm:py-8 border-neutral-300 rounded-xl shadow-lg bg-neutral-100'>
      <div className='px-4 sm:px-8 border-l-4 border-violet-500 flex justify-between items-center gap-4'>
        <h1 className='text-xl sm:text-2xl font-bold'>Orders</h1>
        <select
          className='px-4 py-2 focus:outline-none border border-neutral-300 capitalize cursor-pointer'
          name='status'
          id='status'
          onChange={(e) => {
            if (e.target.value === 'reset') {
              deleteQueryString();
            } else {
              createQueryString('status', e.target.value);
            }
          }}
        >
          <option value='reset'>All</option>
          {statusOrders?.map((s) => {
            return <option value={s.name}>{s.name}</option>;
          })}
        </select>
      </div>
      <div className='p-4 sm:p-8'>
        <div className='relative bg-white rounded-lg p-4 flex flex-col gap-4 overflow-hidden'>
          {isSuccessOrders && ordersData?.orders?.length > 0 && (
            <Table
              tHeader={[
                'code',
                'user',
                'updated_at',
                'payment method',
                'status',
                'paid',
                'processing',
                'total price',
                'actions',
              ]}
              renderedData={renderedOrders}
              totalPage={ordersData?.totalPage}
              currPage={searchParams.get('page') || 1}
            />
          )}
          {isSuccessOrders && ordersData?.orders?.length === 0 && (
            <NotFoundItem message='No Order Yet!' />
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminOrdersLayout;
