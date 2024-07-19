import React, { useContext, useEffect, useMemo, useState } from 'react';
import Table from '../../../components/ui/Table';
import NotFoundItem from '../../../components/ui/NotFoundItem';
import { useSearchParams } from 'react-router-dom';
import {
  formatAndPreserveCursor,
  formatNumber,
  formatNumberWithDot,
} from '../../../services/utils/format';
import {
  useChangeRateProvinceMutation,
  useGetAllRateProvinceQuery,
} from '../../../services/redux/query/webInfo';
import { ModalContext } from '../../../context/ModalProvider';
import useQueryString from '../../../hooks/useQueryString';
import useEnterKey from '../../../hooks/useEnterKey';
function FeesLayout() {
  const { setVisibleModal } = useContext(ModalContext);
  const [createQueryString, deleteQueryString] = useQueryString();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || ''
  );
  const [isChange, setIsChange] = useState({
    id: null,
    rate: '',
  });
  const { data: rateData, isSuccess: isSuccessRate } =
    useGetAllRateProvinceQuery(
      `page=${searchParams.get('page') || 1}&search=${searchParams.get(
        'search'
      )}`,
      {
        pollingInterval: Number(import.meta.env.VITE_DEFAULT_POLLING),
        refetchOnFocus: true,
      }
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
    updateRate,
    {
      data: updateData,
      isLoading: isLoadingUpdate,
      isSuccess: isSuccessUpdate,
      error: errorUpdate,
      isError: isErrorUpdate,
    },
  ] = useChangeRateProvinceMutation();
  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      setIsChange({ ...isChange, rate: numericValue });
    }
  };

  const renderedRate = useMemo(() => {
    return (
      isSuccessRate &&
      rateData?.data?.map((d) => {
        return (
          <tr key={d._id}>
            <td className='p-4 text-center'>{d.name}</td>
            <td className='p-4 text-center'>{d.code}</td>
            <td className='p-4 text-center'>{d.type}</td>
            <td className='p-4 text-center flex justify-center items-center'>
              {isChange.id === d._id && (
                <input
                  className={`max-w-[120px] px-2 py-1 rounded bg-transparent text-center border border-neutral-300`}
                  type='text'
                  value={formatNumber(isChange.rate)}
                  onChange={(e) => {
                    handleInputChange(e);
                    formatAndPreserveCursor(e);
                  }}
                />
              )}
              {isChange.id !== d._id && (
                <div className='max-w-[120px] px-4 py-2 rounded bg-transparent text-center '>
                  <p>{formatNumberWithDot(d.rate)}</p>
                </div>
              )}
            </td>
            <td className='p-4 text-center'>
              <div className='w-full flex justify-center items-center gap-4'>
                {isChange.id !== d._id && (
                  <button
                    className='text-sm text-violet-500'
                    onClick={() => setIsChange({ id: d._id, rate: d.rate })}
                  >
                    Edit
                  </button>
                )}
                {isChange.id === d._id && (
                  <>
                    <button
                      className='text-sm'
                      onClick={() => setIsChange({ id: null, rate: 0 })}
                    >
                      Cancel
                    </button>
                    <button
                      className='text-sm text-violet-500'
                      onClick={async () =>
                        await updateRate({
                          id: isChange.id,
                          rate: isChange.rate,
                        })
                      }
                    >
                      Save
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        );
      })
    );
  }, [isSuccessRate, rateData, isChange]);
  useEffect(() => {
    if (isSuccessUpdate && updateData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: updateData?.message,
        },
      });
    }
    if (isErrorUpdate && errorUpdate) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorUpdate?.data?.message,
        },
      });
    }
    setIsChange({ id: null, rate: 0 });
  }, [
    isSuccessUpdate,
    updateData,
    isErrorUpdate,
    errorUpdate,
    setVisibleModal,
  ]);
  return (
    <section className='col-span-1 lg:col-span-4 w-full flex flex-col gap-6 border border-neutral-300 p-4 sm:p-8 rounded-xl shadow-lg'>
      <div
        className='flex flex-col justify-between gap-6'
        aria-disabled={isLoadingUpdate}
      >
        <h1 className='text-xl sm:text-2xl font-bold'>Fees From Province</h1>
        <div className='flex flex-col md:flex-row items-stretch gap-4'>
          <input
            ref={inputRef}
            className='border border-neutral-300 px-4 py-2 rounded'
            type='text'
            placeholder='Enter province name or province code...'
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
        {isSuccessRate && rateData?.data?.length > 0 && (
          <Table
            tHeader={['name', 'code', 'type', 'fee', 'actions']}
            renderedData={renderedRate}
            totalPage={rateData?.totalPage}
            currPage={searchParams.get('page') || 1}
          />
        )}
        {isSuccessRate && rateData?.data?.length === 0 && (
          <NotFoundItem message='No Fee Yet!' />
        )}
      </div>
    </section>
  );
}

export default FeesLayout;
