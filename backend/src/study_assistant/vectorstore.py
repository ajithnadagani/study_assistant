import os
import sys
import ssl
from typing import List, Optional

from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

from src.study_assistant import CustomException, logger

# Fix SSL certificate verification failures on Windows
import os
os.environ['PYTHONHTTPSVERIFY'] = '0'

os.environ["HF_HUB_DISABLE_SSL_VERIFICATION"] = "1"
os.environ["CURL_CA_BUNDLE"] = ""
os.environ["REQUESTS_CA_BUNDLE"] = ""
ssl._create_default_https_context = ssl._create_unverified_context


class VectorDB:

    def __init__(
        self,
        embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    ):

        try:
            self.vectorstore: Optional[FAISS] = None

            self.embedding_model = HuggingFaceEmbeddings(
                model_name=embedding_model_name,
                encode_kwargs={"normalize_embeddings": True}
            )

        except Exception as e:
            raise CustomException(
                f"Error loading embedding model: {e}",
                sys
            )

    def add_documents(self, docs: List[Document]):

        try:

            if not docs:
                return

            # First time create vectorstore
            if self.vectorstore is None:

                logger.info("Creating new FAISS vectorstore")

                self.vectorstore = FAISS.from_documents(
                    docs,
                    embedding=self.embedding_model
                )

            # Existing vectorstore → append docs
            else:

                logger.info("Adding documents to existing vectorstore")

                self.vectorstore.add_documents(docs)

        except Exception as e:

            raise CustomException(
                f"Error adding documents: {e}",
                sys
            )

    def reset_vectorstore(self):

        logger.info("Resetting vectorstore")

        self.vectorstore = None

    def retrieve(self, query, k=5):
        if self.vectorstore is None:
            return []

        retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": k}
        )

        return retriever.invoke(query)
