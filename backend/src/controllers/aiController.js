// Контроллер для ИИ ассистента: статичные ответы + факты из БД (врачи, услуги)

const prisma = require('../config/database');

function doctorIsVisibleForClients(d) {
  if (!d.isBlocked) return true;
  if (d.blockedUntil && new Date(d.blockedUntil) <= new Date()) return true;
  return false;
}

function isPediatricSpecialization(spec) {
  if (!spec) return false;
  return /балалар|детск|педиат|child|kids/i.test(spec);
}

class AIController {
  constructor() {
    this.knowledgeBase = {
      ru: [
        { keywords: ['привет', 'здравствуйте', 'добрый день'], response: 'Здравствуйте! Я ваш ИИ-ассистент стоматологии Dental Master. Чем могу помочь?' },
        { keywords: ['цена', 'стоимость', 'сколько стоит'], response: 'Цены зависят от сложности лечения. Вы можете посмотреть прайс-лист на странице услуг или записаться на бесплатную консультацию.' },
        { keywords: ['запись', 'записаться', 'записаться на прием', 'прием', 'приём', 'талон'], response: 'Для записи вы можете воспользоваться формой онлайн-записи в личном кабинете или позвонить нам по номеру на странице контактов.' },
        { keywords: ['адрес', 'где находитесь', 'карта'], response: 'Мы находимся по адресу: г. Алматы, ул. Стоматологическая 42. Карта проезда есть в разделе "Контакты".' },
        { keywords: ['боль', 'болит', 'острая'], response: 'Если у вас острая боль, рекомендуем немедленно позвонить в нашу клинику для экстренного приема.' },
      ],
      kk: [
        { keywords: ['сәлем', 'ассалаумағалейкум', 'қайырлы күн'], response: 'Сәлеметсіз бе! Мен Dental Master стоматологиясының ИИ-ассистентімін. Сізге қалай көмектесе аламын?' },
        { keywords: ['баға', 'құны', 'қанша тұрады'], response: 'Бағалар емдеудің күрделілігіне байланысты. Сіз қызметтер бетіндегі прайс-парақты көре аласыз немесе тегін кеңеске жазыла аласыз.' },
        { keywords: ['жазылу', 'жазылғым келеді', 'қабылдау', 'қабылдауға', 'қабылдауға жазылу'], response: 'Жазылу үшін жеке кабинеттегі онлайн жазылу формасын пайдалана аласыз немесе байланыс бетіндегі нөмірге қоңырау шала аласыз.' },
        { keywords: ['мекен-жай', 'қайда', 'карта'], response: 'Біздің мекен-жайымыз: Алматы қ., Стоматологиялық көшесі 42. Картаны "Байланыс" бөлімінен көре аласыз.' },
        { keywords: ['ауырады', 'ауырсыну', 'жедел'], response: 'Егер сізде қатты ауырсыну болса, шұғыл қабылдау үшін дереу емханамызға қоңырау шалуды ұсынамыз.' },
      ],
    };
  }

  detectLanguage(message, preferredLang = 'ru') {
    const text = (message || '').toLowerCase();
    const hasCyrillic = /[а-яё]/i.test(text);
    const kazakhSpecific = /[әғқңөұүһі]/i.test(text);
    const ruHints = /\b(как|запис|прием|цена|стоим|адрес|боль|болит|сколько|кто|врач|доктор|детск)\b/i.test(text);
    const kkHints = /\b(қалай|жазыл|қабылдау|баға|мекен|ауыр|қанша|кім|дәрігер|балалар)\b/i.test(text);

    if (kazakhSpecific || kkHints) return 'kk';
    if (ruHints || hasCyrillic) return 'ru';
    return preferredLang === 'kk' ? 'kk' : 'ru';
  }

