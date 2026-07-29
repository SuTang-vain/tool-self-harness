DEFAULT_TAGS=[]
class Registry:
 def __init__(self,tags=DEFAULT_TAGS): self.tags=tags
 def add(self,tag): self.tags.append(tag)
