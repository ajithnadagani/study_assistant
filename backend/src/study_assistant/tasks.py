import json
import re

from src.study_assistant.schemas import FlashcardResponse, MCQResponse, RevisionResponse
from src.study_assistant import logger


def _extract_json(text: str) -> dict:
    """
    Robustly extract a JSON object from an LLM response.
    Handles:
      - Raw JSON
      - ```json ... ``` fences
      - ``` ... ``` fences
      - JSON buried inside surrounding prose
    """
    if not text or not text.strip():
        raise ValueError("LLM returned an empty response")

    # 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence_match:
        text = fence_match.group(1).strip()

    # 2. Try parsing directly
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 3. Find the first { ... } block in the text
    brace_match = re.search(r"\{[\s\S]*\}", text)
    if brace_match:
        return json.loads(brace_match.group())

    raise ValueError(f"No valid JSON found in response:\n{text[:300]}")


def generate_summary(llm, docs):
    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"""You are an expert academic tutor.

Convert the content below into clear, structured, exam-ready notes.

Instructions:
- Focus on key concepts, definitions, and important explanations
- Keep it concise but complete
- Use bullet points and headings
- Highlight formulas, key terms, and important facts

Content:
{context}

Output format:
- Title
- Key Concepts (bulleted)
- Important Definitions
- Key Points for Revision
"""
    return llm.invoke(prompt).content


def generate_mcqs(llm, docs):
    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"""You are an expert exam paper setter.

Create exactly 5 high-quality multiple choice questions based on the content below.

Content:
{context}

Rules:
- Each question must have exactly 4 options as full sentences (not just letters)
- The "answer" field must be the letter of the correct option: "A", "B", "C", or "D"
- Return ONLY the JSON object below with no extra text, no markdown, no explanation

{{
  "questions": [
    {{
      "question": "...",
      "options": ["full option text A", "full option text B", "full option text C", "full option text D"],
      "answer": "A",
      "explanation": "..."
    }}
  ]
}}"""

    response = llm.invoke(prompt).content
    logger.info(f"MCQ raw response (first 200 chars): {response[:200]}")

    try:
        data = _extract_json(response)
        validated = MCQResponse(**data)
        return validated.questions
    except Exception as e:
        print("MCQ Parsing Error:", e)
        return []


def generate_flashcards(llm, docs):
    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"""You are a study assistant creating flashcards.

Create 8 flashcards based on the content below. Each flashcard has a short question and a concise answer.

Content:
{context}

Rules:
- Return ONLY the JSON object below with no extra text, no markdown, no explanation

{{
  "flashcards": [
    {{
      "question": "...",
      "answer": "..."
    }}
  ]
}}"""

    response = llm.invoke(prompt).content
    logger.info(f"Flashcard raw response (first 200 chars): {response[:200]}")

    try:
        data = _extract_json(response)
        validated = FlashcardResponse(**data)
        return validated.flashcards
    except Exception as e:
        print("Flashcard Error:", e)
        return []


def generate_revision_notes(llm, docs):
    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"""You are a study assistant creating revision notes.

Create a structured revision guide based on the content below.

Content:
{context}

Rules:
- Return ONLY the JSON object below with no extra text, no markdown, no explanation

{{
  "title": "...",
  "key_concepts": ["...", "..."],
  "definitions": ["...", "..."],
  "formulas": ["...", "..."],
  "exam_points": ["...", "..."]
}}"""

    response = llm.invoke(prompt).content
    logger.info(f"Revision raw response (first 200 chars): {response[:200]}")

    try:
        data = _extract_json(response)
        validated = RevisionResponse(**data)
        return validated
    except Exception as e:
        print("Revision Error:", e)
        return None
