"""Local SMTP server for email demo — captures messages to a log file."""

import email
from datetime import UTC, datetime
from pathlib import Path

from aiosmtpd.controller import Controller

LOG_PATH = Path(__file__).resolve().parents[1] / ".cache" / "email-demo.log"


class DemoHandler:
    async def handle_DATA(self, server, session, envelope):
        msg = email.message_from_bytes(envelope.content)
        subject = msg.get("Subject", "(no subject)")
        to_addr = envelope.rcpt_tos[0] if envelope.rcpt_tos else "?"
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    body = part.get_payload(decode=True).decode("utf-8", errors="replace")
                    break
        else:
            payload = msg.get_payload(decode=True)
            body = payload.decode("utf-8", errors="replace") if payload else ""

        LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with LOG_PATH.open("a", encoding="utf-8") as f:
            f.write(f"\n--- {datetime.now(UTC).isoformat()} ---\n")
            f.write(f"To: {to_addr}\nSubject: {subject}\n{body}\n")

        print(f"[demo-smtp] captured -> {to_addr}: {subject}")
        return "250 Message accepted for delivery"


def main():
    import socket

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(("127.0.0.1", 1025))
        sock.close()
    except OSError:
        print("Demo SMTP already running on 127.0.0.1:1025 — nothing to start.")
        print(f"Captured mail log: {LOG_PATH}")
        return

    handler = DemoHandler()
    controller = Controller(handler, hostname="127.0.0.1", port=1025)
    controller.start()
    print(f"Demo SMTP listening on 127.0.0.1:1025 - log: {LOG_PATH}")
    try:
        import time

        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        controller.stop()


if __name__ == "__main__":
    main()
