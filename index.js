import fs from 'fs';
import http from 'http';
import slugify from 'slugify';
import replaceTemplate from './modules/replaceTemplate.js';

const tempOverview = fs.readFileSync('./templates/template-overview.html', 'utf-8');
const tempCard = fs.readFileSync('./templates/template-card.html', 'utf-8');
const tempProduct = fs.readFileSync('./templates/template-product.html', 'utf-8');

const data = fs.readFileSync('./dev-data/data.json', 'utf-8');
const dataObj = JSON.parse(data);

export const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, 'http://127.0.0.1:8000');
  const { pathname } = parsedUrl;

  const slug = pathname.split('/').at(-1);
  const id = slugs.indexOf(slug);

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    const cardsHtml = dataObj.map((el) => replaceTemplate(tempCard, el)).join('');
    const overviewPage = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(overviewPage);

    // Product page
  } else if (pathname.startsWith('/product')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    const product = dataObj.at(id);
    const productPage = replaceTemplate(tempProduct, product);
    res.end(productPage);

    // API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html', 'My-Own-Header': 'hello-world' });
    res.end('<h1>Page not found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
