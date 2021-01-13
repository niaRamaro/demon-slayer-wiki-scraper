import axios from 'axios';

import { apiConfig, fsConfig } from '../config';
import { asyncBatch, saveJSON } from '../helpers';

async function getArticlesByCategory(category: string) {
  try {
    const params = {
      action: 'query',
      cmlimit: 500,
      cmtitle: `Category:${category}`,
      cmtype: 'page',
      format: 'json',
      list: 'categorymembers',
    };
    console.log('Fetching articles list of :', category);
    const {
      data,
    }: {
      data: { query: { categorymembers: { title: string; pageid: number }[] } };
    } = await axios.get(apiConfig.BASE_URL, { params });

    return data.query.categorymembers.map(({ title, pageid }) => ({
      pageid,
      title,
    }));
  } catch (error) {
    return [];
  }
}

export default async function scrapArticlesByCategory(
  categories: string[],
): Promise<void> {
  const allArticles: { [key: string]: number } = {};
  const filesToSave: Promise<void>[] = [];

  await asyncBatch(
    categories,
    (category) => getArticlesByCategory(category),
    (index, categoryArticles) => {
      categoryArticles.forEach(({ pageid, title }) => {
        allArticles[title] = pageid;
      });
      filesToSave.push(
        saveJSON(
          fsConfig.directories.ARTICLES_BY_CATEGORY,
          categories[index],
          categoryArticles,
        ),
      );
    },
  );

  await Promise.all(filesToSave);
  await saveJSON('', fsConfig.files.ARTICLES, allArticles);
}
