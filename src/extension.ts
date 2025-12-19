import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    // Регистрация команды. ID 'translator.translate' должен совпадать с package.json!
    let disposable = vscode.commands.registerCommand('simple-translator.translate', () => {

        // 1. Получаем активный редактор
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; 
        }

        // 2. Получаем выделенный текст
        const selection = editor.selection;
        const text = editor.document.getText(selection);

        // Если ничего не выделено - ничего не делаем (или можно вывести ошибку)
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