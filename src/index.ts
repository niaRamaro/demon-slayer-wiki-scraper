/* eslint-disable no-console */
import { readdirSync } from 'fs';

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

const dumpDirectoryName = basicHelpers.getDumpDirectoryName();

function showStats(
  categoriesCount: number,
  articlesCount: number,
  imagesCount: number,
) {
  console.log(`Categories : ${categoriesCount}`);

  const savedArticles = readdirSync(
    `${dumpDirectoryName}/${fsConfig.directories.ARTICLES_CONTENT}`,
  );
  const savedImages = readdirSync(
    `${dumpDirectoryName}/${fsConfig.directories.IMAGES}`,
  );

  console.log(`Articles : ${savedArticles.length}/${articlesCount}`);
  console.log(`Images : ${savedImages.length}/${imagesCount}`);
}

async function scrap() {
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

  console.log('=== STATS ===');
  showStats(categories.length, articles.length, Object.keys(images).length);
}

scrap();
