from fastapi import FastAPI, WebSocket, UploadFile
from fastapi.responses import HTMLResponse
import json
from ws_functionality.handlers import handle_prompt
from typing import Dict
import logging
import os
from fastapi.middleware.cors import CORSMiddleware
import pickle
from Chatbot.logSplitter import create_faiss_for_logs
from Chatbot.connectToLlm import connect_to_llm
from langchain.docstore.document import Document
from Chatbot.logSplitter import create_preliminary_split, create_faiss_for_logs
import os
from ws_functionality.handlers import StreamCallback
import random
from time import time

CONFIG = {
    "LOG_FILES_PATH": os.path.join(os.getcwd(), "logfiles"),
    "FILEREAD_CHUNK_SIZE": 1024,
}
WS_HANDLERS = {"prompt": handle_prompt}
CORS_ORIGIN_WHITELIST = ["http://localhost:3000", "http://127.0.0.1:3000"]

if not os.path.isdir(CONFIG["LOG_FILES_PATH"]):
    os.mkdir(CONFIG["LOG_FILES_PATH"])

logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGIN_WHITELIST,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

faiss_vectorstore = None
chat_history = None

@app.post("/file_upload")
async def file_upload(file: UploadFile):
    try:
        with open(
            os.path.join(CONFIG["LOG_FILES_PATH"], file.filename), "wb"
        ) as fs_file:
            while True:
                data = await file.read(CONFIG["FILEREAD_CHUNK_SIZE"])
                if not data:
                    break
                fs_file.write(data)
        global faiss_vectorstore
        faiss_store_filename = os.path.join("Chatbot/vectorstores/", f"faiss_{file.filename}.pkl")
        if os.path.isfile(faiss_store_filename):
            with open(faiss_store_filename, "rb") as f:
                faiss_vectorstore = pickle.load(f)
        else:
            preliminary_split = create_preliminary_split(os.path.join(CONFIG["LOG_FILES_PATH"], file.filename))
            faiss_vectorstore = create_faiss_for_logs(preliminary_split)
            # storing the current faiss store
            with open(faiss_store_filename, "wb") as file:
                pickle.dump(faiss_vectorstore, file)


        return HTMLResponse(status_code=201)
    except Exception as exception:
        logger.info("Exception occured during file upload")
        os.unlink(os.path.join(CONFIG["LOG_FILES_PATH"], file.filename))
        return HTMLResponse(status_code=500)

@app.websocket("/chat")
async def websocket_endpoint(websocket: WebSocket):
    print("New ws connection request")
    global faiss_vectorstore
    global chat_history
    faiss_vectorstore = None
    chat_history = []
    # config = {"chat_model":"gpt-4"}
    config = {"chat_model":"gpt-4"}
    
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        data: Dict = json.loads(data)
        logger.info(data)
        msg_type = data.get("type", None)
        prompt = None
        if msg_type == "summary":
            summary_flag_ = True
            msg_data = data.get("data", None)
            summary_catagory = msg_data["category"]
            prompt = f"summary_category={summary_catagory}"
        else:
            summary_flag_ = False
            user_question = data.get("data", None)
            prompt = user_question


        if summary_flag_:
            updated_retriever, get_llm = await connect_to_llm(vectorstore=faiss_vectorstore, config=config, summary_flag_=summary_flag_, stream_handler=StreamCallback(websocket))
            related_chunks_for_summary = await updated_retriever._aget_relevant_documents(query=f"Find the {summary_catagory} in the log.", run_manager = None)
            find_summary_text = ""
            for obj in related_chunks_for_summary:
                find_summary_text += obj.page_content + "\n\n"
            answer = await get_llm.acall([Document(page_content=find_summary_text)])
            answer = answer.get("output_text", None)
        else:
            get_llm = await connect_to_llm(vectorstore=faiss_vectorstore, config=config, summary_flag_=summary_flag_, stream_handler=StreamCallback(websocket))
            answer = await get_llm.acall(
                                {"question": user_question, "chat_history": chat_history}
                            )
            answer = answer.get("answer", "no response")
            if len(chat_history) > 2:
                del chat_history[:-2]
            chat_history.append((user_question, answer))
        await websocket.send_json({
            "type": "prompt-response-end",
            "data": {
                "prompt": prompt,
                "response": answer,
                "id": random.randint(0, 100),
                "creationTimeStamp": time() * 1000
            }
        })

