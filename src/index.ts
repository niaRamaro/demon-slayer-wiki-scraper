import scrapCategories from './scapers/categories';

async function scrap() {
  console.log('=== FORMATING CATEGORIES ===');
  await scrapCategories();
}

scrap();
