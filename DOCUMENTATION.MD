# Техническая документация

## Архитектура
Плагин построен на базе **Extension Host process**. Взаимодействие с UI редактора происходит через асинхронный API.

## Основные модули
1. **Manifest (package.json):**
   - Определяет ID команды: `simple-translator.translate`.
   - Задает условия активации (`onCommand`).
2. **Logic (extension.ts):**
   - `activeTextEditor` — доступ к буферу.
   - `encodeURIComponent` — кодирование URL.
   - `vscode.env.openExternal` — вызов внешнего браузера.

## Требования
- VS Code версии ^1.75.0
- Node.js для сборки
# Техническая документация Simple Translator

## 1. Структура проекта
Проект является нативным расширением VS Code, написанным на TypeScript.

* `package.json` — Манифест расширения. Содержит настройки активации и привязки клавиш.
* `src/extension.ts` — Основная логика приложения.
* `.vscode/launch.json` — Конфигурация для запуска отладки (Extension Development Host).

## 2. Описание алгоритмов

### 2.1. Активация
Плагин использует событие активации `onCommand:simple-translator.translate`. 
При первом вызове команды VS Code загружает файл `out/extension.js` и вызывает функцию `activate()`.

### 2.2. Обработка текста
Для корректной передачи текста в GET-запрос Google Translate выполняются следующие преобразования:

1.  **Sanitization (Очистка):**
    ```typescript
    const cleanText = text.replace(/\s+/g, ' ').trim();
    ```
    Преобразует многострочный текст в одну строку.

2.  **Encoding (Кодирование):**
    ```typescript
    const encodedText = encodeURIComponent(cleanText);
    ```
    Преобразует спецсимволы (пробелы, &, ?) в безопасный формат URL.

3.  **Language Logic (Выбор языка):**
    Используется проверка на наличие кириллицы:
    ```typescript
    const targetLang = /[а-яА-ЯёЁ]/.test(cleanText) ? 'en' : 'ru';
    ```

## 3. Используемый API
* `vscode.commands.registerCommand` — регистрация обработчика.
* `vscode.window.activeTextEditor` — доступ к редактору.
* `vscode.env.openExternal` — открытие браузера.