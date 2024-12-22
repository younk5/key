function validateKey(key) {
    console.log('Key recebida:', key);
        key = key.trim();
    
    // nome do jogo, duração, 6 caracters, 6 caracters
    const pattern = /^MKEY-(WW|SR|ZZZ)-\d+DAY-[A-Z0-9]{6}-[A-Z0-9]{6}$/;
    
    console.log('Key válida pelo pattern:', pattern.test(key));
    
    if (!pattern.test(key)) {
        return null;
    }
    
    const parts = key.split('-');
    const duration = parseInt(parts[2].replace('DAY', ''));
    
    console.log('Game Type:', parts[1]);
    console.log('Duration:', duration);
    
    return {
        gameType: parts[1],
        duration: duration
    };
}

module.exports = { validateKey };