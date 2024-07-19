import React, { useContext, useEffect, useRef, useState } from 'react';
import { useGetProductsQuery } from '../../services/redux/query/products';
import { FetchDataContext } from '../../context/FetchDataProvider';
import { useNavigate } from 'react-router-dom';
import { formatNumberWithDot } from '../../services/utils/format';

function CompareLayout() {
  const navigate = useNavigate();
  const hasMoreRef1 = useRef(null);
  const hasMoreRef2 = useRef(null);
  const [curPage, setCurPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [listItem, setListItem] = useState([]);
  const { categories } = useContext(FetchDataContext);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectDropdown, setSelectDropdown] = useState(null);
  const { data: productsData, isSuccess: isSuccessProductData } =
    useGetProductsQuery(`page=${curPage}&category=${selectedCategory}`, {
      skip: !selectedCategory,
    });
  const [form, setForm] = useState({
    item1: null,
    item2: null,
  });

  useEffect(() => {
    if (isSuccessProductData && productsData) {
      setListItem((prevItems) => {
        if (curPage === 1) return [...productsData.products];
        return [...new Set([...prevItems, ...productsData.products])];
      });
      if (productsData.totalPage === curPage) {
        setHasMore(false);
      }
    }
  }, [isSuccessProductData, productsData, curPage]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        hasMore &&
        isSuccessProductData &&
        productsData
      ) {
        if (curPage < productsData.totalPage) {
          setCurPage((prevPage) => prevPage + 1);
        } else {
          setCurPage(productsData.totalPage);
        }
      }
    }, options);

    if (observer && hasMoreRef1.current) observer.observe(hasMoreRef1.current);
    if (observer && hasMoreRef2.current) observer.observe(hasMoreRef2.current);
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [hasMore, isSuccessProductData, productsData]);

  const handleSetSelectDropdown = (name) => {
    setSelectDropdown((prevName) => (prevName === name ? null : name));
  };

  const handleSelected = (name, value) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    handleSetSelectDropdown(name);
  };

  // Get a unified list of specification names from both items
  const getAllSpecificationNames = () => {
    const specNames = new Set();
    if (form.item1) {
      form.item1.specifications.forEach((spec) => specNames.add(spec.name));
    }
    if (form.item2) {
      form.item2.specifications.forEach((spec) => specNames.add(spec.name));
    }
    return Array.from(specNames);
  };

  const allSpecNames = getAllSpecificationNames();
  return (
    <div className='container m-auto px-4 py-16 flex flex-col gap-8'>
      <section className='flex flex-col gap-8'>
        <h1 className='text-2xl md:text-4xl font-bold'>Categories</h1>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {categories?.map((c) => {
            return (
              <button
                className={`col-span-1 py-4 capitalize font-bold border border-neutral-300 ${
                  selectedCategory === c?.name
                    ? 'bg-neutral-700 text-white'
                    : ''
                } rounded`}
                key={c._id}
                onClick={() => setSelectedCategory(c?.name)}
              >
                {c?.name}
              </button>
            );
          })}
        </div>
      </section>
      {selectedCategory ? (
        <>
          <section className='flex flex-col gap-8'>
            <h1 className='text-2xl md:text-4xl font-bold'>Product</h1>
            <div className='flex flex-col md:flex-row justify-center gap-8'>
              <div className='relative flex flex-col gap-2'>
                <button
                  className='w-[280px] md:w-[380px] mx-auto border border-neutral-300 p-4 text-lg rounded focus:outline-none font-bold truncate'
                  onClick={() => handleSetSelectDropdown('item1')}
                >
                  {form.item1 ? form.item1.name : 'Select product to compare'}
                </button>
                <div
                  className={`absolute top-[110%] bg-white w-[280px] md:w-[380px] ${
                    selectDropdown === 'item1'
                      ? 'h-[50vh] border'
                      : 'h-0 border-none'
                  } transition-all duration-200 overflow-hidden border-neutral-300 rounded flex flex-col overflow-y-auto`}
                >
                  {listItem.map((p, index) => (
                    <button
                      className='p-4 border-b border-neutral-200'
                      key={p._id}
                      onClick={() => handleSelected('item1', p)}
                    >
                      <span className='w-max truncate'>{p.name}</span>
                    </button>
                  ))}
                  {hasMore && (
                    <p
                      ref={hasMoreRef1}
                      className='py-2 text-center text-sm font-bold'
                    >
                      Loading More...
                    </p>
                  )}
                </div>
              </div>
              <div className='relative flex flex-col gap-2'>
                <button
                  className='w-[280px] md:w-[380px] mx-auto border border-neutral-300 p-4 text-lg rounded focus:outline-none font-bold truncate'
                  onClick={() => handleSetSelectDropdown('item2')}
                >
                  {form.item2 ? form.item2.name : 'Select product to compare'}
                </button>
                <div
                  className={`absolute top-[110%] bg-white w-[280px] md:w-[380px] ${
                    selectDropdown === 'item2'
                      ? 'h-[50vh] border'
                      : 'h-0 border-none'
                  } transition-all duration-200 overflow-hidden border-neutral-300 rounded flex flex-col overflow-y-auto`}
                >
                  {listItem.map((p, index) => (
                    <button
                      className='p-4 border-b border-neutral-200'
                      key={p._id}
                      onClick={() => handleSelected('item2', p)}
                    >
                      <span className='w-max truncate'>{p.name}</span>
                    </button>
                  ))}
                  {hasMore && (
                    <p
                      ref={hasMoreRef2}
                      className='py-2 text-center text-sm font-bold'
                    >
                      Loading More...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
          <section className='flex flex-col gap-8'>
            <h1 className='text-2xl md:text-4xl font-bold'>Summary</h1>
            {!form.item1 && !form.item2 && (
              <p className='text-xl text-center font-bold'>
                No Product Selected To Compare!
              </p>
            )}
            {(form.item1 || form.item2) && (
              <div className='flex flex-col items-baseline md:flex-row gap-8 py-4 border-t border-neutral-300'>
                {form.item1 && (
                  <div className='w-full md:w-1/2 flex flex-col gap-4'>
                    <h2 className='text-center text-lg md:text-xl font-bold truncate'>
                      {form.item1?.name}
                    </h2>
                    {form?.item1 && (
                      <div className='py-4 border-b-2 border-neutral-300'>
                        <div className='m-auto size-[256px]'>
                          <img
                            className='w-full h-full object-cover'
                            src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                              form?.item1?.images[0]?.url
                            }`}
                            alt={form?.item1?.name}
                            {...{ fetchPriority: 'low' }}
                          />
                        </div>
                      </div>
                    )}
                    <div className='flex justify-center items-center gap-2 text-lg md:text-2xl'>
                      <h3 className='font-bold'>Price:</h3>
                      <p className='font-bold text-violet-500'>
                        {formatNumberWithDot(form?.item1?.price)}
                      </p>
                    </div>
                  </div>
                )}
                {form.item2 && (
                  <div className='w-full md:w-1/2 flex flex-col gap-4'>
                    <h2 className='text-center text-lg md:text-xl font-bold truncate'>
                      {form.item2?.name}
                    </h2>
                    {form?.item2 && (
                      <div className='py-4 border-b-2 border-neutral-300'>
                        <div className='m-auto size-[256px]'>
                          <img
                            className='w-full h-full object-cover'
                            src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                              form?.item2?.images[0]?.url
                            }`}
                            alt={form?.item2?.name}
                            {...{ fetchPriority: 'low' }}
                          />
                        </div>
                      </div>
                    )}
                    <div className='flex justify-center items-center gap-2 text-lg md:text-2xl'>
                      <h3 className='font-bold'>Price:</h3>
                      <p className='font-bold text-violet-500'>
                        {formatNumberWithDot(form?.item2?.price)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {(form.item1 || form.item2) && (
              <div className='grid grid-cols-2 gap-8'>
                {allSpecNames.map((name, index) => {
                  const item1Spec = form.item1?.specifications.find(
                    (s) => s.name === name
                  );
                  const item2Spec = form.item2?.specifications.find(
                    (s) => s.name === name
                  );
                  return (
                    <React.Fragment key={index}>
                      <div className='grid-cols-1 h-full flex flex-col gap-2 py-4 border-b-2 border-neutral-300'>
                        <p className='text-lg text-center font-medium'>
                          {name}
                        </p>
                        <p className='break-words h-full text-center'>
                          {item1Spec ? item1Spec.value : 'N/A'}
                        </p>
                      </div>
                      <div className='h-full flex flex-col gap-2 py-4 border-b-2 border-neutral-300'>
                        <p className='text-lg text-center font-medium'>
                          {name}
                        </p>
                        <p className='break-words h-full text-center'>
                          {item2Spec ? item2Spec.value : 'N/A'}
                        </p>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
            {(form.item1 || form.item2) && (
              <div className='flex justify-between gap-8'>
                {form.item1 && (
                  <button
                    className='w-full text-violet-500 font-bold'
                    onClick={() => navigate(`/shop/${form.item1?._id}`)}
                  >
                    View Product
                  </button>
                )}
                {form.item2 && (
                  <button
                    className='w-full text-violet-500 font-bold'
                    onClick={() => navigate(`/shop/${form.item2?._id}`)}
                  >
                    View Product
                  </button>
                )}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className='w-full flex justify-center py-4'>
          <p className='text-lg font-bold'>
            Please Selected Product To Compare
          </p>
        </section>
      )}
    </div>
  );
}

export default CompareLayout;
