import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.ts';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
        <div className="container mx-auto max-w-sm mt-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={register} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                id="username"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                id="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Register
                        </Button>
                    </form>
                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="mt-4 text-center">
                        <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
                            Already have an account? Login here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
