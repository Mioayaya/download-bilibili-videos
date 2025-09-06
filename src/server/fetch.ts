// 用类封装一个 fetch 请求
class FetchWrapper {
  baseUrl: string;
  cookie: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
    this.cookie = "";
  }

  setCookie(cookie: string) {
    this.cookie = cookie;
  }

  // 为 request 方法添加泛型，避免 any 的使用
  async request<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<T> {
    // 合并 cookie 到 headers
    const headers = new Headers(options.headers || {});
    if (this.cookie) {
      headers.set("cookie", this.cookie);
    }
    const response = await fetch(this.baseUrl + url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Try to parse as JSON, fallback to text
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json() as Promise<T>;
    } else {
      return response.text() as unknown as T;
    }
  }
  /**
   * 构建带有查询参数的URL
   * @param url 基础url
   * @param params 查询参数对象
   * @returns 拼接后的url字符串
   */
  buildUrlWithParams<T extends object>(url: string, params?: T): string {
    if (!params) return url;
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        usp.append(key, String(value));
      }
    });
    const queryString = usp.toString();
    if (!queryString) return url;
    return url.includes("?")
      ? `${url}&${queryString}`
      : `${url}?${queryString}`;
  }

  get<T, S extends object>(
    url: string,
    params?: S,
    options: RequestInit = {},
  ): Promise<T> {
    const fullUrl = this.buildUrlWithParams(url, params);
    return this.request<T>(fullUrl, { ...options, method: "GET" });
  }

  post<T, B>(url: string, body: B, options: RequestInit = {}): Promise<T> {
    return this.request(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(body),
    });
  }
}

const fetchExample = new FetchWrapper("https://api.bilibili.com/x/");

export default fetchExample;
