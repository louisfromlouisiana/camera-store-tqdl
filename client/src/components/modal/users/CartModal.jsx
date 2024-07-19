import Modal from '@/Modal.jsx';
import React, { useCallback, useContext, useEffect } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { ModalContext } from '../../../context/ModalProvider';
import useClickOutside from '../../../hooks/useClickOutside';
import { useSelector } from 'react-redux';
import { getCart, getUser } from '../../../services/redux/slice/userSlice';
import { formatNumberWithDot } from '../../../services/utils/format';
import { useDeleteCartMutation } from '../../../services/redux/query/users';
function CartModal() {
  const navigate = useNavigate();
  const { state, setVisibleModal } = useContext(ModalContext);
  const user = useSelector(getUser);
  const [modalRef, clickOutside] = useClickOutside();
  const cart = useSelector(getCart);
  const [deleteCart, { isSuccess: isSuccessDelete }] = useDeleteCartMutation();
  const handleCheckout = useCallback(() => {
    const now = new Date();
    window.localStorage.setItem(
      'temp_order',
      JSON.stringify({
        products: cart?.products,
        expire: new Date(now.getTime() + 15 * 60000),
      })
    );
    setVisibleModal('visibleCartModal');
    navigate(`/checkout`);
  }, [setVisibleModal, navigate, cart]);
  useEffect(() => {
    if (isSuccessDelete) {
      window.localStorage.removeItem('temp_order');
    }
  }, [isSuccessDelete]);
  return (
    <Modal>
      <section
        style={{ backgroundColor: 'rgba(51,51,51,0.9)' }}
        className={`fixed right-0 top-0 w-full h-full z-[100] flex justify-end overflow-hidden ${
          state.visibleCartModal ? 'translate-x-0' : 'translate-x-[100%]'
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
              onClick={() => setVisibleModal('visibleCartModal')}
            >
              <FaXmark className='text-4xl' />
            </button>
          </div>
          <div className='h-full max-h-[80vh] overflow-y-auto flex flex-col gap-8'>
            <p className='text-xl sm:text-2xl font-bold'>My Cart</p>
            {cart?.total > 0 && (
              <div className='flex flex-col gap-4'>
                {cart?.products?.map((p) => {
                  return (
                    <article
                      key={p._id}
                      className='py-2 border-b border-neutral-300 flex gap-4'
                    >
                      <div className='w-[96px] h-[64px]'>
                        <img
                          className='w-full h-full object-cover'
                          src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                            p?.product?.images[0]?.url
                          }`}
                          alt={p?.product.name}
                          {...{ fetchPriority: 'low' }}
                        />
                      </div>
                      <div className='w-full flex flex-col justify-between gap-4'>
                        <div className='w-full flex justify-between gap-4'>
                          <p className='max-w-[200px] font-bold truncate'>
                            {p?.product?.name}
                          </p>
                          <div className='w-flex justify-end'>
                            <button
                              className='w-[24px] h-[24px] border border-neutral-300 rounded-full flex justify-center items-center'
                              onClick={async () =>
                                await deleteCart({
                                  id: user._id,
                                  productId: p?.product._id,
                                })
                              }
                            >
                              <FaXmark />
                            </button>
                          </div>
                        </div>
                        <div className='text-sm flex justify-between gap-4'>
                          <p>
                            Quantity:{' '}
                            <span className='font-bold'>{p.quantity}</span>
                          </p>
                          <p
                            className='truncate max-w-[180px]'
                            title='100.000.000.000000'
                          >
                            Price:{' '}
                            <span className='font-bold'>
                              {formatNumberWithDot(
                                p?.product?.price * p.quantity
                              )}
                            </span>
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            {cart.total === 0 && (
              <div className='h-full text-xl font-bold flex justify-center items-center'>
                <p>No Product Yet!</p>
              </div>
            )}
          </div>
          <div className='my-4 w-full flex flex-col items-center gap-4'>
            <button
              className='w-full p-4 font-bold border border-neutral-700 rounded hover:bg-neutral-700 hover:text-white transition-colors'
              onClick={() => setVisibleModal('visibleCartModal')}
            >
              Continue Shopping
            </button>
            <button
              className='w-full p-4 font-bold border border-neutral-300 rounded bg-neutral-700 text-white hover:bg-violet-500 transition-colors'
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        </div>
      </section>
    </Modal>
  );
}

export default CartModal;
