import { basicHelpers, fsHelpers } from '../helpers';
import { fsConfig } from '../config';

const dumpDirectoryName = basicHelpers.getDumpDirectoryName();

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

  fsHelpers.saveFile(
    `${dumpDirectoryName}/${fsConfig.directories.HTML}/${title}.html`,
    content,
  );
}

export default function generateArticlesHtml(articles: string[]): void {
  articles.forEach((title) => {
    const formatedTitle = fsHelpers.formatFileName(title);
    const { html } = fsHelpers.readJSON(
      `${dumpDirectoryName}/${fsConfig.directories.ARTICLES_CONTENT}/${formatedTitle}`,
    );
    saveHtml(formatedTitle, html);
  });
}
