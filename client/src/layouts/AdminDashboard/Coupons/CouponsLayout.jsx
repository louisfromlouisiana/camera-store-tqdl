import React, { useContext, useEffect, useMemo, useState } from 'react';
import Table from '../../../components/ui/Table';
import NotFoundItem from '../../../components/ui/NotFoundItem';
import { useSearchParams } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa6';
import {
  formatNumberWithDot,
  formatTime,
} from '../../../services/utils/format';
import { ModalContext } from '../../../context/ModalProvider';
import useQueryString from '../../../hooks/useQueryString';
import {
  useDeleteCouponMutation,
  useGetCouponsQuery,
} from '../../../services/redux/query/products';
import { FaRegTrashCan } from 'react-icons/fa6';
import AddCouponModal from '../../../components/modal/dashboard/AddCouponModal';
import useEnterKey from '../../../hooks/useEnterKey';
function CouponsLayout() {
  const { setVisibleModal } = useContext(ModalContext);
  const [createQueryString, deleteQueryString] = useQueryString();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || ''
  );
  const { data: couponsData, isSuccess: isSuccessCoupons } = useGetCouponsQuery(
    `page=${searchParams.get('page') || 1}&search=${searchParams.get('search')}`
  );
  const handleSearch = () => {
    if (searchValue === '') {
      deleteQueryString();
    } else {
      createQueryString('search', searchValue);
    }
  };
  const { inputRef, handleKeyDown } = useEnterKey(handleSearch);

  const [
    deleteCoupon,
    {
      data: deleteData,
      isSuccess: isSuccessDelete,
      isLoading: isLoadingDelete,
      isError: isErrorDelete,
      error: errorDelete,
    },
  ] = useDeleteCouponMutation();
  const renderedCoupons = useMemo(() => {
    return (
      isSuccessCoupons &&
      couponsData?.coupons?.map((c) => {
        return (
          <tr key={c._id}>
            <td className='p-4 text-center'>{c.id}</td>
            <td className='p-4 text-center'>{c.name}</td>
            <td className='p-4'>
              <div className='m-auto size-[42px]'>
                <img
                  className='w-full h-full object-cover'
                  src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${c?.image?.url}`}
                  alt={c?.image?.name}
                  {...{ fetchPriority: 'low' }}
                />
              </div>
            </td>
            <td className='p-4 text-center capitalize'>{c.category?.name}</td>
            <td className='p-4 text-center'>{c.discount}%</td>
            <td className='p-4 text-center'>
              {formatNumberWithDot(c.minPrice)}
            </td>
            <td className='p-4 text-center'>
              {formatNumberWithDot(c.maxDiscount)}
            </td>
            <td className='p-4 text-center'>{formatTime(c.start_date)}</td>
            <td className='p-4 text-center'>{formatTime(c.end_date)}</td>
            <td className='p-4'>
              <p
                className={`px-2 text-sm text-center ${
                  c?.status === 'In Progress'
                    ? 'bg-green-50 text-green-500 border border-green-500 rounded-2xl'
                    : 'bg-red-50 text-red-500 border border-red-500 rounded-2xl'
                }`}
              >
                {c?.status}
              </p>
            </td>
            <td className='p-4 text-center'>
              <button
                className='hover:text-red-500 transition-colors'
                aria-label='delete-btn'
                onClick={() =>
                  setVisibleModal({
                    visibleConfirmModal: {
                      icon: <FaRegTrashCan className='text-red-500' />,
                      question: `Are you sure you want to delete this coupon?`,
                      description:
                        'This cannot be undone!',
                      loading: isLoadingDelete,
                      acceptFunc: () => deleteCoupon(c.id),
                    },
                  })
                }
              >
                <FaRegTrashCan />
              </button>
            </td>
          </tr>
        );
      })
    );
  }, [isSuccessCoupons, couponsData, setVisibleModal]);
  useEffect(() => {
    if (isSuccessDelete && deleteData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: deleteData?.message,
        },
      });
    }
    if (errorDelete && isErrorDelete) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorDelete?.data?.message,
        },
      });
    }
  }, [
    isSuccessDelete,
    deleteData,
    isErrorDelete,
    errorDelete,
    setVisibleModal,
  ]);
  return (
    <>
      <AddCouponModal />
      <section
        className='col-span-1 lg:col-span-4 w-full flex flex-col gap-6 border border-neutral-300 p-4 sm:p-8 rounded-xl shadow-lg'
        aria-disabled={isLoadingDelete}
      >
        <div className='flex flex-col justify-between gap-6'>
          <div className='flex justify-between items-center gap-4'>
            <h1 className='text-xl sm:text-2xl font-bold'>Coupons</h1>
            <button
              className='px-4 py-2 font-bold bg-neutral-700 hover:bg-violet-500 transition-colors text-white rounded flex items-center gap-2'
              onClick={() => setVisibleModal('visibleAddCouponModal')}
            >
              <FaPlus className='text-lg' />
              <p>Add Coupon</p>
            </button>
          </div>
          <div className='flex flex-col md:flex-row items-stretch gap-4'>
            <input
              ref={inputRef}
              className='border border-neutral-300 px-4 py-2 rounded'
              type='text'
              placeholder='Enter campaign name...'
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
          {isSuccessCoupons && couponsData?.coupons?.length > 0 && (
            <Table
              tHeader={[
                'id',
                'name',
                'image',
                'category',
                'discount',
                'min price',
                'max discount',
                'start date',
                'end date',
                'status',
                'actions',
              ]}
              renderedData={renderedCoupons}
              totalPage={couponsData?.totalPage}
              currPage={searchParams.get('page') || 1}
            />
          )}
          {isSuccessCoupons && couponsData?.coupons?.length === 0 && (
            <NotFoundItem message='No Coupon Yet!' />
          )}
        </div>
      </section>
    </>
  );
}

export default CouponsLayout;
