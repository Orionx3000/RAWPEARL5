import React from 'react';

export default function Terminal({ terminalInput, onInputChange, onSubmit }) {
  return (
    <footer className="h-12 border-t-2 crt-border flex items-center px-4 bg-black shrink-0">
      <span className="mr-2 font-bold crt-glow">{'>'}</span>
      <form onSubmit={onSubmit} className="flex-1">
        <input type="text" value={terminalInput}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="clear | euclid(N) | fill X | bpm N | root C | scale minor | vol N | steps N | dir F/B/P/R | name CH | mute | solo | panic | undo | redo"
          className="w-full bg-transparent border-none focus:outline-none text-[#ffcc00] placeholder-[rgba(255,204,0,0.3)] uppercase text-sm" spellCheck="false" />
      </form>
    </footer>
  );
}
