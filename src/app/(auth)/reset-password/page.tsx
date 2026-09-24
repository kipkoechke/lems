"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations";
import { InputField } from "@/components/common/InputField";
import { resetPassword } from "@/services/apiAuth";

/** Rough strength read, to tell someone their password is weak before the API does. */
const strengthOf = (password: string) => {
  if (!password) return null;
  const checks = [
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (password.length < 8) {
    return { label: "Too short", cls: "bg-red-500", width: "20%" };
  }
  if (checks <= 1) return { label: "Weak", cls: "bg-red-500", width: "33%" };
  if (checks === 2) return { label: "Fair", cls: "bg-amber-500", width: "66%" };
  if (checks === 3) return { label: "Good", cls: "bg-emerald-500", width: "85%" };
  return { label: "Strong", cls: "bg-emerald-600", width: "100%" };
};

/**
 * Set a new password from an emailed link.
 *
 * This is where `{FRONTEND_URL}/reset-password?token=…&email=…` lands, for a
 * new starter setting their first password as well as anyone who forgot
 * theirs — accounts are created with a random password nobody is told, so the
 * welcome mail and the reset mail are the same journey.
 *
 * The query string is read from `window.location` rather than through
 * `useSearchParams`, which would opt the whole page into a Suspense bailout
 * and show a loading placeholder over a form that loads nothing.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [link, setLink] = useState<{ token: string; email: string } | null>(
    null,
  );
  const [linkChecked, setLinkChecked] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    if (token && email) setLink({ token, email });
    setLinkChecked(true);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const password = watch("password") ?? "";
  const strength = useMemo(() => strengthOf(password), [password]);

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordFormData) =>
      resetPassword({
        email: link!.email,
        token: link!.token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      }),
    onSuccess: () => {
      setDone(true);
      // Long enough to read the confirmation, short enough not to strand them.
      setTimeout(() => router.push("/login"), 2500);
    },
  });

  // A 422 here is ordinary — an expired, used or truncated link — so it is
  // explained rather than reported as a failure.
  const status = (mutation.error as { response?: { status?: number } })
    ?.response?.status;
  const apiMessage = (
    mutation.error as { response?: { data?: { message?: string } } }
  )?.response?.data?.message;

  const shell = (children: React.ReactNode) => (
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
          </div>
          {children}
        </div>
      </div>
    </div>
  );

  // Nothing is rendered until the query string has been read, so the
  // "broken link" message cannot flash at someone holding a valid one.
  if (!linkChecked) return shell(<div className="h-40" />);

  if (!link) {
    return shell(
      <div className="text-center space-y-4">
        <FaExclamationTriangle className="w-7 h-7 text-amber-500 mx-auto" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            This link is incomplete
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Mail clients sometimes cut long links in half. Open it again from
            the email, or ask for a fresh one.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Send a new link
        </Link>
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft className="w-3 h-3" /> Back to sign in
        </Link>
      </div>,
    );
  }

  if (done) {
    return shell(
      <div className="text-center space-y-4">
        <FaCheckCircle className="w-7 h-7 text-emerald-600 mx-auto" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Password set</h2>
          <p className="mt-1 text-sm text-gray-600">
            You can now sign in with your new password. Taking you there...
          </p>
        </div>
        <Link
          href="/login"
          className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Sign in
        </Link>
      </div>,
    );
  }

  return shell(
    <>
      <div className="text-center mb-6 -mt-2">
        <h2 className="text-xl font-bold text-gray-900">Set a new password</h2>
        <p className="mt-1 text-sm text-gray-600">
          for <span className="font-medium">{link.email}</span>
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        <div>
          <InputField
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            register={register("password")}
            error={errors.password?.message}
            required
            disabled={mutation.isPending}
          />
          {strength && (
            <div className="mt-1.5">
              <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${strength.cls}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{strength.label}</p>
            </div>
          )}
        </div>

        <InputField
          label="Confirm New Password"
          type="password"
          placeholder="Type it again"
          register={register("password_confirmation")}
          error={errors.password_confirmation?.message}
          required
          disabled={mutation.isPending}
        />

        {mutation.isError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md space-y-2">
            <p className="text-amber-800 text-sm">
              {status === 422
                ? apiMessage ||
                  "This link has expired or has already been used. Links last 24 hours and work once."
                : apiMessage ||
                  "Could not set the password. Check your connection and try again."}
            </p>
            {status === 422 && (
              <Link
                href="/forgot-password"
                className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Send me a new link
              </Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {mutation.isPending ? "Setting password..." : "Set password"}
        </button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 pt-1"
        >
          <FaArrowLeft className="w-3 h-3" /> Back to sign in
        </Link>
      </form>
    </>,
  );
}
