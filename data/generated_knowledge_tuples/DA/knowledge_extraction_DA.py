import json
import os
import numpy as np

flip_back = 0
error_reported = 0
low_effort_guess = 0
total_valid_turn = 0
maybe_reserved_list = []
maybe_flipped_list = []
positive_label_set = set()
negative_label_set = set()
total_turn = 0
invalid_turn_reseaon = {}
negative_discriminative_tuples = []
reply_dict = {}
valid_reply_dict = {}

output_folder = "./"

def generate_negative_discriminative_tuples(card_set, relation, target):
	global negative_discriminative_tuples
	for card1 in card_set:
		for card2 in card_set:
			if card1 == card2:
				continue
			negative_discriminative_tuples.append((card1, card2, relation, target))

def generate_tuple_byturn(current_state, action):
	global flip_back, maybe_reserved_list, maybe_flipped_list, positive_label_set, negative_label_set, reply_dict
	reserverd_cards = set()
	flipped_cards = set()
	relation = action["relation"]
	target = action["target"]
	reply = action["reply"]
	if reply not in reply_dict:
		reply_dict[reply] = 0
	reply_dict[reply] += 1
	for card in action["board"]:
		card_id, state = card["id"], card["is_flipped"]
		assert state in [True, False]
		if current_state[card_id] != state:
			current_state[card_id] = state
			if state:
				# record flipped cards in this turn
				flipped_cards.add(card_id)
			if not state:
				# card is flipped back
				current_state[card_id] = False
				flip_back += 1
				reserverd_cards.add(card_id)
		else:
			if not state:
				reserverd_cards.add(card_id)
	tuples = []
	generate_negative_discriminative_tuples(flipped_cards, relation, target)
	generate_negative_discriminative_tuples(reserverd_cards, relation, target)
	if len(flipped_cards) > 0:
		if reply not in valid_reply_dict:
			valid_reply_dict[reply] = 0
		valid_reply_dict[reply] += 1
	else:
		if "no flipped cards" not in invalid_turn_reseaon:
			invalid_turn_reseaon["no flipped cards"] = 1
		else:
			invalid_turn_reseaon["no flipped cards"] += 1
	if reply == "MAYBE":
		# To-do: record flipped cards in this case and process them further
		maybe_flipped_list.append(len(flipped_cards))
		maybe_reserved_list.append(len(reserverd_cards))
		return current_state, tuples
	
	# extract triple-based facts
	for card1 in reserverd_cards:
		if reply == "YES":
			positive_label_set.add((card1, relation, target))
		elif reply == "NO":
			negative_label_set.add((card1, relation, target))
	for card2 in flipped_cards:
		if reply == "YES":
			negative_label_set.add((card2, relation, target))
		elif reply == "NO":
			positive_label_set.add((card2, relation, target))
	
	# extract discriminative knowledge
	for card1 in reserverd_cards:
		for card2 in flipped_cards:
			if reply == "YES":
				# reserved cards have such property (relation, target)
				tuples.append((card1, card2, relation, target))
			elif reply == "NO":
				# reserved cards don't have such property (relation, target)
				tuples.append((card2, card1, relation, target))
			# elif reply == "MAYBE":
			# 	# To do
			# 	continue
	return current_state, tuples

def analysis_action_sequence(player_action_list):
	global error_reported, low_effort_guess, total_valid_turn, total_turn
	if len(player_action_list) == 0:
		low_effort_guess += 1
		return []
	current_state = {}
	extracted_knowledge_tuples = []
	for card in player_action_list[0]["board"]:
		card_id, state = card["id"], card["is_flipped"]
		# initially, all cards is uncovered
		current_state[card_id] = False
	for action in player_action_list:
		total_turn += 1
		if action["reported"]:
			error_reported += 1
			if "reported error" not in invalid_turn_reseaon:
				invalid_turn_reseaon["reported error"] = 1
			else:
				invalid_turn_reseaon["reported error"] += 1
		else:
			total_valid_turn += 1
			current_state, tuples = generate_tuple_byturn(current_state, action)
			extracted_knowledge_tuples.extend(tuples)
	return extracted_knowledge_tuples

# filename = "samples/Match.json"
# filename = "prolific-trial_1/V2/Match_2.json"
# filename = "prolific-trial_1/V3/Match_3.json"
# f = open(filename)
# data = json.load(f)
# f.close()
# files_to_extract = ["prolific-trial_1/V2/Match_2.json", "prolific-trial_1/V3/Match_3.json"]
files_to_extract = ["Match_4.json"]
extracted_knowledge_tuples_all = []
number_game = 0
game_length = {}
for difficulty in ["EASY", "MEDIUM"]:
	game_length[difficulty] = []
