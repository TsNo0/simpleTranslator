# Техническая документация: Simple Translator

**Автор:** Волков Никита M3106

---

## 1. Описание проекта
Simple Translator — это расширение для VS Code, позволяющее быстро переводить выделенный текст через Google Translate без необходимости вручную копировать его в браузер.

### Основные возможности:
* **Автоматическое определение языка:** Если текст содержит кириллицу, перевод осуществляется на английский язык, иначе — на русский.
* **Интеграция с системным браузером:** Перевод открывается в новой вкладке.
* **Горячие клавиши:** Быстрый запуск через `Ctrl+T`.

---

## 2. Инструкция по использованию

1.  Откройте любой текстовый файл в VS Code.
2.  Выделите фрагмент текста, который хотите перевести.
3.  Нажмите комбинацию клавиш `Ctrl+T` (или `Cmd+T` на macOS).
    * *Альтернатива:* Откройте палитру команд (`Ctrl+Shift+P`) и введите `Translate Selection`.
4.  Расширение автоматически сформирует ссылку и откроет перевод в вашем браузере.

---

## 3. Архитектура и Техническая часть

### 3.1. Архитектура
Плагин построен на базе **Extension Host process**. Это обеспечивает стабильность работы IDE, так как расширение выполняется в отдельном процессе Node.js, изолированном от основного процесса рендеринга (UI). Взаимодействие с UI редактора происходит через асинхронный API.

### 3.2. Структура проекта
Проект является нативным расширением VS Code, написанным на TypeScript.

* `package.json` — Манифест расширения.
    * Определяет ID команды: `simple-translator.translate`.
    * Задает условия активации (`onCommand`), реализуя «ленивую загрузку».
    * Содержит настройки привязки клавиш.
* `src/extension.ts` — Основная логика приложения.
* `.vscode/launch.json` — Конфигурация для запуска отладки.

---

## 4. Документация по коду

Данный раздел содержит подробное описание функции активации и алгоритма обработки текста.

**Файл:** `src/extension.ts`

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    // Регистрация команды. ID 'simple-translator.translate' должен совпадать с package.json!
    let disposable = vscode.commands.registerCommand('simple-translator.translate', () => {

        // 1. Получаем активный редактор
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; 
        }

        // 2. Получаем выделенный текст
        const selection = editor.selection;
        const text = editor.document.getText(selection);

        // Если ничего не выделено - выводим сообщение
        if (!text) {
            vscode.window.showInformationMessage('Выделите текст для перевода!');
            return;
        }

        // 3. Очистка текста от лишних пробелов и переносов (RegEx)
        const cleanText = text.replace(/\s+/g, ' ').trim();

        // 4. Логика автоопределения языка
        // Если есть русские буквы -> переводим на Английский. Иначе -> на Русский.
        const hasCyrillic = /[а-яА-ЯёЁ]/.test(cleanText);
        const sl = hasCyrillic ? 'ru' : 'auto';
        const tl = hasCyrillic ? 'en' : 'ru';

        // 5. Кодируем текст для URL (чтобы спецсимволы не ломали ссылку)
        const encodedText = encodeURIComponent(cleanText);

        // 6. Формируем ссылку
        const url = `https://translate.google.ru/?sl=${sl}&tl=${tl}&text=${encodedText}&op=translate`;

        // 7. Открываем браузер через встроенное API VS Code
        vscode.env.openExternal(vscode.Uri.parse(url));
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
