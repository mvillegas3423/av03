# Почта на Cloudflare — развёртывание и настройка

Документ для этого проекта (av03 · GOLDEN ERA MOTORS · **goldeneramotors.site**).
Читая его, ты должен понять, как устроена почта проекта, что уже сделано и что делать дальше.
Актуально для всех пяти сайтов портфеля — отличается только домен и бренд.

---

## 1. Как это устроено

```
входящие   MX goldeneramotors.site → Cloudflare Email Routing (бесплатно, без лимита)
             └─ правила зоны → Send to a Worker → воркер helixworks-mail
                  ├─ адрес есть в EMAIL_ADDRESSES → письмо сохраняется в ящик
                  └─ адреса нет в списке → письмо отбрасывается на входе (спам не проходит)

исходящие  веб-интерфейс → binding send_email (Cloudflare Email Service)
             └─ DKIM домена goldeneramotors.site, лимит 3 000 писем/мес на весь аккаунт

хранение   Durable Object на каждый ящик (SQLite) + вложения в R2 (бакет agentic-inbox)

доступ     Cloudflare Access: вход по email-коду, посторонний не откроет
```

Один воркер обслуживает **все пять доменов** портфеля. Отдельный воркер на домен не нужен.

## 2. Что уже сделано

| Что | Значение |
|---|---|
| Воркер | `helixworks-mail` (код — `sites/mail`, клон [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox)) |
| Технический адрес | `https://helixworks-mail.mvillegas3423.workers.dev` |
| Красивый адрес | **https://mail.helixworks.site** — привязан |
| R2-бакет | `agentic-inbox` (вложения) |
| Ящики (адреса) | см. `EMAIL_ADDRESSES` в `sites/mail/wrangler.jsonc` |
| Домены аккаунта | goldeneramotors.site, redlinemotors.site, goldeneramotors.site, auto-master.site, helixworks.site |
| Cloudflare-аккаунт | `Mvillegas3423@gmail.com` (id `a4fa3f863e7c3b2d84588c221ba8a8d6`) |
| Git-аккаунт | `mvillegas3423` (remote `origin`), прежний — remote `old` |
| Токены | `sites/.secrets.alt.local` — **не коммитить, не выводить в лог** |

Почта проекта: **info@goldeneramotors.site** (этот адрес опубликован на сайте: футер, контакты, юридические страницы, JSON-LD).

## 3. DNS-записи домена

| Тип | Имя | Значение | Кто ставит |
|---|---|---|---|
| MX | `@` | `route1.mx.cloudflare.net` (и route2/route3) | Email Routing — уже стоит |
| TXT | `@` | `v=spf1 include:_spf.mx.cloudflare.net ~all` | Email Routing — уже стоит |
| TXT | `cf2024-1._domainkey` | DKIM | Email Sending — добавляет Cloudflare при онбординге домена |
| TXT | `_dmarc` | DMARC-политика | Email Sending — добавляет Cloudflare |
| MX | `@` | `cf-bounce.mx.cloudflare.net` | Email Sending — добавляет Cloudflare |

⚠️ Почта живёт на **apex-домене** (`goldeneramotors.site`), сайт — там же, через Pages. Это не конфликтует:
MX/TXT-записи не влияют на A/CNAME веб-сайта. **Нельзя** вешать почтовое приложение на apex —
только на поддомен (`mail.helixworks.site`).

## 4. Что делать дальше (по шагам)

### Шаг 1. Разрешить доступ (Cloudflare Access) — делает владелец аккаунта
`Workers & Pages → helixworks-mail → Settings → Domains & Routes → Enable Cloudflare Access`.
В модалке появятся два значения — `POLICY_AUD` и `TEAM_DOMAIN`. Их нужно положить в секреты воркера:

```bash
cd sites/mail
npx wrangler secret put POLICY_AUD
npx wrangler secret put TEAM_DOMAIN
```

Без этих секретов воркер отвечает `500 Cloudflare Access must be configured` — это защита,
а не поломка: наружу интерфейс не выставлен.

### Шаг 2. Привязать красивый адрес
`Workers & Pages → helixworks-mail → Settings → Domains & Routes → Add → Custom Domain` → `mail.helixworks.site`.
Cloudflare сам создаст DNS-запись. Через API это требует прав `Workers Custom Domains:Edit` и `Zone → DNS:Edit`.

