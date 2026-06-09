const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    response.status(500).json({ ok: false, error: "Telegram is not configured" });
    return;
  }

  const { name, phone, comment, booking } = request.body || {};

  if (!name || !phone || !booking) {
    response.status(400).json({ ok: false, error: "Required fields are missing" });
    return;
  }

  const text = [
    "<b>Новая заявка на массаж</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Телефон:</b> ${escapeHtml(phone)}`,
    `<b>Запись:</b> ${escapeHtml(booking)}`,
    comment ? `<b>Комментарий:</b> ${escapeHtml(comment)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: "HTML",
      text,
    }),
  });

  const payload = await telegramResponse.json();

  if (!payload.ok) {
    response.status(502).json({ ok: false, error: payload.description || "Telegram error" });
    return;
  }

  response.status(200).json({ ok: true });
};
