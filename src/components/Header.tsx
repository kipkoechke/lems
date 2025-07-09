import Image from "next/image";

const Header = () => {
  return (
    <div className="bg-white font-bold tracking-widest border-b border-gray-200 h-16 flex items-center px-8 col-span-full">
      <div className="flex items-center gap-6">
        {/* Ministry of Health Logo */}
        <div className="h-12 w-auto">
          <Image
            src="/assets/moh-logo.png"
            alt="Ministry of Health Logo"
            width={160}
            height={48}
            className="h-full w-auto object-contain"
            priority
            quality={100}
          />
        </div>

        {/* Vertical Separator Line */}
        <div className="h-8 w-px bg-gray-300"></div>

        {/* COG Logo */}
        <div className="h-12 w-auto">
          <Image
            src="/assets/cog-logo.png"
            alt="COG Logo"
            width={160}
            height={48}
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
