import Header from "./Header";
import Sidebar from "./Sidebar";

import { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="h-screen grid grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      <Header />
      <Sidebar />
      <main className="overflow-auto bg-gray-100">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
