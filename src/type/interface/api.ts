export interface IWebInterface {
  code: number;
  message: string;
  data: {
    bvid: string;
    aid: number;
    title: string;
    cid: number;
    pages: {
      cid: number;
      page: number;
      part: string; // 分p 标题
    }[];
  };
}

export interface IPlayUrl {
  data: {
    durl: {
      url: string;
    }[];
  };
}

export interface IPlayUrlParams {
  bvid: string;
  cid: number;
  qn: number;
}
