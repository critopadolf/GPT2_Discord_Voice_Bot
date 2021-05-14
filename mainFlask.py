from flask import Flask 
from flask import request
import gpt2_run
from multiprocessing import Process, Queue

app = Flask(__name__)
outStr = Queue()
str1 = Queue()
p = Process(target=gpt2_run.run,args=(str1,outStr,))


@app.route('/gather', methods=['POST'])
def gather():

	#gin = request.values['SpeechResult']
	#server = request.json['server_key']
	print(request.values)
	str1.put(request.values)
	return "thanks"
@app.route('/p',methods=['POST'])
def pl():
	print(request)
	g = request.json['GPT2_RESULT']
	print("g:",g)
	return "p"

if __name__ == "__main__":
	print("starting process")
	p.start()
	print("process started")
	app.run(debug=True)
	#dial_numbers(DIAL_NUMBERS)