import Image from "next/image";

const Header = () => {
  return (
    <div className="bg-white font-bold tracking-widest border-b border-gray-200 h-16 flex items-center px-8 col-span-full">
      <Image
        src="/assets/logo.png"
        alt="Logo"
        width={150}
        height={100}
        className="mb-4"
      />
    </div>
  );
};

export default Header;
