import type { CategoryOption } from "@/types/menu";

const allCategories: CategoryOption[] = [
  { id: "2d", title: "2D 开发", href: "/category/2d" },
  { id: "3d", title: "3D 开发", href: "/category/3d" },
  { id: "web", title: "Web 开发", href: "/category/web" },
  { id: "mobile", title: "移动开发", href: "/category/mobile" },
  { id: "ai", title: "AI / ML", href: "/category/ai" },
  { id: "tools", title: "工具开发", href: "/category/tools" },
  { id: "backend", title: "后端开发", href: "/category/backend" },
  { id: "frontend", title: "前端框架", href: "/category/frontend" },
  { id: "devops", title: "DevOps", href: "/category/devops" },
  { id: "cloud", title: "云计算", href: "/category/cloud" },
  { id: "database", title: "数据库", href: "/category/database" },
  { id: "security", title: "网络安全", href: "/category/security" },
  { id: "iot", title: "物联网", href: "/category/iot" },
  { id: "blockchain", title: "区块链", href: "/category/blockchain" },
  { id: "arvr", title: "AR/VR", href: "/category/arvr" },
  { id: "game", title: "游戏开发", href: "/category/game" },
  { id: "design", title: "UI/UX 设计", href: "/category/design" },
  { id: "testing", title: "软件测试", href: "/category/testing" },
  { id: "ci", title: "CI/CD", href: "/category/ci" },
  { id: "microservices", title: "微服务", href: "/category/microservices" },
  { id: "container", title: "容器化", href: "/category/container" },
  { id: "linux", title: "Linux", href: "/category/linux" },
  { id: "python", title: "Python", href: "/category/python" },
  { id: "javascript", title: "JavaScript", href: "/category/javascript" },
  { id: "typescript", title: "TypeScript", href: "/category/typescript" },
  { id: "java", title: "Java", href: "/category/java" },
  { id: "cpp", title: "C/C++", href: "/category/cpp" },
  { id: "rust", title: "Rust", href: "/category/rust" },
  { id: "go", title: "Go 语言", href: "/category/go" },
  { id: "ruby", title: "Ruby", href: "/category/ruby" },
  { id: "swift", title: "Swift", href: "/category/swift" },
  { id: "kotlin", title: "Kotlin", href: "/category/kotlin" },
];

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FetchCategoriesParams {
  page: number;
  pageSize: number;
  search?: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchCategories(
  params: FetchCategoriesParams
): Promise<PaginationResponse<CategoryOption>> {
  await delay(300);

  const { page, pageSize, search } = params;

  let filtered = allCategories;
  if (search && search.trim()) {
    const searchLower = search.trim().toLowerCase();
    filtered = allCategories.filter(
      (cat) =>
        cat.title.toLowerCase().includes(searchLower) ||
        cat.id.toLowerCase().includes(searchLower)
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = filtered.slice(startIndex, endIndex);

  return {
    data,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}
