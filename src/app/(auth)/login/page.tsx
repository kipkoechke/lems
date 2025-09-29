import { LoginForm } from "@/components/login/LoginForm";
import Image from "next/image";
import {
  FaClipboardList,
  FaFileContract,
  FaChartBar,
  FaCheckCircle,
} from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form - Takes 65% of the space */}
      <div className="w-full lg:w-2/3 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-md lg:max-w-xl">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Image
                src="/assets/cog-logo.png"
                alt="LEMS Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-900">LEMS</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Need help?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image/Illustration - Takes 35% of the space */}
      <div className="hidden lg:block relative w-1/3">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>

          {/* Medical equipment illustration area */}
          <div className="relative h-full flex items-center justify-center p-8">
            <div className="text-center text-white">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                  <MdMedicalServices className="w-10 h-10" />
                </div>
              </div>

              <h2 className="text-4xl font-bold mb-4">
                Leased Equipment Management System
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-md mx-auto">
                Streamline your healthcare equipment management with our
                comprehensive platform
              </p>

              <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto">
                <div className="flex items-center text-left">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <FaClipboardList className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-medium">Equipment Tracking</p>
                    <p className="text-indigo-200 text-sm">
                      Real-time equipment monitoring
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-left">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <FaFileContract className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-medium">Contract Management</p>
                    <p className="text-indigo-200 text-sm">
                      Streamlined vendor contracts
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-left">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <FaChartBar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-medium">Analytics & Reports</p>
                    <p className="text-indigo-200 text-sm">
                      Comprehensive insights
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
