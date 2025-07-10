import { environment } from "~/environment";
import { AxiosClass } from "./axios";

export const ServerSideAxios = new AxiosClass({ baseURL: environment.API_URL });
