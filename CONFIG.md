# av03 — Где что менять

Единая точка правды по всем изменяемым значениям сайта. Бренд, контакты и домен
централизованы — в коде нет захардкоженных «GOLDEN ERA MOTORS», телефонов или адресов.

Тема сайта: **американская классика / винтаж**. Фон — бумага, акцент — бордо,
типографика — узкий плакатный Bebas Neue + засечный Bitter.

---

## 1. Бренд, телефон, email, адрес → `src/data/site.ts`

**Главный файл.** Меняешь здесь — обновляется весь сайт (шапка, футер, контакты,
мета-описания, юридические страницы, CTA).

| Поле | Что меняет | Текущее значение |
|---|---|---|
| `name` | Полное имя бренда (заголовки, мета, юр. страницы) | `'GOLDEN ERA MOTORS'` |
| `brandShort` | Первая часть wordmark в шапке/футере | `'GOLDEN ERA'` |
| `brandTail` | Вторая часть wordmark | `'MOTORS'` |
| `monogram` | Буква в лого | `'G'` |
| `tagline` | Слоган | `'American classics · Sales & restoration'` |
| `description` | Дефолтное meta description | `'Classic American car sales, restoration and service…'` |
| `phone` | Отображаемый номер | `'+1 (231) 371-0656'` |
| `phoneHref` | Ссылка `tel:` (только цифры) | `'tel:+12313710656'` |
| `email` | Email | `'info@goldeneramotors.site'` |
| `address` | Адрес | `'3400 Michigan Avenue, Detroit, MI'` |
| `hours` | Часы работы | `'Mon–Sat · 9:00–18:00'` |
| `url` | Домен (должен совпадать с `astro.config.mjs`) | `'https://goldeneramotors.site'` |
| `established` | Год основания (в hero, CTA, About, OG) | `'1978'` |

Ниже в этом же файле: `nav`, `services` (6 позиций с ценами), `testimonials`, `stats`.

---

## 2. Каталог авто → `src/data/cars.ts`

Каждая машина — объект в массиве `cars` (сейчас **пусто** — наполняем по мере поступления
фото от владельца).

| Поле | Описание |
|---|---|
| `slug` | уникальный id, совпадает с именем фото (напр. `'mustang-1965-fastback'`) |
| `brand` / `model` | марка / модель |
| `year` / `price` | год / цена в USD |
| `body` | `'Coupe' \| 'Sedan' \| 'Convertible' \| 'Hardtop' \| 'Wagon' \| 'Pickup' \| 'SUV' \| 'Muscle Car'` |
| `engine` / `mileage` | двигатель / пробег (мили) |
| `transmission` / `drive` / `fuel` / `color` | КПП / привод / топливо / цвет |
| `silhouette` | `'classic' \| 'coupe' \| 'sedan' \| 'suv'` — SVG-заглушка, если нет фото |
| `images` | массив, напр. `['/cars/mustang-1965-fastback.webp']` (первое фото — главное) |
| `vin` / `doors` / `cylinders` / `condition` | опционально; `condition` показывается в спеках |
| `features` | список опций (секция «Equipment» на странице авто) |
| `featured` | `true` — показывать на главной + делать героем |
| `hero` | `true` — закрепить машину героем главной (иначе берётся самая дорогая из featured) |
| `description` | текст на странице авто |

Фильтр в каталоге строится автоматически из списка `body` — если добавишь новый тип,
допиши его в массив `bodies` в начале `src/pages/catalog.astro`.

**Значки у комплектации.** Блок «Equipment» на странице авто сам подбирает иконку под
текст пункта — правило ищется по ключевым словам в `featureIcon()` из `src/utils/icons.ts`
(engine / shifter / seat / steering / brake / top / wheel / gauge / trim). Просто пишешь
пункт обычным текстом, значок подставится сам. Новый значок рисуется в
`src/components/FeatureIcon.astro` (стиль — линия 1.5px, как у `SpecIcon.astro`).

