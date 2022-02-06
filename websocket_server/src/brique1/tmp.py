from jsonHandler import JsonHandler

class dbMock:
    def find_one(self, *_):
        return {
            "specs": {
                "root": {
                    "screen": [
                    ]
                }
            }
        }

handler = JsonHandler({"db": dbMock()}, "")
print(handler.data)

# add_element : return true
print("add element")
result = handler.add_element("root/screen".split("/"), {"name": "some"})
print("retour : ", result, " - ", handler.data)
result = handler.add_element("root/screen/0".split("/"), {'style': {'color': '#6897bb', 'align': 'center'}})
print("retour : ", result, " - ", handler.data)

# add_element : return false
result = handler.add_element("root/screen/5".split("/"), {'style': {'color': '#6897bb', 'align': 'center'}})
print("retour : ", result, " - ", handler.data)
result = handler.add_element("root/screen/0".split("/"), {'style': {'color': '#6897bb', 'align': 'center'}})
print("retour : ", result, " - ", handler.data)


# # modify_element : return true
print("modify element")
result = handler.modify_element("root/screen/0/name".split("/"), "other")
print("retour : ", result, " - ", handler.data)

# # modify_element : return false
result = handler.modify_element("root/screen/5/name".split("/"), "other")
print("retour : ", result, " - ", handler.data)
result = handler.modify_element("root/screen".split("/"), [])
print("retour : ", result, " - ", handler.data)
result = handler.modify_element("root/screen/5/style".split("/"), {'color': '#6897bb', 'align': 'center'})
print("retour : ", result, " - ", handler.data)


# remove_element : return true
print("delete element")
result = handler.remove_element("root/screen/0".split("/"), "style")
print("retour : ", result, " - ", handler.data)
result = handler.remove_element("root/screen".split("/"), "0")
print("retour : ", result, " - ", handler.data)

# remove_element: return false
result = handler.remove_element("root/screen/5".split("/"), "name")
print("retour : ", result, " - ", handler.data)
