import numpy as np
import pandas as pd
import os


def load_coverage_labeling(filename):
	df = pd.read_csv(filename)
	user_status_list = df.values.tolist()
	valid_ID_set = set()
	label_dict = {}
	coverage_set = set()
	for reference_id,candidate_id,reference_statement,candidate_statement,overlap in user_status_list:
		try:
			assert overlap in ["Yes", "No", "Not Sure"]
		except:
			print(filename, reference_id, candidate_id, overlap)
		if overlap == "Yes":
			coverage_set.add((reference_id, candidate_id))
		if reference_id not in label_dict:
			label_dict[reference_id] = {}
		if candidate_id not in label_dict[reference_id]:
			label_dict[reference_id][candidate_id] = overlap
	return label_dict, coverage_set

def load_reference_validity(filename):
	df = pd.read_csv(filename)
	user_status_list = df.values.tolist()
	valid_set = set()
	total_set = set()
	for reference_id,candidate_statement,valid,Remarks in user_status_list:
		try:
			assert valid in ["Valid", "Invalid", "Not Sure"]
		except:
			print(reference_id,candidate_statement,valid,Remarks)
		total_set.add(reference_id)
		if valid == "Valid":
			valid_set.add(reference_id)
	return valid_set, total_set

def obtain_common_reference(coverage_list):
	common_reference_ids = set(coverage_list[0].keys())
	for tp_cover in coverage_list:
		tp_set = set(tp_cover.keys())
		common_reference_ids = common_reference_ids & tp_set
	for reference_id in common_reference_ids:
		first_lable = coverage_list[0][reference_id]
	return common_reference_ids

# def check_coverage_(reference_id, candidate_id, )
def check_aggrement(aggrement_list):
	agree = 0
	disagree = 0
	total = 0.0
	for opinion in aggrement_list:
		total += 1
		if opinion == "Yes":
			agree += 1
		else:
			disagree += 1
	if agree == total:
		return True
	print(aggrement_list)
	return False


def load_correctness():
	data_folder = "candidate_correctness"
	filenames = ["agathe.csv", "andy.csv", "ujwal.csv", "gaole.csv", "peide.csv"]
	valid_set_list = []
	for filename in filenames:
		df = pd.read_csv(os.path.join(data_folder, filename))
		user_status_list = df.values.tolist()
		valid_ID_set = set()
		for candidate_id,candidate_statement,correctness in user_status_list:
			try:
				assert correctness in ["Yes", "No", "Not Sure"]
			except:
				print(candidate_id,candidate_statement,correctness)
			if correctness == "Yes":
				valid_ID_set.add(candidate_id)
		valid_set_list.append(valid_ID_set)
	return valid_set_list

valid_set_list = load_correctness()
correct_candidates = valid_set_list[0] | valid_set_list[1] | valid_set_list[2] | valid_set_list[3] | valid_set_list[4]

data_folder = "coverage_labeling"
filenames = ["agathe.csv", "andy.csv", "ujwal.csv", "gaole.csv", "jie.csv"]
data_list = []
coverage_list = []
for filename in filenames:
	tp_data, coverage_set_1 = load_coverage_labeling(os.path.join(data_folder, filename))
	data_list.append(tp_data)
	coverage_list.append(coverage_set_1)
# print(len(coverage_list[0] & coverage_list[1]))
coverage_set_all = set()
for tp_cover in coverage_list:
	coverage_set_all |= tp_cover
# print(len(coverage_set_all))
all_agreed_set = set()
for reference_id, candidate_id in coverage_set_all:
	aggrement = []
	if candidate_id not in correct_candidates:
		# filter wrong candidates
		continue
	for tp_data in coverage_list:
		if reference_id in tp_data and candidate_id in tp_data[reference_id]:
			aggrement.append(tp_data[reference_id][candidate_id])
	flag = check_aggrement(aggrement_list=aggrement)
	if flag:
		all_agreed_set.add((reference_id, candidate_id))
print("After filtering wrong candidates and inconsistent agreement, there are {} reference-candidate pairs reserved".format(len(all_agreed_set)))
unique_covered_set = set()
for reference_id, candidate_id in coverage_set_all:
	unique_covered_set.add(reference_id)
# print("{} reference triples are covered".format(len(unique_covered_set)))

valid_reference_1, total_set_1 = load_reference_validity("reference_validity/agathe.csv")
valid_reference_2, total_set_2 = load_reference_validity("reference_validity/gaole.csv")
total_set = total_set_1 | total_set_2
valid_reference_all = valid_reference_1 | valid_reference_2
print("{} / {} references are valid".format(len(valid_reference_all), len(total_set)))

cover_final = len(unique_covered_set & valid_reference_all)
valid_total = len(valid_reference_all)
print("{} / {} = {:.3f} reference triples are covered".format(cover_final, valid_total, cover_final / valid_total))

def obtain_all_label_candidate_pair(data_list):
	reference_candidates = {}
	for tp_cover in data_list:
		for reference_id in tp_cover:
			if reference_id not in reference_candidates:
				reference_candidates[reference_id] = set()
			for candidate_id in tp_cover[reference_id]:
				reference_candidates[reference_id].add(candidate_id)
	return reference_candidates

reference_candidates = obtain_all_label_candidate_pair(data_list)

beyond_reference_ids = set()
go_beyond = 0
for reference_id in valid_reference_all:
	flag = False
	# if reference_id in unique_covered_set:
	# 	continue
	for candidate_id in reference_candidates[reference_id]:
		if candidate_id in correct_candidates:
			flag = True
	if flag:
		go_beyond += 1
# print("Go beyond", go_beyond)
print("There are {} valid reference triples, {} are covered".format(len(valid_reference_all), go_beyond))


gold_file = "../triples_possible_all_games.txt"
f = open(gold_file)
gold_dict = {}
triple2id = {}
id2triple = {}
index = 0
for line in f:
	tuple_ = line.strip().split("|")
	concept1, concept2, feature = tuple_
	if (concept1, concept2) not in gold_dict:
		gold_dict[(concept1, concept2)] = set()
	gold_dict[(concept1, concept2)].add(feature)
	triple2id[(concept1, concept2, feature)] = index
	id2triple[index] = (concept1, concept2, feature)
	index += 1
# print(len(gold_dict))
f.close()
# print(index)
print("There are {} correct candidates in total".format(len(correct_candidates)))
pair_set = set()
cover_triple = 0
cover_pair = {}
for reference_id in valid_reference_all:
	assert reference_id in id2triple
	concept1, concept2, feature = id2triple[reference_id]
	pair_set.add((concept1, concept2))
	if (concept1, concept2) not in cover_pair:
		cover_pair[(concept1, concept2)] = False
	flag = False
	for candidate_id in reference_candidates[reference_id]:
		if candidate_id in correct_candidates:
			flag = True
	if flag:
		cover_pair[(concept1, concept2)] = True
		cover_triple += 1
# print("There are {} valid concept pairs".format(len(pair_set)))
number_pair_cover = 0
for concept_pair in cover_pair:
	number_pair_cover += 1
print("There are {} valid concept pairs, {} are covered".format(len(pair_set), number_pair_cover))

# print("There are {} valid reference triples, {} are covered".format(len(valid_reference_all), cover_triple))
