/* eslint-disable @typescript-eslint/no-explicit-any */

type NavigationLink = {
  name: string;
  url: string;
};

export default function extractNavigation($: any): NavigationLink {
  const navigation: any = [];
  const selector = 'font-weight:bold; text-align:center; margin-bottom:0px;';
  const navigationContent = $(`div[style="${selector}"]`);

  if (navigationContent.length) {
    const links = navigationContent.find('a');

    $(links).each((i: number, link: any) => {
      navigation.push({
        name: $(link).text(),
        url: $(link).attr('href'),
      });
    });
  }

  return navigation;
}
