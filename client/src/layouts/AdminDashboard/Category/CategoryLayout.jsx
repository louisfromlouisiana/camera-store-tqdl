import React, { useContext, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { ModalContext } from '../../../context/ModalProvider';
import { FetchDataContext } from '../../../context/FetchDataProvider';
import AddCategoryModal from '../../../components/modal/dashboard/AddCategoryModal';
import SingleCategory from './components/SingleCategory';
import Table from '../../../components/ui/Table';
import NotFoundItem from '../../../components/ui/NotFoundItem';
import UpdateCategoryModal from '../../../components/modal/dashboard/UpdateCategoryModal';
function CategoryLayout() {
  const { setVisibleModal } = useContext(ModalContext);
  const { categories } = useContext(FetchDataContext);
  const renderedCategories = useMemo(() => {
    return categories?.map((c) => {
      return <SingleCategory key={c._id} category={c} />;
    });
  }, [categories]);
  return (
    <>
      <AddCategoryModal />
      <UpdateCategoryModal />
      <section className='col-span-1 lg:col-span-4 w-full flex flex-col gap-6 border border-neutral-300 p-4 sm:p-8 rounded-xl shadow-lg'>
        <div className='flex justify-between items-center gap-4'>
          <h1 className='text-xl sm:text-2xl font-bold'>Categories</h1>
          <button
            className='px-4 py-2 font-bold bg-neutral-700 hover:bg-violet-500 transition-colors text-white rounded flex items-center gap-2'
            onClick={() => setVisibleModal('visibleAddCategoryModal')}
          >
            <FaPlus className='text-lg' />
            <p>Add Category</p>
          </button>
        </div>
        <div className='w-full h-full flex flex-col gap-8'>
          {categories?.length > 0 && (
            <Table
              tHeader={[
                'title',
                'image',
                'content',
                'category',
                'updated at',
                'actions',
              ]}
              renderedData={renderedCategories}
            />
          )}
          {categories?.length === 0 && (
            <NotFoundItem message='No Category Yet!' />
          )}
        </div>
      </section>
    </>
  );
}

export default CategoryLayout;
