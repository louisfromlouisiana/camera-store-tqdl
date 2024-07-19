import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
const CustomTooltip = ({ active, payload, label }) => {
  console.log(active, payload);
  if (active && payload && payload.length) {
    return (
      <div className='shadow-md p-2 rounded-md'>
        <p className='font-bold'>
          {label} : {payload[0].value}
        </p>
      </div>
    );
  }

  return null;
};
const TinyLineChart = ({ figures }) => {
  return (
    <div className='w-full text-[12px]'>
      <ResponsiveContainer height={328} width={'100%'}>
        <LineChart data={figures} className='cursor-pointer'>
          <Line
            type='linear'
            dataKey='totalOrders'
            stroke='#8884d8'
            strokeWidth={3}
          />
          <CartesianGrid opacity={0.5} />
          <Tooltip
            content={CustomTooltip}
            contentStyle={{
              width: 'max-content',
              height: '42px',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              borderRadius: '4px',
              gap: '10px',
            }}
          />
          <XAxis dataKey='_id' />
          <YAxis
            dataKey='totalOrders'
            tickFormatter={(tick) => String(Math.floor(tick))}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TinyLineChart;
