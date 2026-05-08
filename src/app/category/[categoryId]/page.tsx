import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DetailLayout } from "@/components/layout/detail-layout";
import {
  getProjectsByCategory,
  getCategoryById,
  getCategoryOptions,
  getMenuItemsByCategory,
} from "@/data/projects";

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  const category = getCategoryById(categoryId);
  const categoryProjects = getProjectsByCategory(categoryId);
  const categoryOptions = getCategoryOptions();
  const menuItems = getMenuItemsByCategory(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <DetailLayout
      categoryOptions={categoryOptions}
      menuItems={menuItems}
      currentCategoryId={category.id}
      currentCategoryTitle={category.title}
    >
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight">
          {category.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {category.description}
        </p>
      </div>

      {categoryProjects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">该分类暂无项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryProjects.map((project) => (
            <Card
              key={project.id}
              id={project.id}
              className="overflow-hidden hover:shadow-lg transition-shadow scroll-mt-20"
            >
              <div className="relative h-48 w-full bg-muted">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="mt-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DetailLayout>
  );
}
