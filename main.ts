import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';import{join}from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output',
S='!2b%\'+,0        *******&***&*** ***             AEEA!           &)              %%"%';
function R(P,N){const L=P.length,D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);let s=0,k=0,l=0,i=0,c=0,n=0;
for(;;){if(n==1e6)return[o,l,10];if(c<0||c>=L)return[o,l,9];
const z=P[c],h=S.charCodeAt(z)-32;if(!h)return[o,l,5];
const m=(h-1)>>4,p=(h-1)>>2&3,q=(h-1)&3;
if(c+m>=L)return[o,l,9];n++;const x=c+1+m;
if(s<p)return[o,l,2];if(s-p+q>256)return[o,l,3];c=x;
if(z<8){if(!z)return[o,l,0];
if(z==1)D[s++]=(P[x-1]<<24)>>24;
else if(z==2)D[s++]=P[x-4]|P[x-3]<<8|P[x-2]<<16|P[x-1]<<24;
else if(z==3)s--;
else if(z==4)D[s]=D[s-1],s++;
else if(z==5){const t=D[s-1];D[s-1]=D[s-2];D[s-2]=t}
else if(z==6)D[s]=D[s-2],s++;
else{const t=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=t}
continue}
if(z>15&&z<35){
if(z==23){D[s-1]=-D[s-1];continue}
if(z==27){D[s-1]=~D[s-1];continue}
const b=D[s-1],a=D[s-2];let r;
if(z<19)r=z==16?a+b:z==17?a-b:Math.imul(a,b);
else if(z<23){if(!b)return[o,l,4];r=z==19?a/b:z==20?a%b:z==21?(a>>>0)/(b>>>0):(a>>>0)%(b>>>0)}
else if(z==24)r=a&b;else if(z==25)r=a|b;else if(z==26)r=a^b;
else if(z==28)r=a<<b;else if(z==29)r=a>>b;else if(z==30)r=a>>>b;
else if(z==32)r=+(a==b);else if(z==33)r=+(a<b);else r=+((a>>>0)<(b>>>0));
s-=2;D[s++]=r;continue}
if(z==48){c=x+(((P[x-2]|P[x-1]<<8)<<16)>>16);continue}
if(z==49||z==50){const v=D[--s],r=((P[x-2]|P[x-1]<<8)<<16)>>16;if(z==49?!v:!!v)c=x+r;continue}
if(z==51){if(k==64)return[o,l,7];C[k++]=x;c=P[x-2]|P[x-1]<<8;continue}
if(z==52){if(!k)return[o,l,8];c=C[--k];continue}
if(z==64){const a=D[s-1];if(a<0||a>255)return[o,l,6];D[s-1]=M[a];continue}
if(z==65){const a=D[s-1],v=D[s-2];if(a<0||a>255)return[o,l,6];s-=2;M[a]=v;continue}
if(z==80){const b=Buffer.from(''+D[s-1]);if(l+b.length>65536)return[o,l,11];s--;o.set(b,l);l+=b.length;continue}
if(z==81){if(l>65535)return[o,l,11];o[l++]=D[--s]&255;continue}
if(z==82){D[s++]=i<N.length?N[i++]:-1;continue}
return[o,l,D[--s]&255]
}}
for(const id of readdirSync(I).sort()){let r;try{r=R(readFileSync(join(I,id,'program.bin')),readFileSync(join(I,id,'input.bin')))}catch{r=[new Uint8Array,0,0]}mkdirSync(join(O,id),{recursive:true});writeFileSync(join(O,id,'stdout.bin'),r[0].subarray(0,r[1]));writeFileSync(join(O,id,'exit.txt'),r[2]+'\n')}
