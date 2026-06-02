import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
	os.getenv('SUPABASE_URL'),
	os.getenv('SUPABASE_SERVICE_KEY'),
)


def retrieve_context(group_id: str, question: str, days_back: int = 90) -> dict:
	"""Fetch the expense data needed to answer the user's question."""
	since = (datetime.now() - timedelta(days=days_back)).isoformat()

	expenses = (
		supabase.table('expenses')
		.select('description, amount, category, paid_by, created_at')
		.eq('group_id', group_id)
		.gte('created_at', since)
		.is_('deleted_at', 'null')
		.execute()
		.data
	)

	members = (
		supabase.table('group_members')
		.select('user_id, profiles(full_name)')
		.eq('group_id', group_id)
		.execute()
		.data
	)

	name_map = {m['user_id']: m['profiles']['full_name'] for m in members}

	total_spent = sum(e['amount'] for e in expenses)
	by_category = {}
	by_person = {}
	for expense in expenses:
		category = expense.get('category', 'Other')
		by_category[category] = by_category.get(category, 0) + expense['amount']
		name = name_map.get(expense['paid_by'], 'Unknown')
		by_person[name] = by_person.get(name, 0) + expense['amount']

	return {
		'expenses': expenses[:50],  # Cap at 50 rows to stay within token limit
		'total_spent': total_spent,
		'by_category': by_category,
		'by_person': by_person,
		'period_days': days_back,
	}


def format_context(ctx: dict) -> str:
	"""Turn the retrieved data into a readable string for the Gemini prompt."""
	lines = [
		f'EXPENSE DATA (last {ctx["period_days"]} days):',
		f'Total group spending: {ctx["total_spent"]:,.0f}',
		'',
		'By category:',
		*[
			f' - {cat}: {amt:,.0f}'
			for cat, amt in sorted(ctx['by_category'].items(), key=lambda x: -x[1])
		],
		'',
		'By person:',
		*[
			f' - {name}: {amt:,.0f}'
			for name, amt in sorted(ctx['by_person'].items(), key=lambda x: -x[1])
		],
	]

	return '\n'.join(lines)