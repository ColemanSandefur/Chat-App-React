import SocketIO, {io} from "socket.io-client";

const socket: SocketIO.Socket = io("http://localhost:5000", {
    withCredentials: true,
});

console.log("connected to server");

export {socket};