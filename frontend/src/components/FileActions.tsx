import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Shield, Trash2 } from "lucide-react";

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
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download file:', error);
            onMessage('Failed to download file');
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
        } catch (err: any) {
            setMessage('Failed to delete file: ' + (err.response?.data?.detail || err.message));
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
        } catch (err: any) {
            setMessage('Failed to manage access: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="flex items-center justify-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
                <Download className="h-4 w-4" />
            </Button>
            
            {isAdmin && (
                <>
                    <Button variant="ghost" size="icon" onClick={() => setShowModal(true)} title="Manage Access">
                        <Shield className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(true)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete File</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete <span className="font-medium">{fileName}</span>?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Access Management Dialog */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Manage Access for {fileName}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={toggleAccess} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Select
                                value={action}
                                onValueChange={(value) => setAction(value as 'grant' | 'revoke')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="grant">Grant access</SelectItem>
                                    <SelectItem value="revoke">Revoke access</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {message && (
                            <Alert>
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}
                        <DialogFooter>
                            <Button type="submit">Submit</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FileActions;
