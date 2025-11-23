import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async headers() {
        // Get Supabase session from localStorage
        try {
          const supabaseAuthKey = Object.keys(localStorage).find(key =>
            key.startsWith('sb-') && key.endsWith('-auth-token')
          );

          console.log('[tRPC] Supabase auth key:', supabaseAuthKey);

          if (supabaseAuthKey) {
            const authDataStr = localStorage.getItem(supabaseAuthKey);
            console.log('[tRPC] Auth data string:', authDataStr?.substring(0, 100));

            if (authDataStr) {
              const authData = JSON.parse(authDataStr);
              const accessToken = authData?.access_token;

              console.log('[tRPC] Access token found:', !!accessToken);

              if (accessToken) {
                console.log('[tRPC] Sending Authorization header');
                return {
                  Authorization: `Bearer ${accessToken}`,
                };
              }
            }
          }
        } catch (error) {
          console.error('[tRPC] Error getting Supabase token:', error);
        }

        console.log('[tRPC] No token found, sending empty headers');
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
