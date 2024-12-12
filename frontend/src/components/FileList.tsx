import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../api';
import FileUploadForm from './FileUploadForm';
import FileActions from './FileActions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileIcon } from 'lucide-react';

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
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Files</CardTitle>
                </CardHeader>
                <CardContent>
                    <FileUploadForm 
                        onUploadSuccess={fetchFiles} 
                        onMessage={handleMessage} 
                    />

                    {message && (
                        <Alert className="mt-4">
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}

                    {files.length > 0 ? (
                        <div className="mt-6 rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File Name</TableHead>
                                        {isAdmin && (
                                            <>
                                                <TableHead className="w-[150px] text-center">
                                                    Uploaded By
                                                </TableHead>
                                                <TableHead className="w-[150px] text-center">
                                                    Download Count
                                                </TableHead>
                                            </>
                                        )}
                                        <TableHead className="w-[200px] text-center">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {files.map(file => (
                                        <TableRow key={file.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                                                    {file.filename}
                                                </div>
                                            </TableCell>
                                            {isAdmin && (
                                                <>
                                                    <TableCell className="text-center">
                                                        {file.owner_username}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {file.download_count}
                                                    </TableCell>
                                                </>
                                            )}
                                            <TableCell>
                                                <div className="flex justify-center">
                                                    <FileActions 
                                                        fileId={file.id}
                                                        fileName={file.filename}
                                                        onDelete={() => handleFileDeleted(file.id)}
                                                        onMessage={handleMessage}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <Alert className="mt-6">
                            <AlertDescription>
                                No files available.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FileList;
