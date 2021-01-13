import { fsConfig } from '../config';
import {
  formatFileName,
  getDumpDirectoryName,
  readJSON,
  saveJSON,
} from '../helpers';
import { getFirstImage } from '../htmlContentHelpers';

const dumpDirectoryName = getDumpDirectoryName();

function addTArticesThumbnail(articleTitles: string[]) {
  return articleTitles.map((title) => {
    const formatedTitle = formatFileName(title);
    const articleContent: { html: string } = readJSON(
      `${dumpDirectoryName}/${fsConfig.directories.ARTICLES_CONTENT}/${formatedTitle}`,
    );
    const thumbnail = getFirstImage(articleContent.html);

    return {
      title,
      thumbnail,
    };
  });
}

export default async function addCategoryArticlesThumbnail(
  categories: string[],
): Promise<void> {
  const filesToSave: Promise<void>[] = [];

  categories.forEach((category) => {
    const formatedCategory = formatFileName(category);
    const articlesByCategory: string[] = readJSON(
      `${dumpDirectoryName}/${fsConfig.directories.ARTICLES_BY_CATEGORY}/${formatedCategory}`,
    );
    const articlesWithThumbnail = addTArticesThumbnail(articlesByCategory);

    filesToSave.push(
      saveJSON(
        fsConfig.directories.ARTICLES_BY_CATEGORY,
        formatedCategory,
        articlesWithThumbnail,
      ),
    );
  });

  await Promise.all(filesToSave);
}
