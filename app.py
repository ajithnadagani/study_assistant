import os
import tempfile
import warnings

import streamlit as st

from src.study_assistant.vectorstore import VectorDB
from src.study_assistant.data_ingestion import DataIngestion

warnings.filterwarnings("ignore")

st.set_page_config(
    page_title="Study Assistant",
    layout="wide"
)

st.title("Study Assistant")

# Session state
if "vectorstore" not in st.session_state:
    st.session_state["vectorstore"] = VectorDB()

if "data_ingestion" not in st.session_state:
    st.session_state["data_ingestion"] = DataIngestion()

# Upload files
uploaded_files = st.file_uploader(
    "Upload files",
    type=["pdf", "docx", "png", "jpg", "jpeg"],
    accept_multiple_files=True
)

# Buttons
col1, col2 = st.columns(2)

# PROCESS BUTTON
with col1:

    if st.button("Process Files"):

        if not uploaded_files:
            st.warning("Please upload files first.")

        else:

            all_docs = []

            with st.spinner("Processing files..."):

                for uploaded_file in uploaded_files:

                    try:

                        suffix = os.path.splitext(
                            uploaded_file.name
                        )[1]

                        with tempfile.NamedTemporaryFile(
                            delete=False,
                            suffix=suffix
                        ) as tmp_file:

                            tmp_file.write(
                                uploaded_file.getbuffer()
                            )

                            temp_path = tmp_file.name

                        docs = st.session_state[
                            "data_ingestion"
                        ].load_doc(temp_path)

                        all_docs.extend(docs)

                        os.remove(temp_path)

                        st.success(
                            f"{uploaded_file.name} processed"
                        )

                    except Exception as e:

                        st.error(
                            f"Error processing "
                            f"{uploaded_file.name}: {e}"
                        )

                # Add to vector DB
                st.session_state[
                    "vectorstore"
                ].add_documents(all_docs)

                st.success(
                    f"Added {len(all_docs)} documents "
                    f"to vector database"
                )

# RESET BUTTON
with col2:

    if st.button("Reset Vector DB"):

        st.session_state[
            "vectorstore"
        ].reset_vectorstore()

        st.success("Vector database reset successfully")
