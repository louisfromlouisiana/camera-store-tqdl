import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../utils/token';
const end_point = import.meta.env.VITE_BACKEND_URL;
export const productApi = createApi({
  reducerPath: 'productApi',
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
    'products',
    'product_details',
    'specifications',
    'vouchers',
    'coupons',
  ],
  endpoints: (builder) => {
    return {
      getProducts: builder.query({
        query: (search) => `products?${search}`,
        providesTags: ['products'],
      }),
      getProductDetails: builder.query({
        query: (id) => `products/${id}`,
        providesTags: ['product_details'],
      }),
      postProduct: builder.mutation({
        query: (body) => ({
          url: 'products',
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['products'],
      }),
      updateProduct: builder.mutation({
        query: ({ id, body }) => ({
          url: `products/${id}`,
          method: 'PUT',
          body: body,
        }),
        invalidatesTags: ['products', 'product_details'],
      }),
      deleteProduct: builder.mutation({
        query: (id) => ({
          url: `products/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['products', 'product_details'],
      }),
      getSpecifications: builder.query({
        query: (search) => `specifications?${search}`,
        providesTags: ['specifications'],
      }),
      checkSpecification: builder.mutation({
        query: (sku) => ({
          url: `specifications/${sku}`,
          method: 'POSt',
        }),
      }),
      postSpecification: builder.mutation({
        query: (body) => ({
          url: 'specifications',
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['specifications'],
      }),
      updateSpecification: builder.mutation({
        query: ({ id, body }) => ({
          url: `specifications/${id}`,
          method: 'PUT',
          body: body,
        }),
        invalidatesTags: ['specifications'],
      }),
      deleteSpecification: builder.mutation({
        query: (id) => ({
          url: `specifications/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['specifications'],
      }),
      checkVoucher: builder.mutation({
        query: (body) => ({
          url: `vouchers/check_voucher`,
          method: 'POST',
          body: body,
        }),
      }),
      getVouchers: builder.query({
        query: (search) => `vouchers?${search}`,
        providesTags: ['vouchers'],
      }),
      postVoucher: builder.mutation({
        query: (body) => ({
          url: 'vouchers',
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['vouchers'],
      }),
      getCoupons: builder.query({
        query: (search) => `coupons?${search}`,
        providesTags: ['coupons'],
      }),
      createCoupon: builder.mutation({
        query: (body) => ({
          url: 'coupons',
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['coupons'],
      }),
      deleteCoupon: builder.mutation({
        query: (id) => ({
          url: `coupons/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['coupons'],
      }),
      updateVoucher: builder.mutation({
        query: ({ sku, body }) => ({
          url: `vouchers/${sku}`,
          method: 'PUT',
          body: body,
        }),
        invalidatesTags: ['vouchers'],
      }),
      deleteVoucher: builder.mutation({
        query: (sku) => ({
          url: `vouchers/${sku}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['vouchers'],
      }),
      createPayment: builder.mutation({
        query: ({ type, body }) => ({
          url: `create_payment/${type}`,
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['products'],
      }),
      getReviewsProduct: builder.query({
        query: (productId) => `reviews/${productId}`,
      }),
    };
  },
});
export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  usePostProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetSpecificationsQuery,
  useCheckSpecificationMutation,
  usePostSpecificationMutation,
  useUpdateSpecificationMutation,
  useDeleteSpecificationMutation,
  useCheckVoucherMutation,
  useGetVouchersQuery,
  usePostVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useCreatePaymentMutation,
  useGetReviewsProductQuery,
} = productApi;
