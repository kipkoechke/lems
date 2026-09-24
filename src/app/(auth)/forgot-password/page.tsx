"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { FaEnvelopeOpenText, FaArrowLeft } from "react-icons/fa";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/lib/validations";
import { InputField } from "@/components/common/InputField";
import { requestPasswordReset } from "@/services/apiAuth";

/**
 * Request a password reset link.
 *
 * The API answers identically whether or not the address is registered, so
 * this page must not imply the account exists either — the confirmation is
 * deliberately conditional. A 429 is the throttle (three per address per
 * minute) and is worth saying plainly rather than reporting as a failure.
 */
export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (_result, variables) => {
      setSentTo(variables.email);
      reset();
    },
  });

  const status = (mutation.error as { response?: { status?: number } })
    ?.response?.status;
  const errorMessage =
    status === 429
      ? "Too many requests for that address. Wait a minute and try again."
      : (mutation.error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
        "Could not send the link. Check your connection and try again.";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/assets/cog-logo.png"
                alt="VEMS Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <h1 className="text-2xl font-bold text-gray-900">VEMS</h1>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Reset your password
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Enter the email address on your account and we&apos;ll send a link
              to set a new password.
            </p>
          </div>

          {sentTo ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center">
                <FaEnvelopeOpenText className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-emerald-800">
                  If <span className="font-medium">{sentTo}</span> has an
                  account, a reset link is on its way.
                </p>
                <p className="text-xs text-emerald-700 mt-2">
                  The link works once and lasts 24 hours. Check the spam folder
                  if it has not arrived in a few minutes.
                </p>
              </div>

              <button
                onClick={() => setSentTo(null)}
                className="w-full text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Use a different address
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeft className="w-3 h-3" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit((data) => mutation.mutate(data))}
              className="space-y-4"
            >
              <InputField
                label="Email Address"
                type="email"
                placeholder="name@facility.go.ke"
                register={register("email")}
                error={errors.email?.message}
                required
                disabled={mutation.isPending}
              />

              {mutation.isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {mutation.isPending ? "Sending..." : "Send reset link"}
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 pt-1"
              >
                <FaArrowLeft className="w-3 h-3" /> Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
