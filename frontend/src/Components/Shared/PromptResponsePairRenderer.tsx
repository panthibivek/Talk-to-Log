import React from "react";
import { StorePromptResponsePair } from "../../types";
import { Box, Container, Skeleton, Typography } from "@mui/material";
import styled from "@emotion/styled";

interface PromptResponsePairPropsInterface {
  promptResponsePair: StorePromptResponsePair;
  currentPrompt?: boolean;
}

const OverallContainer = styled(Box)({
  padding: 10,
  marginBottom: 10,
  position: "relative",
  border: "1px solid black",
  display: "flex",
  flexDirection: "column",
  borderRadius: 10,
});

const PromptContainer = (props: React.PropsWithChildren) => (
  <Container
    sx={{
      background: "#225071",
      opacity: 0.6,
      color: "#FFFFFF",
      borderRadius: 10,
    }}
  >
    {props.children}
  </Container>
);

const ResponseContainer = styled(Container)({
  color: "#000000",
  background: "#FFFFFF",
  borderRadius: 10,
});

const DatePresenter = styled(Typography)({
  color: "#b7aeae",
  alignSelf: "flex-end",
  fontSize: 10,
});

const PromptResponsePairRenderer: React.FC<
  PromptResponsePairPropsInterface
> = ({ promptResponsePair, currentPrompt = false }) => {
  const date = new Date(promptResponsePair.creationTimeStamp);
  return (
    <OverallContainer>
      <PromptContainer>
        <Typography variant="body1" textAlign={"left"}>
          {"> "}
          {promptResponsePair.prompt}
        </Typography>
      </PromptContainer>
      <ResponseContainer>
        <Typography variant="body1" textAlign={"left"}>
          {currentPrompt && promptResponsePair.response.length === 0 && (
            <Skeleton variant="text" />
          )}
          {promptResponsePair.response.length > 0 &&
            "> " + promptResponsePair.response}
        </Typography>
      </ResponseContainer>
      {!currentPrompt && (
        <DatePresenter variant="body2">{date.toUTCString()}</DatePresenter>
      )}
    </OverallContainer>
  );
};

export default PromptResponsePairRenderer;
