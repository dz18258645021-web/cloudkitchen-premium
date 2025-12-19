# 🌐 CloudKitchen Premium 部署指南

## ✅ 部署成功！

你的应用现在已经在线：
- **主要地址 (国内可访问)**: https://cloudkitchen-premium.netlify.app
- **备用地址**: https://cloudkitchen-premium.vercel.app

## 🔧 配置环境变量 (重要)

为了让数据库和 AI 功能正常工作，需要在 Netlify 中设置环境变量：

### 1. 访问 Netlify 控制台
- 登录 https://app.netlify.com/projects/cloudkitchen-premium
- 点击 "Site settings"
- 选择 "Environment variables"

### 2. 添加环境变量
点击 "Add a variable" 添加以下变量：

```
VITE_SUPABASE_URL = https://sgkvrdqptqabfpeqonwp.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNna3ZyZHFwdHFhYmZwZXFvbndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDA0MTMsImV4cCI6MjA4MTAxNjQxM30.iq_koJbUv_FYh2HJXr2B2S2GSAXuy0ZNjsCvf-6YLis
GEMINI_API_KEY = 你的Gemini API密钥
```

### 3. 重新部署
添加环境变量后，点击 "Deploy" → "Trigger deploy" 重新部署应用。

## 📱 用户体验

### 桌面用户
- 完整的餐厅管理界面
- 员工可以管理菜单和订单
- 顾客可以浏览菜单和下单

### 移动用户
- 响应式设计，适配手机屏幕
- 可以"添加到主屏幕"获得原生应用体验
- 支持离线缓存 (PWA)

### iOS 用户
1. 用 Safari 打开网址
2. 点击底部分享按钮
3. 选择"添加到主屏幕"
4. 应用图标会出现在桌面上

### Android 用户
1. 用 Chrome 打开网址
2. 浏览器会自动提示"安装应用"
3. 点击"安装"即可

## 🔄 更新应用

当你修改代码后：

### 方法 1: 自动部署 (推荐)
- 推送代码到 GitHub
- Vercel 会自动检测并重新部署

### 方法 2: 手动部署
```bash
npm run build
vercel --prod
```

## 🎯 分享给用户

你可以把这个链接分享给任何人：
**https://cloudkitchen-premium.vercel.app**

他们可以：
- 立即使用，无需下载
- 在任何设备上访问
- 安装为手机应用
- 享受完整的餐厅管理功能

## 📊 监控和分析

在 Vercel 控制台中，你可以查看：
- 访问统计
- 性能指标
- 错误日志
- 部署历史

## 🚀 下一步

1. **设置环境变量** (确保数据库正常工作)
2. **测试所有功能** (点餐、管理、预约等)
3. **分享给用户** (发送链接)
4. **收集反馈** (根据用户使用情况优化)

你的 CloudKitchen Premium 现在是一个真正的在线应用了！🎉