### Шаг 3. Переключить приём почты на воркер
Для **каждого** домена: `Compute → Email Service → Email Routing →` правила зоны:
- правило `info@goldeneramotors.site` → действие **Send to a Worker** → `helixworks-mail`;
- правило **Catch-all** → **Send to a Worker** → `helixworks-mail` (включить, сейчас оно `drop` и выключено).

После этого письма на `info@` (и на любой другой адрес из `EMAIL_ADDRESSES`) попадают в вебмейл.

### Шаг 4. Создать ящики
Открыть `mail.helixworks.site` (или технический адрес), войти по email-коду, создать ящик
`info@goldeneramotors.site`. В настройках ящика задать отображаемое имя (например `GOLDEN ERA MOTORS`) и подпись.

### Шаг 5. Включить отправку
`Compute → Email Service → Email Sending → Onboard Domain` → выбрать `goldeneramotors.site`.
Cloudflare добавит MX `cf-bounce`, SPF, DKIM и DMARC. Требуется активный тариф **Workers Paid** —
без него отправка возможна только на подтверждённые адреса своего аккаунта.

### Шаг 6. Проверить
1. Письмо на `info@goldeneramotors.site` → появилось в вебмейле.
2. Ответ из вебмейла → ушёл с `info@goldeneramotors.site`, DKIM/SPF/DMARC прошли, не в спаме.
3. Письмо с `info@goldeneramotors.site` на внешний адрес → подписано доменом goldeneramotors.site.
4. Письмо на выдуманный адрес `test123@goldeneramotors.site` → отброшено (не в списке ящиков).

## 5. Как отправлять и отвечать (правила приложения)

- **Выбор домена отправки = выбор ящика.** В коде стоит проверка
  `From address must match the mailbox email address` (`workers/lib/email-helpers.ts`):
  письмо уходит только от того адреса, чей ящик открыт. Свободного поля «От кого» нет — это защита
  от отправки с чужого адреса.
- **Ответ уходит с того домена, на который письмо пришло**: маршрут ответа привязан к ящику
  (`handleReplyEmail`), оригинал читается из хранилища этого же ящика, тред сохраняется
  (`In-Reply-To`, `References`).
- Каждый ящик имеет свои: отображаемое имя, подпись, автоответ, пересылку копии, хранилище и вложения.

## 6. Лимиты и деньги

| | Значение |
|---|---|
| Приём писем | без лимита, бесплатно |
| Отправка на **любые** адреса | 3 000/мес на аккаунт, далее $0.35 за 1 000 (нужен Workers Paid) |
| Отправка на **подтверждённые** адреса аккаунта | бесплатно, в квоту не входит |
| R2 | бесплатно до 10 ГБ |
| Workers AI | **отключён** — привязка `ai` убрана из `wrangler.jsonc`, расходов нет |

ИИ-агент приложения (черновики ответов, чат) намеренно выключен. Приём и отправка почты от этого
не зависят: обработчик входящих писем ИИ не использует. Чтобы включить — вернуть блок `"ai": { "binding": "AI" }`
в `wrangler.jsonc` и передеплоить.

## 7. Эксплуатация

```bash
cd sites/mail
npm install
npm run build
npx wrangler deploy          # нужны CLOUDFLARE_API_TOKEN и CLOUDFLARE_ACCOUNT_ID из sites/.secrets.alt.local
npx wrangler tail            # логи: приём писем, ошибки отправки
```

Бэкап правил Email Routing и список ящиков — важные вещи при изменениях: перед правкой правил
выгружать текущие (`GET /zones/{zone}/email/routing/rules`) и сохранять в этот файл.

## 8. Если почта не приходит

1. `npx wrangler tail` — видно ли событие приёма.
2. Есть ли адрес в `EMAIL_ADDRESSES` (регистр не важен, но опечатка = отброс письма).
3. Существует ли ящик: без созданного ящика письмо игнорируется (`mailbox does not exist`).
4. Правила зоны: `info@` → Worker, catch-all → Worker, оба **включены**.
5. MX-записи домена указывают на `route*.mx.cloudflare.net`.
6. Проверить спам-папку отправителя: DKIM появляется только после онбординга домена в Email Sending.

## 9. Добавление нового домена или адреса

