import { useRef, useState } from 'react'
import StaffBookActivities from './StaffBookActivities'
import StaffApplicationsActivities from './StaffApplicationsActivities'
import OrganBookActivities from './OrganBookActivities'
import OrganScaleDragActivity from './OrganScaleDragActivity'
const PHONE = '96898778983'
const INITIAL = [2,1,0,5,4,3,8,7,6]
const PROMPTS = [
 {id:'prayer',text:'يا ربنا احفظ لنا جلالة السلطان',emoji:'🙏🏻',answer:'prayer'},
 {id:'people',text:'والشعب في الأوطان',emoji:'🧒🏻👧🏻',answer:'people'},
 {id:'pride',text:'بالعز والأمان',emoji:'👮🏻‍♂️',answer:'police'},
 {id:'sky',text:'فارقتي هام السماء',emoji:'☁️🌤️',answer:'sky'},
]
const PICTURES = [{id:'sky',label:'السماء',emoji:'☁️🌤️'},{id:'people',label:'الشعب العُماني',emoji:'🧒🏻👧🏻'},{id:'prayer',label:'دعاء',emoji:'🙏🏻'},{id:'police',label:'شرطة عُمان السلطانية',emoji:'👮🏻‍♂️'}]
export default function BookActivities({lessonTitle,onSubmit}:{lessonTitle:string;onSubmit?:()=>void}) {
 const [name,setName]=useState(''),[grade,setGrade]=useState('')
 const [rhythmActivityDone,setRhythmActivityDone]=useState(false)
 const [balloonColors,setBalloonColors]=useState<Record<number,string>>({})
 const [selectedBalloonColor,setSelectedBalloonColor]=useState('#ef4444')
 const [noteCount,setNoteCount]=useState('')
 const [restCount,setRestCount]=useState('')
 const [tiles,setTiles]=useState(()=>[3,0,7,2,5,1,8,4,6]),[selected,setSelected]=useState<number|null>(null)
 const [matches,setMatches]=useState<Record<string,string>>({}),[dragged,setDragged]=useState<string|null>(null)
 const [shadingMatches,setShadingMatches]=useState<Record<string,string>>({})
 const [flagClues,setFlagClues]=useState<Record<string,string>>({})
 const [flagAssemblyConfirmed,setFlagAssemblyConfirmed]=useState(false)
 const [flagDragged,setFlagDragged]=useState<string|null>(null)
 const [dynamicsNumbers,setDynamicsNumbers]=useState<Record<number,string>>({})
 const [activeAudio,setActiveAudio]=useState<number|null>(null)
 const [folkMatches,setFolkMatches]=useState<Record<string,any>>({})
 function playMusicSample(index:number){
  const AudioContextClass=(window as any).AudioContext||(window as any).webkitAudioContext
  if(!AudioContextClass)return
  const ctx=new AudioContextClass(),now=ctx.currentTime
  const notes=index===0?[220,196,220]:index===1?[880,1046,880]:index===2?[440,440,440]:[660,660,660,660,660,660]
  const beat=index===2?0.75:index===3?0.16:0.4
  notes.forEach((freq,i)=>{const osc=ctx.createOscillator(),g=ctx.createGain(),start=now+i*beat;osc.type='triangle';osc.frequency.value=freq;osc.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(0.0001,start);g.gain.exponentialRampToValueAtTime(0.12,start+0.02);g.gain.exponentialRampToValueAtTime(0.0001,start+beat*0.75);osc.start(start);osc.stop(start+beat*0.8)})
  setActiveAudio(index);window.setTimeout(()=>setActiveAudio(v=>v===index?null:v),Math.ceil((notes.length*beat+0.3)*1000));window.setTimeout(()=>ctx.close(),Math.ceil((notes.length*beat+1)*1000))
 }
 const [safetyNumbers,setSafetyNumbers]=useState<Record<string,number>>({})
 const [safetyFeedback,setSafetyFeedback]=useState('')
 const [selectedSafetyNumber,setSelectedSafetyNumber]=useState<number|null>(null)
 const safetyTargets=[
  {id:'home',label:'سلامتي في المنزل',number:3,left:45.5,top:65.7},
  {id:'road',label:'سلامتي في الطريق',number:1,left:54.2,top:65.7},
  {id:'bus',label:'سلامتي في الحافلة',number:4,left:45.5,top:94.1},
  {id:'school',label:'سلامتي في المدرسة',number:2,left:54.2,top:94.1},
 ]
 function placeSafetyNumber(targetId:string,number:number){
  const target=safetyTargets.find(t=>t.id===targetId)
  if(!target)return
  if(target.number!==number){setSafetyFeedback('حاولي مرة أخرى؛ اختاري الرقم الذي يطابق صورة السلامة.');return}
  setSafetyNumbers(prev=>({...prev,[targetId]:number}))
  setSelectedSafetyNumber(null)
  setSafetyFeedback('أحسنتِ! إجابة صحيحة 🌟')
 }
 function resetSafetyNumbers(){setSafetyNumbers({});setSelectedSafetyNumber(null);setSafetyFeedback('')}
 const normalizedLessonTitle=lessonTitle.normalize('NFD').replace(/[\u064B-\u065F\u0670]/g,'')
 const flagActivity=normalizedLessonTitle.includes('علم بلادي')
 const flagAssemblyLesson=lessonTitle==='النشيد الوطني'||flagActivity
 const flagClueItems=[{id:'green',label:'الأخضر',meaning:'الخضرة والزراعة في البلاد'},{id:'red',label:'الأحمر',meaning:'الحرب والمعارك'},{id:'white',label:'الأبيض',meaning:'الأمن والسلام'},{id:'emblem',label:'شعار الخنجر والسيفين',meaning:'الأسلحة التقليدية العُمانية'}]
 const flagCluesDone=flagClueItems.every(x=>flagClues[x.id]===x.id)
 const anthem=lessonTitle==='النشيد الوطني'||flagActivity
 const shading=lessonTitle==='تدريبات صوتية بالتظليلات'
 const rhythmActivity=lessonTitle==='الشكل الإيقاعي (♫)'
 const noteColoringActivity=lessonTitle==='العلامة الإيقاعية النوار (♩) والسكتة المقابلة لها'
 const dynamicsActivity=/الحِدّة والغلظة|الحدة والغلظة|السرعة والبطء/.test(lessonTitle)
 const folkGameActivity=/اللعبة الشعبية.*حبّوه موه تدوري|حبّوه موه تدوري/.test(lessonTitle)
 const noteBalloons=[
  {id:0,type:'rest',left:25.9,top:20.6,width:13.0,height:18.2},
  {id:1,type:'note',left:47.5,top:11.1,width:12.3,height:17.8},
  {id:2,type:'note',left:41.4,top:21.9,width:13.0,height:22.6},
  {id:3,type:'rest',left:61.2,top:25.0,width:13.0,height:20.6},
  {id:4,type:'note',left:27.5,top:38.4,width:13.0,height:20.7},
  {id:5,type:'rest',left:36.1,top:32.3,width:12.1,height:22.7},
  {id:6,type:'rest',left:50.8,top:28.8,width:12.8,height:22.7},
  {id:7,type:'note',left:57.1,top:43.1,width:12.8,height:20.4}
 ] as const
 const notesColored=noteBalloons.filter(b=>b.type==='note'&&balloonColors[b.id]==='#ef4444').length
 const restsColored=noteBalloons.filter(b=>b.type==='rest'&&balloonColors[b.id]==='#22c55e').length
 const coloringDone=notesColored===noteBalloons.filter(b=>b.type==='note').length&&restsColored===noteBalloons.filter(b=>b.type==='rest').length
 const shadingItems=[{id:'legato',name:'الليجاتو'},{id:'staccato',name:'الاستكاتو'},{id:'forte',name:'الفورتي (f)'},{id:'piano',name:'البيانو (p)'},{id:'crescendo',name:'الكريشيندو'},{id:'diminuendo',name:'الديمينويندو'}]
 const shadingDone=shadingItems.every(x=>shadingMatches[x.id]===x.id)
 const full=name.trim().split(/\s+/).filter(Boolean).length>=4
 const puzzleDone=tiles.length===INITIAL.length&&tiles.every((piece,slot)=>piece===INITIAL[slot])
 const matchDone=PROMPTS.every(p=>matches[p.id]===p.answer)
 const ready=full&&!!grade.trim()&&(!anthem||(flagActivity?(flagAssemblyConfirmed&&flagCluesDone):(matchDone&&flagAssemblyConfirmed)))&&(!shading||shadingDone)&&(!rhythmActivity||rhythmActivityDone)
 function swap(a:number,b:number){setTiles(old=>{if(a<0||b<0||a>=old.length||b>=old.length||a===b)return old;const next=[...old];[next[a],next[b]]=[next[b],next[a]];return next});setSelected(null)}
 function send(){onSubmit?.();const msg=['تسليم أنشطة الكتاب - نغماتي','الدرس: '+lessonTitle,'الاسم الرباعي: '+name.trim(),'الصف: '+grade.trim(),...(rhythmActivity?['النشاط التفاعلي للشكل الإيقاعي: '+(rhythmActivityDone?'أفادت الطالبة بإكماله':'غير مكتمل'),'رابط النشاط: https://ict.moe.gov.om/library/file/Content/4/Music/cls4_p1_u1_le3_nashat/start.html']:[]),...(folkGameActivity?['نشاط اللعبة الشعبية - التوصيل: '+[{id:0,label:'أدور إبرة'},{id:1,label:'عشرة'},{id:2,label:'حال البيض'},{id:3,label:'حال الكيس'}].map(x=>x.label+' ← '+(({0:'الكيس',1:'إبرة وخيط',2:'البيض',3:'العدد عشرة'} as any)[folkMatches[x.id]]||'لم يُجب')).join('؛ ')]:[]),...(dynamicsActivity?['نشاط الاستماع - الأرقام: '+[{id:0,label:'الطبل'},{id:1,label:'الأرنب'},{id:2,label:'السلحفاة'},{id:3,label:'المثلث الموسيقي'}].map(x=>x.label+': '+(dynamicsNumbers[x.id]||'لم يُجب')).join('؛ ')]:[]),...(noteColoringActivity?['تلوين البالونات: النوار '+notesColored+'/'+noteBalloons.filter(b=>b.type==='note').length+'، العدد الذي كتبته: '+(noteCount||'لم يُكتب')+'؛ السكتة '+restsColored+'/'+noteBalloons.filter(b=>b.type==='rest').length+'، العدد الذي كتبته: '+(restCount||'لم يُكتب')]:[]),...(anthem?[(flagActivity?'النشاط الثاني':'النشاط الأول')+' - تركيب العلم: '+(puzzleDone?'مكتمل':'غير مكتمل'),...(!flagActivity?['النشاط الثاني - توصيل الصور بالجمل: '+PROMPTS.map(p=>p.text+' ← '+(PICTURES.find(c=>c.id===matches[p.id])?.label||'لم تُجب')).join('؛ ')]:[])]:[]),...(flagActivity?['نشاط معاني ألوان ورموز العلم: '+flagClueItems.map(x=>x.meaning+' ← '+(flagClues[x.id]===x.id?x.label:'غير مكتمل')).join('؛ ')]:[]),...(shading?['توصيل أسماء التظليلات بالرموز: '+shadingItems.map(x=>x.name+' ← '+(shadingMatches[x.id]===x.id?'صحيح':'غير مكتمل')).join('؛ ')]:[])].join('\n');window.open('https://wa.me/'+PHONE+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer')}
 return <section className="rounded-[2rem] bg-white p-4 md:p-6 shadow-chunky border-2 border-amber-200"><h3 className="text-2xl font-extrabold mb-4">📚 أنشطة الكتاب</h3>
 {lessonTitle === 'المُدَرَّج الموسيقي ومفتاح صول' || lessonTitle === 'المدرج الموسيقي ومفتاح صول' ? <div className="mt-4"><StaffBookActivities /></div> : null}
 {lessonTitle === 'تطبيقات على المُدَرَّج الموسيقي' || lessonTitle === 'تطبيقات على المدرج الموسيقي' ? <div className="mt-4"><StaffApplicationsActivities /></div> : null}
 {lessonTitle === 'آلة الأورج' ? <div className="mt-4"><OrganBookActivities /></div> : null}
 {lessonTitle === 'عزف مقطوعة موسيقية على آلة الأورج' ? <div className="mt-4"><OrganScaleDragActivity /></div> : null}
 {folkGameActivity&&<div className="rounded-2xl bg-cream p-4 mb-5">
 <h4 className="font-extrabold text-lg">نشاط توصيل عبارات اللعبة الشعبية بالصور 🎵</h4>
 <p className="my-2">صِل كل عبارة بالصورة المناسبة: اضغط على العبارة أولًا، ثم اضغط على الصورة. ستظهر لك نتيجة إجابتك فورًا!</p>
 <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border-2 border-violet-200 bg-white p-3 font-extrabold">
 <span className="text-violet-700">⭐ الإجابات الصحيحة:</span>
 <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">{[{id:0,answer:1},{id:1,answer:3},{id:2,answer:2},{id:3,answer:0}].filter(x=>folkMatches[x.id]===x.answer).length} من 4</span>
 {folkMatches.selectedPhrase!==undefined&&<span className="text-sm text-violet-700">اختيرت عبارة «{[{id:0,text:'أدور إبرة'},{id:1,text:'عشرة'},{id:2,text:'حال البيض'},{id:3,text:'حال الكيس'}].find(x=>x.id===folkMatches.selectedPhrase)?.text}» — اختَر صورتها الآن</span>}
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3">
 <h5 className="mb-3 text-center font-extrabold">العمود (أ) — العبارات</h5>
 {[{id:0,text:'أدور إبرة'},{id:1,text:'عشرة'},{id:2,text:'حال البيض'},{id:3,text:'حال الكيس'}].map(item=>{const answered=folkMatches[item.id]!==undefined;const correct=folkMatches[item.id]===[1,3,2,0][item.id];return <div key={item.id} className="mb-3"><button type="button" onClick={()=>setFolkMatches(old=>({...old,selectedPhrase:item.id}))} className={'w-full rounded-xl border-2 p-3 text-lg font-bold transition '+(folkMatches.selectedPhrase===item.id?'border-violet-600 bg-violet-100 ring-2 ring-violet-300':answered&&correct?'border-emerald-500 bg-emerald-100':'border-orange-300 bg-orange-100')}>{item.text} {answered&&correct?'✓':answered?'↻':''}</button>{answered&&<p role="status" className={'mt-1 text-sm font-extrabold '+(correct?'text-emerald-700':'text-rose-700')}>{correct?'أحسنت! إجابة صحيحة 🎉':'مش دي الصورة الصحيحة، جرّب مرة أخرى 💪'}</p>}</div>})}
 </div>
 <div className="rounded-xl border-2 border-sky-300 bg-sky-50 p-3">
 <h5 className="mb-3 text-center font-extrabold">العمود (ب) — الصور</h5>
 {[{id:0,emoji:'👜',label:'الكيس'},{id:1,emoji:'🪡🧵',label:'إبرة وخيط'},{id:2,emoji:'🥚🥚🥚',label:'البيض'},{id:3,emoji:'🔟',label:'العدد عشرة'}].map(item=>{const selectedFor=Object.keys(folkMatches).find(k=>k!=='selectedPhrase'&&folkMatches[k]===item.id);const correct=selectedFor!==undefined&&Number(selectedFor)===[1,3,2,0][Number(selectedFor)];return <button key={item.id} type="button" onClick={()=>{const phrase=folkMatches.selectedPhrase;if(phrase!==undefined)setFolkMatches(old=>({...old,[phrase]:item.id,selectedPhrase:undefined}))}} className={'mb-3 flex min-h-20 w-full items-center justify-center gap-3 rounded-xl border-2 p-3 transition '+(selectedFor!==undefined&&correct?'border-emerald-500 bg-emerald-100':selectedFor!==undefined?'border-rose-400 bg-rose-100':folkMatches.selectedPhrase!==undefined?'border-sky-400 bg-white hover:bg-sky-100':'border-sky-200 bg-white')}><span className="text-4xl">{item.emoji}</span><span className="font-bold">{item.label}</span>{selectedFor!==undefined&&<span className={'text-xl font-extrabold '+(correct?'text-emerald-700':'text-rose-600')}>{correct?'✓':'↻'}</span>}</button>})}
 </div></div>
 <div className="mt-3 flex flex-wrap items-center gap-3"><p className="font-bold">كلما كانت الإجابة صحيحة ستظهر علامة ✓ باللون الأخضر، وإذا كانت غير صحيحة يمكنك المحاولة مرة أخرى.</p><button type="button" onClick={()=>setFolkMatches({})} className="rounded-full border bg-white px-4 py-2 font-bold">إعادة النشاط ↺</button></div>
 { [0,1,2,3].every(id=>folkMatches[id]===[1,3,2,0][id])&&<div role="status" className="mt-4 rounded-xl border-2 border-emerald-400 bg-emerald-100 p-4 text-center text-lg font-extrabold text-emerald-800">🎉 ممتاز! كل التوصيلات صحيحة، أحسنت!</div>}
 </div>}
 {dynamicsActivity&&<div className="rounded-2xl bg-cream p-4 mb-5">
 <h4 className="font-extrabold text-lg">نشاط الاستماع: الحِدّة والغلظة والسرعة والبطء 🎧</h4>
 <p className="my-2">أولًا: استمع إلى النماذج الأربعة المرقمة بالأسفل. ثانيًا: انظر إلى الصور، واكتب في المربع تحت كل صورة رقم النموذج الصوتي الذي يناسبها. لا يوجد زر استماع تحت الصور حتى لا تعرف الإجابة مسبقًا.</p>
 <div className="mb-5 rounded-xl border-2 border-violet-200 bg-white p-3">
 <h5 className="mb-3 text-center font-extrabold">١. استمع إلى النماذج الصوتية بالترتيب</h5>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[0,1,2,3].map(id=><button key={id} type="button" onClick={()=>playMusicSample(id)} className={'rounded-xl border-2 p-3 font-extrabold '+(activeAudio===id?'border-violet-500 bg-violet-100':'border-slate-200 bg-slate-50')}>{activeAudio===id?'▶ يُشغّل الآن':('▶ النموذج الصوتي '+(id+1))}</button>)}
 </div>
 <p className="mt-2 text-center text-sm text-slate-600">يمكنك تشغيل كل نموذج أكثر من مرة. تذكّر رقم النموذج ثم اختر الصورة التي يناسبها.</p>
 </div>
 <h5 className="mb-3 text-center font-extrabold">٢. اكتب رقم النموذج المناسب تحت كل صورة</h5>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {[{id:0,emoji:'🥁',label:'الطبل'},{id:1,emoji:'🐇',label:'الأرنب'},{id:2,emoji:'🐢',label:'السلحفاة'},{id:3,emoji:'🔺',label:'المثلث الموسيقي'}].map(item=><div key={item.id} className="rounded-xl border-2 border-slate-200 bg-white p-3 text-center">
 <div className="mx-auto flex h-32 items-center justify-center rounded-lg bg-slate-50 text-7xl" role="img" aria-label={item.label}>{item.emoji}</div>
 <p className="mt-2 font-extrabold">{item.label}</p>
 <label className="mt-3 flex items-center justify-center gap-2 font-bold">رقم النموذج <input type="number" min="1" max="4" step="1" inputMode="numeric" value={dynamicsNumbers[item.id]||''} onChange={e=>setDynamicsNumbers(old=>({...old,[item.id]:e.target.value}))} className="w-20 rounded-lg border-2 border-violet-200 p-2 text-center text-xl" placeholder="—" aria-label={'رقم النموذج المناسب لصورة '+item.label}/></label>
 </div>)}
 </div>
 <button type="button" onClick={()=>setDynamicsNumbers({})} className="mt-3 rounded-full border bg-white px-4 py-2 font-bold">مسح الأرقام وإعادة النشاط</button>
 <p className="mt-2 text-sm text-slate-600">النماذج الصوتية مولّدة داخل النشاط لتوضيح الفرق بين الحِدّة والغلظة والسرعة والبطء.</p>
 </div>}
 {noteColoringActivity&&<div className="rounded-2xl bg-cream p-4 mb-5">
 <h4 className="font-extrabold text-lg">النشاط: لوّن بالونات النوار والسكتة 🎈</h4>
 <p className="my-2">اختَر اللون من لوحة الألوان، ثم اضغط داخل البالونة في الصورة لتلوينها. يمكنك تغيير اللون في أي وقت.</p>
 <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-3 mb-3">
 <span className="font-extrabold">اختَر لون التلوين:</span>
 {[{value:'#ef4444',label:'أحمر'},{value:'#22c55e',label:'أخضر'},{value:'#3b82f6',label:'أزرق'},{value:'#facc15',label:'أصفر'},{value:'#a855f7',label:'بنفسجي'},{value:'#f97316',label:'برتقالي'},{value:'#ec4899',label:'وردي'},{value:'#ffffff',label:'مسح اللون'}].map(color=><button key={color.value} type="button" onClick={()=>setSelectedBalloonColor(color.value)} aria-label={color.label} title={color.label} className={'h-10 w-10 rounded-full border-2 '+(selectedBalloonColor===color.value?'ring-4 ring-violet-300 ring-offset-2':'border-slate-300')} style={{backgroundColor:color.value}} />)}
 <span className="font-bold text-sm">{[{value:'#ef4444',label:'أحمر'},{value:'#22c55e',label:'أخضر'},{value:'#3b82f6',label:'أزرق'},{value:'#facc15',label:'أصفر'},{value:'#a855f7',label:'بنفسجي'},{value:'#f97316',label:'برتقالي'},{value:'#ec4899',label:'وردي'},{value:'#ffffff',label:'مسح اللون'}].find(x=>x.value===selectedBalloonColor)?.label}</span>
 </div>
 <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-xl border-2 border-amber-200 bg-white">
 <img src="https://raw.githubusercontent.com/mai-alaskary/naghmati/main/grade1-u1-l2-balloons.jpg" alt="ورقة نشاط بالونات النوار والسكتة للتلوين" className="block w-full h-auto" style={{position:'relative',zIndex:0}} />
 {noteBalloons.map(balloon=><button key={balloon.id} type="button" aria-label={balloon.type==='note'?'بالونة النوار':'بالونة السكتة'} title={balloon.type==='note'?'بالونة النوار':'بالونة السكتة'} onClick={()=>setBalloonColors(old=>({...old,[balloon.id]:selectedBalloonColor==='#ffffff'?'':selectedBalloonColor}))} className="absolute border-0 p-0" style={{left:balloon.left+'%',top:balloon.top+'%',width:balloon.width+'%',height:balloon.height+'%',borderRadius:'48% 48% 45% 45%',backgroundColor:balloonColors[balloon.id]||'transparent',opacity:balloonColors[balloon.id]?0.58:0.01,cursor:'pointer',zIndex:1}} />)}
 </div> <p className="mt-2 text-center text-sm text-slate-600">اضغط على البالونات في الصورة بعد اختيار اللون. زر «مسح اللون» يعيد البالونة إلى شكلها الأصلي.</p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
 <label className="rounded-xl bg-red-50 border border-red-200 p-3 text-center"><span className="block font-extrabold text-red-700">اكتب عدد بالونات النوار</span><input type="number" min="0" max="4" step="1" inputMode="numeric" value={noteCount} onChange={e=>setNoteCount(e.target.value)} aria-label="عدد بالونات النوار" className="mx-auto mt-2 block w-24 rounded-lg border-2 border-red-300 bg-white p-2 text-center text-xl font-extrabold" placeholder="العدد" /></label>
 <label className="rounded-xl bg-green-50 border border-green-200 p-3 text-center"><span className="block font-extrabold text-green-700">اكتب عدد بالونات السكتة</span><input type="number" min="0" max="4" step="1" inputMode="numeric" value={restCount} onChange={e=>setRestCount(e.target.value)} aria-label="عدد بالونات السكتة" className="mx-auto mt-2 block w-24 rounded-lg border-2 border-green-300 bg-white p-2 text-center text-xl font-extrabold" placeholder="العدد" /></label>
 </div>
 <div className="flex flex-wrap gap-2 mt-3"><button type="button" onClick={()=>{setBalloonColors({});setNoteCount('');setRestCount('');setSelectedBalloonColor('#ef4444')}} className="rounded-full border bg-white px-4 py-2 font-bold">إعادة التلوين</button>{coloringDone&&<span className="rounded-full bg-green-100 px-4 py-2 font-extrabold text-green-800">أحسنت! لوّنت كل البالونات بشكل صحيح 🎉</span>}</div>
 </div>} {(noteColoringActivity || lessonTitle==='نشيد (سلامتي)')&&<div className="rounded-2xl bg-cream p-4 mb-5">
 <h4 className="font-extrabold text-lg">{lessonTitle==='نشيد (سلامتي)'?'نشاط تفاعلي: صِل الرقم بالمكان المناسب ✍️':'النشاط الثاني: تتبّع الخطوط حسب الأسهم ✍️'}</h4>
 {lessonTitle==='نشيد (سلامتي)' ? <>
  <p className="my-2">اسحب الرقم من أسفل الصورة إلى الدائرة الفارغة التي تناسبه. على الهاتف، اضغط على الرقم ثم اضغط على الدائرة المناسبة.</p>
  <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg">
   <img src={`${import.meta.env.BASE_URL}images/activities/grade4-u2-l1-tracing.jpg`} alt="صور السلامة في الطريق والمدرسة والمنزل والحافلة" className="block h-auto w-full select-none" draggable={false}/>
   {safetyTargets.map(target=><div key={target.id} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const n=Number(e.dataTransfer.getData('text/plain'));if(n)placeSafetyNumber(target.id,n)}} onClick={()=>{if(selectedSafetyNumber!==null)placeSafetyNumber(target.id,selectedSafetyNumber)}} className="absolute flex items-center justify-center rounded-full border-2 border-dashed border-violet-500/70 bg-white/80 text-2xl font-black text-violet-800 shadow-sm" style={{left:`${target.left}%`,top:`${target.top}%`,width:'8%',aspectRatio:'1',transform:'translate(-50%,-50%)'}} aria-label={target.label}>
    {safetyNumbers[target.id]??''}
   </div>)}
  </div>
  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
   {[1,2,3,4].map(n=><button key={n} type="button" draggable onDragStart={e=>e.dataTransfer.setData('text/plain',String(n))} onClick={()=>setSelectedSafetyNumber(n)} className={'h-12 w-12 rounded-xl border-2 text-xl font-black shadow-sm '+(selectedSafetyNumber===n?'border-violet-600 bg-violet-100 ring-4 ring-violet-200':'border-sky-300 bg-white')} aria-pressed={selectedSafetyNumber===n}>{['١','٢','٣','٤'][n-1]}</button>)}
   <button type="button" onClick={resetSafetyNumbers} className="rounded-full border bg-white px-4 py-2 font-bold">إعادة المحاولة</button>
  </div>
  {safetyFeedback&&<p role="status" className="mt-3 text-center font-bold text-violet-800">{safetyFeedback}</p>}
  {Object.keys(safetyNumbers).length===4&&<p className="mt-2 text-center font-extrabold text-green-700">رائع! أكملتِ النشاط بنجاح 🎉</p>}
 </> : <>
  <p className="mb-3 text-center text-sm">اكتب فوق الصورة بإصبعك أو بالقلم أو بالفأرة، واتبع الخطوط. يمكنك كتابة الأرقام داخل المربعات الفارغة.</p>
  <img src={`${import.meta.env.BASE_URL}grade1-u1-l2-tracing.jpg`} alt="ورقة نشاط تتبّع الخطوط وكتابة الأرقام داخل المربعات" className="block h-auto w-full"/>
 </>}
 </div>}
 {rhythmActivity&&<div className="rounded-2xl bg-cream p-4 mb-5">
 <h4 className="font-extrabold text-lg">النشاط التفاعلي: الشكل الإيقاعي 🎵</h4>
 <p className="my-2">نفّذ النشاط داخل الإطار. بعد الانتهاء، حدّد أنك أكملته ثم سلّم البيانات للمعلمة عبر واتساب.</p>
 <div className="relative w-full overflow-hidden rounded-xl bg-slate-100" style={{ aspectRatio: '4 / 3', minHeight: '420px' }}>
 <iframe src="https://ict.moe.gov.om/library/file/Content/4/Music/cls4_p1_u1_le3_nashat/start.html" title="النشاط التفاعلي للشكل الإيقاعي — الصف الرابع" className="absolute inset-0 h-full w-full border-0" allowFullScreen loading="lazy" />
 </div>
 <p className="mt-3 text-sm font-semibold text-ink/60">إذا لم يظهر النشاط هنا، <a href="https://ict.moe.gov.om/library/file/Content/4/Music/cls4_p1_u1_le3_nashat/start.html" target="_blank" rel="noreferrer" className="underline text-violet-700">افتحه في نافذة جديدة</a>.</p>
 <label className="mt-4 flex items-start gap-3 rounded-xl border bg-white p-3 font-bold"><input type="checkbox" className="mt-1 h-5 w-5" checked={rhythmActivityDone} onChange={e=>setRhythmActivityDone(e.target.checked)} /><span>أؤكد أنني أكملت النشاط التفاعلي.</span></label>
 </div>}
 {flagActivity&&<div className="rounded-2xl bg-cream p-4 mb-5"><h4 className="font-extrabold text-lg">النشاط: اسحب بطاقة العلم إلى العبارة المناسبة 🇴🇲</h4><p className="my-2">اسحب كل بطاقة ملوّنة أو رمز إلى العبارة التي تعبّر عنها. على الهاتف، اضغط على البطاقة ثم على العبارة المناسبة.</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">{flagClueItems.map(item=><button key={item.id} draggable onDragStart={e=>{setFlagDragged(item.id);e.dataTransfer.setData('text/plain',item.id)}} onClick={()=>setFlagDragged(item.id)} className={'rounded-xl border-2 bg-white p-3 font-bold '+(flagDragged===item.id?'border-violet-500 bg-violet-50':'border-slate-200')}><span className={'mx-auto mb-2 block h-12 w-16 rounded border '+(item.id==='green'?'bg-green-600':item.id==='red'?'bg-red-600':item.id==='white'?'bg-white':'bg-white')} style={item.id==='emblem'?{backgroundImage:"url(https://raw.githubusercontent.com/arnoha98-hash/naghmati/main/oman-flag.jpg)",backgroundSize:"300% 300%",backgroundPosition:"0% 0%"}:undefined} />{item.label}</button>)}</div><div className="space-y-3">{flagClueItems.map(item=><div key={item.id} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain')||flagDragged;if(flagClueItems.some(x=>x.id===id))setFlagClues(old=>({...old,[item.id]:id}));setFlagDragged(null)}} onClick={()=>{if(flagDragged){setFlagClues(old=>({...old,[item.id]:flagDragged}));setFlagDragged(null)}}} className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-3 cursor-pointer"><span className="flex-1 font-bold">{item.meaning}</span><span className={'min-w-24 rounded-xl border-2 border-dashed p-2 text-center '+(flagClues[item.id]?(flagClues[item.id]===item.id?'bg-green-50 border-green-400':'bg-rose-50 border-rose-300'):'bg-slate-50 border-slate-300')}>{flagClues[item.id]?flagClueItems.find(x=>x.id===flagClues[item.id])?.label:'اسحب البطاقة هنا'}</span>{flagClues[item.id]&&<span className="text-sm font-bold">{flagClues[item.id]===item.id?'صحيح ✓':'حاول مرة أخرى'}</span>}</div>)}</div><button onClick={()=>{setFlagClues({});setFlagDragged(null)}} className="mt-3 rounded-full bg-white border px-4 py-2 font-bold">إعادة المحاولة</button>{flagCluesDone&&<p className="mt-3 font-extrabold text-green-700">أحسنت! طابقت معاني ألوان ورموز العلم العُماني 🎉</p>}</div>}
 {anthem&&<div className="space-y-6">
 <div className="rounded-2xl bg-cream p-4"><h4 className="font-extrabold text-lg">{flagActivity?'النشاط الثاني: ركّب صورة علم سلطنة عُمان 🧩':'النشاط الأول: ركّب صورة علم سلطنة عُمان 🧩'}</h4><p className="my-2">اسحب القطع إلى أماكنها الصحيحة. على الهاتف، اضغط على قطعتين لتبديل مكانهما.</p><div className="grid grid-cols-3 gap-0 max-w-xl mx-auto rounded-xl overflow-hidden border-2 border-slate-300">{tiles.map((piece,slot)=>{const row=Math.floor(piece/3),col=piece%3;return <button key={slot} draggable onDragStart={e=>{setDragged(String(slot));e.dataTransfer.setData('text/plain',String(slot))}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const from=Number(e.dataTransfer.getData('text/plain')||dragged);if(Number.isInteger(from)&&from!==slot)swap(from,slot);setDragged(null)}} onClick={()=>{if(selected===null)setSelected(slot);else if(selected===slot)setSelected(null);else swap(selected,slot)}} aria-label={'قطعة '+(slot+1)} className={'relative aspect-[4/3] overflow-hidden bg-white '+(selected===slot?'ring-4 ring-violet-500 z-10':'')+(piece===slot?'':' cursor-grab')} style={{backgroundImage:'url(https://raw.githubusercontent.com/arnoha98-hash/naghmati/main/oman-flag.jpg)',backgroundSize:'300% 300%',backgroundPosition:(col*50)+'% '+(row*50)+'%',touchAction:'manipulation'}}><span className="absolute bottom-1 right-1 rounded-full bg-white/90 px-2 text-xs font-bold text-slate-800">{slot+1}</span></button>})}</div><div className="flex flex-wrap gap-2 mt-3"><button onClick={()=>{setTiles([...INITIAL]);setSelected(null)}} className="rounded-full bg-white border px-4 py-2 font-bold">إعادة ترتيب القطع</button><span className={'rounded-full px-4 py-2 font-bold '+(puzzleDone?'bg-green-100 text-green-800':'bg-white text-slate-600')}>{puzzleDone?'أحسنت! ركّبت العلم 🎉':'رتّب القطع لتكوين العلم'}</span></div><p className="text-xs text-ink/60 mt-2">ملاحظة: هذا نموذج تركيب مقسّم إلى 9 قطع مستطيلة من صورة العلم المرفوعة.</p>{flagAssemblyLesson&&<label className="mt-4 flex items-start gap-3 rounded-xl border-2 border-amber-300 bg-white p-3 font-bold"><input type="checkbox" className="mt-1 h-5 w-5" checked={flagAssemblyConfirmed} onChange={e=>setFlagAssemblyConfirmed(e.target.checked)} /><span>أؤكد أنني أكملت تركيب العلم.</span></label>}</div>

 {!flagActivity&&<div className="rounded-2xl bg-cream p-4"><h4 className="font-extrabold text-lg">النشاط الثاني: رتّب الصور على الجمل 🧩</h4><p className="my-2">اسحب كل صورة إلى الجملة المناسبة. على الهاتف، اضغط على الصورة ثم اضغط على الجملة التي تناسبها.</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">{PICTURES.map(pic=><button type="button" key={pic.id} draggable onDragStart={e=>{setDragged(pic.id);e.dataTransfer.setData('text/plain',pic.id)}} onClick={()=>setDragged(pic.id)} className={'rounded-xl border-2 bg-white p-3 text-center '+(dragged===pic.id?'border-violet-500 bg-violet-50':'border-slate-200')}><span className="block text-4xl mb-2" role="img" aria-label={pic.label}>{pic.emoji}</span><span className="font-bold">{pic.label}</span></button>)}</div><div className="space-y-3">{PROMPTS.map(p=><div key={p.id} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain')||dragged;if(PICTURES.some(pic=>pic.id===id))setMatches(old=>({...old,[p.id]:id}));setDragged(null)}} onClick={()=>{if(dragged&&PICTURES.some(pic=>pic.id===dragged)){setMatches(old=>({...old,[p.id]:dragged}));setDragged(null)}}} className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-3 cursor-pointer"><span className="flex-1 min-w-[180px] font-bold">{p.text}</span><span className={'min-w-32 rounded-xl border-2 border-dashed p-3 text-center '+(matches[p.id]?(matches[p.id]===p.answer?'bg-green-50 border-green-400':'bg-rose-50 border-rose-300'):'bg-slate-50 border-slate-300')}>{matches[p.id]?<><span className="block text-2xl">{PICTURES.find(pic=>pic.id===matches[p.id])?.emoji}</span><span className="text-sm font-bold">{PICTURES.find(pic=>pic.id===matches[p.id])?.label}</span></>:'ضع الصورة هنا'}</span>{matches[p.id]&&<span className={'text-sm font-bold '+(matches[p.id]===p.answer?'text-green-700':'text-rose-600')}>{matches[p.id]===p.answer?'صحيح ✓':'حاول مرة أخرى'}</span>}</div>)}</div><div className="flex flex-wrap items-center gap-2 mt-3"><button type="button" onClick={()=>{setMatches({});setDragged(null)}} className="rounded-full bg-white border px-4 py-2 font-bold">إعادة النشاط</button>{matchDone&&<span className="font-extrabold text-green-700">أحسنت! رتّبت كل الصور على الجمل الصحيحة 🎉</span>}</div></div>}
 </div>}
 {shading&&<div className="rounded-2xl bg-cream p-4 mb-5"><h4 className="font-extrabold text-lg">النشاط: اسحب صورة التظليل إلى الاسم المناسب 🎼</h4><p className="my-2">اسحب كل بطاقة موسيقية وضعها في المربع أمام اسم التظليل الصحيح. على الهاتف، اضغط على الصورة ثم اضغط على مكانها أمام الاسم.</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">{shadingItems.map(symbol=><button key={symbol.id} draggable onDragStart={e=>{setDragged(symbol.id);e.dataTransfer.setData('text/plain',symbol.id)}} onClick={()=>setDragged(symbol.id)} className={'rounded-xl border-2 bg-white p-3 min-h-24 '+(dragged===symbol.id?'border-violet-500 bg-violet-50':'border-slate-200')}><NotationSymbol kind={symbol.id}/><span className="block text-xs text-slate-500 mt-1">اسحب الصورة</span></button>)}</div><div className="space-y-3">{shadingItems.map(item=><div key={item.id} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain')||dragged;if(shadingItems.some(x=>x.id===id))setShadingMatches(old=>({...old,[item.id]:id}));setDragged(null)}} onClick={()=>{if(dragged&&shadingItems.some(x=>x.id===dragged)){setShadingMatches(old=>({...old,[item.id]:dragged}));setDragged(null)}}} className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-3 cursor-pointer"><span className="flex-1 font-extrabold">{item.name}</span><span className={'flex min-h-16 min-w-28 items-center justify-center rounded-xl border-2 border-dashed p-2 '+(shadingMatches[item.id]?(shadingMatches[item.id]===item.id?'bg-green-50 border-green-400':'bg-rose-50 border-rose-300'):'bg-slate-50 border-slate-300')}>{shadingMatches[item.id]?<span className="w-24"><NotationSymbol kind={shadingMatches[item.id]}/></span>:'ضع الصورة هنا'}</span>{shadingMatches[item.id]&&<span className={'text-sm font-bold '+(shadingMatches[item.id]===item.id?'text-green-700':'text-rose-600')}>{shadingMatches[item.id]===item.id?'صحيح ✓':'حاول مرة أخرى'}</span>}</div>)}</div><div className="flex flex-wrap gap-2 items-center mt-3"><button onClick={()=>{setShadingMatches({});setDragged(null)}} className="rounded-full bg-white border px-4 py-2 font-bold">مسح التوصيل</button>{shadingDone&&<span className="font-extrabold text-green-700">أحسنت! طابقت كل الصور بشكل صحيح 🎉</span>}</div></div>}
 <div className="mt-5 rounded-2xl border p-4"><h4 className="font-extrabold mb-3">بيانات التسليم</h4><label className="block font-bold">الاسم الرباعي</label><input className="w-full rounded-xl border p-3 my-2" value={name} onChange={e=>setName(e.target.value)} placeholder="اكتب الاسم الرباعي كاملًا"/><label className="block font-bold">الصف</label><input className="w-full rounded-xl border p-3 my-2" value={grade} onChange={e=>setGrade(e.target.value)} placeholder="مثال: الصف الأول / 1-أ"/><button disabled={!ready} onClick={send} className="mt-3 w-full rounded-full bg-green-600 p-3 font-extrabold text-white disabled:bg-slate-300">📲 تسليم الإجابات للمعلمة عبر واتساب</button>{!full&&<p className="text-sm text-rose-600 mt-2">اكتب الاسم الرباعي لتفعيل التسليم.</p>}{full&&!grade.trim()&&<p className="text-sm text-rose-600 mt-2">اكتب الصف لتفعيل التسليم.</p>}{anthem&&flagAssemblyLesson&&!flagAssemblyConfirmed&&<p className="text-sm text-rose-600 mt-2">حدّد «أؤكد أنني أكملت تركيب العلم» لتفعيل التسليم.</p>}{anthem&&!flagActivity&&puzzleDone&&!matchDone&&<p className="text-sm text-rose-600 mt-2">أكمل توصيل الصور بالجمل قبل التسليم.</p>}<p className="text-xs mt-3 text-ink/60">ستُفتح رسالة واتساب جاهزة؛ اضغط إرسال داخل واتساب لإيصالها للمعلمة.</p></div></section>
}

