/* eslint-disable @typescript-eslint/no-explicit-any */
type RowValue = {
  text: string;
  link?: string;
  reference?: {
    number: number;
    link: string;
  };
};

type Section = {
  title: string;
  rows: {
    label: string;
    values: RowValue[];
  }[];
};

type Aside = {
  main: Main;
  sections: Section[];
};

type Main = {
  images: Image[];
  sections: Section[];
};

type Image = {
  [key: string]: string;
};

let $: any;

function extractRowValues(contents: any[]): RowValue[] {
  return contents.reduce((values: RowValue[], node: any) => {
    // Values are separated by <br> tag
    if (node.type === 'tag' && node.name === 'br') {
      values.push({ text: '' });

      return values;
    }

    if ($(node).hasClass('mw-collapsible')) {
      return extractRowValues($(node).contents().get());
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

function extractSectionInfos(sectionNodes: any[]): Section[] {
  return sectionNodes.map((content) => ({
    title: $(content).find('h2').text(),
    rows: $(content)
      .find('div.pi-item')
      .map((index: number, item: any) => {
        const contents = $(item).find('.pi-data-value').contents().get();

        return {
          label: $(item).find('.pi-data-label').text(),
          values: extractRowValues(contents),
        };
      })
      .get(),
  }));
}

function extractMainInfos(mainNode: any[]): Main {
  const images = $(mainNode)
    .find('figure.pi-image')
    .get()
    .reduce((formatedImages: Image, image: any) => {
      const title = $(image).find('a').attr('title');
      const url = $(image).find('img').attr('src');

      return {
        ...formatedImages,
        [title]: url,
      };
    }, {});

  return {
    images,
    sections: extractSectionInfos($(mainNode).get()),
  };
}

export default function extractAside(cheerio: any): Aside {
  $ = cheerio;

  const mainNode = $('aside').clone();
  $(mainNode).children('section').empty();

  const sectionNodes = $('aside > section').get();

  return {
    main: extractMainInfos(mainNode),
    sections: extractSectionInfos(sectionNodes),
  };
}
