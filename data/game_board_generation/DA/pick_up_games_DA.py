import numpy as np


def load_all_games(filename):
	f = open(filename)
	game_list = []
	for line in f:
		game_list.append(set(line.strip().split("|")))
	f.close()
	return game_list

def remove_redundant_games(game_list, threshold=2):
	length = len(game_list)
	known_set = set()
	reserved_game_index_list = []
	for i in range(length):
		if i in known_set:
			continue
		known_set.add(i)
		reserved_game_index_list.append(i)
		for j in range(i+1, length):
			if len(game_list[i] & game_list[j]) > threshold:
				known_set.add(j)
	return reserved_game_index_list


# input_file = "games_for_size_8-Top640.txt"
# output_file = "games_for_size_8-Top640-selected.txt"
input_file = "games_for_size_16-Top640.txt"
output_file = "games_for_size_16-Top640-selected.txt"
game_list = load_all_games(input_file)
reserved_game_index_list = remove_redundant_games(game_list, threshold=6)
f_out = open(output_file, "w")
for game_index in reserved_game_index_list:
	game_now = game_list[game_index]
	f_out.write("|".join(list(game_now)) + "\n")
f_out.close()