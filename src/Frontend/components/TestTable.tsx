// TestTable.tsx
import React, { useEffect, useState } from 'react';

interface Test {
    name: string;
}

const TestTable: React.FC = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const response = await fetch('/api/tests');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data: Test[] = await response.json();
                setTests(data);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Test List</h1>
            <table>
                <thead>
                    <tr>
                        <th>Test Name</th>
                    </tr>
                </thead>
                <tbody>
                    {tests.map((test, index) => (
                        <tr key={index}>
                            <td>{test.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TestTable;
