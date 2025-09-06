export const QN = {
  "4k": 120,
  "1080p60": 116,
  "720p60": 74,
  "1080p+": 112,
  "1080p": 80,
  "720p": 64,
  "480p": 32,
  "360p": 16,
};

export interface IVideoInfor {
  bvid: string;
  page: number;
  type: "mp4" | "mp3" | "all";
  qn: IQn; // 这里的类型应该是 QN的值
  downLoadSrc: string;
}

export type IQn = keyof typeof QN;
