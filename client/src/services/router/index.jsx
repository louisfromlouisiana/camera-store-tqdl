import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import App from '../../App';
const ProtectedRoute = lazy(() => import('../../auth/ProtectedRoute'));
const VerifiedLayout = lazy(() =>
  import('../../layouts/VerifiedLayout/VerifiedLayout')
);
const HomeLayout = lazy(() => import('../../layouts/HomeLayout/HomeLayout'));
const AboutLayout = lazy(() => import('../../layouts/AboutLayout/AboutLayout'));
const ShopLayout = lazy(() => import('../../layouts/ShopLayout/ShopLayout'));
const ProductDetailsLayout = lazy(() =>
  import('../../layouts/ShopLayout/ProductDetails/ProductDetailsLayout')
);
const CompareLayout = lazy(() =>
  import('../../layouts/CompareLayout/CompareLayout')
);
const BlogLayout = lazy(() => import('../../layouts/BlogLayout/BlogLayout'));
const ContactLayout = lazy(() =>
  import('../../layouts/ContactLayout/ContactLayout')
);
const CheckoutLayout = lazy(() =>
  import('../../layouts/UsersLayout/CheckoutLayout')
);
const AdminDashboardLayout = lazy(() =>
  import('../../layouts/AdminDashboard/AdminDashboardLayout')
);
const FiguresLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Figures/FiguresLayout')
);
const BannersLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Banners/BannersLayout')
);
const CategoryLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Category/CategoryLayout')
);
const FeesLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Fees/FeesLayout')
);
const ProductsLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Products/ProductsLayout')
);
const MessagesLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Messages/MessagesLayout')
);
const VoucherLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Voucher/VoucherLayout')
);
const CouponsLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Coupons/CouponsLayout')
);
const ListUsersLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Users/ListUserLayout')
);
const ListUserAddressLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Address/ListUserAddressLayout')
);
const EmailLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Email/EmailLayout')
);
const EmailDetailsLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Email/EmailDetails/EmailDetailsLayout')
);
const AdminOrdersLayout = lazy(() =>
  import('../../layouts/AdminDashboard/Orders/AdminOrdersLayout')
);
const AdminOrderDetailsLayout = lazy(() =>
  import(
    '../../layouts/AdminDashboard/Orders/OrderDetails/AdminOrderDetailsLayout'
  )
);
const UserDashboardLayout = lazy(() =>
  import('../../layouts/UserDashboard/UserDashboardLayout')
);
const DashboardLayout = lazy(() =>
  import('../../layouts/UserDashboard/Dashboard/DashboardLayout')
);
const UserOrdersLayout = lazy(() =>
  import('../../layouts/UserDashboard/Orders/UserOrdersLayout')
);
const UserOrderDetailsLayout = lazy(() =>
  import(
    '../../layouts/UserDashboard/Orders/OrderDetails/UserOrderDetailsLayout'
  )
);
const UserAddressLayout = lazy(() =>
  import('../../layouts/UserDashboard/Address/UserAddressLayout')
);
const VnpayReturnLayout = lazy(() =>
  import('../../layouts/UsersLayout/VnpayReturnLayout')
);
const SuccessLayout = lazy(() =>
  import('../../layouts/UsersLayout/SuccessLayout')
);
const CancelLayout = lazy(() =>
  import('../../layouts/UsersLayout/CancelLayout')
);
const LoginLayout = lazy(() => import('../../layouts/LoginLayout/LoginLayout'));

const RegisterLayout = lazy(() =>
  import('../../layouts/RegisterLayout/RegisterLayout')
);
const ForgotPasswordLayout = lazy(() =>
  import('../../layouts/ForgotPassword/ForgotPasswordLayout')
);
const NotFoundLayout = lazy(() =>
  import('../../layouts/NotFoundLayout/NotFoundLayout')
);
const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomeLayout />,
      },
      {
        path: 'verified',
        element: <VerifiedLayout />,
      },
      {
        path: 'about',
        element: <AboutLayout />,
      },
      {
        path: 'shop',
        children: [
          {
            index: true,
            element: <ShopLayout />,
          },
          {
            path: ':id',
            element: <ProductDetailsLayout />,
          },
        ],
      },
      {
        path: 'compare',
        element: <CompareLayout />,
      },
      { path: 'blog', element: <BlogLayout /> },
      { path: 'contact', element: <ContactLayout /> },
      {
        path: 'checkout',
        element: <CheckoutLayout />,
      },
      {
        path: 'dashboard/admin',
        element: (
          <ProtectedRoute>
            <AdminDashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <FiguresLayout />,
          },
          {
            path: 'figures',
            element: <FiguresLayout />,
          },
          {
            path: 'banners',
            element: <BannersLayout />,
          },
          {
            path: 'categories',
            element: <CategoryLayout />,
          },
          {
            path: 'fees',
            element: <FeesLayout />,
          },
          {
            path: 'products',
            element: <ProductsLayout />,
          },
          {
            path: 'vouchers',
            element: <VoucherLayout />,
          },
          {
            path: 'coupons',
            element: <CouponsLayout />,
          },
          {
            path: 'messages',
            element: <MessagesLayout />,
          },
          {
            path: 'users',
            element: <ListUsersLayout />,
          },
          {
            path: 'address',
            element: <ListUserAddressLayout />,
          },
          {
            path: 'email',
            children: [
              {
                index: true,
                element: <EmailLayout />,
              },
              {
                path: ':id',
                element: <EmailDetailsLayout />,
              },
            ],
          },
          {
            path: 'orders',
            children: [
              {
                index: true,
                element: <AdminOrdersLayout />,
              },
              {
                path: ':id',
                element: <AdminOrderDetailsLayout />,
              },
            ],
          },
        ],
      },
      {
        path: 'dashboard/users',
        element: (
          <ProtectedRoute>
            <UserDashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardLayout />,
          },
          {
            path: 'orders',
            children: [
              {
                index: true,
                element: <UserOrdersLayout />,
              },
              {
                path: ':id',
                element: <UserOrderDetailsLayout />,
              },
            ],
          },
          {
            path: 'address',
            element: <UserAddressLayout />,
          },
        ],
      },
      {
        path: 'success',
        element: (
          <ProtectedRoute>
            <SuccessLayout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'vnpay_return',
        element: (
          <ProtectedRoute>
            <VnpayReturnLayout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cancel',
        element: (
          <ProtectedRoute>
            <CancelLayout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <LoginLayout />,
      },
      {
        path: 'register',
        element: <RegisterLayout />,
      },
      {
        path: 'forgot_password',
        element: <ForgotPasswordLayout />,
      },
      {
        path: '*',
        element: <NotFoundLayout />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes, {
  basename: '/',
  future: {
    v7_normalizeFormMethod: true,
  },
});
