import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../utils/token';
const end_point = import.meta.env.VITE_BACKEND_URL;
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${end_point}`,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'users',
    'favorite',
    'cart',
    'address',
    'orders',
    'list_users',
    'list_address',
    'email_users',
  ],
  endpoints: (builder) => {
    return {
      getUser: builder.query({
        query: () => 'get_user',
        providesTags: ['users'],
      }),
      signInUser: builder.mutation({
        query: (body) => ({
          url: 'sign_in',
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['users'],
      }),
      signUpUser: builder.mutation({
        query: (body) => ({
          url: 'sign_up',
          method: 'POST',
          body: body,
        }),
      }),
      signOutUser: builder.mutation({
        query: (token) => ({
          url: 'sign_out',
          method: 'POST',
          body: token,
        }),
      }),
      verifiedAccount: builder.mutation({
        query: (code) => ({
          url: 'verified',
          method: 'POST',
          body: {
            code: code,
          },
        }),
        invalidatesTags: ['users'],
      }),
      resendCode: builder.mutation({
        query: () => ({
          url: 'resend_code',
          method: 'POST',
        }),
      }),
      forgotPassword: builder.mutation({
        query: (email) => ({
          url: `forgot_password`,
          method: 'POST',
          body: { email: email },
        }),
      }),
      changePassword: builder.mutation({
        query: (body) => ({
          url: 'change_password',
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['users'],
      }),
      updateUser: builder.mutation({
        query: ({ id, body }) => ({
          url: `users/${id}`,
          method: 'PUT',
          body: body,
        }),
        invalidatesTags: ['users'],
      }),
      getAllFavorite: builder.query({
        query: () => `favorite`,
        providesTags: ['favorite'],
      }),
      postFavorite: builder.mutation({
        query: (productId) => ({
          url: 'favorite',
          method: 'POST',
          body: {
            productId: productId,
          },
        }),
        invalidatesTags: ['favorite'],
      }),
      getAllCart: builder.query({
        query: () => `cart`,
        providesTags: ['cart'],
      }),
      postCart: builder.mutation({
        query: (body) => ({
          url: 'cart',
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['cart'],
      }),
      deleteCart: builder.mutation({
        query: ({ id, productId }) => ({
          url: `cart/${id}`,
          method: 'DELETE',
          body: {
            productId: productId,
          },
        }),
        invalidatesTags: ['cart'],
      }),
      getDefaultAddress: builder.query({
        query: () => 'users_address/default_address',
        providesTags: ['address'],
      }),
      getAllAddress: builder.query({
        query: () => 'users_address',
        providesTags: ['address'],
      }),
      postAddress: builder.mutation({
        query: (body) => ({
          url: 'users_address',
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['address'],
      }),
      updateAddress: builder.mutation({
        query: ({ id, body }) => ({
          url: `users_address/${id}`,
          method: 'PUT',
          body: body,
        }),
        invalidatesTags: ['address'],
      }),
      deleteAddress: builder.mutation({
        query: (id) => ({
          url: `users_address/${id}`,
          method: 'DELETe',
        }),
        invalidatesTags: ['address'],
      }),
      getOrdersByUser: builder.query({
        query: (search) => `users/orders?${search}`,
        providesTags: ['orders'],
      }),
      getOderDetails: builder.query({
        query: (orderId) => `orders/${orderId}`,
        providesTags: ['orders'],
      }),
      updateOrderByUser: builder.mutation({
        query: ({ orderId, status, isPaid }) => ({
          url: `users/orders/${orderId}`,
          method: 'PUT',
          body: {
            status: status,
            isPaid: isPaid,
          },
        }),
        invalidatesTags: ['orders'],
      }),
      checkOrders: builder.query({
        query: (search) => `vnpay/querydr?${search}`,
      }),
      getOrdersByAdmin: builder.query({
        query: (search) => `admin/orders?${search}`,
        providesTags: ['orders'],
      }),
      updateOrderByAdmin: builder.mutation({
        query: ({ orderId, status, userId, paymentMethod }) => ({
          url: `admin/orders/${orderId}`,
          method: 'PUT',
          body: {
            status: status,
            userId: userId,
            paymentMethod: paymentMethod,
          },
        }),
        invalidatesTags: ['orders'],
      }),
      getListUsers: builder.query({
        query: (search) => `users/get_by_admin?${search}`,
        providesTags: ['list_users'],
      }),
      getListUserAddress: builder.query({
        query: () => `users_address/get_from_admin`,
        providesTags: ['list_address'],
      }),
      postReviews: builder.mutation({
        query: (body) => ({
          url: `reviews`,
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['orders'],
      }),
      getFigures: builder.query({
        query: () => `figures`,
        providesTags: ['orders'],
      }),
      getUserEmails: builder.query({
        query: (search) => `email?${search}`,
        providesTags: ['email_users'],
      }),
      getUserEmailDetails: builder.query({
        query: (id) => `email/${id}`,
        providesTags: ['email_users'],
      }),
      postUserEmail: builder.mutation({
        query: (body) => ({
          url: 'email',
          method: 'POST',
          body: body,
        }),
      }),
      replyEmail: builder.mutation({
        query: (body) => ({
          url: `reply_email`,
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['email_users'],
      }),
      banUser: builder.mutation({
        query: (id) => ({
          url: `users/ban/${id}`,
          method: 'POST',
        }),
        invalidatesTags: ['list_users'],
      }),
      disBanUser: builder.mutation({
        query: (id) => ({
          url: `users/dis_ban/${id}`,
          method: 'POST',
        }),
        invalidatesTags: ['list_users'],
      }),
      getUserChat: builder.query({
        query: () => ({
          url: `users/chat`,
          method: 'GET',
        }),
      }),
      getNewestChatFromAdmin: builder.query({
        query: (search) =>
          search ? `chat_list/newest${search}` : 'chat_list/newest',
      }),
      getChatDetailsFromAdmin: builder.query({
        query: (sender) => `chat/${sender}`,
      }),
      deleteChat: builder.mutation({
        query: (sender) => ({
          url: `chat/${sender}`,
          method: 'DELETE',
        }),
      }),
    };
  },
});

export const {
  useGetUserQuery,
  useSignInUserMutation,
  useSignUpUserMutation,
  useSignOutUserMutation,
  useVerifiedAccountMutation,
  useResendCodeMutation,
  useForgotPasswordMutation,
  useChangePasswordMutation,
  useUpdateUserMutation,
  useGetAllFavoriteQuery,
  usePostFavoriteMutation,
  useGetAllCartQuery,
  usePostCartMutation,
  useDeleteCartMutation,
  useGetDefaultAddressQuery,
  useGetAllAddressQuery,
  usePostAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useGetOrdersByUserQuery,
  useGetOderDetailsQuery,
  useCheckOrdersQuery,
  useUpdateOrderByUserMutation,
  useGetOrdersByAdminQuery,
  useUpdateOrderByAdminMutation,
  useGetListUsersQuery,
  useGetListUserAddressQuery,
  usePostReviewsMutation,
  useGetFiguresQuery,
  useGetUserEmailsQuery,
  useGetUserEmailDetailsQuery,
  usePostUserEmailMutation,
  useReplyEmailMutation,
  useBanUserMutation,
  useDisBanUserMutation,
  useGetUserChatQuery,
  useGetNewestChatFromAdminQuery,
  useGetChatDetailsFromAdminQuery,
  useDeleteChatMutation,
} = userApi;
