import os
import asyncio
import docker
import psutil
import requests
import logging
from datetime import datetime
from telegram import Update, constants
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Настройки (Заполните или передайте через окружение)
TOKEN = os.getenv("TELEGRAM_TOKEN", "ВАШ_ТОКЕН")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "ВАШ_CHAT_ID")
CHECK_INTERVAL = 30  # Проверка ошибок каждые 30 секунд
HEALTH_REPORT_INTERVAL = 7200  # Отчет каждые 2 часа (в секундах)

# Пороговые значения
CPU_THRESHOLD = 90.0  # %
RAM_THRESHOLD = 90.0  # %
DISK_THRESHOLD = 90.0  # % (занято)

# Инициализация Docker клиента
try:
    client = docker.from_env()
except Exception as e:
    print(f"Ошибка инициализации Docker: {e}")
    client = None

last_states = {"errors": None}

def get_system_stats():
    cpu = psutil.cpu_percent(interval=1)
    ram = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent
    return cpu, ram, disk

async def check_services_logic():
    errors = []
    
    # 1. Проверка системных ресурсов
    cpu, ram, disk = get_system_stats()
    if cpu > CPU_THRESHOLD:
        errors.append(f"🔥 <b>CPU: {cpu}%</b> (Нагрузка выше {CPU_THRESHOLD}%)")
    if ram > RAM_THRESHOLD:
        errors.append(f"🧠 <b>RAM: {ram}%</b> (Заполнено выше {RAM_THRESHOLD}%)")
    if disk > DISK_THRESHOLD:
        errors.append(f"💾 <b>DISK: {disk}%</b> (Заполнено выше {DISK_THRESHOLD}%)")

    # 2. Проверка Docker контейнеров
    containers_to_check = [
        "dentlux_backend", "dentlux_frontend", "dentlux_db", 
        "prometheus", "grafana", "portainer", "cadvisor",
        "n8n_engine", "jenkins_cicd", "zabbix_server", "nagios"
    ]
    
    if client:
        for c_name in containers_to_check:
            try:
                container = client.containers.get(c_name)
                status = container.status
                if status != "running":
                    if status == "restarting":
                        errors.append(f"♻️ {c_name}: <b>RESTARTING</b> (Циклическая ошибка!)")
                    else:
                        errors.append(f"❌ {c_name}: <b>{status.upper()}</b>")
            except Exception:
                errors.append(f"❌ {c_name}: <b>НЕ НАЙДЕН</b>")
    else:
        errors.append("🐋 <b>Docker API недоступен</b>")

    # 3. Проверка Backend API Health
    try:
        # Внутри Docker сети используем имя сервиса или localhost если хост
        r = requests.get("http://dentlux_backend:4000/health", timeout=5)
        if r.status_code != 200:
            errors.append(f"⚠️ Backend API: Status {r.status_code}")
    except Exception:
        if not any("dentlux_backend" in e for e in errors):
            errors.append("⚠️ Backend API: <b>НЕДОСТУПЕН</b>")

    return cpu, ram, disk, errors

async def monitor_task(context: ContextTypes.DEFAULT_TYPE):
    cpu, ram, disk, errors = await check_services_logic()
    current_errors = "\n".join(errors)
    
    if errors:
        if current_errors != last_states.get("errors"):
            await context.bot.send_message(
                chat_id=CHAT_ID,
                text=f"🚨 <b>ОБНАРУЖЕНЫ ПРОБЛЕМЫ</b>\n\n{current_errors}",
                parse_mode=constants.ParseMode.HTML
            )
            last_states["errors"] = current_errors
    else:
        if last_states.get("errors"):
            await context.bot.send_message(
                chat_id=CHAT_ID,
                text="✅ <b>СИСТЕМА ВОССТАНОВЛЕНА. Все ошибки исправлены.</b>",
                parse_mode=constants.ParseMode.HTML
            )
            last_states["errors"] = None

