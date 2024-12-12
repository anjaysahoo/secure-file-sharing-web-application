import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../api';

interface User {
    username: string;
    is_admin: boolean;
    download_count: number;
}

const UserStatistics: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [message, setMessage] = useState('');
    const { isAdmin, username: currentUser } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        const fetchStats = async () => {
            if (isAdmin) {
                try {
                    const response = await api.getUserStatistics();
                    setUsers(response.data);
                } catch (err: any) {
                    setMessage('Failed to fetch users stats: ' + (err.response?.data?.detail || err.message));
                }
            }
        };

        fetchStats();
    }, [isAdmin]);

    return (
        <div className="container-md mt-5">
            <div className="content">
                <h2 className="mb-4 text-center">Statistics</h2>
                {!isAdmin ? (
                    <div className="alert alert-danger text-center">
                        Only admins can access this page.
                    </div>
                ) : (
                    <table className="table table-borderless table-striped">
                        <thead className="thead-dark">
                            <tr>
                                <th>Username</th>
                                <th>Is Admin</th>
                                <th>Download Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr 
                                    key={user.username}
                                    className={user.username === currentUser ? 'current-user' : ''}
                                >
                                    <td>{user.username}</td>
                                    <td>{user.is_admin ? 'Yes' : 'No'}</td>
                                    <td>{user.download_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {message && <div className="alert alert-info mt-3">{message}</div>}
            </div>
            <style>{`
                .container {
                    max-width: 900px;
                    margin: auto;
                }

                .content {
                    padding: 2rem;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                    border-radius: 12px;
                    background-color: #f8f9fa;
                }

                h2 {
                    font-size: 1.8rem;
                    color: #333;
                    font-weight: bold;
                }

                .table {
                    width: 100%;
                    margin-top: 1rem;
                }

                .thead-dark th {
                    background-color: #343a40;
                    color: #fff;
                }

                .current-user {
                    font-weight: bold;
                    background-color: #f0f4c3;
                    color: #ff9800;
                }

                .alert {
                    margin-top: 1.5rem;
                }

                .alert-danger {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                .alert-info {
                    background-color: #d1ecf1;
                    color: #0c5460;
                    border: 1px solid #bee5eb;
                }
            `}</style>
        </div>
    );
};

export default UserStatistics;
