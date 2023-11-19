
from langchain.callbacks.manager import AsyncCallbackManager
from langchain.chains import ConversationalRetrievalChain
from langchain.chains.qa_with_sources import load_qa_with_sources_chain
from langchain.chains.llm import LLMChain
from langchain.vectorstores.base import VectorStore
from langchain.chat_models import ChatOpenAI
from .definedPrompts import rephrase_question_prompt, log_prompt, chatbot_conversation_prompt, summary_prompt
from langchain.chains.summarize import load_summarize_chain
from typing import (
    Any,
    Callable,
    ClassVar,
    Collection,
    Dict,
    Iterable,
    List,
    Optional,
    Tuple,
    Type,
    TypeVar,
)

from pydantic import Field, root_validator

from langchain.callbacks.manager import (
    AsyncCallbackManagerForRetrieverRun,
    CallbackManagerForRetrieverRun,
)
from langchain.docstore.document import Document
from langchain.schema import BaseRetriever

api_key = "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"

async def connect_to_llm(vectorstore: VectorStore, config: dict, stream_handler=None, summary_flag_=False):

    manager = AsyncCallbackManager([])
    stream_manager = AsyncCallbackManager([stream_handler])

    chat_model = config["chat_model"]

    question_gen_llm = ChatOpenAI(
        openai_api_key=api_key,
        verbose=True,
        model_name=chat_model,
        max_retries=20,
    )
    streaming_llm = ChatOpenAI(
        openai_api_key=api_key,
        streaming=True,
        callback_manager=stream_manager,
        verbose=True,
        model_name=chat_model,
        max_retries=20,
    )

    question_generator = LLMChain(
        llm=question_gen_llm, 
        prompt=rephrase_question_prompt, 
        callback_manager=manager, 
        verbose=True
    )
    doc_chain = load_qa_with_sources_chain(
        streaming_llm, 
        chain_type="stuff", 
        prompt=chatbot_conversation_prompt, 
        document_prompt=log_prompt, 
        callback_manager=manager, 
        verbose=True
    )

    if summary_flag_:
        updated_retriever = as_retriever_updated(
                vectorstore=vectorstore,
                search_type="similarity_score_threshold",
                search_kwargs={"k": 10, "score_threshold" : 0.65}
            )
        summary_chain = load_summarize_chain(
            streaming_llm, 
            chain_type="map_reduce", 
            map_prompt=summary_prompt, 
            combine_prompt=summary_prompt, 
            verbose=True)
        return updated_retriever, summary_chain
    
    # retriever = vectorstore.as_retriever()
    updated_retriever = as_retriever_updated(
            vectorstore=vectorstore,
            search_type="similarity_score_threshold",
            search_kwargs={"k": 6, "score_threshold" : 0.65}
        )
    conversation_chain = ConversationalRetrievalChain(
        retriever=updated_retriever,
        combine_docs_chain=doc_chain,
        question_generator=question_generator,
        callback_manager=manager,
        return_generated_question=True,
        return_source_documents=True,
        verbose=True
    )
    return conversation_chain
    

class VectorStoreRetrieverCorrected(BaseRetriever):
    vectorstore: VectorStore
    search_type: str = "similarity"
    search_kwargs: dict = Field(default_factory=dict)
    allowed_search_types: ClassVar[Collection[str]] = (
        "similarity",
        "similarity_score_threshold",
        "mmr",
    )

    class Config:
        """Configuration for this pydantic object."""

        arbitrary_types_allowed = True

    @root_validator()
    def validate_search_type(cls, values: Dict) -> Dict:
        """Validate search type."""
        search_type = values["search_type"]
        if search_type not in cls.allowed_search_types:
            raise ValueError(
                f"search_type of {search_type} not allowed. Valid values are: "
                f"{cls.allowed_search_types}"
            )
        if search_type == "similarity_score_threshold":
            score_threshold = values["search_kwargs"].get("score_threshold")
            if (score_threshold is None) or (not isinstance(score_threshold, float)):
                raise ValueError(
                    "`score_threshold` is not specified with a float value(0~1) "
                    "in `search_kwargs`."
                )
        return values

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        if self.search_type == "similarity":
            docs = self.vectorstore.similarity_search(query, **self.search_kwargs)
        elif self.search_type == "similarity_score_threshold":
            docs_and_similarities = (
                self.vectorstore.similarity_search_with_relevance_scores(
                    query, **self.search_kwargs
                )
            )
            docs = [doc for doc, _ in docs_and_similarities]
        elif self.search_type == "mmr":
            docs = self.vectorstore.max_marginal_relevance_search(
                query, **self.search_kwargs
            )
        else:
            raise ValueError(f"search_type of {self.search_type} not allowed.")
        return docs

    async def _aget_relevant_documents(
        self, query: str, *, run_manager: AsyncCallbackManagerForRetrieverRun
    ) -> List[Document]:
        if self.search_type == "similarity":
            docs = await self.vectorstore.asimilarity_search(
                query, **self.search_kwargs
            )
        elif self.search_type == "similarity_score_threshold":
            docs_and_similarities = (
                await self.vectorstore.asimilarity_search_with_relevance_scores(
                    query, **self.search_kwargs
                )
            )

            docs = [doc for doc, _ in docs_and_similarities]
        elif self.search_type == "mmr":
            docs = await self.vectorstore.amax_marginal_relevance_search(
                query, **self.search_kwargs
            )
        else:
            raise ValueError(f"search_type of {self.search_type} not allowed.")
        return docs

    def add_documents(self, documents: List[Document], **kwargs: Any) -> List[str]:
        """Add documents to vectorstore."""
        return self.vectorstore.add_documents(documents, **kwargs)

    async def aadd_documents(
        self, documents: List[Document], **kwargs: Any
    ) -> List[str]:
        """Add documents to vectorstore."""
        return await self.vectorstore.aadd_documents(documents, **kwargs)
    
def as_retriever_updated(vectorstore, **kwargs: Any) -> VectorStoreRetrieverCorrected:
    return VectorStoreRetrieverCorrected(vectorstore=vectorstore, **kwargs)
