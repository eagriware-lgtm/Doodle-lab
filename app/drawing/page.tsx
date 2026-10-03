"use client";
import{useEffect,useRef,useState}from"react";

type Tool="pencil"|"brush"|"eraser"|"select"|"rectangle"|"circle"|"triangle"|"star"|"arrow"|"line";
type Point={x:number;y:number};
type Item={
 id:string;
 kind:"stroke"|"shape"|"text"|"image";
 tool?:Tool;
 color:string;
 size:number;
 points?:Point[];
 shape?:string;
 x:number;y:number;w:number;h:number;
 text?:string;
 src?:string;
 visible:boolean;
};
type Snapshot={items:Item[];selected:string|null};

const W=1400,H=760;

export default function Drawing(){
 const canvas=useRef<HTMLCanvasElement>(null);
 const fileInput=useRef<HTMLInputElement>(null);
 const imageInput=useRef<HTMLInputElement>(null);
 const[color,setColor]=useState("#20211f");
 const[size,setSize]=useState(6);
 const[tool,setTool]=useState<Tool>("pencil");
 const[pattern,setPattern]=useState(false);
 const[text,setText]=useState("");
 const[items,setItems]=useState<Item[]>([]);
 const[selected,setSelected]=useState<string|null>(null);
 const[current,setCurrent]=useState<Point[]>([]);
 const[shapePreview,setShapePreview]=useState<Item|null>(null);
 const[down,setDown]=useState(false);
 const[creator,setCreator]=useState("");
 const[projectName,setProjectName]=useState("My Doodle");
 const[videoUrl,setVideoUrl]=useState("");
 const[videoName,setVideoName]=useState("");
 const[videoBox,setVideoBox]=useState({x:120,y:100,w:520,h:300});
 const[videoScale,setVideoScale]=useState(100);
 const[showLayers,setShowLayers]=useState(true);
 const[message,setMessage]=useState("Ready.");
 const history=useRef<Snapshot[]>([]);
 const future=useRef<Snapshot[]>([]);
 const drag=useRef<{id:string;start:Point;ox:number;oy:number}|null>(null);
 const historyBusy=useRef(false);
 const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36);
 const clone=(v:Item[])=>v.map(x=>({...x,points:x.points?.map(p=>({...p}))}));
 const snap=():Snapshot=>({items:clone(items),selected});
 const pushHistory=()=>{if(historyBusy.current)return;history.current.push(snap());if(history.current.length>50)history.current.shift();future.current=[]};
 const restore=(s:Snapshot)=>{historyBusy.current=true;setItems(clone(s.items));setSelected(s.selected);setCurrent([]);setShapePreview(null);historyBusy.current=false};
 const pos=(e:React.PointerEvent)=>{const c=canvas.current!,r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}};
 const bounds=(it:Item)=>{if(it.kind==="stroke"&&it.points?.length){const xs=it.points.map(p=>p.x),ys=it.points.map(p=>p.y);const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);return{x:minX-8,y:minY-8,w:Math.max(16,maxX-minX+16),h:Math.max(16,maxY-minY+16)}}return{x:it.x,y:it.y,w:Math.max(1,it.w),h:Math.max(1,it.h)}};
 const hit=(p:Point)=>{for(let i=items.length-1;i>=0;i--){const it=items[i];if(!it.visible)continue;const b=bounds(it);if(p.x>=b.x-10&&p.x<=b.x+b.w+10&&p.y>=b.y-10&&p.y<=b.y+b.h+10)return it}return null};
 const repeat=(pts:Point[])=>{if(!pattern||pts.length<2)return[];const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),w=Math.max(maxX-minX,40),h=Math.max(maxY-minY,40),out:Point[][]=[];for(let y=-h;y<H+h;y+=h+24)for(let x=-w;x<W+w;x+=w+24)out.push(pts.map(p=>({x:p.x-minX+x,y:p.y-minY+y})));return out};
 const drawShape=(g:CanvasRenderingContext2D,it:Item)=>{const{x,y,w,h}=it;g.strokeStyle=it.color;g.fillStyle=it.color+"22";g.lineWidth=it.size;g.lineCap="round";g.lineJoin="round";g.beginPath();if(it.shape==="rectangle")g.rect(x,y,w,h);else if(it.shape==="circle")g.ellipse(x+w/2,y+h/2,Math.abs(w/2),Math.abs(h/2),0,0,Math.PI*2);else if(it.shape==="triangle"){g.moveTo(x+w/2,y);g.lineTo(x+w,y+h);g.lineTo(x,y+h);g.closePath()}else if(it.shape==="star"){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5;const px=x+w/2+Math.cos(a)*(i%2?w*.48:w*.23),py=y+h/2+Math.sin(a)*(i%2?h*.48:h*.23);i?g.lineTo(px,py):g.moveTo(px,py)}g.closePath()}else if(it.shape==="line"){g.moveTo(x,y);g.lineTo(x+w,y+h)}else if(it.shape==="arrow"){g.moveTo(x,y);g.lineTo(x+w,y+h);const a=Math.atan2(h,w),len=18;g.lineTo(x+w-len*Math.cos(a-.55),y+h-len*Math.sin(a-.55));g.moveTo(x+w,y+h);g.lineTo(x+w-len*Math.cos(a+.55),y+h-len*Math.sin(a+.55))}g.stroke();if(["rectangle","circle","triangle","star"].includes(it.shape||""))g.fill()};
 const render=()=>{const c=canvas.current;if(!c)return;const g=c.getContext("2d")!;g.clearRect(0,0,W,H);g.fillStyle="#fffdf9";g.fillRect(0,0,W,H);for(const it of items){if(!it.visible)continue;if(it.kind==="image"&&it.src){const im=new Image();im.onload=()=>{g.drawImage(im,it.x,it.y,it.w,it.h);if(it.id===selected)drawSelection(g,it)};im.src=it.src;continue}if(it.kind==="text"){g.fillStyle=it.color;g.font=`700 ${Math.max(14,it.size*4)}px sans-serif`;g.fillText(it.text||"",it.x,it.y);continue}if(it.kind==="shape"){drawShape(g,it);continue}const pts=it.points||[];if(pts.length<1)continue;g.strokeStyle=it.color;g.lineWidth=it.size*(it.tool==="brush"?2:1);g.lineCap="round";g.lineJoin="round";const paint=(p:Point[])=>{g.beginPath();p.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.stroke()};paint(pts);if(pattern&&pts.length>1)for(const p of repeat(pts))paint(p);if(it.id===selected)drawSelection(g,it)}if(shapePreview)drawShape(g,shapePreview);if(current.length){const temp:Item={id:"preview",kind:"stroke",color,size,tool,points:current,x:0,y:0,w:0,h:0,visible:true};const pts=current;g.strokeStyle=color;g.lineWidth=size*(tool==="brush"?2:1);g.lineCap="round";g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();if(pattern&&pts.length>1)for(const p of repeat(pts)){g.beginPath();p.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.stroke()}void temp}};
 const drawSelection=(g:CanvasRenderingContext2D,it:Item)=>{const b=bounds(it);g.save();g.setLineDash([7,5]);g.strokeStyle="#ed765f";g.lineWidth=2;g.strokeRect(b.x,b.y,b.w,b.h);g.setLineDash([]);g.fillStyle="#ed765f";g.fillRect(b.x+b.w-5,b.y+b.h-5,10,10);g.restore()};
 useEffect(()=>{render()},[items,current,shapePreview,selected,pattern,color,size]);
 const undo=()=>{const h=history.current.pop();if(!h){setMessage("Nothing to undo.");return}future.current.push(snap());restore(h);setMessage("Undo.");};
 const redo=()=>{const f=future.current.pop();if(!f){setMessage("Nothing to redo.");return}history.current.push(snap());restore(f);setMessage("Redo.");};
 const addItem=(it:Item)=>{pushHistory();setItems(v=>[...v,it]);setSelected(it.id)};
 const start=(e:React.PointerEvent)=>{const p=pos(e);setDown(true);if(tool==="select"){const found=hit(p);setSelected(found?.id||null);if(found){pushHistory();drag.current={id:found.id,start:p,ox:found.x,oy:found.y}}return}if(tool==="eraser"){pushHistory();setItems(v=>v.filter(it=>{const b=bounds(it);return !(p.x>=b.x-16&&p.x<=b.x+b.w+16&&p.y>=b.y-16&&p.y<=b.y+b.h+16)}));return}if(["rectangle","circle","triangle","star","arrow","line"].includes(tool)){setShapePreview({id:"preview",kind:"shape",shape:tool,color,size,x:p.x,y:p.y,w:1,h:1,visible:true});setCurrent([p]);return}setCurrent([p])};
 const move=(e:React.PointerEvent)=>{if(!down)return;const p=pos(e);if(tool==="select"&&drag.current){const d=drag.current;setItems(v=>v.map(it=>it.id===d.id?{...it,x:Math.max(0,Math.min(W-it.w,d.ox+p.x-d.start.x)),y:Math.max(0,Math.min(H-it.h,d.oy+p.y-d.start.y))}:it));return}if(tool==="eraser"){setItems(v=>v.filter(it=>{const b=bounds(it);return !(p.x>=b.x-16&&p.x<=b.x+b.w+16&&p.y>=b.y-16&&p.y<=b.y+b.h+16)}));return}if(shapePreview){setShapePreview(v=>v?{...v,w:p.x-v.x,h:p.y-v.y}:v);return}setCurrent(v=>[...v,p])};
 const end=()=>{if(!down)return;setDown(false);if(tool==="select"){drag.current=null;return}if(tool==="eraser"){setSelected(null);return}if(shapePreview){pushHistory();const s={...shapePreview,id:uid(),x:Math.min(shapePreview.x,shapePreview.x+shapePreview.w),y:Math.min(shapePreview.y,shapePreview.y+shapePreview.h),w:Math.abs(shapePreview.w),h:Math.abs(shapePreview.h)};setItems(v=>[...v,s]);setSelected(s.id);setShapePreview(null);setCurrent([]);return}if(current.length){pushHistory();const s:Item={id:uid(),kind:"stroke",tool,color,size,points:current,x:0,y:0,w:0,h:0,visible:true};setItems(v=>[...v,s]);setCurrent([])}};
 const addText=()=>{const value=text.trim();if(!value)return;addItem({id:uid(),kind:"text",text:value,color,size,x:80,y:100+items.filter(i=>i.kind==="text").length*45,w:Math.max(100,value.length*size*2),h:size*5,visible:true});setText("")};
 const clear=()=>{if(!items.length)return;pushHistory();setItems([]);setSelected(null);setMessage("Canvas cleared.")};
 const deleteSelected=()=>{if(!selected)return;pushHistory();setItems(v=>v.filter(i=>i.id!==selected));setSelected(null);setMessage("Selected item deleted.")};
 const duplicateSelected=()=>{const it=items.find(i=>i.id===selected);if(!it)return;pushHistory();const copy={...it,id:uid(),x:it.x+30,y:it.y+30,points:it.points?.map(p=>({x:p.x+30,y:p.y+30}))};setItems(v=>[...v,copy]);setSelected(copy.id)};
 const resizeSelected=(factor:number)=>{const it=items.find(i=>i.id===selected);if(!it)return;pushHistory();setItems(v=>v.map(x=>x.id===selected?{...x,w:Math.max(10,x.w*factor),h:Math.max(10,x.h*factor)}:x))};
 const toggleLayer=(id:string)=>{setItems(v=>v.map(x=>x.id===id?{...x,visible:!x.visible}:x))};
 const moveLayer=(id:string,dir:number)=>{const i=items.findIndex(x=>x.id===id),j=i+dir;if(i<0||j<0||j>=items.length)return;pushHistory();setItems(v=>{const a=[...v],[q]=a.splice(i,1);a.splice(j,0,q);return a})};
 const chooseImage=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f||!f.type.startsWith("image/"))return;const r=new FileReader();r.onload=()=>{addItem({id:uid(),kind:"image",src:String(r.result),color,size,x:120,y:100,w:420,h:280,visible:true});setMessage("Image added.");};r.readAsDataURL(f)};
 const chooseVideo=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f||!f.type.startsWith("video/"))return;setVideoUrl(v=>{if(v)URL.revokeObjectURL(v);return URL.createObjectURL(f)});setVideoName(f.name);setVideoScale(100);setVideoBox({x:120,y:100,w:520,h:300})};
 useEffect(()=>()=>{if(videoUrl)URL.revokeObjectURL(videoUrl)},[videoUrl]);
 const resizeVideo=(value:number)=>{const scale=value/100,w=Math.min(1300,Math.max(180,520*scale)),h=Math.min(700,Math.max(104,300*scale));setVideoScale(value);setVideoBox(v=>({...v,w,h,x:Math.max(0,Math.min(W-w,v.x)),y:Math.max(0,Math.min(H-h,v.y))}))};
 const saveProject=()=>{const project={version:2,title:projectName,items,selected,pattern,savedAt:new Date().toISOString()};const files=JSON.parse(localStorage.getItem("doodle-projects")||"[]");files.unshift({id:Date.now().toString(),title:projectName,mode:"Drawing",project});localStorage.setItem("doodle-projects",JSON.stringify(files.slice(0,50)));const png=canvas.current?.toDataURL("image/png")||"";const old=JSON.parse(localStorage.getItem("doodle-files")||"[]");old.unshift({id:Date.now().toString(),mode:"Drawing",title:projectName,data:png});localStorage.setItem("doodle-files",JSON.stringify(old.slice(0,50)));setMessage("Editable project saved locally.");};
 const loadProject=()=>{const files=JSON.parse(localStorage.getItem("doodle-projects")||"[]");const p=files[0]?.project;if(!p){setMessage("No saved editable project yet.");return}history.current=[];future.current=[];setProjectName(p.title||"My Doodle");setItems(p.items||[]);setSelected(p.selected||null);setPattern(!!p.pattern);setMessage("Loaded latest editable project.")};
 const runCreator=()=>{const q=creator.trim().toLowerCase();if(!q)return;const n=(q.match(/\d+(?:\.\d+)?/g)||[]).map(Number);if(/undo/.test(q)){undo();return}if(/redo/.test(q)){redo();return}if(/clear/.test(q)){clear();return}if(/pattern/.test(q)){setPattern(v=>!v);setMessage("Pattern mode toggled.");return}if(/delete|remove/.test(q)){deleteSelected();return}if(/duplicate|copy/.test(q)){duplicateSelected();return}if(/select/.test(q)){setTool("select");setMessage("Selection tool ready.");return}if(/blue|red|green|black|purple/.test(q)){const map:{[k:string]:string}={blue:"#3366ff",red:"#e44",green:"#2c9b58",black:"#20211f",purple:"#7a4cc2"};const k=Object.keys(map).find(x=>q.includes(x));if(k)setColor(map[k]);setMessage("Creator changed the color.");return}if(/brush/.test(q)){setTool("brush");if(n[0])setSize(Math.min(40,Math.max(1,n[0])));else setSize(14);setMessage("Brush updated.");return}if(/pencil/.test(q)){setTool("pencil");setMessage("Pencil selected.");return}if(/(circle|rectangle|triangle|star|arrow|line)/.test(q)){const k=(["circle","rectangle","triangle","star","arrow","line"] as const).find(x=>q.includes(x))!;setTool(k);if(/make|create|add/.test(q)){const w=n[0]||180,h=n[1]||w;addItem({id:uid(),kind:"shape",shape:k,color,size,x:160,y:120,w,h,visible:true});setMessage("Creator made a "+k+".")}else setMessage(k+" tool selected.");return}if(/text|write|say/.test(q)){const m=q.match(/(?:text|write|say)\s+(?:that\s+)?(.+)/);if(m){setText(m[1]);addItem({id:uid(),kind:"text",text:m[1],color,size,x:100,y:120,w:300,h:40,visible:true});setMessage("Creator added text.");return}}setMessage("Try: make a blue circle, select, undo, duplicate, clear, pattern, or brush 20.")};
 const tools:[Tool,string][]=[["select","↖ Select"],["pencil","✏️ Pencil"],["brush","🖌️ Brush"],["eraser","⌫ Eraser"],["rectangle","▭ Rectangle"],["circle","○ Circle"],["triangle","△ Triangle"],["star","☆ Star"],["arrow","↗ Arrow"],["line","╱ Line"]];
 return <div className="shell"><Header/><main className="workspace">
 <div className="workspaceHead"><div><span className="badge">🎨 Drawing Studio 2.0</span><h1>Make something.</h1><p>Draw, edit, arrange, save, and build ideas on one canvas.</p></div></div>
 <div className="drawingTools">
  <div className="toolGroup">{tools.map(([k,label])=><button key={k} className={tool===k?"tool active":"tool"} onClick={()=>setTool(k)}>{label}</button>)}<button className={pattern?"tool active":"tool"} onClick={()=>setPattern(v=>!v)}>🌀 Pattern {pattern?"ON":"OFF"}</button></div>
  <div className="toolGroup textGroup"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addText()} placeholder="Type text..."/><button className="tool" onClick={addText}>T Add text</button></div>
  <div className="toolGroup"><label className="tool">🎨 <input aria-label="Color" type="color" value={color} onChange={e=>setColor(e.target.value)}/></label><label className="sizeControl">Size <input type="range" min="1" max="40" value={size} onChange={e=>setSize(+e.target.value)}/></label><button className="tool" onClick={undo}>↶ Undo</button><button className="tool" onClick={redo}>↷ Redo</button><button className="tool" onClick={deleteSelected}>🗑 Delete</button><button className="tool" onClick={duplicateSelected}>⧉ Duplicate</button><button className="tool" onClick={()=>resizeSelected(1.15)}>＋ Size</button><button className="tool" onClick={()=>resizeSelected(.87)}>－ Size</button></div>
  <div className="toolGroup"><input value={projectName} onChange={e=>setProjectName(e.target.value)} aria-label="Project name" placeholder="Project name"/><button className="tool" onClick={saveProject}>💾 Save Project</button><button className="tool" onClick={loadProject}>📂 Load Latest</button><button className="tool" onClick={()=>imageInput.current?.click()}>🖼️ Add Image</button><button className="tool" onClick={()=>fileInput.current?.click()}>🎬 Choose Video</button><button className="tool" onClick={clear}>Clear</button></div>
  <div className="toolGroup creatorRow"><span className="creatorBadge">⚡ CREATOR MODE</span><input value={creator} onChange={e=>setCreator(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runCreator()} placeholder='Try “make a blue circle”'/><button className="tool active" onClick={runCreator}>Run</button></div>
 </div>
 <div className="studioLayout">
  <div className="canvasWrap" style={{position:"relative"}}><canvas ref={canvas} width={W} height={H} className="canvas" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onPointerLeave={()=>down&&end()}/>{videoUrl&&<div style={{position:"absolute",left:`${videoBox.x/W*100}%`,top:`${videoBox.y/H*100}%`,width:`${videoBox.w/W*100}%`,height:`${videoBox.h/H*100}%`,border:"2px solid #20211f",borderRadius:12,overflow:"hidden",background:"#111",boxSizing:"border-box"}}><video src={videoUrl} controls playsInline style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/><div style={{position:"absolute",left:8,top:8,padding:"5px 8px",borderRadius:7,background:"#fffdf9dd",fontSize:11,fontWeight:800}}>🎬 {videoName}</div></div>}<div className="canvasStatus">{message}</div></div>
  {showLayers&&<aside className="layersPanel"><div className="layersHead"><b>Layers</b><button className="tool" onClick={()=>setShowLayers(false)}>×</button></div>{items.length===0&&<p className="layerEmpty">Your canvas is empty.</p>}{[...items].reverse().map(it=><div key={it.id} className={selected===it.id?"layer selected":"layer"} onClick={()=>setSelected(it.id)}><span>{it.visible?"◉":"○"}</span><strong>{it.kind==="shape"?it.shape:it.kind==="text"?(it.text||"Text").slice(0,18):it.kind==="image"?"Image":"Drawing"}</strong><button onClick={e=>{e.stopPropagation();toggleLayer(it.id)}}>{it.visible?"Hide":"Show"}</button><button onClick={e=>{e.stopPropagation();moveLayer(it.id,1)}}>↑</button><button onClick={e=>{e.stopPropagation();moveLayer(it.id,-1)}}>↓</button></div>)}<div className="layerHint">Select an item to move it. Delete, duplicate, resize, hide, or reorder it.</div></aside>}
 </div>
 <input ref={imageInput} type="file" accept="image/*" onChange={chooseImage} style={{display:"none"}}/><input ref={fileInput} type="file" accept="video/*" onChange={chooseVideo} style={{display:"none"}}/>
 {videoUrl&&<label className="sizeControl videoSize">🎬 Video size <input type="range" min="30" max="180" step="5" value={videoScale} onChange={e=>resizeVideo(+e.target.value)}/><span>{videoScale}%</span></label>}
 </main></div>
}

function Header(){return <header className="nav"><a className="brand" href="/"><span className="brandMark">✦</span><span>Doodle <i>Lab</i></span></a><nav className="links"><a href="/">Home</a><a href="/projects">Projects</a><a href="/modes">Modes</a><a href="/settings">Settings</a></nav><a className="navCta" href="/drawing">Drawing</a></header>}
