import numpy


def load_edges_with_seed(filename, edge_list):
	f = open(filename)
	for line in f:
		# total += 1
		line = line.strip().split(",")
		word1 = line[0]
		word2 = line[1]
		feature = line[2]
		label = line[3]
		if label == "0":
			continue
		edge_list.append((word1, word2, feature))
	return edge_list

def count_edges_covered(edge_list, seed_set):
	edge_number = 0
	edge_list_new = []
	for word1, word2, feature in edge_list:
		if word1 in seed_set and word2 in seed_set:
			edge_number +=1
			edge_list_new.append((word1, word2, feature))
	return edge_number, edge_list_new


edge_list = []
files = ['train.txt', 'validation.txt', 'truth.txt']
for file in files:
	edge_list = load_edges_with_seed(file, edge_list)


filename = "games_for_size_8-Top640-selected.txt"
f = open(filename)
edge_covered = set()
number_game = 0
for line in f:
	number_game += 1
	seed_set = set(line.strip().split("|"))
	edge_number, edge_list_new = count_edges_covered(edge_list, seed_set)
	edge_covered |= set(edge_list_new)
f.close()
filename = "games_for_size_16-Top640-selected.txt"
f = open(filename)
for line in f:
	number_game += 1
	seed_set = set(line.strip().split("|"))
	edge_number, edge_list_new = count_edges_covered(edge_list, seed_set)
	edge_covered |= set(edge_list_new)
f.close()
print("{} edges covered with {} games".format(len(edge_covered), number_game))