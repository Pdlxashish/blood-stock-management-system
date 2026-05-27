'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Droplets, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { getUser, clearAuth, isAuthenticated } from "@/lib/auth";
import type { User as UserType } from "@/lib/auth";

export default function PublicNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push('/');
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Images", href: "/images" },
    { name: "About", href: "/about" },
  ];

  if (!mounted) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VitalFlow</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7F1D1D] rounded-full flex items-center justify-center">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">VitalFlow</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-red-800"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 bg-red-800 rounded-full overflow-hidden flex items-center justify-center border-2 border-red-200">
                      {user.profilePicture ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}${user.profilePicture}`}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-80 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white p-0"
                >
                  {/* Profile Header */}
                  <div className="p-6 text-center border-b border-gray-700">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full overflow-hidden flex items-center justify-center mx-auto mb-3 shadow-lg border-4 border-gray-700">
                      {user.profilePicture ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}${user.profilePicture}`}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-3xl font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                    <p className="text-sm text-gray-400 truncate">{user.email}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:text-white"
                      onClick={() => router.push('/profile')}
                    >
                      View Profile
                    </Button>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    {user.role === 'DONOR' && (
                      <DropdownMenuItem 
                        onClick={() => router.push('/home')}
                        className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white cursor-pointer py-3 px-4 rounded-md"
                      >
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        <span className="text-base">Donor Home</span>
                      </DropdownMenuItem>
                    )}
                    {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                      <DropdownMenuItem 
                        onClick={() => router.push('/dashboard')}
                        className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white cursor-pointer py-3 px-4 rounded-md"
                      >
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        <span className="text-base">Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                  </div>

                  <DropdownMenuSeparator className="bg-gray-700 my-2" />

                  {/* Logout */}
                  <div className="p-2">
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/20 focus:text-red-400 cursor-pointer py-3 px-4 rounded-md"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      <span className="text-base font-medium">Logout</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/need-a-blood">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                  >
                    <Droplets className="h-4 w-4 mr-1.5" />
                    Need Blood?
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/become-donor">
                  <Button size="sm" className="bg-red-800 hover:bg-red-900">
                    Become Donor
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
