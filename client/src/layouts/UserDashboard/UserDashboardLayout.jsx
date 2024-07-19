import React, { Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { getUser } from '../../services/redux/slice/userSlice';
import { Navigate, Outlet } from 'react-router-dom';
const Aside = lazy(() => import('./Aside/Aside'));

function UserDashboardLayout() {
  const user = useSelector(getUser);
  if (!user) return <Navigate to='/' replace />;

  if (user && !user.isVerified) return <Navigate to='/verified' replace />;
  if (user?.role?.value === 1)
    return <Navigate to='/dashboard/admin' replace />;

  return (
    <Suspense>
      <div className='px-4 lg:px-16 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8'>
        <Aside />
        <Outlet />
      </div>
    </Suspense>
  );
}

export default UserDashboardLayout;
