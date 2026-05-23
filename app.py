import os
import tempfile
import warnings

import streamlit as st

from src.study_assistant.vectorstore import VectorDB
from src.study_assistant.data_ingestion import DataIngestion
from src.study_assistant.tasks import (
    generate_summary,
    generate_mcqs,
    generate_flashcards,
    generate_revision_notes
)
from src.study_assistant.llm import LLM

warnings.filterwarnings("ignore")

# ---------------- PAGE CONFIG ----------------
st.set_page_config(
    page_title="Study Assistant",
    layout="wide"
)

st.title("📚 AI Study Assistant")

# ---------------- SESSION STATE ----------------
if "llm" not in st.session_state:
    st.session_state["llm"] = LLM().get_llm()

if "vectorstore" not in st.session_state:
    st.session_state["vectorstore"] = VectorDB()

if "data_ingestion" not in st.session_state:
    st.session_state["data_ingestion"] = DataIngestion()

if "docs_loaded" not in st.session_state:
    st.session_state["docs_loaded"] = False

# ---------------- FILE UPLOAD ----------------
uploaded_files = st.file_uploader(
    "Upload files",
    type=["pdf", "docx", "png", "jpg", "jpeg"],
    accept_multiple_files=True
)

col1, col2 = st.columns(2)

# ---------------- PROCESS FILES ----------------
with col1:
    if st.button("🚀 Process Files"):

        if not uploaded_files:
            st.warning("Please upload files first.")

        else:
            all_docs = []

            with st.spinner("Processing files..."):

                for uploaded_file in uploaded_files:
                    try:
                        suffix = os.path.splitext(uploaded_file.name)[1]

                        with tempfile.NamedTemporaryFile(
                            delete=False,
                            suffix=suffix
                        ) as tmp_file:

                            tmp_file.write(uploaded_file.getbuffer())
                            temp_path = tmp_file.name

                        docs = st.session_state[
                            "data_ingestion"
                        ].load_doc(temp_path)

                        all_docs.extend(docs)

                        os.remove(temp_path)

                        st.success(f"{uploaded_file.name} processed")

                    except Exception as e:
                        st.error(f"Error processing {uploaded_file.name}: {e}")

                # Add to vector DB
                st.session_state["vectorstore"].add_documents(all_docs)

                st.session_state["docs_loaded"] = True

                st.success(
                    f"✅ Added {len(all_docs)} documents to vector database"
                )

# ---------------- RESET VECTOR DB ----------------
with col2:
    if st.button("🗑 Reset Vector DB"):

        st.session_state["vectorstore"].reset_vectorstore()
        st.session_state["docs_loaded"] = False

        st.success("Vector database reset successfully")

# ---------------- TASK TABS ----------------
if st.session_state["docs_loaded"]:

    st.divider()

    tab1, tab2, tab3, tab4 = st.tabs([
        "🧠 Summary",
        "🧩 MCQs",
        "🗂 Flashcards",
        "⚡ Revision"
    ])

    # ---------------- SUMMARY ----------------
    with tab1:
        st.subheader("Generate Summary")

        if st.button("Generate Summary"):
            with st.spinner("Generating summary..."):
                docs = st.session_state["vectorstore"].retrieve(
                    "main concepts and explanations"
                )

                result = generate_summary(st.session_state["llm"],docs=docs)

                st.markdown(result)

    # ---------------- MCQs ----------------
    with tab2:
        st.subheader("Generate MCQs")

        if st.button("Generate MCQs"):
            with st.spinner("Generating MCQs..."):
                docs = st.session_state["vectorstore"].retrieve(
                    "important definitions and exam questions"
                )

                result = generate_mcqs(st.session_state["llm"], docs=docs)

                st.markdown(result)

    # ---------------- FLASHCARDS ----------------
    with tab3:
        st.subheader("Generate Flashcards")

        if st.button("Generate Flashcards"):
            with st.spinner("Generating flashcards..."):
                docs = st.session_state["vectorstore"].retrieve(
                    "key facts and short concepts"
                )

                result = generate_flashcards(st.session_state["llm"], docs=docs)

                st.markdown(result)

    # ---------------- REVISION ----------------
    with tab4:
        st.subheader("Generate Revision Notes")

        if st.button("Generate Revision"):
            with st.spinner("Generating revision notes..."):
                docs = st.session_state["vectorstore"].retrieve(
                    "important concepts and key exam topics"
                )

                result = generate_revision_notes(llm=st.session_state["llm"], docs=docs)

                st.markdown(result)

else:
    st.info("👆 Upload and process files to start using the AI features.")
