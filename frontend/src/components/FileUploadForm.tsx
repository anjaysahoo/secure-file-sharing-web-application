import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../api';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

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
        <div className="mb-4 flex items-center gap-4">
            <Button
                type="button"
                onClick={uploadFile}
                className="flex items-center gap-2"
            >
                <Upload className="h-4 w-4" />
                Upload
            </Button>

            <Card
                className={cn(
                    "flex-1 cursor-pointer border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors",
                    "p-4 text-center",
                    dragging && "border-primary bg-primary/5"
                )}
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex items-center justify-center">
                    {file ? (
                        <span className="text-sm text-muted-foreground">
                            {file.name}
                        </span>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Drag & drop your file here or click to select
                            </span>
                        </div>
                    )}
                </div>
                <input 
                    type="file"
                    className="hidden"
                    onChange={onFileChange}
                    ref={fileInputRef}
                />
            </Card>
        </div>
    );
};

export default FileUploadForm;
