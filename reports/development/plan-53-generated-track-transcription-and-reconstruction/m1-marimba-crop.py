# Offline, lossless PCM crop from two full render WAVs; never overwrite.
from pathlib import Path
import hashlib,sys,wave
root=Path(__file__).resolve().parent
base=root/'local/full-track-m1/offline-full-large.wav'
variant=root/'local/m1-piano-marimba/marimba-full-offline.wav'
out=root/'local/m1-piano-marimba'
expected='e7220960943d13222e03d4ee9a2a83821cbe734c2870d77800849382fc559f5d'
if len(sys.argv)!=2 or len(sys.argv[1])!=64:raise ValueError('supply verified full variant SHA-256')
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
if sha(base)!=expected or sha(variant)!=sys.argv[1]:raise ValueError('source hash mismatch')
for path,name in ((base,'piano-30-50.wav'),(variant,'marimba-30-50.wav')):
 target=out/name
 if target.exists():raise FileExistsError(target)
 with wave.open(str(path),'rb') as src:
  if (src.getframerate(),src.getnchannels(),src.getsampwidth())!=(48000,2,2) or src.getnframes()<50*48000:raise ValueError('format or length mismatch')
  src.setpos(30*48000);data=src.readframes(20*48000)
 if len(data)!=20*48000*4 or not any(data):raise ValueError('invalid or silent crop')
 with target.open('xb') as file:
  with wave.open(file,'wb') as dst:dst.setnchannels(2);dst.setsampwidth(2);dst.setframerate(48000);dst.writeframes(data)
 with wave.open(str(target),'rb') as check:
  if check.getnframes()!=960000 or check.readframes(960000)!=data:raise ValueError('crop content mismatch')
 print(name,'frames=960000','sha256='+sha(target))
