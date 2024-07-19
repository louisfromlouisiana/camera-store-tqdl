import React from 'react';
import { TbStack2 } from 'react-icons/tb';
import { formatNumberWithDot } from '../../../../services/utils/format';

const StatsSquare = ({ name, color, number }) => {
  return (
    <div
      className={`w-full ${color} rounded-lg flex flex-col justify-center items-center gap-2 h-[140px] text-white`}
    >
      <TbStack2 className='text-5xl' />
      <p className='text-lg'>{name}</p>
      <p className='text-xl font-bold'>{formatNumberWithDot(number)}</p>
    </div>
  );
};

export default StatsSquare;
