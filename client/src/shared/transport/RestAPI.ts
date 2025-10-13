import axios, { type AxiosResponse } from "axios";
import { USER_LS_KEY } from "@entities/user/model/constants.ts";

type method = "GET" | "POST" | "PUT" | "DELETE";

class RestAPI {
  method: method = "GET";
  target: string = "";
  baseUrl: string = import.meta.env.VITE_BASE_API_URL;
  data: object = {};
  token: string = "";

  constructor() {}

  _checkToken = () => {
    const userLS = localStorage.getItem(USER_LS_KEY);
    if (userLS) {
      this.token =
        userLS && JSON.parse(userLS) ? JSON.parse(userLS).token : null;
    } else {
      this.token = "";
    }
  };

  _setTarget = (url: string = "") => {
    if (url) {
      this.target = url;
    }
  };

  _send = (): Promise<AxiosResponse> => {
    this._checkToken();
    const data: {
      url: string;
      method: string;
      data: object;
      headers?: object;
    } = {
      url: this.baseUrl + this.target,
      method: this.method,
      data: this.data,
    };
    if (this.token) {
      data.headers = {
        Authorization: `Bearer ${this.token}`,
      };
    }
    return axios(data);
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
