
from langchain.prompts import PromptTemplate

# Prompt to rephrase a question based on User History
rephrase_question_template = """Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
(Only rephrase it if the follow up question is an actual follow up question)

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:"""
rephrase_question_prompt = PromptTemplate.from_template(
                                rephrase_question_template
                                )


# Prompt to Retrieve and structure the Log chunks
log_template = """
**Content**
{page_content}

**Metadata**
{source}
"""
log_prompt = PromptTemplate(
                template=log_template, 
                input_variables=["page_content", "source"]
                )


# Prompt to send to the chatbot for each question in one conversation
chatbot_conversation_template = """You are a chatbot to analyze a log file. Based on the following Content, answer the following question.
An example of the way of analyzing the contents is also presented below. 

Context: 

{summaries}

User question:
{question}

One line of a log file may look like this:
Nov 09 13:11:39 CMX50070-101776 containerd[893]: time="2023-11-09T13:11:39.642828135Z" level=warning msg="failed to load plugin io.containerd.snapshotter.v1.devmapper" error="devmapper not configured Line Number 129<*>
Example analysis: This error occured on Nov 09 13:11:39 on line number 129. The error was devmapper was not configured. There is also a warning message that it failed to load a plugin.

Answer (Please solve the problem step wise step):"""
chatbot_conversation_prompt = PromptTemplate(
                                    template=chatbot_conversation_template, 
                                    input_variables=["summaries", "question"]
                                    )


# Prompt for summary problems

summary_template = """Write a concise summary of the following in 200 words:

{text}

SUMMARY:"""

summary_prompt = PromptTemplate(template=summary_template, input_variables=["text"])
