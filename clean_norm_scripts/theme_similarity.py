#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Sat Mar 25 10:44:27 2017

@author: rahuldhakecha
"""

import math
from collections import Counter

def cosdis(v1, v2):

    common = v1[1].intersection(v2[1])
    if (v1[2]==0 or v2[2] == 0):
        return sum(v1[0][ch] * v2[0][ch] for ch in common) / 1.0 / 1.0
    return sum(v1[0][ch] * v2[0][ch] for ch in common) / v1[2] / v2[2]
    

def word2vec(word):
    cw = Counter(word)
    sw = set(cw)
    lw = math.sqrt(sum(c * c for c in cw.values()))
    return cw, sw, lw

def removePunctuations(str_input):
    ret = []
    punctuations = '''!()-[]{};:'"\,<>./?@#$%^&*_~'''
    for char in str_input:
        if char not in punctuations:
            ret.append(char)

    return "".join(ret)
    
    
data=open('a.csv','r')
output = []
output1 = []
for line in data:
    print line
    cells = line.split( "," )
    string=cells[1]
    output.append( ( cells[1]) )
    ListB = string.split()
    ListA = ['Love', 'Sex', 'Heartbreak', 'People and Places', 'Politics and Protest', 'Life and Death', 'Party songs']
    list = []
    ll = []
    for i in ListA:
        cnt=0
        for j in ListB:
            cnt=cnt+(cosdis(word2vec(removePunctuations(i)), word2vec(removePunctuations(j.decode("utf8")))))
        ll.append(cnt)
    print ListA[ll.index(max(ll))]
    

data.close()



