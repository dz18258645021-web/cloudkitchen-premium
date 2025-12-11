# 📱 移动应用构建指南

## 🚀 快速开始

你的 CloudKitchen Premium 应用现在已经配置为可以构建 iOS 和 Android 应用！

### 📋 前置要求

#### Android 开发
- **Android Studio** (推荐最新版本)
- **Java JDK 17** 或更高版本
- **Android SDK** (通过 Android Studio 安装)

#### iOS 开发 (仅限 macOS)
- **Xcode 14** 或更高版本
- **iOS 开发者账号** (用于发布到 App Store)

## 🔧 构建步骤

### Android 应用

#### 1. 在 Android Studio 中打开项目
```bash
npm run android
```
这会自动构建并在 Android Studio 中打开项目。

#### 2. 或者直接运行到设备
```bash
npm run android:run
```

#### 3. 手动构建 APK
1. 在 Android Studio 中：`Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. APK 文件位置：`android/app/build/outputs/apk/debug/app-debug.apk`

#### 4. 构建发布版本
1. 生成签名密钥：
```bash
keytool -genkey -v -keystore cloudkitchen-release-key.keystore -alias cloudkitchen -keyalg RSA -keysize 2048 -validity 10000
```

2. 在 `android/app/build.gradle` 中配置签名
3. 构建发布 APK：`Build` → `Generate Signed Bundle / APK`

### iOS 应用

#### 1. 在 Xcode 中打开项目
```bash
npm run ios
```

#### 2. 配置开发者账号
1. 在 Xcode 中选择项目
2. 在 "Signing & Capabilities" 中添加你的开发者账号
3. 选择合适的 Bundle Identifier

#### 3. 构建到设备
1. 连接 iOS 设备
2. 在 Xcode 中选择设备
3. 点击 "Run" 按钮

#### 4. 构建发布版本
1. 在 Xcode 中：`Product` → `Archive`
2. 使用 Organizer 上传到 App Store Connect

## 📱 应用配置

### 应用信息
- **应用名称**: CloudKitchen Premium
- **包名**: com.cloudkitchen.premium
- **版本**: 1.0.0

### 权限配置

应用可能需要以下权限：
- **网络访问**: 连接 Supabase 数据库
- **相机**: 上传菜品图片 (如果启用)
- **存储**: 缓存数据

### 环境变量

确保在构建前设置正确的环境变量：
```bash
# .env.local
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
GEMINI_API_KEY=你的Gemini API密钥
```

## 🎨 自定义配置

### 应用图标
1. 准备 1024x1024 的 PNG 图标
2. 使用在线工具生成各种尺寸：https://capacitorjs.com/docs/guides/splash-screens-and-icons
3. 替换 `android/app/src/main/res/` 和 `ios/App/App/Assets.xcassets/` 中的图标

### 启动屏幕
1. 准备 2732x2732 的启动屏幕图片
2. 配置 `capacitor.config.ts` 中的 SplashScreen 插件

### 应用主题
在 `capacitor.config.ts` 中配置：
```typescript
plugins: {
  StatusBar: {
    style: 'dark',
    backgroundColor: "#006241"
  }
}
```

## 🚀 发布应用

### Android (Google Play Store)
1. 构建签名的 AAB 文件
2. 在 Google Play Console 创建应用
3. 上传 AAB 文件
4. 填写应用信息和截图
5. 提交审核

### iOS (App Store)
1. 在 App Store Connect 创建应用
2. 使用 Xcode Archive 功能
3. 上传到 App Store Connect
4. 填写应用信息和截图
5. 提交审核

## 🔄 更新应用

当你更新 Web 应用时：

1. 构建新版本：
```bash
npm run build
```

2. 同步到移动平台：
```bash
npx cap sync
```

3. 重新构建移动应用

## 📋 常见问题

### Android 构建失败
- 检查 Java JDK 版本
- 确保 Android SDK 已正确安装
- 清理项目：`cd android && ./gradlew clean`

### iOS 构建失败
- 检查 Xcode 版本
- 确保开发者证书有效
- 清理项目：`Product` → `Clean Build Folder`

### 网络请求失败
- 检查 `capacitor.config.ts` 中的 `androidScheme`
- 确保 HTTPS 配置正确
- 检查网络权限

## 📞 技术支持

- Capacitor 官方文档：https://capacitorjs.com/docs
- Android 开发文档：https://developer.android.com
- iOS 开发文档：https://developer.apple.com

---

🎉 恭喜！你现在可以将 CloudKitchen Premium 发布为原生移动应用了！