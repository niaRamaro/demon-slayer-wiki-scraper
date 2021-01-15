import { basicHelpers, fsHelpers, htmlHelpers } from '../helpers';
import { fsConfig } from '../config';

const dumpDirectoryName = basicHelpers.getDumpDirectoryName();

function addTArticesThumbnail(articleTitles: string[]) {
  return articleTitles.map((title) => {
    const formatedTitle = fsHelpers.formatFileName(title);
    const articleContent: { html: string } = fsHelpers.readJSON(
      `${dumpDirectoryName}/${fsConfig.directories.ARTICLES_CONTENT}/${formatedTitle}`,
    );
    const thumbnail = htmlHelpers.getFirstImage(articleContent.html);

    return {
      title,
      slug: formatedTitle,
      thumbnail,
    };
  });
}

export default async function addCategoryArticlesThumbnail(
  categories: string[],
): Promise<void> {
  const filesToSave: Promise<void>[] = [];

  categories.forEach((category) => {
    const formatedCategory = fsHelpers.formatFileName(category);
    const articlesByCategory: string[] = fsHelpers.readJSON(
      `${dumpDirectoryName}/${fsConfig.directories.ARTICLES_BY_CATEGORY}/${formatedCategory}`,
    );
    const articlesWithThumbnail = addTArticesThumbnail(articlesByCategory);

    filesToSave.push(
      fsHelpers.saveJSON(
        fsConfig.directories.ARTICLES_BY_CATEGORY,
        formatedCategory,
        articlesWithThumbnail,
      ),
    );
  });

  await Promise.all(filesToSave);
}
