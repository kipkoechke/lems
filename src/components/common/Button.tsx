import Link from "next/link";

type ButtonType = "primary" | "small" | "round" | "secondary";
type HtmlButtonType = "button" | "submit" | "reset";

interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  to?: string;
  type: ButtonType;
  htmlType?: HtmlButtonType;
  onClick?: () => void;
}

const Button = ({
  children,
  disabled,
  to,
  type,
  htmlType = "button",
  onClick,
}: ButtonProps) => {
  const base =
    "inline-block cursor-pointer text-xs rounded-lg bg-primary font-semibold uppercase tracking-wide text-white transition-colors duration-300 hover:bg-secondary focus:bg-primary focus:outline-none focus:ring focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed";

  const styles = {
    primary: base + " px-6 py-3 sm:px-8 sm:py-4 md:px-6 md:py-3 w-full",
    small: base + " px-4 py-2 md:px-5 md:py-2.5 text-xs",
    round: base + " px-2.5 py-1 md:px-3.5 md:py-2 text-sm",
    secondary:
      "inline-block text-xs rounded-lg border-2 border-accent font-semibold uppercase tracking-wide text-black transition-colors duration-300 hover:bg-stone-300 hover:text-primary focus:bg-stone-300 focus:text-primary focus:outline-none focus:ring focus:ring-stone-200 focus:ring-offset-2 disabled:cursor-not-allowed px-6 py-3",
  };

  if (to)
    return (
      <Link href={to} className={styles[type]}>
        {children}
      </Link>
    );

  return (
    <button
      type={htmlType}
      onClick={onClick}
      disabled={disabled}
      className={styles[type]}
    >
      {children}
    </button>
  );
};

export default Button;
