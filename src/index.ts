import {
  addCategoryArticlesThumbnail,
  downloadImages,
  generateArticlesHtml,
  scrapArticlesByCategory,
  scrapArticlesContent,
  scrapCategories,
} from './scrapers';
import { apiConfig, fsConfig } from './config';
import { getDumpDirectoryName, readJSON, saveJSON } from './helpers/helpers';

async function scrap() {
  const dumpDirectoryName = getDumpDirectoryName();

  console.log('=== SAVING ROOT CATEGORIES ===');
  saveJSON('', fsConfig.files.ROOT_CATEGORIES, apiConfig.CATEGORIES);

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
  await scrapArticlesContent(articles, categories);

  const images: { [key: string]: string } = readJSON(
    `${dumpDirectoryName}/${fsConfig.files.IMAGES}`,
  );

  console.log('=== GENERATE ARTICLES HTML ===');
  console.log('=== ADD ARTICLES THUMBNAIL ===');
  console.log('=== DOWNLOAD IMAGES ===');
  await Promise.all([
    generateArticlesHtml(articles),
    addCategoryArticlesThumbnail(categories),
    downloadImages(images),
  ]);
}

scrap();
