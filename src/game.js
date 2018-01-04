const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, stageWidth = 620
, stageHeight = 300
, gravity = 0.8
, buttons = {
    Left: 0,
    Right: 0,
    Up: 0,
    Down: 0,
    Jump: 0
}
, playerStates = {
    STANDING: 0,
    FALLING: 1,
    JUMPING: 2
}

canvas.width = stageWidth
canvas.height = stageHeight

// Loaders

const loadLevel = name =>
      fetch(`/levels/${name}.json`, {
          headers: {
              'Content-Type': 'application/json'
          }
      }).then(result => result.json())

// Events

document.addEventListener('keydown', ev => {
    if (ev.key === 'a') {
        if (!buttons.Left) buttons.Left = 1
    } else if (ev.key === 'd') {
        if (!buttons.Right) buttons.Right = 1
    } else if (ev.key === 's') {
        if (!buttons.Down) buttons.Down = 1
    } else if (ev.key === 'w') {
        if (!buttons.Up) buttons.Up = 1
    } else if (ev.key === ' ') {
        if (!buttons.Jump) buttons.Jump = 1
    }
})

document.addEventListener('keyup', ev => {
    if (ev.key === 'a') {
        if (buttons.Left) buttons.Left = 0
    } else if (ev.key === 'd') {
        if (buttons.Right) buttons.Right = 0
    } else if (ev.key === 's') {
        if (buttons.Down) buttons.Down = 0
    } else if (ev.key === 'w') {
        if (buttons.Up) buttons.Up = 0
    } else if (ev.key === ' ') {
        if (buttons.Jump) buttons.Jump = 0
    }
})

const btn = name => name in buttons && buttons[name]

const clear = () => {
    stage.fillStyle = 'black'
    stage.fillRect(0, 0, stageWidth, stageHeight)
}

const clamp = (min, max, v) =>
      v <= min ? min : v >= max ? max : v

const Player = (x, y, w, h, state=playerStates.STANDING) => ({
    x, y, w, h, state, dx: 0, dy: 0.01, health: 100
})

let player = Player(10, 10, 10, 10)
, currentRoom

const update = dt => {
    if (btn('Jump') && player.state != playerStates.JUMPING) {
        player.dy = -10
        player.state = playerStates.JUMPING
    }
    if (player.dx === 0 && btn('Right')) {
        player.dx = 4
    } else if (player.dx === 0 && btn('Left')) {
        player.dx = -4
    } else {
        player.dx = 0
    }
    player.dy += gravity
    player.x = clamp(0, stageWidth - player.w, player.x + player.dx)
    player.y = clamp(0, stageHeight - player.h, player.y + player.dy)
    if (player.y + player.h === stageHeight)
        player.state = playerStates.STANDING
}

const drawBackgroundTiles = () => {
    for (let {x1, y1, x2, y2, tile} of currentRoom.bg.data) {
        switch (tile) {
        case 'sky':
            stage.fillStyle = 'skyblue'
            break;
        case 'ground':
            stage.fillStyle = 'red'
            break;
        }
        for (let j = y1; j < y2; j++) {
            for (let i = x1; i < x2; i++) {
                stage.fillRect(i * 20, j * 20, 20, 20)
            }
        }
    }
}

const drawPlayer = dt => {
    stage.fillStyle = 'green'
    stage.fillRect(player.x, player.y, player.w, player.h)
}

const render = dt => {
    clear()
    drawBackgroundTiles()
    drawPlayer(dt)
}

Promise.all([
    loadLevel('1-1')
]).then(([levelData]) => {
    currentRoom = levelData
    const loop = (dt) => {
        update(dt)
        render(dt)
        window.requestAnimationFrame(loop)
    }
    window.requestAnimationFrame(loop)
}).catch(err => console.log(err))
