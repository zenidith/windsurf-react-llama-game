import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

function App() {
  const [isJumping, setIsJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('highScore')) || 0
  );
  const [currentLevel, setCurrentLevel] = useState(1);
  
  const llamaRef = useRef(null);
  const cactusRef = useRef(null);

  const checkCollision = useCallback(() => {
    if (!llamaRef.current || !cactusRef.current || gameOver) return;

    const llama = llamaRef.current.getBoundingClientRect();
    const cactus = cactusRef.current.getBoundingClientRect();

    if (
      llama.right - 20 > cactus.left &&
      llama.left + 20 < cactus.right &&
      llama.bottom - 10 > cactus.top
    ) {
      setGameOver(true);
    }
  }, [gameOver]);

  const handleKeyPress = useCallback((event) => {
    if ((event.code === 'Space' || event.key === 'ArrowUp') && !isJumping && !gameOver) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
    }
    if (gameOver && (event.code === 'Space' || event.key === 'Enter')) {
      restartGame();
    }
  }, [isJumping, gameOver]);

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    setIsJumping(false);
    setCurrentLevel(1);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!gameOver) {
      const scoreInterval = setInterval(() => {
        setScore(prevScore => {
          const newScore = prevScore + 1;
          // Update level based on score
          if (newScore % 50 === 0) {
            setCurrentLevel(prevLevel => (prevLevel % 3) + 1);
          }
          return newScore;
        });
      }, 100);

      const collisionInterval = setInterval(checkCollision, 10);

      return () => {
        clearInterval(scoreInterval);
        clearInterval(collisionInterval);
      };
    }
  }, [gameOver, checkCollision]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score.toString());
    }
  }, [score, highScore]);

  const endGame = () => {
    setGameOver(true);
  };

  return (
    <div className={`game-container level-${currentLevel}`}>
      <div className="background-layer background-day" />
      <div className="background-layer background-sunset" />
      <div className="background-layer background-night" />
      
      <div className="score-container">
        <div>Score: {score}</div>
        <div>High Score: {highScore}</div>
        <div>Level: {currentLevel}</div>
      </div>
      
      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Press Space or Enter to restart</p>
        </div>
      )}
      
      <div className="game-area">
        <div 
          ref={llamaRef} 
          className={`llama ${isJumping ? 'jump' : 'running'}`} 
        />
        <div 
          ref={cactusRef} 
          className={`cactus ${gameOver ? 'stop' : ''}`} 
          onAnimationEnd={endGame} 
        />
      </div>
      
      <div className="ground" />
      
      {!gameOver && (
        <div className="instructions">
          Press Space or ↑ to jump
        </div>
      )}
    </div>
  );
}

export default App;
