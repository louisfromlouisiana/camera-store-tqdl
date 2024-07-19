import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  formatDate,
  formatNumberWithDot,
} from '../../../../../services/utils/format';
import { FaPrint, FaXmark } from 'react-icons/fa6';

function Invoice({ order, closeForm }) {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Order-${order?.paymentInfo?.orderCode}`,
  });
  return (
    <section
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      className='fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center'
    >
      <div className='max-w-screen-lg md:min-w-[650px] mx-auto bg-white p-8 flex flex-col gap-4'>
        <button className='text-2xl w-max ml-auto' onClick={closeForm}>
          <FaXmark />
        </button>
        <div
          ref={componentRef}
          class='rounded h-full flex flex-col gap-4 border border-neutral-300 p-8'
        >
          <div class='flex justify-between pb-4 border-b'>
            <div className='flex flex-col gap-4'>
              <h2 class='text-2xl font-bold'>
                {import.meta.env.VITE_SHOP_NAME}
              </h2>
              <div>
                <p>Address: THU DUC, HCMC</p>
                <p>Phone: {import.meta.env.VITE_SHOP_PHONE}</p>
                <p>Email: linhquyen20110@gmail.com</p>
              </div>
            </div>
            <div class='text-right flex flex-col gap-4'>
              <h2 class='text-2xl font-bold'>INVOICE</h2>
              <div>
                <p>
                  INVOICE CODE:{' '}
                  <span className='font-semibold'>
                    {order?.paymentInfo?.orderCode}
                  </span>
                </p>
                <p>
                  INVOICE DATE:{' '}
                  <span className='font-semibold'>
                    {formatDate(order?.created_at)}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class='mb-4'>
            <h3 class='text-lg font-semibold'>Customer Information</h3>
            <p>Email: {order?.user?.email}</p>
            <p>Address: {order?.address}</p>
            <p>Phone: {order?.phone}</p>
            <p>Message: {order?.message}</p>
          </div>
          <div className='flex flex-col gap-4'>
            <h3 class='text-lg font-semibold mb-2'>Order details</h3>
            <table class='w-full border-collapse'>
              <thead>
                <tr>
                  <th class='border p-2 bg-gray-100'>Product</th>
                  <th class='border p-2 bg-gray-100'>Quantity</th>
                  <th class='border p-2 bg-gray-100'>Price</th>
                  <th class='border p-2 bg-gray-100'>Total</th>
                </tr>
              </thead>
              <tbody>
                {order?.products?.map((p) => {
                  return (
                    <tr key={p._id}>
                      <td class='border p-2 text-center truncate max-w-[180px] md:max-w-full'>
                        {p?.product?.name}
                      </td>
                      <td class='border p-2 text-center'>
                        {p?.quantity}
                      </td>
                      <td class='border p-2 text-center'>
                        {formatNumberWithDot(p?.product?.price)}
                      </td>
                      <td class='border p-2 text-center'>
                        {formatNumberWithDot(
                          Number(p?.quantity) *
                            Number(p?.product?.price)
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div class='text-right flex flex-col gap-1'>
            <h3 class='text-lg font-bold'>
              Shipping Fee: {formatNumberWithDot(order?.rateFromProvince)}
            </h3>
            <h3 class='text-lg font-bold'>
              Discount: {formatNumberWithDot(order?.discount)}
            </h3>
            <h3 class='text-2xl font-bold'>
              Total Price: {formatNumberWithDot(order?.totalPrice)}
            </h3>
          </div>
        </div>
        <button
          className='w-max ml-auto px-4 py-2 flex items-center gap-2 bg-violet-500 text-white rounded'
          onClick={handlePrint}
        >
          <FaPrint />
          <p>Print invoice</p>
        </button>
      </div>
    </section>
  );
}

export default Invoice;
