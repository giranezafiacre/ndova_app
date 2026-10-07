import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ApiResponse, User } from '@/types';
import { API_BASE_URL } from '@/config/api';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      if (state.auth.token) headers.set('Authorization', `Bearer ${state.auth.token}`);
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    listUsers: builder.query<ApiResponse<User[]>, void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation<ApiResponse<User>, { id: string; body: { firstName?: string; lastName?: string; phone?: string } }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => ['User', { type: 'User', id }],
    }),
    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    assignRole: builder.mutation<ApiResponse<User>, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}/roles`,
        method: 'POST',
        body: { roleId },
      }),
      invalidatesTags: (_r, _e, { userId }) => [{ type: 'User', id: userId }],
    }),
    removeRole: builder.mutation<ApiResponse<User>, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { userId }) => [{ type: 'User', id: userId }],
    }),
  }),
});

export const {
  useListUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useAssignRoleMutation,
  useRemoveRoleMutation,
} = usersApi;
