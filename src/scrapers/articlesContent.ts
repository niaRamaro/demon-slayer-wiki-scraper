import axios from 'axios';

import { apiConfig, fsConfig } from '../config';
import { asyncBatch, saveJSON } from '../helpers';
import {
  extractImageUrls,
  removeEditButtons,
  replaceImageSrc,
} from '../htmlContentHelpers';

type ArticleContent = {
  title: string;
  pageid: number;
  text: {
    '*': string;
  };
};

async function getArticle(article: string) {
  try {
    const params = {
      action: 'parse',
      page: article,
      prop: 'text|categories|links|externallinks',
      format: 'json',
    };
    console.log('Fetching article :', article);
    const { data } = await axios.get(apiConfig.BASE_URL, { params });

    // We put inside a table just to match the required type for asyncBatch
    return [data.parse];
  } catch (error) {
    return [];
  }
}

function formatArticleContent(html: string) {
  return replaceImageSrc(removeEditButtons(html));
}

export default async function scrapArticlesContent(
  articles: string[],
): Promise<void> {
  const filesToSave: Promise<void>[] = [];
  const images: { [key: string]: string } = {};

  function extractArticleImages(html: string): void {
    const articleImages = extractImageUrls(html);
    articleImages.forEach(({ name, url }) => {
      images[name] = url;
    });
  }

  await asyncBatch<string, ArticleContent>(
    articles,
    (title) => getArticle(title),
    (index, [content]) => {
      const { text } = content;
      extractArticleImages(text['*']);
      const article = {
        html: formatArticleContent(text['*']),
      };

      filesToSave.push(
        saveJSON(
          fsConfig.directories.ARTICLES_CONTENT,
          articles[index],
          article,
        ),
      );
    },
  );

  await Promise.all([
    ...filesToSave,
    saveJSON('', fsConfig.files.IMAGES, images),
  ]);
}
