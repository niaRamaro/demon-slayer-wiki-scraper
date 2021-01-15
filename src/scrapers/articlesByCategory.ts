import axios from 'axios';

import logger from '../helpers/logger';
import { apiConfig, fsConfig } from '../config';
import { asyncBatch, saveJSON } from '../helpers/helpers';

async function getArticlesByCategory(category: string) {
  try {
    const params = {
      action: 'query',
      cmlimit: 500,
      cmtitle: `Category:${category}`,
      cmprop: 'title',
      cmtype: 'page',
      format: 'json',
      list: 'categorymembers',
    };
    const {
      data,
    }: {
      data: { query: { categorymembers: { title: string; pageid: number }[] } };
    } = await axios.get(apiConfig.BASE_URL, { params });
    logger.info({
      message: `Fetched ${category}`,
      label: 'ARTICLES_BY_CATEGORY',
    });

    return data.query.categorymembers.map(({ title, pageid }) => ({
      pageid,
      title,
    }));
  } catch (error) {
    logger.warn({
      message: `Failed to fetch ${category}`,
      label: 'ARTICLES_BY_CATEGORY',
    });

    return [];
  }
}

export default async function scrapArticlesByCategory(
  categories: string[],
): Promise<void> {
  const allArticles: string[] = [];
  const filesToSave: Promise<void>[] = [];

  await asyncBatch(
    categories,
    (category) => getArticlesByCategory(category),
    (index, categoryArticles) => {
      const titles = categoryArticles.map(({ title }) => title);
      allArticles.push(...titles);
      filesToSave.push(
        saveJSON(
          fsConfig.directories.ARTICLES_BY_CATEGORY,
          categories[index],
          titles,
        ),
      );
    },
  );

  await Promise.all([
    ...filesToSave,
    saveJSON('', fsConfig.files.ARTICLES, Array.from(new Set(allArticles))),
  ]);
}
