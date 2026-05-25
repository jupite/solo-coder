## 1. 架构设计

```mermaid
flowchart TD
    subgraph "前端"
        "React 应用层" --> "游戏状态管理 (Zustand)"
        "React 应用层" --> "UI组件"
        "游戏状态管理" --> "Three.js场景"
        "Three.js场景" --> "骑马系统"
        "Three.js场景" --> "射箭系统"
        "Three.js场景" --> "靶子系统"
    end
    subgraph "数据层"
        "localStorage" --> "历史成绩存储"
    end
```

## 2. 技术说明

- **前端框架**: React@18 + TypeScript
- **3D引擎**: Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing
- **构建工具**: Vite
- **状态管理**: Zustand
- **样式**: TailwindCSS 3
- **后端**: 无后端，使用localStorage存储历史成绩
- **数据库**: 无需数据库，localStorage持久化

## 3. 路由定义

| 路由 | 用途 |
|-----|------|
| / | 游戏主页，显示开始按钮和历史成绩 |
| /game | 游戏场景，3D骑马射箭游戏主界面 |
| /result | 结算页面，显示本次得分 |

## 4. 数据模型

### 4.1 游戏分数记录

```typescript
interface GameRecord {
  id: string;
  score: number;
  date: string;
}
```

### 4.2 游戏状态

```typescript
interface GameState {
  score: number;
  timeLeft: number;
  isPlaying: boolean;
  isGameOver: boolean;
  arrows: Arrow[];
  targets: Target[];
}
```

### 4.3 箭矢数据

```typescript
interface Arrow {
  id: string;
  position: Vector3;
  velocity: Vector3;
  isActive: boolean;
}
```

### 4.4 靶子数据

```typescript
interface Target {
  id: string;
  position: Vector3;
  type: 'static' | 'moving';
  moveRange?: number;
  moveSpeed?: number;
  isHit: boolean;
}
```

## 5. 核心组件结构

```
src/
├── components/
│   ├── Game.tsx           # 游戏主场景组件
│   ├── Horse.tsx          # 马匹组件（含晃动动画）
│   ├── Arrow.tsx          # 箭矢组件
│   ├── Target.tsx         # 靶子组件
│   ├── Crosshair.tsx      # 准星组件
│   ├── ChargeBar.tsx      # 蓄力条组件
│   ├── ScoreDisplay.tsx   # 分数显示组件
│   ├── Timer.tsx          # 倒计时组件
│   ├── HomePage.tsx       # 主页组件
│   └── ResultPage.tsx     # 结算页面组件
├── store/
│   └── gameStore.ts       # Zustand状态管理
├── hooks/
│   ├── useGameLoop.ts     # 游戏循环Hook
│   └── useArrow.ts        # 箭矢物理Hook
├── utils/
│   ├── physics.ts         # 物理计算工具
│   └── storage.ts         # 本地存储工具
├── App.tsx
└── main.tsx
```

## 6. 物理系统说明

### 6.1 箭矢抛物线
- 使用重力加速度 g = 9.8 m/s²
- 初始速度由蓄力程度决定（最大力度对应最大初速度）
- 每帧更新位置：position += velocity * deltaTime
- 每帧更新速度：velocity.y -= g * deltaTime

### 6.2 碰撞检测
- 使用AABB（轴对齐包围盒）检测箭矢与靶子的碰撞
- 计算命中点与靶心的距离，转换为分数（10分制，距离越近分数越高）

### 6.3 骑马晃动
- 使用正弦函数模拟上下和左右晃动
- 晃动频率与马奔跑速度相关
- 相机跟随马匹时添加轻微晃动效果
