export type StorePromptResponsePair = {
  prompt: string;
  response: string;
  id: number;
  creationTimeStamp: number;
};

export type Notification = {
  text: string;
  type: "error" | "success" | "warn";
  timeStamp: number;
  acknowledged: boolean;
};
