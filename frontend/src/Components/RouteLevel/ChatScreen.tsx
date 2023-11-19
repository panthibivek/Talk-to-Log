import { Container, TextField, IconButton, Typography } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import { selectPromptResponsePairs } from "../../app/slices/promptResponses";
import React, { ChangeEvent } from "react";
import styled from "@emotion/styled";
import PromptResponsePairRenderer from "../Shared/PromptResponsePairRenderer";
import { initialize as initializeHistory } from "../../app/slices/promptResponses";
import SendIcon from "@mui/icons-material/Send";
import { useAppDispatch } from "../../app/hooks";
import { StorePromptResponsePair } from "../../types";
import CurrentPrompt from "../Shared/CurrentPrompt";
import {
  selectCurrentPrompt,
  setPromptProgress,
  updatePrompt,
} from "../../app/slices/currentPrompt";
import { useParams } from "react-router-dom";
import SummarySelector from "../Shared/SummarySelector";
import Socket from "../../utils/Socket";

const ChatScreenContainer = styled(Container)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100%",
});

const PrevPromptsPresenterSegment = styled(Container)({
  marginTop: 10,
  flex: 9,
  maxHeight: 640,
  overflowY: "auto",
});

const PromptEntrySegment = styled(Container)({
  flex: 1,
  padding: 10,
  width: "100%",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});

const PromptEntryArea = styled(TextField)({
  width: "100%",
});

const ChatScreen: React.FC<{}> = () => {
  const promptResponsePairs = useAppSelector(selectPromptResponsePairs);
  const currentPromptResponseInfo = useAppSelector(selectCurrentPrompt);
  const dispatch = useAppDispatch();

  const { logFileName } = useParams();

  React.useEffect(() => {
    const sampleHistory: StorePromptResponsePair[] = [
      {
        prompt: "Where are you?",
        response: "In the cloud",
        creationTimeStamp: 1700341428160,
        id: 0,
      },
      // {
      //   prompt: "Where are you?",
      //   response: "In the cloud",
      //   creationTimeStamp: "2023-11-18T11:20:47.131Z",
      //   id: 1,
      // },
      // {
      //   prompt: "Where are you?",
      //   response: "In the cloud",
      //   creationTimeStamp: "2023-11-18T11:20:47.131Z",
      //   id: 2,
      // },
    ];

    dispatch(initializeHistory(sampleHistory));
    // eslint-disable-next-line
  }, []);

  const [prompt, setPrompt] = React.useState<string>("");

  const onPromptChange = (newVal: ChangeEvent<HTMLInputElement>) => {
    const newPrompt = newVal.target.value;
    setPrompt(newPrompt);
    if (newPrompt[newPrompt.length - 1] === "\n") {
      handlePrompt();
    }
  };

  const handlePrompt = () => {
    console.log("Generating response for", prompt);
    setPrompt("");
    dispatch(setPromptProgress());
    dispatch(updatePrompt(prompt));
    const ws: WebSocket = Socket.getInstance();
    const wsMsg = {
      type: "prompt",
      data: prompt,
    };
    ws.send(JSON.stringify(wsMsg));
  };

  return (
    <ChatScreenContainer>
      <Typography variant="h4" textAlign="left">
        You are talking to log file: <b>{logFileName}</b>
      </Typography>
      <PrevPromptsPresenterSegment id="PrevPromptsPresenterSegment">
        {promptResponsePairs.map((promptResponsePair, index) => (
          <PromptResponsePairRenderer
            key={index}
            promptResponsePair={promptResponsePair}
          />
        ))}
        <CurrentPrompt />
      </PrevPromptsPresenterSegment>
      <PromptEntrySegment>
        <PromptEntryArea
          disabled={currentPromptResponseInfo.inProgress}
          onChange={onPromptChange}
          value={prompt}
          label="Chat with the log file"
          multiline
          maxRows={5}
        />
        <IconButton onClick={handlePrompt}>
          <SendIcon />
        </IconButton>
      </PromptEntrySegment>
      <SummarySelector />
    </ChatScreenContainer>
  );
};

export default ChatScreen;