1. Домен добавить в Cloudflare-аккаунт, переключить NS, включить Email Routing.
2. Дописать домен в `DOMAINS` и адрес в `EMAIL_ADDRESSES` в `sites/mail/wrangler.jsonc` → `npx wrangler deploy`.
3. В правилах зоны нового домена: `info@` и catch-all → `Send to a Worker` → `helixworks-mail`.
4. Онбордить домен в Email Sending (иначе отправка с него не пойдёт: ошибка `E_SENDER_DOMAIN_NOT_AVAILABLE`).
5. Создать ящик в веб-интерфейсе.

## 10. Текущий статус (проверено)

| Шаг | Состояние |
|---|---|
| Воркер развёрнут | ✅ `helixworks-mail` |
| Вход в вебмейл | ✅ **по паролю**: форма на `/login`, сессия в подписанной cookie на 30 дней. Cloudflare Access снят — email-коды и подтверждения не нужны |
| Секреты воркера | `AUTH_PASSWORD` (пароль входа) и `SESSION_SECRET` (подпись cookie). Пароль хранится в `sites/.secrets.alt.local` |
| Team domain | `https://steep-fire-b41b.cloudflareaccess.com` |
| AUD (Application Audience Tag) | `fdd0cc900be7a24132a32213322cc4db15cc17400e8eafe22b287b35927bb998` |
| Красивый адрес | ✅ `https://mail.helixworks.site` — DNS CNAME + Worker-route `mail.helixworks.site/*` (Custom Domains API токену недоступен, сделано через DNS+route) |
| Ответ обоих адресов | ✅ HTTP 302 → страница входа Cloudflare Access |
| Как поменять пароль | записать секрет через API (`PUT .../workers/scripts/helixworks-mail/secrets`) — через stdin wrangler добавляет перевод строки и пароль ломается |
| Онбординг Email Sending по доменам | ⏳ вручную в дашборде: `Compute → Email Service → Email Sending → Onboard Domain` (публичного API нет, DKIM-ключ генерирует Cloudflare) |
| Переключение приёма на воркер | ✅ `info@` и catch-all → `worker:helixworks-mail` во всех пяти доменах, пересылка на Gmail отключена (бэкап правил — `sites/.lh/email-routing-backup-*.json`) |
| Ящики `info@` | ✅ созданы (объекты в R2 `mailboxes/<адрес>.json`, имена заданы) |

## Права токена Cloudflare для автоматизации

Чтобы ИИ настроил почту и поддомены без участия владельца, токену нужны права:

| Право | Уровень | Зачем |
|---|---|---|
| Workers Scripts → Edit | Account | деплой воркера и секретов |
| Workers R2 Storage → Edit | Account | бакет для вложений |
| Workers Custom Domains → Edit | Account | привязка `mail.<домен>` (без него — обход через DNS + route) |
| Zone → Zone → Read | Zone | перечислить зоны |
| Zone → DNS → Edit | Zone | поддомен, MX/SPF/DKIM/DMARC |
| Zone → Workers Routes → Edit | Zone | Worker-route для поддомена |
| Zone → Email Routing Rules → Edit | Zone | правила приёма: `info@` и catch-all → воркер |
| Account → Email Routing Addresses → Edit | Account | адреса-получатели пересылки |
| Account → Access: Apps and Policies → Edit | Account | читать Access-приложение и **AUD** (нужен для `POLICY_AUD`) |
| Account → Access: Organizations, Identity Providers, Groups → Edit | Account | Zero Trust организация и **team domain** (для `TEAM_DOMAIN`) |
| Billing → Read | Account | проверить активный Workers Paid |

Остальное (онбординг **Email Sending** по домену и подтверждение тарифа) делается только руками
в дашборде — публичного API для этого нет.

Полная матрица прав, порядок автоматизации, команды проверки и разбор реальных ошибок
(`405` на Custom Domains, `403` на настройках Email Routing, неверная автоподстановка секретов
Access): **`sites/mail/CLOUDFLARE-SETUP.md`**.

## Развёртывание с нуля и все грабли

Полный отчёт: **`sites/mail/DEPLOYMENT.md`** — схема, хронология, таблица «симптом → причина → решение»
(19 грабель: BOM в JSON и секретах, catch-all через отдельный эндпоинт, 405 на Custom Domains,
недоступные права Email Routing, неверная автоподстановка секретов Access, пустые cc/bcc и пустое тело
письма в zod-схеме), пошаговый чеклист развёртывания, проверка после него и регламент эксплуатации.