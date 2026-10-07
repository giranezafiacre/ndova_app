import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ApiResponse,
  Appointment,
  AppointmentStatusHistory,
  ProviderService
} from "@/types";
import { API_BASE_URL } from "@/config/api";

interface CreateAppointmentBody {
  serviceId: string;
  providerId?: string;
  providerServiceId?: string;
  requestedDate: string;
  requestedTime: string;
  reason?: string;
  sessionType?: "IN_PERSON" | "ONLINE";
}

export interface OccupiedAppointmentSlot {
  id: string;
  startTime: string;
  durationMinutes: number;
  status: "PENDING" | "APPROVED";
}

export const appointmentsApi = createApi({
  reducerPath: "appointmentsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      if (state.auth.token)
        headers.set("Authorization", `Bearer ${state.auth.token}`);
      return headers;
    },
  }),
  tagTypes: ["Appointment", "Availability"],
  endpoints: (builder) => ({
    listAppointments: builder.query<ApiResponse<Appointment[]>, void>({
      query: () => "/appointments",
      providesTags: ["Appointment"],
    }),
    getProvidersByService: builder.query<
      ApiResponse<ProviderService[]>,
      string
    >({
      query: (serviceId) => `/provider-services?serviceId=${serviceId}`,
    }),
    getProviderAvailability: builder.query<
      ApiResponse<OccupiedAppointmentSlot[]>,
      { providerServiceId: string; date: string }
    >({
      query: ({ providerServiceId, date }) => ({
        url: "/appointments/availability",
        params: { providerServiceId, date },
      }),
      providesTags: ["Availability"],
    }),
    getAppointment: builder.query<ApiResponse<Appointment>, string>({
      query: (id) => `/appointments/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Appointment", id }],
    }),
    getAppointmentHistory: builder.query<
      ApiResponse<AppointmentStatusHistory[]>,
      string
    >({
      query: (id) => `/appointments/${id}/history`,
    }),
    createAppointment: builder.mutation<
      ApiResponse<Appointment>,
      CreateAppointmentBody
    >({
      query: (body) => ({ url: "/appointments", method: "POST", body }),
      invalidatesTags: ["Appointment", "Availability"],
    }),
    approveAppointment: builder.mutation<
      ApiResponse<Appointment>,
      { id: string; adminNote?: string; providerId?: string }
    >({
      query: ({ id, adminNote, providerId }) => ({
        url: `/appointments/${id}/approve`,
        method: "PATCH",
        body: { adminNote, providerId },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Appointment",
        "Availability",
        { type: "Appointment", id },
      ],
    }),
    rejectAppointment: builder.mutation<
      ApiResponse<Appointment>,
      { id: string; adminNote?: string }
    >({
      query: ({ id, adminNote }) => ({
        url: `/appointments/${id}/reject`,
        method: "PATCH",
        body: { adminNote },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Appointment",
        "Availability",
        { type: "Appointment", id },
      ],
    }),
    cancelAppointment: builder.mutation<
      ApiResponse<Appointment>,
      { id: string; note?: string }
    >({
      query: ({ id, note }) => ({
        url: `/appointments/${id}/cancel`,
        method: "PATCH",
        body: { note },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Appointment",
        "Availability",
        { type: "Appointment", id },
      ],
    }),
    completeAppointment: builder.mutation<
      ApiResponse<Appointment>,
      { id: string; adminNote?: string }
    >({
      query: ({ id, adminNote }) => ({
        url: `/appointments/${id}/complete`,
        method: "PATCH",
        body: { adminNote },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Appointment",
        "Availability",
        { type: "Appointment", id },
      ],
    }),
  }),
});

export const {
  useListAppointmentsQuery,
  useGetProviderAvailabilityQuery,
  useGetAppointmentQuery,
  useGetAppointmentHistoryQuery,
  useCreateAppointmentMutation,
  useApproveAppointmentMutation,
  useRejectAppointmentMutation,
  useCancelAppointmentMutation,
  useCompleteAppointmentMutation,
  useGetProvidersByServiceQuery
} = appointmentsApi;
