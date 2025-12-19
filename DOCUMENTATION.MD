# Техническая документация: Simple Translator

**Автор:** Волков Никита M3106

## 1. Архитектура
Плагин построен на базе **Extension Host process**. Это обеспечивает стабильность работы IDE, так как расширение выполняется в отдельном процессе Node.js, изолированном от основного процесса рендеринга (UI).
Взаимодействие с UI редактора происходит через асинхронный API.



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
Преобразует многострочный текст в одну строку, убирая лишние пробелы и табуляцию.

Language Logic (Выбор языка): Используется эвристическая проверка на наличие кириллицы:

TypeScript

const targetLang = /[а-яА-ЯёЁ]/.test(cleanText) ? 'en' : 'ru';
Encoding (Кодирование):

TypeScript

const encodedText = encodeURIComponent(cleanText);
Преобразует спецсимволы (пробелы, &, ?) в безопасный формат URL.

4. Основные модули и API
В файле extension.ts используются следующие методы VS Code API:

vscode.commands.registerCommand — регистрация обработчика команды.

vscode.window.activeTextEditor — доступ к текущему активному буферу редактора.

vscode.env.openExternal — вызов системного браузера с сформированной ссылкой.

5. Полный листинг кода
5.1. Манифест (package.json)
Ключевые настройки конфигурации:

JSON

{
  "name": "simple-translator",
  "displayName": "Simple Translator",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.75.0"
  },
  "activationEvents": [
    "onCommand:simple-translator.translate"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "simple-translator.translate",
        "title": "Translate Selection"
      }
    ],
    "keybindings": [
      {
        "command": "simple-translator.translate",
        "key": "ctrl+t",
        "mac": "cmd+t",
        "when": "editorTextFocus"
      }
    ]
  }
}
5.2. Логика (src/extension.ts)
Реализация алгоритма перевода:

TypeScript

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Регистрация команды
    let disposable = vscode.commands.registerCommand('simple-translator.translate', () => {

        // 1. Получаем активный редактор
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        // 2. Получаем текст выделения
        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (!text) {
            vscode.window.showInformationMessage('Выделите текст для перевода!');
            return;
        }

        // 3. Очистка и подготовка текста
        const cleanText = text.replace(/\s+/g, ' ').trim();

        // 4. Определение языка (Если есть кириллица -> EN, иначе -> RU)
        const hasCyrillic = /[а-яА-ЯёЁ]/.test(cleanText);
        const sl = hasCyrillic ? 'ru' : 'auto';
        const tl = hasCyrillic ? 'en' : 'ru';

        // 5. Кодирование для URL
        const encodedText = encodeURIComponent(cleanText);

        // 6. Формирование ссылки
        const url = `https://translate.google.ru/?sl=${sl}&tl=${tl}&text=${encodedText}&op=translate`;

        // 7. Открытие браузера
        vscode.env.openExternal(vscode.Uri.parse(url));
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
6. Требования
VS Code версии ^1.75.0

Node.js (для сборки проекта)
onCommand:simple-translator.translate

При первом вызове команды VS Code загружает файл `out/extension.js` и вызывает функцию `activate()`.

---

### 3.2. Обработка текста

Для корректной передачи текста в GET-запрос Google Translate выполняются следующие шаги.

#### 1. Sanitization (очистка)

```ts
const cleanText = text.replace(/\s+/g, ' ').trim();
Преобразует многострочный текст в одну строку, убирая лишние пробелы и табуляцию.

##3.2.2. Language Logic (выбор языка)
Используется проверка на наличие кириллицы:
const hasCyrillic = /[а-яА-ЯёЁ]/.test(cleanText);
const sl = hasCyrillic ? 'ru' : 'auto';
const tl = hasCyrillic ? 'en' : 'ru';

##3.2.3. Encoding (кодирование)
const encodedText = encodeURIComponent(cleanText);

###4. Основные модули и API

В файле extension.ts используются следующие методы VS Code API:

vscode.commands.registerCommand

vscode.window.activeTextEditor

vscode.env.openExternal

###5. Полный листинг кода
##5.1. Манифест (package.json)
{
  "name": "simple-translator",
  "displayName": "Simple Translator",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.75.0"
  },
  "activationEvents": [
    "onCommand:simple-translator.translate"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "simple-translator.translate",
        "title": "Translate Selection"
      }
    ],
    "keybindings": [
      {
        "command": "simple-translator.translate",
        "key": "ctrl+t",
        "mac": "cmd+t",
        "when": "editorTextFocus"
      }
    ]
  }
}

##5.2. Логика (src/extension.ts)
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand(
        'simple-translator.translate',
        () => {

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            const selection = editor.selection;
            const text = editor.document.getText(selection);

            if (!text) {
                vscode.window.showInformationMessage(
                    'Выделите текст для перевода!'
                );
                return;
            }

            const cleanText = text.replace(/\s+/g, ' ').trim();

            const hasCyrillic = /[а-яА-ЯёЁ]/.test(cleanText);
            const sl = hasCyrillic ? 'ru' : 'auto';
            const tl = hasCyrillic ? 'en' : 'ru';

            const encodedText = encodeURIComponent(cleanText);

            const url =
                `https://translate.google.ru/?sl=${sl}` +
                `&tl=${tl}` +
                `&text=${encodedText}` +
                `&op=translate`;

            vscode.env.openExternal(
                vscode.Uri.parse(url)
            );
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
