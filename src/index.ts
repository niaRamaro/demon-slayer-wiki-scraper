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

  const articles: { [key: string]: number }[] = readJSON(
    `${dumpDirectoryName}/${fsConfig.files.ARTICLES}`,
  );
  const articleTitles = Object.keys(articles);

  console.log('=== GET ARTICLES CONTENT ===');
  await scrapArticlesContent(articleTitles);

  console.log('=== GENERATE ARTICLES HTML ===');
  console.log('=== ADD ARTICLES THUMBNAIL ===');
  await Promise.all([
    generateArticlesHtml(articleTitles),
    addCategoryArticlesThumbnail(categories),
  ]);
}

scrap();
