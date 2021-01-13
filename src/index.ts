import addCategoryArticlesThumbnail from './scrapers/categoryArticlesThumbnail';
import generateArticlesHtml from './scrapers/articlesHtml';
import scrapArticlesByCategory from './scrapers/articlesByCategory';
import scrapArticlesContent from './scrapers/articlesContent';
import scrapCategories from './scrapers/categories';
import { fsConfig } from './config';
import { getDumpDirectoryName, readJSON } from './helpers';

async function scrap() {
  const dumpDirectoryName = getDumpDirectoryName();

  console.log('=== FORMAT CATEGORIES ===');
  await scrapCategories();

  console.log('=== GET ARTICLES BY CATEGORIES ===');
  const categories: string[] = readJSON(
    `${dumpDirectoryName}/${fsConfig.files.CATEGORIES}`,
  );
  await scrapArticlesByCategory(categories);

  const articles: string[] = readJSON(
    `${dumpDirectoryName}/${fsConfig.files.ARTICLES}`,
  );

  console.log('=== GET ARTICLES CONTENT ===');
  await scrapArticlesContent(articles);

  console.log('=== GENERATE ARTICLES HTML ===');
  console.log('=== ADD ARTICLES THUMBNAIL ===');
  await Promise.all([
    generateArticlesHtml(articles),
    addCategoryArticlesThumbnail(categories),
  ]);
}

scrap();
