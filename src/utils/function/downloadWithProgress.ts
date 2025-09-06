// 下载工具类，支持进度条和分块下载
import { ProgressBar } from "./progressBar.ts";

export interface DownloadOptions {
  url: string;
  headers?: Record<string, string>;
  chunkSize?: number; // 分块大小，默认 1MB
  onProgress?: (progress: DownloadProgress) => void;
  progressStyle?: "simple" | "detailed" | "default"; // 进度条样式
}

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  eta: number; // estimated time remaining in seconds
}

export class DownloadManager {
  private static async updateProgressBar(
    progress: DownloadProgress,
    style: "simple" | "detailed" | "default" = "default",
  ): Promise<void> {
    await ProgressBar.presets[style](progress);
  }

  static async downloadWithProgress(
    options: DownloadOptions,
  ): Promise<Uint8Array> {
    const {
      url,
      headers = {},
      chunkSize = 1024 * 1024,
      onProgress,
      progressStyle = "default",
    } = options;

    // 首先获取文件大小
    const headResponse = await fetch(url, {
      method: "HEAD",
      headers,
    });

    if (!headResponse.ok) {
      throw new Error(`HTTP error! status: ${headResponse.status}`);
    }

    const totalSize = parseInt(
      headResponse.headers.get("content-length") || "0",
    );
    const supportsRange = headResponse.headers.get("accept-ranges") === "bytes";

    console.log(`\n文件大小: ${ProgressBar.formatBytes(totalSize)}`);
    console.log(`支持分块下载: ${supportsRange ? "是" : "否"}`);

    if (totalSize === 0) {
      throw new Error("无法获取文件大小");
    }

    const startTime = Date.now();
    let loaded = 0;
    const chunks: Uint8Array[] = [];

    if (supportsRange && totalSize > chunkSize) {
      // 分块下载
      console.log("使用分块下载...");
      const numChunks = Math.ceil(totalSize / chunkSize);

      for (let i = 0; i < numChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize - 1, totalSize - 1);

        const response = await fetch(url, {
          headers: {
            ...headers,
            "Range": `bytes=${start}-${end}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const chunk = new Uint8Array(await response.arrayBuffer());
        chunks.push(chunk);
        loaded += chunk.length;

        const elapsed = (Date.now() - startTime) / 1000;
        const speed = loaded / elapsed;
        const eta = (totalSize - loaded) / speed;
        const percentage = (loaded / totalSize) * 100;

        const progress: DownloadProgress = {
          loaded,
          total: totalSize,
          percentage,
          speed,
          eta,
        };

        if (onProgress) {
          onProgress(progress);
        } else {
          await this.updateProgressBar(progress, progressStyle);
        }
      }
    } else {
      // 普通下载
      console.log("使用普通下载...");
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法获取响应流");
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        loaded += value.length;

        const elapsed = (Date.now() - startTime) / 1000;
        const speed = loaded / elapsed;
        const eta = (totalSize - loaded) / speed;
        const percentage = (loaded / totalSize) * 100;

        const progress: DownloadProgress = {
          loaded,
          total: totalSize,
          percentage,
          speed,
          eta,
        };

        if (onProgress) {
          onProgress(progress);
        } else {
          await this.updateProgressBar(progress, progressStyle);
        }
      }
    }

    console.log("\n下载完成！");

    // 合并所有分块
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  static async downloadToFile(
    url: string,
    filePath: string,
    options: Omit<DownloadOptions, "url"> = {},
  ): Promise<void> {
    const data = await this.downloadWithProgress({ url, ...options });

    // 确保目录存在
    const dir = filePath.substring(0, filePath.lastIndexOf("/"));
    try {
      await Deno.mkdir(dir, { recursive: true });
    } catch {
      // 目录可能已存在
    }

    // 写入文件
    await Deno.writeFile(filePath, data);
  }
}
