import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { logout as logoutAction } from '../store/userSlice';
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
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {isLoggedIn && (
                            <li className="nav-item ps-0 me-4">
                                <Link className="nav-link" to="/files">Files</Link>
                            </li>
                        )}
                        {isAdmin && (
                            <>
                                <li className="nav-item me-4">
                                    <Link className="nav-link" to="/statistics">Statistics</Link>
                                </li>
                                <li className="nav-item me-4">
                                    <Link className="nav-link" to="/grant-admin">Grant Admin Rights</Link>
                                </li>
                            </>
                        )}
                    </ul>
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        {!isLoggedIn && (
                            <>
                                <li className="nav-item me-4">
                                    <Link className="nav-link" to="/register">Register</Link>
                                </li>
                                <li className="nav-item me-4">
                                    <Link className="nav-link" to="/login">Login</Link>
                                </li>
                            </>
                        )}
                        {isLoggedIn && (
                            <>
                                <li className="nav-item me-4">
                                    <span className="nav-link navbar-text username">{username}</span>
                                </li>
                                <li className="nav-item">
                                    <a onClick={handleLogout} className="nav-link logout-icon" href="#">
                                        <i className="fas fa-sign-out-alt">Logout</i>
                                    </a>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

// Add the styles from the Vue component
const styles = `
.navbar {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.nav-link {
    color: #ddd !important;
    margin-right: 20px;
}

.nav-link:hover {
    color: #fff !important;
}

.navbar-text.username {
    color: #28a745 !important;
}

.logout-icon {
    cursor: pointer;
}
`;

// Create a style element and inject the styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Navigation;