function NotationSymbol({kind}:{kind:string}) { return <svg viewBox="0 0 120 55" className="w-full h-12" aria-hidden="true">
{kind==='piano'&&<text x="60" y="43" textAnchor="middle" fontSize="48" fontFamily="serif" fontStyle="italic" fontWeight="bold">p</text>}
{kind==='forte'&&<text x="60" y="43" textAnchor="middle" fontSize="48" fontFamily="serif" fontStyle="italic" fontWeight="bold">f</text>}
{(kind==='crescendo'||kind==='diminuendo')&&<path d={kind==='crescendo'?'M 10 16 L 110 27 M 10 39 L 110 27':'M 10 27 L 110 16 M 10 27 L 110 39'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}
{(kind==='legato'||kind==='staccato')&&<>{[25,48,71,94].map(x=><g key={x}><line x1={x+4} y1="7" x2={x+4} y2="34" stroke="currentColor" strokeWidth="1.5"/><ellipse cx={x} cy="34" rx="5" ry="3.5" transform={`rotate(-25 ${x} 34)`} fill="currentColor"/>{kind==='staccato'&&<circle cx={x} cy="43" r="2" fill="currentColor"/>}</g>)}{kind==='legato'&&<path d="M 18 43 Q 60 58 102 43" fill="none" stroke="currentColor" strokeWidth="1.8"/>}</>}
</svg> }
