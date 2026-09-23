"use client";

import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { InputField } from "../common/InputField";
import Button from "../common/Button";
import { loginSchema, LoginFormData } from "../../lib/validations";
import { useLogin } from "../../hooks/useAuth";
import Link from "next/link";

export const LoginForm = () => {
  const router = useRouter();
  const loginMutation = useLogin();

  /**
   * Where to land after signing in.
   *
   * Read from the URL directly rather than through useSearchParams: that hook
   * opts the whole form into a Suspense bailout, so the page painted a grey
   * placeholder before the email and password fields appeared — a loading
   * state for a form that loads nothing.
   *
   * "/" is a server component that only redirects to /dashboard, so going
   * through it costs a round trip before the first paint.
   */
  const getRedirectUrl = useCallback(() => {
    if (typeof window === "undefined") return "/dashboard";
    const requested = new URLSearchParams(window.location.search).get(
      "redirect",
    );
    return !requested || requested === "/" ? "/dashboard" : requested;
  }, []);

  // The destination is deliberately NOT prefetched here. Prefetching a
  // protected route while signed out asks the middleware to resolve it with no
  // cookie, and the redirect that comes back is what the router then replays
  // on the real navigation — leaving the user on the login page after a
  // successful sign-in until they reload. The dashboard's JS chunk is warmed
  // from the login success handler instead, where the session exists.

  const fallbackNavigation = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (fallbackNavigation.current) {
        clearTimeout(fallbackNavigation.current);
      }
    },
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        reset();
        const target = getRedirectUrl();

        // Drop any route entries cached while signed out — an earlier bounce
        // to /login may still be sitting in the client router cache — then
        // navigate, so the middleware re-resolves the destination against the
        // cookie that now exists.
        router.refresh();
        router.push(target);

        // Safety net for a browser that cached that bounce before this fix
        // shipped: if the router has not left the login page shortly after a
        // successful sign-in, fall back to a full navigation, which always
        // resolves against the current cookie. A successful push unmounts
        // this form and clears the timer.
        fallbackNavigation.current = window.setTimeout(() => {
          if (window.location.pathname.startsWith("/login")) {
            window.location.assign(target);
          }
        }, 700);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        register={register("email")}
        error={errors.email?.message}
        required
        disabled={loginMutation.isPending}
      />

      <InputField
        label="Password"
        placeholder="Enter your password"
        type="password"
        register={register("password")}
        error={errors.password?.message}
        required
        disabled={loginMutation.isPending}
      />

      {/* Remember me and Forgot password row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            {...register("remember")}
            disabled={loginMutation.isPending}
            className="h-4 w-4 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="remember" className="ml-2 block text-gray-700">
            Remember me
          </label>
        </div>

        <div>
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-indigo-500 font-medium"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {loginMutation.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            {loginMutation.error?.message || "Login failed. Please try again."}
          </p>
        </div>
      )}

      <div className="pt-2">
        <Button
          type="primary"
          htmlType="submit"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </form>
  );
};
