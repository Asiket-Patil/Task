const axios = require('axios');
const Transaction = require('../model/product.model');

const monthNameToNumber = (monthName) => {
    const months = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12
    };
    return months[monthName];
};

exports.initializeDatabase = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactions = response.data;

        await Transaction.deleteMany({});
        await Transaction.insertMany(transactions);

        res.status(200).json({ message: 'Database initialized successfully', transactions });
    } catch (error) {
        console.error('Error initializing database:', error.message);
        res.status(500).json({ message: 'Error initializing database', error: error.message });
    }
};

exports.getTransactionByMonth = async (req, res) => {
    const monthName = req.params.month;
    const monthNumber = monthNameToNumber(monthName);

    if (monthName === 'All') {
        const transactions = await Transaction.find();
        return res.json(transactions);
    }

    if (monthNumber === undefined) {
        return res.status(400).send('Invalid month name');
    }

    try {
        const transactions = await Transaction.find({
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, monthNumber]
            }
        });

        res.json(transactions);
    } catch (error) {
        res.status(500).send('Error fetching transactions: ' + error.message);
    }
};

exports.searchTransactionsByMonth = async (req, res) => {
    const { month, searchQuery } = req.params;

    try {
        const monthNumber = month === 'All' ? undefined : monthNameToNumber(month);

        const searchConditions = {
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ],
        };

        const searchPrice = Number(searchQuery);
        if (!isNaN(searchPrice)) {
            searchConditions.$or.push({ price: searchPrice });
        }

        if (monthNumber !== undefined) {
            searchConditions.$expr = {
                $eq: [{ $month: "$dateOfSale" }, monthNumber]
            };
        }

        const transactions = await Transaction.find(searchConditions);
        res.json(transactions);
    } catch (error) {
        res.status(500).send('Error fetching transactions: ' + error.message);
    }
};

exports.getTransactionStatisticsByMonth = async (req, res) => {
    const monthName = req.params.month;
    let monthNumber;

    if (monthName !== 'All') {
        monthNumber = monthNameToNumber(monthName);
    }

    try {
        const query = {
            ...(monthName !== 'All' && {
                $expr: {
                    $eq: [{ $month: "$dateOfSale" }, monthNumber]
                }
            })
        };

        const transactions = await Transaction.find(query);

        const totalSoldItems = transactions.filter(txn => txn.sold).length;
        const totalNotSoldItems = transactions.filter(txn => !txn.sold).length;
        const totalAmountOfSale = transactions
            .filter(txn => txn.sold)
            .reduce((sum, txn) => sum + parseFloat(txn.price), 0);

        const statistics = {
            totalAmountOfSale,
            totalSoldItems,
            totalNotSoldItems
        };

        res.json(statistics);
    } catch (error) {
        res.status(500).send('Error fetching transaction statistics: ' + error.message);
    }
};

exports.getBarChartData = async (req, res) => {
    const { month } = req.params;
    const monthNumber = monthNameToNumber(month);

    try {
        const transactions = await Transaction.find({
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, monthNumber]
            }
        });

        const priceRanges = [
            { label: '0-100', min: 0, max: 100, count: 0 },
            { label: '101-200', min: 101, max: 200, count: 0 },
            { label: '201-300', min: 201, max: 300, count: 0 },
            { label: '301-400', min: 301, max: 400, count: 0 },
            { label: '401-500', min: 401, max: 500, count: 0 },
            { label: '501-600', min: 501, max: 600, count: 0 },
            { label: '601-700', min: 601, max: 700, count: 0 },
            { label: '701-800', min: 701, max: 800, count: 0 },
            { label: '801-900', min: 801, max: 900, count: 0 },
            { label: '901+', min: 901, max: Infinity, count: 0 }
        ];

        transactions.forEach((transaction) => {
            const price = transaction.price;
            priceRanges.forEach((range) => {
                if (price >= range.min && price < range.max) {
                    range.count++;
                }
            });
        });

        res.status(200).json(priceRanges);
    } catch (error) {
        console.error('Error fetching bar chart data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPieChartData = async (req, res) => {
    const { month } = req.params;
    const monthNumber = monthNameToNumber(month);

    try {
        const transactions = await Transaction.find({
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, monthNumber]
            }
        });

        const categoryCount = {};
        transactions.forEach((transaction) => {
            const category = transaction.category;
            if (!categoryCount[category]) {
                categoryCount[category] = 0;
            }
            categoryCount[category]++;
        });

        const categoriesData = Object.entries(categoryCount).map(([category, count]) => ({
            category,
            count
        }));

        res.status(200).json(categoriesData);
    } catch (error) {
        console.error('Error fetching pie chart data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCombinedData = async (req, res) => {
    const { month } = req.params;

    try {
        console.log(`Fetching data for month: ${month}`);
        const [barChartResponse, pieChartResponse, statisticsResponse] = await Promise.all([
            axios.get(`http://localhost:3000/api/barchart/${month}`),
            axios.get(`http://localhost:3000/api/piechart/${month}`),
            axios.get(`http://localhost:3000/api/statistics/${month}`)
        ]);

        res.status(200).json({
            statistics: statisticsResponse.data,
            barChart: barChartResponse.data,
            pieChart: pieChartResponse.data
        });
    } catch (error) {
        console.error('Error fetching combined data:', error.message);
        res.status(500).json({ message: 'Error fetching combined data' });
    }
};
