import { fsConfig } from '../config';
import {
  formatFileName,
  getDumpDirectoryName,
  readJSON,
  saveFile,
} from '../helpers';

const dumpDirectoryName = getDumpDirectoryName();

function saveHtml(title: string, html: string) {
  const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body>
    ${html}
</body>
</html>`;

  saveFile(
    `${dumpDirectoryName}/${fsConfig.directories.HTML}/${title}.html`,
    content,
  );
}

export default function generateArticlesHtml(articles: string[]): void {
  articles.forEach((title) => {
    const formatedTitle = formatFileName(title);
    const { html } = readJSON(
      `${dumpDirectoryName}/${fsConfig.directories.ARTICLES_CONTENT}/${formatedTitle}.json`,
    );
    saveHtml(formatedTitle, html);
  });
}
