const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    body { 
      font-family: 'Inter', sans-serif; 
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    @keyframes wave-green {
      0%, 100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.2); }
      50% { box-shadow: 0 0 20px 5px rgba(34, 197, 94, 0.5); }
    }
    .animate-wave-green { animation: wave-green 3s infinite ease-in-out; }

    @keyframes wave-red {
      0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); }
      50% { box-shadow: 0 0 20px 5px rgba(239, 68, 68, 0.5); }
    }
    .animate-wave-red { animation: wave-red 3s infinite ease-in-out; }
  `}</style>
);


export default GlobalStyles;