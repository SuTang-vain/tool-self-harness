import time
def wait_until(predicate,timeout,interval=0.01):
 time.sleep(timeout)
 return predicate()
