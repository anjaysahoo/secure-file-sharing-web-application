import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../api';

const UploadFile: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const { isAdmin } = useSelector((state: RootState) => state.user);

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!isAdmin) {
            setMessage('Only admins can upload files.');
            return;
        }

        if (!file) {
            setMessage('Please select a file to upload.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.uploadFile(formData);
            setMessage(response.data.message);
            setFile(null);
            if (event.target instanceof HTMLFormElement) {
                event.target.reset();
            }
            console.log('File uploaded:', response.data);
        } catch (err: any) {
            setMessage('Failed to upload file: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="container mt-5">
            <h1>Upload File</h1>
            {!isAdmin ? (
                <div className="alert alert-warning">
                    Only admins can upload files.
                </div>
            ) : (
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={handleUpload}>
                            <div className="mb-3">
                                <label htmlFor="file" className="form-label">Choose file</label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    id="file" 
                                    onChange={onFileChange}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Upload
                            </button>
                        </form>
                        {message && (
                            <div className="alert alert-info mt-3">
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadFile;
