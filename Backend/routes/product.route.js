const express = require('express');
const router = express.Router();
const {
  initializeDatabase,
  getBarChartData,
  getPieChartData,
  getCombinedData,
  getTransactionByMonth,
  searchTransactionsByMonth,
  getTransactionStatisticsByMonth
} = require('../controller/product.controller');

router.get('/init', initializeDatabase);
router.get('/transactions/:month', getTransactionByMonth);
router.get('/transactions/:month/:searchQuery', searchTransactionsByMonth);
router.get('/statistics/:month', getTransactionStatisticsByMonth);
router.get('/barchart/:month', getBarChartData);
router.get('/piechart/:month', getPieChartData);
router.get('/combined/:month', getCombinedData);

module.exports = router;
