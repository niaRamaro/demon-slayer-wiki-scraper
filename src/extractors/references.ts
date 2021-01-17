/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

type Reference = {
  number: number;
  id: string;
  backLinks: string[];
  texts: ReferenceText[];
};

type ReferenceText = {
  text: string;
  link?: string;
};

let $: any;

function extractReferenceText(textContents: any[]): ReferenceText[] {
  return textContents.reduce((formatedTexts: ReferenceText[], node: any) => {
    // Values are separated by <a> tag
    if (node.type === 'tag' && node.name === 'a') {
      formatedTexts.push({
        text: $(node).text(),
        link: $(node).attr('href'),
      });

      return formatedTexts;
    }

    const beforeLastValues = formatedTexts.slice(0, -1);
    const lastValue = formatedTexts.slice(-1).pop() || { text: '' };
    const newText = $(node).text();

    // Add new text if last text value is a link
    if (lastValue.link) {
      return [
        ...beforeLastValues,
        lastValue,
        {
          text: newText,
        },
      ];
    }

    lastValue.text += newText;

    return [...beforeLastValues, lastValue];
  }, []);
}

export default function extractReference(cheerio: any): Reference[] {
  $ = cheerio;

  const references = $('ol.references').children().get();

  return references.reduce(
    (formatedReferences: Reference[], referenceNode: any, index: number) => {
      const newReference = {
        number: index + 1,
        id: $(referenceNode).attr('id'),
        backLinks: $(referenceNode)
          .find('.mw-cite-backlink a')
          .map((i: number, link: any) => $(link).attr('href'))
          .get(),
        texts: extractReferenceText(
          $(referenceNode).find('.reference-text').contents().get(),
        ),
      };

      return [...formatedReferences, newReference];
    },
    [],
  );
}
