import axios from 'axios';
import { createWriteStream } from 'fs';

import { basicHelpers, fsHelpers, logger } from '../helpers';
import { fsConfig } from '../config';

const dumpDirectoryName = basicHelpers.getDumpDirectoryName();
const imageDirectory = `${dumpDirectoryName}/${fsConfig.directories.IMAGES}`;
const failedImageDownloads: { [key: string]: string } = {};
const logLabel = 'IMAGE';

async function downloadImage(name: string, url: string): Promise<unknown[]> {
  try {
    const filePath = `${imageDirectory}/${name}`;
    const writer = createWriteStream(filePath);
    const response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on('finish', () => {
        logger.info({
          message: `Saved ${name}`,
          label: logLabel,
        });
        resolve([]);
      });
      writer.on('error', () => {
        logger.warn({
          message: `Failed to save ${name}`,
          label: logLabel,
        });
        failedImageDownloads[name] = url;
        resolve([]);
      });
    });
  } catch (e) {
    return new Promise((resolve) => {
      failedImageDownloads[name] = url;
      logger.warn({
        message: `Failed to fetch ${name}`,
        label: logLabel,
      });
      resolve([]);
    });
  }
}

export default async function downloadImages(images: {
  [key: string]: string;
}): Promise<void> {
  fsHelpers.createDirectory(imageDirectory);

  await basicHelpers.asyncBatch(
    Object.keys(images).filter((image) => image),
    (imageName) => downloadImage(imageName, images[imageName]),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (index, results) => {},
  );

  await fsHelpers.saveJSON(
    '',
    fsConfig.files.FAILED_IMAGE_DOWNLOADS,
    failedImageDownloads,
  );
}
