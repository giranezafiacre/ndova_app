import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, ProviderService } from "@/types";
import { API_BASE_URL } from "@/config/api";

export interface CreateProviderServiceBody {
  serviceId: string;
  location: string;
  description: string;
  durationMinutes: number;
  imageUrl?: string;
  meetingLink?: string;
}

export type UpdateProviderServiceBody = Omit<
  CreateProviderServiceBody,
  "serviceId"
>;

export const providerServicesApi = createApi({
  reducerPath: "providerServicesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      if (state.auth.token) {
        headers.set("Authorization", `Bearer ${state.auth.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ProviderService"],
  endpoints: (builder) => ({
    listProviderServices: builder.query<ApiResponse<ProviderService[]>, void>({
      query: () => "/provider-services",
      providesTags: ["ProviderService"],
    }),
    getProviderService: builder.query<
    ApiResponse<ProviderService[]>, 
    string
    >({
      query: (id) => `/provider-services/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "ProviderService", id },
      ],
    }),
    listMyProviderServices: builder.query<
      ApiResponse<ProviderService[]>,
      void
    >({
      query: () => "/provider-services/mine",
      providesTags: ["ProviderService"],
    }),
    createProviderService: builder.mutation<
      ApiResponse<ProviderService>,
      CreateProviderServiceBody
    >({
      query: (body) => ({
        url: "/provider-services",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ProviderService"],
    }),
    updateProviderService: builder.mutation<
      ApiResponse<ProviderService>,
      { id: string; body: UpdateProviderServiceBody }
    >({
      query: ({ id, body }) => ({
        url: `/provider-services/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "ProviderService",
        { type: "ProviderService", id },
      ],
    }),
    deleteProviderService: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/provider-services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProviderService"],
    }),
  }),
});

export const {
  useListProviderServicesQuery,
  useGetProviderServiceQuery,
  useListMyProviderServicesQuery,
  useCreateProviderServiceMutation,
  useUpdateProviderServiceMutation,
  useDeleteProviderServiceMutation,
} = providerServicesApi;
