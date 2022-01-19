import json
import pandas as pd
import numpy as np

def load_useful_set():
	filename = "50percent_usefulness-label.csv"
	df = pd.read_csv(filename)
	user_status_list = df.values.tolist()
	valid_ID_set = set()
	# question_candidates = {}
	ID2statement = {}
	for ID,question,concept,candidate_statement,SimCSE_score,usefulness in user_status_list:
		try:
			assert usefulness in ["Yes", "No"]
		except:
			print(ID,usefulness)
		# q_id = ID.strip().split("|")[0]
		# if q_id not in question_candidates:
		# 	question_candidates[q_id] = []
		# question_candidates[q_id].append(ID)
		if usefulness == "Yes":
			valid_ID_set.add(ID)
		ID2statement[ID] = (concept, candidate_statement)
	return valid_ID_set, ID2statement

def load_relevance():
	filename = "relevance_labeling.csv"
	df = pd.read_csv(filename)
	user_status_list = df.values.tolist()
	valid_ID_set = set()
	question_candidates = {}
	for ID,question,concept,candidate_statement,SimCSE_score,relevant,correct in user_status_list:
		try:
			assert relevant in ["Yes", "No"]
			assert correct in ["Yes", "No"]
		except:
			print(ID,relevant, correct)
		q_id = ID.strip().split("|")[0]
		if q_id not in question_candidates:
			question_candidates[q_id] = []
		question_candidates[q_id].append(ID)
		if relevant == "Yes" and correct == "Yes":
			valid_ID_set.add(ID)
			ID2statement[ID] = (concept, candidate_statement)
	return valid_ID_set, question_candidates

useful_ID_set, ID2statement = load_useful_set()
print("{} candidate statements are useful for question-choice pairs".format(len(useful_ID_set)))
relevant_correct_ID_set, question_candidates = load_relevance()
print("{} candidate statements are both relevant and correct for question-choice pairs".format(len(relevant_correct_ID_set)))
# useful_ID_set = load_useful_set()
# print("{} candidate statements are useful for question-choice pairs".format(useful_ID_set))
import sys
threshold = int(sys.argv[1])
number = 0
useful_question = 0
relevant_question = 0
useful_list = []
relevant_list = []
choice_list = []
useful_choice_list = []
relevant_choice_list = []
valid_useful_IDs = set()
total_relevant = 0
total_useful = 0
for q_id in question_candidates:
	if len(question_candidates[q_id]) >= threshold:
		number += 1
		useful_number = 0
		relevant_correct_number = 0
		choice_set = set()
		relevant_choice_set = set()
		useful_choice_set = set()
		for ID in question_candidates[q_id]:
			choice = ID.strip().split("|")[1]
			choice_set.add(choice)
			if ID in relevant_correct_ID_set:
				relevant_correct_number += 1
				relevant_choice_set.add(choice)
				if ID in useful_ID_set:
					useful_number += 1
					valid_useful_IDs.add(ID)
					useful_choice_set.add(choice)
		if relevant_correct_number > 0:
			relevant_question += 1
		if useful_number > 0:
			useful_question += 1
		useful_choice_list.append(len(useful_choice_set))
		relevant_choice_list.append(len(relevant_choice_set))
		choice_list.append(len(choice_set))
		useful_list.append(useful_number)
		relevant_list.append(relevant_correct_number)
		total_relevant += relevant_correct_number
		total_useful += useful_number
print(f"there are {len(question_candidates)} questions in total, we only look at {len(useful_list)} questions")
print(f"{number} questions have at least {threshold} candidates for question-choice pairs")
print(f"{relevant_question} questions have at least one relevant knowledge tuples, {useful_question}  questions have at least one useful knowledge tuples")
print("In total, there are {} relevant candidates, {} useful candidates".format(total_relevant, total_useful))
print("In average, there are {:.2f} relevant candidates per question, {:.2f} useful candidates per question, {:.2f} choices per question".format(np.mean(relevant_list), np.mean(useful_list), np.mean(choice_list)))
print("In average, there are {:.2f} relevant choices per question, {:.2f} useful choices per question".format(np.mean(relevant_choice_list), np.mean(useful_choice_list)))

print(len(useful_ID_set))
concept_set = set()
negative_statement = 0
concept2statement = {}
for ID in valid_useful_IDs:
	concept, statement = ID2statement[ID]
	if "not" in statement:
		negative_statement += 1
		# continue
	concept_set.add(concept)
	# f_out.write(f"{statement}\n")
	if concept not in concept2statement:
		concept2statement[concept] = set()
	concept2statement[concept].add(statement)
print("{} unique concepts are reserved".format(len(concept_set)))
print("{} negative statements".format(negative_statement))

# f_out = open("useful_statements_to_check.txt", "w")
# for concept in concept2statement:
# 	for statement in concept2statement[concept]:
# 		f_out.write(statement + "\n")
# f_out.close()

# f_out = open("concepts_to_check.txt", "w")
# for concept in concept_set:
# 	f_out.write("%s\n"%(concept))
# f_out.close()






