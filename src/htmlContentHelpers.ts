/* eslint-disable operator-linebreak */
import cheerio from 'cheerio';
import { fsConfig } from './config';

import { formatFileName } from './helpers';

export type Image = {
  name: string;
  url: string;
};

const imgAttributesToRemove = [
  'data-caption',
  'data-image-key',
  'data-image-name',
  'data-src',
  'data-video-key',
  'data-video-name',
  'srcset',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getImageName(image: any) {
  return image.attr('data-image-name') || image.attr('data-video-name') || '';
}

export function extractImageUrls(html: string): Image[] {
  const imageUrls: Image[] = [];

  const $ = cheerio.load(html);
  $('img').each((i, image) => {
    const url = $(image).attr('data-src') || $(image).attr('src') || '';
    const name = getImageName($(image));
    if (name && url) {
      imageUrls.push({ name: formatFileName(name), url });
    }
  });

  return imageUrls;
}

export function getFirstImage(html: string): string {
  const $ = cheerio.load(html);

  const firstImage = $('img').first();

  return firstImage
    ? firstImage.attr('data-src') || firstImage.attr('src') || ''
    : '';
}

export function removeEditButtons(html: string): string {
  const $ = cheerio.load(html);
  $('span.mw-editsection').remove();

  return $('body').html() || '';
}

export function replaceImageSrc(html: string): string {
  const $ = cheerio.load(html);

  $('img').each((i, image) => {
    const name = getImageName($(image));
    const src = name
      ? `/${fsConfig.directories.IMAGES}/${formatFileName(name)}`
      : '';
    $(image).attr('src', src);
    imgAttributesToRemove.forEach((attr) => {
      $(image).removeAttr(attr);
    });
  });

  return $('body').html() || '';
}
