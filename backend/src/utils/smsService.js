/**
 * SMS через Twilio REST API (без отдельного npm-пакета).
 * Задайте в .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER (отправитель в E.164).
 * Если переменных нет — запись создаётся как раньше, SMS просто пропускается.
 */

function normalizeToE164(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+7${digits}`;
  }
  if (phone.trim().startsWith('+') && digits.length >= 10) {
    return `+${digits}`;
  }
  return null;
}

/**
 * @param {string} toPhone — как в профиле пользователя
 * @param {{ date: string, time: string, doctorName: string, serviceName: string }} payload
 */
async function sendAppointmentBookingSms(toPhone, payload) {
  const to = normalizeToE164(toPhone);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!to) {
    console.warn('[SMS] Некорректный номер телефона, SMS не отправлена');
    return { sent: false, reason: 'invalid_phone' };
  }

  if (!accountSid || !authToken || !from) {
    console.log('[SMS] Twilio не настроен (TWILIO_*), SMS пропущена');
    return { sent: false, reason: 'not_configured' };
  }

  const body = `DentLux: жазылу расталды / запись подтверждена. ${payload.date} ${payload.time}. ${payload.doctorName}. ${payload.serviceName}`;

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const params = new URLSearchParams({
    To: to,
    From: from,
    Body: body,
  });

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[SMS] Twilio error:', res.status, data);
    return { sent: false, reason: 'twilio_error', detail: data };
  }

  return { sent: true, sid: data.sid };
}

module.exports = { sendAppointmentBookingSms, normalizeToE164 };
