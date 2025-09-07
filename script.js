// 获取DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const gameOverElement = document.getElementById('game-over');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');

// 游戏配置
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// 游戏状态
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameSpeed = 150; // 毫秒
let gameInterval;
let isPaused = false;
let isGameOver = false;

// 初始化游戏
function initGame() {
    // 初始化蛇
    snake = [
        { x: 3, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 1 }
    ];
    
    // 初始化方向
    direction = 'right';
    nextDirection = 'right';
    
    // 初始化分数
    score = 0;
    scoreElement.textContent = score;
    
    // 生成食物
    generateFood();
    
    // 重置游戏状态
    isPaused = false;
    isGameOver = false;
    gameOverElement.classList.add('hidden');
    
    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // 清除之前的游戏循环
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    
    // 重置速度滑块
    speedSlider.value = gameSpeed;
    updateSpeedText(gameSpeed);
    
    // 绘制初始状态
    draw();
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
        
        // 检查食物是否在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头与身体使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#388E3C'; // 深绿色蛇头
        } else {
            ctx.fillStyle = '#4CAF50'; // 绿色蛇身
        }
        
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        
        // 绘制边框
        ctx.strokeStyle = '#E8F5E9';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    
    // 绘制食物
    ctx.fillStyle = '#FF5252'; // 红色食物
    ctx.beginPath();
    const radius = gridSize / 2;
    const centerX = food.x * gridSize + radius;
    const centerY = food.y * gridSize + radius;
    ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
}

// 移动蛇
function moveSnake() {
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 检查是否吃到食物
    const ateFood = head.x === food.x && head.y === food.y;
    
    // 将新头部添加到蛇身前面
    snake.unshift(head);
    
    // 如果吃到食物，增加分数并生成新食物
    if (ateFood) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        
        // 不再自动调整游戏速度，由用户通过滑块控制
    } else {
        // 如果没吃到食物，移除蛇尾
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true;
    }
    
    // 检查是否撞到自己（从第二个身体部分开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameInterval = null;
    isGameOver = true;
    
    // 显示游戏结束界面
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
    
    // 更新按钮状态
    startBtn.disabled = true;
    pauseBtn.disabled = true;
}

// 游戏循环
function gameLoop() {
    if (isPaused || isGameOver) return;
    
    moveSnake();
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    draw();
}

// 重启游戏循环（用于改变游戏速度）
function restartGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// 开始游戏
function startGame() {
    if (!gameInterval && !isGameOver) {
        gameInterval = setInterval(gameLoop, gameSpeed);
        isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        pauseBtn.textContent = '暂停';
    }
}

// 暂停/继续游戏
function togglePause() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseBtn.textContent = '继续';
    } else {
        pauseBtn.textContent = '暂停';
    }
}

// 重新开始游戏
function restartGame() {
    initGame();
}

// 键盘控制
function handleKeydown(e) {
    // 防止方向键滚动页面
    if ([37, 38, 39, 40, 32].includes(e.keyCode)) {
        e.preventDefault();
    }
    
    // 空格键暂停/继续
    if (e.keyCode === 32) {
        if (!gameInterval && !isGameOver) {
            startGame();
        } else {
            togglePause();
        }
        return;
    }
    
    // 如果游戏未开始或已结束，不处理方向键
    if (!gameInterval || isGameOver) return;
    
    // 防止180度转弯（蛇不能直接掉头）
    switch (e.keyCode) {
        // 左箭头
        case 37:
            if (direction !== 'right') nextDirection = 'left';
            break;
        // 上箭头
        case 38:
            if (direction !== 'down') nextDirection = 'up';
            break;
        // 右箭头
        case 39:
            if (direction !== 'left') nextDirection = 'right';
            break;
        // 下箭头
        case 40:
            if (direction !== 'up') nextDirection = 'down';
            break;
    }
}

// 添加触摸滑动控制（适配移动设备）
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY || !gameInterval || isGameOver) return;
    
    e.preventDefault();
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // 确定主要滑动方向（水平或垂直）
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 0 && direction !== 'right') {
            // 向左滑动
            nextDirection = 'left';
        } else if (diffX < 0 && direction !== 'left') {
            // 向右滑动
            nextDirection = 'right';
        }
    } else {
        // 垂直滑动
        if (diffY > 0 && direction !== 'down') {
            // 向上滑动
            nextDirection = 'up';
        } else if (diffY < 0 && direction !== 'up') {
            // 向下滑动
            nextDirection = 'down';
        }
    }
    
    // 重置触摸起始点
    touchStartX = 0;
    touchStartY = 0;
}

// 更新速度文本
function updateSpeedText(speed) {
    let speedText;
    if (speed >= 170) {
        speedText = '慢速';
    } else if (speed >= 130) {
        speedText = '中等';
    } else if (speed >= 90) {
        speedText = '快速';
    } else {
        speedText = '极速';
    }
    speedValue.textContent = speedText;
}

// 处理速度滑块变化
function handleSpeedChange() {
    const newSpeed = parseInt(speedSlider.value);
    gameSpeed = newSpeed;
    updateSpeedText(newSpeed);
    
    // 如果游戏正在运行，重新启动游戏循环以应用新速度
    if (gameInterval && !isPaused && !isGameOver) {
        restartGameLoop();
    }
}

// 事件监听
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);
playAgainBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', handleKeydown);
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
speedSlider.addEventListener('input', handleSpeedChange);

// 初始化游戏
initGame();
// 初始化速度文本
updateSpeedText(gameSpeed);