// v1beta — как в официальных примерах REST Gemini API
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Прокси для n8n: ключ Gemini только в GEMINI_API_KEY на backend.
 * Заголовок X-Automation-Secret должен совпадать с AUTOMATION_SECRET (по умолчанию как в docker-compose).
 */
async function geminiProxy(req, res, next) {
  try {
    const expected = process.env.AUTOMATION_SECRET || '12345';
    const sent = req.headers['x-automation-secret'];
    if (!sent || sent !== expected) {
      return res.status(401).json({ success: false, message: 'Invalid automation secret' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: 'На сервере не задан GEMINI_API_KEY. Добавьте ключ в .env в корне проекта и перезапустите backend.',
      });
    }

    // gemini-1.5-flash в v1beta часто даёт 404 (модель снята/переименована). Актуальный flash — 2.5 / 2.0.
    const model = req.body.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const payload = req.body.geminiPayload;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, message: 'Тело запроса должно содержать geminiPayload' });
    }

    const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await r.json().catch(() => ({}));
    return res.status(r.ok ? 200 : r.status).json(data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { geminiProxy };
