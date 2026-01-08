import React from "react";

interface BurgerButtonProps {
    isOpen: boolean;
    onClick: () => void;
    className?: string;
}

export const BurgerButton: React.FC<BurgerButtonProps> = ({ isOpen, onClick, className = '' }) => {
    return (
        <div className={'absolute top-4 right-6 z-50'}>
            <button
                type="button"
                onClick={onClick}
                className={`relative w-10 h-10 focus:outline-none ${className}`}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6">
            <span
                className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 top-0' : '-translate-y-1.5 top-0'}`}
            />
                    <span
                        className={`absolute h-0.5 w-6 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <span
                        className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 bottom-0' : 'translate-y-1.5 bottom-0'}`}
                    />
                </div>
            </button>
        </div>
    );
};