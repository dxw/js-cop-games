import { io } from 'socket.io-client'
import { NameFormElement } from '../server/@types/ui'
import { Player, Question } from '../server/@types/models'
import { getElementById } from './utils/getElementById'

const addPlayer = async (name: string): Promise<void> => {
  socket.emit('players:post', { name })
}

const generateSocketUrl = (): string => {
  const location = window.location

  return '//' + location.host + location.pathname
}

const renderPlayerList = (): void => {
  const html = playerNames.map((name) => `<li>${name}</li>`)
  playerListElement.innerHTML = html.join('\n')
}

const renderPlayerName = (): void => {
  const text = `Name: ${player.name}`
  playerNameElement.innerText = text
}

const askAQuestion = (data: Question): void => {
  const { question, number } = data
  const questionHtml = getElementById('question')
  questionHtml.innerText = question
  const numberHtml = getElementById('number')
  numberHtml.innerText = number.toString()
}

const derenderNameForm = (): void => {
  getElementById('name-form').remove()
}

const showStartButton = (): void => {
  const button = getElementById('start-button')
  button.style.display = 'block'
}

const connectionStatusIconElement = getElementById('connection-status-icon')
const nameFormElement = getElementById('name-form') as NameFormElement
const playerListElement = getElementById('player-list')
const playerNameElement = getElementById('player-name')

let player: Player
let playerNames: string[] = []

const socket = io(generateSocketUrl())

socket.on('connect', () => {
  connectionStatusIconElement.innerText = 'Connected 🟢'
})

socket.on('disconnect', () => {
  connectionStatusIconElement.innerText = 'Disconnected 🔴'
})

socket.on('players:get', (data) => {
  playerNames = data.players
  renderPlayerList()
})

socket.on('player:set', (data) => {
  player = data.player
  renderPlayerName()
  derenderNameForm()
})

socket.on('question:get', (data) => {
  askAQuestion(data.question)
})

socket.on('game:startable', () => {
  showStartButton()
})

nameFormElement.addEventListener('submit', function async (e) {
  e.preventDefault()
  addPlayer(nameFormElement.elements.name.value).catch(e =>
    console.write('could not add player')
  )
  nameFormElement.elements.name.value = ''
})
