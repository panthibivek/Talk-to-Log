import ChatScreen from "./Components/RouteLevel/ChatScreen";
import UploadScreen from "./Components/RouteLevel/UploadScreen";

const routeConfig = [
  {
    path: "/chats/:logFileName",
    element: <ChatScreen />,
  },
  {
    path: "/upload",
    element: <UploadScreen />,
  },
];

export default routeConfig;
