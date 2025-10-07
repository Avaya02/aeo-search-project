import React, { useState } from 'react';
import axios from 'axios';

// --- Helper Components ---

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500 delay-200"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500 delay-400"></div>
        <span className="ml-2 text-gray-500">Thinking...</span>
    </div>
);

// Error Message Component
interface ErrorMessageProps {
    message: string;
}
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);

// Citation Component
interface Citation {
    title: string;
    url: string;
}

interface CitationListProps {
    citations: Citation[];
}

const CitationList: React.FC<CitationListProps> = ({ citations }) => (
    <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Sources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {citations.map((citation, index) => (
                <a
                    key={index}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 ease-in-out"
                >
                    <p className="font-semibold text-blue-600 truncate">{citation.title}</p>
                    <p className="text-sm text-gray-500 truncate">{citation.url}</p>
                </a>
            ))}
        </div>
    </div>
);

// Main App Component
const App: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [answer, setAnswer] = useState<string>('');
    const [citations, setCitations] = useState<Citation[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/search';

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            setError('Please enter a question.');
            return;
        }

        setIsLoading(true);
        setError('');
        setAnswer('');
        setCitations([]);

        try {
            const response = await axios.post(API_URL, { query });
            const { answer, citations } = response.data;
            
            setAnswer(answer);
            setCitations(citations);

        } catch (err: any) {
            console.error("API Error:", err);
            const errorMessage = err.response?.data?.error || 'Failed to get a response. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center font-sans p-4">
            <div className="w-full max-w-3xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">AEO Search Engine</h1>
                    <p className="text-gray-600 mt-2">
                        Ask a question and get a cited answer, powered by Bright Data.
                    </p>
                </header>

                <main className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., Where can I buy the best running shoes?"
                            className="flex-grow w-full px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Searching...' : 'Ask'}
                        </button>
                    </form>

                    <div className="mt-8 min-h-[200px]">
                        {isLoading && <LoadingSpinner />}
                        {error && <ErrorMessage message={error} />}
                        {answer && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Answer</h2>
                                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">{answer}</p>
                                {citations.length > 0 && <CitationList citations={citations} />}
                            </div>
                        )}
                    </div>
                </main>
                
                {/* <footer className="text-center mt-8 text-sm text-gray-500">
                    <p>Built with PERN + TypeScript for the AEO Project.</p>
                </footer> */}
            </div>
        </div>
    );
};

export default App;
