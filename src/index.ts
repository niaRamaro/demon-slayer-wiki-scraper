/* eslint-disable no-console */
import {
  addCategoryArticlesThumbnail,
  downloadImages,
  generateArticlesHtml,
  scrapArticlesByCategory,
  scrapArticlesContent,
  scrapCategories,
} from './scrapers';
import { apiConfig, fsConfig } from './config';
import { basicHelpers, fsHelpers } from './helpers';

async function scrap() {
  const dumpDirectoryName = basicHelpers.getDumpDirectoryName();

  console.log('=== SAVING ROOT CATEGORIES ===');
  fsHelpers.saveJSON('', fsConfig.files.ROOT_CATEGORIES, apiConfig.CATEGORIES);

  console.log('=== FORMATING CATEGORIES ===');
  await scrapCategories();

  console.log('=== GETTING ARTICLES BY CATEGORIES ===');
  const categories: string[] = fsHelpers.readJSON(
    `${dumpDirectoryName}/${fsConfig.files.CATEGORIES}`,
  );
  await scrapArticlesByCategory(categories);

  const articles: string[] = fsHelpers.readJSON(
    `${dumpDirectoryName}/${fsConfig.files.ARTICLES}`,
  );

  console.log('=== GETTING ARTICLES CONTENT ===');
  await scrapArticlesContent(articles, categories);

  const images: { [key: string]: string } = fsHelpers.readJSON(
    `${dumpDirectoryName}/${fsConfig.files.IMAGES}`,
  );

  console.log('=== GENERATING ARTICLES HTML ===');
  console.log('=== ADDING ARTICLES THUMBNAIL ===');
  console.log('=== DOWNLOADING IMAGES ===');
  await Promise.all([
    generateArticlesHtml(articles),
    addCategoryArticlesThumbnail(categories),
    downloadImages(images),
  ]);
}

scrap();