### Как добавить машину
1. Кинь фото в папку `img/` (гитигнорится).
2. `pnpm photos` (= `node scripts/to-webp.mjs img`) → сгенерит `.webp` + `.avif` (полный + `-card`).
3. Добавь объект в `cars.ts`: `slug` = имя фото, `images: ['/cars/<slug>.webp']`.
4. `pnpm build` → пуш в GitHub → Cloudflare передеплоит.

---

## 3. Дизайн (цвета, шрифты) → `src/styles/global.css`

Блок `@theme` в самом верху. Поменял токен — перекрасился весь сайт.

| Токен | Что это | Текущее |
|---|---|---|
| `--font-display` | шрифт заголовков | `"Bebas Neue"` |
| `--font-sans` | основной шрифт | `"Bitter Variable"` |
| `--color-paper` | фон страницы | `#f3ebdd` |
| `--color-cream` | светлые панели/карточки | `#faf5ec` |
| `--color-ink` | основной текст | `#231a14` |
| `--color-muted` | приглушённый текст | `#6b5b4b` |
| `--color-burgundy` | акцент (кнопки, ссылки) | `#7a2b2b` |
| `--color-burgundy-deep` | акцент при hover / рамки CTA | `#5e1f1f` |
| `--color-chrome` | разделители, «хром» | `#c8b9a0` |

Классы-примитивы темы: `.display` (плакатный заголовок), `.label` (капс-микротекст),
`.eyebrow`, `.frame` (фотография в рамке), `.tag` (карточка), `.grain` (зерно бумаги),
`.container-x` (контейнер). Шрифты подключаются в `src/layouts/BaseLayout.astro`.

---

## 4. Домен → `astro.config.mjs`

```js
site: 'https://goldeneramotors.site',
```
Должно совпадать с `site.url` в `site.ts` и с `Sitemap:` в `public/robots.txt`.

---

## 5. Картинки-иллюстрации → `public/scenes/` + `scripts/make-scenes.mjs`

Страницы Shipping, Restoration, About и Contact наполнены винтажными «плашками» —
векторные иллюстрации в палитре сайта (бумага, чернила, бордо, хром). Они рисуются
скриптом и лежат в `public/scenes/*.webp` (1200×900, ~50 КБ каждая).

| Файл | Где используется |
|---|---|
| `service-restoration.webp` | Restoration — верхнее трио + строка «Full Restoration» |
| `service-engine.webp` | Restoration — «Engine & Drivetrain» |
| `service-bodywork.webp` | Restoration — трио + «Paint & Bodywork» |
| `service-chrome.webp` | Restoration — «Chrome & Trim» + блок на About |
| `service-interior.webp` | Restoration — «Upholstery» + блок на About |
| `service-appraisal.webp` | Restoration — «Appraisal & Consignment» |
| `shipping-enclosed.webp` | Shipping — карточка «Enclosed transport» |
| `shipping-open.webp` | Shipping — карточка «Open transport» |
| `shipping-expedited.webp` | Shipping — карточка «Expedited delivery» |
| `shipping-export.webp` | Shipping — блок «Export and international delivery» |
| `about-storefront.webp` | About — главное фото + Contact — «Look for the burgundy sign» |
| `about-workshop.webp` | About — блок «In the workshop» + трио на Restoration |
| `contacts-map.webp` | Contact — «Finding us» |

```bash
pnpm scenes          # перерисовать все плашки
```

Правки текста на плашках (подписи, «GOLDEN ERA MOTORS», «PL. NN») — в объекте `scenes`
внутри `scripts/make-scenes.mjs`. Каждая сцена описана SVG-примитивами (`rect`, `line`,
`carSil`, `wheel`, `dots`) в координатах холста 1200×900.

