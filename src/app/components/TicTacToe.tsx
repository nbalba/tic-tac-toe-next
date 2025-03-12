'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

type Player = 'X' | 'O' | null;
type Board = Player[];

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first interaction
    const initAudio = () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
      }
    };

    // Add listeners for user interaction
    window.addEventListener('click', initAudio);
    window.addEventListener('touchstart', initAudio);

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
      audioContext?.close();
    };
  }, [audioContext]);

  const playSound = useCallback((type: 'move' | 'win' | 'draw') => {
    if (isMuted || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Configure sound based on type
    switch (type) {
      case 'move':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'win':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        break;
      case 'draw':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
    }

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
  }, [isMuted, audioContext]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const calculateWinner = (squares: Board): Player | 'draw' | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    if (squares.every(square => square !== null)) {
      return 'draw';
    }

    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    
    playSound('move');

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      playSound(gameWinner === 'draw' ? 'draw' : 'win');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const renderStatus = () => {
    if (winner === 'draw') return 'Game ended in a draw!';
    if (winner) return `Winner: ${winner}`;
    return `Next player: ${isXNext ? 'X' : 'O'}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-3xl font-bold">Tic Tac Toe</h1>
        <button
          onClick={toggleMute}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((value, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: value ? 1 : 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(index)}
            className={`w-20 h-20 bg-white/10 rounded-lg text-4xl font-bold flex items-center justify-center
              ${!value && !winner ? 'hover:bg-white/20' : ''}`}
            disabled={!!value || !!winner}
          >
            {value && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={value === 'X' ? 'text-blue-400' : 'text-red-400'}
              >
                {value}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      <p className="text-xl mb-4">{renderStatus()}</p>
      
      {(winner || board.some(square => square !== null)) && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
        >
          Reset Game
        </motion.button>
      )}
    </div>
  );
} 