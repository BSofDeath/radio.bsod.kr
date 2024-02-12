@echo off
cd "C:\Program Files\VideoLAN\VLC"
start vlc --sout #transcode{vcodec=none,acodec=mp3,ab=128,channels=2,samplerate=44100,scodec=none}:http{mux=mp3,dst=:8080/} --sout-all --sout-keep "https://radio.bsod.kr/playlist/seoul.m3u"