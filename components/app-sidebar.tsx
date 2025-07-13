"use client"

import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AmphoraIcon, BugIcon, CameraIcon, ChartAreaIcon, ChartNoAxesCombinedIcon, DatabaseIcon, EarthIcon, FileDigitIcon, FileTextIcon, FileType2Icon, HeartIcon, LayoutDashboardIcon, MountainSnowIcon, SettingsIcon, ShovelIcon, UsersRoundIcon, DollarSignIcon, CreditCardIcon, TrendingUpIcon, ReceiptIcon, BarChart3Icon, MapPinnedIcon, AlertTriangleIcon, ClockIcon } from "lucide-react"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useState } from "react"
import DialogSettings from "./dialog-settings"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "https://avatar.iran.liara.run/public/11",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Artefatos",
      url: "/artifacts",
      icon: ShovelIcon,
    },
    {
      title: "Expedições",
      url: "/expedition",
      icon: EarthIcon,
    },
    {
      title: "Equipes",
      url: "/teams",
      icon: UsersRoundIcon,
    },
  ],
  navSecondary: [
    {
      title: "Analytics",
      icon: ChartAreaIcon,
      url: "/analytics",
      items: [
        {
          title: "Visão Geral",
          url: "/analytics",
        },
        {
          title: "Taxa de Sucesso",
          url: "/analytics/success-rate",
        },
        {
          title: "Análise Temporal",
          url: "/analytics/temporal",
        },
        {
          title: "Análise de Desafios",
          url: "/analytics/challenges",
        },
        {
          title: "Análise de Localização",
          url: "/analytics/location",
        },
        {
          title: "Insights",
          url: "/analytics/insights",
        },
      ],
    },
    {
      title: "Financeiro",
      icon: DollarSignIcon,
      url: "/financial",
      items: [
        {
          title: "Orçamentos",
          url: "/financial/budgets",
        },
        {
          title: "Despesas",
          url: "/financial/expenses",
        },
        {
          title: "Financiamentos",
          url: "/financial/funding",
        },
        {
          title: "Relatórios",
          url: "/financial/reports",
        },
      ],
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/">
                <MountainSnowIcon/>
                <span className="text-base font-semibold">ExpediSys.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <SidebarMenuButton
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Open settings"
                >
                  <SettingsIcon />
                  <span>Settings</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <DialogSettings />
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
