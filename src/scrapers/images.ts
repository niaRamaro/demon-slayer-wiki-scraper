import axios from 'axios';
import { createWriteStream } from 'fs';

import { fsConfig } from '../config';
import {
  asyncBatch,
  createDirectory,
  getDumpDirectoryName,
  saveJSON,
} from '../helpers/helpers';

const dumpDirectoryName = getDumpDirectoryName();
const imageDirectory = `${dumpDirectoryName}/${fsConfig.directories.IMAGES}`;
const failedImageDownloads: { [key: string]: string } = {};

async function downloadImage(name: string, url: string): Promise<unknown[]> {
  try {
    const filePath = `${imageDirectory}/${name}`;
    const writer = createWriteStream(filePath);
    const response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on('finish', () => {
        console.log('Saved image :', name);
        resolve([]);
      });
      writer.on('error', () => {
        console.error('Failed to save image :', name);
        failedImageDownloads[name] = url;
        resolve([]);
      });
    });
  } catch (e) {
    return new Promise((resolve) => {
      failedImageDownloads[name] = url;
      console.error('Failed to save image :', name);
      resolve([]);
    });
  }
}

export default async function downloadImages(images: {
  [key: string]: string;
}): Promise<void> {
  createDirectory(imageDirectory);

  await asyncBatch(
    Object.keys(images).filter((image) => image),
    (imageName) => downloadImage(imageName, images[imageName]),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (index, results) => {},
  );

  await saveJSON(
    '',
    fsConfig.files.FAILED_IMAGE_DOWNLOADS,
    failedImageDownloads,
  );
}
