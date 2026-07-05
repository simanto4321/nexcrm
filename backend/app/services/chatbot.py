"""Ollama local LLM integration and FAQ fallback for the CRM chatbot."""

import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

FAQ_FALLBACK = [
    {
        "keywords": ["contact", "add", "create"],
        "answer": "Go to Contacts → Add Contact. Fill in name, phone, and email. Tenant admins can assign contacts to sales reps.",
    },
    {
        "keywords": ["deal", "pipeline", "stage"],
        "answer": "Deals move through stages: new → contacted → negotiation → won/lost. Use the Pipeline board to drag deals between stages.",
    },
    {
        "keywords": ["task", "todo", "due"],
        "answer": "Tasks live under the Tasks tab. Set a title and due date; mark done when complete. Sales reps only see tasks assigned to them.",
    },
    {
        "keywords": ["login", "password", "signup"],
        "answer": "Sign up creates your company tenant. Login requires email, password, and your company code from signup.",
    },
    {
        "keywords": ["dashboard", "stats", "report"],
        "answer": "The Dashboard shows total contacts, deals by stage, and pending task count — scoped to your role and tenant.",
    },
]


def build_system_prompt(tenant_name: str) -> str:
    return (
        f"You are a helpful CRM support assistant for {tenant_name}. "
        "Help with using contacts, pipeline, and tasks features. Be concise."
    )


def _faq_reply(user_message: str) -> str:
    """Pick the best FAQ match or return a generic help message."""
    lower = user_message.lower()
    for item in FAQ_FALLBACK:
        if any(kw in lower for kw in item["keywords"]):
            return item["answer"]
    lines = "\n".join(f"• {item['answer']}" for item in FAQ_FALLBACK[:3])
    return (
        "I'm running in offline FAQ mode. Here are common topics:\n"
        f"{lines}\n\n"
        "Ask about contacts, deals, tasks, or the dashboard."
    )


def get_chat_reply(
    *,
    tenant_name: str,
    user_message: str,
    conversation_history: list[dict[str, str]],
) -> tuple[str, str]:
    """
    Call local Ollama API; return (reply_text, source).
    source is 'ollama' or 'faq_fallback'.
    """
    messages: list[dict[str, str]] = [
        {"role": "system", "content": build_system_prompt(tenant_name)},
    ]
    for item in conversation_history:
        # Ollama uses 'assistant' not 'bot'
        role = "assistant" if item["role"] == "assistant" else item["role"]
        messages.append({"role": role, "content": item["text"]})
    messages.append({"role": "user", "content": user_message})

    url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"
    payload = {
        "model": settings.ollama_model,
        "messages": messages,
        "stream": False,
        "options": {"num_predict": 512},
    }

    try:
        with httpx.Client(timeout=settings.ollama_timeout_seconds) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            reply = data["message"]["content"].strip()
            if reply:
                return reply, "ollama"
    except httpx.ConnectError:
        logger.warning("Ollama not running at %s — using FAQ fallback", settings.ollama_base_url)
    except Exception as exc:
        logger.exception("Ollama API call failed: %s", exc)

    return _faq_reply(user_message), "faq_fallback"
