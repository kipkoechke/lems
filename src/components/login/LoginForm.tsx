"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { InputField } from "./InputField";
import Button from "./Button";
import { loginSchema, LoginFormData } from "../../lib/validations";
import { useLogin } from "../../hooks/useAuth";
import Link from "next/link";

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/";
  const loginMutation = useLogin();

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
        window.location.href = redirectUrl;
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

      {loginMutation.isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">
            Login successful! Redirecting...
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
