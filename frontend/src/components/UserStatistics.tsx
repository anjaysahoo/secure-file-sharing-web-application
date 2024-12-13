import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

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
        <div className="container mx-auto max-w-4xl p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!isAdmin ? (
                        <Alert variant="destructive">
                            <AlertDescription>
                                Only admins can access this page.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Is Admin</TableHead>
                                    <TableHead>Download Count</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow 
                                        key={user.username}
                                        className={user.username === currentUser ? 
                                            'font-medium bg-muted' : ''}
                                    >
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.is_admin ? "default" : "secondary"}>
                                                {user.is_admin ? 'Yes' : 'No'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.download_count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    {message && (
                        <Alert variant="default" className="mt-4">
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserStatistics;
