import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../api';
import FileUploadForm from './FileUploadForm';
import FileActions from './FileActions';

interface File {
    id: number;
    filename: string;
    owner_username?: string;
    download_count?: number;
}

const FileList: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [message, setMessage] = useState<string>('');
    const { isAdmin } = useSelector((state: RootState) => state.user);

    const fetchFiles = async () => {
        try {
            const response = await api.getAllFiles();
            setFiles(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleFileDeleted = (fileId: number) => {
        setFiles(files.filter(file => file.id !== fileId));
    };

    const handleMessage = (msg: string) => {
        setMessage(msg);
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 text-center">Files</h1>

            <FileUploadForm 
                onUploadSuccess={fetchFiles} 
                onMessage={handleMessage} 
            />

            {message && <div className="alert alert-info mt-3">{message}</div>}

            {files.length > 0 ? (
                <table className="table table-striped table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">File Name</th>
                            {isAdmin && (
                                <>
                                    <th scope="col" style={{ width: '15%' }} className="text-center">
                                        Uploaded By
                                    </th>
                                    <th scope="col" style={{ width: '15%' }} className="text-center">
                                        Download Count
                                    </th>
                                </>
                            )}
                            <th scope="col" className="text-center" style={{ width: '20%' }}>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map(file => (
                            <tr key={file.id}>
                                <td>
                                    <i className="file-icon fas fa-file-alt fa-lg me-2"></i> 
                                    {file.filename}
                                </td>
                                {isAdmin && (
                                    <>
                                        <td className="text-center">{file.owner_username}</td>
                                        <td className="text-center">{file.download_count}</td>
                                    </>
                                )}
                                <td>
                                    <FileActions 
                                        fileId={file.id}
                                        fileName={file.filename}
                                        onDelete={() => handleFileDeleted(file.id)}
                                        onMessage={handleMessage}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="alert alert-info text-center">
                    No files available.
                </div>
            )}
        </div>
    );
};

export default FileList;
