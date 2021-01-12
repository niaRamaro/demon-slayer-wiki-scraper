import scrapArticlesByCategory from './scrapers/articlesByCategory';
import scrapArticlesContent from './scrapers/articlesContent';
import scrapCategories from './scrapers/categories';
import scrapImagesUrlByArticle from './scrapers/imagesUrlByArticle';
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

  const articles: { [key: string]: number }[] = readJSON(
    `${fsConfig.directories.BASE}/${fsConfig.files.ARTICLES}.json`,
  );
  const articleTitles = Object.keys(articles);

  console.log('=== GET ARTICLES CONTENT ===');
  await scrapArticlesContent(articleTitles);

  console.log('=== GET IMAGES URL BY ARTICLE ===');
  await scrapImagesUrlByArticle(articleTitles);
}

scrap();
