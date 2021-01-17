/* eslint-disable @typescript-eslint/no-explicit-any */
import cheerio from 'cheerio';

import { fsConfig } from './config';
import {
  extractAside,
  extractNavigation,
  extractReference,
} from './extractors';
import { getDumpDirectoryName } from './helpers/basicHelpers';
import { formatFileName, readJSON, saveJSON } from './helpers/fsHelpers';

const category = 'Characters';
const directory = getDumpDirectoryName();

function extractArticleInfo(title: string, html: string) {
  const $ = cheerio.load(html);

  return saveJSON(fsConfig.directories.EXTRACT, title, {
    navigation: extractNavigation($),
    aside: extractAside($),
    reference: extractReference($),
  });
}

async function extract() {
  const articles: { title: string }[] = readJSON(
    `${directory}/${fsConfig.directories.ARTICLES_BY_CATEGORY}/${formatFileName(
      category,
    )}`,
  );

  const filesToSave: any[] = [];

  articles.forEach(({ title }) => {
    const content: { html: string } = readJSON(
      `${directory}/${fsConfig.directories.ARTICLES_CONTENT}/${formatFileName(
        title,
      )}`,
    );

    if (content && content.html) {
      filesToSave.push(extractArticleInfo(title, content.html));
    }
  });

  await Promise.all(filesToSave);
}

extract();
