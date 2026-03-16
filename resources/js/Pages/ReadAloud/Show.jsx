import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function Show({ auth }) {
    const [text, setText] = useState('');
    const [isReading, setIsReading] = useState(false);
    const [isRepeating, setIsRepeating] = useState(false);
    const [speechError, setSpeechError] = useState('');

    // Use a ref to keep track of the repeat state inside the onend callback
    const isRepeatingRef = useRef(isRepeating);
    const isIntentionallyStopped = useRef(false);
    const synthRef = useRef(null);
    const utteranceRef = useRef(null);
    const voicesRef = useRef([]);

    useEffect(() => {
        isRepeatingRef.current = isRepeating;
    }, [isRepeating]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
            setSpeechError('Read aloud is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        const synth = window.speechSynthesis;
        synthRef.current = synth;

        const loadVoices = () => {
            voicesRef.current = synth.getVoices();
        };

        loadVoices();

        if (typeof synth.addEventListener === 'function') {
            synth.addEventListener('voiceschanged', loadVoices);
        } else {
            synth.onvoiceschanged = loadVoices;
        }

        return () => {
            synth.cancel();

            if (typeof synth.removeEventListener === 'function') {
                synth.removeEventListener('voiceschanged', loadVoices);
            } else {
                synth.onvoiceschanged = null;
            }
        };
    }, []);

    const speak = () => {
        const cleanedText = text.trim();
        if (!cleanedText) return;

        const synth = synthRef.current;
        if (!synth) {
            setSpeechError('Speech engine is unavailable in this browser session. Refresh and try again.');
            return;
        }

        setSpeechError('');
        isIntentionallyStopped.current = false;

        if (synth.speaking || synth.pending) {
            synth.cancel();
        }

        // Chunk text by sentences to prevent Chrome's 15-second / 200-character silent drop bug
        const chunks = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];
        let currentChunkIndex = 0;

        const playNextChunk = () => {
            if (isIntentionallyStopped.current) {
                setIsReading(false);
                return;
            }

            if (currentChunkIndex >= chunks.length) {
                if (isRepeatingRef.current) {
                    currentChunkIndex = 0;
                    setTimeout(playNextChunk, 500);
                } else {
                    setIsReading(false);
                }
                return;
            }

            const chunkText = chunks[currentChunkIndex].trim();
            if (!chunkText) {
                currentChunkIndex++;
                playNextChunk();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(chunkText);
            utteranceRef.current = utterance;

            const englishVoice = voicesRef.current.find((voice) =>
                voice.lang?.toLowerCase().startsWith('en')
            );

            if (englishVoice) {
                utterance.voice = englishVoice;
                utterance.lang = englishVoice.lang;
            } else {
                utterance.lang = 'en-US';
            }

            if (currentChunkIndex === 0) {
                setIsReading(true);
            }

            utterance.onend = () => {
                if (!isIntentionallyStopped.current) {
                    currentChunkIndex++;
                    playNextChunk();
                }
            };

            // Handle errors that might occur on a chunk
            utterance.onerror = (e) => {
                if (e.error !== 'interrupted' && e.error !== 'canceled') {
                    console.error('Speech Synthesis Error:', e);
                    setSpeechError('Unable to play audio. Check browser audio settings and try again.');
                    setIsReading(false);
                }
            };

            // Important workaround for Google Chrome: 
            // Chrome will stop firing events if speech runs for more than 15s. 
            // We use a small timeout workaround to keep it awake if needed.
            resumeInfinity(synth);

            synth.speak(utterance);
        };

        // Wait briefly before speaking to avoid Chrome interrupting the new utterance
        setTimeout(playNextChunk, 50);
    };

    // Keep Chrome's speech engine awake for long chunks
    const resumeInfinity = (synth) => {
        if (!synth) return;
        window.clearTimeout(window.speechTimeout);
        window.speechTimeout = window.setTimeout(() => {
            if (synth.speaking && !synth.paused) {
                synth.pause();
                synth.resume();
                resumeInfinity(synth);
            }
        }, 10000);
    };

    const stop = () => {
        isIntentionallyStopped.current = true;
        window.clearTimeout(window.speechTimeout);

        if (utteranceRef.current) {
            utteranceRef.current.onend = null;
            utteranceRef.current.onerror = null;
            utteranceRef.current = null;
        }

        synthRef.current?.cancel();
        setIsReading(false);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Read Aloud" />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-brand-text mb-6">Read Aloud</h1>
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-t-4 border-brand-blue">
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                            Paste text to be read aloud:
                        </label>
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            className="w-full h-64 rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue p-4"
                            placeholder="Paste text here..."
                        ></textarea>

                        {speechError && (
                            <p className="mt-3 text-sm font-medium text-red-600">{speechError}</p>
                        )}

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Repeat Toggle */}
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isRepeating}
                                        onChange={() => setIsRepeating(!isRepeating)}
                                    />
                                    <div className={`block w-10 h-6 ${isRepeating ? 'bg-brand-blue' : 'bg-gray-300'} rounded-full transition-colors`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${isRepeating ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <div className="ml-3 text-gray-700 font-semibold flex items-center">
                                    <i className={`fas fa-redo-alt mr-2 ${isRepeating ? 'text-brand-blue' : 'text-gray-400'}`}></i>
                                    Repeat Mode
                                </div>
                            </label>

                            {/* Action Buttons */}
                            <div className="flex w-full sm:w-auto gap-3">
                                {!isReading ? (
                                    <button
                                        onClick={speak}
                                        disabled={!text.trim() || !!speechError}
                                        className="flex-1 sm:flex-none bg-brand-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:bg-gray-400 shadow"
                                    >
                                        <i className="fas fa-play mr-2"></i> Play
                                    </button>
                                ) : (
                                    <button
                                        onClick={stop}
                                        className="flex-1 sm:flex-none bg-red-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors shadow animate-pulse"
                                    >
                                        <i className="fas fa-stop mr-2"></i> Stop
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
