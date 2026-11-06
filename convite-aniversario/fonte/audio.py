import numpy as np, wave, subprocess, json
SR=48000; DUR=31.0; N=int(SR*DUR)
rng=np.random.default_rng(7)
def midi(m): return 440*2**((m-69)/12)
def ks(freq,dur,bright=0.5,amp=1.0):
    n=int(SR*dur); p=max(2,int(SR/freq))
    buf=rng.uniform(-1,1,p)
    buf=np.convolve(buf,[bright,1-bright],'same') if bright<1 else buf
    out=np.zeros(n); b=buf.copy()
    for i in range(0,n,p):
        seg=b[:min(p,n-i)]; out[i:i+len(seg)]=seg
        b=0.996*0.5*(b+np.roll(b,-1))
    return out*amp
def tone(freq,dur,kind='marimba',amp=1.0):
    n=int(SR*dur); t=np.arange(n)/SR
    if kind=='marimba':
        s=np.sin(2*np.pi*freq*t)+0.25*np.sin(2*np.pi*freq*4*t)*np.exp(-t*30)
        env=np.exp(-t*6)*(1-np.exp(-t*800))
    elif kind=='bell':
        s=np.sin(2*np.pi*freq*t)+0.4*np.sin(2*np.pi*freq*2.76*t)+0.2*np.sin(2*np.pi*freq*5.4*t)
        env=np.exp(-t*4)*(1-np.exp(-t*1500))
    elif kind=='bass':
        s=np.sin(2*np.pi*freq*t)+0.3*np.sin(2*np.pi*freq*2*t)
        env=np.exp(-t*3)*(1-np.exp(-t*300))
    return s*env*amp
mix=np.zeros(N+SR*3)
def add(sig,at):
    i=int(at*SR); mix[i:i+len(sig)]+=sig
bpm=126; beat=60/bpm; bar=4*beat
chords=[[60,64,67],[55,59,62,67],[57,60,64],[53,57,60,65]]  # C G Am F
bassn=[36,43,45,41]
mel=[ # (beat offset in 4-bar phrase, midi, len)
 (0,72,1),(1,76,.5),(1.5,79,.5),(2,81,1),(3,79,1),
 (4,79,1),(5,74,.5),(5.5,76,.5),(6,74,1),(7,71,1),
 (8,72,1),(9,76,.5),(9.5,77,.5),(10,76,1),(11,72,1),
 (12,69,1),(13,72,.5),(13.5,74,.5),(14,72,2)]
t0=0.0; nb=int(DUR/bar)+1
for b in range(nb):
    st=t0+b*bar; c=chords[b%4]
    for k,(off,down) in enumerate([(0,1),(1,1),(1.5,0),(2.5,0),(3,1),(3.5,0)]):
        when=st+off*beat
        for j,m in enumerate(c if down else c[::-1]):
            add(ks(midi(m),1.2,0.6,0.22 if down else 0.15),when+j*0.012)
    add(tone(midi(bassn[b%4]),bar*0.9,'bass',0.35),st)
    add(tone(midi(bassn[b%4]+7),beat*0.9,'bass',0.2),st+2*beat)
    # percussion: shaker 8ths, soft kick
    for e in range(8):
        n=int(0.05*SR); sh=rng.normal(0,1,n)*np.exp(-np.arange(n)/SR*90)
        sh=np.diff(sh,prepend=0)
        add(sh*(0.05 if e%2 else 0.03),st+e*beat/2)
    for k in (0,2):
        n=int(0.25*SR); tt=np.arange(n)/SR
        add(np.sin(2*np.pi*(50+90*np.exp(-tt*30))*tt)*np.exp(-tt*14)*0.45,st+k*beat)
    for k in (1,3):
        n=int(0.12*SR); add(rng.normal(0,1,n)*np.exp(-np.arange(n)/SR*35)*0.07,st+k*beat)
    # melody (marimba) in phrases
    ph=b%4
    for off,m,l in mel:
        if ph*4<=off<ph*4+4:
            add(tone(midi(m),l*beat*1.6,'marimba',0.28),st+(off-ph*4)*beat)
# sparkle bells at key moments
def sparkle(at,base=84):
    for i,m in enumerate([base,base+4,base+7,base+12,base+16]):
        add(tone(midi(m),1.2,'bell',0.10),at+i*0.06)
for at in [0.3,13.6,15.4,18.4,21.4,24.4,26.2]: sparkle(at)
# whoosh at character entrance
n=int(0.8*SR); tt=np.arange(n)/SR; w=rng.normal(0,1,n)
from numpy.fft import rfft,irfft
w=np.convolve(w,np.ones(30)/30,'same')*np.sin(np.pi*tt/0.8)**2*0.25; add(w,0.9)
# kiss "muah" pop + rising chime at finale
n=int(0.25*SR); tt=np.arange(n)/SR
add(np.sin(2*np.pi*(500+900*tt/0.25)*tt)*np.exp(-tt*10)*0.25,27.6)
music=mix[:N]
# fade out
fo=int(2.0*SR); music[-fo:]*=np.linspace(1,0,fo)
music[:int(0.05*SR)]*=np.linspace(0,1,int(0.05*SR))
# voice
def readwav(p):
    with wave.open(p) as w: return np.frombuffer(w.readframes(w.getnframes()),np.int16)/32768.0
starts=[2.4,3.9,6.8,11.4]
voice=np.zeros(N); lines=[]
for i,s in enumerate(starts):
    v=readwav(f'voice/l{i+1}.wav'); a=int(s*SR); voice[a:a+len(v)]+=v
    lines.append([s,s+len(v)/SR])
# ducking
env=np.convolve(np.abs(voice),np.ones(int(0.15*SR))/int(0.15*SR),'same')
duck=1-0.55*np.clip(env/0.05,0,1)
music=music/np.max(np.abs(music))*0.55
out=music*duck+voice*0.95
out=np.tanh(out*1.1)/np.tanh(1.1)
st=np.stack([out,out],1)
with wave.open('mix.wav','w') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR)
    w.writeframes((st*32000).astype(np.int16).tobytes())
# mouth envelope per frame @30fps
FPS=30; nf=int(DUR*FPS); hop=SR//FPS
mouth=[float(np.sqrt(np.mean(voice[f*hop:(f+1)*hop]**2))) for f in range(nf)]
m=max(mouth); mouth=[round(min(1,x/m*1.6),3) for x in mouth]
json.dump({'mouth':mouth,'lines':lines},open('timing.json','w'))
print(lines)
