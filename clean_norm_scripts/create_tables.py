import collections

f = open('final_data.csv','r');

artists = set()
albums = collections.defaultdict(int);


for line in f:
	vals = line.split(',')
	if vals[5].strip() == "":
		vals[5] = 'Unknown'
	artists.add(vals[5])
	albums[vals[6]] += 1

f.close()

f = open('artists.csv','w')
artist_dict = {}
count = 1
f.write("id,name\n")
for artist in artists:
	f.write("%d,%s\n" % (count,artist))
	artist_dict[artist] = count
	count+=1

f.close()

f = open('albums.csv','w')
album_dict = {}
count = 1
f.write("id,name,num_of_songs\n")
for album in albums.keys():
	f.write("%d,%s,%d\n" % (count,album,albums[album]))
	album_dict[album] = count
	count+=1

f.close()

f1 = open('final_data.csv','r');
f2 = open('songs.csv','w');
f3 = open('artist_song.csv','w')
count = 0
f2.write("id,name,theme,year,duration,tempo,album_id,spotify_url\n")
f3.write("track_id,artist_id\n")

prevName = ""

for line in f1:

	vals = line.split(',')
	if vals[5].strip() == "":
		vals[5] = 'Unknown'
	vals[5] = str(artist_dict[vals[5]])
	vals[6] = str(album_dict[vals[6]])

	if prevName != vals[0].strip():
		count+=1
		prevName = vals[0].strip()
		f3.write("%d,%s\n" % (count,vals[5]))
		vals = ','.join([vals[0],vals[1],vals[2],vals[3],vals[4],vals[6],vals[7]])	
		f2.write("%d,%s\n" % (count,vals))
	else:
		f3.write("%d,%s\n" % (count,vals[5]))
		prevName = vals[0].strip()	

f1.close()
f2.close()
f3.close()
