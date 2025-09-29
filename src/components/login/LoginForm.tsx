"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { InputField } from "./InputField";
import { PasswordField } from "./PasswordField";
import Button from "./Button";
import { loginSchema, LoginFormData } from "../../lib/validations";
import { useLogin } from "../../hooks/useAuth";

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <InputField
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        register={register("email")}
        error={errors.email?.message}
        required
        disabled={loginMutation.isPending}
      />

      <PasswordField
        label="Password"
        placeholder="Enter your password"
        register={register("password")}
        error={errors.password?.message}
      />

      {loginMutation.isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            {loginMutation.error?.message || "Login failed. Please try again."}
          </p>
        </div>
      )}

      {loginMutation.isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">
            Login successful! Redirecting...
          </p>
        </div>
      )}

      <div className="pt-4">
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
