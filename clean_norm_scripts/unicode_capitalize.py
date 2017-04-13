import re

f1 = open('data1.csv','r')
f2 = open('replaced.csv','w+')

for line in f1:
	re.sub(r'[^\x00-\x7F]+',' ', line)
	vals = line.split(',')
	for i in range(len(vals)):
		vals[i] = vals[i].lower()
		words = vals[i].split(' ')
		for j in range(len(words)):
			words[j] = words[j].capitalize()
		vals[i] = ' '.join(words)
	text = ','.join(vals)
	f2.write("%s" % text)

f1.close()
f2.close()
