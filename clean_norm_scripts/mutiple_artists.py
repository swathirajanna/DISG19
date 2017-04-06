
f = open('final_data.csv','r')
f2 = open('1NF.csv','w')

f.readline()

for line in f:
	vals = line.split(',')
	if '/' in vals[5]:
		artists = vals[5].split('/')
	elif '_' in vals[5]:
		artists = vals[5].split('_')
	elif '&' in vals[5]:
		artists = vals[5].split('&')
	else:
		artists = [vals[5]]
	for artist in artists:
		vals[5] = artist.strip()
		text = ','.join(vals)
		f2.write("%s" % text)

f.close()
f2.close()
		
