/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
import axios from 'axios';

import { apiConfig, fsConfig } from '../config';
import { basicHelpers, fsHelpers, htmlHelpers, logger } from '../helpers';

type ArticleProperty = {
  '*': string;
};

type ArticleContent = {
  title: string;
  pageid: number;
  text: ArticleProperty;
  categories: ArticleProperty[];
};

async function getArticle(article: string) {
  try {
    const params = {
      action: 'parse',
      page: article,
      prop: 'text|categories',
      format: 'json',
    };
    const { data } = await axios.get(apiConfig.BASE_URL, { params });
    logger.info({
      message: `Fetched ${article}`,
      label: 'ARTICLES_CONTENT',
    });
    // We put inside a table just to match the required type for asyncBatch
    return [data.parse];
  } catch (error) {
    logger.warn({
      message: `Failed to fetch ${article}`,
      label: 'ARTICLES_CONTENT',
    });

    return [];
  }
}

function formatArticleContent(html: string) {
  return htmlHelpers.replaceImageSrc(htmlHelpers.removeUnnecessaryTags(html));
}

export default async function scrapArticlesContent(
  articles: string[],
  categories: string[],
): Promise<void> {
  const filesToSave: Promise<void>[] = [];
  const images: { [key: string]: string } = {};

  function extractArticleImages(html: string): void {
    const articleImages = htmlHelpers.extractImageUrls(html);
    articleImages.forEach(({ name, url }) => {
      images[name] = url;
    });
  }

  function getArticleCategories(rawCategories: ArticleProperty[] = []) {
    const formatedCategories = rawCategories.map((category) =>
      category['*'].split('_').join(' '),
    );

    return formatedCategories.filter((category) =>
      categories.includes(category),
    );
  }

  await basicHelpers.asyncBatch<string, ArticleContent>(
    articles,
    (title) => getArticle(title),
    (index, [content]) => {
      if (content) {
        const { text, categories: rawCategories } = content;
        extractArticleImages(text['*']);
        const article = {
          categories: getArticleCategories(rawCategories),
          html: formatArticleContent(text['*']),
        };

        filesToSave.push(
          fsHelpers.saveJSON(
            fsConfig.directories.ARTICLES_CONTENT,
            articles[index],
            article,
          ),
        );
      }
    },
  );

  await Promise.all([
    ...filesToSave,
    fsHelpers.saveJSON('', fsConfig.files.IMAGES, images),
  ]);
}
