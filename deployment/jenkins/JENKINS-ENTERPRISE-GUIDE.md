# Jenkins на уровне enterprise для DentLux / DentReserve Pro

Ваш образ Jenkins содержит **Git**, **Docker CLI + Compose v2**, **Node 20**, плагины **Pipeline**, **AnsiColor**, **Timestamper**, **Blue Ocean**, **Docker workflow**, **Credentials Binding**, **Slack**, **email-ext**, **Prometheus**, **JCasC**, **Job DSL**. Ниже — что сделать, чтобы пайплайн выглядел и работал как в крупных компаниях.

### Быстрый старт (после правок в репозитории)

1. Закоммитьте и запушьте изменения (в т.ч. `deployment/jenkins/`).
2. Пересоберите и перезапустите Jenkins, чтобы подтянулись плагины и JCasC:
   `docker compose build jenkins && docker compose up -d jenkins`
3. Откройте `http://localhost:8086` — job **`dentlux-ci`** должен появиться сам (из `casc/jenkins.yaml`). Запустите **Build Now**.
4. Если репозиторий **приватный**: в Jenkins создайте credential с ID **`dentlux-github`** (PAT GitHub) и в `jenkins.yaml` в блоке `remote { }` добавьте строку `credentials('dentlux-github')`, затем снова перезапустите Jenkins.
5. Уже был вручную создан job с тем же именем — конфигурация применится из JCasC при старте (проверьте ветку **main** и Script Path).

---

## 1. Базовая гигиена (без этого «топ» не собрать)

| Практика | Зачем |
|----------|--------|
| **Один репозиторий — один мультистейдж Pipeline** | Повторяемость, аудит, откат по билдам. |
| **Секреты только в Jenkins Credentials** | Не хранить `GEMINI_API_KEY`, пароли БД, токены в коде и в логах. |
| **Отдельные агенты / labels** | `docker` для сборки образов, `linux` для npm — изоляция и предсказуемость. |
| **Версионирование артефактов** | Тег образа = `GIT_COMMIT` или semver; никогда не только `latest` в проде. |
| **Уведомления** | Slack/Teams/email на успех и **обязательно** на неуспех (`post { failure { ... } }`). |

---

## 2. Рекомендуемые этапы пайплайна (stages)

1. **Checkout** — `git` с shallow clone при больших репозиториях (`depth: 1` для ускорения).
2. **Lint / Format** (опционально) — `npm run lint` в `backend` и `frontend`, если скрипты появятся.
3. **Backend: зависимости и проверка схемы** — `cd backend && npm ci && npx prisma validate` (и при необходимости `npx prisma generate` без доступа к прод-БД).
4. **Тесты** — `npm test` в backend (Jest уже в `package.json`); при отсутствии тестов этап помечают `unstable` или временно `when { expression { return false } }`.
5. **SBOM / уязвимости** (уровень зрелости) — `npm audit --production` с порогом; отдельно контейнерный скан (Trivy) при публикации в registry.
6. **Сборка Docker** — `docker compose build backend frontend` или отдельные `docker build` с `--build-arg` для `VITE_API_BASE_URL` в проде.
7. **Публикация образов** (GHCR, GCR, Harbor) — `docker tag` + `docker push` с учётными данными из Credentials.
8. **Деплой** — SSH + `docker compose pull && up -d` или Kubernetes `kubectl`/Helm; отдельный job «Deploy to staging» и ручное подтверждение для prod.
9. **Smoke после деплоя** — `curl -f https://api.example.com/health` (у вас уже есть `/health`).

---

## 3. Что настроить в UI Jenkins (пошагово)

1. Откройте `http://localhost:8086` (как в `jenkins.yaml`).
2. **Manage Jenkins → Credentials** — добавьте:
   - `dentlux-git-ssh` или username/password для Git;
   - `docker-registry` для push образов;
   - `slack-webhook` или токен Slack;
   - при деплое по SSH — `ssh-deploy-key` с приватным ключом.
3. Job **`dentlux-ci`** создаётся из **`casc/jenkins.yaml`** (GitHub `AdilMoon/DentLux`, ветка `main`). Ручной **New Item** не нужен, если JCasC отработал без ошибок.
4. **Build Triggers**: webhook из GitHub/GitLab на push; локально — **Poll SCM** или **Build Now**.
5. **Blue Ocean** — визуально смотреть стадии и время; полезно для демонстраций.

---

## 4. Интеграция с вашим репозиторием

- Файл **`deployment/jenkins/Jenkinsfile.dentlux`** — пайплайн DentLux (checkout, backend, docker build). URL репозитория для job’а задаётся в **`jenkins.yaml`**.
- **`deployment/jenkins/casc/jenkins.yaml`** — через **Job DSL** создаётся pipeline **`dentlux-ci`** из GitHub; при смене URL/ветки отредактируйте YAML и перезапустите контейнер Jenkins.

---

## 5. Метрики и наблюдаемость

- Плагин **Prometheus** уже в образе — endpoint метрик Jenkins для связки с вашим **Prometheus/Grafana** в `docker-compose`.
- В крупных компаниях ещё ведут **build history retention** и отдельный лог-агрегатор; для старта достаточно Slack при падении билда.

---

## 6. Безопасность

- Не монтировать **docker.sock** на прод-Jenkins без понимания рисков (контейнер получает root на хосте). Для enterprise часто используют **Kaniko**, **BuildKit** в отдельном кластере или выделенные build-агенты.
- Включить **RBAC** в Jenkins при нескольких командах.
- Ротировать секреты и ограничить, кто может запускать **Deploy** на production.

---

Кратко: **топовый вид** — это не один плагин, а связка: **Pipeline из SCM + credentials + стадии качества + артефакты с версией + уведомления + smoke после деплоя**. Ваш проект уже подготовлен к Docker и health-check; осталось подключить репозиторий и секреты.
