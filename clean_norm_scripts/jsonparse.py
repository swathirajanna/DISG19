import spotipy
import json

output = []


new = open('new.csv','w')
#
new.write("Theme,Title,Artist,Year,SpotifyURL,Duration,Album Name\n")

data=open('top_1000.json','r')
#print data.read()
x=json.loads(data.read())
songs = x['data']

for song in songs:
    
#for line in data:
    
    s_url = song[-1][0]
    if s_url == None:
        new.write(song[8]+","+song[9]+","+song[10]+","+song[11]+","+"NULL,NULL,NULL\n")
    else:
        track = s_url[30:]
        urn = "spotify:track:"+track
        sp = spotipy.Spotify()
        track = sp.track(urn)
        dur = str(track['duration_ms']/float(1000))
        name = track['album']['name']
        new.write(song[8]+","+song[9]+","+song[10]+","+song[11]+","+s_url+","+dur+","+name+"\n")
new.close()
data.close()
