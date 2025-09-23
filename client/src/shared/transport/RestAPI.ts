import axios, { type AxiosResponse } from "axios";

type method = "GET" | "POST" | "PUT" | "DELETE";

class RestAPI {
  method: method = "GET";
  target: string = "";
  baseUrl: string = import.meta.env.VITE_BASE_API_URL;
  data: object = {};

  constructor() {}

  _setTarget = (url: string = "") => {
    if (url) {
      this.target = url;
    }
  };

  _send = (): Promise<AxiosResponse> => {
    return axios({
      url: this.baseUrl + this.target,
      method: this.method,
      data: this.data,
    });
  };

  get = (url: string = ""): Promise<AxiosResponse> => {
    this.method = "GET";
    this._setTarget(url);
    return this._send();
  };

  post = (url: string = "", data: object = {}): Promise<AxiosResponse> => {
    this.method = "POST";
    this._setTarget(url);
    this.data = data;
    return this._send();
  };
}

export default new RestAPI();
