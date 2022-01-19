import numpy as np
import sys

def load_top_entities(filename, topk=50):
	f = open(filename)
	index = 0
	vocab_set = set()
	for line in f:
		line = line.strip().split("\t")[0]
		vocab_set.add(line.lower())
		if len(vocab_set) >= topk:
			break
	f.close()
	return vocab_set

def load_edges_with_seed(filename, seed_set, edge_list, neighbors):
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
		if word1 in seed_set and word2 in seed_set:
			edge_list.append((word1, word2, feature))
			if word1 not in neighbors:
				neighbors[word1] = {}
			if word2 not in neighbors:
				neighbors[word2] = {}
			if word2 not in neighbors[word1]:
				neighbors[word1][word2] = 1
			else:
				neighbors[word1][word2] += 1
			if word1 not in neighbors[word2]:
				neighbors[word2][word1] = 1
			else:
				neighbors[word2][word1] += 1
	return neighbors, edge_list


def find_best_neighbor(known_set, seed_set, neighbors):
	candidates = seed_set - known_set
	count_list = []
	for node in candidates:
		if node not in neighbors:
			continue
		neighbor_of_node = neighbors[node]
		edge_number = 0
		for node_ in known_set:
			if node_ in neighbor_of_node:
				edge_number += neighbor_of_node[node_]
		count_list.append((node, edge_number))
	count_list.sort(key = lambda x:x[1], reverse=True)
	# print(count_list)
	# print(count_list[0])
	return count_list[0][0]

def generate_game_for_node(node, neighbors, seed_set, game_size=8):
	known_set = set([node])
	while len(known_set) < game_size:
		cur_node = find_best_neighbor(known_set, seed_set, neighbors)
		known_set.add(cur_node)
	return known_set

def count_edges_covered(edge_list, seed_set):
	edge_number = 0
	edge_list_new = []
	for word1, word2, feature in edge_list:
		if word1 in seed_set and word2 in seed_set:
			edge_number +=1
			edge_list_new.append((word1, word2, feature))
	return edge_number, edge_list_new

seed_file = "da_concept_frequency.txt"
game_size = int(sys.argv[1])
# game_size = 8/16
topk = int(sys.argv[2])
# 640
seed_set = load_top_entities(seed_file, topk=topk)
neighbors = {}
edge_list = []
files = ['train.txt', 'validation.txt', 'truth.txt']
for file in files:
	neighbors, edge_list = load_edges_with_seed(file, seed_set, edge_list, neighbors)
print("Top-{} nodes covered {} edges in total".format(len(seed_set), len(edge_list)))
game_list = []
print(len(seed_set))
for node in seed_set:
	# print(node)
	game_set = generate_game_for_node(node, neighbors, seed_set, game_size=game_size)
	# print(count_edges_covered(edge_list, seed_set=game_set))
	game_list.append(game_set)
	print("Game generated for node {}".format(node))
# print(len(set(game_list)))
length = len(game_list)
known_index = set()
same_dict = {}
keys = []
for i,game_ in enumerate(game_list):
	if i in known_index:
		continue
	known_index.add(i)
	keys.append(i)
	same_dict[i] = set()
	for j in range(i+1, length):
		if j in known_index:
			continue
		game__ = game_list[j]
		if len(game_ & game__) == game_size:
			same_dict[i].add(j)
			known_index.add(j)
print("{} unique games generated with greedy strategy".format(len(keys)))
covered_edges = set()
filename = "games_for_size_{}-Top{}.txt".format(game_size, topk)
f_out = open(filename, "w")
for index in keys:
	game_now = game_list[index]
	f_out.write("|".join(list(game_now)) + "\n")
	edge_number, edge_list_new = count_edges_covered(edge_list, seed_set=game_now)
	covered_edges |= set(edge_list_new)
	print("Game {}, covered {} edges".format(index, edge_number))
print("{} edges are covered by {} games".format(len(covered_edges), len(keys)))
f_out.close()