async def send_health_report(context: ContextTypes.DEFAULT_TYPE):
    cpu, ram, disk, errors = await check_services_logic()
    
    status_emoji = "✅" if not errors else "⚠️"
    container_status = "OK" if not any("❌" in e or "♻️" in e for e in errors) else "ОШИБКИ"
    
    report = (
        f"🕙 <b>Плановый отчет ({datetime.now().strftime('%H:%M')})</b>\n\n"
        f"🖥 <b>Ресурсы хоста:</b>\n"
        f"├ CPU: <code>{cpu}%</code>\n"
        f"├ RAM: <code>{ram}%</code>\n"
        f"└ DISK: <code>{disk}%</code>\n\n"
        f"🐋 <b>Контейнеры:</b> {container_status}\n"
        f"🌐 <b>Backend API:</b> {'Healthy' if not any('Backend' in e for e in errors) else 'Unhealthy'}\n\n"
        f"{status_emoji} <b>{'Все системы в норме. 👍' if not errors else 'ВНИМАНИЕ: Есть активные проблемы!'}</b>"
    )
    
    if errors:
        report += f"\n\n🚨 <b>Актуальные проблемы:</b>\n" + "\n".join(errors)

    await context.bot.send_message(chat_id=CHAT_ID, text=report, parse_mode=constants.ParseMode.HTML)

# Обработчики команд
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"Получена команда /start от {update.effective_user.id}")
    welcome_text = (
        "👋 <b>Привет! Я бот мониторинга DentLux.</b>\n\n"
        "Я слежу за состоянием серверов и контейнеров 24/7.\n\n"
        "<b>Доступные команды:</b>\n"
        "/status - Мгновенная проверка состояния систем\n"
        "/help - Справка по командам\n"
        "/ping - Проверка связи с ботом"
    )
    await update.message.reply_text(welcome_text, parse_mode=constants.ParseMode.HTML)

async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"Получена команда /status от {update.effective_user.id}")
    wait_msg = await update.message.reply_text("🔄 <i>Собираю данные...</i>", parse_mode=constants.ParseMode.HTML)
    
    cpu, ram, disk, errors = await check_services_logic()
    
    def get_bar(percent):
        filled = int(percent / 10)
        return "■" * filled + "□" * (10 - filled)

    report = (
        f"📊 <b>Текущий статус системы</b>\n"
        f"📅 {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}\n\n"
        f"🖥 <b>Нагрузка:</b>\n"
        f"├ CPU: <code>{cpu}%</code> [{get_bar(cpu)}]\n"
        f"├ RAM: <code>{ram}%</code> [{get_bar(ram)}]\n"
        f"└ DSK: <code>{disk}%</code> [{get_bar(disk)}]\n\n"
        f"🐋 <b>Контейнеры:</b>\n"
    )
    
    containers = [
        "dentlux_backend", "dentlux_frontend", "dentlux_db", 
        "prometheus", "grafana", "portainer", "cadvisor",
        "n8n_engine", "jenkins_cicd", "zabbix_server", "nagios"
    ]
    for c in containers:
        try:
            container = client.containers.get(c)
            emoji = "🟢" if container.status == "running" else "🔴"
            report += f"├ {emoji} {c}: <code>{container.status}</code>\n"
        except:
            report += f"├ ⚪️ {c}: <code>not found</code>\n"
    
    # Добавляем инфо о Backend API
    api_status = "🟢 Healthy" if not any("Backend API" in e for e in errors) else "🔴 Unhealthy"
    report += f"\n🌐 <b>Backend API:</b> <code>{api_status}</code>"

    if errors:
        report += f"\n\n🚨 <b>Проблемы:</b>\n" + "\n".join(errors)
    else:
        report += f"\n\n✅ <b>Все системы работают штатно.</b>"

    await context.bot.edit_message_text(
        chat_id=update.effective_chat.id,
        message_id=wait_msg.message_id,
        text=report,
        parse_mode=constants.ParseMode.HTML
    )

