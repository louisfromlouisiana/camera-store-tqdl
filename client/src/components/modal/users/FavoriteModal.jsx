import Modal from '@/Modal.jsx';
import React, { useContext } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { ModalContext } from '../../../context/ModalProvider';
import useClickOutside from '../../../hooks/useClickOutside';
import { useSelector } from 'react-redux';
import { getFavorite } from '../../../services/redux/slice/userSlice';
import { formatNumberWithDot } from '../../../services/utils/format';
import { usePostFavoriteMutation } from '../../../services/redux/query/users';

function FavoriteModal() {
  const { state, setVisibleModal } = useContext(ModalContext);
  const [modalRef, clickOutside] = useClickOutside();
  const favorite = useSelector(getFavorite);
  const [postFavorite] = usePostFavoriteMutation();
  return (
    <Modal>
      <section
        style={{ backgroundColor: 'rgba(51,51,51,0.9)' }}
        className={`fixed right-0 top-0 w-full h-full z-[100] flex justify-end overflow-hidden ${
          state.visibleFavoriteModal ? 'translate-x-0' : 'translate-x-[100%]'
        } transition-all duration-200`}
        onClick={clickOutside}
      >
        <div
          className='w-full sm:w-[420px] h-full bg-slate-50 p-4 flex flex-col gap-6'
          ref={modalRef}
        >
          <div className='w-full flex justify-end'>
            <button
              aria-label='btn-close'
              onClick={() => setVisibleModal('visibleFavoriteModal')}
            >
              <FaXmark className='text-4xl' />
            </button>
          </div>
          <div className='h-full max-h-[80vh] overflow-y-auto flex flex-col gap-8'>
            <p className='text-xl sm:text-2xl font-bold'>My Favorites</p>
            <div className='flex flex-col gap-4'>
              {favorite.total > 0 &&
                favorite.products?.map((p) => {
                  return (
                    <article
                      key={p._id}
                      className='py-2 border-b border-neutral-300 flex gap-4'
                    >
                      <div className='w-[96px] h-[64px]'>
                        <img
                          className='w-full h-full object-cover'
                          src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                            p?.images[0]?.url
                          }`}
                          alt={p.name}
                          {...{ fetchPriority: 'low' }}
                        />
                      </div>
                      <div className='w-full flex flex-col justify-between gap-4'>
                        <div className='flex justify-between gap-4'>
                          <p className='max-w-[200px] font-bold truncate'>
                            {p.name}
                          </p>
                          <button
                            className='w-[24px] h-[24px] border border-neutral-300 rounded-full flex justify-center items-center'
                            onClick={async () => await postFavorite(p._id)}
                          >
                            <FaXmark />
                          </button>
                        </div>
                        <div className='text-sm flex justify-between gap-4'>
                          <p title='100.000.000.000000'>
                            Price:{' '}
                            <span className='font-bold'>
                              {formatNumberWithDot(p.price)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
            {favorite.total === 0 && (
              <div className='h-full text-xl font-bold flex justify-center items-center'>
                <p>No Product Yet!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Modal>
  );
}

export default FavoriteModal;
