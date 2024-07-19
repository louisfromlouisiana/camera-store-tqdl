import React from 'react';
const StatsBox = ({ name, color, number, icon }) => {
  return (
    <div className='rounded-lg bg-neutral-200 flex gap-4 h-full p-4'>
      <div
        className={`${color} w-[48px] h-[48px] rounded-full flex justify-center items-center text-2xl`}
      >
        {icon}
      </div>
      <div>
        <p>{name}</p>
        <p className='text-xl font-bold'>{number}</p>
      </div>
    </div>
  );
};

export default StatsBox;
