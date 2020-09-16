/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const fetch = require('node-fetch');

const stocks = {};

async function getStock(stock) {
  const fetchResponse = await fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`);
  const { symbol, latestPrice } = await fetchResponse.json();
  return {
    symbol,
    price: `${latestPrice}`
  };
}

async function addToStocks(stock, like) {
  const returnedStock = await getStock(stock);
  const { symbol, price } = returnedStock;
  if(symbol) {
    if(stocks.hasOwnProperty(symbol)) {
      stocks[symbol] = {
        price,
        like: like ? stocks[symbol].like + 1 : stocks[symbol].like
      }
    } else {
      stocks[symbol] = {
        price,
        like: like ? 1 : 0
      }
    }
  }
}

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res){
      const { stock, like } = req.query;
      const stockKeys = [];
      if(stock) {
        if(typeof stock === 'string') {
          await addToStocks(stock, like);
          
          stockKeys.push(stock.toUpperCase());
        } else {
          for(let i=0; i<stock.length; i++) {
            await addToStocks(stock[i], like);
            
            stockKeys.push(stock[i].toUpperCase());
          }
        }
      }
      const result = (stockKeys.length === 1) ? 
            {...stocks[stockKeys[0]], stock: stockKeys[0] }
      : Object.keys(stocks)
        .filter(key => stockKeys.includes(key))
        .map(key => ({
          stock: key,
          ...stocks[key]
        }));
      res.json({
        stockData: result
      });
    });
};
