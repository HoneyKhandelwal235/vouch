"use client";
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';

interface ReceiptUploaderProps {
    onDataExtracted: (data: { description: string; amount: string }) => void;
}

export default function ReceiptUploader({ onDataExtracted }: ReceiptUploaderProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState(false);

    const processImage = async (file: File) => {
        setIsProcessing(true);
        setSuccess(false);
        setProgress(0);

        try {
            const { data: { text } } = await Tesseract.recognize(
                file,
                'eng',
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    },
                }
            );

            // Parse the OCR text
            const lines = text.split('\n').filter(line => line.trim());

            // Extract amount (look for currency symbols and numbers)
            const amountRegex = /[\$€£¥]?\s*(\d+[.,]\d{2})/g;
            const amounts = text.match(amountRegex);
            const amount = amounts ? amounts[amounts.length - 1].replace(/[^\d.,]/g, '') : '';

            // Extract description (use first non-empty line or "Receipt")
            const description = lines.find(line => line.length > 3 && !line.match(/^\d+$/)) || 'Receipt';

            onDataExtracted({
                description: description.substring(0, 50),
                amount: amount,
            });

            setSuccess(true);
            setTimeout(() => {
                setPreview(null);
                setSuccess(false);
            }, 2000);
        } catch (error) {
            console.error('OCR Error:', error);
            alert('Failed to process receipt. Please try again or enter manually.');
        } finally {
            setIsProcessing(false);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            processImage(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: 1,
    });

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${isDragActive
                        ? 'border-[#4F75FF] bg-blue-50'
                        : 'border-zinc-300 hover:border-[#4F75FF] hover:bg-zinc-50'
                    }`}
            >
                <input {...getInputProps()} />

                <AnimatePresence mode="wait">
                    {isProcessing ? (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <Loader2 className="animate-spin text-[#4F75FF]" size={48} />
                            <p className="text-zinc-600 font-medium">Processing receipt...</p>
                            <div className="w-full max-w-xs bg-zinc-200 rounded-full h-2">
                                <motion.div
                                    className="bg-[#4F75FF] h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-zinc-500">{progress}%</p>
                        </motion.div>
                    ) : success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <CheckCircle className="text-green-500" size={48} />
                            <p className="text-green-600 font-bold">Receipt scanned successfully!</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <Upload className="text-zinc-400" size={48} />
                            <p className="text-zinc-600 font-medium">
                                {isDragActive ? 'Drop receipt here' : 'Drag & drop a receipt, or click to select'}
                            </p>
                            <p className="text-xs text-zinc-400">Supports PNG, JPG, JPEG, WEBP</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {preview && !success && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-2xl overflow-hidden border border-zinc-200"
                >
                    <img src={preview} alt="Receipt preview" className="w-full h-48 object-contain bg-zinc-50" />
                </motion.div>
            )}
        </div>
    );
}
