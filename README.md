A library that generates an interactive radar, inspired by [thoughtworks.com/radar](http://thoughtworks.com/radar), forked from https://github.com/thoughtworks/build-your-own-radar .

## Demo

This repo is published to techradar.fundapps.io, from the /docs folder in the repository. 

## To run locally

- `git clone git@github.com:fundapps/techradar.git`
- `npm install`
- `npm run dev` - to run application in localhost:8080. This will watch the .js and .css files and rebuild on file changes

## Making changes

- To update entries you need to edit [radarData.yml](https://github.com/fundapps/techradar/blob/master/radarData.yml)
- To publish changes, you need to run `npm run publish` and commit. This will then update GitHub pages.

## Modifications from the original fork

Instead of having 4 quadrants in a circle, we allow an unlimited number of individual quadrants, as this better suited our use case. Data is loaded from a yml file instead of Google Sheets.
