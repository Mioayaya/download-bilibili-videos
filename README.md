# Bilibili 视频下载器

一个基于 Deno 的 Bilibili 视频下载工具，支持进度条显示和分块下载。

## 功能特性

- ✅ **视频信息获取** - 自动获取视频标题
- ✅ **进度条显示** - 实时显示下载进度、速度和剩余时间
- ✅ **分块下载** - 支持大文件分块下载，提高下载效率
- ✅ **文件检查** - 自动检查文件是否已存在，避免重复下载
- ✅ **标题处理** - 自动清理文件名中windows不允许的特殊字符
- ✅ **多分P支持** - 支持下载多分P视频的指定分P

## 安装要求

- [Deno](https://deno.land/) 1.0 或更高版本

## 使用方法

### 1. 克隆项目

```bash
git clone git@github.com:Mioayaya/download-bilibili-videos.git
cd bilibiliVideo
```

### 2. 配置下载参数

编辑 `app.ts` 文件中的 `downVideo` 对象：

```typescript
const downVideo: IDownVideo = {
  bvid: "BV1hU4y1G7Fn", // Bilibili 视频 BV 号
  page: 2, // 分P 页码（从1开始）
  type: "mp4", // 下载格式
  qn: "720p", // 视频质量
  downLoadSrc: "video", // 下载目录
};
```

### 3. 运行下载

```bash
# 使用 deno task
deno task start

# 或直接运行
deno run --allow-net --allow-read --allow-write app.ts
```

## 配置说明

### ~~视频质量选项~~

现qn参数已经失效，无论是否携带cookie都只能下载720p，360p

```typescript
const QN = {
  "4k": 120,
  "1080p60": 116,
  "720p60": 74,
  "1080p+": 112,
  "1080p": 80,
  "720p": 64,
  "480p": 32,
  "360p": 16,
};
```

### 下载参数

- `bvid`: Bilibili 视频的 BV 号
- `page`: 分P 页码（1 表示第1P，2 表示第2P，以此类推）
- `type`: 下载格式，支持 "mp4"、"mp3"、"all"
- ~~`qn`: 视频质量，参考上面的质量选项~~
- `downLoadSrc`: 下载目录名称

## 核心功能

### 1. 视频信息获取

```typescript
const { data } = await getWebInterface(bvid);
// 获取视频标题、分P信息、CID等
```

### 2. 播放地址获取

```typescript
const playUrlData = await getPlayUrl({
  bvid,
  cid: data.cid,
  qn: QN[qn],
});
```

### 3. 分块下载

```typescript
await DownloadManager.downloadToFile(playUrl, filePath, {
  headers: { referer },
  chunkSize: 2 * 1024 * 1024, // 2MB 分块
  progressStyle: "detailed", // 进度条样式: simple | default | detailed
  onProgress: async (progress) => {
    // 自定义进度显示
    await ProgressBar.presets.detailed(progress);
  },
});
```

### 4. 进度条样式

```typescript
import { ProgressBar } from "./src/utils/function/index.ts";

// 预设样式
await ProgressBar.presets.simple(progress); // 简洁样式
await ProgressBar.presets.default(progress); // 默认样式
await ProgressBar.presets.detailed(progress); // 详细样式

// 自定义样式
await ProgressBar.render(progress, {
  barLength: 30,
  showSpeed: true,
  showEta: true,
  showPercentage: true,
  showBytes: true,
});
```

## 进度条显示

程序支持多种进度条样式：

### 简洁样式

```
[███████████████░░░░░░░░░░░░░░░] 50.0%
```

### 默认样式

```
[████████████████████░░░░░░░░░░░░░░░░░░░░] 50.0% | 5 MB/10 MB | 2 MB/s | ETA: 3s
```

### 详细样式

```
[█████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░] 50.0% | 5 MB/10 MB | 2 MB/s | ETA: 3s
```

### 自定义样式

```typescript
await ProgressBar.render(progress, {
  barLength: 20, // 进度条长度
  showSpeed: false, // 不显示速度
  showEta: true, // 显示剩余时间
  showPercentage: true, // 显示百分比
  showBytes: true, // 显示字节数
});
```

## 注意事项

1. **网络权限**：需要 `--allow-net` 权限访问 Bilibili API
2. **文件权限**：需要 `--allow-read` 和 `--allow-write` 权限读写文件
3. **视频质量**：某些视频可能不支持指定的质量选项
4. **分P视频**：确保指定的分P页码存在

[参考文章][B站API学习]

[B站API学习]: https://www.bilibili.com/read/cv6415114/
