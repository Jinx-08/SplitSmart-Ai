import os

from dotenv import load_dotenv
import google.generativeai as genai

from .rag import retrieve_context, format_context

load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

SYSTEM_PROMPT = (
	'You are a friendly financial advisor built into a group expense-splitting app called '
	'Splitwise AI. '
	"You have access to the group's real expense data provided below. "
	'Always answer based ONLY on the data provided; never make up numbers. '
	'Be concise, specific, and actionable. Use $ for currency. '
	"If the data doesn't have enough info to answer, say so honestly. "
	'Tone: friendly, not formal. Like a smart friend who happens to be good with money.'
)


def get_advice(group_id: str, question: str, user_name: str) -> str:
	context = retrieve_context(group_id, question)
	data_summary = format_context(context)

	user_message = (
		f"DATA:\n{data_summary}\n\nQUESTION from {user_name}:\n{question}\n"
	)

	response = model.generate_content(
		[SYSTEM_PROMPT, user_message],
		generation_config={
			'max_output_tokens': 500,
			'temperature': 0.4,
		},
	)

	return response.text