interface Player {
  socketId: string
  name: string
}

interface Question {
  question: string
  answer: string[]
  number: number
}

export type { Player, Question }
