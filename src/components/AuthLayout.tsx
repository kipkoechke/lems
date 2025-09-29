"use client";

import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
};

export default AuthLayout;
