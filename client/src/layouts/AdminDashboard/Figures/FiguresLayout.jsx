import React, { useMemo } from 'react';
import { useGetFiguresQuery } from '../../../services/redux/query/users';
import StatsSquare from './components/StatsSquare';
import { TbShoppingCart, TbRefresh, TbTruck, TbCheck } from 'react-icons/tb';
import StatsBox from './components/StatsBox';
import TinyLineChart from './components/LineChart';
import PieChartData from './components/PieChart';
function FiguresLayout() {
  const { data: dataFigures, isSuccess: isSuccessDataFigures } =
    useGetFiguresQuery(null, {
      pollingInterval: Number(import.meta.env.VITE_DEFAULT_POLLING),
      refetchOnFocus: true,
    });
  const statsSquare = [
    {
      name: 'Today Orders',
      color: 'bg-green-400',
      number: isSuccessDataFigures && dataFigures?.todayOrders,
    },
    {
      name: 'Yesterday Orders',
      color: 'bg-yellow-500',
      number: isSuccessDataFigures && dataFigures?.yesterdayOrders,
    },
    {
      name: `This Month Orders`,
      color: 'bg-cyan-700',
      number: isSuccessDataFigures && dataFigures?.thisMonthOrders,
    },
    {
      name: `Last Month Orders`,
      color: 'bg-blue-700',
      number: isSuccessDataFigures && dataFigures?.lastMonthOrders,
    },
    {
      name: `All Time-Sales`,
      color: 'bg-green-500',
      number: isSuccessDataFigures && dataFigures?.allSalesTime,
    },
    {
      name: `Discounted`,
      color: 'bg-orange-400',
      number: isSuccessDataFigures && dataFigures?.allDiscount,
    },
  ];
  const statsBox = [
    {
      name: `Total Orders`,
      color: 'bg-orange-500',
      number: isSuccessDataFigures && dataFigures?.totalOrders,
      icon: <TbShoppingCart className='text-white' />,
    },
    {
      name: `Orders Pending`,
      color: 'bg-blue-500',
      number: isSuccessDataFigures && dataFigures?.pendingOrders,
      icon: <TbRefresh className='text-white' />,
    },
    {
      name: `Orders Processing`,
      color: 'bg-cyan-700',
      number: isSuccessDataFigures && dataFigures?.processingOrders,
      icon: <TbTruck className='text-white' />,
    },
    {
      name: `Orders Delivered`,
      color: 'bg-green-500',
      number: isSuccessDataFigures && dataFigures?.deliveredOrders,
      icon: <TbCheck className='text-white' />,
    },
  ];
  const renderedStatsSquare = useMemo(() => {
    return statsSquare.map((s) => {
      return (
        <StatsSquare
          key={s?.name}
          name={s?.name}
          color={s?.color}
          number={s?.number}
        />
      );
    });
  }, [statsSquare]);
  const renderedStatsBox = useMemo(() => {
    return statsBox.map((s) => {
      return (
        <StatsBox
          key={s?.name}
          name={s?.name}
          color={s?.color}
          number={s?.number}
          icon={s?.icon}
        />
      );
    });
  }, [statsBox]);
  return (
    <section className='col-span-1 lg:col-span-4 w-full flex flex-col gap-8 border border-neutral-300 p-4 sm:p-8 rounded-xl shadow-lg'>
      <div className='flex justify-between items-center gap-4'>
        <h1 className='text-xl sm:text-2xl font-bold'>Dashboard</h1>
      </div>
      <div className='w-full grid grid-cols-1 2xl:grid-cols-5 place-content-between place-items-center gap-2'>
        {renderedStatsSquare}
      </div>
      <div className='w-full grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4'>
        {renderedStatsBox}
      </div>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-4'>
          <h1 className='text-xl font-bold'>Weekly Orders</h1>
          {isSuccessDataFigures && (
            <TinyLineChart figures={dataFigures?.weeklyOrders} />
          )}
        </div>
        <div>
          <h1 className='text-xl font-bold'>Best Selling Products</h1>
          {isSuccessDataFigures && (
            <PieChartData data={dataFigures?.bestSellingProducts} />
          )}
        </div>
      </div>
    </section>
  );
}

export default FiguresLayout;
