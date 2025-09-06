// 获取项目根目录
export const getProjectRoot = (): string => {
  return Deno.cwd();
};

// 获取当前文件所在目录（传入文件URL）
export const getCurrentDir = (fileUrl?: string): string => {
  const url = fileUrl || import.meta.url;
  const currentDir = new URL(".", url).pathname;

  // 在 Windows 上处理路径
  if (currentDir.startsWith("/")) {
    const normalizedPath = currentDir.slice(1);
    return normalizedPath;
  }

  return currentDir;
};
