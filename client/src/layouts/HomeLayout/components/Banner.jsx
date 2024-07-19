import React from 'react';
import { useGetBannersQuery } from '../../../services/redux/query/webInfo';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import SampleNextArrow from '../../../components/ui/NextArrowSlider';
import SamplePrevArrow from '../../../components/ui/PrevArrowSlider';
function Banner() {
  const navigate = useNavigate();
  const settings = {
    // dots: true,
    infinite: true,
    arrows: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };
  const { data: bannersData, isSuccess: isSuccessBanners } =
    useGetBannersQuery();
  return (
    isSuccessBanners &&
    bannersData?.banners && (
      <section>
        <Slider {...settings}>
          {bannersData?.banners.map((b) => {
            return (
              <div
                key={b._id}
                // style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                className='relative h-[50vh] sm:h-[80vh] lg:h-[100vh] text-neutral-100 text-sm md:text-base'
              >
                <img
                  className='absolute top-0 left-0 w-full h-full object-cover -z-10'
                  src={`${import.meta.env.VITE_PUBLIC_IMAGE}/${b?.image?.url}`}
                  alt={b?.image?.name}
                  // {...{ fetchPriority: 'high' }}
                />
                <div
                  style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                  className='w-full h-full flex flex-col justify-center items-center gap-6'
                >
                  <h1 className='text-2xl md:text-4xl lg:text-6xl font-bold'>
                    {b?.title}
                  </h1>
                  <p>{b?.content}</p>
                  <button
                    className='bg-violet-500 font-bold px-6 py-3 rounded md:text-lg hover:opacity-100 opacity-80 transition-opacity'
                    onClick={() =>
                      navigate(`/shop?page=1&category=${b?.category?.name}`)
                    }
                  >
                    Start Now
                  </button>
                </div>
              </div>
            );
          })}
        </Slider>
      </section>
    )
  );
}

export default Banner;
