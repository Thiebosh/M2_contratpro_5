def check_if_similar_keys(dict1, dict2):
    for key in dict1:
        if key in dict2:
            return True
    return False