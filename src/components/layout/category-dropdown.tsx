"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Loader2,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  fetchCategories,
  type PaginationResponse,
  type FetchCategoriesParams,
} from "@/lib/mock-api"
import type { CategoryOption } from "@/types/menu"
import { cn } from "@/lib/utils"

const PAGE_SIZE_OPTIONS = [5, 10, 20]
const DEFAULT_PAGE_SIZE = 10

interface CategoryDropdownProps {
  currentCategoryId?: string
  currentCategoryTitle?: string
}

export function CategoryDropdown({
  currentCategoryId,
  currentCategoryTitle,
}: CategoryDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE)
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<
    PaginationResponse<CategoryOption> | null
  >(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadData = React.useCallback(
    async (params: FetchCategoriesParams) => {
      setLoading(true)
      try {
        const data = await fetchCategories(params)
        setResult(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  React.useEffect(() => {
    if (open) {
      loadData({ page, pageSize, search: debouncedSearch })
    }
  }, [open, page, pageSize, debouncedSearch, loadData])

  const handlePageChange = (newPage: number) => {
    if (result && newPage >= 1 && newPage <= result.totalPages) {
      setPage(newPage)
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  const handleSelect = () => {
    setOpen(false)
    setSearch("")
    setDebouncedSearch("")
    setPage(1)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Home className="h-4 w-4" />
            <span className="sr-only">返回首页</span>
          </Button>
        </Link>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex-1 gap-2 px-3 justify-start",
              "data-[state=open]:bg-accent"
            )}
          >
            <span className="truncate text-sm font-medium">
              {currentCategoryTitle || "选择分类"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 ml-auto" />
          </Button>
        </DropdownMenuTrigger>
      </div>

      <DropdownMenuContent
        align="start"
        className="w-64 p-0 bg-popover border border-border"
        side="bottom"
      >
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索分类..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <Separator />

        <div className="max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                加载中...
              </span>
            </div>
          ) : result && result.data.length > 0 ? (
            result.data.map((option) => (
              <DropdownMenuItem key={option.id} asChild>
                <Link
                  href={option.href}
                  className={cn(
                    "cursor-pointer px-2 py-1.5 text-sm",
                    option.id === currentCategoryId &&
                      "bg-accent text-accent-foreground"
                  )}
                  onClick={handleSelect}
                >
                  {option.title}
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              暂无数据
            </div>
          )}
        </div>

        {result && result.total > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between p-2 gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={page <= 1 || loading}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground min-w-[60px] text-center">
                  {result.page}/{result.totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={page >= result.totalPages || loading}
                  onClick={() => handlePageChange(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">每页:</span>
                <div className="flex gap-1">
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <Button
                      key={size}
                      variant={pageSize === size ? "secondary" : "ghost"}
                      size="icon"
                      className="h-7 w-7 text-xs"
                      onClick={() => handlePageSizeChange(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-2 pb-2">
              <div className="text-xs text-muted-foreground text-center">
                共 {result.total} 条
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
