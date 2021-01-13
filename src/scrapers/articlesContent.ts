import axios from 'axios';

import { apiConfig, fsConfig } from '../config';
import { asyncBatch, saveJSON } from '../helpers';
import { removeEditButtons, replaceImageSrc } from '../htmlContentHelpers';

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
  await asyncBatch<string, ArticleContent>(
    articles,
    (title) => getArticle(title),
    (index, [content]) => {
      const { text, ...rest } = content;
      const article = {
        ...rest,
        html: formatArticleContent(text['*']),
      };
      saveJSON(
        `${fsConfig.directories.ARTICLES_CONTENT}/${articles[index]
          .split('/')
          .join('++')}`,
        article,
      );
    },
  );
}
