"use client";

import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return <div className="min-h-screen">{children}</div>;
};

export default AuthLayout;
