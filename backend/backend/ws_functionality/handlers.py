import asyncio
import random
from fastapi import WebSocket
import logging
from time import time
from typing import Any
from langchain.callbacks.base import AsyncCallbackHandler
import json

logger = logging.getLogger(__name__)
import json

class StreamCallback(AsyncCallbackHandler):

    def __init__(self, ws):
        self.ws = ws

    async def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        await self.ws.send_json({
            "type": "prompt-response",
            "data": token
        })

async def stream_data_function(prompt, num_chunks):
    for i in range(num_chunks):
        logger.info(f"CHUNK {i} out of {num_chunks}")
        random_wait = random.randint(0, 2)
        await asyncio.sleep(random_wait)
        yield f"{prompt}, achha hai!!"


async def handle_prompt(prompt, websocket: WebSocket, msgType: str):
    num_chunks = random.randint(1, 10)
    final_response = ""
    i = 1
    async for stream_chunk in stream_data_function(prompt, num_chunks):
        logger.info(f"CHUNK {i}/{num_chunks}, chunk = {stream_chunk}")
        i += 1
        response = {
            "type": msgType + "-response",
            "data": f"{stream_chunk}, achaa hai!!",
        }
        final_response += stream_chunk
        await websocket.send_json(response)
    # handle end of stream
    response = {
        "type": msgType + "-response-end",
        "data": {
            "prompt": prompt,
            "response": final_response,
            "id": random.randint(0, 1000),
            "creationTimeStamp": time() * 1000,
        },
    }
    await websocket.send_json(response)
    return None

async def handle_summary(prompt, websocket: WebSocket, msgType: str):
    pass