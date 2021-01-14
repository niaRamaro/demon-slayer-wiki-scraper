import cheerio from 'cheerio';

export type Image = {
  name: string;
  url: string;
};

const imgAttributesToRemove = [
  'srcset',
  'data-src',
  'data-image-name',
  'data-image-key',
  'data-caption',
];

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
    const url = $(image).attr('data-image-name');
    $(image).attr('src', url ? `/images/${url}` : '');
    imgAttributesToRemove.forEach((attr) => {
      $(image).removeAttr(attr);
    });
  });

  return $('body').html() || '';
}

export function extractImageUrls(html: string): Image[] {
  const imageUrls: Image[] = [];

  const $ = cheerio.load(html);
  $('img').each((i, image) => {
    const url = $(image).attr('data-src') || $(image).attr('src') || '';
    const name = $(image).attr('data-image-name') || '';

    imageUrls.push({ name, url });
  });

  return imageUrls;
}
