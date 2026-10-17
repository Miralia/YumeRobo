var Yr=["click","dblclick","middle","back","forward"];function He(e){if(e.t!=="key"||e.shift||e.ctrl||e.alt||e.meta)return!1;return e.code==="KeyV"||/^Digit[1-9]$/.test(e.code)}function wo(e){let t={t:"key",code:e.code};if(e.shiftKey)t.shift=!0;if(e.ctrlKey)t.ctrl=!0;if(e.altKey)t.alt=!0;if(e.metaKey)t.meta=!0;return t}function Be(e,t){return e.t==="key"&&e.code===t.code&&!!e.shift===t.shiftKey&&!!e.ctrl===t.ctrlKey&&!!e.alt===t.altKey&&!!e.meta===t.metaKey}function le(e,t){return e.t==="mouse"&&e.g===t}function Rt(e,t){if(!e||!t)return e===t;if(e.t==="key"&&t.t==="key")return e.code===t.code&&!!e.shift===!!t.shift&&!!e.ctrl===!!t.ctrl&&!!e.alt===!!t.alt&&!!e.meta===!!t.meta;if(e.t==="mouse"&&t.t==="mouse")return e.g===t.g;return!1}function It(e){if(typeof e!=="object"||e===null)return!1;let t=e;if(t.t==="key")return typeof t.code==="string"&&t.code.length>0;if(t.t==="mouse")return Yr.includes(t.g);return!1}function ot(e){if(!e)return"—";if(e.t==="mouse")return{click:"Click",dblclick:"Double-click",middle:"Middle-click",back:"Back button",forward:"Forward button"}[e.g];let t=[];if(e.ctrl)t.push("Ctrl");if(e.alt)t.push("Alt");if(e.meta)t.push("Meta");if(e.shift)t.push("Shift");return t.push($r(e.code)),t.join(" + ")}function $r(e){if(/^Key[A-Z]$/.test(e))return e.slice(3);if(/^Digit[0-9]$/.test(e))return e.slice(5);return{ArrowLeft:"←",ArrowRight:"→",ArrowUp:"↑",ArrowDown:"↓",Minus:"-",Equal:"=",BracketLeft:"[",BracketRight:"]",Backslash:"\\",Escape:"Esc",Space:"Space",Enter:"Enter",Comma:",",Period:".",Slash:"/",Semicolon:";",Quote:"'",Backquote:"`"}[e]??e}var L=(e,t)=>({t:"key",code:e,...t}),ne=[{id:"zoom.in",label:"Zoom in",group:"Zoom",defaultMain:L("Equal"),defaultExtra:null},{id:"zoom.out",label:"Zoom out",group:"Zoom",defaultMain:L("Minus"),defaultExtra:null},{id:"zoom.fit",label:"Fit width",group:"Zoom",defaultMain:L("Digit0"),defaultExtra:null},{id:"zoom.oneToOne",label:"Actual size (1:1)",group:"Zoom",defaultMain:L("KeyO"),defaultExtra:null},{id:"nav.colPrev",label:"Previous source",group:"Navigate",defaultMain:L("ArrowLeft"),defaultExtra:L("KeyH")},{id:"nav.colNext",label:"Next source",group:"Navigate",defaultMain:L("ArrowRight"),defaultExtra:L("KeyL")},{id:"nav.rowPrev",label:"Previous row",group:"Navigate",defaultMain:L("ArrowUp"),defaultExtra:L("KeyK")},{id:"nav.rowNext",label:"Next row",group:"Navigate",defaultMain:L("ArrowDown"),defaultExtra:L("KeyJ")},{id:"display.canvas",label:"Canvas fill / fit",group:"Display",defaultMain:L("KeyC"),defaultExtra:null,phase:"up"},{id:"display.minimap",label:"Minimap",group:"Display",defaultMain:L("KeyM"),defaultExtra:null},{id:"display.rowNav",label:"Row nav sidebar",group:"Display",defaultMain:L("KeyR"),defaultExtra:null,phase:"up"},{id:"display.bgLoad",label:"Background loading",group:"Display",defaultMain:L("KeyB"),defaultExtra:null,phase:"up"},{id:"filter.next",label:"Filter mode next",group:"Adjust",defaultMain:L("KeyF"),defaultExtra:null,phase:"up",siteLevel:!0},{id:"filter.prev",label:"Filter mode prev",group:"Adjust",defaultMain:L("KeyF",{shift:!0}),defaultExtra:null,phase:"up",siteLevel:!0},{id:"gamma.next",label:"Gamma check next",group:"Adjust",defaultMain:L("KeyG"),defaultExtra:null,phase:"up"},{id:"gamma.prev",label:"Gamma check prev",group:"Adjust",defaultMain:L("KeyG",{shift:!0}),defaultExtra:null,phase:"up"},{id:"bright.up",label:"Brightness up",group:"Adjust",defaultMain:L("BracketRight"),defaultExtra:null},{id:"bright.down",label:"Brightness down",group:"Adjust",defaultMain:L("BracketLeft"),defaultExtra:null},{id:"contrast.up",label:"Contrast up",group:"Adjust",defaultMain:L("BracketRight",{shift:!0}),defaultExtra:null},{id:"contrast.down",label:"Contrast down",group:"Adjust",defaultMain:L("BracketLeft",{shift:!0}),defaultExtra:null},{id:"adjust.resetSource",label:"Reset source adjustments",group:"Adjust",defaultMain:L("Backslash"),defaultExtra:null,phase:"up"},{id:"adjust.resetAll",label:"Reset all adjustments",group:"Adjust",defaultMain:L("Backslash",{shift:!0}),defaultExtra:null,phase:"up"},{id:"viewer.help",label:"Toggle shortcuts help",group:"Viewer",defaultMain:L("Slash",{shift:!0}),defaultExtra:null},{id:"viewer.close",label:"Close viewer",group:"Viewer",defaultMain:L("Escape"),defaultExtra:null}],At=new Map(ne.map((e)=>[e.id,e]));function yo(e){return At.get(e)}function Co(e){let t=At.get(e);return{main:t.defaultMain,extra:t.defaultExtra}}function Eo(e){return typeof e==="string"&&At.has(e)}var rt=["bhd","comppics","frds","gpw","hdbits","ptp","slowpics","ssd","blutopia","aither"],Mo={bhd:"BHD",comppics:"comp.pics",frds:"FRDS",gpw:"GPW",hdbits:"HDB",ptp:"PTP",slowpics:"slow.pics",ssd:"SSD",blutopia:"BLU",aither:"ATH"},it=["solar1","solar2","residual","luma","chroma"],at=["aeqt-0p88","srgb-bt1886","legacy-mac"],ko="yacomp_config",Lo="yacomp-web:config",st=5,Ro=Object.fromEntries(rt.map((e)=>[e,!0])),M={v:st,defaultZoomMode:"1:1",fillCanvasDefault:!1,navMapDefault:!0,bgLoadDefault:!1,bcStep:0.05,toastDuration:2000,zoomScaleFactor:1.25,lazyLoadMargin:200,mouseSwitch:!1,sourceTitleLayout:"dense",zoomPercentBase:"original",oneToOnePixels:"logical",verboseZoom:!1,closeBtnPosition:"auto",uiChromeMode:"default",uiHideDelay:1000,ptpGridImageSize:"thumbnail",ptpGridClick:"viewer",hdbitsImageClick:"viewer",hdbitsManualAllThreads:!1,ptpGridToggleStyle:"grid",ptpGridToggleCollapsed:"▦",ptpGridToggleExpanded:"▦",enabledSites:Ro,filterCycle:[...it],gammaCycle:[...at],shortcuts:{}};function Ge(e,t,o,n){if(typeof e!=="number"||!isFinite(e))return n;return Math.max(t,Math.min(o,e))}function So(e,t){if(typeof e!=="string")return t;let o=e.trim();return o?o.slice(0,32):t}function qr(e){let t={...Ro};if(typeof e!=="object"||e===null)return t;let o=e;for(let n of rt)if(typeof o[n]==="boolean")t[n]=o[n];return t}function To(e,t,o){if(!Array.isArray(e))return[...o];let n=new Set(t),r=new Set,i=[];for(let a of e)if(typeof a==="string"&&n.has(a)&&!r.has(a))r.add(a),i.push(a);return i}function Xr(e){let t={};if(typeof e!=="object"||e===null)return t;for(let[o,n]of Object.entries(e)){if(!Eo(o))continue;if(typeof n!=="object"||n===null)continue;let r=n;if(!It(r.main)||He(r.main))continue;let i=It(r.extra)&&!He(r.extra)?r.extra:null;t[o]={main:r.main,extra:i}}return t}function Dt(e){return{v:st,defaultZoomMode:e.defaultZoomMode==="fit"||e.defaultZoomMode==="1:1"?e.defaultZoomMode:M.defaultZoomMode,fillCanvasDefault:typeof e.fillCanvasDefault==="boolean"?e.fillCanvasDefault:M.fillCanvasDefault,navMapDefault:typeof e.navMapDefault==="boolean"?e.navMapDefault:M.navMapDefault,bgLoadDefault:typeof e.bgLoadDefault==="boolean"?e.bgLoadDefault:M.bgLoadDefault,bcStep:Ge(e.bcStep,0.01,0.25,M.bcStep),toastDuration:Ge(e.toastDuration,500,1e4,M.toastDuration),zoomScaleFactor:Ge(e.zoomScaleFactor,1.05,2,M.zoomScaleFactor),lazyLoadMargin:Ge(e.lazyLoadMargin,0,2000,M.lazyLoadMargin),mouseSwitch:typeof e.mouseSwitch==="boolean"?e.mouseSwitch:M.mouseSwitch,sourceTitleLayout:e.sourceTitleLayout==="dense"||e.sourceTitleLayout==="filled"?e.sourceTitleLayout:M.sourceTitleLayout,zoomPercentBase:e.zoomPercentBase==="original"||e.zoomPercentBase==="fit"?e.zoomPercentBase:M.zoomPercentBase,oneToOnePixels:e.oneToOnePixels==="device"||e.oneToOnePixels==="logical"?e.oneToOnePixels:M.oneToOnePixels,verboseZoom:typeof e.verboseZoom==="boolean"?e.verboseZoom:M.verboseZoom,closeBtnPosition:e.closeBtnPosition==="auto"||e.closeBtnPosition==="left"||e.closeBtnPosition==="right"||e.closeBtnPosition==="hide"?e.closeBtnPosition:M.closeBtnPosition,uiChromeMode:e.uiChromeMode==="always"||e.uiChromeMode==="default"||e.uiChromeMode==="autohide"?e.uiChromeMode:M.uiChromeMode,uiHideDelay:Ge(e.uiHideDelay,200,5000,M.uiHideDelay),ptpGridImageSize:e.ptpGridImageSize==="thumbnail"||e.ptpGridImageSize==="full"?e.ptpGridImageSize:M.ptpGridImageSize,ptpGridClick:e.ptpGridClick==="viewer"||e.ptpGridClick==="tab"?e.ptpGridClick:M.ptpGridClick,hdbitsImageClick:e.hdbitsImageClick==="viewer"||e.hdbitsImageClick==="native"?e.hdbitsImageClick:M.hdbitsImageClick,hdbitsManualAllThreads:typeof e.hdbitsManualAllThreads==="boolean"?e.hdbitsManualAllThreads:M.hdbitsManualAllThreads,ptpGridToggleStyle:e.ptpGridToggleStyle==="grid"||e.ptpGridToggleStyle==="triangles"||e.ptpGridToggleStyle==="text"||e.ptpGridToggleStyle==="custom"?e.ptpGridToggleStyle:M.ptpGridToggleStyle,ptpGridToggleCollapsed:So(e.ptpGridToggleCollapsed,M.ptpGridToggleCollapsed),ptpGridToggleExpanded:So(e.ptpGridToggleExpanded,M.ptpGridToggleExpanded),enabledSites:qr(e.enabledSites),filterCycle:To(e.filterCycle,it,M.filterCycle),gammaCycle:To(e.gammaCycle,at,M.gammaCycle),shortcuts:Xr(e.shortcuts)}}function Io(e){if((typeof e.v==="number"?e.v:0)<2)e.enabledSites??=M.enabledSites,e.filterCycle??=M.filterCycle,e.gammaCycle??=M.gammaCycle;return e}var y;function Jr(){try{if(typeof GM_getValue==="function")return GM_getValue(ko,M)}catch{}try{let e=globalThis.localStorage?.getItem(Lo);return e?JSON.parse(e):null}catch{return null}}function Ao(e){try{if(typeof GM_setValue==="function"){GM_setValue(ko,e);return}}catch{}try{globalThis.localStorage?.setItem(Lo,JSON.stringify(e))}catch{}}var nt=Jr();y=Dt(Io(typeof nt==="object"&&nt!==null?nt:{}));if(nt?.v!==st)Ao(y);function Do(){return y.defaultZoomMode}function No(){return y.fillCanvasDefault}function Po(){return y.navMapDefault}function Ho(){return y.bgLoadDefault}function lt(){return y.bcStep}function Bo(){return y.toastDuration}function Go(){return y.zoomScaleFactor}function Fo(){return y.lazyLoadMargin}function Oo(){return y.mouseSwitch}function zo(){return y.sourceTitleLayout}function Wo(){return y.zoomPercentBase}function Nt(){return y.oneToOnePixels}function Pt(){return y.verboseZoom}function jo(){return y.closeBtnPosition}function Zo(){return y.uiChromeMode}function ct(){return y.uiHideDelay}function Ko(){return y.ptpGridToggleStyle}function Uo(){return y.ptpGridToggleCollapsed}function Vo(){return y.ptpGridToggleExpanded}function Yo(e){return y.enabledSites[e]}function W(e){return y.shortcuts[e]??Co(e)}function $o(){let e=W("viewer.close");return[e.main,e.extra].some((t)=>t!=null&&(le(t,"click")||le(t,"dblclick")))}function Ht(e,t){q({shortcuts:{...y.shortcuts,[e]:t}})}function qo(){q({shortcuts:{}})}function Xo(e,t,o){for(let n of ne){let r=W(n.id);if(!(n.id===t&&o==="main")&&Rt(r.main,e))return n.id;if(!(n.id===t&&o==="extra")&&r.extra&&Rt(r.extra,e))return n.id}return null}function Jo(){return y.filterCycle}function Qo(){return y.gammaCycle}function O(){return y}function Bt(){Ao(y)}function q(e){Object.assign(y,e),y.v=st,y=Dt(y),Bt()}function en(){y={...M},Bt()}function tn(){return JSON.stringify(y,null,2)}function on(e){let t;try{t=JSON.parse(e)}catch{return!1}if(typeof t!=="object"||t===null||Array.isArray(t))return!1;return y=Dt(Io(t)),Bt(),!0}var Fe=[{id:"off",filter:"",label:null,toast:"◼  Off"},{id:"solar1",filter:"url(#scf-s1)",label:"☀️ Solar ×1",toast:"☀️  Solar ×1"},{id:"solar2",filter:"url(#scf-s2)",label:"☀️☀️ Solar ×2",toast:"☀️☀️  Solar ×2"},{id:"residual",filter:"url(#scf-hpf)",label:"\uD83D\uDD2C Residual",toast:"\uD83D\uDD2C  Residual"},{id:"luma",f709:"url(#scf-luma709)",f2020:"url(#scf-luma2020)",label:"⬜ Luma",toast:"⬜  Luma"},{id:"chroma",f709:"url(#scf-chroma709)",f2020:"url(#scf-chroma2020)",label:"\uD83C\uDF08 Chroma",toast:"\uD83C\uDF08  Chroma"}],nn=new Map(Fe.map((e)=>[e.id,e])),ce=0;function rn(e){ce=e}function j(){return Fe[ce]}function ut(e){let t=e||j();return!!(t.filter||t.f709)}function Gt(e){let t=Jo();if(t.length===0){ce=0;return}let o=Fe[ce].id;if(o==="off"){let i=e>0?t[0]:t[t.length-1],a=nn.get(i);if(a)ce=Fe.indexOf(a);return}let n=t.indexOf(o);if(n===-1){ce=0;return}let r=n+(e>0?1:-1);if(r<0||r>=t.length)ce=0;else{let i=nn.get(t[r]);if(i)ce=Fe.indexOf(i)}}var Ft=0.05,Ot=4;function ue(e){return Math.abs(e-1)<=0.001}function an(e,t){let o=+e.toFixed(2),n=lt(),r=t>0?n:-n;return Math.max(Ft,Math.min(Ot,+(o+r).toFixed(2)))}function sn(e){return"Brightness "+Math.round(e*100)+"%"}function ln(e,t){let o=[];if(!ue(e))o.push("brightness("+e.toFixed(2)+")");if(!ue(t))o.push("contrast("+t.toFixed(2)+")");return o.join(" ")}function Oe(){return ut()}function zt(){rn(0)}var Qr=[[/(?:^|\.)slow\.pics$/i,"slowpics"],[/(?:^|\.)comp\.pics$/i,"comppics"],[/(?:^|\.)passthepopcorn\.me$/i,"ptp"],[/(?:^|\.)hdbits\.org$/i,"hdbits"],[/(?:^|\.)springsunday\.net$/i,"ssd"],[/^pt\.keepfrds\.com$/i,"frds"],[/(?:^|\.)blutopia\.cc$/i,"blutopia"],[/(?:^|\.)aither\.cc$/i,"aither"],[/(?:^|\.)beyond-hd\.me$/i,"bhd"],[/(?:^|\.)greatposterwall\.com$/i,"gpw"]];function ei(e=location.hostname){for(let[t,o]of Qr)if(t.test(e))return o;return null}function Wt(e=location.hostname){let t=ei(e);return t===null||Yo(t)}var jt=[{id:"srgb-bt1886",ratio:0.917,formula:"2.2/2.4",label:"sRGB 2.2↔BT.1886 2.4",svgId:"scf-gamma-mismatch-srgb-bt1886"},{id:"aeqt-0p88",ratio:0.88,formula:"2.2/2.5",label:"0.88 AE/QT folklore 2.2↔CRT 2.5",svgId:"scf-gamma-mismatch-aeqt-0p88"},{id:"legacy-mac",ratio:0.818,formula:"1.8/2.2",label:"Legacy Mac 1.8↔2.2",svgId:"scf-gamma-mismatch-legacy-mac"}],Ce=new Map(jt.map((e)=>[e.id,e]));function cn(e,t){let o=Qo(),n=e?o.indexOf(e):-1,r=o.length+1,i=(n+(t>0?1:-1)+r)%r;return i===o.length?null:o[i]}function un(e){return 1/(Ce.get(e)?.ratio||1)}function dn(e){if(!e)return"";let t=Ce.get(e);return t?"url(#"+t.svgId+")":""}function pn(e){let t=Ce.get(e);return(t.ratio*100).toFixed(1)+"% ("+t.formula+")"}function fn(e){return"pow(1/"+Ce.get(e).ratio.toFixed(3)+")"}function mn(e){return Ce.get(e).label}function gn(e){let t=Ce.get(e);return{line1:"γ "+(t.ratio*100).toFixed(1)+"% ("+t.formula+")",line2:t.label}}var Z=(e,t,o)=>new TextDecoder("latin1").decode(e.subarray(t,t+o)),re=(e)=>new DataView(e.buffer,e.byteOffset,e.byteLength),de=(e)=>({complete:!1,requiredBytes:e}),ge=(e={})=>({complete:!0,requiredBytes:0,...e});function ti(e,t,o){let n=4294967295;for(let r=t+4;r<t+8+o;r++){n^=e[r];for(let i=0;i<8;i++)n=n>>>1^(n&1?3988292384:0)}return(n^4294967295)>>>0===re(e).getUint32(t+8+o)}function hn(e,t){for(let o of["709","2020"])if(t[o].some((n)=>n.every((r,i)=>Math.abs(r-e[i])<0.002)))return o;return"other"}var oi={"709":[[0.43607,0.22249,0.01392,0.38515,0.71687,0.09708,0.14307,0.06061,0.7141],[0.41239,0.21264,0.01933,0.35758,0.71517,0.11919,0.18048,0.07219,0.95053]],"2020":[[0.67348,0.27904,-0.00194,0.16566,0.67534,0.02998,0.12505,0.04561,0.79684],[0.63696,0.2627,0,0.14462,0.678,0.02807,0.16888,0.0593,1.06099]]},ni={"709":[[0.64,0.33,0.3,0.6,0.15,0.06]],"2020":[[0.708,0.292,0.17,0.797,0.131,0.046]]};function bn(e){return/(?:bt|rec|itu-?r(?:\s+bt)?)[\s._-]*2020/i.test(Z(e,0,e.length))}function ri(e){if(e.length<132||Z(e,36,4)!=="acsp")return"unknown";let t=re(e),o=t.getUint32(0),n=t.getUint32(128);if(o>e.length||o<132||n>(o-132)/12)return"unknown";if(Z(e,16,4)!=="RGB ")return"other";let r=new Map;for(let l=0;l<n;l++){let f=132+l*12,u=t.getUint32(f+4),d=t.getUint32(f+8);if(u<132+n*12||d<8||u+d>o)return"unknown";r.set(Z(e,f,4),e.subarray(u,u+d))}let i=["rXYZ","gXYZ","bXYZ"].map((l)=>r.get(l));if(i.every((l)=>l&&l.length>=20&&Z(l,0,4)==="XYZ "))return hn(i.flatMap((l)=>[8,12,16].map((f)=>re(l).getInt32(f)/65536)),oi);let a=r.get("desc");if(!a)return"unknown";let s=[];if(Z(a,0,4)==="mluc"&&a.length>=16){let l=re(a),f=l.getUint32(8),u=l.getUint32(12);if(u<12||f>(a.length-16)/u)return"unknown";for(let d=0;d<f;d++){let g=16+d*u,p=l.getUint32(g+4),v=l.getUint32(g+8);if(p%2||v<16+f*u||v+p>a.length)return"unknown";s.push(new TextDecoder("utf-16be").decode(a.subarray(v,v+p)))}}else if(Z(a,0,4)==="desc"&&a.length>=12){let l=re(a).getUint32(8);if(12+l>a.length)return"unknown";s.push(Z(a,12,l))}for(let l of s){if(bn(new TextEncoder().encode(l)))return"2020";if(/sRGB|(?:bt|rec|itu-?r(?:\s+bt)?)[\s._-]*709/i.test(l))return"709"}return"unknown"}function ii(e){let t={};for(let o=8;;){if(o+8>e.length)return de(o+8);let n=re(e).getUint32(o),r=Z(e,o+4,4);if(r==="IDAT"||r==="IEND")return ge(t);let i=o+n+12;if(i>e.length)return de(i);let a=e.subarray(o+8,o+8+n);if(["cICP","iCCP","sRGB","cHRM"].includes(r)&&!ti(e,o,n))throw Error("Corrupted PNG color metadata");if(r==="cICP"&&n===4&&a[2]===0&&a[3]<=1)return ge({metadata:{primaries:a[0]===1?"709":a[0]===9?"2020":a[0]===2?"unknown":"other",source:"cicp"}});if(r==="iCCP"){let s=a.indexOf(0);if(s<1||s>79||a[s+1]!==0||s+2>=n)throw Error("Invalid PNG ICC chunk");t.compressedICC=a.subarray(s+2)}else if(r==="sRGB"&&n===1&&a[0]<=3)t.metadata={primaries:"709",source:"srgb"};else if(r==="cHRM"&&n===32&&!t.metadata)t.metadata={primaries:hn([8,12,16,20,24,28].map((s)=>re(a).getUint32(s)/1e5),ni),source:"chrm"};o=i}}function ai(e){let t=new Map,o=0;for(let n=2;;){if(n+2>e.length)return de(n+2);if(e[n]!==255)throw Error("Invalid JPEG marker");if(e[n+1]===255){n++;continue}let r=e[n+1];if(r===218||r===217){if(!o)return ge();if(t.size!==o)throw Error("Incomplete JPEG ICC profile");let s=[...t.values()].reduce((u,d)=>u+d.length,0),l=new Uint8Array(s),f=0;for(let u=1;u<=o;u++){let d=t.get(u);l.set(d,f),f+=d.length}return ge({icc:l})}if(r===1||r>=208&&r<=215){n+=2;continue}if(n+4>e.length)return de(n+4);let i=re(e).getUint16(n+2),a=n+2+i;if(i<2)throw Error("Invalid JPEG segment");if(a>e.length)return de(a);if(r===226&&i>=16&&Z(e,n+4,12)==="ICC_PROFILE\x00"){let s=e[n+16],l=e[n+17];if(!l||!s||s>l||o&&o!==l||t.has(s))throw Error("Invalid JPEG ICC sequence");o=l,t.set(s,e.subarray(n+18,a))}n=a}}function si(e){for(let t=12;;){if(t+8>e.length)return de(t+8);let o=Z(e,t,4),n=re(e).getUint32(t+4,!0);if(o==="VP8 "||o==="VP8L"||o==="ANIM"||o==="ANMF")return ge();let r=t+8+n;if(r>e.length)return de(r);if(o==="ICCP")return ge({icc:e.subarray(t+8,r)});t=r+n%2}}function Zt(e){if(e.length<12)return de(12);if([137,80,78,71,13,10,26,10].every((t,o)=>e[o]===t))return ii(e);if(e[0]===255&&e[1]===216)return ai(e);if(Z(e,0,4)==="RIFF"&&Z(e,8,4)==="WEBP")return si(e);return ge()}async function _n(e,t,o){if(e.metadata?.source==="cicp")return e.metadata;let n=e.icc;if(e.compressedICC){if(typeof DecompressionStream>"u")throw Error("ICC decompression unavailable");let i=new Blob([e.compressedICC]).stream().pipeThrough(new DecompressionStream("deflate")).getReader(),a=()=>{i.cancel().catch(()=>{})};o.addEventListener("abort",a,{once:!0});try{let s=[],l=0;for(;;){o.throwIfAborted();let{done:u,value:d}=await i.read();if(o.throwIfAborted(),u)break;if(l+=d.length,l>t)throw Error("ICC profile exceeds byte budget");s.push(d)}n=new Uint8Array(l);let f=0;for(let u of s)n.set(u,f),f+=u.length}finally{o.removeEventListener("abort",a),a()}}if(n){if(n.length>t)throw Error("ICC profile exceeds byte budget");let r=ri(n);if(r==="unknown")throw Error("Unrecognized or incomplete ICC profile");return{primaries:r,source:"icc"}}return e.metadata??{primaries:"unknown",source:"none"}}var vn=8192,li=262144,ci=1048576,ui=2000,di=1000,pi=256,fi=4,Kt=()=>({primaries:"unknown",source:"unavailable"});function mi(e){return/rec\.?2020|bt\.?2020|hdr10|hlg|dolby.?vision|dovi/i.test(e)?{primaries:"2020",source:"url"}:{primaries:"unknown",source:"none"}}async function gi(e,t,o,n,r){for(let i=Math.min(vn,n);;){let a=await t(e,{headers:{Range:"bytes=0-"+(i-1)},signal:o});if(!a.ok||!a.body)throw a.body?.cancel().catch(()=>{}),Error("Image metadata unavailable");if(a.status===206){let p=a.headers.get("Content-Range");if(p&&!/^bytes 0-\d+\/(?:\d+|\*)$/i.test(p))throw a.body.cancel().catch(()=>{}),Error("Unexpected image byte range")}let s=a.body.getReader(),l=()=>{s.cancel().catch(()=>{})};o.addEventListener("abort",l,{once:!0});let f=a.status===206?i:n,u=new Uint8Array(f),d=0,g=Zt(u.subarray(0,0));try{for(;;){o.throwIfAborted();let{done:p,value:v}=await s.read();if(o.throwIfAborted(),p)break;let h=0;while(h<v.length&&d<f){let S=Math.min(v.length-h,vn,f-d);if(u.set(v.subarray(h,h+S),d),d+=S,h+=S,g=Zt(u.subarray(0,d)),g.complete)return l(),await _n(g,r,o);if(g.requiredBytes>n)throw Error("Image header exceeds byte budget")}if(d===f)break}}finally{o.removeEventListener("abort",l),l()}if(a.status!==206||d<i||i===n)throw Error("Incomplete image metadata");i=Math.min(n,Math.max(i*2,g.requiredBytes))}}function hi(e={}){let t=e.fetch??((g,p)=>fetch(g,p)),o=e.now??Date.now,n=e.maxEntries??pi,r=e.maxRequests??fi,i=new Map,a=new Map,s=[],l=0;function f(g){let p=i.get(g);if(!p)return;if(i.delete(g),p.until<=o())return;return i.set(g,p),p.value}function u(){while(l<r&&s.length){let{src:g,lookup:p}=s.shift();if(p.cancelled)continue;l++;let v=setTimeout(()=>p.controller.abort(),e.timeoutMs??ui);gi(g,t,p.controller.signal,e.maxHeaderBytes??li,e.maxICCBytes??ci).then((h)=>h.source==="none"?mi(g):h).catch(()=>Kt()).then((h)=>{if(a.get(g)===p)a.delete(g);if(!p.cancelled){i.set(g,{value:h,until:h.source==="unavailable"?o()+(e.retryMs??di):1/0});while(i.size>n)i.delete(i.keys().next().value)}p.resolve(h)}).finally(()=>{if(clearTimeout(v),a.get(g)===p)a.delete(g);l--,u()})}}function d(g,p){if(p?.aborted)return Promise.reject(p.reason);let v=f(g);if(v)return Promise.resolve(v);let h=a.get(g);if(!h){if(a.size>=n)return Promise.resolve(Kt());let k;h={controller:new AbortController,promise:new Promise((R)=>{k=R}),resolve:k,users:0,cancelled:!1},a.set(g,h),s.push({src:g,lookup:h})}let S=h;S.users++;let c=new Promise((k,R)=>{let P=!1,V=(K,oe)=>{if(P)return;if(P=!0,p?.removeEventListener("abort",te),S.users--,K){if(!S.users&&a.get(g)===S){S.cancelled=!0,a.delete(g),S.controller.abort(),S.resolve(Kt());let _=s.findIndex((A)=>A.lookup===S);if(_>=0)s.splice(_,1)}R(p?.reason)}else k(oe)},te=()=>V(!0);p?.addEventListener("abort",te,{once:!0}),S.promise.then((K)=>V(!1,K))});return u(),c}return{detect:d,cached:f}}var xn=hi(),{detect:bi,cached:wn}=xn;async function yn(e,t){return(await bi(e,t)).primaries==="2020"?"2020":"709"}var Cn=5.5*Math.PI-25.6,_i=-Cn/4194304,vi=3*Cn/32768;function xi(e,t=0){let o=e+t;return Math.max(0,Math.min(255,127.9999*Math.sin(_i*o**3+vi*o**2+0.2*o-Math.PI/2)+127.5))}function Ee(e,t){return Array.from({length:256},(o,n)=>{let r=n;for(let i=0;i<t;i++)r=xi(r,e);return(r/255).toFixed(5)}).join(" ")}var he={s1:{r:Ee(0,1),g:Ee(-5,1),b:Ee(5,1)},s2:{r:Ee(0,2),g:Ee(-5,2),b:Ee(5,2)}};var ze=null,dt=null;function wi(){if(dt)return;ze=document.createElement("div"),ze.id="_scf_root_",ze.style.cssText="position:absolute;top:0;left:0;width:0;height:0;overflow:visible",document.body.appendChild(ze),dt=ze.attachShadow({mode:"open"})}function C(){if(!dt)wi();return dt}var yi=new Set(["checkbox","radio","button","submit","reset","file"]);function Ut(){let e=document.activeElement;while(e?.shadowRoot?.activeElement)e=e.shadowRoot.activeElement;if(!e)return!1;if(e.isContentEditable)return!0;if(e.tagName==="TEXTAREA")return!0;if(e.tagName!=="INPUT")return!1;return!yi.has(e.type)}var Vt=0.5114155251141552;function Mn(e){return e.map((t)=>t.map(String).join(" ")).join(" ")}function En(e,t,o){let n=[e,t,o,0,0];return Mn([n,n,n,[0,0,0,1,0]])}function Sn(e,t,o){return Mn([[1-e,-t,-o,0,Vt],[-e,1-t,-o,0,Vt],[-e,-t,1-o,0,Vt],[0,0,0,1,0]])}function Ci(){return jt.map((e)=>{let t=un(e.id).toFixed(6);return`<filter id="${e.svgId}" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix" in="SourceGraphic" result="luma"
        values="0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0 0 0 1 0"/>
      <feComponentTransfer in="luma" result="gammaLuma">
        <feFuncR type="gamma" amplitude="1" exponent="${t}" offset="0"/>
        <feFuncG type="gamma" amplitude="1" exponent="${t}" offset="0"/>
        <feFuncB type="gamma" amplitude="1" exponent="${t}" offset="0"/>
      </feComponentTransfer>
      <feComposite in="gammaLuma" in2="luma" operator="arithmetic" result="deltaPos"
        k1="0" k2="1" k3="-1" k4="1"/>
      <feComposite in="SourceGraphic" in2="deltaPos" operator="arithmetic"
        k1="0" k2="1" k3="1" k4="-1"/>
    </filter>`}).join("")}function Ei(){return`<defs>
    <filter id="scf-s1" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feComponentTransfer>
        <feFuncR type="table" tableValues="${he.s1.r}"/>
        <feFuncG type="table" tableValues="${he.s1.g}"/>
        <feFuncB type="table" tableValues="${he.s1.b}"/>
      </feComponentTransfer>
    </filter>
    <filter id="scf-s2" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feComponentTransfer>
        <feFuncR type="table" tableValues="${he.s2.r}"/>
        <feFuncG type="table" tableValues="${he.s2.g}"/>
        <feFuncB type="table" tableValues="${he.s2.b}"/>
      </feComponentTransfer>
    </filter>
    <filter id="scf-hpf" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="smooth"/>
      <feBlend in="SourceGraphic" in2="smooth" mode="difference" result="residual"/>
      <feComponentTransfer in="residual">
        <feFuncR type="gamma" amplitude="1" exponent="0.35" offset="0"/>
        <feFuncG type="gamma" amplitude="1" exponent="0.35" offset="0"/>
        <feFuncB type="gamma" amplitude="1" exponent="0.35" offset="0"/>
      </feComponentTransfer>
    </filter>
    <filter id="scf-luma709" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix"
        values="${En(0.2126,0.7152,0.0722)}"/>
    </filter>
    <filter id="scf-luma2020" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix"
        values="${En(0.2627,0.678,0.0593)}"/>
    </filter>
    <filter id="scf-chroma709" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix"
        values="${Sn(0.2126,0.7152,0.0722)}"/>
    </filter>
    <filter id="scf-chroma2020" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix"
        values="${Sn(0.2627,0.678,0.0593)}"/>
    </filter>
    ${Ci()}
  </defs>`}function Si(){let e=document.createElementNS("http://www.w3.org/2000/svg","svg");return e.id="_scf_defs_",e.style.cssText="position:fixed;width:0;height:0;overflow:hidden;pointer-events:none;z-index:-9999",e.innerHTML=Ei(),e}function Tn(e){if(e.getElementById("_scf_defs_"))return;(e===document?document.body:e).appendChild(Si())}function We(){Tn(document),Tn(C())}var Yt;function E(e){let t=C().getElementById("_scf_toast_");if(!t)t=document.createElement("div"),t.id="_scf_toast_",Object.assign(t.style,{position:"fixed",bottom:"28px",left:"50%",transform:"translateX(-50%)",background:"rgba(12,12,12,.88)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.13)",boxShadow:"0 4px 16px rgba(0,0,0,.45)",color:"#fff",font:"600 13px/1 system-ui,sans-serif",letterSpacing:".4px",padding:"9px 22px",borderRadius:"999px",zIndex:"2147483647",pointerEvents:"none",transition:"opacity .3s ease",opacity:"0",whiteSpace:"nowrap",textAlign:"center"}),C().appendChild(t);if(typeof e==="string")t.textContent=e,Object.assign(t.style,{padding:"9px 22px",borderRadius:"999px",whiteSpace:"nowrap",lineHeight:"1"});else t.replaceChildren(...e.map((o)=>{let n=document.createElement("div");n.textContent=o.text;let r=o.size||"normal";if(Object.assign(n.style,{fontSize:r==="large"?"16px":r==="small"?"12px":r==="tiny"?"10px":"13px",fontWeight:r==="large"?"700":"600",lineHeight:r==="large"?"1.2":"1.25",opacity:o.muted?".72":"1"}),o.color)n.style.color=o.color;return n})),Object.assign(t.style,{padding:"10px 22px",borderRadius:"10px",whiteSpace:"normal",lineHeight:"1.25"});t.style.opacity="1",clearTimeout(Yt),Yt=setTimeout(()=>t.style.opacity="0",Bo())}function kn(){clearTimeout(Yt);let e=C().getElementById("_scf_toast_");if(e)e.style.opacity="0"}function U(e,t,o){return Math.max(t,Math.min(o,e))}var N="fit",Q=0,be=!0;function je(e){N=e}function Ze(e){Q=e}function Ln(){be=!be}var B=!1;function ft(){B=!B}function Rn(e){B=e}function In(e){be=e}function Se(){for(let e of w)if(e.compDiv.classList.toggle("_scf_fill_canvas",B),e.updateNavMap)e.updateNavMap()}var w=[];function An(e){w.push(e)}function Dn(e){w=w.filter((t)=>t!==e)}function mt(e){let t=(e.rowSyncSuppressToken||0)+1;e.rowSyncSuppressToken=t,e.suppressRowSync=!0;let o=()=>{if(e.rowSyncSuppressToken!==t)return;e.suppressRowSync=!1};if(typeof window.requestAnimationFrame==="function")window.requestAnimationFrame(()=>window.requestAnimationFrame(o));else setTimeout(o,0)}function Nn(e,t){let o=Math.max(0,t.rowWidth-t.viewportWidth),n=t.rowLeft+t.rowWidth*e.rowXRatio-e.viewportX,r=0,i=Math.max(0,t.contentHeight-t.viewportHeight),a=e.scrollTopBounds==="row"&&t.rowHeight>t.viewportHeight,s=a?t.rowTop:0,l=a?Math.max(s,t.rowTop+t.rowHeight-t.viewportHeight):i;return{scrollLeft:U(n,0,o),scrollTop:U(t.rowTop+t.rowHeight*e.rowYRatio-e.viewportY,s,l)}}function Ti(e,t){let o=e.compDiv.scrollTop+t,n=0,r=1/0;for(let i=0;i<e.allRowData.length;i++){let a=e.allRowData[i].rowDiv,s=a.offsetTop,l=s+a.offsetHeight;if(o>=s&&o<=l)return i;let f=o<s?s-o:o-l;if(f<r)r=f,n=i}return n}function $t(e,t){if(!e.allRowData.length)return null;let o=e.compDiv.clientWidth/2,n=e.compDiv.clientHeight/2;if(t){let d=e.compDiv.getBoundingClientRect();o=U(t.clientX-d.left,0,e.compDiv.clientWidth),n=U(t.clientY-d.top,0,e.compDiv.clientHeight)}let r=U(t?Ti(e,n):e.currentRow,0,e.allRowData.length-1),i=e.allRowData[r].rowDiv,a=i.offsetLeft,s=i.offsetWidth||1,l=i.offsetHeight||1,f=t?U((e.compDiv.scrollLeft+o-a)/s,0,1):0.5,u=t?U((e.compDiv.scrollTop+n-i.offsetTop)/l,0,1):0.5;return{comp:e,rowIdx:r,currentRowIdx:t?r:e.currentRow,scrollTopBounds:t?"content":"row",rowXRatio:f,rowYRatio:u,viewportX:o,viewportY:n}}function qt(){return w.map((e)=>$t(e)).filter((e)=>e!==null)}function Mi(e){let t=e.comp.allRowData[e.rowIdx]?.rowDiv;if(!t)return;let o=Nn(e,{rowLeft:t.offsetLeft,rowTop:t.offsetTop,rowWidth:t.offsetWidth||1,rowHeight:t.offsetHeight||1,contentHeight:e.comp.compDiv.scrollHeight,viewportWidth:e.comp.compDiv.clientWidth,viewportHeight:e.comp.compDiv.clientHeight});mt(e.comp),e.comp.compDiv.scrollLeft=o.scrollLeft,e.comp.compDiv.scrollTop=o.scrollTop;let n=e.comp.currentRow!==e.currentRowIdx;if(e.comp.currentRow=e.currentRowIdx,e.comp.updateRowNav)e.comp.updateRowNav(e.currentRowIdx);if(e.comp.updateLabel?.(),e.comp.updateLoadingOverlay?.(),n)e.comp.updateActiveFilter?.()}function Pn(e){let t=e.allRowData[e.currentRow];if(!t)return;let o=t.rowDiv,n=e.compDiv.clientWidth,r=e.compDiv.clientHeight,i=Nn({rowXRatio:0.5,rowYRatio:0.5,viewportX:n/2,viewportY:r/2,scrollTopBounds:"row"},{rowLeft:o.offsetLeft,rowTop:o.offsetTop,rowWidth:o.offsetWidth||1,rowHeight:o.offsetHeight||1,contentHeight:e.compDiv.scrollHeight,viewportWidth:n,viewportHeight:r});mt(e),e.compDiv.scrollLeft=i.scrollLeft,e.compDiv.scrollTop=i.scrollTop}function ki(){if(Nt()!=="device")return 1;return window.devicePixelRatio||1}function pe(e){if(!e)return 0;return Math.round(e/ki())}function pt(){if(N==="1:1")return 1;let e=Ke();return e?Q/e:1}function Hn(e,t,o){let n=e.imgs[t.currentCol];if(n?.naturalWidth){e.rowDiv.style.width=`${Math.round(pe(n.naturalWidth)*o)}px`;return}if(e.rowDiv.style.width=e.sizer?.naturalWidth?`${Math.round(pe(e.sizer.naturalWidth)*o)}px`:"100%",n?.addEventListener("load",()=>{if(N!=="fit"&&e.imgs[t.currentCol]===n&&n.naturalWidth)e.rowDiv.style.width=`${Math.round(pe(n.naturalWidth)*pt())}px`},{once:!0}),e.sizer&&!e.sizer.naturalWidth)e.sizer.addEventListener("load",()=>{if(N==="fit")return;if(e.rowDiv.style.width&&e.rowDiv.style.width!=="100%")return;let r=e.imgs[t.currentCol]?.naturalWidth||e.sizer?.naturalWidth||0;if(r)e.rowDiv.style.width=`${Math.round(pe(r)*pt())}px`},{once:!0})}function Bn(e,t){if(N==="fit")return;Hn(e,t,pt())}function _e(e=[]){for(let t of w)if(N==="fit"){for(let o of t.allRowData)o.rowDiv.style.width="100%";t.compDiv.classList.remove("_scf_zoomed")}else{let o=pt();for(let n of t.allRowData)Hn(n,t,o);t.compDiv.classList.add("_scf_zoomed")}for(let t of w)if(t.updateScrollSpacers)t.updateScrollSpacers();for(let t of e)Mi(t);for(let t of w){if(t.updateNavMap)t.updateNavMap();if(t.syncFillCanvasVisibility)t.syncFillCanvasVisibility()}}function Gn(){if(Wo()==="fit")return window.innerWidth;return Ke()||pe(Li())||window.innerWidth}function Li(){return C().querySelector("._scf_comp_sizer")?.naturalWidth||0}function Ri(){let e=C().querySelector("._scf_comp_sizer"),t=e?.naturalWidth||0,o=e?.naturalHeight||0,n=pe(t),r=w[w.length-1];if(r){let i=r.allRowData[r.currentRow];if(i){let a=i.imgs[r.currentCol];if(a?.naturalWidth)t=a.naturalWidth,o=a.naturalHeight;n=Math.round(i.rowDiv.offsetWidth)||pe(t)}}return{nativeW:t,nativeH:o,screenW:n}}function Ke(){let e=w[w.length-1];if(e)for(let t of e.allRowData){let o=t.imgs[e.currentCol];if(o?.naturalWidth)return pe(o.naturalWidth)}return 0}var Ii="#7ee0a0",Ai="#8ab4f8";function Di(e){if(!Number.isFinite(e)||e<=0)return"1";return String(Number(e.toFixed(2)))}function ie(){let e=N==="fit"?"\uD83D\uDD0D Fit":N==="1:1"?"\uD83D\uDD0D 1:1":"\uD83D\uDD0D "+Math.round(Q/Gn()*100)+"%",t=window.devicePixelRatio||1,o=Di(t),n=Nt()==="device"&&o!=="1";if(!Pt()&&!n)return e;let r=[{text:e,size:"large"}],{nativeW:i,nativeH:a,screenW:s}=Ri();if(i){let l=a?Math.round(s*a/i):0,f=a?i+"×"+a:i+"px",u=l?s+"×"+l:s+"px",d=n?"@"+o+"x":" ("+Math.round(s/i*100)+"%)";r.push({text:"Original "+f,size:"small",color:Ii}),r.push({text:"On screen "+u+d,size:"small",color:Ai})}if(Pt())r.push({text:"Viewport "+window.innerWidth+"px",size:"tiny",muted:!0});return r}function Xt(e,t){let o=Go();return t>0?Math.min(Math.round(e*o),window.innerWidth*8):Math.max(Math.round(e/o),Math.round(window.innerWidth*0.1))}function Jt(e,t){let o=Gn();if(o>0&&e!==o){if(t>e&&e<o&&t>o||t<e&&e>o&&t<o)return o}return t}function Qt(){return(N==="fit"?window.innerWidth:N==="1:1"?Ke():Q)||window.innerWidth}function Fn(e){let t=qt(),o=Qt();Q=Jt(o,Xt(o,e)),N="custom",_e(t),E(ie())}var On=()=>Fn(1),zn=()=>Fn(-1);function Wn(){let e=qt();N="fit",Q=0,_e(e),E(ie())}function gt(e={}){let t=e.silent?[]:qt();if(N="1:1",Q=Ke()||Q,_e(t),!e.silent)E(ie())}function Ue(){if(N!=="1:1")return;Q=Ke()||Q,_e()}function Ve(){let e=C().getElementById("_scf_hud_");if(!e)e=document.createElement("div"),e.id="_scf_hud_",Object.assign(e.style,{position:"fixed",top:"12px",right:"44px",background:"rgba(12,12,12,.82)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.14)",boxShadow:"0 2px 10px rgba(0,0,0,.4)",color:"#fff",font:"600 11px/1 system-ui,sans-serif",letterSpacing:".3px",padding:"5px 12px",borderRadius:"8px",textAlign:"center",whiteSpace:"nowrap",zIndex:"2147483647",pointerEvents:"none",transition:"opacity .25s ease",opacity:"0"}),C().appendChild(e);let t=j().label||"",o=w[w.length-1],n=null;if(o){let i=o.currentCol,a=o.colBrightness[i],s=o.colGammaCheck[i],l=o.colContrast[i];if(!ue(a))t+=(t?"  ":"")+"☀"+Math.round(a*100)+"%";if(s)n=gn(s);if(!ue(l))t+=(t?"  ":"")+"◐"+Math.round(l*100)+"%"}let r=t||n;if(e.style.opacity=r?"1":"0",r)if(e.replaceChildren(),n){let i=[];if(t)i.push(t+"  ");i.push(n.line1);let a=document.createElement("div");a.textContent=i.join(""),e.appendChild(a);let s=document.createElement("div");s.textContent=n.line2,Object.assign(s.style,{fontSize:"9px",opacity:".6",marginTop:"2px"}),e.appendChild(s)}else e.textContent=t}var Ni=4,eo=0,to=new AbortController,jn=new WeakMap;function Zn(){let e=eo;return()=>e===eo}function no(){return to.abort(),to=new AbortController,eo++,Zn()}function Pi(e,t){if(e<=0)return[];let o=Math.max(0,Math.min(e-1,Math.trunc(t))),n=[o];for(let r=1;n.length<e;r++){let i=o-r,a=o+r;if(i>=0)n.push(i);if(a<e)n.push(a)}return n}function Hi(e,t){if(e<=0)return[];let o=Math.max(0,Math.min(e-1,Math.trunc(t))),n=[o];for(let r=o-1;r>=0;r--)n.push(r);for(let r=o+1;r<e;r++)n.push(r);return n}function Bi(e){let t=[],o=Pi(e.allRowData.length,e.currentRow),n=Hi(e.numCols,e.currentCol);for(let r of o){let i=e.allRowData[r];if(!i)continue;for(let a of n){let s=i.imgs[a];if(s?.src)t.push({comp:e,row:r,col:a,img:s})}}return t}function Gi(e){if(e.closest("._scf_comp")||e.closest("._scf_nav_map")||e.closest("#_scf_hud_")||e.closest("#_scf_toast_"))return!1;if(e.offsetWidth>200||e.naturalWidth>200)return!0;if(e.classList.contains("screenshot-comparison__image"))return!0;return!1}function Fi(){return[...document.querySelectorAll("img")].filter(Gi)}async function Oi(e,t){let o=j();if(o.f709)return await yn(e,t)==="2020"?o.f2020:o.f709;return o.filter||""}function zi(e,t=1,o=1,n=null){let r=[],i=dn(n);if(i)r.push(i);if(e)r.push(e);let a=ln(t,o);if(a)r.push(a);return r.join(" ")}async function Te(e,t={}){let o=t.shouldApply??Zn(),n=t.signal??to.signal,r=e.src,i={};jn.set(e,i);let a=()=>!n.aborted&&o()&&e.isConnected!==!1&&e.src===r&&jn.get(e)===i,s=(f)=>{if(a())e.style.filter=zi(f,t.brightness,t.contrast,t.gammaCheck??null)},l=j();if(l.f709){let f=wn(r);s(f?.primaries==="2020"?l.f2020:l.f709)}try{s(await Oi(r,n))}catch(f){if(!n.aborted)throw f}}function Kn(e){if(j().f709&&w.includes(e))z()}async function oo(e,t){let{comp:o,col:n,img:r}=e;await Te(r,{brightness:o.colBrightness[n],contrast:o.colContrast[n],gammaCheck:o.colGammaCheck[n],shouldApply:t})}function Wi(){return new Promise((e)=>setTimeout(e,0))}async function ji(e,t,o,n){if(!e.length||!o())return;let r=Math.max(1,Math.floor(Number.isFinite(t)?t:1)),i=Math.min(r,e.length),a=0;async function s(){while(o()){let l=a++,f=e[l];if(f===void 0)return;await n(f),await Wi()}}await Promise.all(Array.from({length:i},()=>s()))}function Zi(e){let t=[],o=[];for(let n of e)if(n.row===n.comp.currentRow&&n.col===n.comp.currentCol)t.push(n);else o.push(n);return{anchors:t,rest:o}}function Ki(){return new Promise((e)=>{if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>requestAnimationFrame(()=>e()));else setTimeout(e,0)})}async function Ui(e,t,o,n,r,i,a){for(let s of e){if(!n())return;await r(s)}if(!n())return;if(a&&e.length>0){if(await a(),!n())return}await ji(t,o,n,i)}async function Vi(e,t,o){let{anchors:n,rest:r}=Zi(e),i=[...r.map((a)=>({type:"viewer",target:a})),...t.map((a)=>({type:"page",img:a}))];await Ui(n,i,Ni,o,(a)=>oo(a,o),async(a)=>{if(a.type==="viewer")await oo(a.target,o);else await Te(a.img,{shouldApply:o})},Ki)}function z(){let e=no(),t=j(),o=Fi(),n=w.flatMap(Bi);if(We(),ut(t)){if(t.f709){Vi(n,o,e),Ve();return}o.forEach((r)=>{Te(r,{shouldApply:e})})}else for(let r of o)r.style.filter="";n.forEach((r)=>{oo(r,e)}),Ve()}function ve(){let e=C();if(e.getElementById("_scf_css_"))return;let t=document.createElement("style");t.id="_scf_css_",t.textContent=`
    ._scf_comp {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483646;
      background: #000;
      overflow-y: auto;
      overflow-x: hidden;
      text-align: center;
    }
    ._scf_comp._scf_zoomed {
      overflow: auto;
    }
    ._scf_comp_row {
      position: relative;
      width: 100%;
      cursor: crosshair;
      margin: 0 auto 2px;
      line-height: 0;
      overflow: hidden;
    }
    ._scf_loading_overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 2;
    }
    ._scf_loading_overlay[hidden] {
      display: none;
    }
    ._scf_loading_spinner {
      position: absolute;
      top: 0;
      left: 0;
      width: 32px;
      height: 32px;
      margin: 0;
      border: 3px solid rgba(255,255,255,.15);
      border-top-color: #fff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: _scf_spin .7s linear infinite;
    }
    ._scf_loading_caption {
      position: absolute;
      top: 28px;
      left: 0;
      width: max-content;
      max-width: min(80vw, 720px);
      overflow: hidden;
      color: rgba(255,255,255,.9);
      font: 600 14px/1.35 system-ui, sans-serif;
      text-overflow: ellipsis;
      text-shadow: 0 1px 4px rgba(0,0,0,.8);
      white-space: nowrap;
      transform: translateX(-50%);
    }
    @keyframes _scf_spin {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }
    ._scf_comp._scf_zoomed ._scf_comp_row {
      cursor: crosshair;
    }
    ._scf_scroll_spacer {
      width: 100%;
      height: 0;
      pointer-events: none;
      line-height: 0;
    }
    ._scf_comp._scf_dragging,
    ._scf_comp._scf_dragging ._scf_comp_row {
      cursor: grabbing !important;
    }
    ._scf_row_nav {
      position: fixed;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      box-sizing: border-box;
      max-height: calc(100vh - 72px);
      overflow-y: auto;
      scrollbar-width: none;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 5px 7px 5px 9px;
      z-index: 2147483647;
      pointer-events: none;
    }
    ._scf_row_nav::-webkit-scrollbar { display: none; }
    ._scf_row_nav_item {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255,255,255,.15);
      color: rgba(255,255,255,.5);
      font: 600 11px/24px system-ui, sans-serif;
      text-align: center;
      pointer-events: auto;
      cursor: pointer;
      transform: translateX(0) scale(1);
      transition:
        transform .18s cubic-bezier(.22, 1, .36, 1),
        background .18s cubic-bezier(.22, 1, .36, 1),
        color .18s cubic-bezier(.22, 1, .36, 1),
        box-shadow .18s cubic-bezier(.22, 1, .36, 1);
    }
    ._scf_row_nav_item:is(:hover, :focus-visible):not(._scf_active) {
      background: rgba(255,255,255,.36);
      color: rgba(255,255,255,.94);
      box-shadow: 0 0 0 2px rgba(255,255,255,.1);
      transform: translateX(-1px) scale(1.06);
    }
    ._scf_row_nav_item:focus-visible {
      outline: 1px solid rgba(255,255,255,.72);
      outline-offset: 2px;
    }
    ._scf_row_nav_item._scf_active {
      background: rgba(0,0,0,.62);
      color: rgba(255,255,255,.96);
    }
    ._scf_row_nav_item._scf_active:is(:hover, :focus-visible) {
      background: rgba(0,0,0,.9);
      color: #fff;
      box-shadow: 0 3px 12px rgba(0,0,0,.46);
      transform: translateX(-2px) scale(1.12);
    }
    ._scf_row_nav_item:is(:hover, :focus-visible):active {
      transform: translateX(-1px) scale(.98);
      transition-duration: .08s;
    }
    ._scf_row_nav_item._scf_active:is(:hover, :focus-visible):active {
      transform: translateX(-1px) scale(1.04);
      transition-duration: .08s;
    }
    @media (prefers-reduced-motion: reduce) {
      ._scf_row_nav_item {
        transition: none;
      }
      ._scf_row_nav_item:is(:hover, :focus-visible):not(._scf_active),
      ._scf_row_nav_item._scf_active:is(:hover, :focus-visible),
      ._scf_row_nav_item:is(:hover, :focus-visible):active,
      ._scf_row_nav_item._scf_active:is(:hover, :focus-visible):active {
        transform: none;
      }
    }
    ._scf_comp_sizer {
      width: 100%;
      display: block;
      visibility: hidden;
    }
    ._scf_comp_cell {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    ._scf_comp_img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      image-rendering: auto;
    }
    ._scf_comp._scf_fill_canvas ._scf_comp_img {
      object-fit: cover;
    }
    ._scf_comp_label {
      position: fixed;
      top: 0;
      left: 50%;
      z-index: 2147483647;
      background: none;
      color: #fff;
      font: bold 16px/1 system-ui, sans-serif;
      padding: 10px 0;
      pointer-events: none;
      white-space: nowrap;
      width: max-content;
      transform: translateX(-50%);
      text-shadow: 0 1px 4px rgba(0,0,0,.7);
      transition: opacity .15s ease;
    }
    ._scf_comp_label_item:not(:last-child) {
      margin-right: .5em;
    }
    ._scf_comp_label_columns {
      left: 0;
      width: var(--_scf_comp_viewport_width, 100vw);
      display: grid;
      align-items: start;
      white-space: normal;
      transform: none;
    }
    ._scf_comp_label_columns ._scf_comp_label_item {
      box-sizing: border-box;
      min-width: 0;
      max-width: 100%;
      margin-right: 0;
      padding: 0 6px;
      width: fit-content;
      justify-self: center;
      text-align: left;
      display: grid;
      grid-template-columns: max-content minmax(0, 1fr);
      white-space: normal;
      overflow-wrap: anywhere;
    }
    ._scf_comp_label_index {
      white-space: nowrap;
    }
    ._scf_comp_label_columns ._scf_comp_label_name {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    /* ① Auto-hide chrome: fade these out after a spell of no activity. */
    ._scf_row_nav,
    ._scf_close_btn,
    ._scf_toolbar {
      transition: opacity .2s ease;
    }
    ._scf_ui_autohidden {
      opacity: 0 !important;
      pointer-events: none !important;
    }
    ._scf_ui_dimmed {
      opacity: 0.5 !important;
    }
    ._scf_ui_force_hidden {
      display: none !important;
    }
    ._scf_nav_map {
      position: fixed;
      bottom: 16px;
      right: 16px;
      z-index: 2147483647;
      border: 1px solid rgba(255,255,255,.3);
      background: rgba(0,0,0,.6);
      border-radius: 4px;
      overflow: hidden;
      cursor: crosshair;
      display: none;
      opacity: 0;
      transition: opacity .2s ease;
      pointer-events: none;
      line-height: 0;
    }
    ._scf_nav_map img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
    }
    ._scf_nav_map_rect {
      position: absolute;
      top: 0;
      left: 0;
      border: 1.5px solid rgba(255,80,80,.9);
      background: rgba(255,80,80,.15);
      box-sizing: border-box;
      pointer-events: none;
      border-radius: 1px;
    }
    ._scf_close_btn {
      position: fixed;
      top: max(16px, calc(env(safe-area-inset-top) + 16px));
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      min-width: 44px;
      min-height: 44px;
      height: 44px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 999px;
      background: rgba(12,12,12,.82);
      color: #fff;
      cursor: pointer;
      padding: 0;
      opacity: .48;
      box-shadow: 0 2px 10px rgba(0,0,0,.4);
      backdrop-filter: blur(8px);
      transition: opacity .15s ease, background .15s ease, border-color .15s ease;
    }
    ._scf_close_btn:hover,
    ._scf_close_btn:focus-visible {
      opacity: 1;
      border-color: rgba(255,255,255,.32);
      background: rgba(24,24,24,.9);
    }
    ._scf_close_btn:focus-visible {
      outline: 2px solid rgba(255,255,255,.72);
      outline-offset: 2px;
    }
    ._scf_close_btn._scf_left { left: max(16px, calc(env(safe-area-inset-left) + 16px)); }
    ._scf_close_btn._scf_right { right: max(56px, calc(env(safe-area-inset-right) + 56px)); }
    ._scf_close_btn._scf_hidden { display: none; }
    ._scf_close_icon {
      position: relative;
      display: block;
      width: 14px;
      height: 14px;
    }
    ._scf_close_icon::before,
    ._scf_close_icon::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 14px;
      height: 2px;
      border-radius: 1px;
      background: currentColor;
    }
    ._scf_close_icon::before { transform: translate(-50%, -50%) rotate(45deg); }
    ._scf_close_icon::after { transform: translate(-50%, -50%) rotate(-45deg); }
    ._scf_toolbar {
      position: fixed;
      left: max(6px, calc(env(safe-area-inset-left) + 6px));
      bottom: max(6px, calc(env(safe-area-inset-bottom) + 6px));
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      padding: 10px;
      font: 600 12px/1.2 system-ui, sans-serif;
      text-align: left;
      color: #fff;
    }
    ._scf_source_menu {
      position: relative;
    }
    ._scf_source_menu_btn,
    ._scf_settings_btn {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      width: 44px;
      min-width: 44px;
      min-height: 44px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 999px;
      background: rgba(12,12,12,.82);
      color: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,.4);
      backdrop-filter: blur(8px);
      font: inherit;
      cursor: pointer;
      padding: 0 11px;
      overflow: hidden;
      opacity: .48;
      transition: width .16s ease, opacity .15s ease, background .15s ease, border-color .15s ease;
    }
    ._scf_settings_btn {
      justify-content: center;
      padding: 0;
    }
    ._scf_source_menu:hover ._scf_source_menu_btn,
    ._scf_source_menu_btn:focus-visible,
    ._scf_source_menu._scf_open ._scf_source_menu_btn,
    ._scf_settings_btn:hover,
    ._scf_settings_btn:focus-visible {
      opacity: 1;
    }
    ._scf_source_menu:hover ._scf_source_menu_btn,
    ._scf_source_menu_btn:focus-visible,
    ._scf_source_menu._scf_open ._scf_source_menu_btn {
      width: 94px;
    }
    ._scf_source_menu_btn:hover,
    ._scf_source_menu_btn:focus-visible,
    ._scf_source_menu._scf_open ._scf_source_menu_btn,
    ._scf_settings_btn:hover,
    ._scf_settings_btn:focus-visible {
      border-color: rgba(255,255,255,.32);
      background: rgba(24,24,24,.9);
    }
    ._scf_source_menu_btn:focus-visible,
    ._scf_settings_btn:focus-visible {
      outline: 2px solid rgba(255,255,255,.72);
      outline-offset: 2px;
    }
    ._scf_settings_btn_icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      line-height: 0;
    }
    ._scf_settings_btn_icon svg {
      display: block;
      width: 20px;
      height: 20px;
    }
    ._scf_source_menu_icon {
      position: relative;
      display: block;
      width: 20px;
      height: 14px;
    }
    ._scf_source_menu_icon::before {
      content: "";
      position: absolute;
      left: 3px;
      top: 2px;
      width: 14px;
      height: 2px;
      border-radius: 2px;
      background: currentColor;
      box-shadow: 0 5px 0 currentColor, 0 10px 0 currentColor;
    }
    ._scf_source_menu_count {
      display: block;
      min-width: 0;
      width: 0;
      overflow: hidden;
      color: rgba(255,255,255,.62);
      font-weight: 700;
      white-space: nowrap;
      transition: width .16s ease;
    }
    ._scf_source_menu:hover ._scf_source_menu_count,
    ._scf_source_menu_btn:focus-visible ._scf_source_menu_count,
    ._scf_source_menu._scf_open ._scf_source_menu_count {
      width: 42px;
    }
    ._scf_source_menu_panel {
      position: absolute;
      left: 10px;
      bottom: 62px;
      width: min(280px, calc(100vw - 32px));
      max-height: min(360px, calc(100vh - 96px));
      overflow-y: auto;
      padding: 6px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 8px;
      background: rgba(12,12,12,.9);
      box-shadow: 0 6px 24px rgba(0,0,0,.55);
      backdrop-filter: blur(10px);
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,.32) transparent;
    }
    ._scf_source_option {
      display: grid;
      grid-template-columns: 22px 24px minmax(0, 1fr);
      align-items: center;
      min-height: 40px;
      gap: 6px;
      border-radius: 6px;
      padding: 2px 8px 2px 4px;
      cursor: pointer;
    }
    ._scf_source_option:hover,
    ._scf_source_option._scf_active {
      background: rgba(255,255,255,.11);
    }
    ._scf_source_option input {
      margin: 0;
      accent-color: #fff;
      cursor: pointer;
    }
    ._scf_source_option_idx {
      color: rgba(255,255,255,.48);
      font-size: 11px;
      text-align: right;
    }
    ._scf_source_option_name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    ._scf_fill_canvas_toggle {
      position: relative;
    }
    ._scf_fill_canvas_btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      min-width: 44px;
      min-height: 44px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 999px;
      background: rgba(12,12,12,.82);
      color: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,.4);
      backdrop-filter: blur(8px);
      font: inherit;
      cursor: pointer;
      padding: 0;
      opacity: .48;
      transition: opacity .15s ease, background .15s ease, border-color .15s ease;
    }
    ._scf_fill_canvas_btn:hover,
    ._scf_fill_canvas_btn:focus-visible,
    ._scf_fill_canvas_toggle._scf_open ._scf_fill_canvas_btn {
      opacity: 1;
      border-color: rgba(255,255,255,.32);
      background: rgba(24,24,24,.9);
    }
    ._scf_fill_canvas_btn._scf_active {
      opacity: 1;
      border-color: rgba(255,255,255,.5);
      background: rgba(40,40,40,.92);
    }
    ._scf_fill_canvas_btn:focus-visible {
      outline: 2px solid rgba(255,255,255,.72);
      outline-offset: 2px;
    }
    ._scf_fill_canvas_icon {
      position: relative;
      display: block;
      width: 20px;
      height: 14px;
    }
    ._scf_fill_canvas_icon::before,
    ._scf_fill_canvas_icon::after {
      content: "";
      position: absolute;
      border: 2px solid currentColor;
      border-radius: 1px;
    }
    ._scf_fill_canvas_icon::before {
      top: 0;
      left: 1px;
      width: 8px;
      height: 6px;
      border-right: none;
      border-bottom: none;
    }
    ._scf_fill_canvas_icon::after {
      bottom: 0;
      right: 1px;
      width: 8px;
      height: 6px;
      border-left: none;
      border-top: none;
    }
    ._scf_fill_canvas_panel {
      position: absolute;
      left: 0;
      bottom: 52px;
      width: 140px;
      padding: 6px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 8px;
      background: rgba(12,12,12,.9);
      box-shadow: 0 6px 24px rgba(0,0,0,.55);
      backdrop-filter: blur(10px);
    }
    ._scf_fill_canvas_option {
      display: grid;
      grid-template-columns: 22px minmax(0, 1fr);
      align-items: center;
      min-height: 36px;
      gap: 6px;
      border-radius: 6px;
      padding: 2px 8px 2px 4px;
      cursor: pointer;
    }
    ._scf_fill_canvas_option:hover,
    ._scf_fill_canvas_option._scf_active {
      background: rgba(255,255,255,.11);
    }
    ._scf_fill_canvas_option input {
      margin: 0;
      accent-color: #fff;
      cursor: pointer;
    }
    ._scf_fill_canvas_option_name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    ._scf_help_button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      min-width: 44px;
      min-height: 44px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 999px;
      background: rgba(12,12,12,.82);
      color: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,.4);
      backdrop-filter: blur(8px);
      font: 700 19px/1 system-ui, sans-serif;
      cursor: pointer;
      padding: 0;
      opacity: .48;
      transition: opacity .15s ease, background .15s ease, border-color .15s ease;
    }
    ._scf_help_button:hover,
    ._scf_help_button:focus-visible {
      opacity: 1;
      border-color: rgba(255,255,255,.32);
      background: rgba(24,24,24,.9);
    }
    ._scf_help_button:focus-visible {
      outline: 2px solid rgba(255,255,255,.72);
      outline-offset: 2px;
    }
    ._scf_help_overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
    }
    ._scf_help_panel {
      position: absolute;
      top: 24px;
      left: 24px;
      max-height: calc(100vh - 48px);
      overflow: auto;
      min-width: 300px;
      max-width: min(92vw, 440px);
      padding: 14px 22px 18px;
      background: rgba(18,18,20,.96);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 14px;
      box-shadow: 0 14px 44px rgba(0,0,0,.6);
      backdrop-filter: blur(10px);
      color: #e8e8e8;
      font: 500 14px/1.3 system-ui, sans-serif;
      text-align: left;
    }
    ._scf_help_section {
      margin: 15px 0 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .13em;
      text-transform: uppercase;
      color: #80808a;
    }
    ._scf_help_section:first-child {
      margin-top: 2px;
    }
    ._scf_help_row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 4px 0;
    }
    ._scf_help_keys {
      flex: 0 0 118px;
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    ._scf_help_chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      padding: 3px 10px;
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 7px;
      background: rgba(255,255,255,.05);
      font: 600 13px/1 ui-monospace, "SF Mono", Menlo, monospace;
      color: #fff;
      white-space: nowrap;
    }
    ._scf_help_desc {
      font-weight: 600;
      color: #f0f0f0;
    }
    ._scf_help_note {
      font-weight: 500;
      color: #93939b;
    }
    ._scf_settings_overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      background: rgba(0,0,0,.6);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ._scf_settings_panel {
      width: min(420px, calc(100vw - 32px));
      max-height: min(720px, calc(100vh - 48px));
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 12px;
      background: rgba(12,12,12,.94);
      box-shadow: 0 8px 32px rgba(0,0,0,.6);
      backdrop-filter: blur(12px);
      color: #fff;
      font: 600 13px/1.4 system-ui, sans-serif;
    }
    ._scf_settings_header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid rgba(255,255,255,.1);
    }
    ._scf_settings_title {
      font-size: 15px;
      font-weight: 700;
    }
    ._scf_settings_close {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: rgba(255,255,255,.5);
      font: 600 18px/28px system-ui, sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ._scf_settings_close:hover { background: rgba(255,255,255,.1); color: #fff; }
    ._scf_settings_body {
      flex: 1;
      overflow-y: auto;
      padding: 12px 20px 16px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,.2) transparent;
    }
    ._scf_settings_group_label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .8px;
      color: rgba(255,255,255,.4);
      margin: 14px 0 8px;
    }
    ._scf_settings_group_label:first-child { margin-top: 0; }
    ._scf_settings_row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 38px;
      padding: 4px 0;
    }
    ._scf_settings_label {
      color: rgba(255,255,255,.88);
      font-weight: 600;
    }
    ._scf_settings_radios {
      display: flex;
      gap: 4px;
    }
    ._scf_settings_radio {
      padding: 5px 12px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 6px;
      background: transparent;
      color: rgba(255,255,255,.6);
      font: 600 12px/1 system-ui, sans-serif;
      cursor: pointer;
      transition: background .12s, color .12s, border-color .12s;
    }
    ._scf_settings_radio:hover {
      border-color: rgba(255,255,255,.32);
      color: rgba(255,255,255,.88);
    }
    ._scf_settings_radio._scf_selected {
      background: rgba(255,255,255,.14);
      border-color: rgba(255,255,255,.4);
      color: #fff;
    }
    ._scf_settings_text {
      padding: 5px 10px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 6px;
      background: rgba(0,0,0,.25);
      color: #fff;
      font: 600 13px/1 system-ui, sans-serif;
      width: 130px;
      max-width: 45%;
      text-align: center;
    }
    ._scf_settings_text:focus {
      outline: none;
      border-color: rgba(255,255,255,.4);
    }
    ._scf_shortcuts { display: flex; flex-direction: column; gap: 2px; }
    ._scf_shortcuts_subhead {
      margin: 9px 0 2px;
      font: 700 11px/1 system-ui, sans-serif;
      text-transform: uppercase;
      letter-spacing: .04em;
      color: rgba(255,255,255,.45);
    }
    ._scf_shortcut_row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 3px 0;
    }
    ._scf_shortcut_fields { display: flex; align-items: center; gap: 6px; }
    ._scf_shortcut_field { position: relative; display: inline-flex; align-items: center; gap: 2px; }
    ._scf_shortcut_btn {
      min-width: 78px;
      padding: 4px 8px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 6px;
      background: rgba(0,0,0,.25);
      color: #fff;
      font: 600 12px/1.2 system-ui, sans-serif;
      cursor: pointer;
      text-align: center;
    }
    ._scf_shortcut_btn:hover { border-color: rgba(255,255,255,.34); }
    ._scf_shortcut_btn._scf_shortcut_empty { color: rgba(255,255,255,.38); }
    ._scf_shortcut_btn._scf_capturing {
      border-color: #8ab4f8;
      color: #8ab4f8;
      box-shadow: 0 0 0 2px rgba(138,180,248,.25);
    }
    ._scf_shortcut_clear {
      border: none; background: none; cursor: pointer;
      color: rgba(255,255,255,.5);
      font: 700 14px/1 system-ui, sans-serif;
      padding: 0 2px;
    }
    ._scf_shortcut_clear:hover { color: #fff; }
    ._scf_shortcut_chips {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      z-index: 5;
      display: flex;
      gap: 3px;
      padding: 4px;
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 6px;
      background: #202020;
      box-shadow: 0 4px 14px rgba(0,0,0,.5);
    }
    ._scf_shortcut_chip {
      padding: 3px 6px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 4px;
      background: transparent;
      color: rgba(255,255,255,.8);
      font: 600 11px/1 system-ui, sans-serif;
      cursor: pointer;
      white-space: nowrap;
    }
    ._scf_shortcut_chip:hover { background: rgba(255,255,255,.14); color: #fff; }
    ._scf_shortcut_reset_row { display: flex; justify-content: flex-end; margin-top: 8px; }
    ._scf_settings_backup { display: flex; gap: 8px; margin-top: 4px; }
    ._scf_settings_toggle {
      position: relative;
      width: 38px;
      height: 22px;
      border: none;
      border-radius: 11px;
      background: rgba(255,255,255,.18);
      cursor: pointer;
      transition: background .15s;
      padding: 0;
    }
    ._scf_settings_toggle._scf_on {
      background: rgba(100,200,120,.7);
    }
    ._scf_settings_toggle::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      transition: transform .15s;
    }
    ._scf_settings_toggle._scf_on::after {
      transform: translateX(16px);
    }
    ._scf_settings_slider_row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    ._scf_settings_range {
      width: 120px;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255,255,255,.18);
      border-radius: 2px;
      outline: none;
      cursor: pointer;
    }
    ._scf_settings_range::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
    }
    ._scf_settings_range::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border: none;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
    }
    ._scf_settings_value {
      min-width: 42px;
      text-align: right;
      font-size: 12px;
      color: rgba(255,255,255,.6);
      font-variant-numeric: tabular-nums;
    }
    ._scf_settings_footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-top: 1px solid rgba(255,255,255,.1);
    }
    ._scf_settings_reset {
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 6px;
      background: transparent;
      color: rgba(255,255,255,.5);
      font: 600 12px/1 system-ui, sans-serif;
      padding: 6px 14px;
      cursor: pointer;
    }
    ._scf_settings_reset:hover { color: #fff; border-color: rgba(255,255,255,.32); }
    ._scf_settings_done {
      border: 1px solid rgba(255,255,255,.3);
      border-radius: 6px;
      background: rgba(255,255,255,.1);
      color: #fff;
      font: 600 12px/1 system-ui, sans-serif;
      padding: 6px 18px;
      cursor: pointer;
    }
    ._scf_settings_done:hover { background: rgba(255,255,255,.18); }
    ._scf_settings_chip_grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 8px 0;
    }
    ._scf_settings_chip {
      padding: 5px 12px;
      border: 1px solid rgba(255,255,255,.15);
      border-radius: 6px;
      background: transparent;
      color: rgba(255,255,255,.35);
      font: 600 12px/1 system-ui, sans-serif;
      cursor: pointer;
      transition: background .12s, color .12s, border-color .12s;
    }
    ._scf_settings_chip:hover {
      border-color: rgba(255,255,255,.3);
      color: rgba(255,255,255,.6);
    }
    ._scf_settings_chip._scf_on {
      background: rgba(255,255,255,.1);
      border-color: rgba(255,255,255,.35);
      color: rgba(255,255,255,.88);
    }
    ._scf_settings_ordered_list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin: 4px 0 8px;
    }
    ._scf_settings_ordered_item {
      display: grid;
      grid-template-columns: 22px 16px minmax(0, 1fr);
      align-items: center;
      min-height: 34px;
      gap: 6px;
      padding: 2px 4px;
      border-radius: 6px;
      transition: background .12s;
    }
    ._scf_settings_ordered_item._scf_enabled {
      background: rgba(255,255,255,.05);
      cursor: grab;
    }
    ._scf_settings_ordered_item._scf_enabled:active { cursor: grabbing; }
    ._scf_settings_ordered_item:hover {
      background: rgba(255,255,255,.08);
    }
    ._scf_settings_ordered_item._scf_dragging {
      opacity: .35;
    }
    ._scf_settings_ordered_item._scf_drag_above {
      box-shadow: 0 -2px 0 0 rgba(100,200,120,.6);
    }
    ._scf_settings_ordered_item._scf_drag_below {
      box-shadow: 0 2px 0 0 rgba(100,200,120,.6);
    }
    ._scf_settings_ordered_check {
      margin: 0;
      accent-color: rgba(100,200,120,.8);
      cursor: pointer;
    }
    ._scf_settings_ordered_handle {
      color: rgba(255,255,255,.25);
      font-size: 14px;
      line-height: 1;
      user-select: none;
    }
    ._scf_settings_ordered_item._scf_enabled ._scf_settings_ordered_handle {
      color: rgba(255,255,255,.4);
    }
    ._scf_settings_ordered_label {
      color: rgba(255,255,255,.88);
      font-weight: 600;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    ._scf_settings_ordered_item:not(._scf_enabled) ._scf_settings_ordered_label {
      color: rgba(255,255,255,.4);
    }
    ._scf_settings_ordered_sep {
      height: 1px;
      background: rgba(255,255,255,.1);
      margin: 4px 0;
    }
    ._scf_settings_help {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      margin-left: 6px;
      padding: 0;
      border: 1px solid rgba(255,255,255,.25);
      border-radius: 50%;
      background: transparent;
      color: rgba(255,255,255,.5);
      font: 700 9px/1 system-ui, sans-serif;
      cursor: help;
      vertical-align: middle;
      transition: color .12s, border-color .12s;
    }
    ._scf_settings_help:hover,
    ._scf_settings_help:focus-visible {
      color: rgba(255,255,255,.9);
      border-color: rgba(255,255,255,.55);
      outline: none;
    }
    ._scf_settings_group_label ._scf_settings_help {
      text-transform: none;
      letter-spacing: 0;
    }
    ._scf_settings_tooltip {
      position: fixed;
      z-index: 10;
      max-width: 280px;
      padding: 8px 10px;
      border-radius: 6px;
      background: rgba(20, 20, 20, .96);
      color: rgba(255,255,255,.92);
      font: 400 12px/1.45 system-ui, sans-serif;
      box-shadow: 0 4px 16px rgba(0,0,0,.5);
      border: 1px solid rgba(255,255,255,.12);
      pointer-events: none;
    }
    ._scf_orphan_select {
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      background: #0b0b0b;
      color: #ddd;
      overflow-y: auto;
      font: 400 13px/1.4 system-ui, sans-serif;
    }
    ._scf_os_header {
      position: sticky;
      top: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: #161616;
      border-bottom: 1px solid #333;
    }
    ._scf_os_hint { flex: 1; }
    ._scf_os_build, ._scf_os_cancel {
      padding: 6px 12px;
      cursor: pointer;
      border: 1px solid #444;
      background: #222;
      color: #ddd;
      border-radius: 4px;
      font: inherit;
    }
    ._scf_os_build:disabled { opacity: .4; cursor: not-allowed; }
    ._scf_os_grid { display: grid; gap: 4px; padding: 8px; }
    ._scf_os_thumb {
      position: relative;
      cursor: pointer;
      aspect-ratio: 16 / 9;
      background: #1a1a1a;
    }
    ._scf_os_thumb img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    ._scf_os_thumb:hover { outline: 2px solid #4a90d9; }
    ._scf_os_thumb._scf_os_excluded { opacity: .35; outline: 2px solid #c0392b; }
    ._scf_os_badge {
      position: absolute;
      top: 4px;
      right: 4px;
      display: none;
      width: 22px;
      height: 22px;
      line-height: 22px;
      text-align: center;
      background: #c0392b;
      color: #fff;
      border-radius: 50%;
      font-weight: bold;
    }
    ._scf_os_thumb._scf_os_excluded ._scf_os_badge { display: block; }
  `,e.appendChild(t)}function Un(e){let t={active:!1},o=!1,n=0,r=0,i=0,a=0,s=4;e.addEventListener("mousedown",(u)=>{if(u.button!==0)return;u.preventDefault(),o=!0,t.active=!1,n=u.clientX,r=u.clientY,i=e.scrollLeft,a=e.scrollTop});function l(u){if(!o)return;if(u.buttons===0){f();return}let d=u.clientX-n,g=u.clientY-r;if(!t.active)if(Math.abs(d)>s||Math.abs(g)>s)t.active=!0,e.classList.add("_scf_dragging");else return;e.scrollLeft=i-d,e.scrollTop=a-g}function f(){if(o)o=!1,t.active=!1,e.classList.remove("_scf_dragging")}return window.addEventListener("mousemove",l),window.addEventListener("mouseup",f),{drag:t,onDragMove:l,onDragEnd:f}}function $n(e){let t=0,o=0;for(let n of e){let r="naturalWidth"in n?n.naturalWidth:n.width,i="naturalHeight"in n?n.naturalHeight:n.height;if(!r||!i)continue;t=Math.max(t,r),o=Math.max(o,i)}return t&&o?`${t} / ${o}`:null}function Yi(e){return $n(e)}function $i(e){let t=e.match(/^((?:https?:)?\/\/i\.hdbits\.org\/[^/?#]+)\.(png|jpe?g|webp)([?#].*)?$/i);if(!t)return null;let o=t[2].toLowerCase(),n=o==="png"?"jpg":o==="jpg"||o==="jpeg"?"webp":null;return n?`${t[1]}.${n}${t[3]??""}`:null}var ht=new WeakMap,ro=new WeakMap;function Vn(e){let t=ht.get(e);if(!t)return;if(t.status="settled",ro.get(t.rowDiv)===e)t.rowDiv.classList.remove("_scf_loading")}function Ye(e,t){let o=ht.get(e);if(o)o.status="pending";e.src=t}function bt(e,t){if(!t){ro.delete(e),e.classList.remove("_scf_loading");return}ro.set(e,t),e.classList.toggle("_scf_loading",ht.get(t)?.status==="pending")}function Yn(e,t){ht.set(e,{rowDiv:t,status:"idle"}),e.addEventListener("load",()=>Vn(e)),e.addEventListener("error",()=>{let o=$i(e.src);if(!o){Vn(e);return}if(Ye(e,o),e.classList.contains("_scf_comp_img")&&Oe())z()})}function qn(e,t,o,n){let r=e[o]?o:0,i=document.createElement("div");i.className="_scf_comp_row _scf_loading",i.dataset.col=String(r);let a=document.createElement("img");a.className="_scf_comp_sizer",Yn(a,i);let s=Yi(e);if(s)i.style.aspectRatio=s;if(n){if(a.dataset.src=e[r].full,!s)i.style.aspectRatio="16 / 9"}else Ye(a,e[r].full);i.appendChild(a);let l=new Map,f=(d)=>{if(!d.naturalWidth||!d.naturalHeight)return;l.set(d,{naturalWidth:d.naturalWidth,naturalHeight:d.naturalHeight});let g=$n(l.values());if(g)i.style.aspectRatio=g},u=[];for(let d=0;d<t;d++){if(!e[d])break;let g=document.createElement("div");g.className="_scf_comp_cell";let p=document.createElement("img");p.className="_scf_comp_img",Yn(p,i);let v=e[d].full;if(!n&&d===r)p.addEventListener("load",()=>f(p),{once:!0}),Ye(p,v);else p.dataset.src=v;if(p.style.visibility=d===r?"visible":"hidden",p.src)Te(p);g.appendChild(p),i.appendChild(g),u.push(p)}if(!n)bt(i,u[r]??a);return{rowDiv:i,sizer:a,imgs:u,adjustRowAR:f}}function io(e,t,o,n){if(!e.dataset.src)return;let r=e.dataset.src;delete e.dataset.src,e.addEventListener("load",()=>n(e),{once:!0}),Ye(e,r),Te(e,{brightness:o.colBrightness[t],contrast:o.colContrast[t],gammaCheck:o.colGammaCheck[t]})}function ao(e,t){if(e.loaded)return;e.loaded=!0;let{sizer:o,rowDiv:n,imgs:r,adjustRowAR:i}=e,a=t.currentCol||0;if(o.dataset.src){let l=r[a]?.dataset.src||r[a]?.src||o.dataset.src;delete o.dataset.src,Ye(o,l)}let s=r[a];if(s)io(s,a,t,i);bt(n,s??o),Bn(e,t)}function Xn(e,t,o){let n=e.imgs[o];if(!n)return;io(n,o,t,e.adjustRowAR)}function Jn(e,t){if(!e.loaded)ao(e,t);let{imgs:o,adjustRowAR:n}=e;for(let r=0;r<o.length;r++)io(o[r],r,t,n)}var Qn=200,er=48;function qi(e){let t=e.rowWidth||1,o=e.rowHeight||1,{viewportWidth:n,viewportHeight:r}=e,i=Math.max(0,e.rowLeft+t-n),a=Math.max(0,e.contentHeight-r),s;if(o<=r)s=e.rowTop+o/2-r/2;else s=U(e.rowTop+e.fy*o-r/2,e.rowTop,e.rowTop+o-r);return{scrollLeft:U(e.rowLeft+e.fx*t-n/2,0,i),scrollTop:U(s,0,a)}}function tr(e,t,o){let n=document.createElement("div");n.className="_scf_nav_map";let r=document.createElement("img");r.draggable=!1,r.alt="",r.style.filter="none",n.appendChild(r);let i=document.createElement("div");i.className="_scf_nav_map_rect",n.appendChild(i),C().appendChild(n);function a(){if(!e.classList.contains("_scf_zoomed")||!be){n.style.display="none",n.style.opacity="0",n.style.pointerEvents="none";return}let v=t[o.currentRow];if(!v)return;let h=v.imgs[o.currentCol],S=h&&(h.src||h.dataset.src);if(S&&r.src!==S)r.src=S;r.style.objectFit=B?"cover":"contain";let c=v.rowDiv,k=c.offsetWidth||1,R=c.offsetHeight||1,P=Math.min(Qn/k,Qn/R);n.style.width=Math.max(Math.round(k*P),er)+"px",n.style.height=Math.max(Math.round(R*P),er)+"px";let V=c.offsetTop,te=e.scrollLeft/k,K=Math.max(0,e.scrollTop-V)/R,oe=Math.min(e.clientWidth/k,1),_=Math.min(e.clientHeight/R,1);i.style.left=te*100+"%",i.style.top=K*100+"%",i.style.width=oe*100+"%",i.style.height=_*100+"%",n.style.display="block",n.style.opacity="1",n.style.pointerEvents="auto"}let s=!1,l=null;function f(p){let v=n.getBoundingClientRect();if(!v.width||!v.height)return;let h=Math.max(0,Math.min(1,(p.clientX-v.left)/v.width)),S=Math.max(0,Math.min(1,(p.clientY-v.top)/v.height)),c=l??o.currentRow,k=t[c];if(!k)return;let R=k.rowDiv,P=qi({fx:h,fy:S,rowLeft:R.offsetLeft,rowTop:R.offsetTop,rowWidth:R.offsetWidth,rowHeight:R.offsetHeight,contentHeight:e.scrollHeight,viewportWidth:e.clientWidth,viewportHeight:e.clientHeight});mt(o);let V=o.currentRow!==c;if(o.currentRow=c,e.scrollLeft=P.scrollLeft,e.scrollTop=P.scrollTop,o.updateRowNav)o.updateRowNav(c);if(o.updateLabel?.(),o.updateLoadingOverlay?.(),V)o.updateActiveFilter?.()}n.addEventListener("mousedown",(p)=>{if(p.button!==0)return;p.preventDefault(),p.stopPropagation(),s=!0,l=o.currentRow,n.style.cursor="grabbing",f(p)});function u(p){if(!s)return;f(p)}function d(){if(!s)return;s=!1,l=null,n.style.cursor=""}window.addEventListener("mousemove",u),window.addEventListener("mouseup",d);function g(){n.remove(),window.removeEventListener("mousemove",u),window.removeEventListener("mouseup",d)}return{navMapImg:r,updateNavMap:a,cleanup:g}}function or(e,t){let o=null;if(e.length>1){o=document.createElement("div"),o.className="_scf_row_nav";for(let i=0;i<e.length;i++){let a=document.createElement("div");a.className="_scf_row_nav_item"+(i===0?" _scf_active":""),a.textContent=String(i+1),a.addEventListener("click",()=>t.setRow(i)),o.appendChild(a)}C().appendChild(o)}function n(i){if(!o)return;let a=o.children;for(let s=0;s<a.length;s++)a[s].classList.toggle("_scf_active",s===i);if(a[i])a[i].scrollIntoView({block:"nearest"})}function r(){if(o)o.remove()}return{rowNavEl:o,updateRowNav:n,cleanup:r}}function nr(e){return Array.from({length:Math.max(0,e)},(t,o)=>o)}function rr(e,t,o,n){if(t<0||t>=n)return e;let r=e.filter((i,a)=>i>=0&&i<n&&e.indexOf(i)===a);if(o)return r.includes(t)?r:[...r,t].sort((i,a)=>i-a);if(!r.includes(t)||r.length<=1)return r;return r.filter((i)=>i!==t)}function ir(e,t,o){if(!o.length)return 0;let n=Math.max(1,t),r=Math.max(0,Math.min(0.9999,e/n));return o[Math.floor(r*o.length)]}function ar(e,t){return e.indexOf(t)}function sr(e,t){return e+" / "+t}function _t(e,t){let o=e.addSlot(()=>l(!1)),n=document.createElement("div");n.className=t.containerClass;let r=document.createElement("button");r.type="button",r.className=t.buttonClass,r.title=t.title,r.setAttribute("aria-label",t.ariaLabel),r.setAttribute("aria-expanded","false");let i=document.createElement("span");i.className=t.iconClass,i.setAttribute("aria-hidden","true"),r.appendChild(i);let a=document.createElement("div");a.className=t.panelClass,a.hidden=!0,n.append(r,a),e.toolbarEl.appendChild(n);let s=!1;function l(d){if(n.classList.toggle("_scf_open",d),a.hidden=!d,r.setAttribute("aria-expanded",String(d)),d)o.notifyOpen()}r.addEventListener("pointerdown",()=>{s=!0}),r.addEventListener("click",()=>{if(l(a.hidden),s)r.blur();s=!1});let f=(d)=>{if(!e.toolbarEl.contains(d.target))l(!1)};document.addEventListener("mousedown",f);function u(){document.removeEventListener("mousedown",f)}return{container:n,button:r,iconEl:i,panel:a,setOpen:l,cleanup:u}}function Xi(e,t){return e.sourceNames?.[t]?.trim()||"Source "+(t+1)}function lr(e,t){let{button:o,panel:n,cleanup:r}=_t(t,{containerClass:"_scf_source_menu",buttonClass:"_scf_source_menu_btn",iconClass:"_scf_source_menu_icon",panelClass:"_scf_source_menu_panel",title:"Sources",ariaLabel:"Choose visible sources"}),i=document.createElement("span");i.className="_scf_source_menu_count",o.append(i);function a(){i.textContent=sr(e.visibleCols.length,e.numCols),n.replaceChildren();for(let s=0;s<e.numCols;s++){let l=document.createElement("label");l.className="_scf_source_option",l.classList.toggle("_scf_active",s===e.currentCol);let f=document.createElement("input");f.type="checkbox",f.checked=e.visibleCols.includes(s),f.disabled=f.checked&&e.visibleCols.length<=1,f.addEventListener("change",()=>{e.setSourceVisible(s,f.checked)});let u=document.createElement("span");u.className="_scf_source_option_idx",u.textContent=String(s+1);let d=document.createElement("span");d.className="_scf_source_option_name",d.textContent=Xi(e,s),l.append(f,u,d),n.appendChild(l)}}return a(),{updateSourceMenu:a,cleanup:r}}function cr(e){let{container:t,button:o,panel:n,setOpen:r,cleanup:i}=_t(e,{containerClass:"_scf_fill_canvas_toggle",buttonClass:"_scf_fill_canvas_btn",iconClass:"_scf_fill_canvas_icon",panelClass:"_scf_fill_canvas_panel",title:"Canvas (C)",ariaLabel:"Choose canvas mode"});function a(l){let f=B!==l;if(f)ft(),Se();if(s(),r(!1),f)E(l?"Canvas: Fill":"Canvas: Fit")}function s(){o.classList.toggle("_scf_active",B),n.replaceChildren();let l=[{label:"Fill",cover:!0},{label:"Fit",cover:!1}];for(let f of l){let u=document.createElement("label");u.className="_scf_fill_canvas_option",u.classList.toggle("_scf_active",B===f.cover);let d=document.createElement("input");d.type="radio",d.name="_scf_fill_canvas_mode",d.checked=B===f.cover,d.addEventListener("change",()=>a(f.cover));let g=document.createElement("span");g.className="_scf_fill_canvas_option_name",g.textContent=f.label,u.append(d,g),n.appendChild(u)}}return s(),{fillCanvasBtnEl:t,updateFillCanvasBtn:s,cleanup:i}}function ur(){let e=document.createElement("div");e.className="_scf_toolbar";let t=[];function o(i){return t.push(i),{notifyOpen(){for(let a of t)if(a!==i)a()}}}let n=(i)=>i.stopPropagation();for(let i of["click","mousedown","mousemove","pointermove","wheel"])e.addEventListener(i,n);C().appendChild(e);function r(){e.remove()}return{toolbarEl:e,addSlot:o,cleanup:r}}var Ji=[],Qi={grid:{collapsed:"▦",expanded:"▦"},triangles:{collapsed:"▶",expanded:"▼"},text:{collapsed:"Show grid",expanded:"Hide grid"}};function ea(e){let t=Ko(),o=t==="custom"?{collapsed:Uo(),expanded:Vo()}:Qi[t];return e?o.expanded:o.collapsed}function $e(){for(let{toggle:e,gridEl:t}of Ji)e.textContent=ea(t.classList.contains("_scf_open"))}var dr=!1;function so(e){dr=e}function lo(){return dr}var ta=[{label:"Viewer Defaults",items:[{type:"radio",key:"defaultZoomMode",label:"Zoom mode",tooltip:"Initial zoom when the viewer opens. 1:1 shows source pixels at native size; Fit scales the row to the viewport.",options:[{label:"Fit",value:"fit"},{label:"1:1",value:"1:1"}]},{type:"radio",key:"zoomPercentBase",label:"Zoom 100%",tooltip:"What the zoom HUD's percentage refers to. Original = source's native pixels; Fit = scaled-to-viewport.",options:[{label:"Original",value:"original"},{label:"Fit",value:"fit"}],onSave:()=>{if(w.length)E(ie())}},{type:"radio",key:"oneToOnePixels",label:"1:1 pixels",tooltip:"What a source pixel maps to at 1:1 on a HiDPI / Retina screen. Device = one physical screen pixel (a 4K shot fills a 1080p@2x panel, pixel-perfect); Logical = one CSS pixel (the browser's 100%, ~2x magnified on Retina). No effect on standard displays.",options:[{label:"Logical",value:"logical"},{label:"Device",value:"device"}],onSave:()=>{if(Ue(),w.length)E(ie())}},{type:"radio",key:"verboseZoom",label:"Zoom info",tooltip:"Brief shows a single-line percentage toast. Verbose adds pixel counts and viewport callouts.",options:[{label:"Brief",value:!1},{label:"Verbose",value:!0}],onSave:()=>{if(w.length)E(ie())}},{type:"radio",key:"fillCanvasDefault",label:"Canvas",tooltip:"Whether each row canvas fills the viewport (cropping) or fits inside it (letterbox) at open. Toggle later with C.",options:[{label:"Fill",value:!0},{label:"Fit",value:!1}]},{type:"toggle",key:"navMapDefault",label:"Minimap",tooltip:"Whether the thumbnail navigation minimap is on at viewer open. Toggle later with M."},{type:"toggle",key:"bgLoadDefault",label:"Background loading",tooltip:"When on, all rows download immediately at open instead of waiting for lazy-load. Toggle later with B."},{type:"toggle",key:"mouseSwitch",label:"Mouse switch",tooltip:"When on, moving the cursor across a row switches the visible source by horizontal position."},{type:"radio",key:"sourceTitleLayout",label:"Title layout",tooltip:"Dense keeps all source titles centered together at the top. Filled gives every visible source an equal-width column aligned with mouse switching; each title block is centered while its text stays left-aligned.",options:[{label:"Dense",value:"dense"},{label:"Filled",value:"filled"}],onSave:()=>{for(let e of w)e.updateTitleLayout?.()}},{type:"radio",key:"closeBtnPosition",label:"Close button",tooltip:"Where the viewer's close button sits. Auto picks left on macOS and right elsewhere. Hide removes the button — close via Esc.",options:[{label:"Auto",value:"auto"},{label:"Left",value:"left"},{label:"Right",value:"right"},{label:"Hide",value:"hide"}],onSave:()=>{for(let e of w)e.updateCloseBtn?.()}},{type:"radio",key:"uiChromeMode",label:"Chrome",tooltip:"Viewer UI visibility. Always = source titles, row nav and buttons stay shown. Default = titles + row nav sit dimmed (full on action), buttons auto-hide. Auto-hide = titles + row nav show only on action, buttons show only when the cursor is near them.",options:[{label:"Always",value:"always"},{label:"Default",value:"default"},{label:"Auto-hide",value:"autohide"}],onSave:()=>{for(let e of w)e.syncAutoHide?.()}},{type:"slider",key:"uiHideDelay",label:"UI hide delay",tooltip:"How long the viewer chrome stays at full before settling back (dimmed or hidden, per the Chrome mode) after the last activity. Ignored in Always mode.",min:200,max:5000,step:100,format:(e)=>(e/1000).toFixed(1)+"s",onSave:()=>{for(let e of w)e.syncAutoHide?.()}},{type:"radio",key:"ptpGridImageSize",label:"PTP image grid",tooltip:`Resolution for the inline image grid toggled beside PTP's "Show comparison" link. Thumbnail loads PTP's /t/ previews (light); Full loads the /i/ originals. Non-PTP-hosted images are shown as-is.`,options:[{label:"Thumbnail",value:"thumbnail"},{label:"Full",value:"full"}]},{type:"radio",key:"ptpGridClick",label:"PTP grid click",tooltip:"What clicking an image in the PTP grid does. Viewer opens the yacomp comparison viewer at that shot; New tab opens the full image in a new browser tab.",options:[{label:"Viewer",value:"viewer"},{label:"New tab",value:"tab"}]},{type:"radio",key:"hdbitsImageClick",label:"HDBits image click",tooltip:"What clicking a comparison image on HDBits does. Viewer opens the yacomp comparison viewer at that shot; Native keeps HDBits' default (open the full image).",options:[{label:"Viewer",value:"viewer"},{label:"Native",value:"native"}]},{type:"toggle",key:"hdbitsManualAllThreads",label:"Custom comparison everywhere",tooltip:"Show the HDBits forum custom-comparison builder in every thread. Off (default): only in Comparisons-forum threads."},{type:"radio",key:"ptpGridToggleStyle",label:"PTP grid button",tooltip:`The fold toggle beside PTP's "Show comparison". ▦ is a single glyph; ▶ ▼ swaps between closed/open arrows; Text reads "Show grid"/"Hide grid"; Custom lets you type your own.`,options:[{label:"▦",value:"grid"},{label:"▶ ▼",value:"triangles"},{label:"Text",value:"text"},{label:"Custom",value:"custom"}],onSave:()=>$e()},{type:"text",key:"ptpGridToggleCollapsed",label:"Custom (closed)",tooltip:"Used with the Custom style: the toggle's label while the grid is folded shut.",placeholder:"▦",visibleWhen:()=>O().ptpGridToggleStyle==="custom",onSave:()=>$e()},{type:"text",key:"ptpGridToggleExpanded",label:"Custom (open)",tooltip:"Used with the Custom style: the toggle's label while the grid is open.",placeholder:"▦",visibleWhen:()=>O().ptpGridToggleStyle==="custom",onSave:()=>$e()}]},{label:"Adjustments",items:[{type:"slider",key:"bcStep",label:"Brightness step",tooltip:"Increment applied per [ ] and { } press. 5% means each step shifts brightness or contrast by 0.05.",min:0.01,max:0.25,step:0.01,format:(e)=>Math.round(e*100)+"%"},{type:"slider",key:"toastDuration",label:"Toast duration",tooltip:"How long a HUD toast stays visible before fading out.",min:500,max:1e4,step:100,format:(e)=>(e/1000).toFixed(1)+"s"},{type:"slider",key:"zoomScaleFactor",label:"Zoom scale factor",tooltip:"Multiplier applied per + / − press. 1.25× means each step grows or shrinks the image by 25%.",min:1.05,max:2,step:0.05,format:(e)=>e.toFixed(2)+"x"},{type:"slider",key:"lazyLoadMargin",label:"Lazy load margin",tooltip:"How far outside the visible area, in CSS pixels, deferred rows start downloading. Not relative to image size — zoom level changes how many rows fit in the margin.",min:0,max:2000,step:50,format:(e)=>e+"px"}]}],oa="Per-site toggle. Disabling stops yacomp from injecting on that site without uninstalling.",na="Visual filters reachable via F / Shift+F. Uncheck to skip; drag enabled rows to reorder.",ra="Export all settings to a JSON file, or import one to restore them. Importing replaces every current setting.",ia="Click a field, then press a key (modifiers included) or pick a mouse button. Every action needs a main shortcut; the extra is optional (× clears it). Esc cancels capture; a duplicate binding is rejected.",aa="Gamma-mismatch presets reachable via G / Shift+G. Uncheck to skip; drag enabled rows to reorder.",X=null,xt=!1,sa=new Set(["ptpGridImageSize","ptpGridClick","hdbitsImageClick","hdbitsManualAllThreads","ptpGridToggleStyle","ptpGridToggleCollapsed","ptpGridToggleExpanded"]);function gr(){xt=!0}var Le=null;function hr(e){let t=document.createElement("button");return t.type="button",t.className="_scf_settings_help",t.textContent="?",t.setAttribute("aria-label","More info"),t.tabIndex=0,t.addEventListener("mouseenter",()=>Le?.show(t,e)),t.addEventListener("mouseleave",()=>Le?.hide()),t.addEventListener("focus",()=>Le?.show(t,e)),t.addEventListener("blur",()=>Le?.hide()),t.addEventListener("click",(o)=>o.preventDefault()),t}function ke(e,t){let o=document.createElement("div");if(o.className="_scf_settings_group_label",o.textContent=e,t)o.appendChild(hr(t));return o}function yt(e,t){let o=document.createElement("span");if(o.className="_scf_settings_label",o.textContent=e,t)o.appendChild(hr(t));return o}function la(e,t){let o=document.createElement("div");o.className="_scf_settings_row";let n=yt(e.label,e.tooltip),r=document.createElement("div");r.className="_scf_settings_radios";let i=[];for(let s of e.options){let l=document.createElement("button");l.type="button",l.className="_scf_settings_radio",l.textContent=s.label,l.addEventListener("click",()=>{q({[e.key]:s.value});for(let f of t)f();e.onSave?.()}),i.push(l),r.appendChild(l)}function a(){let s=O()[e.key];for(let l=0;l<e.options.length;l++)i[l].classList.toggle("_scf_selected",e.options[l].value===s)}return t.push(a),o.append(n,r),o}function ca(e,t){let o=document.createElement("div");o.className="_scf_settings_row";let n=yt(e.label,e.tooltip),r=document.createElement("button");r.type="button",r.className="_scf_settings_toggle",r.addEventListener("click",()=>{q({[e.key]:!O()[e.key]}),i(),e.onSave?.()});function i(){r.classList.toggle("_scf_on",!!O()[e.key])}return t.push(i),o.append(n,r),o}function ua(e,t){let o=document.createElement("div");o.className="_scf_settings_row";let n=yt(e.label,e.tooltip),r=document.createElement("div");r.className="_scf_settings_slider_row";let i=document.createElement("input");i.type="range",i.className="_scf_settings_range",i.min=String(e.min),i.max=String(e.max),i.step=String(e.step);let a=document.createElement("span");a.className="_scf_settings_value",i.addEventListener("input",()=>{let l=parseFloat(i.value);q({[e.key]:l}),a.textContent=e.format(l),e.onSave?.()});function s(){let l=O()[e.key];i.value=String(l),a.textContent=e.format(l)}return t.push(s),r.append(i,a),o.append(n,r),o}function da(e,t){let o=document.createElement("div");o.className="_scf_settings_row";let n=yt(e.label,e.tooltip),r=document.createElement("input");if(r.type="text",r.className="_scf_settings_text",r.maxLength=e.maxLength??32,e.placeholder)r.placeholder=e.placeholder;r.addEventListener("input",()=>{q({[e.key]:r.value}),e.onSave?.()});function i(){if(e.visibleWhen)o.style.display=e.visibleWhen()?"":"none";r.value=String(O()[e.key]??"")}return t.push(i),o.append(n,r),o}var pa={solar1:"Solar x1",solar2:"Solar x2",residual:"Residual",luma:"Luma",chroma:"Chroma"},fa={"srgb-bt1886":"0.92","aeqt-0p88":"0.88","legacy-mac":"0.82"};function ma(e){let t=document.createElement("div");t.className="_scf_settings_chip_grid";let o=[];for(let r of rt){let i=document.createElement("button");i.type="button",i.className="_scf_settings_chip",i.textContent=Mo[r],i.addEventListener("click",()=>{let a=O().enabledSites;q({enabledSites:{...a,[r]:!a[r]}}),n()}),o.push({key:r,btn:i}),t.appendChild(i)}function n(){let r=O().enabledSites;for(let{key:i,btn:a}of o)a.classList.toggle("_scf_on",!!r[i])}return e.push(n),t}function pr(e,t,o,n){let r=document.createElement("div");r.className="_scf_settings_ordered_list";let i=-1;function a(u,d,g){if(u===d)return;let p=[...O()[o]],[v]=p.splice(u,1),h=d>u?d-1:d;if(!g)h++;p.splice(h,0,v),q({[o]:p}),f()}function s(u,d,g){let p=document.createElement("div");p.className="_scf_settings_ordered_item _scf_enabled",p.draggable=!0,p.addEventListener("dragstart",(c)=>{i=g,p.classList.add("_scf_dragging"),c.dataTransfer.effectAllowed="move"}),p.addEventListener("dragover",(c)=>{c.preventDefault(),c.dataTransfer.dropEffect="move";let k=p.getBoundingClientRect(),R=c.clientY<k.top+k.height/2;p.classList.toggle("_scf_drag_above",R),p.classList.toggle("_scf_drag_below",!R)}),p.addEventListener("dragleave",()=>{p.classList.remove("_scf_drag_above","_scf_drag_below")}),p.addEventListener("drop",(c)=>{c.preventDefault(),p.classList.remove("_scf_drag_above","_scf_drag_below");let k=p.getBoundingClientRect();a(i,g,c.clientY<k.top+k.height/2)}),p.addEventListener("dragend",()=>{p.classList.remove("_scf_dragging"),r.querySelectorAll("._scf_drag_above, ._scf_drag_below").forEach((c)=>{c.classList.remove("_scf_drag_above","_scf_drag_below")}),i=-1});let v=document.createElement("input");v.type="checkbox",v.checked=!0,v.className="_scf_settings_ordered_check",v.addEventListener("change",(c)=>{c.stopPropagation();let k=[...O()[o]],R=k.indexOf(u);if(R!==-1)k.splice(R,1);q({[o]:k}),f()});let h=document.createElement("span");h.className="_scf_settings_ordered_handle",h.textContent="⡇";let S=document.createElement("span");return S.className="_scf_settings_ordered_label",S.textContent=d,p.append(v,h,S),p}function l(u,d){let g=document.createElement("div");g.className="_scf_settings_ordered_item";let p=document.createElement("input");p.type="checkbox",p.checked=!1,p.className="_scf_settings_ordered_check",p.addEventListener("change",()=>{let S=[...O()[o]];S.push(u),q({[o]:S}),f()});let v=document.createElement("span");v.className="_scf_settings_ordered_handle";let h=document.createElement("span");return h.className="_scf_settings_ordered_label",h.textContent=d,g.append(p,v,h),g}function f(){r.replaceChildren();let u=O()[o],d=new Set(u),g=e.filter((p)=>!d.has(p));for(let p=0;p<u.length;p++)r.appendChild(s(u[p],t[u[p]],p));if(u.length>0&&g.length>0){let p=document.createElement("div");p.className="_scf_settings_ordered_sep",r.appendChild(p)}for(let p of g)r.appendChild(l(p,t[p]))}return n.push(f),r}var wt=null;function ga(e,t,o,n,r){wt?.(),so(!0),t.classList.add("_scf_capturing"),t.textContent="Press a key…";let i=document.createElement("div");i.className="_scf_shortcut_chips";let a=[{g:"click",label:"Click"},{g:"dblclick",label:"2×"},{g:"middle",label:"Mid"},{g:"back",label:"Back"},{g:"forward",label:"Fwd"}];for(let{g:d,label:g}of a){let p=document.createElement("button");p.type="button",p.className="_scf_shortcut_chip",p.textContent=g,p.addEventListener("click",(v)=>{v.preventDefault(),v.stopPropagation(),s({t:"mouse",g:d})}),i.appendChild(p)}e.appendChild(i);function s(d){if(He(d)){u(),E("Reserved for viewer open / source number jump"),r();return}let g=Xo(d,o,n);if(u(),g){E("Already bound to "+yo(g).label),r();return}let p=W(o);if(Ht(o,n==="main"?{main:d,extra:p.extra}:{main:p.main,extra:d}),r(),o==="viewer.close")for(let v of w)v.updateCloseBtn?.()}function l(d){if(d.preventDefault(),d.stopImmediatePropagation(),d.key==="Escape"){u(),r();return}if(/^(?:Shift|Control|Alt|Meta)(?:Left|Right)$/.test(d.code))return;s(wo(d))}function f(d){if(!e.contains(d.target))u(),r()}function u(){wt=null,so(!1),t.classList.remove("_scf_capturing"),i.remove(),window.removeEventListener("keydown",l,!0),C().removeEventListener("mousedown",f,!0)}wt=()=>{u(),r()},window.addEventListener("keydown",l,!0),setTimeout(()=>C().addEventListener("mousedown",f,!0),0)}function fr(e,t,o,n){let r=document.createElement("div");r.className="_scf_shortcut_field";let i=document.createElement("button");i.type="button",i.className="_scf_shortcut_btn";let a=t==="extra",s=document.createElement("button");s.type="button",s.className="_scf_shortcut_clear",s.textContent="×",s.title="Clear",s.addEventListener("click",(f)=>{f.stopPropagation();let u=W(e);Ht(e,{main:u.main,extra:null}),o()});function l(){let f=W(e),u=t==="main"?f.main:f.extra;if(i.textContent=ot(u),i.classList.toggle("_scf_shortcut_empty",u==null),a)s.style.display=u?"":"none"}if(n.push(l),l(),i.addEventListener("click",()=>ga(r,i,e,t,o)),r.appendChild(i),a)r.appendChild(s);return r}var ha=["Zoom","Navigate","Display","Adjust","Viewer"];function ba(e){let t=document.createElement("div");t.className="_scf_shortcuts";let o=[],n=()=>{for(let a of o)a()};for(let a of ha){let s=document.createElement("div");s.className="_scf_shortcuts_subhead",s.textContent=a,t.appendChild(s);for(let l of ne.filter((f)=>f.group===a)){let f=document.createElement("div");f.className="_scf_shortcut_row";let u=document.createElement("span");u.className="_scf_settings_label",u.textContent=l.label;let d=document.createElement("div");d.className="_scf_shortcut_fields",d.append(fr(l.id,"main",n,o),fr(l.id,"extra",n,o)),f.append(u,d),t.appendChild(f)}}let r=document.createElement("div");r.className="_scf_shortcut_reset_row";let i=document.createElement("button");return i.type="button",i.className="_scf_settings_reset",i.textContent="Reset shortcuts",i.addEventListener("click",()=>{qo(),n();for(let a of w)a.updateCloseBtn?.()}),r.appendChild(i),t.appendChild(r),e.push(n),t}function _a(e,t){let o=new Blob([t],{type:"application/json"}),n=URL.createObjectURL(o),r=document.createElement("a");r.href=n,r.download=e,r.style.display="none",document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(n),1000)}function va(e){for(let t of e)t();for(let t of w)t.updateCloseBtn?.(),t.syncAutoHide?.(),t.updateFillCanvasBtn?.(),t.updateSourceMenu?.(),t.updateTitleLayout?.();$e()}function xa(e){let t=document.createElement("div");t.className="_scf_settings_backup";let o=document.createElement("button");o.type="button",o.className="_scf_settings_reset",o.textContent="Export",o.addEventListener("click",()=>_a("yacomp-config.json",tn()));let n=document.createElement("button");n.type="button",n.className="_scf_settings_reset",n.textContent="Import";let r=document.createElement("input");return r.type="file",r.accept="application/json,.json",r.style.display="none",r.addEventListener("change",()=>{let i=r.files?.[0];if(r.value="",!i)return;i.text().then((a)=>{if(on(a))va(e),E("Settings imported");else E("Couldn't import — not a valid config file")})}),n.addEventListener("click",()=>r.click()),t.append(o,n,r),t}function Re(){if(!X)return!1;return X.remove(),X=null,Le=null,wt?.(),!0}var mr=6,vt=8;function wa(e,t){let o=t.getBoundingClientRect(),n=e.getBoundingClientRect(),r=o.left+o.width/2-n.width/2,i=o.bottom+mr;if(i+n.height>window.innerHeight-vt)i=o.top-n.height-mr;r=Math.max(vt,Math.min(window.innerWidth-n.width-vt,r)),e.style.left=r+"px",e.style.top=Math.max(vt,i)+"px"}function Ct(){if(X){Re();return}ve(),X=document.createElement("div"),X.className="_scf_settings_overlay",X.addEventListener("mousedown",(u)=>{if(u.target===X)Re()});let e=document.createElement("div");e.className="_scf_settings_panel";let t=document.createElement("div");t.className="_scf_settings_tooltip",t.style.display="none",Le={show:(u,d)=>{t.textContent=d,t.style.display="block",t.style.left="0",t.style.top="0",wa(t,u)},hide:()=>{t.style.display="none"}};let o=document.createElement("div");o.className="_scf_settings_header";let n=document.createElement("span");n.className="_scf_settings_title",n.textContent=xt?"yacomp-web Settings":"yacomp Settings";let r=document.createElement("button");r.type="button",r.className="_scf_settings_close",r.textContent="×",r.addEventListener("click",Re),o.append(n,r);let i=document.createElement("div");i.className="_scf_settings_body";let a=[];for(let u of ta){i.appendChild(ke(u.label,u.tooltip));for(let d of u.items){if(xt&&sa.has(d.key))continue;let g;switch(d.type){case"radio":g=la(d,a);break;case"toggle":g=ca(d,a);break;case"slider":g=ua(d,a);break;case"text":g=da(d,a);break}i.appendChild(g)}}if(!xt)i.appendChild(ke("Sites",oa)),i.appendChild(ma(a));i.appendChild(ke("Filter Cycle",na)),i.appendChild(pr(it,pa,"filterCycle",a)),i.appendChild(ke("Gamma Check Cycle",aa)),i.appendChild(pr(at,fa,"gammaCycle",a)),i.appendChild(ke("Shortcuts",ia)),i.appendChild(ba(a)),i.appendChild(ke("Backup",ra)),i.appendChild(xa(a));let s=document.createElement("div");s.className="_scf_settings_footer";let l=document.createElement("button");l.type="button",l.className="_scf_settings_reset",l.textContent="Reset Defaults",l.addEventListener("click",()=>{en();for(let u of w)u.updateCloseBtn?.(),u.updateTitleLayout?.();for(let u of a)u()});let f=document.createElement("button");f.type="button",f.className="_scf_settings_done",f.textContent="Done",f.addEventListener("click",Re),s.append(l,f),e.append(o,i,s),X.appendChild(e),X.appendChild(t),C().appendChild(X);for(let u of a)u()}function br(e){let t=document.createElement("button");t.type="button",t.className="_scf_settings_btn",t.title="Settings",t.setAttribute("aria-label","Open yacomp settings");let o=document.createElement("span");o.className="_scf_settings_btn_icon",o.setAttribute("aria-hidden","true");let n=document.createElementNS("http://www.w3.org/2000/svg","svg");n.setAttribute("viewBox","0 0 24 24"),n.setAttribute("fill","none"),n.setAttribute("stroke","currentColor"),n.setAttribute("stroke-width","2"),n.setAttribute("stroke-linecap","round"),n.setAttribute("stroke-linejoin","round");let r=document.createElementNS("http://www.w3.org/2000/svg","circle");r.setAttribute("cx","12"),r.setAttribute("cy","12"),r.setAttribute("r","3"),n.appendChild(r);let i=document.createElementNS("http://www.w3.org/2000/svg","path");return i.setAttribute("d","M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.321-1.915"),n.appendChild(i),o.appendChild(n),t.appendChild(o),t.addEventListener("click",Ct),e.toolbarEl.appendChild(t),{cleanup:()=>t.remove()}}var ya=[{title:"Navigation",rows:[{actions:["nav.colPrev"],desc:"Previous column"},{actions:["nav.colNext"],desc:"Next column"},{actions:["nav.rowPrev"],desc:"Previous row"},{actions:["nav.rowNext"],desc:"Next row"},{keys:["1 – 9"],desc:"Jump to Nth column"}]},{title:"Zoom",rows:[{actions:["zoom.out"],desc:"Zoom out"},{actions:["zoom.in"],desc:"Zoom in"},{actions:["zoom.fit"],desc:"Fit to width"},{actions:["zoom.oneToOne"],desc:"Actual size (1:1)"}]},{title:"Mouse",rows:[{keys:["Click image"],desc:"Open viewer from page image grid"},{keys:["Ctrl + Wheel"],desc:"Zoom at cursor on viewer image grid"},{actions:["viewer.close"],binding:"mouse",desc:"Close viewer from viewer image grid",note:"Only when assigned in Settings",hideIfEmpty:!0}]},{title:"Adjustments",rows:[{actions:["bright.down","bright.up"],desc:"Brightness",note:"Shift = contrast"},{actions:["adjust.resetSource"],desc:"Reset current source",note:"Shift = all"},{actions:["gamma.next"],desc:"Gamma mismatch check",note:"Shift = previous"}]},{title:"Toggles",rows:[{actions:["filter.next"],desc:"Cycle filter modes",note:"Shift = previous"},{actions:["display.canvas"],desc:"Canvas fill / fit"},{actions:["display.rowNav"],desc:"Row nav sidebar"},{actions:["display.minimap"],desc:"Minimap"},{actions:["display.bgLoad"],desc:"Background loading"}]},{title:"Other",rows:[{actions:["viewer.help"],desc:"Toggle this help"},{actions:["viewer.close"],binding:"key",desc:"Reset filters, then close viewer",hideIfEmpty:!0}]}],Ca={"Shift + /":"?"};function _r(e,t){return e==="all"||t.t===e}function vr(e){let t=ot(e);return Ca[t]??t}function Ea(e){if(e.keys)return e.keys;let t=[],o=e.binding??"all";for(let n of e.actions??[]){let r=W(n);if(_r(o,r.main))t.push(vr(r.main));if(r.extra&&_r(o,r.extra))t.push(vr(r.extra))}return t}var qe=null;function Xe(){return qe!==null&&qe.isConnected}function Ie(){qe?.remove(),qe=null}function Sa(){if(Xe())return;let e=document.createElement("div");e.className="_scf_help_overlay",e.addEventListener("mousedown",(o)=>{if(o.target===e)o.stopPropagation(),Ie()});let t=document.createElement("div");t.className="_scf_help_panel",t.setAttribute("role","dialog"),t.setAttribute("aria-label","Keyboard shortcuts");for(let o of ya){let n=document.createElement("div");n.className="_scf_help_section",n.textContent=o.title,t.appendChild(n);for(let r of o.rows){let i=Ea(r);if(r.hideIfEmpty&&i.length===0)continue;let a=document.createElement("div");a.className="_scf_help_row";let s=document.createElement("span");s.className="_scf_help_keys";for(let f of i){let u=document.createElement("kbd");u.className="_scf_help_chip",u.textContent=f,s.appendChild(u)}let l=document.createElement("span");if(l.className="_scf_help_desc",l.textContent=r.desc,r.note){let f=document.createElement("span");f.className="_scf_help_note",f.textContent=" · "+r.note,l.appendChild(f)}a.append(s,l),t.appendChild(a)}}e.appendChild(t),C().appendChild(e),qe=e}function Et(){if(Xe())Ie();else Sa()}function xr(e,t){if(!Number.isFinite(e)||t<=0)return 0;return Math.max(0,Math.min(t-1,Math.trunc(e)))}function wr(e){return{row:xr(e.initialRow,e.rows.length),col:xr(e.initialCol,e.numCols)}}function yr(e){if(e?.mode==="custom"&&Number.isFinite(e.width)&&e.width>0)return{mode:"custom",width:Math.round(e.width)};return{mode:"fit"}}function Ta(e,t){if(e==="left"||e==="right"||e==="hide")return e;return t?"left":"right"}var Ma=typeof navigator<"u"&&/Mac|iPhone|iPad/.test(navigator.userAgent);function ka(){if($o())return"hide";return Ta(jo(),Ma)}function Cr(e){let t=document.createElement("button");t.type="button",t.title="Close (Esc)",t.setAttribute("aria-label","Close viewer");let o=document.createElement("span");o.className="_scf_close_icon",o.setAttribute("aria-hidden","true"),t.appendChild(o),t.addEventListener("click",(i)=>{i.stopPropagation(),e()}),t.addEventListener("mousedown",(i)=>i.stopPropagation());function n(){let i=ka();t.classList.add("_scf_close_btn"),t.classList.toggle("_scf_left",i==="left"),t.classList.toggle("_scf_right",i!=="left"),t.classList.toggle("_scf_hidden",i==="hide")}n(),C().appendChild(t);function r(){t.remove()}return{closeBtnEl:t,updatePosition:n,cleanup:r}}var Ae="_scf_ui_autohidden",Er="_scf_ui_dimmed",La="_scf_ui_force_hidden",St=100,Ra=350;function Sr(e){let t=null,o=null,n=null,r=new Map,i=[e.closeBtnEl,e.toolbarEl],a=()=>Zo();function s(_,A){if(!_)return;if(_.classList.remove(Ae,Er),A)_.classList.add(A)}function l(){let _=a();return _==="always"?null:_==="default"?Er:Ae}function f(){return a()==="always"?null:Ae}function u(){if(a()==="always")return;if(s(e.labelEl,null),t)clearTimeout(t);if(t=setTimeout(()=>s(e.labelEl,l()),ct()),a()==="default")g()}function d(){if(!e.rowNavEl||a()==="always")return;if(s(e.rowNavEl,null),o)clearTimeout(o);if(o=setTimeout(()=>s(e.rowNavEl,l()),ct()),a()==="default")g()}function g(){for(let _ of i)s(_,null);if(n)clearTimeout(n);n=setTimeout(()=>{for(let _ of i)s(_,Ae)},ct())}function p(_){let A=r.get(_);if(A)clearTimeout(A),r.delete(_)}function v(_){p(_),s(_,null)}function h(_){if(_.classList.contains(Ae)||r.has(_))return;r.set(_,setTimeout(()=>{r.delete(_),s(_,Ae)},Ra))}function S(_,A,Y){let G=_.getBoundingClientRect();if(G.width===0&&G.height===0)return!1;return A>=G.left-St&&A<=G.right+St&&Y>=G.top-St&&Y<=G.bottom+St}function c(_,A){for(let Y of i)if(S(Y,_,A))v(Y);else h(Y)}function k(){e.fillCanvasBtnEl.classList.toggle(La,N==="1:1")}let R=(_)=>{let A=a();if(A==="always")return;if(u(),d(),A==="autohide")c(_.clientX,_.clientY)},P=()=>d();e.compDiv.addEventListener("mousemove",R),e.compDiv.addEventListener("scroll",P,{passive:!0});let V=[];for(let _ of i){let A=()=>{let G=a();if(G==="always")return;if(G==="default"){for(let ae of i)s(ae,null);if(n)clearTimeout(n)}else v(_)},Y=()=>{let G=a();if(G==="always")return;if(G==="default")g();else h(_)};_.addEventListener("mouseenter",A),_.addEventListener("mouseleave",Y),V.push(()=>{_.removeEventListener("mouseenter",A),_.removeEventListener("mouseleave",Y)})}function te(){if(t)clearTimeout(t),t=null;if(o)clearTimeout(o),o=null;if(n)clearTimeout(n),n=null;for(let _ of i)p(_)}function K(){if(te(),k(),s(e.labelEl,l()),s(e.rowNavEl,l()),a()==="default")g();else for(let _ of i)s(_,f())}K();function oe(){te(),e.compDiv.removeEventListener("mousemove",R),e.compDiv.removeEventListener("scroll",P);for(let _ of V)_()}return{revealColumnNav:u,revealRowNav:d,syncFillCanvasVisibility:k,resync:K,cleanup:oe}}var Ia=200;function Aa(e){if(e.resetTimer)clearTimeout(e.resetTimer);e.anchor=null,e.resetTimer=null}function Da(e,t,o){if(!e.anchor)e.anchor=$t(t,o);if(e.resetTimer)clearTimeout(e.resetTimer);return e.resetTimer=setTimeout(()=>{e.anchor=null,e.resetTimer=null},Ia),e.anchor}function Na(e,t){if(e.suppressRowSync)return;let o=e.compDiv.scrollTop+e.compDiv.clientHeight/2,n=0,r=1/0;for(let i=0;i<e.allRowData.length;i++){let a=e.allRowData[i].rowDiv,s=a.offsetTop+a.offsetHeight/2,l=Math.abs(s-o);if(l<r)r=l,n=i}if(e.navTargetRow!=null){if(n!==e.navTargetRow)return;e.navTargetRow=null}if(n!==e.currentRow)e.currentRow=n,t(n),e.updateLabel?.(),e.updateLoadingOverlay?.(),e.updateActiveFilter?.()}function Pa(e,t,o){let n=e/2;return{top:Math.max(0,n-t/2),bottom:Math.max(0,n-o/2)}}function Ha(e,t,o){return`${e?.replace(/\s+/g," ").trim()||`Source ${t+1}`} (C${t+1}, R${o+1})`}function co(e,t,o){if(ve(),We(),!w.length)Rn(No()),In(Po());je("fit"),Ze(0);let n=wr(e),r=yr(e.initialZoom);if(r.mode==="custom")je("custom"),Ze(r.width);let i=C(),a=i.getElementById("_scf_comp_label_");if(!a)a=document.createElement("div"),a.id="_scf_comp_label_",a.className="_scf_comp_label",i.appendChild(a);a.innerHTML="",a.classList.add("_scf_ui_autohidden");let s=document.createElement("div");s.className="_scf_comp";let l=document.createElement("div");l.className="_scf_loading_overlay",l.hidden=!0;let f=document.createElement("div");f.className="_scf_loading_spinner";let u=document.createElement("div");u.className="_scf_loading_caption",l.append(f,u);let d={anchor:null,resetTimer:null},{drag:g,onDragMove:p,onDragEnd:v}=Un(s);s.addEventListener("mousedown",()=>{c.navTargetRow=null}),Tr(s,g),s.addEventListener("wheel",(m)=>{if(!m.ctrlKey){c.navTargetRow=null;return}m.preventDefault();let b=Qt(),x=Da(d,c,m);Ze(Jt(b,Xt(b,m.deltaY<0?1:-1))),je("custom"),_e(x?[x]:[]),E(ie())},{passive:!1});let h=[],S=Ho(),c={};c.visibleCols=nr(e.numCols);let k=document.createElement("div");k.className="_scf_scroll_spacer";let R=document.createElement("div");R.className="_scf_scroll_spacer",s.appendChild(k);function P(){return Math.max(1,s.clientWidth||document.documentElement.clientWidth||window.innerWidth)}function V(m){return ir(m.clientX-s.getBoundingClientRect().left,P(),c.visibleCols)}function te(m,b){let x=e.rowNames?.[m]??e.names;return Ha(x?.[b],b,m)}function K(){let m=Number.isInteger(c.currentRow)?c.currentRow:n.row,b=Number.isInteger(c.currentCol)?c.currentCol:n.col,T=h[m]?.rowDiv.classList.contains("_scf_loading")??!1;if(l.hidden=!T,T)u.textContent=te(m,b)}let oe=null,_=0;function A(m){let b=m.firstChild,x=b?.textContent||"";if(!b||b.nodeType!==Node.TEXT_NODE||!x)return{lines:0,charsInLastLine:0};let T=document.createRange(),D=0,H=null,F=0;for(let I=0;I<x.length;){let J=x.codePointAt(I),se=String.fromCodePoint(J),xo=I+se.length;T.setStart(b,I),T.setEnd(b,xo);let tt=T.getClientRects()[0];if(tt&&tt.width){if(H===null||Math.abs(tt.top-H)>0.5)D++,H=tt.top,F=0;if(!/\s/u.test(se))F++}I=xo}return{lines:D,charsInLastLine:F}}function Y(m){let b=document.createElement("span");b.textContent=m,b.style.cssText="position:fixed;visibility:hidden;white-space:nowrap;width:max-content;max-width:none",a.appendChild(b);let x=b.getBoundingClientRect().width;return b.remove(),x}function G(){let m=[...a.querySelectorAll("._scf_comp_label_item")];for(let b of m)b.style.fontSize="";for(let b of m){let x=b.querySelector("._scf_comp_label_index"),T=b.querySelector("._scf_comp_label_name");if(!x||!T)continue;let{lines:D,charsInLastLine:H}=A(T);if(D!==2||H>2)continue;let F=getComputedStyle(b),I=b.clientWidth-parseFloat(F.paddingLeft)-parseFloat(F.paddingRight),J=x.getBoundingClientRect().width+Y(T.textContent||"");if(I<=0||J<=I)continue;let se=parseFloat(F.fontSize);b.style.fontSize=`${se*Math.max(0,I-0.5)/J}px`}}function ae(m){let b=e.rowNames?.[c.currentRow]??e.names??[];a.replaceChildren(),a.classList.remove("_scf_comp_label_columns"),a.style.gridTemplateColumns="";let x=P();if(_=x,a.style.setProperty("--_scf_comp_viewport_width",`${x}px`),e.numCols>1)for(let D=0;D<c.visibleCols.length;D++){let H=c.visibleCols[D],F=b[H]??"Source "+(H+1),I=document.createElement("span");I.className="_scf_comp_label_item";let J=document.createElement("span");J.className="_scf_comp_label_index",J.textContent=D+1+". ";let se=document.createElement("span");if(se.className="_scf_comp_label_name",se.textContent=F,I.append(J,se),H!==m)I.style.opacity=".4";a.appendChild(I)}if(zo()==="filled")a.classList.add("_scf_comp_label_columns"),a.style.gridTemplateColumns=`repeat(${c.visibleCols.length}, minmax(0, 1fr))`,G();let T=a.textContent||"";if(oe!==null&&T!==oe)c.revealColumnNav?.();oe=T}function De(m){if(!c.visibleCols.includes(m))return;let b=c.currentCol!==m;c.currentCol=m;for(let x=0;x<h.length;x++){let T=h[x],{rowDiv:D,imgs:H,loaded:F}=T;if(F){let I=H[m];if(I&&!I.src&&I.dataset.src)Xn(T,c,m)}if(H.forEach((I,J)=>{I.style.visibility=J===m?"visible":"hidden"}),F){let I=H[m];bt(D,I??null)}D.dataset.col=String(m)}if(K(),ae(m),c.revealColumnNav?.(),s.classList.contains("_scf_zoomed")){let x=h[c.currentRow||0];if(x){let T=x.imgs[m],D=T&&(T.src||T.dataset.src);if(D&&xe.navMapImg&&xe.navMapImg.src!==D)xe.navMapImg.src=D}}if(c.updateSourceMenu?.(),Ve(),b)c.updateActiveFilter?.()}for(let m=0;m<e.rows.length;m++){for(let x of e.rows[m])if((x.width==null||x.height==null)&&x.img?.naturalWidth&&x.img.naturalHeight)x.width=x.img.naturalWidth,x.height=x.img.naturalHeight;let b=qn(e.rows[m],e.numCols,n.col,m>0&&m!==n.row);if(m===0||m===n.row)b.loaded=!0;s.appendChild(b.rowDiv),h.push(b)}s.appendChild(R),s.appendChild(l);let Je=new IntersectionObserver((m)=>{for(let b of m)if(b.isIntersecting){let x=h.find((T)=>T.rowDiv===b.target);if(x)ao(x,c),Je.unobserve(b.target)}},{root:s,rootMargin:Fo()+"px",threshold:0});for(let m=1;m<h.length;m++)Je.observe(h[m].rowDiv);let fo=!1;function Qe(){if(fo||!S)return;for(let m=0;m<h.length;m++){let b=h[m];if(!b.loaded)Je.unobserve(b.rowDiv);Jn(b,c)}}let et=[],mo=h[0].sizer;if(mo.complete)et.push(setTimeout(Qe,200));else mo.addEventListener("load",()=>et.push(setTimeout(Qe,200)),{once:!0}),et.push(setTimeout(Qe,3000));let zr=t.style.display,Wr=o.style.display;c.compDiv=s,c.container=t,c.numCols=e.numCols,c.numRows=h.length,c.sourceNames=e.names,c.currentRow=n.row,c.currentCol=n.col,c.colBrightness=Array(e.numCols).fill(1),c.colGammaCheck=Array(e.numCols).fill(null),c.colContrast=Array(e.numCols).fill(1),c.allRowData=h,c.bgLoadAll=()=>S,c.setBgLoadAll=(m)=>{S=m},c.triggerBgLoad=Qe,c.updateScrollSpacers=()=>{let m=h[0]?.rowDiv,b=h[h.length-1]?.rowDiv;if(!m||!b)return;let x=Pa(s.clientHeight,m.offsetHeight,b.offsetHeight);k.style.height=x.top+"px",R.style.height=x.bottom+"px"},c.updateTitleLayout=()=>ae(c.currentCol),c.updateLoadingOverlay=K,c.updateActiveFilter=()=>Kn(c);let go=new MutationObserver((m)=>{let b=h[c.currentRow]?.rowDiv;if(m.some((x)=>x.target===b))K()});for(let m of h)go.observe(m.rowDiv,{attributes:!0,attributeFilter:["class"]});s.addEventListener("mousemove",(m)=>{if(g.active||!Oo())return;let b=V(m);if(b!==c.currentCol)De(b)}),c.setColumn=(m)=>{if(m<0||m>=e.numCols)return;if(!c.visibleCols.includes(m))return;De(m),Ue()},c.setSourceVisible=(m,b)=>{let x=c.visibleCols,T=rr(x,m,b,e.numCols);if(!(T.length!==x.length||T.some((F,I)=>F!==x[I]))){if(!b&&x.length<=1&&x.includes(m))E("At least one source must stay visible");c.updateSourceMenu?.();return}let H=Math.max(0,x.indexOf(m));if(c.visibleCols=T,!T.includes(c.currentCol))De(T[Math.min(H,T.length-1)]);else De(c.currentCol);E("Sources: "+T.length+" / "+e.numCols)};let fe=or(h,c);if(c.updateRowNav=fe.updateRowNav,e.rowNames)c.updateLabel=()=>ae(c.currentCol);let xe=tr(s,h,c);c.updateNavMap=xe.updateNavMap;let we=ur(),jr=br(we),Mt=document.createElement("div");Mt.className="_scf_help_btn";let me=document.createElement("button");me.type="button",me.className="_scf_help_button",me.title="Keyboard shortcuts (?)",me.setAttribute("aria-label","Keyboard shortcuts"),me.textContent="?",me.addEventListener("click",(m)=>{m.stopPropagation(),Et()}),Mt.appendChild(me),we.toolbarEl.appendChild(Mt);let kt=cr(we);c.updateFillCanvasBtn=kt.updateFillCanvasBtn;let ho=lr(c,we);c.updateSourceMenu=ho.updateSourceMenu;let Lt=Cr(()=>c.close());c.updateCloseBtn=Lt.updatePosition;let Ne=Sr({compDiv:s,labelEl:a,rowNavEl:fe.rowNavEl,closeBtnEl:Lt.closeBtnEl,toolbarEl:we.toolbarEl,fillCanvasBtnEl:kt.fillCanvasBtnEl});c.revealColumnNav=Ne.revealColumnNav,c.revealRowNav=Ne.revealRowNav,c.syncFillCanvasVisibility=Ne.syncFillCanvasVisibility,c.syncAutoHide=Ne.resync,De(n.col),c.setRow=(m)=>{if(m<0||m>=c.numRows)return;let b=c.currentRow!==m;if(c.currentRow=m,c.navTargetRow=m,c.updateLabel?.(),c.updateLoadingOverlay?.(),b)c.updateActiveFilter?.();h[m].rowDiv.scrollIntoView({behavior:"smooth",block:"center"}),fe.updateRowNav(m),c.revealRowNav?.(),E("Row "+(m+1)+" / "+c.numRows)},s.addEventListener("scroll",()=>{if(fe.rowNavEl)Na(c,fe.updateRowNav);xe.updateNavMap()});let Zr=()=>{if(c.updateScrollSpacers?.(),P()!==_)ae(c.currentCol)},ye=null;if(typeof ResizeObserver<"u"){if(ye=new ResizeObserver(Zr),ye.observe(s),h[0])ye.observe(h[0].rowDiv);if(h[h.length-1])ye.observe(h[h.length-1].rowDiv)}let bo=()=>{c.updateScrollSpacers?.(),ae(c.currentCol),Ue()};window.addEventListener("resize",bo);let{scrollX:Kr,scrollY:Ur}=window,Pe=null;function Vr(){fo=!0,no();for(let m of et)clearTimeout(m);if(window.removeEventListener("mousemove",p),window.removeEventListener("mouseup",v),window.removeEventListener("resize",bo),ye)ye.disconnect();Pe?.disconnect(),go.disconnect(),Je.disconnect(),Aa(d),s.remove(),fe.cleanup(),xe.cleanup(),ho.cleanup(),kt.cleanup(),Lt.cleanup(),we.cleanup(),jr.cleanup(),Ne.cleanup(),Ie(),document.body.style.overflow="",t.style.display=zr,o.style.display=Wr,window.scrollTo(Kr,Ur),a.classList.add("_scf_ui_autohidden"),a.innerHTML="",je("fit"),Ze(0),Dn(c),kn(),z()}if(c.close=Vr,t.style.display="none",o.style.display="none",document.body.style.overflow="hidden",i.appendChild(s),c.updateScrollSpacers(),ae(c.currentCol),An(c),B)Se();if(r.mode==="custom")_e();else if(Do()==="1:1")gt({silent:!0});fe.updateRowNav(n.row);let _o=()=>{c.updateScrollSpacers?.(),Pn(c),c.updateNavMap()};requestAnimationFrame(_o);let vo=h[n.row]?.rowDiv;if(vo&&typeof ResizeObserver<"u"){Pe=new ResizeObserver(()=>{requestAnimationFrame(_o);let b=h[n.row]?.imgs[n.col];if(b?.complete&&b.naturalWidth)Pe?.disconnect()}),Pe.observe(vo);let m=()=>Pe?.disconnect();s.addEventListener("wheel",m,{once:!0,passive:!0}),s.addEventListener("mousedown",m,{once:!0})}}function Me(e,t){ve(),We();let o=C(),n=document.createElement("div");n.style.display="none",o.appendChild(n);let r=document.createElement("span");r.style.display="none",o.appendChild(r),co(e,n,r);let i=w[w.length-1],a=i.close;return i.close=function(){if(a(),n.remove(),r.remove(),t)t()},{close:()=>i.close()}}function uo(e){if(!e)return null;return e.split("#",1)[0].split("?",1)[0].split("/").filter(Boolean).pop()||null}function Mr(e){let t=e.split("/").filter(Boolean);if(t[0]!=="c"||!t[1])return null;return decodeURIComponent(t[1])}function Ba(e){let t=/^dropdown-image-(\d+)$/.exec(e||"");if(!t)return null;return Number.parseInt(t[1],10)}function Ga(e,t){if(!t)return null;let o=e.comparisons.findIndex((n)=>n.key===t);return o>=0?o:null}function Fa(e,t){let o=uo(t.publicFileName);if(o)for(let r=0;r<e.comparisons.length;r++){let i=e.comparisons[r].images.findIndex((a)=>uo(a.publicFileName)===o);if(i>=0)return{row:r,col:i}}let n=Ga(e,t.comparisonKey);if(n!==null){let r=e.comparisons[n].images;if(t.imageName){let i=r.findIndex((a)=>a.name===t.imageName);if(i>=0)return{row:n,col:i}}if(t.activeImageIndex!==null&&t.activeImageIndex!==void 0&&t.activeImageIndex>=0&&t.activeImageIndex<r.length)return{row:n,col:t.activeImageIndex};return{row:n,col:0}}return null}function Oa(e,t=document,o=location){let n=t.getElementById("image"),r=t.querySelector("#images-dropdown .dropdown-item.active"),i=t.querySelector("#comparisons-dropdown .dropdown-item.active, #preview a.preview-active"),a=i?.href?new URL(i.href,"https://slow.pics"+o.pathname).pathname:"",s=Mr(o.pathname)||Mr(a);return Fa(e,{comparisonKey:s,publicFileName:uo(n?.currentSrc||n?.src),imageName:n?.alt||null,activeImageIndex:Ba(r?.id)})}function kr(e){return e.replaceAll("."," ")}function za(e){return e.map((t)=>t.images.map((o)=>kr(o.name)))}function Lr(){let e=(window.unsafeWindow||window).collection;if(!e||!e.comparisons||!e.comparisons.length)return!1;let t=e.comparisons,o=t[0].images.map((a)=>kr(a.name.replace(/^\([BIP]\) /,""))),n=o.length,r=t.map((a)=>a.images.map((s)=>({full:"https://i.slow.pics/"+s.publicFileName,width:s.width,height:s.height}))),i=Oa(e);return Me({rows:r,numCols:n,names:o,rowNames:za(t),initialRow:i?.row,initialCol:i?.col,initialZoom:{mode:"fit"}}),!0}function Pr(e,t){return e.sourceNames?.[t]?.trim()||"Source "+(t+1)}function Wa(e,t){if(t.code!=="BracketLeft"&&t.code!=="BracketRight")return null;let o=e.currentCol,n=t.code==="BracketRight"?1:-1,r=lt(),i=n>0?r:-r,a=Pr(e,o);if(t.shiftKey)return e.colContrast[o]=Math.max(Ft,Math.min(Ot,+(e.colContrast[o]+i).toFixed(2))),"◐ "+a+" Contrast "+Math.round(e.colContrast[o]*100)+"%";let s=an(e.colBrightness[o],n);return e.colBrightness[o]=s,"☀ "+a+" "+sn(s)}function ja(){if(Oe())return!0;for(let e of w){if(e.colBrightness.some((t)=>!ue(t)))return!0;if(e.colGammaCheck.some(Boolean))return!0;if(e.colContrast.some((t)=>!ue(t)))return!0}return!1}function ee(){return w[w.length-1]}function Rr(e){let t=ee();if(!t)return;let n=(ar(t.visibleCols,t.currentCol)+e+t.visibleCols.length)%t.visibleCols.length;t.setColumn(t.visibleCols[n])}function Ir(e){let t=ee();if(t)t.setRow((t.navTargetRow??t.currentRow)+e)}function Tt(e,t){let o=ee();if(!o)return;let n=Wa(o,{code:e,shiftKey:t});if(!n)return;z(),E(n)}function Ar(e){let t=ee();if(!t)return;let o=t.currentCol,n=cn(t.colGammaCheck[o],e);if(t.colGammaCheck[o]=n,z(),n)E([{text:Pr(t,o),size:"small",muted:!0},{text:"Gamma mismatch check",size:"normal"},{text:pn(n),size:"large"},{text:mn(n),size:"small"},{text:fn(n),size:"tiny",muted:!0}]);else E("Gamma mismatch check OFF")}function Dr(e){let t=ee();if(!t)return;if(e)t.colBrightness.fill(1),t.colGammaCheck.fill(null),t.colContrast.fill(1),z(),E("↺ Reset all adjustments");else{let o=t.currentCol;t.colBrightness[o]=1,t.colGammaCheck[o]=null,t.colContrast[o]=1,z(),E("↺ Reset Source "+(o+1)+" adjustments")}}function Za(e){if(e==="key"&&ja()){zt();let t=ee();if(t)t.colBrightness.fill(1),t.colGammaCheck.fill(null),t.colContrast.fill(1);z(),E(j().toast);return}ee()?.close()}var Hr={"zoom.in":()=>On(),"zoom.out":()=>zn(),"zoom.fit":()=>Wn(),"zoom.oneToOne":()=>gt(),"nav.colPrev":()=>Rr(-1),"nav.colNext":()=>Rr(1),"nav.rowPrev":()=>Ir(-1),"nav.rowNext":()=>Ir(1),"display.canvas":()=>{ft(),Se();for(let e of w)e.updateFillCanvasBtn?.();E(B?"Canvas: Fill":"Canvas: Fit")},"display.minimap":()=>{Ln();for(let e of w)e.updateNavMap?.();E(be?"Minimap ON":"Minimap OFF")},"display.rowNav":()=>{let e=C().querySelector("._scf_row_nav");if(!e)return;let t=e.classList.toggle("_scf_ui_force_hidden");if(E("Row nav: "+(t?"off":"on")),!t)ee()?.revealRowNav?.()},"display.bgLoad":()=>{let e=ee();if(!e)return;let t=!e.bgLoadAll();if(e.setBgLoadAll(t),E("Lazy load: "+(t?"bg (load all)":"viewport only")),t)e.triggerBgLoad()},"filter.next":()=>{Gt(1),z(),E(j().toast)},"filter.prev":()=>{Gt(-1),z(),E(j().toast)},"gamma.next":()=>Ar(1),"gamma.prev":()=>Ar(-1),"bright.up":()=>Tt("BracketRight",!1),"bright.down":()=>Tt("BracketLeft",!1),"contrast.up":()=>Tt("BracketRight",!0),"contrast.down":()=>Tt("BracketLeft",!0),"adjust.resetSource":()=>Dr(!1),"adjust.resetAll":()=>Dr(!0),"viewer.help":()=>Et(),"viewer.close":(e)=>Za(e.source)};function Nr(e,t){let o=w.length>0;for(let n of ne){if((n.phase??"down")!==t)continue;if(!o&&!n.siteLevel)continue;let r=W(n.id);if(Be(r.main,e)||r.extra!=null&&Be(r.extra,e))return e.preventDefault(),Hr[n.id]({source:"key"}),!0}return!1}function po(e){if(w.length===0)return!1;for(let t of ne){let o=W(t.id);if(le(o.main,e)||o.extra!=null&&le(o.extra,e))return Hr[t.id]({source:"mouse"}),!0}return!1}function Ka(e){if(w.length===0)return!1;return ne.some((t)=>{let o=W(t.id);return le(o.main,e)||o.extra!=null&&le(o.extra,e)})}function Tr(e,t){let o=0,n=0;e.addEventListener("mousedown",(r)=>{if(r.button===0){o=r.clientX,n=r.clientY;return}let i=r.button===1?"middle":r.button===3?"back":r.button===4?"forward":null;if(i&&Ka(i))r.preventDefault()}),e.addEventListener("mouseup",(r)=>{if(r.button!==0||t.active)return;if(Math.abs(r.clientX-o)>4||Math.abs(r.clientY-n)>4)return;po("click")}),e.addEventListener("dblclick",()=>po("dblclick")),e.addEventListener("auxclick",(r)=>{let i=r.button===1?"middle":r.button===3?"back":r.button===4?"forward":null;if(i&&po(i))r.preventDefault()})}function Br(e){let t=new Set;window.addEventListener("keydown",(o)=>{if(lo()){t.add(o.code);return}if(o.key==="Escape"&&Re()){t.add(o.code),o.preventDefault(),o.stopPropagation();return}if(Ut())return;let n=w.length>0;if(!n&&!Wt(e))return;if(Xe()){let r=W("viewer.help");if(o.code==="Escape"||Be(r.main,o)||r.extra!=null&&Be(r.extra,o))o.preventDefault(),Ie();o.stopPropagation();return}if(o.code==="KeyV"&&!n&&!o.shiftKey&&!o.ctrlKey&&!o.altKey&&!o.metaKey){let r=document.querySelector("[data-yacomp-comppics]");if(r){o.preventDefault(),o.stopPropagation(),r.click();return}if(Lr())o.preventDefault(),o.stopPropagation();return}if(n&&/^Digit[1-9]$/.test(o.code)&&!o.shiftKey&&!o.ctrlKey&&!o.altKey&&!o.metaKey){let r=ee(),i=parseInt(o.code.charAt(5),10)-1;if(r&&i<r.visibleCols.length)o.preventDefault(),r.setColumn(r.visibleCols[i]);return}Nr(o,"down")},!0),window.addEventListener("keyup",(o)=>{if(t.delete(o.code))return;if(lo()||Ut())return;let n=w.length>0;if(!n&&!Wt(e))return;if(Xe()){o.stopPropagation();return}if(o.key==="Escape"&&!n&&Oe()&&!o.ctrlKey&&!o.altKey&&!o.metaKey){zt(),z(),E(j().toast);return}Nr(o,"up")},!0)}var Gr=!1;function Or(){if(gr(),Gr)return;Br(),Gr=!0}function Fr(e){return e.replaceAll("."," ")}function Ua(e){if(!e||!Array.isArray(e.comparisons)||!e.comparisons.length)throw TypeError("Invalid slow.pics collection: comparisons are required");let t=e.comparisons[0]?.images?.length??0;if(!t)throw TypeError("Invalid slow.pics collection: images are required");for(let o of e.comparisons){if(!Array.isArray(o.images)||o.images.length!==t)throw TypeError("Invalid slow.pics collection: every row must have the same column count");for(let n of o.images)if(!n?.name||!/^[A-Za-z0-9._-]+$/.test(n.publicFileName||""))throw TypeError("Invalid slow.pics collection: malformed image metadata")}}function Va(e){Ua(e);let t=e.comparisons,o=t[0].images.map((r)=>Fr(r.name.replace(/^\([BIP]\) /,"")));return{rows:t.map((r)=>r.images.map((i)=>({full:`https://i.slow.pics/${i.publicFileName}`,width:i.width,height:i.height}))),numCols:o.length,names:o,rowNames:t.map((r)=>r.images.map((i)=>Fr(i.name))),initialZoom:{mode:"fit"}}}function jc(e,t={}){let o=Va(e);return Or(),Me(o,t.onClose)}function Zc(){Or(),Ct()}export{Zc as openSettings,jc as openSlowPicsCollection,Va as slowPicsCollectionToGrid};
