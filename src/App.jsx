import { useState } from "react";
import ArtistForm from "./components/artist-form";
import SongForm from "./components/song-form";
import AlbumForm from "./components/album-form";
import GenreForm from "./components/genre-form";
import SongsGenreForm from "./components/genre-songs";

const FORMS = {
    ARTIST: "artist",
    SONG: "song",
    ALBUM: "album",
    GENRE: "genre",
    //GENRESONGS: "genre songs",
};

const App = () => {
    const [activeForm, setActiveForm] = useState(FORMS.ARTIST);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const renderForm = () => {
        switch (activeForm) {
            case FORMS.ARTIST:
                return <ArtistForm />;
            case FORMS.SONG:
                return <SongForm />;
            case FORMS.ALBUM:
                return <AlbumForm />;
            case FORMS.GENRE:
                return <GenreForm />;
            case FORMS.GENRESONGS:
                return <SongsGenreForm />;
            default:
                return <ArtistForm />;
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((prev) => !prev);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Floating Navigation Bar Container */}
            <div className="fixed top-4 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <nav className="bg-white rounded-lg shadow-lg">
                        <div className="px-4">
                            <div className="flex justify-between h-16">
                                <div className="flex items-center">
                                    <span className="text-xl font-bold text-violet-500">
                                        Riff
                                    </span>
                                </div>

                                {/* Navigation Links */}
                                <div className="flex">
                                    <div className="hidden sm:flex sm:space-x-8">
                                        {Object.values(FORMS).map((form) => (
                                            <button
                                                key={form}
                                                onClick={() =>
                                                    setActiveForm(form)
                                                }
                                                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                                                    ${
                                                        activeForm === form
                                                            ? "bg-indigo-50 text-indigo-700"
                                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                                    }`}
                                            >
                                                {form.charAt(0).toUpperCase() +
                                                    form.slice(1)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Mobile Menu Button */}
                                    <div className="flex items-center sm:hidden">
                                        <button
                                            type="button"
                                            onClick={toggleMobileMenu}
                                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 
                                                hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 
                                                focus:ring-inset focus:ring-indigo-500"
                                        >
                                            <span className="sr-only">
                                                Open main menu
                                            </span>
                                            {/* Heroicon menu icon */}
                                            <svg
                                                className="h-6 w-6"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 6h16M4 12h16M4 18h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Menu */}
                        {isMobileMenuOpen && (
                            <div className="sm:hidden">
                                <div className="pt-2 pb-3 space-y-1">
                                    {Object.values(FORMS).map((form) => (
                                        <button
                                            key={form}
                                            onClick={() => {
                                                setActiveForm(form);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-base font-medium rounded-md
                                                ${
                                                    activeForm === form
                                                        ? "bg-indigo-50 text-indigo-700"
                                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                                }`}
                                        >
                                            {form.charAt(0).toUpperCase() +
                                                form.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto pt-28 pb-6 sm:px-6 lg:px-8">
                {renderForm()}
            </main>
        </div>
    );
};

export default App;
