import { IPlayUrlParams, IWebInterface } from "../../type/index.ts";
import { IPlayUrl } from "../../type/interface/api.ts";
import fetchExample from "../fetch.ts";

// 获取视频信息: 标题、cid 等
const getWebInterface = (bvid: string) => {
  return fetchExample.get<IWebInterface, { bvid: string }>(
    "web-interface/view",
    { bvid },
  );
};

const getPlayUrl = (params: IPlayUrlParams) => {
  return fetchExample.get<IPlayUrl, IPlayUrlParams>(
    "player/playurl",
    { ...params },
  );
};

export { getPlayUrl, getWebInterface };
