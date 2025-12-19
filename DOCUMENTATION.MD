# Техническая документация: Simple Translator

**Автор:** Волков Никита M3106

## 1. Архитектура
Плагин построен на базе **Extension Host process**. Это обеспечивает стабильность работы IDE, так как расширение выполняется в отдельном процессе Node.js, изолированном от основного процесса рендеринга.
Взаимодействие с UI редактора происходит через асинхронный API.

[Image of VS Code extension architecture main process and extension host]

## 2. Структура проекта
Проект является нативным расширением VS Code, написанным на TypeScript.

* `package.json` — Манифест расширения.
    * Определяет ID команды: `simple-translator.translate`.
    * Задает условия активации (`onCommand`), реализуя «ленивую загрузку».
    * Содержит настройки привязки клавиш.
* `src/extension.ts` — Основная логика приложения.
* `.vscode/launch.json` — Конфигурация для запуска отладки (Extension Development Host).

## 3. Описание алгоритмов

### 3.1. Активация
Плагин использует событие активации `onCommand:simple-translator.translate`.
При первом вызове команды VS Code загружает файл `out/extension.js` и вызывает функцию `activate()`.

### 3.2. Обработка текста
Для корректной передачи текста в GET-запрос Google Translate выполняются следующие преобразования:

1. **Sanitization (Очистка):**
   ```typescript
   const cleanText = text.replace(/\s+/g, ' ').trim();
