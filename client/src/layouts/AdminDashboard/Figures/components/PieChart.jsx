import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white shadow-md p-2 rounded-md'>
        <p className='text-darkGray font-bold'>{payload[0].value}</p>
      </div>
    );
  }
};
const PieChartData = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill='white'
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline='central'
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  return (
    <div className='flex flex-col items-center'>
      <ResponsiveContainer height={328}>
        <PieChart>
          <Pie
            data={data}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={renderCustomizedLabel}
            // outerRadius={80}
            fill='#8884d8'
            dataKey='total'
          >
            {data?.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
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
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className='flex justify-center items-center gap-[40px]'>
        {data.map((entry, index) => {
          return (
            <div
              key={`legend-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '5px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: COLORS[index % COLORS.length],
                  marginRight: '5px',
                }}
              ></div>
              <span className='capitalize'>{entry._id[0]?.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PieChartData;
