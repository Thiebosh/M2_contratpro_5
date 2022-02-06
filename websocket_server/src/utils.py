import io
import pickle

def dumpObject(obj):
    obj_buffer = io.BytesIO()
    pickle.dump(obj, obj_buffer)
    obj_buffer.seek(0)
    return pickle.load(obj_buffer)