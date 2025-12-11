# 🖥️ Windows 用户构建 iOS 应用指南

由于 iOS 应用只能在 macOS 上使用 Xcode 构建，Windows 用户需要使用替代方案。

## 🌟 推荐方案

### 方案 1: Ionic Appflow (云构建) ⭐

**优点**: 无需 Mac，完全在云端构建
**费用**: 免费套餐可用，付费套餐功能更多

#### 步骤：
1. **注册 Ionic 账号**
   - 访问 https://ionic.io/
   - 创建免费账号

2. **初始化 Ionic 项目**
```bash
ionic init
```

3. **连接到 Appflow**
```bash
ionic link
```

4. **推送代码并构建**
```bash
git add .
git commit -m "Initial commit"
git push ionic main
```

5. **在 Appflow 控制台构建 iOS 应用**
   - 登录 https://dashboard.ionicframework.com/
   - 选择你的应用
   - 点击 "Build" → "iOS"
   - 下载构建好的 IPA 文件

### 方案 2: GitHub Actions (免费) 🆓

使用 GitHub 的 macOS 虚拟机来构建 iOS 应用。

#### 步骤：
1. **推送代码到 GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/cloudkitchen-premium.git
git push -u origin main
```

2. **设置 GitHub Secrets**
   - 在 GitHub 仓库中：Settings → Secrets and variables → Actions
   - 添加以下 secrets：
     - `VITE_SUPABASE_URL`: 你的 Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: 你的 Supabase 密钥
     - `GEMINI_API_KEY`: 你的 Gemini API 密钥

3. **触发构建**
   - 推送代码到 main 分支
   - 或在 Actions 页面手动触发
   - 等待构建完成（约 10-15 分钟）

4. **下载 IPA 文件**
   - 在 Actions 页面找到完成的构建
   - 下载 "CloudKitchen-iOS" 文件

### 方案 3: 在线构建服务

#### Codemagic (推荐)
- 网址: https://codemagic.io/
- 免费套餐: 每月 500 分钟构建时间
- 支持 Capacitor 项目

#### Bitrise
- 网址: https://www.bitrise.io/
- 免费套餐可用
- 专业的 CI/CD 平台

### 方案 4: 租用 Mac 云服务

#### MacStadium
- 按小时租用 Mac 服务器
- 适合偶尔构建的需求

#### AWS EC2 Mac 实例
- 亚马逊云的 Mac 虚拟机
- 按需付费

## 🚀 当前可用操作 (Windows)

### 立即可以做的：

1. **构建 Android 应用**
```bash
npm run android
```

2. **测试 Web 应用**
```bash
npm run dev
```

3. **准备 iOS 构建**
```bash
npm run build
npx cap sync ios
```

### 推荐的工作流程：

1. **开发阶段**: 在 Windows 上开发和测试 Web 版本
2. **Android 测试**: 使用 Android Studio 构建和测试
3. **iOS 构建**: 使用上述云服务构建 iOS 版本
4. **发布**: 将构建好的应用发布到应用商店

## 💡 小贴士

- **优先开发 Android 版本**: 在 Windows 上可以完整开发和测试
- **使用 PWA**: 考虑将应用发布为 PWA，iOS 用户可以"添加到主屏幕"
- **找朋友帮忙**: 如果有朋友有 Mac，可以请他们帮忙构建
- **考虑购买 Mac**: 如果长期开发 iOS 应用，投资一台 Mac 是值得的

## 📱 PWA 替代方案

作为 iOS 应用的替代，你可以优化 PWA (Progressive Web App)：

1. **添加 PWA 配置**
2. **优化移动端体验**
3. **支持离线功能**
4. **iOS 用户可以"添加到主屏幕"**

这样 iOS 用户也能获得接近原生应用的体验！
