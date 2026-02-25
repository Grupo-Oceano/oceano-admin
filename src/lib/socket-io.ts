import { io } from "socket.io-client";
import { environment } from "~/environment";

const socket = io(environment.API_URL);
