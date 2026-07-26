const { createServer } = require('http') 
const { parse } = require('url') 
const next = require('next') 
const dev = process.env.NODE_ENV !== 'production' 
const hostname = 'localhost' 
const port = process.env.port || 8080