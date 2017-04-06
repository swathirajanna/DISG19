
f1 = open('data1.csv','r')
f2 = open('data2.csv','r')
f3 = open('data3.csv','r')

f = open('final_data.csv','w+')

for line in f1:
	f.write("%s" % line)

f2.readline()
for line in f2:
	f.write("%s" % line)

f3.readline()
for line in f3:
	f.write("%s" % line)

f1.close()
f2.close()
f3.close()
f.close()
