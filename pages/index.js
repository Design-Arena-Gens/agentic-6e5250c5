import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Game.module.css'

export default function Game() {
  const canvasRef = useRef(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (!gameStarted || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = 800
    canvas.height = 600

    const characters = [
      {
        name: 'Thunder',
        x: 100,
        y: 300,
        vx: 0,
        vy: 0,
        color: '#FF6B6B',
        horseColor: '#8B4513',
        selected: true
      },
      {
        name: 'Storm',
        x: 200,
        y: 300,
        vx: 0,
        vy: 0,
        color: '#4ECDC4',
        horseColor: '#A0522D',
        selected: false
      },
      {
        name: 'Lightning',
        x: 300,
        y: 300,
        vx: 0,
        vy: 0,
        color: '#FFE66D',
        horseColor: '#CD853F',
        selected: false
      },
      {
        name: 'Blaze',
        x: 400,
        y: 300,
        vx: 0,
        vy: 0,
        color: '#A8E6CF',
        horseColor: '#DEB887',
        selected: false
      }
    ]

    const obstacles = []
    const clouds = []
    let currentScore = 0
    let animationId
    let obstacleTimer = 0
    let cloudTimer = 0

    const keys = {}

    // Initialize clouds
    for (let i = 0; i < 8; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 30 + Math.random() * 40,
        speed: 0.3 + Math.random() * 0.5
      })
    }

    function drawHorseman(character) {
      const { x, y, color, horseColor, selected } = character
      const size = 30

      // Selection indicator
      if (selected) {
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, size + 10, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Horse body
      ctx.fillStyle = horseColor
      ctx.beginPath()
      ctx.ellipse(x, y + 5, 20, 15, 0, 0, Math.PI * 2)
      ctx.fill()

      // Horse head
      ctx.beginPath()
      ctx.ellipse(x + 15, y, 10, 12, 0, 0, Math.PI * 2)
      ctx.fill()

      // Wings
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.beginPath()
      ctx.ellipse(x - 10, y, 15, 8, -0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x - 10, y + 10, 15, 8, 0.3, 0, Math.PI * 2)
      ctx.fill()

      // Rider
      ctx.fillStyle = color
      // Body
      ctx.fillRect(x - 8, y - 15, 12, 15)
      // Head
      ctx.beginPath()
      ctx.arc(x - 2, y - 20, 6, 0, Math.PI * 2)
      ctx.fill()

      // Rider's cape
      ctx.fillStyle = color
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.moveTo(x - 8, y - 10)
      ctx.lineTo(x - 18, y - 5)
      ctx.lineTo(x - 15, y + 5)
      ctx.lineTo(x - 8, y)
      ctx.fill()
      ctx.globalAlpha = 1

      // Name tag
      ctx.fillStyle = '#000'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(character.name, x, y + 35)
    }

    function drawCloud(cloud) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.beginPath()
      ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2)
      ctx.arc(cloud.x + cloud.size * 0.4, cloud.y, cloud.size * 0.4, 0, Math.PI * 2)
      ctx.arc(cloud.x - cloud.size * 0.4, cloud.y, cloud.size * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }

    function drawObstacle(obstacle) {
      ctx.fillStyle = '#E74C3C'
      ctx.beginPath()
      ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y)
      ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height)
      ctx.lineTo(obstacle.x, obstacle.y + obstacle.height)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#C0392B'
      ctx.fillRect(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height, obstacle.width * 0.4, 20)
    }

    function checkCollision(character, obstacle) {
      const charSize = 30
      return (
        character.x + charSize > obstacle.x &&
        character.x - charSize < obstacle.x + obstacle.width &&
        character.y + charSize > obstacle.y &&
        character.y - charSize < obstacle.y + obstacle.height + 20
      )
    }

    function gameLoop() {
      ctx.fillStyle = '#87CEEB'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw clouds
      clouds.forEach(cloud => {
        cloud.x -= cloud.speed
        if (cloud.x + cloud.size < 0) {
          cloud.x = canvas.width + cloud.size
          cloud.y = Math.random() * canvas.height
        }
        drawCloud(cloud)
      })

      // Spawn obstacles
      obstacleTimer++
      if (obstacleTimer > 120) {
        obstacles.push({
          x: canvas.width,
          y: Math.random() * (canvas.height - 150) + 50,
          width: 40,
          height: 60,
          speed: 3 + currentScore / 500
        })
        obstacleTimer = 0
      }

      // Update obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i]
        obs.x -= obs.speed

        if (obs.x + obs.width < 0) {
          obstacles.splice(i, 1)
          currentScore += 10
          setScore(currentScore)
        } else {
          drawObstacle(obs)
        }
      }

      // Update and draw characters
      let selectedChar = characters.find(c => c.selected)

      if (selectedChar) {
        // Movement
        const speed = 4
        if (keys['ArrowUp'] || keys['w']) selectedChar.vy = -speed
        else if (keys['ArrowDown'] || keys['s']) selectedChar.vy = speed
        else selectedChar.vy = 0

        if (keys['ArrowLeft'] || keys['a']) selectedChar.vx = -speed
        else if (keys['ArrowRight'] || keys['d']) selectedChar.vx = speed
        else selectedChar.vx = 0

        selectedChar.x += selectedChar.vx
        selectedChar.y += selectedChar.vy

        // Boundaries
        selectedChar.x = Math.max(30, Math.min(canvas.width - 30, selectedChar.x))
        selectedChar.y = Math.max(30, Math.min(canvas.height - 30, selectedChar.y))

        // Check collisions
        for (let obs of obstacles) {
          if (checkCollision(selectedChar, obs)) {
            setGameOver(true)
            cancelAnimationFrame(animationId)
            return
          }
        }
      }

      characters.forEach(drawHorseman)

      // Score display
      ctx.fillStyle = '#000'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`Score: ${currentScore}`, 10, 30)

      // Controls hint
      ctx.font = '14px Arial'
      ctx.fillText('Arrow Keys/WASD: Move | 1-4: Switch Character', 10, canvas.height - 10)

      animationId = requestAnimationFrame(gameLoop)
    }

    function handleKeyDown(e) {
      keys[e.key] = true

      // Character selection
      if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1
        characters.forEach((c, i) => {
          c.selected = i === index
        })
      }
    }

    function handleKeyUp(e) {
      keys[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameStarted])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Flying Horsemen</h1>

      {!gameStarted && !gameOver && (
        <div className={styles.menu}>
          <h2>Welcome to Flying Horsemen!</h2>
          <p>Choose your flying horseman and dodge the obstacles!</p>
          <div className={styles.characters}>
            <div className={styles.character}>
              <div className={styles.charIcon} style={{background: '#FF6B6B'}}>⚡</div>
              <p>Thunder</p>
            </div>
            <div className={styles.character}>
              <div className={styles.charIcon} style={{background: '#4ECDC4'}}>🌪️</div>
              <p>Storm</p>
            </div>
            <div className={styles.character}>
              <div className={styles.charIcon} style={{background: '#FFE66D'}}>⚡</div>
              <p>Lightning</p>
            </div>
            <div className={styles.character}>
              <div className={styles.charIcon} style={{background: '#A8E6CF'}}>🔥</div>
              <p>Blaze</p>
            </div>
          </div>
          <button className={styles.startButton} onClick={() => setGameStarted(true)}>
            Start Game
          </button>
        </div>
      )}

      {gameStarted && !gameOver && (
        <canvas ref={canvasRef} className={styles.canvas}></canvas>
      )}

      {gameOver && (
        <div className={styles.gameOver}>
          <h2>Game Over!</h2>
          <p className={styles.finalScore}>Final Score: {score}</p>
          <button
            className={styles.startButton}
            onClick={() => {
              setGameOver(false)
              setScore(0)
              setGameStarted(true)
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
