import React, { useContext, useMemo } from 'react';
import { useGetProductsQuery } from '../../../services/redux/query/products';
import { useSearchParams } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import { FaPlus } from 'react-icons/fa6';
import NotFoundItem from '../../../components/ui/NotFoundItem';
import SingleProduct from './components/SingleProduct';
import FilterProduct from './components/FilterProduct';
import { ModalContext } from '../../../context/ModalProvider';
import AddProductModal from '../../../components/modal/dashboard/AddProductModal';
import UpdateProductModal from '../../../components/modal/dashboard/UpdateProductModal';
function ProductsLayout() {
  const [searchParams] = useSearchParams();
  const { setVisibleModal } = useContext(ModalContext);
  const { data: productsData, isSuccess: isSuccessProducts } =
    useGetProductsQuery(
      `page=${searchParams.get('page') || 1}&category=${searchParams.get(
        'category'
      )}&sort=${searchParams.get('sort')}&minPrice=${searchParams.get(
        'minPrice'
      )}&maxPrice=${searchParams.get('maxPrice')}&price=${searchParams.get(
        'price'
      )}&search=${searchParams.get('search')}`
    );
  const renderedProducts = useMemo(() => {
    return (
      isSuccessProducts &&
      productsData?.products?.map((p) => {
        return <SingleProduct key={p._id} product={p} />;
      })
    );
  }, [isSuccessProducts, productsData]);
  return (
    <>
      <UpdateProductModal />
      <AddProductModal />
      <section className='col-span-1 lg:col-span-4 w-full flex flex-col gap-6 border border-neutral-300 p-4 sm:p-8 rounded-xl shadow-lg'>
        <div className='flex justify-between items-center gap-4'>
          <h1 className='text-xl sm:text-2xl font-bold'>Products</h1>
          <button
            className='px-4 py-2 font-bold bg-neutral-700 hover:bg-violet-500 transition-colors text-white rounded flex items-center gap-2'
            onClick={() => setVisibleModal('visibleAddProductModal')}
          >
            <FaPlus className='text-lg' />
            <p>Add Product</p>
          </button>
        </div>
        <div className='w-full h-full flex flex-col gap-8'>
          <FilterProduct />
          <div className='w-full h-full'>
            {isSuccessProducts && productsData?.products?.length > 0 && (
              <Table
                tHeader={[
                  'name',
                  'image',
                  'category',
                  'available',
                  'quantity',
                  'price',
                  'created at',
                  'updated at',
                  'actions',
                ]}
                renderedData={renderedProducts}
                totalPage={productsData?.totalPage}
                currPage={searchParams.get('page') || 1}
              />
            )}
            {isSuccessProducts && productsData?.products?.length === 0 && (
              <NotFoundItem message='No Product Yet!' />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default ProductsLayout;
