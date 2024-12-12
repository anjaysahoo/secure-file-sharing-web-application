import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../api';

interface FileActionsProps {
    fileId: number;
    fileName: string;
    onDelete: (fileId: number) => void;
    onMessage: (message: string) => void;
}

const FileActions: React.FC<FileActionsProps> = ({ fileId, fileName, onDelete, onMessage }) => {
    const [username, setUsername] = useState('');
    const [action, setAction] = useState<'grant' | 'revoke'>('grant');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { isAdmin } = useSelector((state: RootState) => state.user);

    const handleDownload = async () => {
        try {
            const response = await api.downloadFile(fileId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition && contentDisposition.includes('filename=')) {
                const filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
                link.setAttribute('download', filename);
            } else {
                link.setAttribute('download', `file_${fileId}`);
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download file:', error);
        }
    };

    const confirmDelete = async () => {
        if (!isAdmin) {
            setMessage('Only admins can delete files.');
            return;
        }

        try {
            const response = await api.deleteFile(fileId);
            onMessage(response.data.message);
            onDelete(fileId);
            setMessage('File deleted successfully.');
            setShowDeleteConfirm(false);
            console.log('File deleted:', response.data);
        } catch (err: any) {
            setMessage('Failed to delete file: ' + (err.response?.data?.detail || err.message));
            console.error('Failed to delete file:', err);
        }
    };

    const toggleAccess = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isAdmin) {
            setMessage('Only admins can manage access.');
            return;
        }

        try {
            const response = await api.manageFileAccess({
                username,
                file_id: fileId,
                action
            });
            setMessage(response.data.message);
            console.log('Access managed:', response.data);
        } catch (err: any) {
            setMessage('Failed to manage access: ' + (err.response?.data?.detail || err.message));
            console.error('Failed to manage access:', err);
        }
    };

    const closeDeleteConfirm = () => {
        setShowDeleteConfirm(false);
        setMessage('');
    };

    const closeModal = () => {
        setShowModal(false);
        setUsername('');
        setAction('grant');
        setMessage('');
    };

    return (
        <td className="text-center">
            <div className="btn-group">
                <button onClick={handleDownload} className="btn btn-link p-0 me-3">
                    <i className="fas fa-download fa-lg text-primary"></i>
                </button>
                {isAdmin && (
                    <>
                        <button onClick={() => setShowModal(true)} className="btn btn-link p-0 me-3">
                            <i className="fas fa-user-shield fa-lg text-info"></i>
                        </button>
                        <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-link p-0">
                            <i className="fas fa-trash-alt fa-lg text-danger"></i>
                        </button>
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <>
                    <div className="modal-backdrop show"></div>
                    <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-md modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header border-0">
                                    <button type="button" className="btn-close" onClick={closeDeleteConfirm} aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <p className="mb-5">Are you sure you want to delete <strong>{fileName}</strong>?</p>
                                    <div className="d-flex justify-content-center">
                                        <button onClick={confirmDelete} className="btn btn-danger me-2">Delete</button>
                                        <button onClick={closeDeleteConfirm} className="btn btn-secondary">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Access Management Modal */}
            {showModal && (
                <>
                    <div className="modal-backdrop show"></div>
                    <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-m modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header border-0">
                                    <h6 className="modal-title">Manage Access for <strong>{fileName}</strong></h6>
                                    <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={toggleAccess}>
                                        <div className="mb-3">
                                            <input
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                type="text"
                                                className="form-control"
                                                id="username"
                                                placeholder="Username"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <select
                                                value={action}
                                                onChange={(e) => setAction(e.target.value as 'grant' | 'revoke')}
                                                className="form-select"
                                                id="action"
                                                required
                                            >
                                                <option value="grant">Grant access</option>
                                                <option value="revoke">Revoke access</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="btn btn-primary mt-3">Submit</button>
                                    </form>
                                    {message && <div className="alert alert-info mt-3">{message}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </td>
    );
};

export default FileActions;
