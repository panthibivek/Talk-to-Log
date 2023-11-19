import { configureStore } from "@reduxjs/toolkit";
import promptResponsePairReducer from "./slices/promptResponses";
import currentPromptReducer from "./slices/currentPrompt";
import notificationReducer from "./slices/notification";

const Store = configureStore({
  reducer: {
    promptResponsePairs: promptResponsePairReducer,
    currentPrompt: currentPromptReducer,
    notification: notificationReducer,
  },
});

export default Store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof Store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof Store.dispatch;
