import numpy as np


medium_file = "medium_game_boards.txt"
easy_file = "easy_game_boards.txt"
output_file = "easy_game_boards_filtered.txt"


def load_games(filename):
	f = open(filename)
	game_list = []
	index = 0
	concept2game = {}
	for line in f:
		line = line.strip().split("|")
		game_list.append(set(line))
		for concept in line:
			if concept not in concept2game:
				concept2game[concept] = set()
			concept2game[concept].add(index)
		index += 1
	f.close()
	return game_list, concept2game

easy_game_list, easy_concept2game = load_games(easy_file)
medium_game_list, medium_concept2game = load_games(medium_file)
reserved_easy_games = []
for game_set in easy_game_list:
	index_list = []
	flag = False
	for concept in game_set:
		if concept not in medium_concept2game:
			# at least one concept doesn't occur in medium games
			reserved_easy_games.append(game_set)
			flag = True
			break
		index_list.append(medium_concept2game[concept])
	if flag:
		continue
	tp_set = index_list[0]
	for new_set in index_list[1:]:
		tp_set = tp_set & new_set
	if len(tp_set) > 0:
		# at least one medium game covered this easy game
		continue
	else:
		reserved_easy_games.append(game_set)
print("{} among {} easy games are reserved".format(len(reserved_easy_games), len(easy_game_list)))
f = open(output_file, "w")
for game_set in reserved_easy_games:
	f.write("|".join(list(game_set)) + "\n")
f.close()