import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

const currentPromptSlice = createSlice({
  name: "currentPromptSlice",
  initialState: {
    prompt: "",
    response: "",
    inProgress: false,
  },
  reducers: {
    updatePrompt: (state, action: PayloadAction<string>) => {
      state.prompt = action.payload;
    },
    updateResponse: (state, action: PayloadAction<string>) => {
      state.response += action.payload;
    },
    setPromptProgress: (state) => {
      state.inProgress = true;
    },
    clearCurrentPrompt: (state) => {
      state.prompt = "";
      state.response = "";
      state.inProgress = false;
    },
  },
});

export const {
  updatePrompt,
  updateResponse,
  clearCurrentPrompt,
  setPromptProgress,
} = currentPromptSlice.actions;

export const selectCurrentPrompt = (state: RootState) => state.currentPrompt;

export default currentPromptSlice.reducer;
