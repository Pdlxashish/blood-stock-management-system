'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Heart,
  Image as ImageIcon,
  Info,
  UserCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  ArrowRightLeft,
  Home,
  Clock,
  Droplet,
} from 'lucide-react';
import { logout, isAdmin } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/components/ui/sidebar';

// ── Nav config ────────────────────────────────────────────────────────────────
interface SubNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavItemWithSubmenu {
  icon: React.ElementType;
  label: string;
  href?: undefined;
  submenu: SubNavItem[];
}

interface NavItemSimple {
  icon: React.ElementType;
  label: string;
  href: string;
  submenu?: undefined;
}

type NavItem = NavItemSimple | NavItemWithSubmenu;

const NAV_MAIN: NavItem[] = [
  { icon: Home, label: 'Dashboard', href: '/admin-public' },
  { icon: Droplet, label: 'Blood Requests', href: '/admin-public/blood-requests' },
  {
    icon: UserCheck,
    label: 'Donor Verification',
    submenu: [
      { label: 'Verify Donor', href: '/admin-public/donor-verification', icon: UserCheck },
      { label: 'Pending Donors', href: '/admin-public/donor-verification/pending-donors', icon: Clock },
    ],
  },
  { icon: ImageIcon, label: 'Image Gallery', href: '/admin-public/gallery' },
  { icon: Info, label: 'About', href: '/admin-public/about' },
];

export const PublicDashboardNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isMounted } = useAuth();
  const { state } = useSidebar();

  const handleLogout = () => {
    logout();
  };

  const handleSwitchToAdminDashboard = () => {
    router.push('/dashboard');
  };

  // Check if user is admin
  const userIsAdmin = isMounted && isAdmin();

  // Prevent hydration mismatch by not rendering user-dependent content until mounted
  const displayName = isMounted && user ? user.name : 'Admin';
  const displayEmail = isMounted && user ? user.email : 'Public Dashboard';
  const initials = isMounted && user ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon">

        {/* ── Brand ─────────────────────────────────────────────────── */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/admin-public">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-red-900 text-primary-foreground">
                    <Heart className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Blood Donation</span>
                    <span className="text-xs text-muted-foreground">Public Dashboard</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ── Nav ───────────────────────────────────────────────────── */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className='space-y-3'>
                {NAV_MAIN.map((item) =>
                  item.submenu !== undefined ? (
                    state === 'collapsed' ? (
                      // Dropdown for collapsed sidebar
                      <SidebarMenuItem key={item.label}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.label}
                              isActive={item.submenu.some((s) => pathname === s.href)}
                              className="w-full justify-center gap-0.5"
                            >
                              <item.icon />
                              <ChevronRight className="h-3 w-3" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-48">
                            {item.submenu.map((sub) => {
                              const isActive = pathname === sub.href;
                              return (
                                <DropdownMenuItem
                                  key={sub.href}
                                  asChild
                                  className={isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}
                                >
                                  <Link href={sub.href} className="flex items-center gap-2 cursor-pointer">
                                    {sub.icon && <sub.icon className="size-4" />}
                                    <span>{sub.label}</span>
                                  </Link>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    ) : (
                      // Collapsible for expanded sidebar
                      <Collapsible
                        key={item.label}
                        asChild
                        defaultOpen={item.submenu.some((s) => pathname === s.href || pathname.startsWith(s.href))}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.label}>
                              <item.icon />
                              <span>{item.label}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.submenu.map((sub) => (
                                <SidebarMenuSubItem key={sub.href}>
                                  <SidebarMenuSubButton asChild isActive={pathname === sub.href} tooltip={sub.label}>
                                    <Link href={sub.href}>
                                      {sub.icon && <sub.icon className="size-4" />}
                                      <span>{sub.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  ) : (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── User footer ───────────────────────────────────────────── */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              {isMounted && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        {initials}
                      </div>
                      <div className="flex flex-col gap-0.5 leading-none text-left min-w-0">
                        <span className="font-medium text-sm truncate">{displayName}</span>
                        <span className="text-xs text-muted-foreground truncate">{displayEmail}</span>
                      </div>
                      <ChevronDown className="ml-auto size-4 shrink-0" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="end" className="w-56">
                    {userIsAdmin && (
                      <>
                        <DropdownMenuItem onClick={handleSwitchToAdminDashboard}>
                          <ArrowRightLeft className="mr-2 size-4" />
                          Switch to admin dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 size-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        {initials}
                      </div>
                      <div className="flex flex-col gap-0.5 leading-none text-left min-w-0">
                        <span className="font-medium text-sm truncate">{displayName}</span>
                        <span className="text-xs text-muted-foreground truncate">{displayEmail}</span>
                      </div>
                      <ChevronDown className="ml-auto size-4 shrink-0" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 size-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* ── Rail (drag to resize) ─────────────────────────────────── */}
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
};
