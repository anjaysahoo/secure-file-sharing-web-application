import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/userSlice';
import api from '../api';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await api.login({ username, password });
            dispatch(login({
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                is_admin: response.data.is_admin,
                username,
            }));
            console.log('User logged in:', response.data);
            navigate('/files');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'An error occurred');
        }
    };

    return (
        <div className="container mt-5">
            <div className="card" style={styles.card}>
                <div className="card-body p-4">
                    <form onSubmit={handleLogin}>
                        <div className="form-group mb-3">
                            <input
                                type="text"
                                id="username"
                                className="form-control"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={styles.formControl}
                            />
                        </div>
                        <div className="form-group mb-4">
                            <input
                                type="password"
                                id="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.formControl}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" style={styles.button}>
                            Login
                        </button>
                    </form>
                    {error && <div className="alert alert-danger mt-3" style={styles.alert}>{error}</div>}
                    <div className="mt-3 text-center" style={styles.textCenter}>
                        <a href="/register">Don't have an account? Register here</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    card: {
        maxWidth: '500px',
        margin: 'auto',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
    },
    formControl: {
        borderRadius: '0.25rem',
        padding: '0.75rem'
    },
    button: {
        backgroundColor: '#007bff',
        border: 'none',
        width: '100%'
    },
    textCenter: {
        marginTop: '1.5rem'
    },
    alert: {
        marginTop: '1.5rem'
    }
} as const;

export default Login;