import type { CountdownOptions } from "../../client/utils/domManipulationUtils/countdown";
import type {
	Colour,
	Player,
	PlayerScore,
	Question,
	Session,
} from "./entities";

export interface ClientboundSocketServerEvents {
	"answers:post": (playerId: string, colours: string[]) => void;
	"countdown:start": (countdownOptions: CountdownOptions) => void;
	"countdown:stop": () => void;
	"lobby:unjoinable": () => void;
	"player:set": (player: Player) => void;
	"question:get": (question: Question) => void;
	"round:reset": () => void;
	"round:startable": () => void;
	"session:set": (session: Session) => void;
	"scoresAndBonusPoints:get": (
		playerScores: PlayerScore[],
		bonusPoints: number,
	) => void;
	"state:change": ({ state: GameState, context: TopLevelContext }) => void;
}

export interface ServerboundSocketServerEvents {
	"answers:post": (colours: Colour[]) => void;
	disconnect: () => void;
	"players:post": (name: Player["name"]) => void;
	"round:reset": () => void;
	"round:start": () => void;
}
