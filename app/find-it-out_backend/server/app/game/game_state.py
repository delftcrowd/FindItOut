from statemachine import StateMachine, State


class GameState(StateMachine):
    asker_ask_guess = State('asker_ask_guess', value=1, initial=True)
    replier_reply = State('replier_reply', value=2)
    asker_flip = State('asker_flip', value=3)
    replier_bonus = State('replier_bonus', value=4)
    endgame = State('endgame', value=5)
    dead = State('dead', value=6)

    ask = asker_ask_guess.to(replier_reply)
    retry = replier_reply.to(asker_ask_guess)
    reply = replier_reply.to(asker_flip)
    end_turn = asker_flip.to(asker_ask_guess)
    guess = asker_ask_guess.to(replier_bonus) | asker_flip.to(replier_bonus)
    end_game = replier_bonus.to(endgame)
    forfeit_game = asker_ask_guess.to(endgame) | replier_reply.to(endgame) | asker_flip.to(endgame) | replier_bonus.to(
        endgame)
    kill_game = asker_ask_guess.to(dead) | replier_reply.to(dead) | asker_flip.to(dead) | replier_bonus.to(
        dead) | endgame.to(dead)
    save_game = endgame.to(dead)

    def is_asker_turn(self):
        return int(self.current_state.value) % 2
