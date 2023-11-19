import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
} from "@reduxjs/toolkit";
import { StorePromptResponsePair } from "../../types";
import { RootState } from "../store";

const promptResponsePairAdapter = createEntityAdapter<StorePromptResponsePair>({
  selectId: (promptResponsePair) => promptResponsePair.id,
  sortComparer: (promptResponsePair1, promptResponsePair2) =>
    promptResponsePair1.creationTimeStamp -
    promptResponsePair2.creationTimeStamp,
});

const promptResponsePairSlice = createSlice({
  name: "promptResponsePair",
  initialState: promptResponsePairAdapter.getInitialState(),
  reducers: {
    initialize: (state, action: PayloadAction<StorePromptResponsePair[]>) => {
      const storePromptResponsePairs = action.payload.map((prPair) => ({
        id: prPair.id,
        prompt: prPair.prompt,
        response: prPair.response,
        creationTimeStamp: prPair.creationTimeStamp,
      }));

      promptResponsePairAdapter.addMany(state, storePromptResponsePairs);
    },
    addPromptResponsePair: (
      state,
      action: PayloadAction<StorePromptResponsePair>
    ) => {
      promptResponsePairAdapter.addOne(state, {
        id: action.payload.id,
        prompt: action.payload.prompt,
        response: action.payload.response,
        creationTimeStamp: action.payload.creationTimeStamp,
      });
    },
  },
});

export const { initialize, addPromptResponsePair } =
  promptResponsePairSlice.actions;

export default promptResponsePairSlice.reducer;

export const selectPromptResponsePairs = (state: RootState) =>
  promptResponsePairAdapter.getSelectors().selectAll(state.promptResponsePairs);
