import { DELETEARRAY } from "../const/index.ts";
import { getPlayUrl, getWebInterface } from "../server/index.ts";
import { IPlayUrlParams, IVideoInfor, QN } from "../type/index.ts";
import { DownloadManager, getRefererByBvid } from "../utils/function/index.ts";
import { ProgressBar } from "../utils/function/progressBar.ts";

const downVideo = async (item: IVideoInfor) => {
  /** # 基本信息 */
  const { bvid, qn, page, downLoadSrc } = item;
  const { data } = await getWebInterface(bvid);
  // 无分p的视频 数组长度为1
  const cid = data.pages.length > page
    ? data.pages[page].cid
    : data.pages[0].cid;
  const params: IPlayUrlParams = {
    bvid,
    cid,
    qn: QN[qn],
  };
  const playUrlData = await getPlayUrl(params);
  const playUrl = playUrlData.data.durl[0].url;
  const referer = getRefererByBvid(bvid);

  /** # 处理标题 */
  let videTitle = "";
  if (page > 0 && data.pages && data.pages[page]) {
    videTitle = data.pages[page].part;
  } else {
    videTitle = data.title;
  }
  // 删除 videTitle 中属于 DELETEARRAY 的字符
  videTitle = [...videTitle].filter((char) => !DELETEARRAY.includes(char)).join(
    "",
  );
  if (videTitle.length == 0) videTitle = "空标题";
  const downTarget = downLoadSrc + `/${videTitle}.mp4`;

  try {
    await Deno.stat(downTarget);
    console.log(`视频: ${videTitle} 已存在`);
    return Promise.resolve();
  } catch {
    // 文件不存在，继续下载
    console.log(`开始下载: ${videTitle}`);

    try {
      await DownloadManager.downloadToFile(playUrl, downTarget, {
        headers: {
          referer,
        },
        chunkSize: 2 * 1024 * 1024, // 2MB 分块
        progressStyle: "detailed", // 使用详细进度条样式
        onProgress: async (progress) => {
          await ProgressBar.presets.detailed(progress);
        },
      });

      console.log(`\n下载完成: ${videTitle}`);
    } catch (error) {
      console.error(`\n下载失败: ${videTitle}`, error);
      throw error;
    }
  }
};

export default downVideo;
