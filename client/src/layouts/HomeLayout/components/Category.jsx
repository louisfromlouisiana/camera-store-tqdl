import React, { useContext, useState } from 'react';
import { FetchDataContext } from '../../../context/FetchDataProvider';
import { FaAnglesRight } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';

function Category() {
  const navigate = useNavigate();
  const { categories } = useContext(FetchDataContext);
  const [curCategory, setCurCategory] = useState(null);
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    speed: 500,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
    ],
    customPaging: (i) => (
      <div
        style={{
          margin: '16px 0',
          width: '12px',
          height: '12px',
          backgroundColor: '#ccc',
          borderRadius: '100%',
        }}
      ></div>
    ),
  };
  return (
    <section className='container m-auto flex flex-col items-center gap-8 md:gap-16 text-neutral-700 px-4'>
      <div className='flex flex-col items-center'>
        <p className='text-sm text-neutral-400'>WHAT WE OFFER</p>
        <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold'>
          Our Categories
        </h2>
      </div>
      <div className='w-full'>
        <Slider {...settings}>
          {categories?.map((c) => {
            return (
              <div
                key={c._id}
                className='relative px-8 w-full flex flex-col gap-4 cursor-pointer'
                onMouseEnter={() => setCurCategory(c._id)}
                onMouseLeave={() => setCurCategory(null)}
              >
                <div className='relative w-full max-h-[350px] md:max-h-[500px] h-full overflow-hidden'>
                  <img
                    className='h-[500px] w-full object-cover'
                    src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${
                      c?.image?.url
                    }`}
                    alt={c?.image?.name}
                    // {...{ fetchPriority: 'high' }}
                  />
                  <div
                    style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                    className={`absolute w-4/5 h-full py-8 text-neutral-100 left-0 top-0 z-10 p-4 flex flex-col justify-center items-center gap-4 overflow-hidden transition-all duration-300 ${
                      curCategory === c._id
                        ? 'translate-x-0'
                        : '-translate-x-[100%]'
                    }`}
                  >
                    <h3 className='text-2xl md:text-4xl font-bold'>
                      {c?.title}
                    </h3>
                    <p>{c?.content}</p>
                  </div>
                </div>
                <div
                  className={`absolute bottom-[10%] right-5 text-neutral-100 ${
                    curCategory === c._id
                      ? 'translate-x-0 opacity-100 z-50'
                      : 'translate-x-10 opacity-0 -z-50'
                  } transition-all duration-300`}
                >
                  <button
                    className='bg-violet-500 font-bold px-6 py-3 md:text-lg'
                    onClick={() => navigate(`/shop?page=1&category=${c?.name}`)}
                  >
                    <FaAnglesRight className='text-lg' />
                  </button>
                </div>
                <h3 className='my-4 capitalize text-xl md:text-2xl font-bold'>
                  {c?.name}
                </h3>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}

export default Category;
