
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from itertools import groupby
import time
import pickle

log_catagories_keys = ["Error", "Warning", "Authenticate", "Failed", "Success", "Debug", "Access", "Request", "Version", "Authentication"]

def get_lines_with_word_regex(log_file_path, target_word):
    matching_lines = []
    line_number = 0
    with open(log_file_path, 'r') as file:
        for line in file:
            line_number = line_number + 1
            if target_word.lower() in line.lower():
                matching_lines.append(line.strip()+' Line Number: ' + str(line_number)+'<*>')
    return matching_lines

def create_preliminary_split(log_file_path):
    # keys = extract_words_from_file(key_word_path)
    grouped_result = {key : None for key in log_catagories_keys}
    for key in log_catagories_keys:
        grouped_result[key] = [list(i) for j, i in groupby(get_lines_with_word_regex(log_file_path, key),lambda a: a[:15])]
        grouped_result[key] = ['\n'.join(elem) for elem in grouped_result[key]]
    return grouped_result

def create_faiss_for_logs(presplit) -> FAISS:
    logs_chunks = []
    metadatas = []

    splitter = RecursiveCharacterTextSplitter(separators=["\n"], chunk_size=1000, chunk_overlap=0)
    for key in list(presplit.keys()):
        for elem in presplit[key]:
            for chunk in splitter.split_text(elem):
                logs_chunks.append(chunk)
                indv_metadata = {}
                date = chunk[0:15]
                indv_metadata["source"] = f"Key-{key} 'Date'-{date}"
                indv_metadata["date"] = date
                metadatas.append(indv_metadata) 

    embeddings = OpenAIEmbeddings(openai_api_key="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")
    
    total_number_of_chunks = len(logs_chunks)
    max_limit = 100
    # print("total_number_of_chunks", total_number_of_chunks)
    # print("Test", int(total_number_of_chunks/max_limit)+1)
    # faiss_final : FAISS = None
    # for i in range(0, int(total_number_of_chunks/max_limit)+1):
    #     temp_faiss : FAISS = None
    #     try:
    #         if i == int(total_number_of_chunks/max_limit):
    #             temp_faiss = FAISS.from_texts(logs_chunks[i*max_limit:-1], embeddings, metadatas[i*max_limit:-1])
    #         else:
    #             temp_faiss = FAISS.from_texts(logs_chunks[i*max_limit:(i+1)*max_limit], embeddings, metadatas[i*max_limit:(i+1)*max_limit])
    #         faiss_final.merge_from(temp_faiss)
    #         with open(f"/home/panthibivek/HackTUM/backend/backend/Chatbot/vectorstores/faiss_{i}", "wb") as file:
    #             pickle.dump(temp_faiss, file)

    #     except:
    #         pass
    #         time.sleep(10)
    faiss_final = FAISS.from_texts(logs_chunks, embeddings, metadatas)
    return faiss_final
