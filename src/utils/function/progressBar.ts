// 进度条工具类
import { DownloadProgress } from "./downloadWithProgress.ts";

export interface ProgressBarOptions {
  barLength?: number;
  showSpeed?: boolean;
  showEta?: boolean;
  showPercentage?: boolean;
  showBytes?: boolean;
}

export class ProgressBar {
  static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  private static formatTime(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }

  static async render(
    progress: DownloadProgress,
    options: ProgressBarOptions = {},
  ): Promise<void> {
    const {
      barLength = 40,
      showSpeed = true,
      showEta = true,
      showPercentage = true,
      showBytes = true,
    } = options;

    const filledLength = Math.round((progress.percentage / 100) * barLength);
    const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);

    let output = `\r[${bar}]`;

    if (showPercentage) {
      output += ` ${progress.percentage.toFixed(1)}%`;
    }

    if (showBytes) {
      const loaded = this.formatBytes(progress.loaded);
      const total = this.formatBytes(progress.total);
      output += ` | ${loaded}/${total}`;
    }

    if (showSpeed) {
      const speed = this.formatBytes(progress.speed);
      output += ` | ${speed}/s`;
    }

    if (showEta) {
      const eta = this.formatTime(progress.eta);
      output += ` | ETA: ${eta}`;
    }

    await Deno.stdout.write(new TextEncoder().encode(output));
  }

  // 预设的进度条样式
  static readonly presets = {
    // 简洁样式
    simple: (progress: DownloadProgress) =>
      ProgressBar.render(progress, {
        barLength: 30,
        showSpeed: false,
        showEta: false,
        showBytes: false,
      }),

    // 详细样式
    detailed: (progress: DownloadProgress) =>
      ProgressBar.render(progress, {
        barLength: 50,
        showSpeed: true,
        showEta: true,
        showPercentage: true,
        showBytes: true,
      }),

    // 默认样式
    default: (progress: DownloadProgress) =>
      ProgressBar.render(progress, {
        barLength: 40,
        showSpeed: true,
        showEta: true,
        showPercentage: true,
        showBytes: true,
      }),
  };
}
