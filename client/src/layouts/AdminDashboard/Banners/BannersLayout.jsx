import React, { useContext, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { ModalContext } from '../../../context/ModalProvider';
import { useGetBannersQuery } from '../../../services/redux/query/webInfo';
import Table from '../../../components/ui/Table';
import SingleBanner from './components/SingleBanner';
import NotFoundItem from '../../../components/ui/NotFoundItem';
import AddBannerModal from '../../../components/modal/dashboard/AddBannerModal';
import UpdateBannerModal from '../../../components/modal/dashboard/UpdateBannerModal';
function BannersLayout() {
  const { setVisibleModal } = useContext(ModalContext);
  const { data: bannersData, isSuccess: isSuccessBanners } =
    useGetBannersQuery();
  const renderedBanners = useMemo(() => {
    return (
      isSuccessBanners &&
      bannersData?.banners?.map((b) => {
        return <SingleBanner key={b._id} banner={b} />;
      })
    );
  }, [isSuccessBanners, bannersData]);
  return (
    <>
      <AddBannerModal />
      <UpdateBannerModal />
      <section className='col-span-1 lg:col-span-4 w-full flex flex-col gap-6 border border-neutral-300 p-4 sm:p-8 rounded-xl shadow-lg'>
        <div className='flex justify-between items-center gap-4'>
          <h1 className='text-xl sm:text-2xl font-bold'>Banners</h1>
          <button
            className='px-4 py-2 font-bold bg-neutral-700 hover:bg-violet-500 transition-colors text-white rounded flex items-center gap-2'
            onClick={() => setVisibleModal('visibleAddBannerModal')}
          >
            <FaPlus className='text-lg' />
            <p>Add Banner</p>
          </button>
        </div>
        <div className='w-full h-full flex flex-col gap-8'>
          {isSuccessBanners && bannersData?.banners?.length > 0 && (
            <Table
              tHeader={['title', 'image', 'content', 'category', 'actions']}
              renderedData={renderedBanners}
            />
          )}
          {isSuccessBanners && bannersData?.banners?.length === 0 && (
            <NotFoundItem message='No Banner Yet!' />
          )}
        </div>
      </section>
    </>
  );
}

export default BannersLayout;
