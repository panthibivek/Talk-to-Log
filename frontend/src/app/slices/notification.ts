import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Notification } from "../../types";

const notificationSlice = createSlice({
  name: "notificationSlice",
  initialState: {
    text: "",
    impacted: true,
    status: "success",
  },
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.impacted = false;
      state.status = action.payload.type;
      state.text = action.payload.text;
    },
    markAsImpacted: (state) => {
      state.impacted = true;
    },
  },
});

export const { addNotification, markAsImpacted } = notificationSlice.actions;

export const selectCurrentNotification = (state: RootState) =>
  state.notification;

export default notificationSlice.reducer;
