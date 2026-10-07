import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse, Service } from '@/types';
import { API_BASE_URL } from '@/config/api';

interface CreateServiceBody {
  name: string;
  description?: string;
}

interface UpdateServiceBody {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const servicesApi = createApi({
  reducerPath: 'servicesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      if (state.auth.token) headers.set('Authorization', `Bearer ${state.auth.token}`);
      return headers;
    },
  }),
  tagTypes: ['Service'],
  endpoints: (builder) => ({
    listServices: builder.query<ApiResponse<Service[]>, void>({
      query: () => '/services',
      providesTags: ['Service'],
    }),
    createService: builder.mutation<ApiResponse<Service>, CreateServiceBody>({
      query: (body) => ({ url: '/services', method: 'POST', body }),
      invalidatesTags: ['Service'],
    }),
    updateService: builder.mutation<ApiResponse<Service>, { id: string; body: UpdateServiceBody }>({
      query: ({ id, body }) => ({ url: `/services/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Service'],
    }),
    deleteService: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/services/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Service'],
    }),
  }),
});

export const {
  useListServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesApi;
