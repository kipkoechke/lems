import Image from "next/image";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { LogoutButton } from "./LogoutButton";

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header = ({ onMenuToggle, isMobileMenuOpen }: HeaderProps) => {
  return (
    <div className="bg-white font-bold tracking-widest border-b h-18 border-gray-200 flex items-center justify-between px-4 md:px-8 py-2 col-span-full">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 mr-4"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <HiXMark className="w-6 h-6" />
          ) : (
            <HiBars3 className="w-6 h-6" />
          )}
        </button>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Ministry of Health Logo */}
          <div className="h-10 md:h-14 w-auto">
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
          <div className="h-4 md:h-6 w-px bg-gray-300"></div>

          {/* COG Logo */}
          <div className="h-10 md:h-14 w-auto">
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

      {/* Right side - Logout Button */}
      <div className="flex items-center">
        <LogoutButton />
      </div>
    </div>
  );
};

export default Header;
