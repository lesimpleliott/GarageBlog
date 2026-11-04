import ThemeToggle from "@/components/ThemeToggle";
import clsx from "clsx";
import Link from "next/link";

export default function Navbar() {
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="w-full border-b border-foreground-secondary py-4">
      <nav className="page-container flex items-center justify-between">
        {/* Nav items */}
        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "text-foreground transition-colors hover:text-foreground-secondary",
                "font-title text-3xl",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <ThemeToggle />
      </nav>
    </header>
  );
}
