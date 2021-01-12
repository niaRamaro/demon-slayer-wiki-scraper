import scrapArticlesByCategory from './scrapers/articlesByCategory';
import scrapArticlesContent from './scrapers/articlesContent';
import scrapCategories from './scrapers/categories';
import { fsConfig } from './config';
import { readJSON } from './helpers';

async function scrap() {
  console.log('=== FORMAT CATEGORIES ===');
  await scrapCategories();

  console.log('=== GET ARTICLES BY CATEGORIES ===');
  const categories: string[] = readJSON(
    `${fsConfig.directories.BASE}/${fsConfig.files.CATEGORIES}.json`,
  );
  await scrapArticlesByCategory(categories);

  console.log('=== GET ARTICLES CONTENT ===');
  const articles: { [key: string]: number }[] = readJSON(
    `${fsConfig.directories.BASE}/${fsConfig.files.ARTICLES}.json`,
  );
  await scrapArticlesContent(Object.keys(articles));
}

scrap();
