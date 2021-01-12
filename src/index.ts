import scrapArticlesByCategory from './scrapers/articlesByCategory';
import scrapCategories from './scrapers/categories';
import { fsConfig } from './config';
import { readJSON } from './helpers';

async function scrap() {
  console.log('=== FORMATING CATEGORIES ===');
  await scrapCategories();

  console.log('=== GET ARTICLES BY CATEGORIES ===');
  const categories: string[] = readJSON(
    `${fsConfig.directories.BASE}/${fsConfig.files.CATEGORIES}.json`,
  );
  await scrapArticlesByCategory(categories);
}

scrap();
