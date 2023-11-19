
import pickle
from logSplitter import create_faiss_for_logs
from connectToLlm import connect_to_llm
from langchain.docstore.document import Document
import asyncio
from logSplitter import create_preliminary_split, create_faiss_for_logs
import os


async def main():
    question = "How many kex_exchange_identification errors are there?"
    chat_history = []
    chat_history.append(("What is your name?", "My name is dorky bot."))
    summary_flag_ = False 
    id_of_log_file = "test_logfile_1"
    path_to_log_file = "test_log1.out"
    
    faiss_store_filename = os.path.join("vectorstores/", f"faiss_{id_of_log_file}.pkl")
    if os.path.isfile(faiss_store_filename):
        with open(faiss_store_filename, "rb") as f:
            faiss_vectorstore = pickle.load(f)
    else:
        preliminary_split = create_preliminary_split(path_to_log_file)
        faiss_vectorstore = create_faiss_for_logs(preliminary_split)
        # storing the current faiss store
        with open(faiss_store_filename, "wb") as file:
            pickle.dump(faiss_vectorstore, file)
    
    config = {"chat_model":"gpt-3.5-turbo"}
    if summary_flag_:
        updated_retriever, get_llm = await connect_to_llm(vectorstore=faiss_vectorstore, config=config, summary_flag_=summary_flag_)
        related_chunks_for_summary = await updated_retriever._aget_relevant_documents(query="Find the error in the log.", run_manager = None)
        find_summary_text = ""
        for obj in related_chunks_for_summary:
            find_summary_text += obj.page_content + "\n\n"
        answer = await get_llm.acall([Document(page_content=find_summary_text)])
    else:
        get_llm = await connect_to_llm(vectorstore=faiss_vectorstore, config=config, summary_flag_=summary_flag_)
        answer = await get_llm.acall(
                            {"question": question, "chat_history": chat_history}
                        )
    print("\n\n\n\nAnswer:\n", answer['answer'], "\n\n\n", answer)
        
if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
    loop.close()
