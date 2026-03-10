// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand(); // Растягиваем на весь экран

// Состояние игры
let gameState = null;
let gameBoard = document.getElementById('game-board');
let safeCount = document.getElementById('safe-count');
let minesCount = document.getElementById('mines-count');

// Кнопки
document.getElementById('new-game').addEventListener('click', newGame);
document.getElementById('close').addEventListener('click', () => tg.close());

// Загружаем новую игру
async function newGame() {
    try {
        const response = await fetch('/api/init', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: tg.initDataUnsafe?.user?.id})
        });
        
        gameState = await response.json();
        renderBoard();
        updateStats();
    } catch (error) {
        console.error('Ошибка:', error);
        tg.showAlert('Не удалось начать игру');
    }
}

// Отображаем поле
function renderBoard() {
    if (!gameState) return;
    
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.createElement('button');
            cell.className = 'cell';
            
            if (gameState.opened[i][j]) {
                cell.classList.add('opened');
                if (gameState.board[i][j] === 'mine') {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else {
                    cell.textContent = '💎';
                }
            } else {
                cell.textContent = '❓';
            }
            
            if (!gameState.game_over) {
                cell.addEventListener('click', () => makeMove(i, j));
            }
            
            gameBoard.appendChild(cell);
        }
    }
}

// Делаем ход
async function makeMove(row, col) {
    if (gameState.game_over) return;
    
    try {
        const response = await fetch('/api/move', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                row, col,
                game_state: gameState
            })
        });
        
        gameState = (await response.json()).game_state;
        renderBoard();
        
        if (gameState.game_over) {
            const result = gameState.won ? 'win' : 'lose';
            showGameOver(result);
            sendResultToBot(result);
        }
        
        updateStats();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Показываем сообщение о конце игры
function showGameOver(result) {
    const message = document.createElement('div');
    message.className = `game-over ${result}`;
    message.textContent = result === 'win' ? '🎉 ПОБЕДА! 🎉' : '💥 ВЗРЫВ! 💥';
    
    const container = document.querySelector('.container');
    container.insertBefore(message, gameBoard);
    
    setTimeout(() => message.remove(), 3000);
}

// Отправляем результат в бота
function sendResultToBot(result) {
    tg.sendData(JSON.stringify({
        action: 'game_result',
        result: result,
        score: gameState.opened_safe
    }));
}

// Обновляем статистику
function updateStats() {
    if (gameState) {
        safeCount.textContent = `${gameState.opened_safe}/12`;
    }
}

// Загружаем игру при старте
newGame();

// Обработка темы Telegram
tg.onEvent('themeChanged', function() {
    document.body.style.background = tg.themeParams.bg_color;
});
