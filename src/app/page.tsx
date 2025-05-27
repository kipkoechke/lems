import MainNav from "@/components/Sidebar";
import Clinicians from "./clinicians/page";

export default function Home() {
  return (
    <div className="h-screen grid grid-cols-[1fr_5fr] grid-rows-[auto_1fr]">
      <div className="bg-gray-200 h-16 flex items-center px-8 col-span-full">
        Header
      </div>
      <div className="bg-gray-200 border-r h-full overflow-y-auto">
        <MainNav />
      </div>
      <main className="overflow-auto bg-gray-50 p-16">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-8">
          <Clinicians />
        </div>
      </main>
    </div>
  );
}
