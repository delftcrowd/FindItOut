import sys
import numpy as np
import random
import json

import argparse
parser = argparse.ArgumentParser()

parser.add_argument('--game_size', default=16, type=int)
parser.add_argument('--threshold', default=1, type=int)
parser.add_argument('--output_file', default=None, type=str)
parser.add_argument('--filter_medium', action='store_true')
args = parser.parse_args()

def init_seed(number=7):
	random.seed(number)
	np.random.seed(number)

init_seed()
game_size = args.game_size
threshold = args.threshold
output_file = args.output_file
filter_medim = args.filter_medium


reserved_entities = set()
valid_entity = 0
f = open("csqa_valid_entities.txt")
for line in f:
	line = line.strip().split("\t")
	reserved_entities.add(line[0])
	valid_entity += 1
print("{} entities reserved, {} are single word".format(len(reserved_entities), valid_entity))
cover_q_concept = []
cover_q_choices = []
cover_list = []
if filter_medim:
	medium_covered_questions = set()
	f = open("clip_games/used_questions.txt")
	for line in f:
		medium_covered_questions.add(line.strip())
	f.close()
	print("{} questions have been covered by medium games".format(len(medium_covered_questions)))
f = open("valid_csqa_questions.jsonl")
question_concepts = {}
neighbors = {}
for line in f:
	tp_obj = json.loads(line)
	q_id = tp_obj["id"]
	q_concept = tp_obj["question"]["question_concept"]
	overlap_concepts = []
	if q_concept in reserved_entities:
		cover_q_concept.append(1.0)
		overlap_concepts.append(q_concept)
	else:
		cover_q_concept.append(0.0)
	candidates = [item["text"] for item in tp_obj["question"]["choices"]]
	tp_cover = 0
	for cand in candidates:
		if cand in reserved_entities:
			tp_cover += 1
			overlap_concepts.append(cand)
	cover_q_choices.append(tp_cover)
	if filter_medim:
		if q_id not in medium_covered_questions:
			question_concepts[q_id] = overlap_concepts
	else:
		question_concepts[q_id] = overlap_concepts
f.close()
if filter_medim:
	print("{} questions are reserved".format(len(question_concepts)))
assert len(cover_q_choices) == len(cover_q_concept)


question2clip = {}


def calc_question_overlap(question_concepts):
	# we can define the similarity with different functions
	# such as overlapped concepts, PMI
	question_sim = {}
	for q_id in question_concepts:
		question_sim[q_id] = {}
		for q_id_ in question_concepts:
			if q_id_ == q_id:
				# question_sim[q_id][q_id_] = len(question_concepts[q_id])
				# don't record sim with self
				continue
			question_sim[q_id][q_id_] = len(set(question_concepts[q_id]) & set(question_concepts[q_id_]))
	return question_sim

def check_candidates(question_concepts, candidates, game_size=16):
	clip_set = set()
	for q_id in candidates:
		for concept in question_concepts[q_id]:
			clip_set.add(concept)
	if len(clip_set) < game_size:
		return False, len(clip_set)
	return True, len(clip_set)

question2clip = {}

question_sim = calc_question_overlap(question_concepts)
possible_seed_question = set(question_concepts.keys())
# possible_seed_question = set()
# for q_id in question_sim:
# 	candidates = set()
# 	candidates.add(q_id)
# 	for q_id_ in question_sim[q_id]:
# 		if question_sim[q_id][q_id_] >= threshold:
# 			candidates.add(q_id_)
# 	flag, length = check_candidates(question_concepts, candidates, game_size)
# 	if flag:
# 		# print(q_id, length)
# 		possible_seed_question.add(q_id)
# print("{} questions are possible to form {} size games".format(len(possible_seed_question), game_size))

def fullfil_connection(q_id, tp_clip, threshold=1):
	global question_sim
	assert q_id in question_sim
	for q_id_ in tp_clip:
		if question_sim[q_id][q_id_] < threshold:
			return False
	return True

from copy import deepcopy

