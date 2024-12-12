import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { logout as logoutAction } from '../store/userSlice';
import { Button } from "@/components/ui/button";
import { LogOut, FileText, BarChart2, UserPlus } from "lucide-react";
import api from '../api';

const Navigation: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoggedIn, isAdmin, username } = useSelector((state: RootState) => state.user);

    const handleLogout = async () => {
        try {
            await api.logout();
            dispatch(logoutAction());
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-14 items-center justify-between">
                    <div className="flex gap-6 md:gap-10">
                        {/* Left side navigation items */}
                        {isLoggedIn && (
                            <Link to="/files" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                                <FileText className="h-4 w-4" />
                                Files
                            </Link>
                        )}
                        {isAdmin && (
                            <>
                                <Link to="/statistics" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                                    <BarChart2 className="h-4 w-4" />
                                    Statistics
                                </Link>
                                <Link to="/grant-admin" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                                    <UserPlus className="h-4 w-4" />
                                    Grant Admin
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Right side navigation items */}
                    <div className="flex items-center gap-4">
                        {!isLoggedIn ? (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link to="/register">Register</Link>
                                </Button>
                                <Button variant="default" asChild>
                                    <Link to="/login">Login</Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <span className="text-sm font-medium text-primary">
                                    {username}
                                </span>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="gap-2" 
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
