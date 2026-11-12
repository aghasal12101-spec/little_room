/* Shared, deterministic game rules. No rendering or browser dependencies. */
globalThis.RoomRules = (() => {
  const contracts = {
    coder: {name:'日光里的工作室',client:'林间 · 远程开发者',layout:'studio',budget:15000,story:'白天认真工作，晚上好好休息。想要一张有台灯的书桌，以及触手可及的书架。',badge:'专注生活家'},
    cats: {name:'两个人的日常',client:'小夏 & 阿牧 · 新婚家庭',layout:'suite',budget:22000,story:'一起吃饭、一起看电影，也把衣物和睡前读物收拾妥当。卧室需要安静独立。',badge:'温柔共居家'},
    balcony:{name:'阳台上的周末',client:'阿澄 · 植物爱好者',layout:'balcony',budget:18000,level:2,story:'把阳台留给植物和阅读。屋里也要能好好睡觉、吃饭，通往阳台的门别挡住。',badge:'阳台园艺家'},
    duo:{name:'各自专注，一起生活',client:'安安与阿哲 · 双人居家办公',layout:'corridor',budget:24000,level:3,story:'两个人都需要独立的书桌、椅子和桌灯。狭长走廊要通畅，下班后一起在沙发休息。',badge:'默契空间师'},
    chef:{name:'转角有烟火',client:'阿满 · 美食记录者',layout:'kitchen',budget:20000,level:2,story:'在转角厨房准备晚餐，摆好冰箱和料理台，再留一处两人用餐、休息和收纳的地方。',badge:'烟火生活家'},
    rental: {name:'预算里的小确幸',client:'小禾 · 刚搬家的毕业生',layout:'loft',budget:9500,story:'钱不多，生活也值得认真布置。用实用家具、绿植和一幅画，把出租屋变成家。',badge:'精打细算家'}
  };
  const angle=f=>f.rot*Math.PI/2;
  const dims=(f,defs)=>{const a=angle(f),w=defs[f.type].w,d=defs[f.type].d;return [Math.abs(Math.cos(a))*w+Math.abs(Math.sin(a))*d,Math.abs(Math.sin(a))*w+Math.abs(Math.cos(a))*d]};
  const corners=(f,defs)=>{const {w,d}=defs[f.type],a=angle(f),c=Math.cos(a),sn=Math.sin(a);return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([x,z])=>[f.x+c*x+sn*z,f.z-sn*x+c*z])};
  function overlap(a,b,defs,pad=-.015){const pa=corners(a,defs),pb=corners(b,defs);for(const f of [a,b])for(const t of [angle(f),angle(f)+Math.PI/2]){const axis=[Math.cos(t),-Math.sin(t)],project=p=>p.map(v=>v[0]*axis[0]+v[1]*axis[1]),aa=project(pa),bb=project(pb);if(Math.max(...aa)<=Math.min(...bb)-pad||Math.max(...bb)<=Math.min(...aa)-pad)return false}return true}
  const familyIds=(f,s)=>{const roots=s.furniture.filter(o=>o.id===f.id||(!f.parentId&&f.groupId&&o.groupId===f.groupId));return new Set([...roots.map(o=>o.id),...s.furniture.filter(o=>roots.some(r=>o.parentId===r.id)).map(o=>o.id)])};
  const progress=badges=>{const completed=[...new Set(badges||[])].filter(id=>contracts[id]);const xp=completed.length*100,thresholds=[0,100,300,500],level=thresholds.filter(v=>xp>=v).length;return {xp,level,next:thresholds[level]||null,title:['新芽设计师','日常造梦师','空间策划师','理想生活家'][level-1]}};
  const total=(s,defs)=>s.furniture.reduce((v,f)=>v+defs[f.type].price,0);
  const budget=s=>s.mode==='challenge'&&s.round===2&&s.roundRules===2&&s.contract==='rental'?9000:s.mode==='challenge'?Math.round((contracts[s.contract]?.budget||18000)*(s.round===2?.85:1)):Infinity;
  function inside(l,x,z,margin=0){const point=(x,z)=>l.regions.some(([x1,x2,z1,z2])=>x>=x1-1e-8&&x<=x2+1e-8&&z>=z1-1e-8&&z<=z2+1e-8);return [[x-margin,z-margin],[x+margin,z-margin],[x-margin,z+margin],[x+margin,z+margin]].every(p=>point(...p))}
  function reason(f,s,defs,ls){
    const def=defs[f.type], l=ls.find(l=>l.id===s.layout), [w,d]=dims(f,defs), y=f.y||.03;
    if(def.mount==='wall'){
      const wall=l.walls[f.wallIndex];if(!wall)return '请把挂件移到墙面上';
      const [ax,az,bx,bz]=wall, vertical=ax===bx, along=vertical?f.z:f.x,lo=vertical?Math.min(az,bz):Math.min(ax,bx),hi=vertical?Math.max(az,bz):Math.max(ax,bx);
      if(along-def.w/2<lo+.08||along+def.w/2>hi-.08||y<.65||y+def.h>2.15)return '挂件超出了墙面范围';
      const expected=vertical?ax+.10:az+.10;if(Math.abs((vertical?f.x:f.z)-expected)>.015||f.rot!==(vertical?1:0))return '挂件需要贴合墙面';
      const wx=l.id==='loft'?-2:-1.2;
      if(!vertical&&az===-l.d/2&&Math.abs(f.x-wx)<(def.w+1.65)/2&&y<1.92&&y+def.h>.68)return '这里是窗户，请换一段墙面';
      for(const o of s.furniture){if(o.id===f.id||defs[o.type].mount!=='wall'||o.wallIndex!==f.wallIndex)continue;const od=defs[o.type];if(Math.abs(along-(vertical?o.z:o.x))<(def.w+od.w)/2+.03&&y<(o.y||.03)+od.h&&y+def.h>(o.y||.03))return '碰到「'+od.name+'」了'}
      return '';
    }
    if(!f.parentId&&Math.abs(y-.03)>.015)return '地面家具必须落在地板上';
    if(f.parentId){
      const parent=s.furniture.find(o=>o.id===f.parentId);if(!parent||!defs[parent.type].surface)return '需要一张桌子或柜子作为承托';
      const a=angle(parent),c=Math.cos(a),sn=Math.sin(a),pd=defs[parent.type];if(corners(f,defs).some(([x,z])=>Math.abs(c*(x-parent.x)-sn*(z-parent.z))>pd.w/2-.025||Math.abs(sn*(x-parent.x)+c*(z-parent.z))>pd.d/2-.025))return '摆件超出了桌面边缘';
      if(Math.abs(y-((parent.y||.03)+defs[parent.type].surface))>.015)return '摆件必须落在桌面上';
    }else if(def.mount==='surface')return '请先放一张桌子或柜子，再把摆件放上去';
    const outline=corners(f,defs),perimeter=outline.flatMap((p,i)=>{const q=outline[(i+1)%4],n=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/.1);return Array.from({length:n},(_,j)=>[p[0]+(q[0]-p[0])*j/n,p[1]+(q[1]-p[1])*j/n])});if(![...perimeter,[f.x,f.z]].every(([x,z])=>inside(l,x,z,.065)))return '超出房间边界了';
    if(l.id==='suite'&&f.x-w/2<1.07&&f.x+w/2>.93&&(f.z-d/2<-.44||f.z+d/2>1.04))return '碰到卧室隔墙了，请从门洞通过';
    for(const wall of l.barriers||[]){const [ax,az,bx,bz]=wall,wallDef={wall:{w:Math.abs(bx-ax)||.12,d:Math.abs(bz-az)||.12}};if(overlap(f,{type:'wall',x:(ax+bx)/2,z:(az+bz)/2,rot:0},{...defs,...wallDef},.025))return '碰到功能区隔墙了，请留出门洞'}
    for(const o of s.furniture){
      if(o.id===f.id||o.id===f.parentId||o.parentId===f.id||defs[o.type].mount==='wall')continue;
      const od=defs[o.type];if((def.type==='rug')!==(od.type==='rug'))continue;
      if((f.parentId||o.parentId)&&((y+def.h<=(o.y||.03)+.01)||((o.y||.03)+od.h<=y+.01)))continue;
      if(overlap(f,o,defs))return '碰到「'+od.name+'」了';
    }
    return '';
  }
  function transformFamily(original,next,s){
    const ids=familyIds(original,s);const delta=(next.rot-original.rot)*Math.PI/2,c=Math.cos(delta),sn=Math.sin(delta);
    return s.furniture.map(o=>o.id===next.id?{...next}:ids.has(o.id)?{...o,x:next.x+c*(o.x-original.x)+sn*(o.z-original.z),z:next.z-sn*(o.x-original.x)+c*(o.z-original.z),rot:(o.rot+next.rot-original.rot+4)%4,y:(o.y||.03)+(next.y||.03)-(original.y||.03)}:{...o});
  }
  function baseGoals(s,defs){
    const has=t=>s.furniture.some(f=>f.type===t||defs[f.type].type===t),cat=c=>s.furniture.some(f=>defs[f.type].cat===c), attached=(t,parent)=>s.furniture.some(f=>(f.type===t||defs[f.type].type===t)&&s.furniture.some(p=>p.id===f.parentId&&p.type===parent));
    const sleep=has('bed'), rest=has('sofa')||has('chair')||has('beanbag')||has('bench'),green=has('plant')||has('cactus')||has('deskplant');
    if(s.mode==='challenge'&&s.contract==='balcony')return [['阳台至少两盆绿植',s.furniture.filter(f=>['plant','cactus'].includes(f.type)&&f.z< -2.3).length>=2],['阳台阅读椅与边几',s.furniture.some(f=>['chair','bench'].includes(defs[f.type].type)&&f.z< -2.3)&&s.furniture.some(f=>f.type==='side'&&f.z< -2.3)],['室内的床与收纳',sleep&&cat('收纳')],['餐桌与两把书椅',has('dining')&&s.furniture.filter(f=>f.type==='stool').length>=2],['一盏灯与一本书',(has('lamp')||has('tablelamp'))&&has('books')]];
    if(s.mode==='challenge'&&s.contract==='duo')return [['两张独立书桌',s.furniture.filter(f=>f.type==='desk').length>=2],['两把书椅',s.furniture.filter(f=>f.type==='stool').length>=2],['每张书桌都有台灯',new Set(s.furniture.filter(f=>defs[f.type].type==='tablelamp'&&s.furniture.some(p=>p.id===f.parentId&&p.type==='desk')).map(f=>f.parentId)).size>=2],['床与衣柜',sleep&&has('wardrobe')],['共同休憩的沙发与绿植',has('sofa')&&green]];
    if(s.mode==='challenge'&&s.contract==='chef')return [['转角厨房里的料理台',s.furniture.some(f=>f.type==='counter'&&f.x< -1&&f.z< -1)],['厨房里的一台冰箱',s.furniture.some(f=>f.type==='fridge'&&f.x< -1&&f.z< -1)],['餐桌与两把书椅',has('dining')&&s.furniture.filter(f=>f.type==='stool').length>=2],['沙发与收纳',has('sofa')&&cat('收纳')],['桌面小花与灯光',has('vase')&&(has('lamp')||has('tablelamp'))]];
    if(s.mode==='challenge'&&s.contract==='coder')return [['完整办公区：书桌 + 书椅',has('desk')&&has('stool')],['把台灯摆上书桌',attached('tablelamp','desk')],['一张床，安放好梦',sleep],['书架与书本，灵感常在',has('shelf')&&has('books')],['绿意与休憩角落',green&&rest]];
    if(s.mode==='challenge'&&s.contract==='cats')return [['双人床放在独立卧室',s.furniture.some(f=>f.type==='bed'&&f.x>1.9)],['一起用餐：餐桌 + 两把书椅',has('dining')&&s.furniture.filter(f=>f.type==='stool').length>=2],['沙发与电视柜，共度夜晚',has('sofa')&&has('tv')],['卧室床边柜与穿衣镜',s.furniture.some(f=>f.type==='nightstand'&&f.x>1.9)&&s.furniture.some(f=>f.type==='mirror'&&f.x>1.9)],['桌面小花与温暖灯光',has('vase')&&(has('lamp')||has('tablelamp'))]];
    if(s.mode==='challenge'&&s.contract==='rental')return [['一张床 + 一件收纳',sleep&&cat('收纳')],['实用书桌与书椅',has('desk')&&has('stool')],['墙上一幅属于自己的画',has('art')],['绿植与地毯，让家呼吸',green&&has('rug')],['灯光与休憩角落',(has('lamp')||has('tablelamp'))&&rest]];
    return [['舒适的休憩角落',rest],['好好睡觉与收纳',sleep&&cat('收纳')],['一盏灯，温柔每个夜晚',(has('lamp')||has('tablelamp'))],['绿植与地毯，让家呼吸',green&&has('rug')],['桌面摆件或墙上挂画',s.furniture.some(f=>f.parentId)||has('art')||has('clock')]];
  }
  // A segment must stay in the room and cannot cross a partition or solid furniture.
  function connection(a,b,s,defs,ls=[],mode='walk'){
    const fallback={suite:[[1,-3,1,-.5],[1,1.1,1,3]],balcony:[[-4,-2,0,-2],[1.5,-2,4,-2]],corridor:[[1,-3.5,1,-.6],[1,1,1,3.5],[-4.5,.5,-1.5,.5]],kitchen:[[-1,-4,-1,-1.7]]};
    const l=ls.find(l=>l.id===s.layout),walls=l?(l.id==='suite'?fallback.suite:l.barriers||[]):fallback[s.layout]||[];
    for(const [x1,z1,x2,z2] of walls){const dx=b.x-a.x,dz=b.z-a.z,t=x1===x2?(x1-a.x)/dx:(z1-a.z)/dz;if(t>0&&t<1){const v=x1===x2?a.z+t*dz:a.x+t*dx;if(v>=Math.min(x1===x2?z1:x1,x1===x2?z2:x2)-.06&&v<=Math.max(x1===x2?z1:x1,x1===x2?z2:x2)+.06)return false}}
    const n=Math.max(2,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.08));
    for(let i=1;i<n;i++){const x=a.x+(b.x-a.x)*i/n,z=a.z+(b.z-a.z)*i/n;if(l&&!inside(l,x,z,.02))return false;for(const o of s.furniture){if(o.id===a.id||o.id===b.id||o.parentId||defs[o.type].mount==='wall'||defs[o.type].type==='rug'||(mode==='sight'&&defs[o.type].h<.9))continue;const c=Math.cos(angle(o)),sn=Math.sin(angle(o)),dx=x-o.x,dz=z-o.z;if(Math.abs(c*dx-sn*dz)<defs[o.type].w/2+.025&&Math.abs(sn*dx+c*dz)<defs[o.type].d/2+.025)return false}}
    return true;
  }
  function relationships(s,defs,ls=[]){
    const floor=s.furniture.filter(f=>!f.parentId),details=[],checks=[],distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
    const facing=(a,b)=>{const d=distance(a,b);return d?(Math.sin(angle(a))*(b.x-a.x)+Math.cos(angle(a))*(b.z-a.z))/d:-1};
    const add=(value,message,ids,critical=false)=>{checks.push(value);if(value<100)details.push({message,ids:[...new Set(ids)],critical})};
    const seats=floor.filter(f=>['stool','bench'].includes(f.type)),needs=[];
    for(const table of floor.filter(f=>['desk','dining'].includes(f.type)))for(let i=0;i<(table.type==='desk'?1:2);i++)needs.push({table,max:table.type==='desk'?1.65:1.55});
    const options=needs.map(({table,max})=>seats.map((chair,index)=>({index,d:distance(table,chair),front:chair.type==='bench'?1:facing(chair,table)})).filter(o=>o.d<=max&&o.front>=.35&&connection(table,seats[o.index],s,defs,ls)).sort((a,b)=>b.front-a.front||a.d-b.d));
    // Augmenting paths ensure a chair can belong to only one desk or dining place.
    const assigned=new Map();function match(i,seen){for(const o of options[i]){if(seen.has(o.index))continue;seen.add(o.index);if(!assigned.has(o.index)||match(assigned.get(o.index),seen)){assigned.set(o.index,i);return true}}return false}
    needs.forEach((_,i)=>match(i,new Set()));const pairs=[];
    needs.forEach(({table,max},i)=>{const index=[...assigned].find(([,v])=>v===i)?.[0];if(index===undefined){const close=seats.filter(c=>distance(c,table)<=max),wall=close.some(c=>!connection(table,c,s,defs,ls)),turned=close.some(c=>facing(c,table)<.35);add(0,'「'+defs[table.type].name+'」'+(wall?'与座位之间有隔墙或家具，请移到同一可用区域':turned?'需要一把转向桌面的专用座椅':'缺少可独立使用的座位，不能与另一张桌子共用'),[table.id,...close.map(c=>c.id)],true);return}
      const chair=seats[index],o=options[i].find(o=>o.index===index);pairs.push([table.id,chair.id]);let value=Math.round(90+10*Math.min(1,(o.front-.35)/.5));if(o.d>max-.2)value-=Math.round((o.d-(max-.2))/.2*8);
      // Check a short pull-out area behind each chair, beyond its physical footprint.
      const a=angle(chair),rear={id:'__clearance__',x:chair.x-Math.sin(a)*(defs[chair.type].d/2+.28),z:chair.z-Math.cos(a)*(defs[chair.type].d/2+.28)};
      if(!connection(chair,rear,s,defs,ls)){value=Math.max(0,value-20);add(value,'「'+defs[chair.type].name+'」背后需要留出约 28 厘米的拉出空间',[chair.id,table.id]);}else add(value,'微调「'+defs[chair.type].name+'」的距离或朝向，让座位更舒适',[chair.id,table.id]);
    });
    for(const tv of floor.filter(f=>f.type==='tv')){const sofas=floor.filter(f=>defs[f.type].type==='sofa'&&distance(f,tv)<=4.5);const sofa=sofas.find(f=>connection(f,tv,s,defs,ls,'sight')&&facing(f,tv)>=.35&&facing(tv,f)>=.35);add(sofa?Math.round(90+10*Math.min(1,Math.min(facing(sofa,tv),facing(tv,sofa))/.85)):0,'让沙发与电视正面相对，并移开中间的隔墙或遮挡',[tv.id,...sofas.map(f=>f.id)],!sofa)}
    for(const stand of floor.filter(f=>f.type==='nightstand')){const beds=floor.filter(f=>f.type==='bed'&&distance(f,stand)<=1.6),ok=beds.some(f=>connection(f,stand,s,defs,ls));add(ok?100:0,'把床边柜放到同一房间的床旁 1.6 米以内',[stand.id,...beds.map(f=>f.id)],!ok)}
    for(const counter of floor.filter(f=>f.type==='counter')){const fridges=floor.filter(f=>f.type==='fridge'),ok=fridges.some(f=>distance(f,counter)<=2.8&&connection(f,counter,s,defs,ls));if(fridges.length)add(ok?100:0,'料理台和冰箱之间应无遮挡，相距不超过 2.8 米',[counter.id,...fridges.map(f=>f.id)],!ok)}
    return {score:checks.length?Math.round(checks.reduce((a,b)=>a+b,0)/checks.length):100,issues:details.map(d=>d.message),details,pairs,blockers:details.filter(d=>d.critical).length};
  }
  const encoreText={coder:'睡前阅读：床边柜上放台灯，并添一把休闲椅',cats:'双人睡前空间：床的两侧各有一个床边柜',balcony:'两人阳台：两处阅读座位，阳台边几上有书',duo:'各自专注：两张书桌相距至少 2.2 米，每张桌上都有书',chef:'朋友来吃饭：同一餐桌周围安排四把独立餐椅',rental:'朋友来做客：添一条长凳，床边柜上留一盏灯'};
  function encoreGoals(s,defs,ls=[]){const fs=s.furniture,has=t=>fs.some(f=>f.type===t),attached=(t,p)=>fs.some(f=>f.type===t&&fs.some(o=>o.id===f.parentId&&o.type===p)),near=(a,b,d)=>Math.hypot(a.x-b.x,a.z-b.z)<=d;
    let done=false;
    if(s.contract==='coder')done=attached('pendant','nightstand')&&fs.some(f=>defs[f.type].type==='chair');
    if(s.contract==='cats')done=fs.some(b=>b.type==='bed'&&[-1,1].every(sign=>fs.some(n=>n.type==='nightstand'&&near(n,b,1.6)&&connection(n,b,s,defs,ls)&&sign*((n.x-b.x)*Math.cos(angle(b))-(n.z-b.z)*Math.sin(angle(b)))>.5)));
    if(s.contract==='balcony')done=fs.filter(f=>['chair','bench'].includes(defs[f.type].type)&&f.z< -2.3).length>=2&&fs.some(f=>f.type==='books'&&fs.some(p=>p.id===f.parentId&&p.type==='side'&&p.z< -2.3));
    if(s.contract==='duo'){const desks=fs.filter(f=>f.type==='desk'&&fs.some(b=>b.parentId===f.id&&b.type==='books'));done=desks.some((a,i)=>desks.some((b,j)=>i!==j&&!near(a,b,2.2-1e-6)))}
    if(s.contract==='chef'){const space=relationships(s,defs,ls);done=fs.some(t=>t.type==='dining'&&fs.filter(c=>c.type==='stool'&&near(c,t,1.55)&&connection(c,t,s,defs,ls)&&Math.sin(angle(c))*(t.x-c.x)+Math.cos(angle(c))*(t.z-c.z)>.35*Math.hypot(t.x-c.x,t.z-c.z)).length>=4)&&space.blockers===0}
    if(s.contract==='rental')done=has('bench')&&attached('pendant','nightstand');
    return [[encoreText[s.contract],done],['进阶：空间关系达到 85 分',relationships(s,defs,ls).score>=85]];
  }
  function goals(s,defs,ls=[]){const gs=baseGoals(s,defs);if(s.mode!=='challenge'||s.round!==2)return gs;if(s.roundRules===2)return [...gs,...encoreGoals(s,defs,ls)];const colors=new Set(s.furniture.filter(f=>!['plant','cactus','deskplant'].includes(f.type)).map(f=>f.color));return [...gs,['进阶：家具主色不超过 3 种',s.furniture.length>0&&colors.size<=3],['进阶：空间关系达到 85 分',relationships(s,defs,ls).score>=85]]}
  function circulation(s,defs,ls){
    const l=ls.find(l=>l.id===s.layout),step=.25,nx=Math.round(l.w/step),nz=Math.round(l.d/step), cells=new Uint8Array(nx*nz), seen=new Uint8Array(nx*nz);
    const solids=s.furniture.filter(f=>!f.parentId&&defs[f.type].mount!=='wall'&&defs[f.type].type!=='rug');
    let available=0;for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const px=-l.w/2+(x+.5)*step,pz=-l.d/2+(z+.5)*step;
      const blocked=!inside(l,px,pz,.14)||(l.id==='suite'&&Math.abs(px-1)<.24&&(pz<-.32||pz>.92))||(l.barriers||[]).some(([ax,az,bx,bz])=>px>=Math.min(ax,bx)-.22&&px<=Math.max(ax,bx)+.22&&pz>=Math.min(az,bz)-.22&&pz<=Math.max(az,bz)+.22)||solids.some(f=>{const a=angle(f),c=Math.cos(a),sn=Math.sin(a),dx=px-f.x,dz=pz-f.z;return Math.abs(c*dx-sn*dz)<defs[f.type].w/2+.17&&Math.abs(sn*dx+c*dz)<defs[f.type].d/2+.17});
      if(!blocked){cells[z*nx+x]=1;available++}}
    // Entry is the front-right one-metre opening; it must remain usable.
    const seeds=[];for(let x=Math.max(0,nx-6);x<nx-1;x++){let idx=(nz-2)*nx+x;if(cells[idx])seeds.push(idx)}
    const queue=[...seeds];seeds.forEach(i=>seen[i]=1);for(let j=0;j<queue.length;j++){const i=queue[j],x=i%nx,z=Math.floor(i/nx);for(const [a,b]of [[x-1,z],[x+1,z],[x,z-1],[x,z+1]])if(a>=0&&b>=0&&a<nx&&b<nz){const n=b*nx+a;if(cells[n]&&!seen[n]){seen[n]=1;queue.push(n)}}}
    const inaccessible=[];for(const f of solids.filter(f=>['bed','sofa','chair','desk','dining','wardrobe','shelf'].includes(f.type))){const[w,d]=dims(f,defs);let reachable=false;for(let i=0;i<seen.length;i++)if(seen[i]){const x=-l.w/2+(i%nx+.5)*step,z=-l.d/2+(Math.floor(i/nx)+.5)*step;if(Math.abs(x-f.x)<=w/2+.65&&Math.abs(z-f.z)<=d/2+.65){reachable=true;break}}if(!reachable)inaccessible.push(defs[f.type].name)}
    return {score:available?Math.round(100*queue.length/available):0,entry:seeds.length>0,inaccessible,coverage:available/(nx*nz)};
  }
  function evaluate(s,defs,ls){
    const gs=goals(s,defs,ls),done=gs.filter(g=>g[1]).length,flow=circulation(s,defs,ls),space=relationships(s,defs,ls),colors=new Set(s.furniture.filter(f=>!['plant','cactus','deskplant'].includes(f.type)).map(f=>f.color));
    const functionScore=Math.round(done/gs.length*100),flowScore=Math.max(0,flow.score-flow.inaccessible.length*12),colorScore=s.furniture.length?Math.max(35,100-Math.max(0,colors.size-3)*12):0;
    const detailScore=Math.min(100,25*(Number(s.furniture.some(f=>f.parentId))+Number(s.furniture.some(f=>defs[f.type].mount==='wall'))+Number(s.furniture.some(f=>['lamp','tablelamp'].includes(defs[f.type].type)))+Number(s.furniture.some(f=>['plant','cactus','deskplant'].includes(f.type)))));
    const score=Math.round(functionScore*.4+flowScore*.2+space.score*.2+colorScore*.1+detailScore*.1),complete=done===gs.length&&total(s,defs)<=budget(s)&&flow.entry&&flow.inaccessible.length===0&&flowScore>=75&&(s.mode!=='challenge'||space.score>=60&&space.blockers===0);
    const starGoals=[['完成生活心愿与基本动线',complete],['花费不超过预算的 85%',complete&&s.mode==='challenge'&&total(s,defs)<=budget(s)*.85],['设计灵感分达到 90',complete&&score>=90]];
    const tips=[];if(done<gs.length)tips.push('先完成「'+gs.find(g=>!g[1])[0]+'」。');if(!flow.entry)tips.push('右前方入口被堵住了，留出至少半米的通道。');if(flow.inaccessible.length)tips.push('「'+flow.inaccessible[0]+'」难以走近，尝试留出约 60 厘米的通道。');if(flowScore<75&&flow.entry)tips.push('部分地面与入口不连通，挪开横在过道上的家具。');tips.push(...space.issues.slice(0,3));if(colors.size>3)tips.push(s.mode==='challenge'&&s.round===2&&s.roundRules!==2?'进阶委托要求不超过 3 种家具主色，请用选中后的色块统一配色。':'当前有 '+colors.size+' 种家具主色，可尝试以 2–3 色为主；这是建议，不是硬性要求。');if(detailScore<75)tips.push('试试桌面摆件、挂画和绿植，让细节更有层次。');if(!tips.length)tips.push('功能齐全、动线通畅，家具之间的关系也很舒适。现在可以拍照收藏，或者挑战二周目。');
    return {score,complete,goals:gs,flow,space,metrics:[['功能',functionScore],['动线',flowScore],['空间',space.score],['配色',colorScore],['细节',detailScore]],starGoals,stars:starGoals.filter(g=>g[1]).length,tips};
  }
  function validate(raw,defs,ls){
    if(!raw||!ls.some(l=>l.id===raw.layout)||!['free','challenge'].includes(raw.mode)||!Array.isArray(raw.furniture)||raw.furniture.length>200)throw Error('不是有效的装修存档');
    if(raw.contract&&!contracts[raw.contract])throw Error('未知的设计委托');if(raw.mode==='challenge'&&raw.layout!==contracts[raw.contract||'coder'].layout)throw Error('户型与委托不匹配');
    const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
    if(!color(raw.wall)||!color(raw.floor))throw Error('墙面或地板配色无效');
    const ids=new Set(),furniture=raw.furniture.filter(f=>!['catbed','scratch','bowl'].includes(f.type));const s={layout:raw.layout,mode:raw.mode,contract:raw.contract||'coder',round:raw.mode==='challenge'&&raw.round===2?2:1,roundRules:raw.roundRules===2?2:1,wall:raw.wall,floor:raw.floor,night:!!raw.night,curtains:!!raw.curtains,furniture:furniture.map(f=>{
      if(!defs[f.type]||typeof f.id!=='string'||!f.id||f.id.length>100||ids.has(f.id)||!Number.isFinite(f.x)||!Number.isFinite(f.z)||Math.abs(f.x)>10||Math.abs(f.z)>10||!Number.isFinite(f.rot)||f.rot<0||f.rot>=4||Math.abs(f.rot*6-Math.round(f.rot*6))>.00001||!color(f.color))throw Error('家具数据不完整或有重复编号');ids.add(f.id);
      const y=f.y??.03;if(!Number.isFinite(y)||y<0||y>2.2)throw Error('家具高度无效');
      return {id:f.id,type:f.type,x:f.x,z:f.z,rot:f.rot,color:f.color,y,on:f.on!==false,...(typeof f.groupId==='string'&&f.groupId.length<100?{groupId:f.groupId}:{}),...(f.parentId?{parentId:String(f.parentId)}:{}),...(Number.isInteger(f.wallIndex)?{wallIndex:f.wallIndex}:{})};
    })};
    for(const f of s.furniture){if(f.parentId&&(f.parentId===f.id||!s.furniture.some(p=>p.id===f.parentId&&defs[p.type].surface&&!p.parentId)))throw Error('摆件承托关系无效');const why=reason(f,s,defs,ls);if(why)throw Error(defs[f.type].name+'：'+why)}
    if(total(s,defs)>budget(s))throw Error('存档超出委托预算');return s;
  }
  return {contracts,dims,corners,overlap,familyIds,progress,total,budget,inside,reason,transformFamily,baseGoals,goals,relationships,connection,encoreText,encoreGoals,circulation,evaluate,validate};
})();
