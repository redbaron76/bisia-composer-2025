import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

// import Header from "../components/Header";
import type { QueryClient } from "@tanstack/react-query";
import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "../components/ui/sonner";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      {/* <Header /> */}

      <Outlet />
      <TanStackRouterDevtools />

      <TanStackQueryLayout />
      <Toaster />
    </>
  ),
});
