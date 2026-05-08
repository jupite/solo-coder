"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  File,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { MenuItem, CategoryOption } from "@/types/menu"

interface DetailLayoutProps {
  categoryOptions: CategoryOption[]
  menuItems: MenuItem[]
  currentCategoryId: string
  currentCategoryTitle: string
  children: React.ReactNode
}

const iconMap: Record<string, LucideIcon> = {
  Folder,
  FolderOpen,
  File,
  Home,
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

function MenuItemComponent({
  item,
  activeId,
  depth = 0,
  onItemClick,
}: {
  item: MenuItem
  activeId: string
  depth?: number
  onItemClick?: (item: MenuItem) => void
}) {
  const router = useRouter()
  const hasChildren = item.children && item.children.length > 0
  const [isOpen, setIsOpen] = React.useState(false)
  const IconComponent = getIcon(item.icon)

  const isActive = item.id === activeId

  const handleClick = () => {
    if (item.href) {
      router.push(item.href)
      onItemClick?.(item)
    } else if (hasChildren) {
      setIsOpen(!isOpen)
    }
  }

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {isOpen ? (
              <ChevronRight className="h-4 w-4 rotate-90 transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform" />
            )}
            {React.createElement(IconComponent, { className: "h-4 w-4" })}
            <span className="flex-1 truncate">{item.title}</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1">
            {item.children!.map((child) => (
              <MenuItemComponent
                key={child.id}
                item={child}
                activeId={activeId}
                depth={depth + 1}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground"
      )}
      style={{ paddingLeft: `${depth * 12 + 32}px` }}
    >
      {React.createElement(IconComponent, { className: "h-4 w-4" })}
      <span className="flex-1 truncate">{item.title}</span>
    </button>
  )
}

function getInitialHash(): string {
  if (typeof window === "undefined") return ""
  return window.location.hash.replace("#", "")
}

export function DetailLayout({
  categoryOptions,
  menuItems,
  currentCategoryId,
  currentCategoryTitle,
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

  const breadcrumbItems = React.useMemo(() => {
    const targetId = activeMenuId
    const items: Array<{ id: string; title: string; href?: string }> = [
      { id: "home", title: "首页", href: "/" },
      { id: currentCategoryId, title: currentCategoryTitle, href: `/category/${currentCategoryId}` },
    ]

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
  }, [activeMenuId, currentCategoryId, currentCategoryTitle, menuItems])

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 items-center gap-4 border-b border-border px-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Home className="h-5 w-5" />
            <span className="sr-only">返回首页</span>
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-3">
              <span className="text-base font-medium">{currentCategoryTitle}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 z-50 bg-popover border border-border">
            {categoryOptions.map((option) => (
              <DropdownMenuItem key={option.id} asChild>
                <Link href={option.href} className="cursor-pointer">
                  {option.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center">
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
                        <span className="text-muted-foreground">{item.title}</span>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border overflow-y-auto p-2 bg-muted/20">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <MenuItemComponent
                key={item.id}
                item={item}
                activeId={activeMenuId}
              />
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
