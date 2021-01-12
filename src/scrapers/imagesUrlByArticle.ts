import axios from 'axios';

import { apiConfig, fsConfig } from '../config';
import { asyncBatch, saveJSON } from '../helpers';

async function getArticleImages(article: string) {
  try {
    const params = {
      action: 'query',
      format: 'json',
      gimlimit: 500,
      titles: article,
      prop: 'imageinfo',
      generator: 'images',
      iiprop: 'url',
    };
    console.log('Fetching images of article : ', article);
    const {
      data: {
        query: { pages },
      },
    } = await axios.get(apiConfig.BASE_URL, { params });

    return Object.keys(pages).map((key) => {
      const imageItem = pages[key];

      return { [imageItem.title]: imageItem.imageinfo[0].url };
    });
  } catch (error) {
    return [];
  }
}

export default async function scrapImagesUrlByArticle(
  articles: string[],
): Promise<void> {
  let imagesUrl = {};

  await asyncBatch(
    articles,
    (article) => getArticleImages(article),
    (index, results) => {
      const formatedPageImages = results.reduce(
        (pageImages, image) => ({
          ...pageImages,
          ...image,
        }),
        {},
      );
      imagesUrl = {
        ...imagesUrl,
        ...formatedPageImages,
      };
    },
  );

  saveJSON(fsConfig.files.IMAGES_URLS, imagesUrl);
}
