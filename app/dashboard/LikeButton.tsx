"use client";
import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toggleLike } from '@/app/actions';

interface LikeButtonProps {
    expenseId: string;
    initialLikeCount: number;
    initialIsLiked: boolean;
}

export default function LikeButton({ expenseId, initialLikeCount, initialIsLiked }: LikeButtonProps) {
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isPending, startTransition] = useTransition();

    const handleLike = () => {
        // Optimistic UI update
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

        startTransition(async () => {
            try {
                const result = await toggleLike(expenseId);
                // Update with server response
                setLikeCount(result.likeCount);
                setIsLiked(result.isLiked);
            } catch (error) {
                // Revert on error
                setIsLiked(isLiked);
                setLikeCount(likeCount);
                console.error('Failed to toggle like:', error);
            }
        });
    };

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            disabled={isPending}
            className="flex items-center gap-2 group"
        >
            <motion.div
                animate={{
                    scale: isLiked ? [1, 1.3, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`p-2 rounded-xl transition-all ${isLiked
                        ? 'bg-red-50'
                        : 'bg-white/50 group-hover:bg-red-50'
                    }`}
            >
                <Heart
                    size={18}
                    className={`transition-all ${isLiked
                            ? 'fill-red-400 text-red-400'
                            : 'text-zinc-400 group-hover:text-red-400'
                        }`}
                />
            </motion.div>
            {likeCount > 0 && (
                <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm font-bold text-zinc-600"
                >
                    {likeCount}
                </motion.span>
            )}
        </motion.button>
    );
}
