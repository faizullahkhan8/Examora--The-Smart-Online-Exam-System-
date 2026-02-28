import React from "react";

interface Props {
    rows?: number;
}

const MessengerSkeleton: React.FC<Props> = ({ rows = 4 }) => {
    return (
        <div className="space-y-0">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="p-4 flex gap-3 border-b border-slate-50 animate-pulse"
                >
                    <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-grow space-y-2 pt-1">
                        <div className="flex justify-between">
                            <div className="h-3 bg-slate-200 rounded w-32" />
                            <div className="h-2 bg-slate-100 rounded w-12" />
                        </div>
                        <div className="h-2 bg-slate-100 rounded w-20" />
                        <div className="h-2 bg-slate-100 rounded w-48" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MessengerSkeleton;
