import React, { useContext, useEffect } from 'react';
import { FaRegTrashCan, FaRegPenToSquare } from 'react-icons/fa6';
import { useDeleteAddressMutation } from '../../../../services/redux/query/users';
import { ModalContext } from '../../../../context/ModalProvider';

function SingleAddress({ address, number }) {
  const { setVisibleModal } = useContext(ModalContext);

  const [
    deleteAddress,
    {
      data: deleteData,
      isLoading: isLoadingDelete,
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
    },
  ] = useDeleteAddressMutation();
  useEffect(() => {
    if (isSuccessDelete && deleteData) {
      setVisibleModal({
        visibleToastModal: {
          type: 'success',
          message: deleteData?.message,
        },
      });
    }
    if (isErrorDelete && errorDelete) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorDelete?.data?.message,
        },
      });
    }
  }, [
    isSuccessDelete,
    deleteData,
    isErrorDelete,
    errorDelete,
    setVisibleModal,
  ]);
  return (
    <tr>
      <td className='p-4 text-center'>{number}</td>
      <td className='p-4 text-center'>{address?.province?.name}</td>
      <td className='p-4 text-center'>{address?.district?.name}</td>
      <td className='p-4 text-center'>{address?.ward?.name}</td>
      <td className='p-4 text-center'>{address?.address}</td>
      <td className='p-4 text-center'>{address?.phone}</td>
      <td>
        {address.isDefault && (
          <p className='m-auto px-4 w-max text-center bg-green-100 text-green-500 border border-green-500 rounded-3xl text-sm'>
            Default
          </p>
        )}
      </td>
      <td className='p-4'>
        <div className='flex justify-center items-center gap-[12px]'>
          <button
            className='text-lg flex justify-center items-center hover:text-green-500 transition-colors'
            aria-label='update-btn'
            disabled={isLoadingDelete}
            onClick={() =>
              setVisibleModal({
                visibleUpdateAddressModal: { ...address },
              })
            }
          >
            <FaRegPenToSquare />
          </button>
          <button
            className='text-lg flex justify-center items-center hover:text-red-500 transition-colors'
            aria-label='delete-btn'
            onClick={() =>
              setVisibleModal({
                visibleConfirmModal: {
                  icon: <FaRegTrashCan className='text-red-500' />,
                  question: `Are you sure you want to delete this address?`,
                  description:
                    'This cannot be undone!',
                  loading: isLoadingDelete,
                  acceptFunc: () => deleteAddress(address?._id),
                },
              })
            }
            disabled={isLoadingDelete}
          >
            <FaRegTrashCan />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default SingleAddress;
