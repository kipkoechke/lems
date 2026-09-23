"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./store";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Create QueryClient once to preserve cache and ensure invalidations/refetches work reliably
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            refetchOnWindowFocus: true,
            // Never retry a 4xx. A 401/403/404 is a settled answer, and with
            // refetchOnWindowFocus each retry multiplies: one forbidden call
            // turns into a dozen identical requests in the network log.
            retry: (failureCount, error) => {
              const status = (error as { response?: { status?: number } })
                ?.response?.status;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}
