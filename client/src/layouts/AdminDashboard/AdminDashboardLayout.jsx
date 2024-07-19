import React, { Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { getUser } from '../../services/redux/slice/userSlice';
import ChangePasswordModal from '../../components/modal/ChangePasswordModal';
const Aside = lazy(() => import('./Aside/Aside'));
function AdminDashboardLayout() {
  const user = useSelector(getUser);
  if (!user) {
    return <Navigate to='/' replace />;
  }
  if (user?.role?.value === 0) {
    return <Navigate to='/dashboard/users' replace />;
  }
  return (
    <Suspense>
      <div className='px-4 xl:px-16 py-8 grid grid-cols-1 xl:grid-cols-5 gap-8'>
        <ChangePasswordModal />
        <Aside />
        <Outlet />
      </div>
    </Suspense>
  );
}

export default AdminDashboardLayout;
