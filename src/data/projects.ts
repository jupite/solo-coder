export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  tags: string[];
  link?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const categories: Category[] = [
  {
    id: "2d",
    title: "2D 开发",
    description: "游戏、动画、插画等 2D 技术项目",
    icon: "Square",
  },
  {
    id: "3d",
    title: "3D 开发",
    description: "三维建模、渲染、游戏引擎等 3D 项目",
    icon: "Box",
  },
  {
    id: "web",
    title: "Web 开发",
    description: "前端、后端、全栈 Web 应用",
    icon: "Globe",
  },
  {
    id: "mobile",
    title: "移动开发",
    description: "iOS、Android 及跨平台应用",
    icon: "Smartphone",
  },
  {
    id: "ai",
    title: "AI / ML",
    description: "人工智能、机器学习、深度学习项目",
    icon: "Brain",
  },
  {
    id: "tools",
    title: "工具开发",
    description: "开发工具、CLI、自动化脚本",
    icon: "Wrench",
  },
];

export const projects: Project[] = [
  {
    id: "pixel-game",
    title: "像素冒险",
    description: "一款复古风格的 2D 像素平台跳跃游戏，使用 Unity 开发。",
    category: "2d",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20art%202d%20platformer%20game%20scene%20retro%20style&image_size=landscape_16_9",
    tags: ["Unity", "C#", "2D"],
  },
  {
    id: "animation-studio",
    title: "动画工作室",
    description: "基于 WebGL 的 2D 动画编辑器，支持关键帧和骨骼动画。",
    category: "2d",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=2d%20animation%20software%20interface%20timeline%20frames&image_size=landscape_16_9",
    tags: ["WebGL", "Canvas", "TypeScript"],
  },
  {
    id: "3d-model-viewer",
    title: "3D 模型查看器",
    description: "支持多种格式的 Web 3D 模型查看器，使用 Three.js 开发。",
    category: "3d",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=3d%20model%20viewer%20software%20wireframe%20rendering&image_size=landscape_16_9",
    tags: ["Three.js", "WebGL", "GLTF"],
  },
  {
    id: "blender-addon",
    title: "Blender 插件集",
    description: "提高建模效率的 Blender 插件集合，包含多种工具。",
    category: "3d",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blender%203d%20software%20interface%20modeling%20tools&image_size=landscape_16_9",
    tags: ["Python", "Blender", "3D"],
  },
  {
    id: "dashboard",
    title: "数据仪表盘",
    description: "实时数据可视化仪表盘，支持多种图表类型。",
    category: "web",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=data%20dashboard%20analytics%20charts%20graphs%20modern%20ui&image_size=landscape_16_9",
    tags: ["React", "Next.js", "D3.js"],
  },
  {
    id: "ecommerce",
    title: "电商平台",
    description: "完整的电商解决方案，包含商品管理、支付集成等。",
    category: "web",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ecommerce%20website%20shopping%20cart%20product%20page&image_size=landscape_16_9",
    tags: ["Next.js", "Stripe", "PostgreSQL"],
  },
  {
    id: "fitness-app",
    title: "健身追踪",
    description: "跨平台健身追踪应用，记录运动数据和训练计划。",
    category: "mobile",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fitness%20mobile%20app%20workout%20tracking%20health&image_size=portrait_16_9",
    tags: ["React Native", "iOS", "Android"],
  },
  {
    id: "chat-app",
    title: "即时通讯",
    description: "实时聊天应用，支持文字、图片、语音消息。",
    category: "mobile",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chat%20messaging%20app%20conversation%20interface%20mobile&image_size=portrait_16_9",
    tags: ["Flutter", "Firebase", "WebSocket"],
  },
  {
    id: "image-generator",
    title: "AI 图像生成",
    description: "基于 Stable Diffusion 的图像生成 Web 应用。",
    category: "ai",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ai%20image%20generation%20artificial%20intelligence%20creative&image_size=landscape_16_9",
    tags: ["Python", "PyTorch", "FastAPI"],
  },
  {
    id: "nlp-toolkit",
    title: "NLP 工具包",
    description: "自然语言处理工具集，支持文本分类、情感分析等。",
    category: "ai",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=nlp%20natural%20language%20processing%20text%20analysis%20ai&image_size=landscape_16_9",
    tags: ["Python", "Transformers", "HuggingFace"],
  },
  {
    id: "cli-builder",
    title: "CLI 构建工具",
    description: "快速创建命令行工具的脚手架框架。",
    category: "tools",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=command%20line%20interface%20terminal%20coding%20developer&image_size=landscape_16_9",
    tags: ["Node.js", "TypeScript", "CLI"],
  },
  {
    id: "task-runner",
    title: "任务调度器",
    description: "分布式任务调度系统，支持定时任务和工作流。",
    category: "tools",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=task%20scheduler%20workflow%20automation%20pipeline&image_size=landscape_16_9",
    tags: ["Go", "Redis", "Docker"],
  },
];

export function getProjectsByCategory(categoryId: string): Project[] {
  return projects.filter((project) => project.category === categoryId);
}

export function getCategoryById(categoryId: string): Category | undefined {
  return categories.find((category) => category.id === categoryId);
}

export interface MenuItem {
  id: string;
  title: string;
  href?: string;
  icon?: string;
  children?: MenuItem[];
}

export interface CategoryOption {
  id: string;
  title: string;
  href: string;
}

export function getCategoryOptions(): CategoryOption[] {
  return categories.map((cat) => ({
    id: cat.id,
    title: cat.title,
    href: `/category/${cat.id}`,
  }));
}

export function getMenuItemsByCategory(categoryId: string): MenuItem[] {
  const categoryProjects = getProjectsByCategory(categoryId);
  
  const groupedByTag: Record<string, Project[]> = {};
  
  categoryProjects.forEach((project) => {
    const primaryTag = project.tags[0] || "其他";
    if (!groupedByTag[primaryTag]) {
      groupedByTag[primaryTag] = [];
    }
    groupedByTag[primaryTag].push(project);
  });

  const menuItems: MenuItem[] = Object.entries(groupedByTag).map(([tag, tagProjects]) => ({
    id: `group-${tag.toLowerCase()}`,
    title: tag,
    icon: "Folder",
    children: tagProjects.map((project) => ({
      id: project.id,
      title: project.title,
      href: `/category/${categoryId}#${project.id}`,
      icon: "File",
    })),
  }));

  return menuItems;
}
