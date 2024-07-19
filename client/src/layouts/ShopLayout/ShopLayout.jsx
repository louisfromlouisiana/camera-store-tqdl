import React, { useContext, useState } from 'react';
import bgImg from '../../assets/pager.jpeg';
import { useGetProductsQuery } from '../../services/redux/query/products';
import { useSearchParams } from 'react-router-dom';
import SingleProduct from './components/SingleProduct';
import Pagination from '../../components/ui/Pagination';
import { FetchDataContext } from '../../context/FetchDataProvider';
import useQueryString from '../../hooks/useQueryString';
import { IoSearchSharp } from 'react-icons/io5';
import {
  formatAndPreserveCursor,
  formatNumber,
  formatNumberWithDot,
} from '../../services/utils/format';
import useEnterKey from '../../hooks/useEnterKey';
function ShopLayout() {
  const [searchParams] = useSearchParams();
  const [createQueryString, deleteQueryString] = useQueryString();
  const [searchValue, setSearchValue] = useState('');
  const [filterPrice, setFilterPrice] = useState({
    price: 0,
    minPrice: 0,
    maxPrice: 0,
  });
  const { categories } = useContext(FetchDataContext);
  const { data: productsData, isSuccess: isSuccessProductData } =
    useGetProductsQuery(
      `page=${searchParams.get('page') || 1}&category=${searchParams.get(
        'category'
      )}&sort=${searchParams.get('sort')}&minPrice=${searchParams.get(
        'minPrice'
      )}&maxPrice=${searchParams.get('maxPrice')}&price=${searchParams.get(
        'price'
      )}&search=${searchParams.get('search')}`
    );
  const handleSearch = () => {
    createQueryString('search', searchValue);
  };
  const { inputRef, handleKeyDown } = useEnterKey(handleSearch);
  const handleInputNumberChange = (e) => {
    const { name } = e.target;
    const value = e.target.value.replace(/\D/g, '');
    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      setFilterPrice({ ...filterPrice, [name]: numericValue });
    }
  };
  const handleFilterPrice = () => {
    if (filterPrice.price > 0) {
      createQueryString('price', filterPrice.price);
    } else {
      createQueryString(
        ['minPrice', 'maxPrice'],
        [filterPrice.minPrice, filterPrice.maxPrice]
      );
    }
  };
  const handleClearFilter = () => {
    deleteQueryString();
    setFilterPrice({ price: 0, minPrice: 0, maxPrice: 0 });
    setSearchValue('');
  };
  return (
    <div className='flex flex-col gap-16 text-neutral-700'>
      <section className='relative h-[180px] md:h-[250px] overflow-hidden'>
        <img
          className='w-full h-full object-cover'
          src={bgImg}
          alt='bg-img'
         fetchPriority='low'
        />
        <div
          style={{ background: 'rgba(0, 0, 0, 0.6)' }}
          className='absolute z-10 top-0 left-0 w-full h-full flex justify-center items-center'
        >
          <h1 className='text-2xl md:text-4xl font-bold text-white'>SHOP</h1>
        </div>
      </section>
      <section className='container m-auto px-4 md:px-0 flex flex-col md:flex-row justify-between gap-8'>
        {isSuccessProductData && (
          <p className='text-xl md:text-2xl font-bold'>
            Found {productsData?.totalProducts}{' '}
            {productsData?.totalProducts > 1 ? 'products' : 'product'}
          </p>
        )}
        <div className='flex flex-col md:flex-row items-stretch gap-4'>
          <div>
            <select
              className='w-full px-4 h-[48px] border border-neutral-300 rounded focus:outline-none'
              name='sort'
              id='sort'
              onChange={(e) => createQueryString('sort', e.target.value)}
            >
              <option value=''>Default Sorting</option>
              <option value='price'>Price: High To Low</option>
              <option value='-price'>Price: Low To High</option>
              <option value='date'>Newness</option>
              <option value='-date'>Oldness</option>
            </select>
          </div>
          <div className='relative'>
            <input
              ref={inputRef}
              className='w-full h-[48px] px-4 py-2 border border-neutral-300 rounded'
              type='text'
              placeholder='Search...'
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className='absolute top-1/2 right-5 -translate-y-1/2 z-10'
              aria-label='search-btn'
              onClick={() => createQueryString('search', searchValue)}
            >
              <IoSearchSharp className='text-2xl text-violet-500' />
            </button>
          </div>
          <div>
            <button
              className='px-4 h-[48px] bg-neutral-700 text-white rounded'
              onClick={handleClearFilter}
            >
              Clear Filter
            </button>
          </div>
        </div>
      </section>
      <section className='container m-auto px-4 md:px-0 flex flex-col lg:flex-row gap-8'>
        <div className='order-2 lg:order-1 lg:w-3/4 flex flex-col gap-6'>
          {isSuccessProductData && productsData?.products.length > 0 && (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16'>
                {productsData?.products?.map((p) => {
                  return <SingleProduct key={p._id} product={p} />;
                })}
              </div>
              {productsData?.totalPage > 1 && (
                <Pagination
                  curPage={searchParams.get('page') || 1}
                  totalPage={productsData?.totalPage}
                />
              )}
            </>
          )}
          {isSuccessProductData && productsData?.products.length === 0 && (
            <div className='w-full h-full flex justify-center items-center'>
              <p className='text-2xl md:text-4xl font-bold '>No Product Yet!</p>
            </div>
          )}
        </div>
        <div className='order-1 lg:order-2 lg:w-1/4 flex flex-col gap-8'>
          <div className='flex flex-col gap-6'>
            <p className='relative pb-4 text-xl font-bold'>
              <span>Shop By Categories</span>
              <span className='absolute w-[30px] h-[2px] bg-violet-500 bottom-0 left-0'></span>
            </p>
            <ul className='flex flex-col gap-6'>
              {categories?.map((c) => {
                return (
                  <li key={c._id}>
                    <button
                      className={`capitalize hover:text-violet-500 transition-colors ${
                        searchParams.get('category') === c.name
                          ? 'text-violet-500'
                          : 'text-neutral-700'
                      }`}
                      onClick={() => createQueryString('category', c.name)}
                    >
                      {c.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className='flex flex-col gap-6'>
            <p className='relative pb-4 text-xl font-bold'>
              <span>Price Filter</span>
              <span className='absolute w-[30px] h-[2px] bg-violet-500 bottom-0 left-0'></span>
            </p>
            <div className='flex flex-col gap-4'>
              {/* <div>
                <label htmlFor='price'>Price</label>
                <input
                  className='w-full px-4 h-[48px] border border-neutral-300 rounded'
                  name='price'
                  type='number'
                  placeholder='Enter price...'
                  value={filterPrice.price}
                  onChange={handleChangePrice}
                />
              </div>
              <p className='text-lg font-bold'>Or</p> */}
              <div className='flex flex-col gap-2'>
                <div>
                  <label htmlFor='minPrice'>Min Price</label>
                  <input
                    className='w-full px-4 h-[48px] border border-neutral-300 rounded'
                    name='minPrice'
                    type='text'
                    placeholder='Enter min price...'
                    value={formatNumber(filterPrice.minPrice)} // Display the formatted value
                    onChange={(e) => {
                      handleInputNumberChange(e);
                      formatAndPreserveCursor(e);
                    }}
                  />
                </div>
                <div>
                  <label htmlFor='maxPrice'>Max Price</label>
                  <input
                    className='w-full px-4 h-[48px] border border-neutral-300 rounded'
                    name='maxPrice'
                    type='text'
                    placeholder='Enter max price...'
                    value={formatNumber(filterPrice.maxPrice)} // Display the formatted value
                    onChange={(e) => {
                      handleInputNumberChange(e);
                      formatAndPreserveCursor(e);
                    }}
                  />
                </div>
              </div>
              <div className='flex items-center gap-8 justify-between'>
                <button
                  className='px-8 py-2 rounded-md border border-neutral-300 font-bold hover:border-violet-500 hover:text-violet-500 transition-colors'
                  onClick={handleFilterPrice}
                >
                  Filter
                </button>
                <div className='flex font-bold gap-2'>
                  <p
                    title={formatNumberWithDot(filterPrice.minPrice)}
                    className='truncate max-w-[120px]'
                  >
                    {formatNumberWithDot(filterPrice.minPrice)}
                  </p>
                  <span>-</span>
                  <p
                    title={formatNumberWithDot(filterPrice.maxPrice)}
                    className='truncate max-w-[120px]'
                  >
                    {formatNumberWithDot(filterPrice.maxPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ShopLayout;