async def graph_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"Получена команда /graph от {update.effective_user.id}")
    wait_msg = await update.message.reply_text("🔄 <i>Генерирую график ресурсов...</i>", parse_mode=constants.ParseMode.HTML)
    
    cpu, ram, disk = get_system_stats()
    
    # Ссылка на Grafana (внешняя)
    grafana_url = "http://localhost:3000"
    
    # Параметры рендеринга
    DASHBOARD_UID = "rYdddlPWk"
    PANEL_ID = "77" # CPU Basic (Time series) - ID 77 в Node Exporter Full
    
    # Внутренний URL для рендеринга внутри Docker-сети
    # Добавлена задержка timeout=10 для полной загрузки данных перед скриншотом
    render_url = (
        f"http://grafana:3000/render/d-solo/{DASHBOARD_UID}/node-exporter-full?"
        f"orgId=1&panelId={PANEL_ID}&width=1000&height=500&from=now-30m&to=now"
        "&var-job=node-exporter&var-nodename=1744b157459f&var-node=node-exporter:9100"
        "&timeout=30"
    )
    
    text = (
        "📈 <b>Состояние ресурсов (Grafana)</b>\n\n"
        f"🖥 <b>CPU:</b> <code>{cpu}%</code>\n"
        f"🧠 <b>RAM:</b> <code>{ram}%</code>\n"
        f"💾 <b>Disk:</b> <code>{disk}%</code>\n\n"
        f"🔗 <a href='{grafana_url}'>Открыть дашборд полностью</a>"
    )

    try:
        # Пытаемся получить скриншот
        response = requests.get(render_url, timeout=60)
        if response.status_code == 200:
            from io import BytesIO
            photo = BytesIO(response.content)
            photo.name = 'graph.png'
            
            await context.bot.send_photo(
                chat_id=update.effective_chat.id,
                photo=photo,
                caption=text,
                parse_mode=constants.ParseMode.HTML
            )
            # Удаляем сообщение об ожидании
            await context.bot.delete_message(chat_id=update.effective_chat.id, message_id=wait_msg.message_id)
        else:
            logger.error(f"Grafana Render error: {response.status_code} - {response.text}")
            await context.bot.edit_message_text(
                chat_id=update.effective_chat.id,
                message_id=wait_msg.message_id,
                text=text + f"\n\n⚠️ <i>Не удалось сгенерировать график (Код: {response.status_code}).</i>",
                parse_mode=constants.ParseMode.HTML
            )
    except Exception as e:
        logger.error(f"Error generating graph: {e}")
        await context.bot.edit_message_text(
            chat_id=update.effective_chat.id,
            message_id=wait_msg.message_id,
            text=text + f"\n\n⚠️ <i>Ошибка рендеринга: {str(e)}</i>",
            parse_mode=constants.ParseMode.HTML
        )

async def containers_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"Получена команда /containers от {update.effective_user.id}")
    if not client:
        await update.message.reply_text("❌ Docker API недоступен")
        return

    msg = "🐋 <b>Список контейнеров:</b>\n\n"
    for container in client.containers.list(all=True):
        status = container.status
        emoji = "🟢" if status == "running" else "🔴"
        uptime = ""
        if status == "running":
            # Упрощенное время запуска
            uptime = f" (up since {container.attrs['State']['StartedAt'][:19].replace('T', ' ')})"
        msg += f"{emoji} <b>{container.name}</b>\n└ Статус: <code>{status}</code>{uptime}\n\n"
    
    await update.message.reply_text(msg, parse_mode=constants.ParseMode.HTML)

