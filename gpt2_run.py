#https://huggingface.co/blog/how-to-generate
import os
import requests
import torch
from transformers import TFGPT2LMHeadModel, GPT2Tokenizer
from collections import deque
from multiprocessing import Process, Queue
from datetime import datetime
import json
url = "http://127.0.0.1:3000/"
paragraph = deque(maxlen=2)
def run(inp, outString):
    #tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    #model = TFGPT2LMHeadModel.from_pretrained("gpt2", pad_token_id=tokenizer.eos_token_id)
    tokenizer = GPT2Tokenizer.from_pretrained("ATLA_GPT2", from_pt=True)
    model = TFGPT2LMHeadModel.from_pretrained("ATLA_GPT2",from_pt=True, pad_token_id=tokenizer.eos_token_id)
    stop_token = tokenizer.encode('\n', return_tensors='tf')
    while(True):
        i = ""
        server_key = ''
        while(inp.empty()):
            pass
        while(not inp.empty()):
            tmp = inp.get()
            server_key = tmp['server_key']
            i += tmp['SpeechResult']
        '''
        #Collect total input from memory
        #Currently throws an error when using beams
        st = ''
        for s in paragraph:
        	st += s
        i = st + i
        '''
        input_ids = tokenizer.encode(i, return_tensors='tf') # Batch size 1

        # set no_repeat_ngram_size to 2
        '''
        beam_output = model.generate(
            input_ids, 
            num_beams=3, 
            no_repeat_ngram_size=2, 
            early_stopping=True,
            s ='\n'
        )
        '''
        
        beam_output = model.generate(
            input_ids, 
            do_sample=True, 
            max_length=50, 
            top_k=50
        )
        
        '''
        beam_output = model.generate(
            input_ids, 
            do_sample=True, 
            max_length=50, 
            top_p=0.92, 
            top_k=0
        )
        '''
        #max_length=len(i) + 30, 
        
        '''
        beam_output = model.generate(
            input_ids
        )
        '''
        #print("Output:\n" + 100 * '-')
        #print(tokenizer.decode(beam_output[0], skip_special_tokens=True))
        out = (tokenizer.decode(beam_output[0], skip_special_tokens=False))
        paragraph.append(out)
        out = out[len(i):len(out)]
        outString.put(out)
        data = {"GPT2_RESULT": out,"server_key":server_key}
        print(data)
        #print(data)
        #print(paragraph)
        resp = requests.post(url,json=data)


if __name__ == "__main__":
    str1 = Queue()
    #str1.put("I enjoy walking with my cute dog")
    outStr = Queue()
    print("starting process")
    p = Process(target=run,args=(str1,outStr,))
    p.start()
    print("process started")

    d = False
    stri = ''
    print("Enter your sentence : ")
    g = input(" ")
    str1.put(g)
    prevTime = datetime.now()
    while(True):
        if(not outStr.empty()):
            d = True
            stri = outStr.get()
            print(stri)
            print("Time Elapsed: ")
            print(datetime.now() - prevTime)
            g = input("Enter your sentence : ") 
            str1.put(g)
            prevTime = datetime.now()


'''
#use past info
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained('gpt2')

generated = tokenizer.encode("The Manhattan bridge")
context = torch.tensor([generated])
past = None

for i in range(100):
    print(i)
    output, past = model(context, past=past)
    token = torch.argmax(output[..., -1, :])

    generated += [token.tolist()]
    context = token.unsqueeze(0)

sequence = tokenizer.decode(generated)

print(sequence)
'''