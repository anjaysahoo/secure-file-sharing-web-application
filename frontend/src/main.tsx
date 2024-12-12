import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import App from './App';
import Login from "./components/Login";
import Register from "./components/Register";
import FileList from "./components/FileList";
import UploadFile from "./components/UploadFile";
import GrantAdmin from "./components/GrantAdmin";
import UserStatistics from "./components/UserStatistics";
import './index.css'

// Protected Route wrapper component
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
    const isAdmin = localStorage.getItem('is_admin') === 'true';
    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
        element: <Navigate to="/login" replace />,
    },
    {
                path: "login",
        element: <Login />,
    },
    {
                path: "register",
        element: <Register />,
    },
    {
                path: "files",
        element: <FileList />,
    },
    {
                path: "upload",
        element: (
            <ProtectedAdminRoute>
                <UploadFile />
            </ProtectedAdminRoute>
        ),
    },
    {
                path: "grant-admin",
        element: (
            <ProtectedAdminRoute>
                <GrantAdmin />
            </ProtectedAdminRoute>
        ),
    },
    {
                path: "statistics",
        element: (
            <ProtectedAdminRoute>
                <UserStatistics />
            </ProtectedAdminRoute>
        ),
            },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>,
);
