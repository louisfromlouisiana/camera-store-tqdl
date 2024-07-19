import React, { useContext, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { ModalContext } from '../../../context/ModalProvider';
import AddVoucherModal from '../../../components/modal/dashboard/AddVoucherModal';
import { useGetVouchersQuery } from '../../../services/redux/query/products';
import Table from '../../../components/ui/Table';
import NotFoundItem from '../../../components/ui/NotFoundItem';
import SingleVoucher from './components/SingleVoucher';
import UpdateVoucherModal from '../../../components/modal/dashboard/UpdateVoucherModal';
import { useSearchParams } from 'react-router-dom';
import useQueryString from '../../../hooks/useQueryString';
import useEnterKey from '../../../hooks/useEnterKey';
function VoucherLayout() {
  const [searchParams] = useSearchParams();
  const [createQueryString, deleteQueryString] = useQueryString();
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || ''
  );
  const { setVisibleModal } = useContext(ModalContext);
  const { data: vouchersData, isSuccess: isSuccessVouchers } =
    useGetVouchersQuery(
      `page=${searchParams.get('page') || 1}&search=${searchParams.get(
        'search'
      )}`
    );
  const handleSearch = () => {
    if (searchValue === '') {
      deleteQueryString();
    } else {
      createQueryString('search', searchValue);
    }
  };
  const { inputRef, handleKeyDown } = useEnterKey(handleSearch);

  const renderedVouchers = useMemo(() => {
    return (
      isSuccessVouchers &&
      vouchersData?.vouchers?.map((v) => {
        return <SingleVoucher voucher={v} key={v._id} />;
      })
    );
  }, [isSuccessVouchers, vouchersData]);
  return (
    <>
      <AddVoucherModal />
      <UpdateVoucherModal />
      <section className='col-span-1 lg:col-span-4 w-full flex flex-col gap-6 border border-neutral-300 p-4 sm:p-8 rounded-xl shadow-lg'>
        <div className='flex justify-between items-center gap-4'>
          <h1 className='text-xl sm:text-2xl font-bold'>Vouchers</h1>
          <button
            className='px-4 py-2 font-bold bg-neutral-700 hover:bg-violet-500 transition-colors text-white rounded flex items-center gap-2'
            onClick={() => setVisibleModal('visibleAddVoucherModal')}
          >
            <FaPlus className='text-lg' />
            <p>Add Voucher</p>
          </button>
        </div>
        <div className='flex flex-col md:flex-row items-stretch gap-4'>
          <input
            ref={inputRef}
            className='border border-neutral-300 px-4 py-2 rounded'
            type='text'
            placeholder='Enter SKU voucher...'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className='w-full md:w-auto flex items-stretch gap-4'>
            <button
              className='w-full px-8 py-2 bg-neutral-700 font-bold text-white rounded'
              onClick={() => {
                setSearchValue('');
                deleteQueryString();
              }}
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
        <div className='w-full h-full flex flex-col gap-8'>
          {isSuccessVouchers && vouchersData?.vouchers?.length > 0 && (
            <Table
              tHeader={[
                'SKU',
                'description',
                'discount',
                'max discount',
                'min price',
                'quantity',
                'enabled',
                'created at',
                'actions',
              ]}
              renderedData={renderedVouchers}
              totalPage={vouchersData?.totalPage}
              currPage={searchParams.get('page') || 1}
            />
          )}
          {isSuccessVouchers && vouchersData?.vouchers?.length === 0 && (
            <NotFoundItem message='No Voucher Yet!' />
          )}
        </div>
      </section>
    </>
  );
}

export default VoucherLayout;
