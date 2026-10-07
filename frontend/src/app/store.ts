import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import { authApi } from "@/features/auth/authApi";
import { dashboardApi } from "@/features/dashboard/dashboardApi";
import { servicesApi } from "@/features/services/servicesApi";
import { appointmentsApi } from "@/features/appointments/appointmentsApi";
import { usersApi } from "@/features/users/usersApi";
import { providerServicesApi } from "@/features/provider-services/providerServicesApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
    [appointmentsApi.reducerPath]: appointmentsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [providerServicesApi.reducerPath]: providerServicesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(dashboardApi.middleware)
      .concat(servicesApi.middleware)
      .concat(appointmentsApi.middleware)
      .concat(usersApi.middleware)
      .concat(providerServicesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
