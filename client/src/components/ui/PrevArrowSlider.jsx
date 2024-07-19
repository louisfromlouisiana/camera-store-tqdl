import { FaAngleRight } from 'react-icons/fa6';

function SamplePrevArrow(props) {
  const { onClick } = props;
  return (
    <button
      className='absolute top-1/2 right-5 -translate-y-1/2 z-50 border border-neutral-200 rounded text-neutral-200 hover:border-violet-500 hover:text-violet-500 transition-colors'
      onClick={onClick}
      aria-label='next-slide'
    >
      <FaAngleRight className='text-2xl md:text-4xl' />
    </button>
  );
}
export default SamplePrevArrow;
