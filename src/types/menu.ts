export interface MenuItem {
  id: string;
  title: string;
  href?: string;
  icon?: string;
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  id: string;
  title: string;
  href?: string;
}

export interface CategoryOption {
  id: string;
  title: string;
  href: string;
}
