import React from 'react';

function NotFoundItem({ message }) {
  return (
    <section className='w-full h-full rounded-lg border border-neutral-300 overflow-x-auto p-8 flex flex-col items-center'>
      <p className='font-bold text-darkGray dark:text-gray'>{message}</p>
    </section>
  );
}

export default NotFoundItem;
