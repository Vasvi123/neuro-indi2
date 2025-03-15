// export default FlashcardApp;
import React, { useState, useEffect } from "react"; 
import { motion } from "framer-motion";
import { useSpeechSynthesis } from "react-speech-kit";
import "./FlashcardApp.css";

function FlashcardApp() {
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [index, setIndex] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(5); // in minutes
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionElapsed, setSessionElapsed] = useState(0); // elapsed seconds
  const [autoNext, setAutoNext] = useState(false);
  const { speak, voices } = useSpeechSynthesis();

  // Handle text upload
  const handleTextUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  // Generate flashcards
  const generateFlashcards = () => {
    const sentences = text.split(/\n|\. /).filter((s) => s.trim() !== "");
    setFlashcards(sentences);
    setIndex(0);
  };

  // Start session: enter fullscreen, lock session, and start progress timer
  const startSession = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
    setSessionActive(true);
    setSessionElapsed(0);
  };

  // End session: exit fullscreen and return to setup mode
  const endSession = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setSessionActive(false);
  };

  // Manual flashcard navigation
  const goToNext = () => {
    setIndex((prev) => (prev + 1) % flashcards.length);
  };

  const goToPrev = () => {
    setIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  // Session progress: update elapsed time every second while session is active
  useEffect(() => {
    let intervalId;
    if (sessionActive) {
      const totalSeconds = sessionDuration * 60;
      intervalId = setInterval(() => {
        setSessionElapsed((prev) => {
          if (prev < totalSeconds) {
            return prev + 1;
          } else {
            clearInterval(intervalId);
            return prev;
          }
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [sessionActive, sessionDuration]);

  // Auto Next feature: automatically move to next flashcard after 5 seconds if enabled
  useEffect(() => {
    let timerId;
    if (autoNext && sessionActive && flashcards.length > 0) {
      timerId = setTimeout(() => {
        goToNext();
      }, 5000);
    }
    return () => clearTimeout(timerId);
  }, [autoNext, index, sessionActive, flashcards]);

  // Calculate progress percentage for the overall session
  const totalSessionSeconds = sessionDuration * 60;
  const progressPercent =
    totalSessionSeconds > 0 ? (sessionElapsed / totalSessionSeconds) * 100 : 0;

  return (
    <div className="container">
      {!sessionActive ? (
        // SETUP MODE: Upload text & set session duration
        <div className="setup-container">
          <h1 className="title">Neurodivergent Flashcards</h1>
          <div className="upload-container">
            <input
              type="file"
              accept=".txt"
              onChange={handleTextUpload}
              className="file-input"
            />
            <textarea
              className="text-input"
              rows="4"
              placeholder="Or paste text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="timer-container">
            <label htmlFor="session-duration">
              Set Session Duration (minutes):
            </label>
            <input
              type="number"
              id="session-duration"
              value={sessionDuration}
              min="1"
              onChange={(e) =>
                setSessionDuration(parseInt(e.target.value, 10))
              }
            />
          </div>
          <button className="btn generate-btn" onClick={generateFlashcards}>
            Generate Flashcards
          </button>
          {flashcards.length > 0 && (
            <button className="btn start-btn" onClick={startSession}>
              Start Session
            </button>
          )}
        </div>
      ) : (
        // SESSION MODE: Fullscreen flashcard session
        <div className="session-container">
          <div className="session-header">
            <h2>
              Flashcard Session ({sessionDuration} minute
              {sessionDuration > 1 ? "s" : ""})
            </h2>
            <button className="btn end-btn" onClick={endSession}>
              End Session
            </button>
          </div>
          {/* Overall Session Progress Indicator */}
          <div className="session-progress-bar-container">
            <div
              className="session-progress-bar"
              style={{ width: `${progressPercent}%` }}
            ></div>
            <span className="progress-percent">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="flashcard-container">
            {/* Progress Bar for Flashcards (Thicker & animated) */}
            <progress
              className="progress-bar"
              value={((index + 1) / flashcards.length) * 100}
              max="100"
            />
            {/* Flashcard Text with subtle highlight animation */}  
            <div className="flashcard-box">
              <motion.p
                className="flashcard-text active"
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {flashcards[index]}
              </motion.p>
            </div>
            {/* Navigation Buttons: Larger, well-spaced for ease of use */}  
            <div className="navigation-buttons">
              <button
                className="btn nav-btn"
                onClick={goToPrev}
                disabled={index === 0}
              >
                ⬅️ Previous
              </button>
              <button
                className="btn nav-btn"
                onClick={goToNext}
                disabled={index === flashcards.length - 1}
              >
                Next ➡️
              </button>
            </div>
            {/* Auto Next Toggle and Other Functionalities */}  
            <div className="card-buttons">
              <button
                className="btn speech-btn"
                onClick={() =>
                  speak({ text: flashcards[index], voice: voices[0] })
                }
              >
                🔊 Read Aloud
              </button>
              <button className="btn speech-btn">
                You're doing great!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardApp;
