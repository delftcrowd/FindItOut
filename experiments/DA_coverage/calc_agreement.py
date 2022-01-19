import krippendorff
import pandas as pd
import os
import numpy as np

choice_dict = {"Yes": 0, "No": 1, "Not Sure":2}

def calc_common_correctness():
	data_folder = "candidate_correctness"
	filenames = ["agathe.csv", "andy.csv", "ujwal.csv", "gaole.csv", "peide.csv"]
	user_data_dict = {}
	for filename in filenames:
		user_data_dict[filename] = {}
		df = pd.read_csv(os.path.join(data_folder, filename))
		user_status_list = df.values.tolist()
		for candidate_id,candidate_statement,correctness in user_status_list:
			try:
				assert correctness in ["Yes", "No", "Not Sure"]
			except:
				print(candidate_id,candidate_statement,correctness)
			user_data_dict[filename][candidate_id] = choice_dict[correctness]
	keys_0 = set(user_data_dict[filenames[0]].keys())
	keys_1 = set(user_data_dict[filenames[1]].keys())
	keys_2 = set(user_data_dict[filenames[2]].keys())
	keys_3 = set(user_data_dict[filenames[3]].keys())
	keys_4 = set(user_data_dict[filenames[4]].keys())
	common_keys = keys_0 & keys_1 & keys_2 & keys_3 & keys_4
	for i in range(0, 5):
		keys_0 = set(user_data_dict[filenames[i]].keys())
		for j in range(0, 5):
			if i >= j:
				continue
			keys_1 = set(user_data_dict[filenames[j]].keys())
			# print(i, j, len(keys_0 & keys_1))
	print(len(common_keys))
	values_list = []
	for key_ in common_keys:
		tp_data = [0, 0, 0]
		for filename in filenames:
			# tp_data.append(user_data_dict[filename][key_])
			tp_data[user_data_dict[filename][key_]] += 1
		values_list.append(tp_data)
	values_list = np.array(values_list)
	print(values_list.shape)
	print('alpha for correctness is:', krippendorff.alpha(value_counts=values_list,level_of_measurement='nominal'))

def calc_common_coverage():
	data_folder = "coverage_labeling"
	filenames = ["agathe.csv", "andy.csv", "ujwal.csv", "gaole.csv", "jie.csv"]
	user_data_dict = {}
	for filename in filenames:
		user_data_dict[filename] = {}
		df = pd.read_csv(os.path.join(data_folder, filename))
		user_status_list = df.values.tolist()
		for reference_id,candidate_id,reference_statement,candidate_statement,overlap in user_status_list:
			try:
				assert overlap in ["Yes", "No", "Not Sure"]
			except:
				print(filename, reference_id, candidate_id, overlap)
			user_data_dict[filename][(reference_id, candidate_id)] = choice_dict[overlap]
	keys_0 = set(user_data_dict[filenames[0]].keys())
	keys_1 = set(user_data_dict[filenames[1]].keys())
	keys_2 = set(user_data_dict[filenames[2]].keys())
	keys_3 = set(user_data_dict[filenames[3]].keys())
	keys_4 = set(user_data_dict[filenames[4]].keys())
	common_keys = keys_0 & keys_1 & keys_2 & keys_3 & keys_4
	for i in range(0, 5):
		keys_0 = set(user_data_dict[filenames[i]].keys())
		for j in range(0, 5):
			if i >= j:
				continue
			keys_1 = set(user_data_dict[filenames[j]].keys())
			# print(i, j, len(keys_0 & keys_1))

	print(len(common_keys))
	values_list = []
	for key_ in common_keys:
		tp_data = []
		tp_data = [0, 0, 0]
		for filename in filenames:
			# tp_data.append(user_data_dict[filename][key_])
			tp_data[user_data_dict[filename][key_]] += 1
		values_list.append(tp_data)
		# print(key_, tp_data)
	values_list = np.array(values_list)
	print(values_list.shape)
	print('alpha for coverage is:', krippendorff.alpha(value_counts=values_list,level_of_measurement='nominal'))


calc_common_coverage()
calc_common_correctness()
