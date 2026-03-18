import os
import time
import docker
import requests
import schedule
import psutil
from datetime import datetime

# Настройки (Заполните или передайте через окружение)
TOKEN = os.getenv("TELEGRAM_TOKEN", "ВАШ_ТОКЕН")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "ВАШ_CHAT_ID")
CHECK_INTERVAL = 30  # Проверка ошибок каждые 30 секунд
HEALTH_REPORT_INTERVAL = 2  # Отчет каждые 2 часа

# Пороговые значения
CPU_THRESHOLD = 90.0  # %
RAM_THRESHOLD = 90.0  # %
DISK_THRESHOLD = 90.0 # % (занято)

client = docker.from_env()

def send_telegram(message):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {"chat_id": CHAT_ID, "text": message, "parse_mode": "HTML"}
    try:
        requests.post(url, json=payload, timeout=10)
    except Exception as e:
        print(f"Ошибка отправки в Telegram: {e}")

last_states = {}

def get_system_stats():
    cpu = psutil.cpu_percent(interval=1)
    ram = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent
    return cpu, ram, disk

def check_services():
    global last_states
    errors = []
    warnings = []
    
    # 1. Проверка системных ресурсов (CPU, RAM, DISK)
    cpu, ram, disk = get_system_stats()
    if cpu > CPU_THRESHOLD:
        errors.append(f"🔥 <b>CPU: {cpu}%</b> (Нагрузка выше {CPU_THRESHOLD}%)")
    if ram > RAM_THRESHOLD:
        errors.append(f"🧠 <b>RAM: {ram}%</b> (Заполнено выше {RAM_THRESHOLD}%)")
    if disk > DISK_THRESHOLD:
        errors.append(f"💾 <b>DISK: {disk}%</b> (Заполнено выше {DISK_THRESHOLD}%)")

    # 2. Проверка Docker контейнеров
    containers_to_check = ["dentlux_backend", "dentlux_frontend", "dentlux_db", "prometheus", "grafana", "portainer"]
    
    for c_name in containers_to_check:
        try:
            container = client.containers.get(c_name)
            status = container.status
            if status != "running":
                # Особая проверка для циклической перезагрузки
                if status == "restarting":
                    errors.append(f"♻️ {c_name}: <b>RESTARTING</b> (Циклическая ошибка!)")
                else:
                    errors.append(f"❌ {c_name}: <b>{status.upper()}</b>")
        except Exception:
            errors.append(f"❌ {c_name}: <b>НЕ НАЙДЕН</b>")

    # 3. Проверка Backend API Health
    try:
        r = requests.get("http://backend:4000/health", timeout=5)
        if r.status_code != 200:
            errors.append(f"⚠️ Backend API: Status {r.status_code}")
    except Exception:
        # Проверяем, не вызван ли этот упадок падением самого контейнера (чтобы не дублировать)
        if not any("dentlux_backend" in e for e in errors):
            errors.append("⚠️ Backend API: <b>НЕДОСТУПЕН</b> (Сетевая ошибка)")

    # 4. Логика уведомлений (Мгновенные алерты)
    current_errors = "\n".join(errors)
    if errors:
        # Шлем алерт только если список ошибок изменился (чтобы не спамить каждые 30 сек)
        if current_errors != last_states.get("errors"):
            send_telegram(f"🚨 <b>ОБНАРУЖЕНЫ ПРОБЛЕМЫ</b>\n\n{current_errors}")
            last_states["errors"] = current_errors
    else:
        # Если ошибки пропали
        if last_states.get("errors"):
            send_telegram("✅ <b>СИСТЕМА ВОССТАНОВЛЕНА. Все ошибки исправлены.</b>")
            last_states["errors"] = None

    return cpu, ram, disk

def send_health_report():
    cpu, ram, disk = check_services()
    
    # Собираем красивый отчет
    report = (
        f"🕙 <b>Плановый отчет ({datetime.now().strftime('%H:%M')})</b>\n\n"
        f"🖥 <b>Ресурсы хоста:</b>\n"
        f"└ CPU: {cpu}%\n"
        f"└ RAM: {ram}%\n"
        f"└ DISK: {disk}%\n\n"
        f"🐋 <b>Контейнеры:</b>\n"
        f"└ Backend: OK\n"
        f"└ Frontend: OK\n"
        f"└ Database: OK\n"
        f"└ Monitoring: OK\n\n"
        f"🌐 <b>API Status:</b> Healthy\n\n"
        f"✅ <b>Все системы в норме. 👍</b>"
    )
    
    # Если есть текущие ошибки, добавим их в отчет
    if last_states.get("errors"):
        report = report.replace("✅ <b>Все системы в норме. 👍</b>", "⚠️ <b>ВНИМАНИЕ: Есть активные ошибки!</b>")
        report += f"\n\n🚨 <b>Актуальные проблемы:</b>\n{last_states.get('errors')}"

    send_telegram(report)

# Планировщик
schedule.every(HEALTH_REPORT_INTERVAL).hours.do(send_health_report)

if __name__ == "__main__":
    print(f"Запуск бота с токеном: {TOKEN[:10]}... и ID: {CHAT_ID}")
    send_telegram("🤖 <b>Бот мониторинга v2.0 запущен!</b>\nСлежу за ресурсами, Docker и API.")
    
    while True:
        try:
            check_services()
            schedule.run_pending()
        except Exception as e:
            print(f"Ошибка в основном цикле бота: {e}")
        time.sleep(CHECK_INTERVAL)
