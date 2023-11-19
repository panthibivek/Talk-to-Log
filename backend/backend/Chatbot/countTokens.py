import tiktoken

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

path_to_log_file = "test_log1.out"
with open(path_to_log_file, 'r') as file:
    all_content = file.read()
num_tokens = num_tokens_from_string(all_content, "cl100k_base")
print(num_tokens)