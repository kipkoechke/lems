import Image from "next/image";

export const Logo = () => (
  <div className="flex items-center">
    <div className="flex items-center border-r border-gray-100 pr-2">
      <Image
        src="/assets/logo.png"
        alt="Ministry of Health Logo"
        width={535}
        height={100}
        className="h-12 lg:h-16 w-auto object-contain"
        priority
        draggable={false}
      />
    </div>
  </div>
);
