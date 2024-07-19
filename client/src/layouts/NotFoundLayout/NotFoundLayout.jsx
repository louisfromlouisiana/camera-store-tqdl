import React from 'react';
import imgNotFound from '../../assets/permissions_dark_mode.svg';
import { useNavigate } from 'react-router-dom';
function NotFoundLayout() {
  const navigate = useNavigate();
  return (
    <section className='m-auto py-32 w-full h-full flex justify-center items-center'>
      <div className='m-auto p-4 w-full sm:w-1/2 lg:w-1/3 flex flex-col justify-center items-center gap-4'>
        <div className='size-[150px]'>
          <img
            className='w-full h-full object-cover'
            src={imgNotFound}
            alt='notfound-img'
            {...{ fetchPriority: 'high' }}
          />
        </div>
        <h1 className='text-center font-bold text-lg sm:text-xl'>
          This content isn't available right now
        </h1>
        <p className='text-center'>
          When this happens, it's usually because the owner only shared it with
          a small group of people, changed who can see it or it's been deleted.
        </p>
        <button
          className='px-4 py-2 rounded bg-violet-500 text-neutral-100 font-bold'
          onClick={() => navigate('/', { replace: true })}
        >
          Go Home
        </button>
      </div>
    </section>
  );
}

export default NotFoundLayout;
