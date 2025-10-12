import { AxiosError } from "axios";

type errorType = string | AxiosError | Error | unknown;
export const HandlerAxiosError = (e: errorType) => {
  if (typeof e === "string") {
    console.log("string error");
    throw new Error(e.toUpperCase());
  } else if (e instanceof AxiosError || e instanceof Error) {
    throw new Error("Error in request");
    //throw new Error(e?.response?.data.message);
  } /*else if (e instanceof Error) {
    throw new Error(e.message);
  }*/
};