**Когда появятся реальные фото** мастерской/перевозки — просто замените нужный файл
в `public/scenes/` (или положите фото и сошлитесь на него в разметке страницы). Компонент
`src/components/Plate.astro` принимает `src`, `alt`, `caption`, `framed`, `eager`.

---

## 6. Бренд в ассетах (вручную, вне site.ts)

| Файл | Что менять |
|---|---|
| `public/favicon.svg` | рамка + монограмма «G» |
| `scripts/make-og.mjs` | текст «GOLDEN ERA MOTORS», «EST. 1978 · DETROIT, MICHIGAN», `goldeneramotors.site` |
| `scripts/make-hero.mjs` | фон-заглушка героя: «1978», город, слоган |
| `scripts/make-scenes.mjs` | подписи и «GOLDEN ERA MOTORS» на плашках |
| `public/hero.jpg` | заглушка героя и фон галереи на главной |
| `public/og.jpg` | превью для соцсетей |

Перегенерация:
```bash
pnpm hero                                # public/hero.jpg (заглушка героя)
pnpm scenes                              # public/scenes/*.webp (13 плашек)
pnpm og                                  # public/og.jpg — плакат без фото
node scripts/make-og.mjs img/<фото>.jpg   # public/og.jpg — фото машины + бордовая полоса
```

> Сейчас OG-картинка собрана из фото Chevelle SS (`node scripts/make-og.mjs img/chevrolet-chevelle-1972.jpg`)
> и содержит строку «10 cars in stock», которая считается из `src/data/cars.ts` автоматически.
> Если меняешь героя или добавляешь машины — перегенерируй OG той же командой с фото новой машины.

---

## 8. Ссылки и редиректы

Cloudflare Pages отдаёт страницы по адресу со слэшем (`/catalog/`) и **308-редиректит**
`/catalog` → `/catalog/`, теряя ~0.7 с на мобильном. Поэтому:

- в `astro.config.mjs` стоит `trailingSlash: 'always'`;
- все внутренние ссылки в разметке — со слэшем (`/catalog/`, `/cars/<slug>/`, `/services/#restoration`);
- активный пункт меню считается с нормализацией слэша и помечается `aria-current="page"`.

Если добавляешь новую ссылку — пиши её сразу со слэшем. Быстрая проверка:
```bash
grep -rn 'href="/[a-z-]*[a-z]"' src/    # не должно ничего находить
```

---

## 7. Чек-лист при смене бренда/контактов

1. `src/data/site.ts` — name, brandShort, brandTail, monogram, phone, phoneHref, email, address, hours, url, established
2. `astro.config.mjs` — site (если меняется домен) + `public/robots.txt`
3. `public/favicon.svg` — монограмма
4. `scripts/make-hero.mjs`, `scripts/make-scenes.mjs`, `scripts/make-og.mjs` — текст → `pnpm hero && pnpm scenes && pnpm og`
5. `src/pages/terms.astro` — штат/округ в разделе «Governing Law and Venue» (сейчас Michigan / Wayne County)
6. `src/data/cars.ts` — если меняется инвентарь
7. `pnpm build` → `git push` (Cloudflare деплоит сам)

---

## Быстрые команды

```bash
pnpm dev        # локальный dev-сервер (http://localhost:4321)
pnpm build      # сборка в ./dist
pnpm photos     # img/ → public/cars/*.webp + *.avif (полный + -card)
pnpm scenes     # перерисовать иллюстрации public/scenes/*.webp
pnpm hero       # перегенерация public/hero.jpg
pnpm og         # перегенерация public/og.jpg
```

## Почта

Домен `goldeneramotors.site` обслуживается общим воркером `helixworks-mail`: приём через Cloudflare
Email Routing, веб-интерфейс почты, отправка через Cloudflare Email Service (DKIM домена).
Адрес — `info@goldeneramotors.site`. Полная инструкция по развёртыванию, проверке и типовым сбоям:
[`EMAIL-SETUP.md`](./EMAIL-SETUP.md).
