<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CloudKitchen Premium - 云端餐厅管理系统

一个现代化的餐厅点餐和管理系统，支持云数据库、实时订单同步、AI 点餐助手等功能。

## ✨ 主要功能

### 🍽️ 顾客端功能
- **智能菜单浏览** - 分类筛选、实时库存
- **购物车管理** - 实时计算、便捷结算
- **AI 点餐助手** - 基于 Gemini AI 的智能推荐
- **在线预约** - 日期时间选择、人数设定
- **订单追踪** - 实时状态更新

### 👨‍🍳 厨师端功能
- **菜单管理** - 添加、编辑、删除菜品
- **订单看板** - 实时订单流转、状态管理
- **预约管理** - 查看和处理预约信息
- **数据统计** - 销量分析、用户统计

### 🔧 技术特性
- **云数据库** - Supabase 实时数据同步
- **响应式设计** - 支持手机、平板、桌面
- **暗色模式** - 护眼的深色主题
- **实时更新** - WebSocket 实时数据推送
- **离线兼容** - 网络异常时的降级处理

## 🚀 快速开始

### 前置要求
- Node.js 16+
- Supabase 账号（用于云数据库）

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制并编辑 `.env.local` 文件：
```env
# Gemini AI 配置
GEMINI_API_KEY=your-gemini-api-key

# Supabase 数据库配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 设置数据库
1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL 编辑器中运行 `scripts/init-database.sql`
3. 更新 `.env.local` 中的数据库配置

### 4. 启动应用
```bash
npm run dev
```

访问 http://localhost:3000 开始使用！

## 📖 使用指南

### 首次使用
1. **顾客模式**：输入昵称即可开始点餐
2. **员工模式**：使用密码 `1234` 进入管理后台

### 数据库管理
1. 以员工身份登录
2. 在菜单管理页面点击"数据库"按钮
3. 测试连接并初始化示例数据

### AI 助手使用
1. 点击右下角的 AI 助手按钮
2. 描述你的口味偏好
3. 获得个性化菜品推荐

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **路由管理**: React Router
- **数据库**: Supabase (PostgreSQL)
- **AI 服务**: Google Gemini
- **图标库**: Lucide React

## 📁 项目结构

```
├── components/          # 可复用组件
├── hooks/              # 自定义 Hooks
├── lib/                # 工具库和配置
├── scripts/            # 数据库脚本
├── types.ts            # TypeScript 类型定义
├── constants.ts        # 常量配置
└── App.tsx            # 主应用组件
```

## 🔧 开发指南

### 添加新菜品
```typescript
const newDish = await addDish({
  name: '新菜品',
  price: 25.00,
  category: DishCategory.MEAT,
  image: 'image-url',
  description: '美味描述'
});
```

### 处理订单
```typescript
await updateOrderStatus(orderId, 'cooking');
```

### 实时数据监听
```typescript
const { orders } = useDatabase();
// 订单数据自动实时更新
```

## 📚 详细文档

- [数据库配置指南](DATABASE_SETUP.md)
- [API 文档](lib/database.ts)
- [组件文档](components/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
