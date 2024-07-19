import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../utils/token';
const end_point = import.meta.env.VITE_BACKEND_URL;
export const webApi = createApi({
  reducerPath: 'webApi',
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
  tagTypes: ['status_orders', 'categories', 'banners', 'country'],
  endpoints: (builder) => {
    return {
      getStatusOrders: builder.query({
        query: () => `status_orders`,
        providesTags: ['status_orders'],
      }),
      getProvinces: builder.query({
        query: () => `provinces/get_all`,
        providesTags: 'country',
      }),
      getDistricts: builder.query({
        query: (code) => `districts/getByProvince?provinceCode=${code}`,
      }),
      getWards: builder.query({
        query: (code) => `wards/getByDistrict?districtCode=${code}`,
      }),
      getAllRateProvince: builder.query({
        query: (search) => `provinces/get_rate?${search}`,
        providesTags: ['country'],
      }),
      changeRateProvince: builder.mutation({
        query: ({ id, rate }) => ({
          url: `provinces/${id}`,
          method: 'PUT',
          body: {
            rate: rate,
          },
        }),
        invalidatesTags: ['country'],
      }),
      getCategories: builder.query({
        query: () => 'categories',
        providesTags: ['categories'],
      }),
      postCategory: builder.mutation({
        query: (body) => ({
          url: 'categories',
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['categories'],
      }),
      updateCategory: builder.mutation({
        query: ({ id, body }) => ({
          url: `categories/${id}`,
          method: 'PUT',
          body: body,
        }),
        invalidatesTags: ['categories'],
      }),
      deleteCategory: builder.mutation({
        query: (id) => ({
          url: `categories/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['categories'],
      }),
      getBanners: builder.query({
        query: () => `banners`,
        providesTags: ['banners'],
      }),
      postBanner: builder.mutation({
        query: (body) => ({
          url: 'banners',
          method: 'POST',
          body: body,
        }),
        invalidatesTags: ['banners'],
      }),
      updateBanner: builder.mutation({
        query: ({ id, body }) => ({
          url: `banners/${id}`,
          method: 'PUT',
          body: body,
        }),
        invalidatesTags: ['banners'],
      }),
      deleteBanner: builder.mutation({
        query: (id) => ({
          url: `banners/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['banners'],
      }),
    };
  },
});
export const {
  useGetStatusOrdersQuery,
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetWardsQuery,
  useGetAllRateProvinceQuery,
  useChangeRateProvinceMutation,
  useGetCategoriesQuery,
  usePostCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetBannersQuery,
  usePostBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = webApi;
