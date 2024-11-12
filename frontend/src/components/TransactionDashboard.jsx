import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import BarChartComponent from './BarChart';

const TransactionDashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState('March');
    const [searchQuery, setSearchQuery] = useState('');
    const [statistics, setStatistics] = useState({});
    const recordsPerPage = 10; 

    const months = [
        'All', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = selectedMonth === 'All' 
                    ? await axios.get(`http://localhost:3000/api/init`) 
                    : await axios.get(`http://localhost:3000/api/transactions/${selectedMonth}`);
                setTransactions(response.data.transactions || response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchTransactions();
    }, [selectedMonth]);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/statistics/${selectedMonth}`);
                setStatistics(response.data);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            }
        };
        fetchStatistics();
    }, [selectedMonth]);

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/transactions/${selectedMonth}/${searchQuery}`);
            setTransactions(response.data);
        } catch (error) {
            console.error('Error searching transactions:', error);
        }
    };

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstRecord, indexOfLastRecord);

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
        setCurrentPage(1);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(transactions.length / recordsPerPage)) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    return (
        <div className="flex flex-col items-center p-4 md:p-8 min-h-screen justify-center ">
            <div className=" rounded-full p-8 mb-8 w-32 h-32 md:w-48 md:h-48 flex items-center justify-center bg-blue-200">
                <h1 className="text-center text-lg md:text-xl font-bold">Transaction Dashboard</h1>
            </div>
            <div className="bg-white p-8 shadow-md rounded-lg mb-8 w-[90%]">
                <h2 className="text-xl font-bold mb-4">Transaction Statistics for {selectedMonth}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-yellow-400 text-black p-4 rounded-lg">
                        <p className="text-lg font-semibold">Total Amount of Sale</p>
                        <p className="text-xl font-bold">₹ {statistics.totalAmountOfSale?.toFixed(2) || 0}</p>
                    </div>
                    <div className="bg-yellow-400 text-black p-4 rounded-lg">
                        <p className="text-lg font-semibold">Total Sold Items</p>
                        <p className="text-xl font-bold">{statistics.totalSoldItems || 0}</p>
                    </div>
                    <div className="bg-yellow-400 text-black p-4 rounded-lg">
                        <p className="text-lg font-semibold">Total Not Sold Items</p>
                        <p className="text-xl font-bold">{statistics.totalNotSoldItems || 0}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
                <input 
                    type="text" 
                    className='bg-yellow-400 text-black py-2 px-4 rounded-full' 
                    placeholder='Search Transaction' 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
                <button 
                    onClick={handleSearch} 
                    className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-400"
                >
                    Search
                </button>
                <select
                    className="bg-yellow-400 text-black py-2 px-4 rounded-full"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                >
                    {months.map((month, index) => (
                        <option key={index} value={month}>
                            {month}
                        </option>
                    ))}
                </select>
            </div>
            <div className="overflow-x-auto w-[90%]">
                <table className="table-auto border-collapse border border-black text-center min-w-full">
                    <thead>
                        <tr className="bg-yellow-400 text-xl">
                            <th className="border border-black px-4 py-4">ID</th>
                            <th className="border border-black px-4 py-4">Title</th>
                            <th className="border border-black px-4 py-4">Description</th>
                            <th className="border border-black px-4 py-4">Price</th>
                            <th className="border border-black px-4 py-4">Category</th>
                            <th className="border border-black px-4 py-4">Sold</th>
                            <th className="border border-black px-4 py-4 w-[10%]">Image</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTransactions.length > 0 ? (
                            currentTransactions.map((transaction, index) => (
                                <tr key={index}>
                                    <td className="border border-black px-4 py-4">{transaction.id}</td>
                                    <td className="border border-black font-bold px-4 py-4">{transaction.title}</td>
                                    <td className="border border-black px-4 py-4">{transaction.description}</td>
                                    <td className="border border-black px-4 py-4">₹ {transaction.price}</td>
                                    <td className="border border-black px-4 py-4">{transaction.category}</td>
                                    <td className="border border-black px-4 py-4">
                                        {transaction.sold ? 'Yes' : 'No'}
                                    </td>
                                    <td className="border border-black px-4 py-4">
                                        <img src={transaction.image} alt="Transaction" className="w-full h-auto object-cover" />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="border border-black px-4 py-4">
                                    No transactions found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-center w-full mt-4 space-x-4">
                <button 
                    onClick={handlePreviousPage} 
                    disabled={currentPage === 1 || Math.ceil(transactions.length / recordsPerPage) === 1} 
                    className={`py-2 px-4 rounded-full ${currentPage === 1 || Math.ceil(transactions.length / recordsPerPage) === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-400'}`}
                >
                    Previous
                </button>
                <span className="text-lg">
                    Page {currentPage} of {Math.ceil(transactions.length / recordsPerPage)}
                </span>
                <button 
                    onClick={handleNextPage} 
                    disabled={currentPage >= Math.ceil(transactions.length / recordsPerPage)} 
                    className={`py-2 px-4 rounded-full ${currentPage >= Math.ceil(transactions.length / recordsPerPage) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-400'}`}
                >
                    Next
                </button>
            </div>
            <BarChartComponent selectedMonth={selectedMonth} />
        </div>
    );
};

export default TransactionDashboard;
