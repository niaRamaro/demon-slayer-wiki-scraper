import axios from 'axios';

import { apiConfig, fsConfig } from '../config';
import { asyncBatch, saveJSON } from '../helpers';

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

    return data.parse;
  } catch (error) {
    return {};
  }
}

export default async function scrapArticlesContent(
  articles: string[],
): Promise<void> {
  await asyncBatch(
    articles,
    (title) => getArticle(title),
    (index, content) => {
      saveJSON(
        `${fsConfig.directories.ARTICLES_CONTENT}/${articles[index]
          .split('/')
          .join('++')}`,
        content,
      );
    },
  );
}
