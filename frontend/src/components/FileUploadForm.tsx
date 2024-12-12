import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../api';

interface FileUploadFormProps {
    onUploadSuccess: () => void;
    onMessage: (message: string) => void;
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({ onUploadSuccess, onMessage }) => {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isAdmin } = useSelector((state: RootState) => state.user);

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setDragging(false);
        setFile(event.dataTransfer.files[0]);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setDragging(false);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const uploadFile = async () => {
        if (!isAdmin) {
            onMessage('Only admins can upload files.');
            return;
        }

        if (!file) {
            onMessage('Please select a file to upload.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.uploadFile(formData);
            onUploadSuccess();
            onMessage(`File "${file.name}" uploaded successfully.`);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            console.log('File uploaded:', response.data);
        } catch (err: any) {
            if (err.response?.status === 422) {
                onMessage('Unprocessable Entity: ' + (err.response.data.detail || err.message));
            } else {
                onMessage('Failed to upload file: ' + (err.response?.data?.detail || err.message));
            }
            console.error('Failed to upload file:', err);
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="mb-4 d-flex align-items-center">
            <button 
                type="button" 
                className="btn btn-primary mr-3" 
                onClick={uploadFile}
            >
                Upload
            </button>
            <div 
                className={`file-drop-area ${dragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
            >
                <span className="file-drop-message">
                    {file ? file.name : 'Drag & drop your file here or select to upload'}
                </span>
                <input 
                    type="file"
                    className="form-control-file file-input"
                    onChange={onFileChange}
                    ref={fileInputRef}
                />
            </div>
            <style>{`
                .file-drop-area {
                    border: 2px dashed #007bff;
                    border-radius: 4px;
                    padding: 5px 10px;
                    text-align: center;
                    background-color: #f9f9f9;
                    transition: border-color 0.3s ease, background-color 0.3s ease;
                    cursor: pointer;
                    flex: none;
                    white-space: nowrap;
                    width: auto;
                }

                .file-drop-area.dragging {
                    background-color: #e0f7fa;
                    border-color: #004d40;
                }

                .file-drop-area:hover {
                    border-color: #0056b3;
                    background-color: #e9ecef;
                }

                .file-drop-message {
                    font-size: 1rem;
                    color: #007bff;
                }

                .file-input {
                    display: none;
                }

                .d-flex {
                    display: flex;
                }

                .align-items-center {
                    align-items: center;
                }

                .mr-3 {
                    margin-right: 1rem;
                }
            `}</style>
        </div>
    );
};

export default FileUploadForm;
