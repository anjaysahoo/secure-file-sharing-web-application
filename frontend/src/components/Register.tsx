import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.ts';

const Register: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const register = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await api.register({ username, password });
            console.log('User registered:', response.data);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.detail?.message || 'An error occurred');
        }
    };

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-body p-4">
                    <form onSubmit={register}>
                        <div className="form-group mb-3">
                            <input
                                type="text"
                                id="username"
                                className="form-control"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-4">
                            <input
                                type="password"
                                id="password"
                                className="form-control"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">
                            Register
                        </button>
                    </form>
                    {error && <div className="alert alert-danger mt-3">{error}</div>}
                    <div className="mt-3 text-center">
                        <a href="/login">Already have an account? Login here</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
