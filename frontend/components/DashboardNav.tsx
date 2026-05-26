'use client';

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
import { useSidebar } from '@/components/ui/sidebar';
import {
  Heart,
  Users,
  Droplet,
  Calendar,
  Award,
  Search,
  Home,
  ChevronDown,
  ChevronRight,
  LogOut,
  ArrowRightLeft,
  BarChart3,
  Package,
  Activity,
} from 'lucide-react';
import { logout } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_MAIN = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  {
    icon: Droplet,
    label: 'Blood Management',
    submenu: [
      { label: 'Blood Stock', href: '/dashboard/blood-stock', icon: Package },
      { label: 'Blood Donate', href: '/dashboard/blood-donate', icon: Activity },
    ],
  },
  { icon: Users, label: 'Donors', href: '/dashboard/donors' },
  { icon: Search, label: 'Blood Search', href: '/dashboard/blood-search' },
  { icon: Calendar, label: 'Events', href: '/dashboard/events' },
  { icon: Award, label: 'Certificates', href: '/dashboard/certificates' },
  { icon: BarChart3, label: 'Reports', href: '/dashboard/reports' },
];

export const DashboardNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isMounted } = useAuth();
  const { state } = useSidebar();

  const handleLogout = () => {
    logout();
  };

  const handleSwitchToPublicDashboard = () => {
    router.push('/admin-public');
  };

  // Prevent hydration mismatch by not rendering user-dependent content until mounted
  const displayName = isMounted && user ? user.name : 'Admin';
  const displayEmail = isMounted && user ? user.email : 'Admin Panel';
  const displayRole = isMounted && user ? (user.role === 'ADMIN' ? 'Administrator' : user.email) : 'Administrator';
  const initials = isMounted && user ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon">

        {/* ── Brand ─────────────────────────────────────────────────── */}
        <SidebarHeader>
          <SidebarMenu >
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild >
                <Link href="/dashboard">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-red-900 text-primary-foreground">
                    <Heart className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Blood Donation</span>
                    <span className="text-xs text-muted-foreground">Management System</span>
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
              <SidebarMenu className='space-y-3' >
                {NAV_MAIN.map((item) =>
                  item.submenu ? (
                    state === "collapsed" ? (
                      // Dropdown menu for collapsed state
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
                                  className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
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
                      // Collapsible for expanded state
                      <Collapsible
                        key={item.label}
                        asChild
                        defaultOpen={item.submenu.some((s) => pathname === s.href)}
                        className="group/collapsible "
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.label}>
                              <item.icon />
                              <span>{item.label}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 " />
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
                        <Link href={item.href!}>
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
                        <span className="text-xs text-muted-foreground truncate">{displayRole}</span>
                      </div>
                      <ChevronDown className="ml-auto size-4 shrink-0" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="end" className="w-56">
                    <DropdownMenuItem onClick={handleSwitchToPublicDashboard}>
                      <ArrowRightLeft className="mr-2 size-4" />
                      Switch to public dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
                        <span className="text-xs text-muted-foreground truncate">Administrator</span>
                      </div>
                      <ChevronDown className="ml-auto size-4 shrink-0" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="end" className="w-56">
                    <DropdownMenuItem onClick={handleSwitchToPublicDashboard}>
                      <ArrowRightLeft className="mr-2 size-4" />
                      Switch to public dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
