from typing import Any
from langchain.callbacks.base import AsyncCallbackHandler
import json

class StreamingLLMCallbackHandler(AsyncCallbackHandler):
    """Callback handler for streaming LLM responses."""

    def __init__(self, ws):
        self.ws = ws

    async def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        response = json.parse(token)
        await self.websocket.send_json({
            "type": "prompt-response",
            "data": token
        })