def search_for_best_q(initial_game_set, candidates, tp_clip):
	global question_sim, question_concepts, game_size, threshold
	# while True
	possible_candidates = set()
	for q_id in candidates:
		if q_id in tp_clip:
			continue
		if fullfil_connection(q_id, tp_clip, threshold):
			possible_candidates.add(q_id)
	if len(possible_candidates) == 0:
		# there is no candidates fullfil our requirement
		return initial_game_set, tp_clip
	tp_list = []
	for q_id in possible_candidates:
		connection =  sum([question_sim[q_id][q_id_] for q_id_ in tp_clip])
		tp_list.append((q_id, connection))
	tp_list.sort(key=lambda x:x[1], reverse=True)
	best_q_id = tp_list[0][0]
	clip_new = deepcopy(tp_clip)
	clip_new.append(best_q_id)
	tp_game_set = deepcopy(initial_game_set)
	for tp_item in question_concepts[best_q_id]:
		tp_game_set.add(tp_item)
	if len(tp_game_set) >= game_size:
		return tp_game_set, clip_new
	game_set, clip_now = search_for_best_q(tp_game_set, possible_candidates, clip_new)
	if len(game_set) >= game_size:
		return game_set, clip_now
	# there is no candidates fullfil our requirement
	return initial_game_set, tp_clip


def generate_game_for_question(q_id):
	global question_sim, used_questions, possible_seed_question, question_concepts, game_size
	tp_clip = [q_id]
	game_set = set(question_concepts[q_id])
	generated_game_set, generated_clip = search_for_best_q(game_set, possible_seed_question - used_questions, tp_clip)
	return generated_game_set, generated_clip

def generate_game_from_clip(generated_clip):
	global question_concepts, game_size
	game_set = set()
	# used_q_ids = []
	for q_id in generated_clip:
		for concept in question_concepts[q_id]:
			if len(game_set) >= game_size:
				break
			game_set.add(concept)
	return game_set

def find_covered_question(known_q_ids, game_set):
	global question_concepts
	for q_id in question_concepts:
		if q_id in known_q_ids:
			continue
		tp_set = set(question_concepts[q_id])
		# print("tp_set", tp_set)
		# print("game_set", game_set)
		diff_set = tp_set - game_set
		if len(diff_set) == 0:
			# this question has been covered by current game
			known_q_ids.add(q_id)
	return known_q_ids

used_questions = set()
game_list = []
for q_id in possible_seed_question:
	generated_game_set, generated_clip = generate_game_for_question(q_id)
	if len(generated_game_set) < game_size:
		# print("It's impossible to generate a valid game with question {} as seed".format(q_id))
		continue
	else:
		# print(generated_game_set)
		# print(generated_clip)
		# print(len(generated_game_set), len(generated_clip))
		if len(generated_game_set) == game_size:
			game_set = generated_game_set
		else:
			game_set = generate_game_from_clip(generated_clip)
		# with the clip, we generate a game with specific size
		used_questions = find_covered_question(used_questions, generated_game_set)
		# then filter out all games that have been covered by this game
		game_list.append(game_set)
		if game_size == 16 and len(game_list) >= 70:
			# to control the cost, we generate at most 70 medium games
			break



known_index = set()
same_dict = {}
keys = []
for i,game_ in enumerate(game_list):
	if i in known_index:
		continue
	known_index.add(i)
	keys.append(i)
	same_dict[i] = set()
	for j in range(i+1, len(game_list)):
		if j in known_index:
			continue
		game__ = game_list[j]
		if len(game_ & game__) == game_size:
			same_dict[i].add(j)
			known_index.add(j)
print("{} unique games generated with clip-based strategy".format(len(keys)))
# covered_edges = set()
# output_file = sys.argv[3]
f_out = open(output_file, "w")
for index in keys:
	game_now = game_list[index]
	f_out.write("|".join(list(game_now)) + "\n")
	# edge_number, edge_list_new = count_edges_covered(edge_list, seed_set=game_now)
	# covered_edges |= set(edge_list_new)
	# print("Game {}, covered {} edges".format(index, edge_number))
# print("{} edges are covered by {} games".format(len(covered_edges), len(keys)))
f_out.close()

if game_size == 16 and not filter_medim:
	# record all covered questions in medium game boards
	print("Record {} questions covered to {}".format(len(used_questions), "clip_games/used_questions.txt"))
	f = open("clip_games/used_questions.txt", "w")
	for q_id in used_questions:
		f.write("%s\n"%q_id)
	f.close()
# output_file = sys.argv[2]
# f = open("games_csqa/medium_game_boards.txt", "w")
# f = open(output_file, "w")
# for game_set in game_list:
# 	tp_game = "|".join(list(game_set))
# 	f.write("%s\n"%(tp_game))
# f.close()


# reserved_questions = set(question_concepts.keys()) - used_questions
# f = open("games_csqa/reserved_questions.txt", "w")
# for q_id in reserved_questions:
# 	f.write("%s\n"%q_id)
# f.close()

