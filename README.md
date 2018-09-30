# Koop Provider TopPlace™ Rest API

This project converts the data from TopPlace™ Rest API to geojson and geoservices to be used by Esri tools.

To understand what kind of data is offered by AVUXI with TopPlace™ Rest API see the next document: https://admin.avuxi.com/api


This project use [Koop technology](https://github.com/koopjs)


## Getting started

1. Register in https://admin.avuxi.com/
1. Request access to the Rest API
1. Start working with the data

## To Start the project

1. npm install
1. node server.js
1. open LinksCreator/index.html
1. select key
1. select type of data
1. move the map
1. open the url

## Adding symbology support

After `npm install` edit `node_modules/featureserver/src/templates.js` file as described on [this issue](https://github.com/koopjs/FeatureServer/issues/80#issuecomment-425758828)
