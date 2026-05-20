# solo-coder

平衡走钢丝 - Three.js 3D 游戏

## 项目介绍

这是一个基于 Three.js 开发的 3D 平衡走钢丝游戏。玩家需要在钢丝上保持平衡，走到终点。

### 游戏玩法
- 使用 **A** 键向左倾斜
- 使用 **D** 键向右倾斜
- 注意风向变化，及时调整平衡
- 走到 100 米终点即为胜利

## 快速开始

### 方式一：使用 Python（推荐）

Python 3 内置了 HTTP 服务器，无需额外安装：

```bash
# 启动本地服务器
python -m http.server 8000 --bind 127.0.0.1
```

然后在浏览器中访问：
```
http://127.0.0.1:8000/
```

### 方式二：使用 Node.js

如果您已安装 Node.js，可以使用：

```bash
# 使用 npx serve
npx serve .

# 或使用 live-server
npx live-server
```

### 方式三：使用 VS Code 插件

安装 **Live Server** 插件，右键点击 `index.html` 选择 "Open with Live Server"。

## 项目结构

```
├── index.html          # 主页面
├── style.css           # 样式文件
├── src/
│   ├── main.js         # 游戏主入口
│   ├── scene.js        # 场景管理
│   ├── camera.js       # 相机控制
│   ├── player.js       # 玩家角色
│   ├── physics.js      # 物理引擎
│   ├── wind.js         # 风力系统
│   ├── controls.js     # 输入控制
│   └── ui.js           # UI 界面
└── README.md           # 项目说明
```

## 技术栈

- **Three.js** - 3D 渲染引擎
- **ES Modules** - 模块化 JavaScript
- **HTML5 Canvas** - 游戏渲染

## 注意事项

⚠️ **不要直接双击打开 index.html**

由于项目使用了 ES Modules，浏览器的安全策略会阻止通过 `file://` 协议加载模块文件，必须通过 HTTP 服务器访问。
