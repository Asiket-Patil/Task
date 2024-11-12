const express = require('express');
const apiRoutes = require('./routes/product.route');
const connectDB = require('./config/db');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors());

connectDB();


app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});