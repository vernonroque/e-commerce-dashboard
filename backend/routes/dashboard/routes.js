const express = require('express');
const router = express.Router();

router.get('/summary', async (req, res) => {
  // placeholder logic for now
    res.json({
        revenue: {
            today: 1240.5,
            week: 8430.22,
            month: 32100.1
        },
        orders: {
            today: 12,
            week: 87,
            month: 341
        },
        averageOrderValue: 94.25,
        cashFlow: {
            available: 18450,
            pending: 4200
        }
    });

});

module.exports = router;