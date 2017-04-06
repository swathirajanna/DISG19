
f = open('data1.csv','r')

title_artist = set()

for line in f:
        vals = line.split(',')
        title = vals[0]
        artist = vals[5]
        title_artist.add(title+"_"+artist)
f.close()

f1 = open('data2.csv','r')
f2 = open('new_tuples.csv','w+')


for line in f1:
        vals = line.split(',')
        title = vals[0]
        artist = vals[5]
        temp = title + "_" + artist
        if temp not in title_artist:
                f2.write('%s\n' % line)
        else:
                print(temp)

f1.close()
f2.close()

