import cheerio from 'cheerio';

const imgAttributesToRemove = [
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
  const images = $('img.lazyload');

  images.each((i, image) => {
    const url = $(image).attr('data-src');
    $(image).attr('src', url || '');
    imgAttributesToRemove.forEach((attr) => {
      $(image).removeAttr(attr);
    });
  });

  return $('body').html() || '';
}
