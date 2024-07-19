import React, {
  Suspense,
  lazy,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NotFoundLayout from '../NotFoundLayout/NotFoundLayout';
import { formatNumberWithDot } from '../../services/utils/format';
import { useSelector } from 'react-redux';
import { getCurDelivery, getUser } from '../../services/redux/slice/userSlice';
import { ModalContext } from '../../context/ModalProvider';
import {
  useCheckVoucherMutation,
  useCreatePaymentMutation,
} from '../../services/redux/query/products';
import Loading from '../../components/ui/Loading';
import { useGetAllCartQuery } from '../../services/redux/query/users';
import { FaBagShopping } from 'react-icons/fa6';
const ListAddressModal = lazy(() =>
  import('../../components/modal/users/ListAddressModal')
);
const AddAddressModal = lazy(() =>
  import('../../components/modal/users/AddAddressModal')
);
const UpdateAddressModal = lazy(() =>
  import('../../components/modal/users/UpdateAddressModal')
);
function CheckoutLayout() {
  const [searchParams] = useSearchParams();
  const isBuyNow = searchParams.get('isBuyNow');
  const buyNowProduct = window.localStorage.getItem('isBuyNow');
  const navigate = useNavigate();
  const [cart, setCart] = useState();
  const user = useSelector(getUser);
  const {
    data: cartData,
    isSuccess: isSuccessCart,
    isLoading: isLoadingCart,
    isError: isErrorCart,
    refetch: refetchCart,
  } = useGetAllCartQuery(null, {
    skip: !user || user?.role?.value === 1,
  });
  const { setVisibleModal } = useContext(ModalContext);
  const [_, setSearchParams] = useSearchParams();
  const curDelivery = useSelector(getCurDelivery);
  const [curPayment, setCurPayment] = useState(
    () => window.localStorage.getItem('camerashop-payment') || 'vnpay'
  );
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSelectedAll, setIsSelectedAll] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    message: '',
  });
  const [messageCheckVoucher, setMessageCheckVoucher] = useState({
    success: false,
    message: '',
  });
  const [searchVoucher, setSearchVoucher] = useState('');
  const [voucher, setVoucher] = useState(null);
  const [
    checkVoucher,
    {
      data: voucherData,
      isSuccess: isSuccessVoucher,
      isLoading: isLoadingVoucher,
      isError: isErrorVoucher,
      error: errorVoucher,
    },
  ] = useCheckVoucherMutation();
  const [
    createPayment,
    {
      data: paymentData,
      isSuccess: isSuccessPayment,
      isLoading: isLoadingPayment,
      isError: isErrorPayment,
      error: errorPayment,
    },
  ] = useCreatePaymentMutation();
  useEffect(() => {
    if (isSuccessCart) {
      setCart(cartData?.cart);
    }
  }, [isSuccessCart, cartData]);
  useEffect(() => {
    if (isBuyNow === 'yes' && buyNowProduct) {
      if (!cart || !cart.products) {
        return;
      }

      const selected = cart.products.find(
        (p) => p && p.product && p.product._id === buyNowProduct
      );
      if (!selected) {
        return;
      }

      setSelectedProducts((prevProducts) => {
        return [...prevProducts, selected];
      });
    }
  }, [isBuyNow, buyNowProduct, cart]);
  const handleSelectedPayment = useCallback(
    (payment) => {
      setCurPayment(payment);
      window.localStorage.getItem('camerashop-payment', payment);
    },
    [curPayment]
  );
  const handleSelectedProduct = useCallback(
    (product) => {
      setSelectedProducts((prevSelectedProducts) => {
        const isSelected = prevSelectedProducts.includes(product);
        let newSelectedProducts;
        if (isSelected) {
          newSelectedProducts = prevSelectedProducts.filter(
            (p) => p._id !== product._id
          );
        } else {
          newSelectedProducts = [...prevSelectedProducts, product];
        }
        setIsSelectedAll(newSelectedProducts.length === cart?.products?.length);
        return newSelectedProducts;
      });
    },
    [cart]
  );
  const handleSelectAll = useCallback(() => {
    if (isSelectedAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts([...cart?.products]);
    }
    setIsSelectedAll((prevState) => !prevState);
  }, [isSelectedAll, cart?.products]);
  const defaultAddress = useMemo(() => {
    return curDelivery
      ? `${curDelivery?.address}, ${curDelivery?.ward?.name}, ${curDelivery?.district?.name}, ${curDelivery?.province?.name}`
      : null;
  }, [curDelivery]);
  const rateFromProvince = useMemo(() => {
    return curDelivery ? curDelivery?.province?.rate : 0;
  }, [curDelivery]);
  const totalDiscountFromProduct = useMemo(() => {
    if (!selectedProducts) return 0;

    return selectedProducts?.reduce((acc, p) => {
      if (!p?.product) return acc;
      const productPrice = p?.product?.price;
      const coupon = p?.product?.coupon;

      let discount = 0;
      if (coupon) {
        const calculatedDiscount = (productPrice * coupon.discount) / 100;
        discount =
          calculatedDiscount > coupon.maxDiscount
            ? coupon.maxDiscount
            : calculatedDiscount;
      }
      return acc + discount * p.quantity || 0;
    }, 0);
  }, [selectedProducts]);
  const totalPrice = useMemo(() => {
    return selectedProducts?.reduce((acc, p) => {
      return acc + p?.quantity * p?.product?.price;
    }, 0);
  }, [selectedProducts]);
  const discountAmount = useMemo(() => {
    if (voucher) {
      const rate = (totalPrice * voucher?.discount) / 100;
      if (rate > voucher?.maxDiscount) {
        return voucher?.maxDiscount;
      } else {
        return rate;
      }
    }
    return 0;
  }, [totalPrice, voucher]);
  const handleCheckVoucher = useCallback(async () => {
    await checkVoucher({
      sku: searchVoucher,
      price: totalPrice,
      coupons: selectedProducts?.filter((p) => p?.product?.coupon !== null),
    });
  }, [checkVoucher, searchVoucher, totalPrice]);
  const handlePayment = useCallback(async () => {
    const finalDiscount =
      discountAmount > 0 ? discountAmount : totalDiscountFromProduct;
    await createPayment({
      type: curPayment,
      body: {
        phone: curDelivery?.phone,
        message: form.message,
        address: defaultAddress,
        products: selectedProducts,
        totalPrice: totalPrice,
        discount: finalDiscount,
        rateFromProvince: rateFromProvince,
        voucher: voucher?._id || null,
      },
    });
  }, [
    curPayment,
    selectedProducts,
    createPayment,
    discountAmount,
    totalDiscountFromProduct,
    voucher,
    form,
    curDelivery,
    defaultAddress,
    totalPrice,
  ]);
  useEffect(() => {
    if (isSuccessVoucher && voucherData) {
      setVoucher(voucherData?.voucher);
      setMessageCheckVoucher({
        success: true,
        message: voucherData?.message,
      });
    }
    if (isErrorVoucher && errorVoucher) {
      setMessageCheckVoucher({
        success: false,
        message: errorVoucher?.data?.message,
      });

      setVoucher(null);
    }
    setSearchVoucher('');
  }, [isSuccessVoucher, voucherData, isErrorVoucher, errorVoucher]);
  useEffect(() => {
    if (isSuccessPayment && paymentData) {
      window.localStorage.removeItem('isBuyNow');
      refetchCart();
    }
    if (isSuccessPayment && paymentData && curPayment === 'vnpay') {
      const newUrl = new URLSearchParams();
      setSearchParams(newUrl.toString());
      window.open(paymentData?.vnpay_url, '_self');
    }
    if (isErrorPayment && errorPayment) {
      setVisibleModal({
        visibleToastModal: {
          type: 'error',
          message: errorPayment?.data?.message,
        },
      });
    }
    if (isSuccessPayment && paymentData && curPayment === 'cod') {
      const newUrl = new URLSearchParams();
      setSearchParams(newUrl.toString());
      navigate(
        `/success?orderCode=${
          paymentData?.order?.paymentInfo?.orderCode
        }&paymentMethod=cod&status=${paymentData?.order?.paymentInfo?.status.toUpperCase()}`,
        { replace: true }
      );
    }
  }, [
    navigate,
    isSuccessPayment,
    paymentData,
    errorPayment,
    isErrorPayment,
    setVisibleModal,
  ]);
  if (isLoadingCart) return <Loading />;
  if (isErrorCart || (user && user?.role?.value !== 0))
    return <NotFoundLayout />;
  if (
    isSuccessCart &&
    cartData?.cart?.products.length === 0 &&
    !isLoadingCart
  ) {
    return (
      <section className='m-auto py-32 w-full h-full flex justify-center items-center'>
        <div className='m-auto p-4 w-full sm:w-1/2 lg:w-1/3 flex flex-col justify-center items-center gap-8'>
          <div>
            <FaBagShopping className='text-[72px] text-violet-500' />
          </div>
          <h1 className='text-center font-bold text-xl sm:text-2xl md:text-4xl'>
            Your cart is empty right now!
          </h1>
          <button
            className='p-4 text-lg rounded bg-neutral-700 text-neutral-100 font-bold'
            onClick={() => navigate('/', { replace: true })}
          >
            Go Shopping
          </button>
        </div>
      </section>
    );
  }
  return (
    <>
      <Suspense>
        <ListAddressModal />
        <AddAddressModal />
        <UpdateAddressModal />
      </Suspense>
      <div
        className='container m-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 text-neutral-700 gap-6 md:gap-8'
        aria-disabled={isLoadingPayment}
      >
        <section className='flex flex-col gap-6 md:gap-8'>
          <h1 className='text-xl md:text-2xl font-bold'>Orders</h1>
          <div className='w-full rounded-lg border border-neutral-300 overflow-x-auto overflow-y-auto'>
            <table className='relative w-full h-full whitespace-nowrap'>
              <thead className='text-xs font-semibold tracking-wide text-left text-neutral-700 uppercase border-b border-neutral-300'>
                <tr className='text-center font-bold uppercase'>
                  <td className='p-4 text-center'>
                    <input
                      type='checkbox'
                      name='select-all'
                      id='select-all'
                      checked={isSelectedAll}
                      onChange={handleSelectAll}
                    />
                  </td>
                  <td className='p-4 text-center'>Product</td>
                  <td className='p-4 text-center'>Price</td>
                  <td className='p-4 text-center'>Quantity</td>
                  <td className='p-4 text-center'>Discount</td>
                  <td className='p-4 text-center'>Subtotal</td>
                </tr>
              </thead>
              <tbody>
                {cart?.products?.map((p) => {
                  return (
                    <tr className='p-4 text-center' key={p._id}>
                      <td className='p-4 text-center'>
                        <input
                          type='checkbox'
                          name='select-all'
                          id='select-all'
                          value={p._id}
                          checked={selectedProducts.includes(p)}
                          onChange={() => handleSelectedProduct(p)}
                          aria-label={`checkbox-${p.product.name}`}
                        />
                      </td>
                      <td className='p-4'>
                        <div className='flex items-center gap-4'>
                          <div className='w-[72px] h-[72px]'>
                            <img
                              className='w-full h-full object-cover'
                              src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                                p?.product?.images[0]?.url
                              }`}
                              alt={p?.product?.images[0]?.name}
                            />
                          </div>
                          <p
                            className='font-bold truncate max-w-[120px]'
                            title={p?.product?.name}
                          >
                            {p?.product?.name}
                          </p>
                        </div>
                      </td>
                      <td className='p-4 text-center font-bold'>
                        {formatNumberWithDot(p?.product?.price || 0)}
                      </td>
                      <td className='p-4 text-center font-bold'>
                        {(p?.quantity || 0)}
                      </td>
                      <td className='p-4 text-center font-bold'>
                        {formatNumberWithDot(
                          (p?.product.price * p?.product?.coupon?.discount) /
                            100 >
                            p?.product?.coupon?.maxDiscount
                            ? p?.product?.coupon?.maxDiscount * p?.quantity
                            : ((p?.product.price *
                                p?.product?.coupon?.discount) /
                                100) *
                                p?.quantity || 0
                        )}
                      </td>
                      <td className='p-4 text-center font-bold'>
                        {formatNumberWithDot(
                          p?.quantity * p?.product?.price || 0
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className='flex items-center gap-4'>
            <label htmlFor='message' className='font-bold'>
              Message
            </label>
            <input
              className='w-full px-4 py-2 border border-neutral-300 rounded'
              name='message'
              type='text'
              placeholder='Message to sellers...'
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
        </section>
        <section className='flex flex-col gap-4'>
          <div className='p-8 border border-neutral-300 rounded shadow-lg flex flex-col gap-4'>
            <div className='flex flex-col md:flex-row justify-between md:items-center gap-4'>
              <p>
                Delivery Address:{' '}
                <span className='font-bold'>
                  {defaultAddress ? defaultAddress : 'No Default Address Yet.'}
                </span>
              </p>
              <div className='flex justify-end'>
                {!curDelivery ? (
                  <button
                    className='text-neutral-700 hover:bg-neutral-700 hover:text-white px-4 py-2 rounded font-bold border border-neutral-700 transition-colors'
                    onClick={() => setVisibleModal('visibleListAddressModal')}
                  >
                    List Address
                  </button>
                ) : (
                  <button
                    className='w-max text-neutral-700 hover:bg-neutral-700 hover:text-white px-4 py-2 rounded font-bold border border-neutral-700 transition-colors'
                    onClick={() => setVisibleModal('visibleListAddressModal')}
                  >
                    Change Address
                  </button>
                )}
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <p htmlFor='phone'>Phone:</p>
              <p className='w-full font-bold'>{curDelivery?.phone}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <p>
                Province/City Fees:{' '}
                <span className='font-bold'>
                  {formatNumberWithDot(rateFromProvince || 0)}
                </span>
              </p>
              <p>
                Discount:{' '}
                <span className='font-bold'>
                  {voucher ? voucher?.discount : 0}%
                </span>
              </p>
              <p>
                Maximum discount:{' '}
                <span className='font-bold'>
                  {voucher ? formatNumberWithDot(voucher?.maxDiscount) : 0}
                </span>
              </p>
              <p>
                Discounted amount:{' '}
                <span className='font-bold'>
                  {formatNumberWithDot(discountAmount)}
                </span>
              </p>
              <div className='flex items-center gap-4'>
                <p>
                  Voucher code:{' '}
                  <span className='font-bold'>
                    {voucher ? voucher?.SKU : 'No voucher'}
                  </span>
                </p>
                {voucher && (
                  <button
                    className='font-bold text-violet-500'
                    onClick={() => {
                      setMessageCheckVoucher({ success: false, message: '' });
                      setVoucher(null);
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className='flex flex-col sm:flex-row justify-between gap-4'>
              <div className='flex gap-4'>
                <p className='py-2'>Voucher</p>
                <div className='flex flex-col gap-2'>
                  <input
                    className='w-full sm:max-w-[180px] border border-neutral-300 px-4 py-2 rounded'
                    type='text'
                    placeholder='Enter voucher...'
                    value={searchVoucher}
                    onChange={(e) => setSearchVoucher(e.target.value)}
                  />
                  {messageCheckVoucher.message && (
                    <p
                      className={`${
                        messageCheckVoucher.success
                          ? 'text-green-500'
                          : 'text-red-500'
                      } font-bold`}
                    >
                      {messageCheckVoucher.message}
                    </p>
                  )}
                </div>
              </div>
              <div className='flex justify-end'>
                <button
                  className='h-[42px] px-4 py-2 bg-neutral-700 text-white rounded'
                  onClick={handleCheckVoucher}
                  disabled={isLoadingVoucher}
                >
                  Check Voucher
                </button>
              </div>
            </div>
          </div>
          <div className='p-8 border border-neutral-300 rounded shadow-lg flex flex-col gap-4'>
            <div className='flex items-center gap-4 justify-between'>
              <p className='text-lg'>Payment Method</p>
              <div className='flex gap-4'>
                <button
                  className={`${
                    curPayment === 'vnpay'
                      ? 'bg-violet-500 text-white'
                      : 'border border-neutral-300'
                  } font-bold px-4 py-1 rounded`}
                  onClick={() => handleSelectedPayment('vnpay')}
                >
                  VNPAY
                </button>
                <button
                  className={`${
                    curPayment === 'cod'
                      ? 'bg-violet-500 text-white'
                      : 'border border-neutral-300'
                  } font-bold px-4 py-1 rounded`}
                  onClick={() => handleSelectedPayment('cod')}
                >
                  Cash on delivery
                </button>
              </div>
            </div>
            <div className='md:text-lg flex justify-between gap-4'>
              <p className='w-1/2 md:w-1/3'>Initial Amount:</p>
              <div className='w-1/2 md:w-2/3 flex justify-end'>
                <p className='font-bold text-lg md:text-xl'>
                  {formatNumberWithDot(totalPrice || 0)}
                </p>
              </div>
            </div>
            <div className='md:text-lg flex justify-between gap-4'>
              <p className='w-1/2 md:w-1/3'>Discounted:</p>
              <div className='w-1/2 md:w-2/3 flex justify-end'>
                <p className='font-bold text-lg md:text-xl'>-
                  {formatNumberWithDot(
                    discountAmount
                      ? discountAmount
                      : totalDiscountFromProduct || 0
                  )}
                </p>
              </div>
            </div>
            <div className='md:text-lg flex justify-between gap-4'>
              <p className='w-1/2 md:w-1/3 font-bold text-lg'>Total Price:</p>
              <div className='w-1/2 md:w-2/3 flex justify-end'>
                <p className='font-bold text-lg md:text-xl text-red-500'>
                  {formatNumberWithDot(
                    totalPrice -
                      discountAmount -
                      totalDiscountFromProduct +
                      rateFromProvince || 0
                  )}
                </p>
              </div>
            </div>
            <div className='my-4 flex justify-end'>
              <button
                className='bg-violet-500 text-white px-4 py-2 rounded font-bold text-lg'
                disabled={isLoadingPayment}
                onClick={handlePayment}
              >
                Place an order
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default CheckoutLayout;
