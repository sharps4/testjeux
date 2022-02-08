const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const commencerBtn = document.querySelector('#commencerBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

class Joueur {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
 
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Ennemie {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particule {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction 
        this.velocity.y *= friction 
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let joueur = new Joueur(x, y, 10, 'white')
let projectiles = []
let ennemies = []
let particules = []

function init() {
    joueur = new Joueur(x, y, 10, 'white')
    projectiles = []
    ennemies = []
    particules = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
}

function spawnEnnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4

        let x
        let y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }

        ennemies.push(new Ennemie(x, y, radius, color, velocity))
    }, 1350)
}

let animationId
let score = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    joueur.draw()
    particules.forEach((particule, index) => {
        if (particule.alpha <= 0) {
            particules.splice(index, 1)
        } else {
            particule.update()
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update()


        //supprime les projectiles qui sortent de l'écran
        if (projectile.x - projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    ennemies.forEach((ennemie, index) => {
        ennemie.update()

        const dist = Math.hypot(joueur.x - ennemie.x, joueur.y - ennemie.y)

        //fin de partie
        if (dist - ennemie.radius - joueur.radius < 1){
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - ennemie.x, projectile.y - ennemie.y)

            //quand on touche les ennemies
            if (dist - ennemie.radius - projectile.radius < 1) {

                //création de particules
                for (let i = 0; i < ennemie.radius * 2; i++) {
                    particules.push(new Particule(projectile.x, projectile.y, Math.random() * 2, ennemie.color, {x: (Math.random() - 0.5) * (Math.random() *6), y: (Math.random() - 0.5) * (Math.random() *6)}))
                }

                if(ennemie.radius - 10 > 5){
                //score
                score += 100
                scoreEl.innerHTML = score
                console.log(score)


                    gsap.to(ennemie, {
                        radius: ennemie.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {
                    //score
                    score += 50
                    scoreEl.innerHTML = score

                    setTimeout(() => {
                        ennemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        })
    })
}


addEventListener('click', (event) => {
    console.log(projectiles)
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
})

commencerBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnnemies()
    modalEl.style.display = 'none'
})

