# demon-slayer-wiki-scraper

![The gang running around](https://i.imgur.com/GGpfRYs.gif)!

This is a scraper of the [Demon Slayer Wiki](https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki) written in Node.js.
It just uses the [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page) and stores the received informations inside json files.

The json files can then be used to populate a database or whatever.

An example of the generated files can be found in the [examples directory](https://github.com/niaRamaro/demon-slayer-wiki-scraper/tree/main/examples)

## Usage

Install dependencies

```sh
yarn
```

Start scraping

```sh
yarn start
```
