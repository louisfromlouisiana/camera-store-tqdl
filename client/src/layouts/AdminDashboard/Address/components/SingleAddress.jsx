import React from 'react';

function SingleAddress({ address }) {
  console.log(address);
  return (
    <tr>
      <td className='p-4 text-center'>{address?.user?.email}</td>
      <td className='p-4 text-center'>{address?.province?.name}</td>
      <td className='p-4 text-center'>{address?.district?.name}</td>
      <td className='p-4 text-center'>{address?.ward?.name}</td>
      <td className='p-4 text-center'>{address?.address}</td>
      <td className='p-4 text-center'>
        <p className='w-max m-auto px-4 text-sm border border-green-500 bg-green-50 text-green-500 rounded-3xl font-bold'>
          {address?.isDefault ? 'Default' : '-'}
        </p>
      </td>
      <td className='p-4 text-center'>-</td>
    </tr>
  );
}

export default SingleAddress;
