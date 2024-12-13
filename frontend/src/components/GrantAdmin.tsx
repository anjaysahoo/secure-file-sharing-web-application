import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../api';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
        <div className="container mx-auto max-w-md p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        Grant Admin Rights
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleGrantAdmin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                id="username"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Grant Rights
                        </Button>
                    </form>
                    
                    {message && (
                        <Alert 
                            variant={message.includes('Failed') ? 'destructive' : 'default'}
                            className="mt-4"
                        >
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default GrantAdmin;
