import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const BarChartComponent = ({ selectedMonth }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/barchart/${selectedMonth}`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching bar chart data:', error);
            }
        };

        if (selectedMonth) {
            fetchData();
        }
    }, [selectedMonth]);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 mt-8">Transactions Bar Chart for {selectedMonth}</h2>
            <BarChart width={600} height={300} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priceRange" tick={{ fontSize: 12 }} />
                {/* Adjust domain to 0-4 */}
                <YAxis tick={{ fontSize: 12 }} domain={[0, 4]} /> 
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
        </div>
    );
};

export default BarChartComponent; 