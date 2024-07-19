import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOderDetailsQuery } from '../../../../services/redux/query/users';
import { FetchDataContext } from '../../../../context/FetchDataProvider';
import {
  formatDate,
  formatNumberWithDot,
  formatTime,
} from '../../../../services/utils/format';
import Table from '../../../../components/ui/Table';
import { FaArrowLeftLong, FaPrint } from 'react-icons/fa6';
import Invoice from './components/Invoice';
function AdminOrderDetailsLayout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { statusOrders } = useContext(FetchDataContext);
  const [previewPrint, setPreviewPrint] = useState(false);
  const {
    data: ordersData,
    isSuccess: isSuccessOrder,
    isError: isErrorOrder,
  } = useGetOderDetailsQuery(id, {
    pollingInterval: import.meta.env.VITE_DEFAULT_POLLING_ORDER,
    refetchOnFocus: true,
  });
  const curStatus = useMemo(() => {
    return (
      isSuccessOrder &&
      statusOrders.find(
        (s) => s.name === ordersData?.order?.paymentInfo?.status
      )
    );
  }, [isSuccessOrder, ordersData, statusOrders]);
  useEffect(() => {
    if (isErrorOrder) {
      navigate('/not-found');
    }
  }, [isErrorOrder]);
  return (
    <>
      {previewPrint && isSuccessOrder && (
        <Invoice
          closeForm={() => setPreviewPrint(false)}
          order={ordersData?.order}
        />
      )}
      <section className='lg:col-span-4 w-full flex flex-col gap-8 border py-4 sm:py-8 border-neutral-300 rounded-xl shadow-lg bg-neutral-100'>
        <button
          className='mx-4 sm:mx-8 w-max flex items-center gap-2 rounded bg-neutral-700 text-white px-4 py-1'
          onClick={() => navigate('/dashboard/admin/orders')}
        >
          <FaArrowLeftLong className='text-xl' />
          <p className='text-lg font-bold'>Back</p>
        </button>
        <div className='px-4 sm:px-8 border-l-4 border-violet-500 flex justify-between items-center gap-4'>
          <h1 className='text-xl sm:text-2xl font-bold'>Orders Details</h1>
          <button
            className='px-4 py-2 flex items-center gap-2 bg-neutral-800 text-white rounded'
            onClick={() => setPreviewPrint(true)}
          >
            <FaPrint />
            <p>Print invoice</p>
          </button>
        </div>
        {isSuccessOrder && (
          <div className='px-4 md:px-8 flex flex-col gap-6'>
            <div className='pb-4 border-b-2 border-neutral-300'>
              <div className='flex items-center gap-6'>
                <h1 className='md:text-xl font-bold'>Status</h1>
                <p
                  style={{
                    color: `${curStatus.color}`,
                    backgroundColor: `${curStatus.backgroundColor}`,
                  }}
                  className='capitalize w-max px-4 rounded-3xl text-sm font-bold'
                >
                  {curStatus?.name}
                </p>
              </div>
            </div>
            <div className='grid grid-cols-1 place-items-end lg:place-items-start lg:grid-cols-4 gap-6'>
              <div className='col-span-1 flex flex-col items-end lg:items-start gap-2'>
                <p className='font-bold'>Order Time</p>
                <p className='text-sm'>
                  {formatDate(ordersData?.order?.created_at)}
                </p>
              </div>
              <div className='col-span-1 flex flex-col items-end lg:items-start gap-2'>
                <p className='font-bold'>Order Code</p>
                <p className='text-sm'>
                  #{ordersData?.order?.paymentInfo?.orderCode}
                </p>
              </div>
              <div className='col-span-1 flex flex-col items-end lg:items-start gap-2'>
                <p className='font-bold'>Order Received</p>
                <p className='text-sm'>
                  {ordersData?.order?.received_at
                    ? formatTime(ordersData?.order?.received_at)
                    : 'N/A'}
                </p>
              </div>
              <div className='w-full col-span-1 flex flex-col gap-2 items-end'>
                <p className='font-bold'>Order To</p>
                <div className='flex flex-col items-end text-sm'>
                  <p>{ordersData?.order?.user?.name}</p>
                  <p>{ordersData?.order?.message}</p>
                  <p>{ordersData?.order?.phone}</p>
                  <p>{ordersData?.order?.address}</p>
                </div>
              </div>
            </div>
            <div>
              <Table
                tHeader={[
                  'SR',
                  'Product Name',
                  'quantity',
                  'price',
                  'sub total',
                ]}
                renderedData={ordersData?.order?.products?.map((p, index) => {
                  return (
                    <tr className='text-sm' key={p._id}>
                      <td className='p-4 text-center'>{index + 1}</td>
                      <td
                        className={`p-4 text-center ${
                          !p?.product ? 'text-red-500 font-bold' : ''
                        }`}
                      >
                        {p?.product?.name
                          ? p?.product?.name
                          : 'Product deleted'}
                      </td>
                      <td className='p-4 text-center'>{p?.quantity}</td>
                      <td className='p-4 text-center'>
                        {formatNumberWithDot(p?.product?.price || 0)}
                      </td>
                      <td className='p-4 text-center'>
                        {formatNumberWithDot(
                          p?.quantity * p?.product?.price || 0
                        )}
                      </td>
                    </tr>
                  );
                })}
              />
            </div>
            <div className='w-full border border-neutral-300 rounded-md p-4 md:p-8 grid gird-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 place-items-end lg:place-items-center lg:place-content-between'>
              <div className='col-span-1 flex flex-col items-end lg:items-start gap-2'>
                <p className='font-bold'>Payment Method</p>
                <p className='font-medium uppercase'>
                  {ordersData?.order?.paymentMethod}
                </p>
              </div>
              <div className='col-span-1 flex flex-col items-end lg:items-start gap-2'>
                <p className='font-bold'>Shipping cost</p>
                <p className='font-medium'>
                  {formatNumberWithDot(
                    ordersData?.order?.rateFromProvince || 0
                  )}
                </p>
              </div>
              <div className='col-span-1 flex flex-col items-end lg:items-start gap-2'>
                <p className='font-bold'>Discount</p>
                <p className='font-medium'>
                  {formatNumberWithDot(ordersData?.order?.discount || 0)}
                </p>
              </div>
              <div className='col-span-1 flex flex-col items-end lg:items-start gap-2'>
                <p className='font-bold'>Total Price</p>
                <p className='font-bold  text-xl md:text-2xl text-violet-500'>
                  {formatNumberWithDot(ordersData?.order?.totalPrice || 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default AdminOrderDetailsLayout;
