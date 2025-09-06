import downVideo from "./src/module/downVideo.ts";
import { IVideoInfor } from "./src/type/index.ts";
import { getProjectRoot } from "./src/utils/function/index.ts";

// qn参数已经失效，不论带不带cookie 都是 720p/360p
const videoInfor: IVideoInfor = {
  bvid: "BV1FaeLzjE3L",
  page: 1,
  type: "mp4",
  qn: "720p",
  downLoadSrc: "video",
};

videoInfor.page = videoInfor.page - 1;
videoInfor.downLoadSrc = getProjectRoot() + "/" + videoInfor.downLoadSrc;

try {
  await downVideo(videoInfor);
} catch (error) {
  console.error(error);
} finally {
  console.log("down");
}
