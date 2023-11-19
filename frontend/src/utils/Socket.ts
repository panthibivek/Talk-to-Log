import { BACKEND_URL_DOMAIN_NAME } from "../config";

type WSCommonProtocolMsg = {
  type: string;
  data: any;
};

class Socket {
  private static instance: WebSocket = new WebSocket(
    "ws://" + BACKEND_URL_DOMAIN_NAME + "/chat"
  );
  private static initialized: boolean = false;

  private constructor() {}

  private static handlers: { [key: string]: (data: any) => void } = {};

  static getInstance() {
    if (!Socket.initialized) {
      this.instance.onmessage = (event) => {
        const msg: WSCommonProtocolMsg = JSON.parse(event.data);
        Socket.handlers[msg.type](msg.data);
      };
    }
    return Socket.instance;
  }

  static registerHandler(event_name: string, handler: (event: any) => void) {
    this.handlers[event_name] = handler;
  }
}

export default Socket;
