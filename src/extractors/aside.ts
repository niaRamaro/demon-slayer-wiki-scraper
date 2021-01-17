/* eslint-disable @typescript-eslint/no-explicit-any */
type RowValue = {
  text: string;
  link?: string;
  reference?: {
    number: number;
    link: string;
  };
};

type AsideValue = {
  title: string;
  rows: {
    label: string;
    values: RowValue[];
  }[];
};
let $: any;

function extractAsideRowValues(contents: any[]): RowValue[] {
  return contents.reduce((values: RowValue[], node: any) => {
    // Values are separated by <br> tag
    if (node.type === 'tag' && node.name === 'br') {
      values.push({ text: '' });

      return values;
    }

    if ($(node).hasClass('mw-collapsible')) {
      return extractAsideRowValues($(node).contents().get());
    }

    const beforeLastValues = values.slice(0, -1);
    const lastValue = values.slice(-1).pop() || { text: '' };
    const newText = $(node).text();

    if ($(node).hasClass('reference')) {
      // The node is a reference for the text
      // Remove brackets
      const referenceNumber = +newText.slice(1).slice(0, -1);
      const referenceLink = $(node).find('a').attr('href');

      lastValue.reference = {
        number: referenceNumber,
        link: referenceLink,
      };
    } else {
      if (node.type === 'tag' && node.name === 'a') {
        // The text is a hyperlink
        lastValue.link = $(node).attr('href');
      }

      lastValue.text += newText;
    }

    return [...beforeLastValues, lastValue];
  }, []);
}

export default function extractAside(cheerio: any): AsideValue[] {
  $ = cheerio;
  const asides: AsideValue[] = [];
  const sectionLess = $('aside > div.pi-item[data-source]');

  if (sectionLess.length) {
    $(sectionLess).each((index: number, section: any) => {
      const contents = $(section).find('.pi-data-value').contents().get();

      asides.push({
        title: '',
        rows: [
          {
            label: $(section).find('.pi-data-label').text(),
            values: extractAsideRowValues(contents),
          },
        ],
      });
    });
  }

  const sections = $('aside > section');

  if (sections.length) {
    $(sections).each((i: number, section: any) => {
      asides.push({
        title: $(section).find('h2').text(),
        rows: $(section)
          .find('div.pi-item')
          .map((index: number, item: any) => {
            const contents = $(item).find('.pi-data-value').contents().get();

            return {
              label: $(item).find('.pi-data-label').text(),
              values: extractAsideRowValues(contents),
            };
          })
          .get(),
      });
    });
  }

  return asides;
}
