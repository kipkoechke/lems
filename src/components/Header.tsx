import Image from "next/image";

const Header = () => {
  return (
    <div className="bg-white font-bold tracking-widest border-b h-25 border-gray-200 flex items-center px-8 py-2 col-span-full">
      <div className="flex items-center gap-6">
        {/* Ministry of Health Logo */}
        <div className="h-24 w-auto">
          <Image
            src="/assets/moh-logo.png"
            alt="Ministry of Health Logo"
            width={535}
            height={100}
            className="h-full w-auto object-contain"
            priority
            quality={100}
          />
        </div>

        {/* Vertical Separator Line */}
        <div className="h-10 w-px bg-gray-300"></div>

        {/* COG Logo */}
        <div className="h-24 w-auto">
          <Image
            src="/assets/cog-logo.png"
            alt="COG Logo"
            width={535}
            height={100}
            className="h-full w-auto object-contain"
            priority
            quality={100}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
