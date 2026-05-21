## 1. 架构设计

纯前端3D节奏游戏，使用Three.js进行3D渲染，模块化JavaScript架构。

```mermaid
flowchart TD
    "用户交互层" --> "输入处理模块"
    "输入处理模块" --> "游戏逻辑层"
    "游戏逻辑层" --> "渲染引擎层"
    "渲染引擎层" --> "Three.js"
    "游戏逻辑层" --> "音频模块"
    "音频模块" --> "Web Audio API"
    "游戏逻辑层" --> "数据管理"
    "数据管理" --> "分数/连击状态"
```

## 2. 技术说明

- 前端：Three.js r160+ + 原生JavaScript (ES6 Modules)
- 构建工具：Vite 5.x
- 音频：Web Audio API
- 样式：CSS3
- 无需后端服务

## 3. 路由定义

| 路由 | 用途 |
|-----|-----|
| / | 游戏主页面 |

## 4. 模块结构

```
src/
├── main.js              # 入口文件
├── game/
│   ├── Game.js          # 游戏主控制器
│   ├── SceneManager.js  # 3D场景管理
│   ├── DrumKit.js       # 架子鼓模型
│   ├── Note.js          # 音符类
│   ├── NoteManager.js   # 音符管理器
│   ├── InputHandler.js  # 输入处理
│   ├── ScoreManager.js  # 分数管理
│   ├── ParticleSystem.js # 粒子特效
│   ├── AudioManager.js  # 音频管理
│   └── BeatVisualizer.js # 节拍可视化
├── config/
│   └── config.js        # 游戏配置
└── style.css            # 样式文件
```

## 5. 核心类定义

### Game
- `init()`: 初始化游戏
- `start()`: 开始游戏
- `update(delta)`: 游戏主循环更新
- `render()`: 渲染场景

### Note
- `position`: 音符位置
- `color`: 音符颜色
- `lane`: 所属轨道(0/1/2)
- `speed`: 下落速度
- `update()`: 更新位置
- `isHit()`: 检测是否被击中

### NoteManager
- `spawnNote()`: 生成新音符
- `update()`: 更新所有音符
- `checkHit(lane)`: 检查指定轨道的打击

### ScoreManager
- `score`: 当前分数
- `combo`: 连击数
- `isFever`: 是否狂热模式
- `addScore(points)`: 加分
- `missNote()`: 错过音符处理
- `resetCombo()`: 重置连击

### ParticleSystem
- `emit(position, color)`: 发射粒子
- `update()`: 更新粒子状态

### AudioManager
- `init()`: 初始化音频
- `playBeat()`: 播放节拍
- `playHitSound()`: 播放击中音效
