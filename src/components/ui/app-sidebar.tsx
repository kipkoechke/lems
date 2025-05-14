import { Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Clinicians",
    url: "/clinicians",
    icon: Inbox,
  },
  {
    title: "Services",
    url: "/services",
    icon: Inbox,
  },
  {
    title: "Patients",
    url: "/patients",
    icon: Inbox,
  },
  {
    title: "Equipments",
    url: "/equipments",
    icon: Search,
  },
  {
    title: "Facilities",
    url: "/facilities",
    icon: Settings,
  },
  {
    title: "Lems",
    url: "/lems",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="px-8 py-12 bg-gray-400">
      <SidebarContent className="bg-gray-400">
        <SidebarGroup>
          <SidebarGroupLabel className="pb-6">LEMS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