low_effort_game = 0
for filename in files_to_extract:
	f = open(filename)
	data = json.load(f)
	f.close()
	for game in data:
		player1_id = game["player1"]
		player2_id = game["player2"]
		player1Actions = json.loads(game["player1Actions"])
		player2Actions = json.loads(game["player2Actions"])
		difficulty = game["difficulty"]
		# player1Card = json.loads(game["player1Card"])["id"]
		# player2Card = json.loads(game["player2Card"])["id"]
		# to-do: skip low-effort users
		if player1_id == 150 or player2_id == 150:
			continue
		if len(player1Actions) == 0 or len(player2Actions) == 0:
			low_effort_game += 1
		else:
			game_length[difficulty].append(len(player1Actions) + len(player2Actions))
		if player1_id not in [151, 173]:
			extracted_knowledge_tuples_1 = analysis_action_sequence(player1Actions)
			extracted_knowledge_tuples_all.extend(extracted_knowledge_tuples_1)
		if player2_id not in [151, 173]:
			extracted_knowledge_tuples_2 = analysis_action_sequence(player2Actions)
			extracted_knowledge_tuples_all.extend(extracted_knowledge_tuples_2)
		number_game += 1
	# print("Among {} matched games, {} errors are reported, {} cards are flipped back".format(number_game, error_reported, flip_back))
	# print("Among {} matched games,".format(number_game))
	print("Among {} matched games, {} low-effort games (one player directly guess without asking) are found".format(number_game, low_effort_game))
	# print("{} discriminitive knowledge tuples are extracted".format(len(extracted_knowledge_tuples_all)))
for difficulty in ["EASY", "MEDIUM"]:
	print("For {} {} games, the average turns are: {:.1f}".format(len(game_length[difficulty]), difficulty, np.mean(game_length[difficulty])))

# print("-" * 17)
# output_file = os.path.join(output_folder, "positive_discriminative_knowledge.txt")
# f = open(output_file, "w")
# tuple_set = set(extracted_knowledge_tuples_all)
# print("{} positive discriminitive knowledge tuples are extracted".format(len(tuple_set)))
# for tuple_ in tuple_set:
# 	f.write("%s|%s|%s|%s\n"%(tuple_[0], tuple_[1], tuple_[2], tuple_[3]))
# f.close()

# output_file = os.path.join(output_folder, "negative_discriminative_knowledge.txt")
# f = open(output_file, "w")
# tuple_set = set(negative_discriminative_tuples)
# print("{} negative discriminitive knowledge tuples are extracted".format(len(tuple_set)))
# for tuple_ in tuple_set:
# 	f.write("%s|%s|%s|%s\n"%(tuple_[0], tuple_[1], tuple_[2], tuple_[3]))
# f.close()

# output_file = os.path.join(output_folder, "positive_triples.txt")
# print("{} positive relation triples are extracted".format(len(positive_label_set)))
# f = open(output_file, "w")
# for triple in positive_label_set:
# 	f.write("%s|%s|%s\n"%(triple[0], triple[1], triple[2]))
# f.close()

# output_file = os.path.join(output_folder, "negative_triples.txt")
# print("{} negative relation triples are extracted".format(len(negative_label_set)))
# f = open(output_file, "w")
# for triple in negative_label_set:
# 	f.write("%s|%s|%s\n"%(triple[0], triple[1], triple[2]))
# f.close()
# print("-" * 17)

# print(len(data))
# print(data[1].keys())
# print(type(eval(data[0]["objects"])))
# print(eval(data[0]["objects"]))
# print((data[1]["player1Actions"]))
# tp_line = json.loads(data[1]["player1Actions"])
# relation, target, reply, reported, time, board
# print(type(tp_line[0]["board"]))
# print(tp_line[0]["reported"])
# print(data[1]["player1Actions"])
# print(data[1]["player2Actions"])
# game_ids = [item["id"] for item in eval(data[1]["objects"])]
# print(game_ids)


# print("Maybe answer occurs {} times".format(len(valid_reply_dict["MAYBE"])))
# print("Avg reserved cards for maybe: {:.2f}, flipped cards for maybe: {:.2f}".format(np.mean(maybe_reserved_list), np.mean(maybe_flipped_list)))


# print(reply_dict, sum([reply_dict[key_] for key_ in reply_dict]))
print("In total, there are {} turns after filtering malicious participants.".format(total_turn))
print("Among them, {} are invalid turns, {} are valid turns.".format(sum([invalid_turn_reseaon[key_] for key_ in invalid_turn_reseaon]), sum([valid_reply_dict[key_] for key_ in valid_reply_dict])))
print("In valid turns, reply distribution: {}".format(valid_reply_dict))

print("In invalid turns, invalid reason: {}".format(invalid_turn_reseaon))
print("In total there are {} flip back behavior".format(flip_back))




