import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetProductDetailsQuery } from '../../../services/redux/query/products';
import NotFoundLayout from '../../NotFoundLayout/NotFoundLayout';
import { FaAngleRight } from 'react-icons/fa6';
import Images from './components/Images';
import ProductDetails from './components/ProductDetails';
import DescriptionProduct from './components/DescriptionProduct';
import Loading from '../../../components/ui/Loading';
function ProductDetailsLayout() {
  const { id } = useParams();
  const {
    data: productData,
    isLoading: isLoadingProduct,
    isSuccess: isSuccessProduct,
    isError: isErrorProduct,
  } = useGetProductDetailsQuery(id);
  if (isLoadingProduct) {
    return <Loading />;
  }
  if (isErrorProduct) {
    return <NotFoundLayout />;
  }
  return (
    isSuccessProduct && (
      <div className='lg:w-4/5 2xl:w-3/5 m-auto py-8 px-4 md:px-0 text-neutral-700 flex flex-col gap-8 md:gap-16'>
        <section className='flex items-center gap-2'>
          <Link to='/' className='font-bold'>
            Home
          </Link>
          <span>
            <FaAngleRight />
          </span>
          <Link to='/shop' className='font-bold'>
            Shop
          </Link>
          <span>
            <FaAngleRight />
          </span>
          <p className='text-violet-500 font-bold max-w-[120px] truncate lg:text-nowrap'>
            {productData?.product?.name}
          </p>
        </section>
        <section className='w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 border border-neutral-300 rounded-lg p-4 shadow-lg'>
          <Images images={productData?.product?.images} />
          <ProductDetails product={productData?.product} />
        </section>
        <section className='w-full border border-neutral-300 shadow-lg rounded-lg p-4'>
          <DescriptionProduct product={productData?.product} />
        </section>
      </div>
    )
  );
}

export default ProductDetailsLayout;
