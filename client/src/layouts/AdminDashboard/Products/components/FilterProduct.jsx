import React, { useCallback, useContext, useState } from 'react';
import { FetchDataContext } from '../../../../context/FetchDataProvider';
import useQueryString from '../../../../hooks/useQueryString';
import useEnterKey from '../../../../hooks/useEnterKey';

function FilterProduct() {
  const { categories } = useContext(FetchDataContext);
  const [createQueryString, deleteQueryString] = useQueryString();
  const [filter, setFilter] = useState({
    search: '',
    category: '',
    sort: '',
  });
  const handleFilter = useCallback(() => {
    if (filter) {
      // const keysSearch = Object.keys(filter);
      createQueryString(
        ['search', 'category', 'sort'],
        [filter.search, filter.category, filter.sort]
      );
    }
  }, [filter, createQueryString]);
  const { inputRef, handleKeyDown } = useEnterKey(handleFilter);
  const handleResetFilter = useCallback(() => {
    setFilter({
      search: '',
      category: '',
      sort: '',
    });
    deleteQueryString({
      search: '',
      category: '',
      sort: '',
    });
  }, [filter, deleteQueryString]);
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      <input
        ref={inputRef}
        className='h-[48px] px-4 py-2 border border-neutral-300 rounded'
        type='text'
        placeholder='Search product name...'
        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        onKeyDown={handleKeyDown}
      />
      <select
        className='h-[48px] px-4 py-2 border border-neutral-300 rounded focus:outline-none'
        name='category'
        id='category'
        onChange={(e) => setFilter({ ...filter, category: e.target.value })}
      >
        <option value=''>Categories</option>
        {categories?.map((c) => {
          return (
            <option className='px-4 py-2 capitalize' value={c.name}>
              {c.name}
            </option>
          );
        })}
      </select>
      <select
        className='h-[48px] px-4 py-2 border border-neutral-300 rounded focus:outline-none'
        name='sort'
        id='sort'
        onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
      >
        <option value=''>Sort</option>
        <option value='price'>Price: High to low</option>
        <option value='-price'>Price: Low to high</option>
        <option value='date'>Newness</option>
        <option value='-date'>Oldness</option>
      </select>
      <div className='flex gap-4 justify-end'>
        <button
          className='h-[48px] w-[120px] px-4 py-2 bg-violet-500 text-white font-bold rounded'
          onClick={handleFilter}
        >
          Filter
        </button>
        <button
          className='h-[48px] w-[120px] px-4 py-2 bg-neutral-700 text-white font-bold rounded'
          onClick={handleResetFilter}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default FilterProduct;
