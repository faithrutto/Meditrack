import React from 'react';
import { Activity } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${fullScreen ? 'h-screen w-full' : 'h-64 w-full'} bg-background dark:bg-dark-bg transition-colors duration-200`}>
            <div className="relative">
                <Activity className="h-12 w-12 text-primary animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide animate-bounce">
                Syncing your health data...
            </p>
        </div>
    );
};

export default LoadingSpinner;
