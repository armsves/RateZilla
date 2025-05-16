"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              Stellar Product Hunt
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/admin') ? 'text-primary' : 'text-foreground hover:text-primary'
              }`}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 