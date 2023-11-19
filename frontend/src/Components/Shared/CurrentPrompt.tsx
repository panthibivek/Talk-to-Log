import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  clearCurrentPrompt,
  selectCurrentPrompt,
  updateResponse,
} from "../../app/slices/currentPrompt";
import PromptResponsePairRenderer from "./PromptResponsePairRenderer";
import { StorePromptResponsePair } from "../../types";
import Socket from "../../utils/Socket";
import { addPromptResponsePair } from "../../app/slices/promptResponses";

const CurrentPrompt: React.FC<{}> = () => {
  const currentPrompt = useAppSelector(selectCurrentPrompt);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    Socket.registerHandler("prompt-response", (promptResponse: string) => {
      const element = document.getElementById("PrevPromptsPresenterSegment");
      if (element) {
        element.scrollTop = element.scrollHeight - element.clientHeight;
        console.log("Element found");
      } else {
        console.error("Element not found");
      }
      dispatch(updateResponse(promptResponse));
    });
    Socket.registerHandler(
      "prompt-response-end",
      (promptResponsePairFromDB: StorePromptResponsePair) => {
        dispatch(addPromptResponsePair(promptResponsePairFromDB));
        dispatch(clearCurrentPrompt());
      }
    );
    // eslint-disable-next-line
  }, []);

  const transientPromptPairObject: StorePromptResponsePair =
    React.useMemo(() => {
      return {
        id: -1,
        prompt: currentPrompt.prompt,
        response: currentPrompt.response.length ? currentPrompt.response : "",
        creationTimeStamp: 0,
      };
    }, [currentPrompt]);

  if (currentPrompt.prompt.length === 0) {
    return <></>;
  } else {
    return (
      <PromptResponsePairRenderer
        promptResponsePair={transientPromptPairObject}
        currentPrompt={true}
      />
    );
  }
};

export default CurrentPrompt;
