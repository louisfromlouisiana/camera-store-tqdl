import React, {
  Suspense,
  lazy,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetOderDetailsQuery,
  useUpdateOrderByUserMutation,
} from '../../../../services/redux/query/users';
import NotFoundLayout from '../../../NotFoundLayout/NotFoundLayout';
import { FetchDataContext } from '../../../../context/FetchDataProvider';
import {
  formatDate,
  formatNumberWithDot,
  formatTime,
} from '../../../../services/utils/format';
import Table from '../../../../components/ui/Table';
import { ModalContext } from '../../../../context/ModalProvider';
import { FaRegTrashCan, FaArrowLeftLong, FaPrint } from 'react-icons/fa6';
import Invoice from './components/Invoice';
const ReviewsModal = lazy(() =>
  import('../../../../components/modal/users/ReviewsModal')
);

function UserOrderDetailsLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { statusOrders } = useContext(FetchDataContext);
  const { setVisibleModal } = useContext(ModalContext);
  const [previewPrint, setPreviewPrint] = useState(false);
  const {
    data: ordersData,
    isSuccess: isSuccessOrder,
    isError: isErrorOrder,
  } = useGetOderDetailsQuery(id, {
    pollingInterval: import.meta.env.VITE_DEFAULT_POLLING_ORDER,
    refetchOnFocus: true,
  });
  const [
    updateOrder,
    {
      data: dataUpdate,
      isLoading: isLoadingUpdate,
      isSuccess: isSuccessUpdate,
      isError: isErrorUpdate,
      error: errorUpdate,
    },
  ] = useUpdateOrderByUserMutation();
  const curStatus = useMemo(() => {
    return (
      isSuccessOrder &&
      statusOrders.find(
        (s) => s.name === ordersData?.order?.paymentInfo?.status
      )
    );
  }, [isSuccessOrder, ordersData, statusOrders]);
  if (isErrorOrder) return <NotFoundLayout />;

  useEffect(() => {
    if (isSuccessUpdate && dataUpdate) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: dataUpdate?.message,
        },
      });
    }
    if (isErrorUpdate && errorUpdate) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorUpdate?.data?.message,
        },
      });
    }
  }, [isSuccessUpdate, dataUpdate, isErrorUpdate, errorUpdate]);
  return (
    <>
      <Suspense>
        <ReviewsModal />
      </Suspense>
      {previewPrint && isSuccessOrder && (
        <Invoice
          closeForm={() => setPreviewPrint(false)}
          order={ordersData?.order}
        />
      )}
      <section className='lg:col-span-4 w-full flex flex-col gap-8 border py-4 sm:py-8 border-neutral-300 rounded-xl shadow-lg bg-neutral-100'>
        <button
          className='mx-4 sm:mx-8 w-max flex items-center gap-2 rounded bg-neutral-700 text-white px-4 py-1'
          onClick={() => navigate('/dashboard/users/orders')}
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
                  'actions',
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
                      <td>
                        {ordersData?.order?.paymentInfo?.status ===
                          'received' &&
                          ordersData?.order?.isPaid &&
                          !p?.isReviews && (
                            <button
                              className='w-full flex justify-center items-center text-violet-500'
                              onClick={() =>
                                setVisibleModal({
                                  visibleReviewsModal: {
                                    ...p,
                                    orderCode:
                                      ordersData?.order?.paymentInfo?.orderCode,
                                  },
                                })
                              }
                            >
                              Reviews
                            </button>
                          )}
                        {ordersData?.order?.paymentInfo?.status ===
                          'received' &&
                          ordersData?.order?.isPaid &&
                          p?.isReviews && (
                            <button
                              className='w-full flex justify-center items-center text-violet-500'
                              onClick={() => navigate(`/shop/${p.product._id}`)}
                            >
                              View Reviews
                            </button>
                          )}
                        {ordersData?.order?.paymentInfo?.status !==
                          'received' && (
                          <p className='flex justify-center items-center'>-</p>
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
            <div className='flex justify-end gap-4'>
              {!ordersData?.order?.isProcessing &&
                ordersData?.order?.paymentInfo?.status === 'pending' && (
                  <button
                    className='h-[48px] font-bold border border-neutral-300 px-6 py-1 rounded hover:bg-neutral-700 hover:text-white transition-colors'
                    onClick={() =>
                      setVisibleModal({
                        visibleConfirmModal: {
                          icon: <FaRegTrashCan className='text-red-500' />,
                          question: 'Are You Sure! Want to cancel?',
                          description: `Do you really want to cancel this order?`,
                          loading: isLoadingUpdate,
                          acceptFunc: async () =>
                            await updateOrder({
                              orderId:
                                ordersData?.order?.paymentInfo?.orderCode,
                              status: 'cancel',
                              isPaid: false,
                            }),
                        },
                      })
                    }
                  >
                    Cancel
                  </button>
                )}
              {!ordersData?.order?.isProcessing &&
                ordersData?.order?.paymentInfo?.status === 'pending' &&
                ordersData?.order?.paymentMethod === 'vnpay' &&
                !ordersData?.order?.isPaid && (
                  <button
                    className='h-[48px] font-bold bg-violet-500 text-white px-6 py-1 rounded hover:bg-neutral-700 transition-colors'
                    onClick={() =>
                      window.open(
                        ordersData?.order?.paymentInfo?.vnpUrl,
                        '_self'
                      )
                    }
                  >
                    Payment
                  </button>
                )}
              {ordersData?.order?.paymentInfo?.status === 'delivered' && (
                <button
                  className='h-[48px] font-bold border border-neutral-300 px-6 py-1 rounded bg-violet-500 hover:bg-neutral-700 text-white transition-colors'
                  onClick={() =>
                    setVisibleModal({
                      visibleConfirmModal: {
                        question: 'Are you sure you have received the goods?',
                        description: `This cannot be undone!`,
                        loading: isLoadingUpdate,
                        acceptFunc: async () =>
                          await updateOrder({
                            orderId: ordersData?.order?.paymentInfo?.orderCode,
                            status: 'received',
                            isPaid: true,
                          }),
                      },
                    })
                  }
                >
                  Received
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default UserOrderDetailsLayout;
