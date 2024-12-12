import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/userSlice';
import api from '../api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

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
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                id="username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>
                    {error && (
                        <div className="mt-4 p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-md">
                            {error}
                        </div>
                    )}
                    <div className="mt-6 text-center text-sm">
                        <a href="/register" className="text-primary hover:underline">
                            Don't have an account? Register here
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;