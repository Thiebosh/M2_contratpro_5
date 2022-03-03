import json

COLLECTION_PROJECTS = "projects"

class RenderPage():
    def __init__(self, partners, project_name) -> None:
        self.partners = partners
        self.project_name = project_name

        aggregation = [
            {
                "$match": {
                    "name": self.project_name
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "session": 1,
                }
            },
            {
                "$replaceRoot": {
                    "newRoot": "$session"
                }
            }
        ]
        session = self.partners["db"].aggregate_list(COLLECTION_PROJECTS, aggregation)[0]
        print(session)
        if not self.partners["renderer"].set_session(json.dumps(session)):
            raise Exception("RenderPage - PHP - session not setted")


    def close(self):
        session = self.partners["renderer"].get_session()

        filter_q = {
            "name": self.project_name
        }
        update_q = {
            "$set": {
                "session": json.loads(session)
            }
        }

        result = self.partners["db"].update_one(COLLECTION_PROJECTS, filter_q, update_q)
        print(f"{self.project_name} - Mongo - Project session {'well' if result else 'not'} updated")


    def page(self, page):
        return self.partners["renderer"].get_project_page(self.project_name, page)
