import React, { useContext } from 'react';
import { FetchDataContext } from '../../context/FetchDataProvider';
import { useNavigate } from 'react-router-dom';
import { scrollElement } from '../../services/utils/scrollElement';
function Footer() {
  const navigate = useNavigate();
  const { categories } = useContext(FetchDataContext);
  return (
    <footer className='px-8 py-8 md:py-16 bg-neutral-700 text-neutral-100'>
      <section className='m-auto container grid grid-cols-1 md:grid-cols-3 place-content-between gap-8'>
        <div className='flex flex-col gap-6'>
          <h4 className='text-lg font-bold'>Categories</h4>
          <ul className='flex flex-col gap-4 text-sm'>
            {categories?.map((c) => {
              return (
                <li key={c._id}>
                  <button
                    className='capitalize text-neutral-300 hover:text-violet-300 transition-colors'
                    onClick={() => {
                      scrollElement();
                      navigate(`/shop?page=1&category=${c.name}`);
                    }}
                  >
                    {c.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className='flex flex-col gap-6'>
          <h4 className='text-lg font-bold'>GET IN TOUCH</h4>
          <p className='text-neutral-300 text-sm'>
            Any questions? Let us know in store in Thu Duc City, HCMC.
          </p>
        </div>
        <div className='flex flex-col gap-6'>
          <h4 className='text-lg font-bold'>CONTACT</h4>
          <p className='text-neutral-300 text-sm'>
            Please contact us if you have any questions.
          </p>
          <button
            className='w-[180px] h-[48px] px-4 bg-violet-500 font-bold rounded-3xl hover:bg-white hover:text-violet-500 transition-colors'
            onClick={() => {
              scrollElement();
              navigate(`/contact`);
            }}
          >
            CONTACT
          </button>
        </div>
      </section>
    </footer>
  );
}

export default Footer;
