import axios from 'axios';

import logger from '../helpers/logger';
import { apiConfig, fsConfig } from '../config';
import { saveJSON, asyncBatch } from '../helpers/helpers';

const subCategoriesMap: { [key: string]: string[] } = {};
const allSubCategories: string[] = [];

async function getSubCategories(category: string): Promise<string[]> {
  try {
    const params = {
      action: 'query',
      cmlimit: 500,
      cmprop: 'title',
      cmtitle: `Category:${category}`,
      cmtype: 'subcat',
      format: 'json',
      list: 'categorymembers',
    };
    const {
      data,
    }: {
      data: { query: { categorymembers: { title: string }[] } };
    } = await axios.get(apiConfig.BASE_URL, { params });

    logger.info({
      message: `Fetched ${category}`,
      label: 'CATEGORY',
    });

    return data.query.categorymembers.map(
      ({ title }) =>
        // eslint-disable-next-line implicit-arrow-linebreak
        title.replace('Category:', ''),
      // eslint-disable-next-line function-paren-newline
    );
  } catch (error) {
    logger.warn({
      message: `Failed to fetched ${category}`,
      label: 'CATEGORY',
    });

    return [];
  }
}

async function formatCategories(
  categories: string[],
  keepEmptyParents: boolean,
) {
  await asyncBatch(
    categories,
    (category: string) => getSubCategories(category),
    (index: number, subCategories: string[]) => {
      if (subCategories.length || keepEmptyParents) {
        const category = categories[index];
        subCategoriesMap[category] = subCategories;
        allSubCategories.push(...subCategories);
      }
    },
  );
}

export default async function scrapCategories(): Promise<void> {
  await formatCategories(apiConfig.CATEGORIES, true);
  const uniqueSubCategories = Array.from(new Set(allSubCategories));
  await formatCategories(uniqueSubCategories, false);
  const allCategories = [...apiConfig.CATEGORIES, ...uniqueSubCategories];
  await Promise.all([
    saveJSON('', fsConfig.files.SUB_CATEGORIES, subCategoriesMap),
    saveJSON('', fsConfig.files.CATEGORIES, Array.from(new Set(allCategories))),
  ]);
}
