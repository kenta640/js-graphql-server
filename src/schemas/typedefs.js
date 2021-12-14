const path = require('path');
const fileLoader = require('merge-graphql-schemas').fileLoader;
const  mergeTypes = require('merge-graphql-schemas').mergeTypes;

const typesArray = fileLoader(path.join(__dirname, './typeDefs'));

module.exports = mergeTypes(typesArray, { all: true })