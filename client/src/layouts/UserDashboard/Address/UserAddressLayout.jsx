import React, { useContext, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { useGetAllAddressQuery } from '../../../services/redux/query/users';
import NotFoundItem from '../../../components/ui/NotFoundItem';
import Table from '../../../components/ui/Table';
import AddAddressModal from '../../../components/modal/users/AddAddressModal';
import { ModalContext } from '../../../context/ModalProvider';
import SingleAddress from './components/SingleAddress';
import UpdateAddressModal from '../../../components/modal/users/UpdateAddressModal';

function UserAddressLayout() {
  const { setVisibleModal } = useContext(ModalContext);
  const { data: addressData, isSuccess: isSuccessAddress } =
    useGetAllAddressQuery();
  const renderedAddress = useMemo(() => {
    return (
      isSuccessAddress &&
      addressData?.address?.map((a, index) => {
        return <SingleAddress number={index + 1} address={a} key={a._id} />;
      })
    );
  }, [isSuccessAddress, addressData]);
  return (
    <>
      <AddAddressModal />
      <UpdateAddressModal />
      <section className='lg:col-span-4 w-full flex flex-col gap-8 border py-4 sm:py-8 border-neutral-300 rounded-xl shadow-lg text-neutral-700 bg-neutral-100'>
        <div className='px-4 sm:px-8 border-l-4 border-violet-500 flex justify-between items-center gap-4'>
          <h1 className='text-xl sm:text-2xl font-bold'>Address</h1>
          <div className='w-full flex justify-end'>
            <button
              className='px-4 py-2 flex justify-center items-center gap-2 bg-neutral-700 text-white rounded hover:bg-violet-500 transition-colors'
              onClick={() => setVisibleModal('visibleAddAddressModal')}
            >
              <FaPlus />
              <span>Add Address</span>
            </button>
          </div>
        </div>
        <div className='p-4 sm:p-8'>
          {isSuccessAddress && addressData?.address?.length > 0 && (
            <Table
              tHeader={[
                'sr',
                'province',
                'district',
                'ward',
                'address',
                'phone',
                'default',
                'actions',
              ]}
              renderedData={renderedAddress}
            />
          )}
          {isSuccessAddress && addressData?.address?.length === 0 && (
            <NotFoundItem message='No Address Yet!' />
          )}
        </div>
      </section>
    </>
  );
}

export default UserAddressLayout;
