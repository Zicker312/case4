# Case 4 — Maintenance Service

Итоговая версия сервиса учёта заявок на обслуживание оборудования. Проект продолжает Кейсы 2–3 и добавляет аутентификацию, роли, Docker Compose, Nginx, Grafana, health-checks, логи, метрики, Jest и OpenAPI.

## 1. Стек

- Node.js 20 + Express
- PostgreSQL 16 + Sequelize
- JWT + bcryptjs
- Nginx
- Grafana
- Jest + Supertest
- Docker Compose

## 2. Запуск с чистой машины

Нужны Docker Desktop и Git. Код менять не требуется.

```bash
cp .env.example .env
```

Для локального запуска через обычный HTTP в `.env` установите:

```env
NODE_ENV=development
JWT_SECRET=local_secret_change_me
DB_PASSWORD=local_db_password
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
GRAFANA_ADMIN_PASSWORD=local_grafana_password
```

Запуск:

```bash
docker compose up -d --build
```

После запуска применить схему и демонстрационные данные:

```bash
docker compose run --rm api npm run db:migrate
docker compose run --rm api npm run db:seed
```

Проверка:

- http://localhost — приложение через Nginx
- http://localhost/api/docs/ — Swagger UI
- http://localhost/api/health/live — liveness
- http://localhost/api/health/ready — readiness + PostgreSQL
- http://localhost/grafana/ — Grafana, пользователь `monitor`, пароль `monitor123` для HTTP basic auth, затем учётная запись Grafana из `.env`
- http://localhost/metrics — защищённые Prometheus-метрики

Только Nginx публикует порт наружу. PostgreSQL и Node.js напрямую не публикуются.

## 3. Демонстрационные пользователи

| Роль | Email | Пароль |
|---|---|---|
| admin | admin@example.com | Admin123! |
| viewer | viewer@example.com | Viewer123! |
| technician | tech@example.com | Tech12345! |

Пароли приведены только для учебного стенда. В реальной эксплуатации их необходимо заменить.

## 4. Роли

| Роль | Возможности |
|---|---|
| viewer | чтение справочников, заявок, истории и отчётов |
| technician | права viewer + создание/редактирование заявок и смена статуса назначенных заявок |
| admin | все операции, оборудование, площадки, назначение бригад и удаление |

Регистрация через `/api/auth/register` всегда создаёт пользователя `viewer`. Административную роль нельзя получить через публичную регистрацию.

## 5. Аутентификация

Access JWT действует 15 минут. Refresh-токен хранится в HttpOnly cookie и имеет ограниченный срок действия. При refresh старая refresh-сессия отзывается и выдаётся новая. В базе хранится только SHA-256-хеш refresh-токена.

Для production за HTTPS необходимо оставить `COOKIE_SECURE=true`. Для локального HTTP стенда используется `COOKIE_SECURE=false`.

Вход ограничен отдельным rate limit. Сообщение при неверном логине одинаково для отсутствующего пользователя и неправильного пароля.

## 6. Docker и Nginx

Стек состоит из четырёх контейнеров:

```text
client -> nginx -> api -> postgres
                  |
                  +-> api_request_metrics <- Grafana
```

Dockerfile двухступенчатый, production-контейнер запускается от пользователя `node`. Healthcheck PostgreSQL выполняется до запуска API, а healthcheck API выполняется до запуска Nginx.

Миграции и seed не выполняются автоматически при каждом старте контейнера. Это сделано отдельным воспроизводимым шагом:

```bash
docker compose run --rm api npm run db:migrate
docker compose run --rm api npm run db:seed
```

## 7. Мониторинг

Middleware записывает HTTP-метрики в PostgreSQL и одновременно отдаёт Prometheus-формат через `/metrics`.

Grafana автоматически получает datasource PostgreSQL и dashboard из `deploy/grafana/`.

На dashboard есть:

- количество HTTP-запросов;
- 4xx и 5xx;
- среднее время ответа;
- заявки по статусам;
- заявки по приоритетам;
- среднее время закрытия;
- нагрузка на оборудование;
- просроченные плановые работы.

Есть alert на долю ответов 5xx выше 5% в течение двух минут. При срабатывании сначала проверяются `/api/health/ready`, логи API/Nginx и состояние PostgreSQL.

## 8. Логи

Логи API идут в stdout в JSON-виде. В каждой HTTP-записи есть requestId, метод, путь, статус, длительность и IP. Уровень задаётся `LOG_LEVEL`.

Посмотреть:

```bash
docker compose logs -f api
docker compose logs -f nginx
docker compose logs -f postgres
```

## 9. Типовые отказы

### PostgreSQL недоступен

```bash
docker compose ps
docker compose logs postgres
docker compose logs api
```

После восстановления БД проверить:

```text
/api/health/ready
```

### Растёт 5xx

1. открыть Grafana;
2. посмотреть панель 5xx и время ответа;
3. проверить `docker compose logs api`;
4. проверить PostgreSQL;
5. проверить последние миграции.

### Закончился диск

Проверить состояние Docker volumes и свободное место на хосте. После резервного копирования удалить только ненужные данные. Рабочий volume PostgreSQL удалять без резервной копии нельзя.

## 10. Откат миграций

Последняя миграция:

```bash
docker compose run --rm api npm run db:migrate:undo
```

Полный откат:

```bash
docker compose run --rm api npm run db:migrate:undo:all
```

## 11. Тесты

```bash
npm install
npm test
```

Тесты проверяют ключевую бизнес-логику и базовые интеграционные сценарии: health, 401 для защищённого API и доступность Swagger.

В учебной версии интеграционные тесты не используют отдельную production-базу.

## 12. OpenAPI

Swagger UI доступен по `/api/docs/`. Авторизованный запрос можно выполнять через кнопку Authorize и Bearer JWT.

## 13. Архитектура

```text
routes -> controllers -> services -> repositories -> Sequelize/PostgreSQL
                  |
                  +-> domain/policies
                  +-> middlewares/auth, metrics, logger
```

Роли и проверки доступа находятся в middleware, бизнес-правила переходов статусов и назначения бригады — в domain/service слоях.

## 14. Ограничения учебной версии

- HTTPS и автоматический HTTP→HTTPS redirect не включены в основной стенд.
- CI/CD, tracing, Nginx cache и нагрузочный тест оставлены как дополнительные задания.
- Для Grafana выбран PostgreSQL как источник прикладных и технических метрик, чтобы сохранить требуемый компактный стек из четырёх сервисов.
- Для высоких нагрузок в промышленной системе разумнее вынести метрики в Prometheus/OpenTelemetry.
- Доступ к Grafana и `/metrics` в учебном стенде дополнительно защищён Basic Auth.

## 15. Сценарий защиты

1. `docker compose up -d --build`.
2. Выполнить миграции и seed.
3. Войти как admin.
4. Создать заявку.
5. Назначить бригаду.
6. Перевести заявку `new -> in_progress -> done`.
7. Открыть Grafana и показать изменения.
8. Для диагностики остановить PostgreSQL и показать изменение `/api/health/ready` и записи логов.
