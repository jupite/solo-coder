"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  type LucideIcon,
  Folder,
  FolderOpen,
  File,  
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { CategoryDropdown } from "@/components/layout/category-dropdown"
import type { MenuItem, CategoryOption } from "@/types/menu"

interface DetailLayoutProps {
  categoryOptions: CategoryOption[]
  menuItems: MenuItem[]
  children: React.ReactNode
}

const iconMap: Record<string, LucideIcon> = {
  Folder,
  FolderOpen,
  File,
}

function getIcon(iconName?: string): LucideIcon {
  if (!iconName) return File
  return iconMap[iconName] || File
}

function findBreadcrumbPath(
  items: MenuItem[],
  targetId: string,
  path: MenuItem[] = []
): MenuItem[] | null {
  for (const item of items) {
    const newPath = [...path, item]
    if (item.id === targetId) {
      return newPath
    }
    if (item.href && item.href.includes(`#${targetId}`)) {
      return newPath
    }
    if (item.children && item.children.length > 0) {
      const result = findBreadcrumbPath(item.children, targetId, newPath)
      if (result) {
        return result
      }
    }
  }
  return null
}

function getInitialHash(): string {
  if (typeof window === "undefined") return ""
  return window.location.hash.replace("#", "")
}

function NavSidebar({
  categoryOptions,
  menuItems,
  activeMenuId,
  currentCategoryId,
  currentCategoryOption,
}: {
  categoryOptions: CategoryOption[]
  menuItems: MenuItem[]
  activeMenuId: string
  currentCategoryId: string
  currentCategoryOption: CategoryOption | undefined
}) {
  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <CategoryDropdown
              currentCategoryId={currentCategoryId}
              currentCategoryTitle={currentCategoryOption?.title}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              const IconComponent = getIcon(item.icon)
              const hasChildren = item.children && item.children.length > 0

              return (
                <SidebarMenuItem key={item.id}>
                  {hasChildren ? (
                    <>
                      <SidebarMenuButton>
                        <IconComponent className="size-4" />
                        <span className="font-medium">{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.children!.map((child) => {
                          const ChildIcon = getIcon(child.icon)
                          const isActive = child.id === activeMenuId
                          return (
                            <SidebarMenuSubItem key={child.id}>
                              <SidebarMenuSubButton asChild isActive={isActive}>
                                {child.href ? (
                                  <Link href={child.href}>
                                    <ChildIcon className="size-4" />
                                    <span>{child.title}</span>
                                  </Link>
                                ) : (
                                  <span>
                                    <ChildIcon className="size-4" />
                                    <span>{child.title}</span>
                                  </span>
                                )}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={item.id === activeMenuId}
                    >
                      {item.href ? (
                        <Link href={item.href}>
                          <IconComponent className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      ) : (
                        <span>
                          <IconComponent className="size-4" />
                          <span>{item.title}</span>
                        </span>
                      )}
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export function DetailLayout({
  categoryOptions,
  menuItems,
  children,
}: DetailLayoutProps) {
  const pathname = usePathname()
  const [currentHash, setCurrentHash] = React.useState<string>(getInitialHash)

  React.useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "")
      setCurrentHash(newHash)
    }
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const activeMenuId = React.useMemo(() => {
    if (currentHash) return currentHash
    const segments = pathname.split("/").filter(Boolean)
    return segments[segments.length - 1] || ""
  }, [pathname, currentHash])

  const currentCategoryId = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    const categoryIndex = segments.indexOf("category")
    if (categoryIndex !== -1 && segments[categoryIndex + 1]) {
      return segments[categoryIndex + 1]
    }
    return ""
  }, [pathname])

  const currentCategoryOption = React.useMemo(() => {
    return categoryOptions.find((option) => option.id === currentCategoryId)
  }, [categoryOptions, currentCategoryId])

  const breadcrumbItems = React.useMemo(() => {
    const targetId = activeMenuId
    const items: Array<{ id: string; title: string; href?: string }> = [
      { id: "home", title: "首页", href: "/" },
    ]

    if (currentCategoryOption) {
      items.push({
        id: currentCategoryOption.id,
        title: currentCategoryOption.title,
        href: currentCategoryOption.href,
      })
    }

    if (targetId && targetId !== currentCategoryId) {
      const menuPath = findBreadcrumbPath(menuItems, targetId)
      if (menuPath) {
        menuPath.forEach((item) => {
          items.push({
            id: item.id,
            title: item.title,
            href: item.href,
          })
        })
      }
    }

    return items
  }, [activeMenuId, currentCategoryId, currentCategoryOption, menuItems])

  return (
    <SidebarProvider>
      <NavSidebar
        categoryOptions={categoryOptions}
        menuItems={menuItems}
        activeMenuId={activeMenuId}
        currentCategoryId={currentCategoryId}
        currentCategoryOption={currentCategoryOption}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => {
                  const isLast = index === breadcrumbItems.length - 1
                  return (
                    <React.Fragment key={item.id}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{item.title}</BreadcrumbPage>
                        ) : item.href ? (
                          <BreadcrumbLink asChild>
                            <Link href={item.href}>{item.title}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <span className="text-muted-foreground">
                            {item.title}
                          </span>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
