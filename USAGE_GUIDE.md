# CloudKitchen 使用指南

## 🎯 立即体验

你的应用现在已经升级为支持云数据库的完整系统！

### 当前状态
- ✅ 应用正在运行：http://localhost:3000/
- ✅ 自动使用模拟数据库（因为未配置 Supabase）
- ✅ 所有功能完全可用

## 🚀 快速开始

### 1. 顾客体验
1. 访问 http://localhost:3000/
2. 选择"我是顾客"
3. 输入任意昵称
4. 开始浏览菜单、添加购物车、下单

### 2. 员工管理
1. 选择"我是员工"
2. 输入密码：`1234`
3. 进入管理后台
4. 可以管理菜品、查看订单、处理预约

### 3. 数据库管理
1. 以员工身份登录
2. 点击"数据库"按钮
3. 查看当前使用的数据库类型
4. 测试连接状态

## 🔧 升级到云数据库

### 方法一：使用 Supabase（推荐）

1. **创建 Supabase 项目**
   - 访问 [supabase.com](https://supabase.com)
   - 注册并创建新项目

2. **初始化数据库**
   - 在 Supabase SQL 编辑器中运行 `scripts/init-database.sql`

3. **配置环境变量**
   ```env
   VITE_SUPABASE_URL=你的项目URL
   VITE_SUPABASE_ANON_KEY=你的匿名密钥
   ```

4. **重启应用**
   ```bash
   npm run dev
   ```

### 方法二：其他数据库
- 可以修改 `lib/database.ts` 适配其他数据库
- 支持 PostgreSQL、MySQL、SQLite 等

## 📱 功能演示

### 智能点餐流程
1. 浏览菜单 → 分类筛选
2. 添加购物车 → 数量调整
3. AI 助手推荐 → 个性化建议
4. 确认订单 → 支付流程
5. 实时追踪 → 状态更新

### 后厨管理流程
1. 查看新订单 → 接单处理
2. 更新制作状态 → 实时同步
3. 管理菜品库存 → 上架下架
4. 处理预约信息 → 确认安排

## 🎨 自定义配置

### 修改主题色彩
编辑 `tailwind.config.js`：
```js
theme: {
  extend: {
    colors: {
      primary: '#your-color'
    }
  }
}
```

### 添加新菜品分类
编辑 `types.ts`：
```typescript
export enum DishCategory {
  MEAT = '招牌硬菜',
  VEG = '时令素食',
  SOUP = '暖心汤面',
  DRINK = '特调饮品',
  DESSERT = '精美甜品' // 新增
}
```

### 配置 AI 助手
编辑 `.env.local`：
```env
GEMINI_API_KEY=your-actual-api-key
```

## 🔍 故障排除

### 常见问题

**Q: 页面显示空白？**
A: 检查浏览器控制台错误，确认所有依赖已安装

**Q: AI 助手无响应？**
A: 检查 Gemini API 密钥是否正确配置

**Q: 数据不保存？**
A: 当前使用模拟数据库，重启后数据会重置。配置 Supabase 可持久化数据

**Q: 订单状态不更新？**
A: 模拟环境下每5秒自动更新，Supabase 环境下实时更新

### 开发调试

1. **查看控制台日志**
   - 打开浏览器开发者工具
   - 查看 Console 标签页

2. **检查网络请求**
   - 查看 Network 标签页
   - 确认 API 请求状态

3. **数据库连接测试**
   - 员工后台 → 数据库管理 → 测试连接

## 📈 性能优化

### 生产环境部署
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 数据库优化
- 启用 Supabase 实时功能
- 配置适当的索引
- 设置数据缓存策略

## 🤝 技术支持

- 查看 [DATABASE_SETUP.md](DATABASE_SETUP.md) 了解数据库配置
- 查看 [README.md](README.md) 了解项目详情
- 检查代码注释获取实现细节

---

**享受你的云端餐厅管理系统！** 🍽️✨