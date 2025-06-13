
document.addEventListener('DOMContentLoaded', () => {
  // Constants
  const MAX_ENTRIES = 100;
  const MAX_ITEM_LENGTH = 50;
  const ROULETTE_SIZE = Math.max(300, Math.min(460, window.innerWidth * 0.8, window.innerHeight * 0.5));

  // State variables
  let entries = [];
  let currentWinner = null;
  let isSpinning = false;
  let rotation = 0;
  let theme = 'light';
  let removeWinnerAfterSpin = true;
  let history = [];
  let isHistoryOpen = false;

  // DOM Elements
  const appTitle = document.getElementById('app-title');
  const entriesTextarea = document.getElementById('entries-textarea');
  const entriesCountDisplay = document.getElementById('entries-count');
  const importFileButton = document.getElementById('import-file-button');
  const fileInput = document.getElementById('file-input');
  const clearAllButton = document.getElementById('clear-all-button');
  const themeToggleButton = document.getElementById('theme-toggle-button');
  const moonIcon = document.getElementById('moon-icon');
  const sunIcon = document.getElementById('sun-icon');
  const removeWinnerToggle = document.getElementById('remove-winner-toggle');
  const rouletteContainer = document.getElementById('roulette-container');
  const rouletteSVG = document.getElementById('roulette-svg');
  const spinButton = document.getElementById('spin-button');
  const spinButtonText = document.getElementById('spin-button-text');
  const historyDisplayArea = document.getElementById('history-display-area');
  const historyToggleButton = document.getElementById('history-toggle-button');
  const historyCountDisplay = document.getElementById('history-count');
  const historyChevronDown = document.getElementById('history-chevron-down');
  const historyChevronUp = document.getElementById('history-chevron-up');
  const historyContent = document.getElementById('history-content');
  const historyList = document.getElementById('history-list');
  const noHistoryMessage = document.getElementById('no-history-message');
  const historyButtonsGroup = document.getElementById('history-buttons-group');
  const exportTxtButton = document.getElementById('export-txt-button');
  const exportCsvButton = document.getElementById('export-csv-button');
  const clearHistoryButton = document.getElementById('clear-history-button');
  const winnerModal = document.getElementById('winner-modal');
  const confettiContainer = document.getElementById('confetti-container');
  const winnerNameDisplay = document.getElementById('winner-name');
  const spinAgainButton = document.getElementById('spin-again-button');
  const closeModalButton = document.getElementById('close-modal-button');
  const currentYearDisplay = document.getElementById('current-year');

  // Initialization
  function init() {
    loadStateFromLocalStorage();
    applyTheme();
    updateUI();
    addEventListeners();
    drawRoulette();
    if (currentYearDisplay) currentYearDisplay.textContent = new Date().getFullYear();
    rouletteContainer.style.width = `${ROULETTE_SIZE}px`;
    rouletteContainer.style.height = `${ROULETTE_SIZE}px`;
  }

  // LocalStorage functions
  function loadStateFromLocalStorage() {
    entries = JSON.parse(localStorage.getItem('rouletteEntries_v2_vanilla')) || [];
    theme = localStorage.getItem('rouletteTheme_v2_vanilla') || 'light';
    removeWinnerAfterSpin = JSON.parse(localStorage.getItem('rouletteRemoveWinner_v2_vanilla')) !== false; // true by default
    history = JSON.parse(localStorage.getItem('rouletteHistory_v2_vanilla')) || [];
    isHistoryOpen = JSON.parse(localStorage.getItem('rouletteHistoryOpen_v2_vanilla')) || false;

    if (entriesTextarea) entriesTextarea.value = entries.map(e => e.name).join('\n');
    if (removeWinnerToggle) removeWinnerToggle.checked = removeWinnerAfterSpin;
  }

  function saveStateToLocalStorage() {
    localStorage.setItem('rouletteEntries_v2_vanilla', JSON.stringify(entries));
    localStorage.setItem('rouletteTheme_v2_vanilla', theme);
    localStorage.setItem('rouletteRemoveWinner_v2_vanilla', JSON.stringify(removeWinnerAfterSpin));
    localStorage.setItem('rouletteHistory_v2_vanilla', JSON.stringify(history));
    localStorage.setItem('rouletteHistoryOpen_v2_vanilla', JSON.stringify(isHistoryOpen));
  }
  
  // Theme management
  function applyTheme() {
    document.body.classList.toggle('dark', theme === 'dark');
    if (moonIcon && sunIcon) {
        moonIcon.classList.toggle('hidden', theme === 'dark');
        sunIcon.classList.toggle('hidden', theme === 'light');
    }
    if (themeToggleButton) themeToggleButton.setAttribute('aria-label', theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro');
  }

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveStateToLocalStorage();
  }

  // UI Update functions
  function updateUI() {
    if (entriesCountDisplay) entriesCountDisplay.textContent = `${entries.length}/${MAX_ENTRIES} itens`;
    if (spinButton) spinButton.disabled = isSpinning || entries.length === 0;
    
    if (spinButtonText) {
        if (isSpinning) {
            spinButtonText.textContent = 'Girando...';
        } else if (entries.length === 1) {
            spinButtonText.textContent = 'Selecionar Ganhador!';
        } else {
            spinButtonText.textContent = 'Girar Roleta!';
        }
    }
    updateHistoryUI();
  }

  function updateHistoryUI() {
    if (!historyList) return;
    historyList.innerHTML = '';
    if (history.length > 0) {
      history.forEach(entry => {
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.className = 'item-name';
        nameSpan.textContent = entry.name;
        const dateSpan = document.createElement('span');
        dateSpan.className = 'item-date';
        dateSpan.textContent = entry.date;
        li.appendChild(nameSpan);
        li.appendChild(dateSpan);
        historyList.appendChild(li);
      });
      noHistoryMessage.classList.add('hidden');
      historyButtonsGroup.classList.remove('hidden');
    } else {
      noHistoryMessage.classList.remove('hidden');
      historyButtonsGroup.classList.add('hidden');
    }
    if (historyCountDisplay) historyCountDisplay.textContent = history.length;
    
    if (historyContent) historyContent.classList.toggle('hidden', !isHistoryOpen);
    if (historyToggleButton) historyToggleButton.setAttribute('aria-expanded', isHistoryOpen);
    if (historyChevronDown) historyChevronDown.classList.toggle('hidden', isHistoryOpen);
    if (historyChevronUp) historyChevronUp.classList.toggle('hidden', !isHistoryOpen);

    // Show history area only if it has content or is deliberately opened
    historyDisplayArea.classList.toggle('hidden', history.length === 0 && !isHistoryOpen);

  }

  // Input processing
  function handleTextareaChange() {
    let newText = entriesTextarea.value;
    const lines = newText.split('\n');
    if (lines.length > MAX_ENTRIES) {
      newText = lines.slice(0, MAX_ENTRIES).join('\n');
    }
    const validatedLines = lines.map(line => line.substring(0, MAX_ITEM_LENGTH));
    newText = validatedLines.join('\n');

    entriesTextarea.value = newText; // Update textarea if modified
    entries = parseEntriesFromString(newText);
    drawRoulette();
    updateUI();
    saveStateToLocalStorage();
  }

  function parseEntriesFromString(text) {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.length <= MAX_ITEM_LENGTH)
      .slice(0, MAX_ENTRIES)
      .map((name, index) => ({ id: `${Date.now()}-${index}`, name }));
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const parsedEntries = await parseFileContent(file);
        entries = parsedEntries;
        entriesTextarea.value = parsedEntries.map(e => e.name).join('\n');
        drawRoulette();
        updateUI();
        saveStateToLocalStorage();
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Erro ao processar o arquivo.");
      }
    }
    if (fileInput) fileInput.value = ""; // Reset file input
  }

  function parseFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        let items = [];
        if (file.type === 'text/csv') {
          const lines = text.split('\n');
          items = lines.reduce((acc, line) => {
            const values = line.split(',').map(v => v.trim()).filter(v => v.length > 0);
            return [...acc, ...values];
          }, []);
        } else { // Assuming text/plain
          items = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        }
        resolve(items
          .filter(item => item.length <= MAX_ITEM_LENGTH)
          .slice(0, MAX_ENTRIES)
          .map((name, index) => ({ id: `file-${Date.now()}-${index}`, name }))
        );
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  function clearAllEntries() {
    entries = [];
    entriesTextarea.value = '';
    drawRoulette();
    updateUI();
    saveStateToLocalStorage();
  }

  // Roulette rendering
  function generateSegmentColors(count) {
    if (count <= 0) return [];
    if (count === 1) return ['hsl(var(--color-primary-hsl), 55%)'];

    const colors = [];
    const baseHueStart = 140; 
    const hueRange = 100; 
    const saturation = 65;
    const lightness = 60;

    for (let i = 0; i < count; i++) {
      const hue = (baseHueStart + (i / count) * hueRange) % 360;
      colors.push(`hsl(${hue.toFixed(0)}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  }
  
  function getLightnessFromHsl(hslColor) {
      const match = hslColor.match(/hsl\(\s*[\d\.]+\s*,\s*[\d\.]+%?\s*,\s*([\d\.]+)%?\s*\)/);
      return match ? parseFloat(match[1]) : 0;
  }

  function drawRoulette() {
    if (!rouletteSVG) return;
    rouletteSVG.innerHTML = ''; // Clear previous segments

    if (entries.length === 0) {
      rouletteSVG.classList.add('placeholder');
      const placeholderText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      placeholderText.setAttribute("x", "50%");
      placeholderText.setAttribute("y", "50%");
      placeholderText.setAttribute("text-anchor", "middle");
      placeholderText.setAttribute("dominant-baseline", "middle");
      placeholderText.setAttribute("class", "roulette-placeholder-text");
      placeholderText.textContent = "Adicione itens para girar a roleta!";
      rouletteSVG.appendChild(placeholderText);
      return;
    }
    rouletteSVG.classList.remove('placeholder');

    const numSegments = entries.length;
    const segmentAngleDegrees = 360 / numSegments;
    const radius = ROULETTE_SIZE / 2;
    const centerX = radius;
    const centerY = radius;
    const colors = generateSegmentColors(numSegments);

    const getCoordinates = (angleDegrees) => {
      const angleRadians = (angleDegrees - 90) * Math.PI / 180; // Start from top
      return [
        centerX + radius * Math.cos(angleRadians),
        centerY + radius * Math.sin(angleRadians)
      ];
    };

    for (let i = 0; i < numSegments; i++) {
      const item = entries[i];
      const startAngle = i * segmentAngleDegrees;
      const endAngle = (i + 1) * segmentAngleDegrees;

      const [startX, startY] = getCoordinates(startAngle);
      const [endX, endY] = getCoordinates(endAngle);
      
      const largeArcFlag = segmentAngleDegrees > 180 ? 1 : 0;
      const pathData = `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
      
      const segmentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      segmentPath.setAttribute("d", pathData);
      segmentPath.setAttribute("fill", colors[i % colors.length]);
      segmentPath.setAttribute("stroke", document.body.classList.contains('dark') ? 'var(--color-dark-background)' : '#FFF');
      segmentPath.setAttribute("stroke-width", numSegments > 1 ? "1.5" : "0");
      rouletteSVG.appendChild(segmentPath);

      // Add text
      const textAngleRad = ((startAngle + segmentAngleDegrees / 2) - 90) * Math.PI / 180;
      const textRadius = radius * 0.65;
      const textX = centerX + textRadius * Math.cos(textAngleRad);
      const textY = centerY + textRadius * Math.sin(textAngleRad);
      
      let fontSize = Math.max(8, Math.min(16, radius / numSegments * 0.8));
      if(numSegments > 20) fontSize = Math.max(7, radius / numSegments * 0.65);
      if(numSegments > 35) fontSize = Math.max(6, radius / numSegments * 0.5);
      if(numSegments > 50) fontSize = Math.max(5, radius / numSegments * 0.4);

      const segmentColor = colors[i % colors.length];
      const textColor = getLightnessFromHsl(segmentColor) > 55 ? (document.body.classList.contains('dark') ? "hsl(210, 20%, 20%)" : "#1A202C") : "#FFFFFF";

      const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textElement.setAttribute("x", textX);
      textElement.setAttribute("y", textY);
      textElement.setAttribute("transform", `rotate(${startAngle + segmentAngleDegrees / 2}, ${textX}, ${textY})`);
      textElement.setAttribute("fill", textColor);
      textElement.setAttribute("font-size", `${fontSize.toFixed(1)}px`);
      textElement.setAttribute("font-family", "Poppins, sans-serif");
      textElement.setAttribute("font-weight", "500");
      textElement.setAttribute("text-anchor", "middle");
      textElement.setAttribute("dominant-baseline", "middle");
      textElement.style.pointerEvents = "none";
      textElement.style.userSelect = "none";
      
      let displayName = item.name;
      if (displayName.length > 15 && numSegments > 10) {
        displayName = displayName.substring(0, 12) + "...";
      }
      textElement.textContent = displayName;
      rouletteSVG.appendChild(textElement);
    }
    // Apply initial rotation if any (e.g. from previous spin)
    rouletteSVG.style.transform = `rotate(${rotation}deg)`;
  }

  // Spin logic
  function handleSpin() {
    if (entries.length === 0 || isSpinning) return;

    if (entries.length === 1) {
      const winner = entries[0];
      currentWinner = winner;
      showWinnerModal(winner);
      addHistoryEntry(winner);
      if (removeWinnerAfterSpin) {
        entries = [];
        drawRoulette(); // Redraw with no entries
      }
      updateUI();
      saveStateToLocalStorage();
      return;
    }

    isSpinning = true;
    currentWinner = null;
    updateUI();
    rouletteSVG.classList.remove('no-transition'); // Ensure transition is on

    const winnerIndex = Math.floor(Math.random() * entries.length);
    const winner = entries[winnerIndex];

    const segmentAngle = 360 / entries.length;
    const winnerSegmentMidPointAngle = (winnerIndex * segmentAngle) + (segmentAngle / 2);
    const targetFinalCssAngle = -winnerSegmentMidPointAngle; // SVG rotates clockwise for positive values
    
    // Normalize existing rotation to 0-360 range
    const currentWheelOrientation = (rotation % 360 + 360) % 360;
    // Normalize target orientation to 0-360 range
    const desiredFinalOrientation = (targetFinalCssAngle % 360 + 360) % 360;

    let adjustmentSpin = desiredFinalOrientation - currentWheelOrientation;
    // Ensure adjustmentSpin makes the wheel spin forward for the final alignment
    if (adjustmentSpin < 0) {
        adjustmentSpin += 360;
    }
    
    const fullSpinsForEffect = 5 + Math.floor(Math.random() * 3);
    const newRotationValue = rotation + (fullSpinsForEffect * 360) + adjustmentSpin;
    
    rotation = newRotationValue; // Update global rotation state
    rouletteSVG.style.transform = `rotate(${rotation}deg)`;

    setTimeout(() => {
      currentWinner = winner;
      showWinnerModal(winner);
      isSpinning = false;
      addHistoryEntry(winner);

      if (removeWinnerAfterSpin) {
        entries = entries.filter(entry => entry.id !== winner.id);
        // Redraw roulette without winner, and ensure it's snapped to its new state without animation
        rouletteSVG.classList.add('no-transition');
        rotation = targetFinalCssAngle; // Set rotation to exactly where it should be for the NEW set of entries (or current pointer)
        drawRoulette(); // Redraws with new entries, this implicitly sets transform
        rouletteSVG.style.transform = `rotate(${rotation}deg)`;
      }
      updateUI();
      saveStateToLocalStorage();
    }, 5100); // Match CSS transition duration + small buffer
  }

  // Winner Modal & Confetti
  function showWinnerModal(winner) {
    if (winnerNameDisplay) winnerNameDisplay.textContent = winner.name;
    winnerModal.classList.remove('hidden');
    triggerConfetti();
  }

  function closeWinnerModal() {
    winnerModal.classList.add('hidden');
    confettiContainer.innerHTML = ''; // Clear confetti
  }

  function triggerConfetti() {
    confettiContainer.innerHTML = ''; // Clear previous
    const confettiColors = [
      'hsl(var(--color-primary-hsl), 65%)', 
      'hsl(var(--color-secondary-hsl), 55%)',
      'hsl(200, 70%, 70%)', // Lighter blue
      'hsl(150, 60%, 60%)'  // Lighter green
    ];
    for (let i = 0; i < 100; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.width = `${Math.random() * 8 + 4}px`;
      piece.style.height = `${Math.random() * 8 + 4}px`;
      piece.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animation = `confetti-fall ${2 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards`;
      confettiContainer.appendChild(piece);
    }
  }

  // History management
  function addHistoryEntry(winner) {
    const newHistoryEntry = { 
      id: winner.id, 
      name: winner.name, 
      date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    history = [newHistoryEntry, ...history].slice(0, 50); // Keep last 50
    updateHistoryUI();
  }

  function toggleHistory() {
    isHistoryOpen = !isHistoryOpen;
    updateHistoryUI();
    saveStateToLocalStorage();
  }
  
  function clearHistory() {
    if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
        history = [];
        updateHistoryUI();
        saveStateToLocalStorage();
    }
  }

  function exportHistory(format) {
    if (history.length === 0) return;
    let content = '';
    const filename = `historico_sorteio_${new Date().toISOString().slice(0,10)}.${format}`;

    if (format === 'txt') {
      content = history.map(entry => `${entry.name} (Sorteado em: ${entry.date})`).join('\n');
    } else { // csv
      content = "Nome,Data do Sorteio\n";
      content += history.map(entry => `"${entry.name.replace(/"/g, '""')}","${entry.date}"`).join('\n');
    }

    const blob = new Blob([content], { type: format === 'txt' ? 'text/plain;charset=utf-8;' : 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Event Listeners
  function addEventListeners() {
    if (entriesTextarea) entriesTextarea.addEventListener('input', handleTextareaChange);
    if (importFileButton) importFileButton.addEventListener('click', () => fileInput.click());
    if (fileInput) fileInput.addEventListener('change', handleFileUpload);
    if (clearAllButton) clearAllButton.addEventListener('click', clearAllEntries);
    if (themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);
    if (removeWinnerToggle) removeWinnerToggle.addEventListener('change', (e) => {
      removeWinnerAfterSpin = e.target.checked;
      saveStateToLocalStorage();
    });
    if (spinButton) spinButton.addEventListener('click', handleSpin);
    if (winnerModal) winnerModal.addEventListener('click', (e) => { // Close on overlay click
        if (e.target === winnerModal) closeWinnerModal();
    });
    if (spinAgainButton) spinAgainButton.addEventListener('click', () => {
      closeWinnerModal();
      setTimeout(handleSpin, 100);
    });
    if (closeModalButton) closeModalButton.addEventListener('click', closeWinnerModal);
    if (historyToggleButton) historyToggleButton.addEventListener('click', toggleHistory);
    if (exportTxtButton) exportTxtButton.addEventListener('click', () => exportHistory('txt'));
    if (exportCsvButton) exportCsvButton.addEventListener('click', () => exportHistory('csv'));
    if (clearHistoryButton) clearHistoryButton.addEventListener('click', clearHistory);
  }

  // Start the app
  init();
});
