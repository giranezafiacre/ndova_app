import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse, ClientDashboard, ProviderDashboard, AdminDashboard } from '@/types';
import { API_BASE_URL } from '@/config/api';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      if (state.auth.token) headers.set('Authorization', `Bearer ${state.auth.token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getClientDashboard: builder.query<ApiResponse<ClientDashboard>, void>({
      query: () => '/dashboard/client',
    }),
    getProviderDashboard: builder.query<ApiResponse<ProviderDashboard>, void>({
      query: () => '/dashboard/provider',
    }),
    getAdminDashboard: builder.query<ApiResponse<AdminDashboard>, void>({
      query: () => '/dashboard/admin',
    }),
  }),
});

export const {
  useGetClientDashboardQuery,
  useGetProviderDashboardQuery,
  useGetAdminDashboardQuery,
} = dashboardApi;
