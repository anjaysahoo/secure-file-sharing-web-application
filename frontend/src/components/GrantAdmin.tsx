import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../api';

const GrantAdmin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const { isAdmin } = useSelector((state: RootState) => state.user);

    const handleGrantAdmin = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!isAdmin) {
            setMessage('Only admins can grant admin rights.');
            return;
        }

        if (!username) {
            setMessage('Please provide a username.');
            return;
        }

        try {
            const response = await api.grantAdmin(username);
            setMessage(response.data.message);
            setUsername('');
            console.log('Admin rights granted:', response.data);
        } catch (err: any) {
            setMessage('Failed to grant admin rights: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-body p-4">
                    <h2 className="mb-4 text-center">Grant admin rights to the user</h2>
                    <form onSubmit={handleGrantAdmin}>
                        <div className="form-group mb-3">
                            <input
                                type="text"
                                id="username"
                                className="form-control"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">
                            Grant rights
                        </button>
                    </form>
                    {message && <div className="alert alert-info mt-3">{message}</div>}
                </div>
            </div>
            <style>{`
                .container {
                    max-width: 600px;
                    margin: auto;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .card {
                    border: none;
                }

                .card-body {
                    padding: 2rem;
                }

                h2 {
                    font-size: 1.5rem;
                    color: #333;
                }

                .form-label {
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }

                .form-control {
                    border-radius: 0.25rem;
                    padding: 0.75rem;
                }

                .btn-primary {
                    background-color: #007bff;
                    border: none;
                    padding: 0.75rem;
                    font-size: 1rem;
                }

                .btn-primary:hover {
                    background-color: #0056b3;
                }

                .alert {
                    margin-top: 1.5rem;
                    background-color: #e9f7fd;
                    color: #0c5460;
                    border: 1px solid #bee5eb;
                }
            `}</style>
        </div>
    );
};

export default GrantAdmin;
