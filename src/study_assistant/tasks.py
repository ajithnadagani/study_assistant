from src.study_assistant import logger,CustomException

def generate_summary(llm,docs):
    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"""
 You are an expert academic tutor.

Your task is to convert the given content into clear, structured, exam-ready notes.

Instructions:
- Focus on key concepts, definitions, and important explanations
- Keep it concise but complete
- Use bullet points and headings
- Highlight formulas, key terms, and important facts
- Avoid unnecessary details

Content:
{context}

Output format:
- Title
- Key Concepts (bulleted)
- Important Definitions
- Key Points for Revision

    
    """

    return llm.invoke(prompt).content

def generate_mcqs(llm,docs):
    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"""
You are an expert exam paper setter.

Create 5 high-quality multiple choice questions based on the content below.

Instructions:
- Questions should test understanding, not just memorization
- Include 4 options (A, B, C, D)
- Only one correct answer
- Add a clear explanation for each answer
- Make questions similar to competitive exams

Content:
{context}

Output format:

Q1:
Question text
A)
B)
C)
D)
Answer:
Explanation:

(repeat for 10 questions)
    """

    return llm.invoke(prompt).content

def generate_flashcards(llm,docs):
    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"""
 You are a study assistant specialized in active recall learning.

Convert the following content into flashcards.

Instructions:
- Each flashcard should test one concept
- Keep answers short and precise
- Focus on definitions, formulas, and key facts
- Avoid long explanations

Content:
{context}

Output format:

Q:
A:

Q:
A:
    """

    return llm.invoke(prompt).content


def generate_revision_notes(docs, llm):
    """
    Generate exam-focused revision notes from retrieved documents
    """

    # Combine retrieved chunks
    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = f"""
You are an expert teacher helping a student revise quickly before an exam.

Your task is to convert the given content into a highly concise and effective revision guide.

Instructions:
- Include only the most important concepts
- Use very short bullet points (no long paragraphs)
- Highlight key terms, formulas, and definitions
- Prioritize what is most likely to appear in exams
- Remove unnecessary explanations
- Make it easy to revise in under 2–3 minutes

Content:
{context}

Output format:

Title

Key Concepts:
- 

Important Definitions:
- 

Formulas / Key Facts:
- 

Exam Focus Points:
-   
"""

    return llm.invoke(prompt).content
    
