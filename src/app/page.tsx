import Link from "next/link";
import {
  Square,
  Box,
  Globe,
  Smartphone,
  Brain,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { categories } from "@/data/projects";

const iconMap: Record<string, LucideIcon> = {
  Square,
  Box,
  Globe,
  Smartphone,
  Brain,
  Wrench,
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">项目展示</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            浏览不同技术栈和分类的项目作品，点击卡片查看详情
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Square;
            return (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="transition-transform hover:scale-[1.02]"
              >
                <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
