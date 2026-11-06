set -e
i=0
while IFS= read -r line; do
  i=$((i+1))
  espeak-ng -v mb-br4 -s 145 -p 75 -a 180 "$line" -w voice/raw$i.wav
  ffmpeg -y -loglevel error -i voice/raw$i.wav -af "asetrate=16000*1.22,aresample=48000,atempo=0.92,highpass=f=120,equalizer=f=3000:t=q:w=1:g=3,volume=1.6" -ac 1 -ar 48000 voice/l$i.wav
  ffprobe -v error -show_entries format=duration -of csv=p=0 voice/l$i.wav
done <<'T'
Oi, pessoal!
Tenho um convite muito especial para vocês!
Vamos comemorar um aniversário cheio de diversão, alegria e momentos incríveis?
Preparem-se para essa festa!
T