async def top_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"Получена команда /top от {update.effective_user.id}")
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
        try:
            processes.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    
    # Сортировка по CPU
    top_cpu = sorted(processes, key=lambda x: x['cpu_percent'], reverse=True)[:5]
    
    msg = "🔝 <b>Топ процессов (CPU):</b>\n\n"
    for p in top_cpu:
        msg += f"🔹 <code>{p['pid']}</code> {p['name']}: <b>{p['cpu_percent']}%</b>\n"
    
    await update.message.reply_text(msg, parse_mode=constants.ParseMode.HTML)

async def logs_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"Получена команда /logs от {update.effective_user.id}")
    if not context.args:
        await update.message.reply_text("Использование: <code>/logs [имя_контейнера]</code>", parse_mode=constants.ParseMode.HTML)
        return
    
    c_name = context.args[0].strip("[]")
    try:
        container = client.containers.get(c_name)
        logs = container.logs(tail=15).decode('utf-8')
        if not logs:
            logs = "Логов нет"
        await update.message.reply_text(f"📋 <b>Логи {c_name}:</b>\n\n<code>{logs}</code>", parse_mode=constants.ParseMode.HTML)
    except Exception as e:
        await update.message.reply_text(f"❌ Ошибка: {str(e)}")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = (
        "📒 <b>Справка по командам:</b>\n\n"
        "🔹 /status - Общий статус систем и API\n"
        "🔹 /graph - Ссылка на Grafana и текущие показатели\n"
        "🔹 /containers - Список всех контейнеров\n"
        "🔹 /top - Топ процессов на хосте\n"
        "🔹 /logs [name] - Последние 15 строк логов контейнера\n"
        "🔹 /ping - Проверка связи\n"
        "🔹 /start - Приветствие\n\n"
        "📢 Бот автоматически присылает уведомления при критических нагрузках (>90%) или падении сервисов."
    )
    await update.message.reply_text(help_text, parse_mode=constants.ParseMode.HTML)

async def ping_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"Получена команда /ping от {update.effective_user.id}")
    await update.message.reply_text("🏓 Понг! Я на связи.")

async def debug_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    logger.info(f"Получено сообщение: {update.message.text} от {update.effective_user.id}")

async def post_init(application: Application):
    """Регистрация команд в меню Telegram при запуске."""
    commands = [
        ("start", "Запустить бота"),
        ("status", "Общий статус системы"),
        ("graph", "Графики и ресурсы"),
        ("containers", "Список контейнеров"),
        ("top", "Топ процессов CPU"),
        ("logs", "Логи контейнера [имя]"),
        ("ping", "Проверка связи"),
        ("help", "Справка по командам"),
    ]
    await application.bot.set_my_commands(commands)
    logger.info("Команды успешно зарегистрированы в меню Telegram")

def main():
    if TOKEN == "ВАШ_ТОКЕН":
        print("❌ ОШИБКА: Не задан TELEGRAM_TOKEN")
        return

    # Создание приложения с post_init
    application = Application.builder().token(TOKEN).post_init(post_init).build()

    # Добавление обработчиков команд
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("status", status_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("ping", ping_command))
    application.add_handler(CommandHandler("graph", graph_command))
    application.add_handler(CommandHandler("containers", containers_command))
    application.add_handler(CommandHandler("top", top_command))
    application.add_handler(CommandHandler("logs", logs_command))
    
    # Отладочный обработчик всех текстовых сообщений
    application.add_handler(MessageHandler(filters.TEXT, debug_handler))

    # Настройка JobQueue для мониторинга
    if application.job_queue:
        job_queue = application.job_queue
        job_queue.run_repeating(monitor_task, interval=CHECK_INTERVAL, first=10)
        job_queue.run_repeating(send_health_report, interval=HEALTH_REPORT_INTERVAL, first=60)
    else:
        logger.error("JobQueue не инициализирован! Проверьте наличие библиотеки python-telegram-bot[job-queue]")

    print(f"🚀 Бот запущен! Токен: {TOKEN[:10]}...")
    
    # Запуск бота (Polling)
    application.run_polling()

if __name__ == "__main__":
    main()
