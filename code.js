// code.js - CSC102 Creative JavaScript Game: Meteor Dodge
// Author: Evan Ketchum
// Use the left and right arrow keys to dodge falling meteors.

(function () {
    "use strict";

    var gameArea = document.getElementById("gameArea");
    var player = document.getElementById("player");
    var startButton = document.getElementById("startBtn");
    var restartButton = document.getElementById("restartBtn");
    var scoreDisplay = document.getElementById("score");
    var livesDisplay = document.getElementById("lives");
    var resultArea = document.getElementById("resultArea");

    var pressedKeys = {};
    var animationId = null;
    var lastFrameTime = 0;
    var meteorTimer = 0;

    var game = {
        running: false,
        score: 0,
        lives: 3,
        playerX: 0,
        meteors: []
    };

    window.addEventListener("keydown", function (event) {
        if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
            event.preventDefault();
            pressedKeys[event.code] = true;
        }
    });

    window.addEventListener("keyup", function (event) {
        pressedKeys[event.code] = false;
    });

    function updateDisplays() {
        scoreDisplay.textContent = game.score;
        livesDisplay.textContent = game.lives;
    }

    function placePlayerInCenter() {
        game.playerX = (gameArea.clientWidth - player.offsetWidth) / 2;
        player.style.left = game.playerX + "px";
    }

    function clearMeteors() {
        game.meteors.forEach(function (meteor) {
            meteor.element.remove();
        });
        game.meteors = [];
    }

    function createMeteor() {
        var size = 18 + Math.random() * 24;
        var meteorElement = document.createElement("div");
        var maximumX = gameArea.clientWidth - size;
        var meteor = {
            element: meteorElement,
            x: Math.random() * maximumX,
            y: -size,
            size: size,
            speed: 115 + Math.random() * 115 + Math.min(game.score * 0.35, 110)
        };

        meteorElement.className = "meteor";
        meteorElement.style.width = size + "px";
        meteorElement.style.height = size + "px";
        meteorElement.style.left = meteor.x + "px";
        meteorElement.style.top = meteor.y + "px";
        gameArea.appendChild(meteorElement);
        game.meteors.push(meteor);
    }

    function meteorHitsPlayer(meteor) {
        var playerTop = player.offsetTop;
        var playerWidth = player.offsetWidth;
        var playerHeight = player.offsetHeight;

        return game.playerX < meteor.x + meteor.size &&
            game.playerX + playerWidth > meteor.x &&
            playerTop < meteor.y + meteor.size &&
            playerTop + playerHeight > meteor.y;
    }

    function loseLife(index) {
        game.meteors[index].element.remove();
        game.meteors.splice(index, 1);
        game.lives -= 1;
        updateDisplays();

        if (game.lives <= 0) {
            finishGame();
        }
    }

    function movePlayer(deltaSeconds) {
        var moveSpeed = 310;
        var maximumX = gameArea.clientWidth - player.offsetWidth;

        if (pressedKeys.ArrowLeft) {
            game.playerX -= moveSpeed * deltaSeconds;
        }
        if (pressedKeys.ArrowRight) {
            game.playerX += moveSpeed * deltaSeconds;
        }

        game.playerX = Math.max(0, Math.min(maximumX, game.playerX));
        player.style.left = game.playerX + "px";
    }

    function updateMeteors(deltaSeconds) {
        for (var index = game.meteors.length - 1; index >= 0; index -= 1) {
            var meteor = game.meteors[index];
            meteor.y += meteor.speed * deltaSeconds;
            meteor.element.style.top = meteor.y + "px";

            if (meteorHitsPlayer(meteor)) {
                loseLife(index);
                continue;
            }

            if (meteor.y > gameArea.clientHeight) {
                meteor.element.remove();
                game.meteors.splice(index, 1);
                game.score += 10;
                updateDisplays();
            }
        }
    }

    function gameLoop(time) {
        if (!game.running) {
            return;
        }

        var deltaSeconds = Math.min((time - lastFrameTime) / 1000, 0.05);
        lastFrameTime = time;
        meteorTimer += deltaSeconds;

        movePlayer(deltaSeconds);
        updateMeteors(deltaSeconds);

        // Meteors appear faster as the score gets higher.
        var spawnDelay = Math.max(0.35, 0.9 - game.score / 500);
        if (meteorTimer >= spawnDelay) {
            createMeteor();
            meteorTimer = 0;
        }

        animationId = window.requestAnimationFrame(gameLoop);
    }

    function startGame() {
        clearMeteors();
        game.running = true;
        game.score = 0;
        game.lives = 3;
        meteorTimer = 0;
        updateDisplays();
        placePlayerInCenter();
        resultArea.textContent = "Good luck!";
        startButton.disabled = true;
        restartButton.disabled = false;
        gameArea.focus();
        lastFrameTime = performance.now();
        animationId = window.requestAnimationFrame(gameLoop);
    }

    function finishGame() {
        game.running = false;
        window.cancelAnimationFrame(animationId);
        clearMeteors();
        resultArea.textContent = "Game over! Your final score was " + game.score + ".";
        startButton.disabled = false;
        restartButton.disabled = false;
    }

    startButton.addEventListener("click", startGame);
    restartButton.addEventListener("click", startGame);
    window.addEventListener("resize", placePlayerInCenter);
    placePlayerInCenter();
}());
