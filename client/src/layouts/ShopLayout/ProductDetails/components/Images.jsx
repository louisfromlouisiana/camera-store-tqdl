import React from 'react';
import SampleNextArrow from '../../../../components/ui/NextArrowSlider';
import SamplePrevArrow from '../../../../components/ui/PrevArrowSlider';
import Slider from 'react-slick';
function Images({ images }) {
  const settings = {
    customPaging: function (i) {
      return (
        <div className='w-full h-full border border-neutral-300 cursor-pointer'>
          <img
            className='w-full h-full object-cover'
            src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${images[i].url}`}
            alt={images[i].name}
            {...{ fetchPriority: 'low' }}
          />
        </div>
      );
    },
    dots: true,
    dotsClass: 'slick-dots slick-thumb',
    infinite: true,
    arrows: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };
  return (
    <div className='relative'>
      {images?.length > 1 ? (
        <Slider {...settings} className='col-span-5'>
          {images?.map((img) => {
            return (
              <div
                className='mb-[72px] w-full h-[620px] border border-neutral-300'
                key={img.name}
              >
                <img
                  className='w-full h-full object-cover'
                  src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${img.url}`}
                  alt={img.name}
                  {...{ fetchPriority: 'low' }}
                />
              </div>
            );
          })}
        </Slider>
      ) : (
        <div className='w-full h-[620px]' key={images[0]?.name}>
          <img
            className='w-full h-full object-cover'
            src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${images[0]?.url}`}
            alt={images[0]?.name}
            {...{ fetchPriority: 'low' }}
          />
        </div>
      )}
    </div>
  );
}

export default Images;
