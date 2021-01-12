import axios from 'axios';

import { apiConfig, fsConfig } from '../config';
import { saveJSON, asyncBatch } from '../helpers';

const formatedCategories: { category: string; subCategories: string[] }[] = [];
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
    console.log('Fetching sub-categories of :', category);
    const {
      data,
    }: {
      data: { query: { categorymembers: { title: string }[] } };
    } = await axios.get(apiConfig.BASE_URL, { params });

    return data.query.categorymembers.map(
      ({ title }) =>
        // eslint-disable-next-line implicit-arrow-linebreak
        title.replace('Category:', ''),
      // eslint-disable-next-line function-paren-newline
    );
  } catch (error) {
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
        formatedCategories.push({
          category,
          subCategories,
        });
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
    saveJSON(fsConfig.CATEGORIES_TREE_FILE_NAME, formatedCategories),
    saveJSON(fsConfig.CATEGORIES_FILE_NAME, allCategories),
  ]);
}
