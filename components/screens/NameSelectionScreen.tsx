
import React, { useState } from 'react';

interface NameSelectionScreenProps {
    onNameConfirm: (name: string) => void;
    onCancel: () => void;
}

const NameSelectionScreen: React.FC<NameSelectionScreenProps> = ({ onNameConfirm, onCancel }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length > 0) {
            onNameConfirm(name.trim());
        }
    };

    return (
        <div className="animate-fadeIn flex flex-col items-center justify-center h-full p-4 w-full">
             <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6 shadow-lg w-full max-w-sm text-center">
                <h2 className="text-xl font-bold text-[#D6721C] mb-4">Who are you?</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Character Name"
                        maxLength={12}
                        className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-[#D6721C] text-center font-bold"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 font-bold text-sm rounded-lg hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={name.trim().length === 0}
                            className="flex-1 px-4 py-2 bg-[#D6721C] text-slate-900 font-bold text-sm rounded-lg hover:bg-[#E1883D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </form>
             </div>
        </div>
    );
};
export default NameSelectionScreen;
