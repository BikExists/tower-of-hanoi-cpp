/**
 * ============================================================================
 * Tower of Hanoi - Interactive Engine & DSA Visualizer
 * Core logic: State management, Visual Simulator, Call Stack Tracer,
 * Recursion Tree Generator, C++ Line-by-Line Tracing, Web Audio synthesis.
 * ============================================================================
 */

(function () {
    'use strict';

    // ---------------- Global State ----------------
    const state = {
        n: 3,
        rods: { A: [], B: [], C: [] },
        history: [], // For undo in manual mode or step tracking
        mode: 'auto', // 'auto' | 'manual'
        
        // Auto solver state
        solutionSteps: [], // List of { disk, from, to, stackSnapshot, lineId, nodeIndex }
        currentStep: 0,
        isPlaying: false,
        playInterval: null,
        speed: 1.0,

        // Manual mode state
        selectedRod: null,
        manualMovesCount: 0,
        manualStartTime: null,
        manualTimerInterval: null,

        // Settings
        soundEnabled: true,
        theme: 'dark'
    };

    // ---------------- Web Audio API (Synthesizer) ----------------
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playTone(freq, duration = 0.1, type = 'sine') {
        if (!state.soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio not allowed or failed
        }
    }

    function playSoundMove() {
        playTone(480, 0.12, 'sine');
    }

    function playSoundError() {
        playTone(180, 0.2, 'sawtooth');
    }

    function playSoundSuccess() {
        setTimeout(() => playTone(523.25, 0.15, 'triangle'), 0);
        setTimeout(() => playTone(659.25, 0.15, 'triangle'), 150);
        setTimeout(() => playTone(783.99, 0.25, 'triangle'), 300);
    }

    // ---------------- DOM Element References ----------------
    const dom = {
        diskCountSelect: document.getElementById('diskCountSelect'),
        modeAutoBtn: document.getElementById('modeAutoBtn'),
        modeManualBtn: document.getElementById('modeManualBtn'),
        solverControlsGroup: document.getElementById('solverControlsGroup'),
        manualControlsGroup: document.getElementById('manualControlsGroup'),
        speedControlGroup: document.getElementById('speedControlGroup'),
        speedSlider: document.getElementById('speedSlider'),
        speedValue: document.getElementById('speedValue'),
        playPauseBtn: document.getElementById('playPauseBtn'),
        stepPrevBtn: document.getElementById('stepPrevBtn'),
        stepNextBtn: document.getElementById('stepNextBtn'),
        resetBtn: document.getElementById('resetBtn'),
        resetManualBtn: document.getElementById('resetManualBtn'),
        undoMoveBtn: document.getElementById('undoMoveBtn'),
        manualTimer: document.getElementById('manualTimer'),
        currentMoveDisplay: document.getElementById('currentMoveDisplay'),
        optimalMovesDisplay: document.getElementById('optimalMovesDisplay'),
        statusBanner: document.getElementById('statusBanner'),
        statusText: document.getElementById('statusText'),
        hanoiProgressBar: document.getElementById('hanoiProgressBar'),
        rodA: document.getElementById('rodColA'),
        rodB: document.getElementById('rodColB'),
        rodC: document.getElementById('rodColC'),
        stackA: document.getElementById('stackA'),
        stackB: document.getElementById('stackB'),
        stackC: document.getElementById('stackC'),
        callStackContainer: document.getElementById('callStackContainer'),
        currentDepthVal: document.getElementById('currentDepthVal'),
        maxDepthVal: document.getElementById('maxDepthVal'),
        recursionTreeWrapper: document.getElementById('recursionTreeWrapper'),
        treeVisitedCount: document.getElementById('treeVisitedCount'),
        treeTotalNodes: document.getElementById('treeTotalNodes'),
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        themeIcon: document.getElementById('themeIcon'),
        soundToggleBtn: document.getElementById('soundToggleBtn'),
        soundIcon: document.getElementById('soundIcon'),
        copyCodeBtn: document.getElementById('copyCodeBtn'),
        customNInput: document.getElementById('customNInput'),
        calculateNBtn: document.getElementById('calculateNBtn'),
        calcMovesVal: document.getElementById('calcMovesVal'),
        calcTime1SecVal: document.getElementById('calcTime1SecVal'),
        calcTime1GhzVal: document.getElementById('calcTime1GhzVal')
    };

    // ---------------- Solver & Call Stack Generator ----------------
    /**
     * Generates all discrete moves and call-stack states for n disks.
     */
    function generateSolution(n) {
        const moves = [];
        const virtualStack = [];
        let nodeCounter = 0;

        function solve(diskN, from, to, aux, depth) {
            nodeCounter++;
            const currentNodeId = nodeCounter;

            // Push function activation record
            const frame = {
                id: currentNodeId,
                n: diskN,
                from,
                to,
                aux,
                depth,
                state: diskN === 1 ? 'Base Case Move' : 'Subproblem 1: Moving (n-1) to Aux'
            };
            virtualStack.push(frame);

            if (diskN === 1) {
                // Record single move
                moves.push({
                    disk: 1,
                    from: from,
                    to: to,
                    stackSnapshot: JSON.parse(JSON.stringify(virtualStack)),
                    codeLine: 'line-base-move',
                    nodeId: currentNodeId,
                    explanation: `Base Case (n=1): Move disk 1 directly from [${from}] to [${to}]`
                });
                virtualStack.pop();
                return;
            }

            // Step 1: Recursive call to move (n-1) disks to aux
            solve(diskN - 1, from, aux, to, depth + 1);

            // Step 2: Move disk n
            frame.state = `Moving Disk ${diskN} from ${from} to ${to}`;
            moves.push({
                disk: diskN,
                from: from,
                to: to,
                stackSnapshot: JSON.parse(JSON.stringify(virtualStack)),
                codeLine: 'line-move-n',
                nodeId: currentNodeId,
                explanation: `Step 2: Move largest disk ${diskN} from [${from}] to [${to}]`
            });

            // Step 3: Recursive call to move (n-1) disks from aux to to
            frame.state = 'Subproblem 2: Moving (n-1) from Aux to Dest';
            solve(diskN - 1, aux, to, from, depth + 1);

            // Pop activation record
            virtualStack.pop();
        }

        solve(n, 'A', 'C', 'B', 1);
        return { moves, totalNodes: nodeCounter };
    }

    // ---------------- Initialization ----------------
    function initGame() {
        pauseAuto();
        state.n = parseInt(dom.diskCountSelect.value, 10);
        const optimal = Math.pow(2, state.n) - 1;
        dom.optimalMovesDisplay.textContent = optimal;
        dom.maxDepthVal.textContent = state.n;

        // Initialize rods
        state.rods.A = [];
        state.rods.B = [];
        state.rods.C = [];
        for (let i = state.n; i >= 1; i--) {
            state.rods.A.push(i);
        }

        state.history = [];
        state.selectedRod = null;

        if (state.mode === 'auto') {
            const result = generateSolution(state.n);
            state.solutionSteps = result.moves;
            state.currentStep = 0;
            dom.currentMoveDisplay.textContent = '0';
            updateProgressBar(0, optimal);
            updateStatus(`Puzzle initialized with ${state.n} disks. Optimal moves: ${optimal}. Ready!`, 'info');
            clearCodeHighlight();
            renderCallStack([]);
            buildRecursionTree(state.n);
        } else {
            state.manualMovesCount = 0;
            dom.currentMoveDisplay.textContent = '0';
            updateProgressBar(0, optimal);
            updateStatus('Manual Mode: Click rod A to pick top disk, then click target rod to drop!', 'info');
            startManualTimer();
        }

        renderRods();
        updateButtonsState();
    }

    // ---------------- Rods & Disks Rendering ----------------
    function renderRods() {
        ['A', 'B', 'C'].forEach(rod => {
            const stackEl = dom['stack' + rod];
            stackEl.innerHTML = '';
            const disks = state.rods[rod];

            disks.forEach((diskNum, index) => {
                const diskDiv = document.createElement('div');
                diskDiv.className = `disk disk-${diskNum}`;
                diskDiv.textContent = diskNum;
                diskDiv.dataset.disk = diskNum;
                diskDiv.dataset.rod = rod;

                // Only the top disk is interactive
                const isTop = index === disks.length - 1;
                if (isTop) {
                    diskDiv.setAttribute('draggable', state.mode === 'manual');
                    diskDiv.title = `Disk ${diskNum} (Top of Rod ${rod})`;
                } else {
                    diskDiv.setAttribute('draggable', 'false');
                }

                // If selected in manual mode
                if (state.selectedRod === rod && isTop) {
                    diskDiv.classList.add('disk-selected');
                }

                stackEl.appendChild(diskDiv);
            });

            // Update rod container styles
            const rodCol = dom['rod' + rod];
            rodCol.classList.remove('selected-rod', 'valid-target');
            if (state.selectedRod === rod) {
                rodCol.classList.add('selected-rod');
            } else if (state.selectedRod && isValidMove(state.selectedRod, rod)) {
                rodCol.classList.add('valid-target');
            }
        });
    }

    // ---------------- Manual Play Logic ----------------
    function handleRodClick(rodName) {
        if (state.mode !== 'manual') return;

        // If no rod currently selected, pick up from this rod
        if (!state.selectedRod) {
            if (state.rods[rodName].length === 0) {
                updateStatus(`Rod ${rodName} is empty! Pick from a rod with disks.`, 'error');
                playSoundError();
                return;
            }
            state.selectedRod = rodName;
            playSoundMove();
            updateStatus(`Selected top disk from Rod ${rodName}. Now click target rod to place it.`, 'info');
            renderRods();
        } else {
            // A rod was already selected
            const fromRod = state.selectedRod;
            const toRod = rodName;

            if (fromRod === toRod) {
                // Deselect
                state.selectedRod = null;
                updateStatus('Deselected disk.', 'info');
                renderRods();
                return;
            }

            if (isValidMove(fromRod, toRod)) {
                executeManualMove(fromRod, toRod);
            } else {
                const movingDisk = state.rods[fromRod][state.rods[fromRod].length - 1];
                const topTargetDisk = state.rods[toRod][state.rods[toRod].length - 1];
                updateStatus(`❌ Invalid Move! Disk ${movingDisk} cannot be placed on smaller Disk ${topTargetDisk}.`, 'error');
                playSoundError();
            }
        }
    }

    function isValidMove(fromRod, toRod) {
        if (!fromRod || !toRod) return false;
        const sourceStack = state.rods[fromRod];
        const destStack = state.rods[toRod];
        if (sourceStack.length === 0) return false;
        if (destStack.length === 0) return true;

        const movingDisk = sourceStack[sourceStack.length - 1];
        const topDestDisk = destStack[destStack.length - 1];
        return movingDisk < topDestDisk;
    }

    function executeManualMove(fromRod, toRod) {
        const disk = state.rods[fromRod].pop();
        state.rods[toRod].push(disk);

        state.history.push({ from: fromRod, to: toRod, disk });
        state.manualMovesCount++;
        state.selectedRod = null;

        dom.currentMoveDisplay.textContent = state.manualMovesCount;
        const optimal = Math.pow(2, state.n) - 1;
        updateProgressBar(state.manualMovesCount, optimal);
        playSoundMove();

        renderRods();

        // Check Win Condition
        if (state.rods.C.length === state.n) {
            stopManualTimer();
            playSoundSuccess();
            if (state.manualMovesCount === optimal) {
                updateStatus(`🎉 PERFECTION! Solved in exactly ${state.manualMovesCount} optimal moves!`, 'success');
            } else {
                updateStatus(`🏆 Solved in ${state.manualMovesCount} moves! (Optimal was ${optimal} moves). Try matching optimal!`, 'success');
            }
        } else {
            updateStatus(`Moved disk ${disk} from [${fromRod}] to [${toRod}]. (${state.manualMovesCount} moves)`, 'info');
        }
    }

    function undoManualMove() {
        if (state.history.length === 0) {
            updateStatus('No moves to undo.', 'info');
            return;
        }
        const lastMove = state.history.pop();
        state.rods[lastMove.to].pop();
        state.rods[lastMove.from].push(lastMove.disk);
        state.manualMovesCount--;
        dom.currentMoveDisplay.textContent = state.manualMovesCount;
        state.selectedRod = null;
        playSoundMove();
        renderRods();
        updateStatus(`Undid move: disk ${lastMove.disk} returned to [${lastMove.from}].`, 'info');
    }

    // Drag and Drop support
    function setupDragAndDrop() {
        ['A', 'B', 'C'].forEach(rod => {
            const rodCol = dom['rod' + rod];

            rodCol.addEventListener('dragover', (e) => {
                if (state.mode !== 'manual') return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            rodCol.addEventListener('drop', (e) => {
                if (state.mode !== 'manual') return;
                e.preventDefault();
                const fromRod = e.dataTransfer.getData('text/plain');
                if (fromRod && fromRod !== rod) {
                    if (isValidMove(fromRod, rod)) {
                        executeManualMove(fromRod, rod);
                    } else {
                        playSoundError();
                        updateStatus('Cannot drop larger disk on top of a smaller disk!', 'error');
                    }
                }
            });
        });

        document.addEventListener('dragstart', (e) => {
            if (state.mode !== 'manual') return;
            const diskEl = e.target.closest('.disk');
            if (!diskEl) return;
            const fromRod = diskEl.dataset.rod;
            const diskNum = parseInt(diskEl.dataset.disk, 10);
            const topDisk = state.rods[fromRod][state.rods[fromRod].length - 1];

            if (diskNum !== topDisk) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.setData('text/plain', fromRod);
            state.selectedRod = fromRod;
            renderRods();
        });

        document.addEventListener('dragend', () => {
            if (state.mode === 'manual' && state.selectedRod) {
                state.selectedRod = null;
                renderRods();
            }
        });
    }

    // ---------------- Timer Logic ----------------
    function startManualTimer() {
        stopManualTimer();
        state.manualStartTime = Date.now();
        dom.manualTimer.textContent = '00:00';
        state.manualTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - state.manualStartTime) / 1000);
            const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const secs = String(elapsed % 60).padStart(2, '0');
            dom.manualTimer.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function stopManualTimer() {
        if (state.manualTimerInterval) {
            clearInterval(state.manualTimerInterval);
            state.manualTimerInterval = null;
        }
    }

    // ---------------- Auto-Solver Step Logic ----------------
    function stepForward() {
        if (state.currentStep >= state.solutionSteps.length) {
            pauseAuto();
            updateStatus('Algorithm finished! All disks transferred successfully.', 'success');
            playSoundSuccess();
            return;
        }

        const step = state.solutionSteps[state.currentStep];
        const disk = state.rods[step.from].pop();
        state.rods[step.to].push(disk);

        state.currentStep++;
        dom.currentMoveDisplay.textContent = state.currentStep;
        updateProgressBar(state.currentStep, state.solutionSteps.length);

        renderRods();
        renderCallStack(step.stackSnapshot);
        highlightCodeLine(step.codeLine);
        highlightTreeNode(step.nodeId);
        updateStatus(step.explanation, 'info');
        playSoundMove();
        updateButtonsState();
    }

    function stepBackward() {
        if (state.currentStep <= 0) return;

        state.currentStep--;
        const step = state.solutionSteps[state.currentStep];
        // Reverse move
        const disk = state.rods[step.to].pop();
        state.rods[step.from].push(disk);

        dom.currentMoveDisplay.textContent = state.currentStep;
        updateProgressBar(state.currentStep, state.solutionSteps.length);

        renderRods();

        if (state.currentStep > 0) {
            const prevStep = state.solutionSteps[state.currentStep - 1];
            renderCallStack(prevStep.stackSnapshot);
            highlightCodeLine(prevStep.codeLine);
            highlightTreeNode(prevStep.nodeId);
            updateStatus(prevStep.explanation, 'info');
        } else {
            renderCallStack([]);
            clearCodeHighlight();
            highlightTreeNode(null);
            updateStatus('Reset to start position.', 'info');
        }

        playSoundMove();
        updateButtonsState();
    }

    function togglePlayAuto() {
        if (state.isPlaying) {
            pauseAuto();
        } else {
            playAuto();
        }
    }

    function playAuto() {
        if (state.currentStep >= state.solutionSteps.length) {
            initGame();
        }
        state.isPlaying = true;
        dom.playPauseBtn.textContent = '⏸️ Pause';
        dom.playPauseBtn.classList.replace('btn-primary', 'btn-secondary');

        const delay = Math.max(250, 1200 / state.speed);
        state.playInterval = setInterval(() => {
            if (state.currentStep < state.solutionSteps.length) {
                stepForward();
            } else {
                pauseAuto();
            }
        }, delay);
    }

    function pauseAuto() {
        state.isPlaying = false;
        if (state.playInterval) {
            clearInterval(state.playInterval);
            state.playInterval = null;
        }
        dom.playPauseBtn.textContent = '▶️ Play';
        dom.playPauseBtn.classList.replace('btn-secondary', 'btn-primary');
    }

    function updateButtonsState() {
        if (state.mode === 'auto') {
            dom.stepPrevBtn.disabled = state.currentStep <= 0;
            dom.stepNextBtn.disabled = state.currentStep >= state.solutionSteps.length;
        }
    }

    // ---------------- Visual Call Stack Rendering ----------------
    function renderCallStack(stackFrames) {
        dom.callStackContainer.innerHTML = '';
        dom.currentDepthVal.textContent = stackFrames.length;

        if (stackFrames.length === 0) {
            dom.callStackContainer.innerHTML = '<div class="stack-empty-placeholder">Call stack is empty. Click Play/Next to begin execution.</div>';
            return;
        }

        stackFrames.forEach((frame, idx) => {
            const isTop = idx === stackFrames.length - 1;
            const frameDiv = document.createElement('div');
            frameDiv.className = `stack-frame ${isTop ? 'active-frame' : ''}`;

            frameDiv.innerHTML = `
                <div class="frame-func-name">
                    ${isTop ? '👉 ' : ''}towerOfHanoi(n=${frame.n}, from='${frame.from}', to='${frame.to}', aux='${frame.aux}')
                </div>
                <div class="frame-params">
                    <span>Depth: ${frame.depth}</span>
                    <span>•</span>
                    <span>Role: [${frame.from}] &rarr; [${frame.to}]</span>
                </div>
                <div class="frame-state">
                    Status: <strong>${frame.state}</strong>
                </div>
            `;

            dom.callStackContainer.appendChild(frameDiv);
        });
    }

    // ---------------- Recursion Tree Rendering ----------------
    function buildRecursionTree(n) {
        dom.recursionTreeWrapper.innerHTML = '';
        if (n > 4) {
            dom.recursionTreeWrapper.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 20px;">
                    <p>Tree rendering is optimized for <strong>n &le; 4</strong> (${Math.pow(2, n + 1) - 1} total recursive calls for n=${n} would clutter screen).</p>
                    <p style="margin-top: 8px;">Select <strong>3 Disks</strong> to trace the complete tree step-by-step!</p>
                </div>
            `;
            dom.treeVisitedCount.textContent = '0';
            dom.treeTotalNodes.textContent = Math.pow(2, n) - 1;
            return;
        }

        // For n <= 4, generate the full binary tree structure
        let nodeIdCounter = 0;
        const levels = [];

        function constructTreeNodes(diskN, from, to, aux, depth) {
            nodeIdCounter++;
            const id = nodeIdCounter;
            const nodeObj = {
                id,
                n: diskN,
                label: `H(${diskN},${from},${to})`,
                depth
            };

            if (!levels[depth]) levels[depth] = [];
            levels[depth].push(nodeObj);

            if (diskN > 1) {
                constructTreeNodes(diskN - 1, from, aux, to, depth + 1);
                constructTreeNodes(diskN - 1, aux, to, from, depth + 1);
            }
        }

        constructTreeNodes(n, 'A', 'C', 'B', 0);
        dom.treeTotalNodes.textContent = Math.pow(2, n) - 1;
        dom.treeVisitedCount.textContent = '0';

        levels.forEach((levelNodes) => {
            const levelDiv = document.createElement('div');
            levelDiv.className = 'tree-level';

            levelNodes.forEach(node => {
                const nodeDiv = document.createElement('div');
                nodeDiv.className = 'tree-node pending';
                nodeDiv.id = `tree-node-${node.id}`;
                nodeDiv.textContent = node.label;
                nodeDiv.title = `Call: towerOfHanoi(n=${node.n})`;
                levelDiv.appendChild(nodeDiv);
            });

            dom.recursionTreeWrapper.appendChild(levelDiv);
        });
    }

    function highlightTreeNode(nodeId) {
        const nodes = document.querySelectorAll('.tree-node');
        nodes.forEach(node => node.classList.remove('active'));

        if (!nodeId) return;
        const activeNode = document.getElementById(`tree-node-${nodeId}`);
        if (activeNode) {
            activeNode.classList.remove('pending');
            activeNode.classList.add('active', 'completed');
            dom.treeVisitedCount.textContent = state.currentStep;
        }
    }

    // ---------------- C++ Line Highlighting ----------------
    function highlightCodeLine(lineId) {
        clearCodeHighlight();
        if (!lineId) return;
        const targetLine = document.getElementById(lineId);
        if (targetLine) {
            targetLine.classList.add('active-line');
            targetLine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function clearCodeHighlight() {
        document.querySelectorAll('.code-line.active-line').forEach(line => {
            line.classList.remove('active-line');
        });
    }

    // ---------------- UI Helpers ----------------
    function updateStatus(message, type = 'info') {
        dom.statusText.textContent = message;
        dom.statusBanner.className = `status-banner ${type}`;
        dom.statusBanner.querySelector('.status-icon').textContent =
            type === 'success' ? '🎉' : type === 'error' ? '⚠️' : '💡';
    }

    function updateProgressBar(current, total) {
        const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
        dom.hanoiProgressBar.style.width = `${percent}%`;
    }

    // ---------------- Event Listeners ----------------
    function setupEventListeners() {
        // Disk Count Change
        dom.diskCountSelect.addEventListener('change', () => {
            initGame();
        });

        // Mode Switching
        dom.modeAutoBtn.addEventListener('click', () => {
            state.mode = 'auto';
            dom.modeAutoBtn.classList.add('active');
            dom.modeManualBtn.classList.remove('active');
            dom.solverControlsGroup.style.display = 'flex';
            dom.manualControlsGroup.style.display = 'none';
            dom.speedControlGroup.style.display = 'flex';
            stopManualTimer();
            initGame();
        });

        dom.modeManualBtn.addEventListener('click', () => {
            state.mode = 'manual';
            dom.modeManualBtn.classList.add('active');
            dom.modeAutoBtn.classList.remove('active');
            dom.solverControlsGroup.style.display = 'none';
            dom.manualControlsGroup.style.display = 'flex';
            dom.speedControlGroup.style.display = 'none';
            pauseAuto();
            initGame();
        });

        // Rod clicks
        dom.rodA.addEventListener('click', () => handleRodClick('A'));
        dom.rodB.addEventListener('click', () => handleRodClick('B'));
        dom.rodC.addEventListener('click', () => handleRodClick('C'));

        // Solver buttons
        dom.playPauseBtn.addEventListener('click', togglePlayAuto);
        dom.stepNextBtn.addEventListener('click', () => {
            pauseAuto();
            stepForward();
        });
        dom.stepPrevBtn.addEventListener('click', () => {
            pauseAuto();
            stepBackward();
        });
        dom.resetBtn.addEventListener('click', () => {
            pauseAuto();
            initGame();
        });

        // Manual mode buttons
        dom.undoMoveBtn.addEventListener('click', undoManualMove);
        dom.resetManualBtn.addEventListener('click', initGame);

        // Speed Slider
        dom.speedSlider.addEventListener('input', (e) => {
            state.speed = parseFloat(e.target.value);
            dom.speedValue.textContent = `${state.speed.toFixed(2)}x`;
            if (state.isPlaying) {
                pauseAuto();
                playAuto();
            }
        });

        // Theme Toggle
        dom.themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            dom.themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        });

        // Sound Toggle
        dom.soundToggleBtn.addEventListener('click', () => {
            state.soundEnabled = !state.soundEnabled;
            dom.soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
            if (state.soundEnabled) playTone(440, 0.1);
        });

        // Copy C++ Code Button
        dom.copyCodeBtn.addEventListener('click', () => {
            const cppCode = `#include <iostream>
using namespace std;

void towerOfHanoi(int n, char from_rod, char to_rod, char aux_rod) {
    if (n == 1) {
        cout << "Move disk 1 from " << from_rod << " to " << to_rod << endl;
        return;
    }
    towerOfHanoi(n - 1, from_rod, aux_rod, to_rod);
    cout << "Move disk " << n << " from " << from_rod << " to " << to_rod << endl;
    towerOfHanoi(n - 1, aux_rod, to_rod, from_rod);
}

int main() {
    int n = 3;
    towerOfHanoi(n, 'A', 'C', 'B');
    return 0;
}`;
            navigator.clipboard.writeText(cppCode).then(() => {
                const originalText = dom.copyCodeBtn.textContent;
                dom.copyCodeBtn.textContent = '✅ Copied!';
                setTimeout(() => dom.copyCodeBtn.textContent = originalText, 2000);
            }).catch(() => {
                alert('Could not copy code to clipboard.');
            });
        });

        // Code Tabs Switching
        document.querySelectorAll('.code-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.code-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.code-tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const targetId = btn.getAttribute('data-tab');
                const targetContent = document.getElementById(targetId);
                if (targetContent) targetContent.classList.add('active');
            });
        });

        // Accordion for Viva Questions
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.closest('.accordion-item');
                const isOpen = item.classList.contains('open');
                // Optional: close other items for clean single accordion
                document.querySelectorAll('.accordion-item').forEach(it => it.classList.remove('open'));
                if (!isOpen) {
                    item.classList.add('open');
                }
            });
        });

        // Real-world Time Calculator
        dom.calculateNBtn.addEventListener('click', computeCustomNTime);
        dom.customNInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') computeCustomNTime();
        });

        // Setup Drag & Drop
        setupDragAndDrop();
    }

    // ---------------- Real-world Time Calculator ----------------
    function computeCustomNTime() {
        const val = parseInt(dom.customNInput.value, 10);
        if (isNaN(val) || val < 1 || val > 64) {
            alert('Please enter a valid number of disks between 1 and 64.');
            return;
        }

        // Use BigInt for accurate large numbers up to 2^64 - 1
        const big2 = 2n;
        const totalMoves = (big2 ** BigInt(val)) - 1n;
        dom.calcMovesVal.textContent = totalMoves.toLocaleString();

        // Time at 1 move per second
        dom.calcTime1SecVal.textContent = formatDuration(totalMoves);

        // Time at 1 GHz CPU (10^9 operations/moves per second)
        const secondsAtGhz = Number(totalMoves) / 1e9;
        if (val <= 30) {
            dom.calcTime1GhzVal.textContent = `${secondsAtGhz.toFixed(6)} seconds`;
        } else {
            dom.calcTime1GhzVal.textContent = formatDuration(BigInt(Math.floor(secondsAtGhz)));
        }
    }

    function formatDuration(totalSecondsBig) {
        if (totalSecondsBig < 60n) return `${totalSecondsBig} seconds`;
        const minutes = totalSecondsBig / 60n;
        if (minutes < 60n) return `~${minutes} minutes`;
        const hours = minutes / 60n;
        if (hours < 24n) return `~${hours} hours`;
        const days = hours / 24n;
        if (days < 365n) return `~${days} days`;
        const years = days / 365n;
        if (years < 1000n) return `~${years.toLocaleString()} years`;
        if (years < 1000000n) return `~${(Number(years) / 1000).toFixed(1)} thousand years`;
        if (years < 1000000000n) return `~${(Number(years) / 1e6).toFixed(1)} million years`;
        return `~${(Number(years) / 1e9).toFixed(1)} billion years! (Cosmic scale)`;
    }

    // ---------------- Interactive Quiz Engine ----------------
    const quizData = [
        {
            question: "1. For 4 disks, what is the minimum number of moves required to solve Tower of Hanoi?",
            options: [
                "7 moves",
                "15 moves",
                "16 moves",
                "31 moves"
            ],
            correct: 1,
            explanation: "Formula M(n) = 2ⁿ - 1. For n = 4: 2⁴ - 1 = 16 - 1 = 15 moves."
        },
        {
            question: "2. What is the Space Complexity of the recursive Tower of Hanoi algorithm?",
            options: [
                "O(2ⁿ) because 2ⁿ moves are made",
                "O(1) because no extra arrays are allocated",
                "O(n) due to the maximum depth of the runtime call stack",
                "O(n²) due to nested function calls"
            ],
            correct: 2,
            explanation: "Auxiliary space is O(n). Although total moves are O(2ⁿ), only at most n activation records exist simultaneously on the call stack at any point in time."
        },
        {
            question: "3. In towerOfHanoi(n-1, from_rod, aux_rod, to_rod), what role is played by to_rod?",
            options: [
                "It serves as the destination for the (n-1) disks",
                "It serves as a temporary helper / auxiliary rod",
                "It remains completely untouched during the call",
                "It stores the largest disk"
            ],
            correct: 1,
            explanation: "In the first recursive call, the goal is to transfer (n-1) disks to aux_rod, so to_rod acts as the temporary helper (auxiliary) peg."
        },
        {
            question: "4. What is the Recurrence Relation for Tower of Hanoi?",
            options: [
                "T(n) = T(n-1) + n",
                "T(n) = 2T(n/2) + O(1)",
                "T(n) = 2T(n-1) + 1",
                "T(n) = T(n-1) + T(n-2)"
            ],
            correct: 2,
            explanation: "T(n) = 2T(n-1) + 1: We solve two subproblems of size (n-1), plus 1 constant-time move for the largest disk."
        },
        {
            question: "5. What traversal of the recursion tree outputs the exact sequence of disk moves?",
            options: [
                "In-order Traversal (Left, Root, Right)",
                "Pre-order Traversal (Root, Left, Right)",
                "Post-order Traversal (Left, Right, Root)",
                "Level-order / BFS Traversal"
            ],
            correct: 0,
            explanation: "In-order traversal! First subproblem 1 runs (Left), then the current disk move is printed (Root), then subproblem 2 runs (Right)."
        }
    ];

    let quizScore = 0;
    const answeredQuestions = new Set();

    function renderQuiz() {
        const container = document.getElementById('quizQuestionsContainer');
        container.innerHTML = '';
        quizScore = 0;
        answeredQuestions.clear();
        document.getElementById('quizScore').textContent = '0';
        document.getElementById('quizFeedbackMsg').textContent = 'Answer the questions above to verify your understanding!';

        quizData.forEach((item, qIdx) => {
            const card = document.createElement('div');
            card.className = 'quiz-question-card';
            card.id = `quiz-card-${qIdx}`;

            const qTitle = document.createElement('div');
            qTitle.className = 'question-text';
            qTitle.textContent = item.question;
            card.appendChild(qTitle);

            const optionsList = document.createElement('div');
            optionsList.className = 'options-list';

            item.options.forEach((optText, optIdx) => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerHTML = `<span><strong>${String.fromCharCode(65 + optIdx)}.</strong></span> <span>${optText}</span>`;
                btn.addEventListener('click', () => handleQuizOptionClick(qIdx, optIdx, btn));
                optionsList.appendChild(btn);
            });

            card.appendChild(optionsList);
            container.appendChild(card);
        });
    }

    function handleQuizOptionClick(qIdx, selectedOptIdx, selectedBtn) {
        if (answeredQuestions.has(qIdx)) return;
        answeredQuestions.add(qIdx);

        const item = quizData[qIdx];
        const card = document.getElementById(`quiz-card-${qIdx}`);
        const allButtons = card.querySelectorAll('.option-btn');

        // Disable all buttons for this question
        allButtons.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === item.correct) {
                btn.classList.add('correct');
            }
        });

        if (selectedOptIdx === item.correct) {
            quizScore++;
            document.getElementById('quizScore').textContent = quizScore;
            playSoundSuccess();
        } else {
            selectedBtn.classList.add('incorrect');
            playSoundError();
        }

        // Add explanation box
        const expDiv = document.createElement('div');
        expDiv.className = 'quiz-explanation';
        expDiv.innerHTML = `<strong>💡 Explanation:</strong> ${item.explanation}`;
        card.appendChild(expDiv);

        if (answeredQuestions.size === quizData.length) {
            const feedbackEl = document.getElementById('quizFeedbackMsg');
            if (quizScore === 5) {
                feedbackEl.textContent = '🌟 Outstanding! 5/5! You have mastered Tower of Hanoi for your DSA exams!';
                feedbackEl.style.color = '#10b981';
            } else if (quizScore >= 3) {
                feedbackEl.textContent = `👍 Well done! You scored ${quizScore}/5. Review the explanations above to achieve 100%!`;
                feedbackEl.style.color = '#38bdf8';
            } else {
                feedbackEl.textContent = `📚 You scored ${quizScore}/5. Review Section 04 (Math & Proofs) and retry!`;
                feedbackEl.style.color = '#f59e0b';
            }
        }
    }

    document.getElementById('resetQuizBtn').addEventListener('click', renderQuiz);

    // ---------------- Bootstrap ----------------
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
        initGame();
        renderQuiz();
        computeCustomNTime();
    });

})();