  /**
   * Ответы по данным из PostgreSQL (врачи, услуги).
   * @returns {Promise<string|null>}
   */
  async tryDataDrivenAnswer(lowerMessage, effectiveLang) {
    const ruDoctorCount =
      /сколько\s+(у\s+вас\s+)?(врач|доктор)/.test(lowerMessage)
      || /сколько\s+врачей/.test(lowerMessage)
      || /сколько\s+докторов/.test(lowerMessage)
      || /число\s+(врач|доктор)/.test(lowerMessage);

    const kkDoctorCount =
      /қанша\s+дәрігер/.test(lowerMessage)
      || /дәрігерлердің\s+саны/.test(lowerMessage)
      || /дәрігерлер\s+қанша/.test(lowerMessage);

    const ruDoctorList =
      /кто\s+(у\s+вас\s+)?врачи/.test(lowerMessage)
      || /список\s+(врач|доктор)/.test(lowerMessage)
      || /все\s+врачи/.test(lowerMessage)
      || /наши\s+врачи/.test(lowerMessage)
      || /какие\s+врачи/.test(lowerMessage);

    const kkDoctorList =
      /дәрігерлер\s+кімдер/.test(lowerMessage)
      || /дәрігерлер\s+тізім/.test(lowerMessage);

    const ruPediatric =
      /детск(ого|ая|ие|ий|ому)?\s+стоматолог/.test(lowerMessage)
      || /стоматолог\s+детск/.test(lowerMessage)
      || /(как\s+зовут|кто\s+такой|имя).{0,60}детск/.test(lowerMessage)
      || /педиатр/.test(lowerMessage)
      || /детск.{0,20}стоматолог/.test(lowerMessage);

    const kkPediatric =
      /балалар\s+стоматолог/.test(lowerMessage)
      || /балаларға\s+дәрігер/.test(lowerMessage)
      || /кім\s+балалар/.test(lowerMessage);

    const ruServiceCount =
      /сколько\s+(у\s+вас\s+)?услуг/.test(lowerMessage) || /сколько\s+услуг/.test(lowerMessage);
    const kkServiceCount = /қанша\s+қызмет/.test(lowerMessage) || /қызметтер\s+саны/.test(lowerMessage);

    const needDoctors =
      ruDoctorCount || kkDoctorCount || ruDoctorList || kkDoctorList || ruPediatric || kkPediatric;

    if (!needDoctors && !ruServiceCount && !kkServiceCount) {
      return null;
    }

    if (ruServiceCount || kkServiceCount) {
      const n = await prisma.service.count({ where: { isActive: true } });
      if (effectiveLang === 'kk') {
        return `Қазіргі уақытта клиникада ${n} белсенді қызмет бар. Толық тізім — сайттағы «Қызметтер» бөлімінде.`;
      }
      return `В клинике сейчас ${n} активных услуг в прайсе. Полный список — в разделе «Услуги» на сайте.`;
    }

    const rows = await prisma.doctor.findMany({
      include: {
        user: {
          select: { fullName: true, id: true },
        },
      },
    });

    const active = rows.filter(doctorIsVisibleForClients);
    const list = active.map((d) => ({
      name: d.user.fullName,
      spec: d.specialization || '',
      years: d.experienceYears,
    }));

    if (ruPediatric || kkPediatric) {
      const peds = list.filter((d) => isPediatricSpecialization(d.spec));
      if (effectiveLang === 'kk') {
        if (peds.length === 0) {
          return 'Дерекқорда «балалар стоматологы» мамандығы көрсетілген дәрігер табылмады. Нақтырақ ақпарат үшін ресепшнге хабарласыңыз.';
        }
        const names = peds.map((p) => `${p.name} (${p.spec}${p.years != null ? `, ${p.years} жыл тәжірибе` : ''})`).join('; ');
        return peds.length === 1
          ? `Балалар стоматологы: ${names}. Жазылу — жеке кабинет арқылы.`
          : `Балалар стоматологиясы бойынша мамандар (${peds.length}): ${names}.`;
      }
      if (peds.length === 0) {
        return 'В базе не найден врач со специализацией, связанной с детской стоматологией. Уточните на ресепшене.';
      }
      const names = peds.map((p) => `${p.name} (${p.spec}${p.years != null ? `, стаж ${p.years} лет` : ''})`).join('; ');
      return peds.length === 1
        ? `Детским стоматологом у нас работает: ${names}. Запись — через личный кабинет на сайте.`
        : `Врачи с детским профилем (${peds.length}): ${names}.`;
    }

    if (ruDoctorCount || kkDoctorCount) {
      const n = list.length;
      if (effectiveLang === 'kk') {
        return `Қазір клиникада ${n} дәрігер көрсетілген. Толығырақ — сайттағы «Дәрігерлер» бөлімінде.`;
      }
      return `Сейчас в клинике в базе указано ${n} врачей. Подробнее — в разделе «Наши врачи» на главной странице.`;
    }

    if (ruDoctorList || kkDoctorList) {
      if (list.length === 0) {
        return effectiveLang === 'kk'
          ? 'Дәрігерлер тізімі бос немесе барлығы бос емес күйде.'
          : 'Список врачей пуст или все врачи скрыты.';
      }
      const short = list
        .slice(0, 12)
        .map((d) => `• ${d.name} — ${d.spec || (effectiveLang === 'kk' ? 'мамандық көрсетілмеген' : 'специализация не указана')}${d.years != null ? ` (${d.years} ${effectiveLang === 'kk' ? 'жыл' : 'лет'})` : ''}`)
        .join('\n');
      const tail = list.length > 12 ? (effectiveLang === 'kk' ? `\n… және тағы ${list.length - 12}.` : `\n… и ещё ${list.length - 12}.`) : '';
      return effectiveLang === 'kk'
        ? `Біздің дәрігерлер:\n${short}${tail}`
        : `Наши врачи:\n${short}${tail}`;
    }

    return null;
  }

  async chat(req, res, next) {
    try {
      const { message, lang = 'ru' } = req.body;
      const lowerMessage = (message || '').toLowerCase();

      const effectiveLang = this.detectLanguage(lowerMessage, lang);

      const fallback =
        effectiveLang === 'kk'
          ? 'Кешіріңіз, мен бұл сұрақты түсінбедім. Операторға қоңырау шалуды немесе басқаша сұрауды өтінемін.'
          : 'Извините, я не совсем понял ваш вопрос. Пожалуйста, позвоните оператору или попробуйте перефразировать.';

      let aiResponse = fallback;

      const dataAnswer = await this.tryDataDrivenAnswer(lowerMessage, effectiveLang);
      if (dataAnswer) {
        aiResponse = dataAnswer;
      } else {
        const knowledge = this.knowledgeBase[effectiveLang] || this.knowledgeBase.ru;
        for (const item of knowledge) {
          if (item.keywords.some((k) => lowerMessage.includes(k))) {
            aiResponse = item.response;
            break;
          }
        }
      }

      res.json({
        success: true,
        response: aiResponse,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AIController();
