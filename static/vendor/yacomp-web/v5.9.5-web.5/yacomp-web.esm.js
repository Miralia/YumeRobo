var Z4=["click","dblclick","middle","back","forward"];function A0($){if($.t!=="key"||$.shift||$.ctrl||$.alt||$.meta)return!1;return $.code==="KeyV"||/^Digit[1-9]$/.test($.code)}function r2($){let _={t:"key",code:$.code};if($.shiftKey)_.shift=!0;if($.ctrlKey)_.ctrl=!0;if($.altKey)_.alt=!0;if($.metaKey)_.meta=!0;return _}function S0($,_){return $.t==="key"&&$.code===_.code&&!!$.shift===_.shiftKey&&!!$.ctrl===_.ctrlKey&&!!$.alt===_.altKey&&!!$.meta===_.metaKey}function e($,_){return $.t==="mouse"&&$.g===_}function z2($,_){if(!$||!_)return $===_;if($.t==="key"&&_.t==="key")return $.code===_.code&&!!$.shift===!!_.shift&&!!$.ctrl===!!_.ctrl&&!!$.alt===!!_.alt&&!!$.meta===!!_.meta;if($.t==="mouse"&&_.t==="mouse")return $.g===_.g;return!1}function F2($){if(typeof $!=="object"||$===null)return!1;let _=$;if(_.t==="key")return typeof _.code==="string"&&_.code.length>0;if(_.t==="mouse")return Z4.includes(_.g);return!1}function d0($){if(!$)return"—";if($.t==="mouse")return{click:"Click",dblclick:"Double-click",middle:"Middle-click",back:"Back button",forward:"Forward button"}[$.g];let _=[];if($.ctrl)_.push("Ctrl");if($.alt)_.push("Alt");if($.meta)_.push("Meta");if($.shift)_.push("Shift");return _.push(G4($.code)),_.join(" + ")}function G4($){if(/^Key[A-Z]$/.test($))return $.slice(3);if(/^Digit[0-9]$/.test($))return $.slice(5);return{ArrowLeft:"←",ArrowRight:"→",ArrowUp:"↑",ArrowDown:"↓",Minus:"-",Equal:"=",BracketLeft:"[",BracketRight:"]",Backslash:"\\",Escape:"Esc",Space:"Space",Enter:"Enter",Comma:",",Period:".",Slash:"/",Semicolon:";",Quote:"'",Backquote:"`"}[$]??$}var P=($,_)=>({t:"key",code:$,..._}),i=[{id:"zoom.in",label:"Zoom in",group:"Zoom",defaultMain:P("Equal"),defaultExtra:null},{id:"zoom.out",label:"Zoom out",group:"Zoom",defaultMain:P("Minus"),defaultExtra:null},{id:"zoom.fit",label:"Fit width",group:"Zoom",defaultMain:P("Digit0"),defaultExtra:null},{id:"zoom.oneToOne",label:"Actual size (1:1)",group:"Zoom",defaultMain:P("KeyO"),defaultExtra:null},{id:"nav.colPrev",label:"Previous source",group:"Navigate",defaultMain:P("ArrowLeft"),defaultExtra:P("KeyH")},{id:"nav.colNext",label:"Next source",group:"Navigate",defaultMain:P("ArrowRight"),defaultExtra:P("KeyL")},{id:"nav.rowPrev",label:"Previous row",group:"Navigate",defaultMain:P("ArrowUp"),defaultExtra:P("KeyK")},{id:"nav.rowNext",label:"Next row",group:"Navigate",defaultMain:P("ArrowDown"),defaultExtra:P("KeyJ")},{id:"display.canvas",label:"Canvas fill / fit",group:"Display",defaultMain:P("KeyC"),defaultExtra:null,phase:"up"},{id:"display.minimap",label:"Minimap",group:"Display",defaultMain:P("KeyM"),defaultExtra:null},{id:"display.rowNav",label:"Row nav sidebar",group:"Display",defaultMain:P("KeyR"),defaultExtra:null,phase:"up"},{id:"display.bgLoad",label:"Background loading",group:"Display",defaultMain:P("KeyB"),defaultExtra:null,phase:"up"},{id:"filter.next",label:"Filter mode next",group:"Adjust",defaultMain:P("KeyF"),defaultExtra:null,phase:"up",siteLevel:!0},{id:"filter.prev",label:"Filter mode prev",group:"Adjust",defaultMain:P("KeyF",{shift:!0}),defaultExtra:null,phase:"up",siteLevel:!0},{id:"gamma.next",label:"Gamma check next",group:"Adjust",defaultMain:P("KeyG"),defaultExtra:null,phase:"up"},{id:"gamma.prev",label:"Gamma check prev",group:"Adjust",defaultMain:P("KeyG",{shift:!0}),defaultExtra:null,phase:"up"},{id:"bright.up",label:"Brightness up",group:"Adjust",defaultMain:P("BracketRight"),defaultExtra:null},{id:"bright.down",label:"Brightness down",group:"Adjust",defaultMain:P("BracketLeft"),defaultExtra:null},{id:"contrast.up",label:"Contrast up",group:"Adjust",defaultMain:P("BracketRight",{shift:!0}),defaultExtra:null},{id:"contrast.down",label:"Contrast down",group:"Adjust",defaultMain:P("BracketLeft",{shift:!0}),defaultExtra:null},{id:"adjust.resetSource",label:"Reset source adjustments",group:"Adjust",defaultMain:P("Backslash"),defaultExtra:null,phase:"up"},{id:"adjust.resetAll",label:"Reset all adjustments",group:"Adjust",defaultMain:P("Backslash",{shift:!0}),defaultExtra:null,phase:"up"},{id:"viewer.help",label:"Toggle shortcuts help",group:"Viewer",defaultMain:P("Slash",{shift:!0}),defaultExtra:null},{id:"viewer.close",label:"Close viewer",group:"Viewer",defaultMain:P("Escape"),defaultExtra:null}],N2=new Map(i.map(($)=>[$.id,$]));function o2($){return N2.get($)}function e2($){let _=N2.get($);return{main:_.defaultMain,extra:_.defaultExtra}}function $1($){return typeof $==="string"&&N2.has($)}var p0=["bhd","comppics","frds","gpw","hdbits","ptp","slowpics","ssd","blutopia","aither"],Q1={bhd:"BHD",comppics:"comp.pics",frds:"FRDS",gpw:"GPW",hdbits:"HDB",ptp:"PTP",slowpics:"slow.pics",ssd:"SSD",blutopia:"BLU",aither:"ATH"},s0=["solar1","solar2","residual","luma","chroma"],c0=["aeqt-0p88","srgb-bt1886","legacy-mac"],J1="yacomp_config",X1="yacomp-web:config",l0=4,V1=Object.fromEntries(p0.map(($)=>[$,!0])),B={v:l0,defaultZoomMode:"1:1",fillCanvasDefault:!1,navMapDefault:!0,bgLoadDefault:!1,bcStep:0.05,toastDuration:2000,zoomScaleFactor:1.25,lazyLoadMargin:200,mouseSwitch:!1,zoomPercentBase:"original",oneToOnePixels:"logical",verboseZoom:!1,closeBtnPosition:"auto",uiChromeMode:"default",uiHideDelay:1000,ptpGridImageSize:"thumbnail",ptpGridClick:"viewer",hdbitsImageClick:"viewer",hdbitsManualAllThreads:!1,ptpGridToggleStyle:"grid",ptpGridToggleCollapsed:"▦",ptpGridToggleExpanded:"▦",enabledSites:V1,filterCycle:[...s0],gammaCycle:[...c0],shortcuts:{}};function C0($,_,q,J){if(typeof $!=="number"||!isFinite($))return J;return Math.max(_,Math.min(q,$))}function _1($,_){if(typeof $!=="string")return _;let q=$.trim();return q?q.slice(0,32):_}function U4($){let _={...V1};if(typeof $!=="object"||$===null)return _;let q=$;for(let J of p0)if(typeof q[J]==="boolean")_[J]=q[J];return _}function q1($,_,q){if(!Array.isArray($))return[...q];let J=new Set(_),Q=new Set,X=[];for(let V of $)if(typeof V==="string"&&J.has(V)&&!Q.has(V))Q.add(V),X.push(V);return X}function H4($){let _={};if(typeof $!=="object"||$===null)return _;for(let[q,J]of Object.entries($)){if(!$1(q))continue;if(typeof J!=="object"||J===null)continue;let Q=J;if(!F2(Q.main)||A0(Q.main))continue;let X=F2(Q.extra)&&!A0(Q.extra)?Q.extra:null;_[q]={main:Q.main,extra:X}}return _}function M2($){return{v:l0,defaultZoomMode:$.defaultZoomMode==="fit"||$.defaultZoomMode==="1:1"?$.defaultZoomMode:B.defaultZoomMode,fillCanvasDefault:typeof $.fillCanvasDefault==="boolean"?$.fillCanvasDefault:B.fillCanvasDefault,navMapDefault:typeof $.navMapDefault==="boolean"?$.navMapDefault:B.navMapDefault,bgLoadDefault:typeof $.bgLoadDefault==="boolean"?$.bgLoadDefault:B.bgLoadDefault,bcStep:C0($.bcStep,0.01,0.25,B.bcStep),toastDuration:C0($.toastDuration,500,1e4,B.toastDuration),zoomScaleFactor:C0($.zoomScaleFactor,1.05,2,B.zoomScaleFactor),lazyLoadMargin:C0($.lazyLoadMargin,0,2000,B.lazyLoadMargin),mouseSwitch:typeof $.mouseSwitch==="boolean"?$.mouseSwitch:B.mouseSwitch,zoomPercentBase:$.zoomPercentBase==="original"||$.zoomPercentBase==="fit"?$.zoomPercentBase:B.zoomPercentBase,oneToOnePixels:$.oneToOnePixels==="device"||$.oneToOnePixels==="logical"?$.oneToOnePixels:B.oneToOnePixels,verboseZoom:typeof $.verboseZoom==="boolean"?$.verboseZoom:B.verboseZoom,closeBtnPosition:$.closeBtnPosition==="auto"||$.closeBtnPosition==="left"||$.closeBtnPosition==="right"||$.closeBtnPosition==="hide"?$.closeBtnPosition:B.closeBtnPosition,uiChromeMode:$.uiChromeMode==="always"||$.uiChromeMode==="default"||$.uiChromeMode==="autohide"?$.uiChromeMode:B.uiChromeMode,uiHideDelay:C0($.uiHideDelay,200,5000,B.uiHideDelay),ptpGridImageSize:$.ptpGridImageSize==="thumbnail"||$.ptpGridImageSize==="full"?$.ptpGridImageSize:B.ptpGridImageSize,ptpGridClick:$.ptpGridClick==="viewer"||$.ptpGridClick==="tab"?$.ptpGridClick:B.ptpGridClick,hdbitsImageClick:$.hdbitsImageClick==="viewer"||$.hdbitsImageClick==="native"?$.hdbitsImageClick:B.hdbitsImageClick,hdbitsManualAllThreads:typeof $.hdbitsManualAllThreads==="boolean"?$.hdbitsManualAllThreads:B.hdbitsManualAllThreads,ptpGridToggleStyle:$.ptpGridToggleStyle==="grid"||$.ptpGridToggleStyle==="triangles"||$.ptpGridToggleStyle==="text"||$.ptpGridToggleStyle==="custom"?$.ptpGridToggleStyle:B.ptpGridToggleStyle,ptpGridToggleCollapsed:_1($.ptpGridToggleCollapsed,B.ptpGridToggleCollapsed),ptpGridToggleExpanded:_1($.ptpGridToggleExpanded,B.ptpGridToggleExpanded),enabledSites:U4($.enabledSites),filterCycle:q1($.filterCycle,s0,B.filterCycle),gammaCycle:q1($.gammaCycle,c0,B.gammaCycle),shortcuts:H4($.shortcuts)}}function K1($){if((typeof $.v==="number"?$.v:0)<2)$.enabledSites??=B.enabledSites,$.filterCycle??=B.filterCycle,$.gammaCycle??=B.gammaCycle;return $}var O;function W4(){try{if(typeof GM_getValue==="function")return GM_getValue(J1,B)}catch{}try{let $=globalThis.localStorage?.getItem(X1);return $?JSON.parse($):null}catch{return null}}function j1($){try{if(typeof GM_setValue==="function"){GM_setValue(J1,$);return}}catch{}try{globalThis.localStorage?.setItem(X1,JSON.stringify($))}catch{}}var m0=W4();O=M2(K1(typeof m0==="object"&&m0!==null?m0:{}));if(m0?.v!==l0)j1(O);function Y1(){return O.defaultZoomMode}function Z1(){return O.fillCanvasDefault}function G1(){return O.navMapDefault}function U1(){return O.bgLoadDefault}function t0(){return O.bcStep}function H1(){return O.toastDuration}function W1(){return O.zoomScaleFactor}function z1(){return O.lazyLoadMargin}function i0(){return O.mouseSwitch}function F1(){return O.zoomPercentBase}function x2(){return O.oneToOnePixels}function O2(){return O.verboseZoom}function N1(){return O.closeBtnPosition}function M1(){return O.uiChromeMode}function a0(){return O.uiHideDelay}function x1(){return O.ptpGridToggleStyle}function O1(){return O.ptpGridToggleCollapsed}function f1(){return O.ptpGridToggleExpanded}function L1($){return O.enabledSites[$]}function v($){return O.shortcuts[$]??e2($)}function B1(){let $=v("viewer.close");return[$.main,$.extra].some((_)=>_!=null&&(e(_,"click")||e(_,"dblclick")))}function f2($,_){g({shortcuts:{...O.shortcuts,[$]:_}})}function P1(){g({shortcuts:{}})}function k1($,_,q){for(let J of i){let Q=v(J.id);if(!(J.id===_&&q==="main")&&z2(Q.main,$))return J.id;if(!(J.id===_&&q==="extra")&&Q.extra&&z2(Q.extra,$))return J.id}return null}function I1(){return O.filterCycle}function A1(){return O.gammaCycle}function h(){return O}function L2(){j1(O)}function g($){Object.assign(O,$),O.v=l0,O=M2(O),L2()}function S1(){O={...B},L2()}function C1(){return JSON.stringify(O,null,2)}function E1($){let _;try{_=JSON.parse($)}catch{return!1}if(typeof _!=="object"||_===null||Array.isArray(_))return!1;return O=M2(K1(_)),L2(),!0}var E0=[{id:"off",filter:"",label:null,toast:"◼  Off"},{id:"solar1",filter:"url(#scf-s1)",label:"☀️ Solar ×1",toast:"☀️  Solar ×1"},{id:"solar2",filter:"url(#scf-s2)",label:"☀️☀️ Solar ×2",toast:"☀️☀️  Solar ×2"},{id:"residual",filter:"url(#scf-hpf)",label:"\uD83D\uDD2C Residual",toast:"\uD83D\uDD2C  Residual"},{id:"luma",f709:"url(#scf-luma709)",f2020:"url(#scf-luma2020)",label:"⬜ Luma",toast:"⬜  Luma"},{id:"chroma",f709:"url(#scf-chroma709)",f2020:"url(#scf-chroma2020)",label:"\uD83C\uDF08 Chroma",toast:"\uD83C\uDF08  Chroma"}],R1=new Map(E0.map(($)=>[$.id,$])),$0=0;function D1($){$0=$}function d(){return E0[$0]}function r0($){let _=$||d();return!!(_.filter||_.f709)}function B2($){let _=I1();if(_.length===0){$0=0;return}let q=E0[$0].id;if(q==="off"){let X=$>0?_[0]:_[_.length-1],V=R1.get(X);if(V)$0=E0.indexOf(V);return}let J=_.indexOf(q);if(J===-1){$0=0;return}let Q=J+($>0?1:-1);if(Q<0||Q>=_.length)$0=0;else{let X=R1.get(_[Q]);if(X)$0=E0.indexOf(X)}}var P2=0.05,k2=4;function _0($){return Math.abs($-1)<=0.001}function u1($,_){let q=+$.toFixed(2),J=t0(),Q=_>0?J:-J;return Math.max(P2,Math.min(k2,+(q+Q).toFixed(2)))}function T1($){return"Brightness "+Math.round($*100)+"%"}function b1($,_){let q=[];if(!_0($))q.push("brightness("+$.toFixed(2)+")");if(!_0(_))q.push("contrast("+_.toFixed(2)+")");return q.join(" ")}function R0(){return r0()}function I2(){D1(0)}var z4=[[/(?:^|\.)slow\.pics$/i,"slowpics"],[/(?:^|\.)comp\.pics$/i,"comppics"],[/(?:^|\.)passthepopcorn\.me$/i,"ptp"],[/(?:^|\.)hdbits\.org$/i,"hdbits"],[/(?:^|\.)springsunday\.net$/i,"ssd"],[/^pt\.keepfrds\.com$/i,"frds"],[/(?:^|\.)blutopia\.cc$/i,"blutopia"],[/(?:^|\.)aither\.cc$/i,"aither"],[/(?:^|\.)beyond-hd\.me$/i,"bhd"],[/(?:^|\.)greatposterwall\.com$/i,"gpw"]];function F4($=location.hostname){for(let[_,q]of z4)if(_.test($))return q;return null}function A2($=location.hostname){let _=F4($);return _===null||L1(_)}var S2=[{id:"srgb-bt1886",ratio:0.917,formula:"2.2/2.4",label:"sRGB 2.2↔BT.1886 2.4",svgId:"scf-gamma-mismatch-srgb-bt1886"},{id:"aeqt-0p88",ratio:0.88,formula:"2.2/2.5",label:"0.88 AE/QT folklore 2.2↔CRT 2.5",svgId:"scf-gamma-mismatch-aeqt-0p88"},{id:"legacy-mac",ratio:0.818,formula:"1.8/2.2",label:"Legacy Mac 1.8↔2.2",svgId:"scf-gamma-mismatch-legacy-mac"}],U0=new Map(S2.map(($)=>[$.id,$]));function y1($,_){let q=A1(),J=$?q.indexOf($):-1,Q=q.length+1,X=(J+(_>0?1:-1)+Q)%Q;return X===q.length?null:q[X]}function h1($){return 1/(U0.get($)?.ratio||1)}function v1($){if(!$)return"";let _=U0.get($);return _?"url(#"+_.svgId+")":""}function w1($){let _=U0.get($);return(_.ratio*100).toFixed(1)+"% ("+_.formula+")"}function n1($){return"pow(1/"+U0.get($).ratio.toFixed(3)+")"}function g1($){return U0.get($).label}function d1($){let _=U0.get($);return{line1:"γ "+(_.ratio*100).toFixed(1)+"% ("+_.formula+")",line2:_.label}}var D0=new Map;function N4($){if(/rec\.?2020|bt\.?2020|hdr10|hlg|dolby.?vision|dovi/i.test($))return"2020";return null}function M4($){if($[0]===255&&$[1]===216){let _=2;while(_+4<$.length){if($[_]!==255)break;let q=$[_+2]<<8|$[_+3];if($[_+1]===226&&q>16&&$[_+4]===73&&$[_+5]===67&&$[_+6]===67&&$[_+7]===95)return $.slice(_+18,_+2+q);_+=2+q}}if($[0]===137&&$[1]===80&&$[2]===78&&$[3]===71){let _=8;while(_+12<$.length){let q=($[_]<<24|$[_+1]<<16|$[_+2]<<8|$[_+3])>>>0,J=String.fromCharCode($[_+4],$[_+5],$[_+6],$[_+7]);if(J==="iCCP"){let Q=_+8;while(Q<$.length&&$[Q]!==0)Q++;return{name:$.slice(_+8,Q),data:$.slice(Q+2,_+8+q)}}if(J==="IDAT")break;_+=12+q}}return null}var x4=/(?:bt|rec|itu-?r(?:\s+bt)?)[\s._-]*2020/i;function C2($){return x4.test(new TextDecoder("latin1").decode($))}async function O4($){if(typeof DecompressionStream>"u")return null;try{let _=new DecompressionStream("deflate"),q=await new Response(new Blob([$]).stream().pipeThrough(_)).arrayBuffer();return new Uint8Array(q)}catch(_){return null}}function f4($){return!($ instanceof Uint8Array)}async function m1($){if(D0.has($))return D0.get($);let _=N4($);if(_)return D0.set($,_),_;let q=(async()=>{let J="709";try{let Q=await fetch($,{headers:{Range:"bytes=0-8191"}});if(Q.ok){let X=M4(new Uint8Array(await Q.arrayBuffer()));if(X)if(!f4(X)){if(C2(X))J="2020"}else if(C2(X.name))J="2020";else{let V=await O4(X.data);if(V&&C2(V))J="2020"}}}catch(Q){D0.delete($)}return J})();return D0.set($,q),q}var p1=5.5*Math.PI-25.6,L4=-p1/4194304,B4=3*p1/32768;function P4($,_=0){let q=$+_;return Math.max(0,Math.min(255,127.9999*Math.sin(L4*q**3+B4*q**2+0.2*q-Math.PI/2)+127.5))}function H0($,_){return Array.from({length:256},(q,J)=>{let Q=J;for(let X=0;X<_;X++)Q=P4(Q,$);return(Q/255).toFixed(5)}).join(" ")}var V0={s1:{r:H0(0,1),g:H0(-5,1),b:H0(5,1)},s2:{r:H0(0,2),g:H0(-5,2),b:H0(5,2)}};var u0=null,o0=null;function k4(){if(o0)return;u0=document.createElement("div"),u0.id="_scf_root_",u0.style.cssText="position:absolute;top:0;left:0;width:0;height:0;overflow:visible",document.body.appendChild(u0),o0=u0.attachShadow({mode:"open"})}function f(){if(!o0)k4();return o0}var I4=new Set(["checkbox","radio","button","submit","reset","file"]);function E2(){let $=document.activeElement;while($?.shadowRoot?.activeElement)$=$.shadowRoot.activeElement;if(!$)return!1;if($.isContentEditable)return!0;if($.tagName==="TEXTAREA")return!0;if($.tagName!=="INPUT")return!1;return!I4.has($.type)}var R2=0.5114155251141552;function t1($){return $.map((_)=>_.map(String).join(" ")).join(" ")}function s1($,_,q){let J=[$,_,q,0,0];return t1([J,J,J,[0,0,0,1,0]])}function c1($,_,q){return t1([[1-$,-_,-q,0,R2],[-$,1-_,-q,0,R2],[-$,-_,1-q,0,R2],[0,0,0,1,0]])}function A4(){return S2.map(($)=>{let _=h1($.id).toFixed(6);return`<filter id="${$.svgId}" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix" in="SourceGraphic" result="luma"
        values="0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0 0 0 1 0"/>
      <feComponentTransfer in="luma" result="gammaLuma">
        <feFuncR type="gamma" amplitude="1" exponent="${_}" offset="0"/>
        <feFuncG type="gamma" amplitude="1" exponent="${_}" offset="0"/>
        <feFuncB type="gamma" amplitude="1" exponent="${_}" offset="0"/>
      </feComponentTransfer>
      <feComposite in="gammaLuma" in2="luma" operator="arithmetic" result="deltaPos"
        k1="0" k2="1" k3="-1" k4="1"/>
      <feComposite in="SourceGraphic" in2="deltaPos" operator="arithmetic"
        k1="0" k2="1" k3="1" k4="-1"/>
    </filter>`}).join("")}function S4(){return`<defs>
    <filter id="scf-s1" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feComponentTransfer>
        <feFuncR type="table" tableValues="${V0.s1.r}"/>
        <feFuncG type="table" tableValues="${V0.s1.g}"/>
        <feFuncB type="table" tableValues="${V0.s1.b}"/>
      </feComponentTransfer>
    </filter>
    <filter id="scf-s2" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feComponentTransfer>
        <feFuncR type="table" tableValues="${V0.s2.r}"/>
        <feFuncG type="table" tableValues="${V0.s2.g}"/>
        <feFuncB type="table" tableValues="${V0.s2.b}"/>
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
        values="${s1(0.2126,0.7152,0.0722)}"/>
    </filter>
    <filter id="scf-luma2020" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix"
        values="${s1(0.2627,0.678,0.0593)}"/>
    </filter>
    <filter id="scf-chroma709" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix"
        values="${c1(0.2126,0.7152,0.0722)}"/>
    </filter>
    <filter id="scf-chroma2020" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix"
        values="${c1(0.2627,0.678,0.0593)}"/>
    </filter>
    ${A4()}
  </defs>`}function C4(){let $=document.createElementNS("http://www.w3.org/2000/svg","svg");return $.id="_scf_defs_",$.style.cssText="position:fixed;width:0;height:0;overflow:hidden;pointer-events:none;z-index:-9999",$.innerHTML=S4(),$}function l1($){if($.getElementById("_scf_defs_"))return;($===document?document.body:$).appendChild(C4())}function T0(){l1(document),l1(f())}var D2;function L($){let _=f().getElementById("_scf_toast_");if(!_)_=document.createElement("div"),_.id="_scf_toast_",Object.assign(_.style,{position:"fixed",bottom:"28px",left:"50%",transform:"translateX(-50%)",background:"rgba(12,12,12,.88)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.13)",boxShadow:"0 4px 16px rgba(0,0,0,.45)",color:"#fff",font:"600 13px/1 system-ui,sans-serif",letterSpacing:".4px",padding:"9px 22px",borderRadius:"999px",zIndex:"2147483647",pointerEvents:"none",transition:"opacity .3s ease",opacity:"0",whiteSpace:"nowrap",textAlign:"center"}),f().appendChild(_);if(typeof $==="string")_.textContent=$,Object.assign(_.style,{padding:"9px 22px",borderRadius:"999px",whiteSpace:"nowrap",lineHeight:"1"});else _.replaceChildren(...$.map((q)=>{let J=document.createElement("div");J.textContent=q.text;let Q=q.size||"normal";if(Object.assign(J.style,{fontSize:Q==="large"?"16px":Q==="small"?"12px":Q==="tiny"?"10px":"13px",fontWeight:Q==="large"?"700":"600",lineHeight:Q==="large"?"1.2":"1.25",opacity:q.muted?".72":"1"}),q.color)J.style.color=q.color;return J})),Object.assign(_.style,{padding:"10px 22px",borderRadius:"10px",whiteSpace:"normal",lineHeight:"1.25"});_.style.opacity="1",clearTimeout(D2),D2=setTimeout(()=>_.style.opacity="0",H1())}function i1(){clearTimeout(D2);let $=f().getElementById("_scf_toast_");if($)$.style.opacity="0"}function w($,_,q){return Math.max(_,Math.min(q,$))}var u="fit",s=0,K0=!0;function b0($){u=$}function y0($){s=$}function a1(){K0=!K0}var y=!1;function $2(){y=!y}function r1($){y=$}function o1($){K0=$}function W0(){for(let $ of N)if($.compDiv.classList.toggle("_scf_fill_canvas",y),$.updateNavMap)$.updateNavMap()}var N=[];function e1($){N.push($)}function $3($){N=N.filter((_)=>_!==$)}function _2($){let _=($.rowSyncSuppressToken||0)+1;$.rowSyncSuppressToken=_,$.suppressRowSync=!0;let q=()=>{if($.rowSyncSuppressToken!==_)return;$.suppressRowSync=!1};if(typeof window.requestAnimationFrame==="function")window.requestAnimationFrame(()=>window.requestAnimationFrame(q));else setTimeout(q,0)}function _3($,_){let q=Math.max(0,_.rowWidth-_.viewportWidth),J=_.rowLeft+_.rowWidth*$.rowXRatio-$.viewportX,Q=0,X=Math.max(0,_.contentHeight-_.viewportHeight),V=$.scrollTopBounds==="row"&&_.rowHeight>_.viewportHeight,K=V?_.rowTop:0,Y=V?Math.max(K,_.rowTop+_.rowHeight-_.viewportHeight):X;return{scrollLeft:w(J,0,q),scrollTop:w(_.rowTop+_.rowHeight*$.rowYRatio-$.viewportY,K,Y)}}function E4($,_){let q=$.compDiv.scrollTop+_,J=0,Q=1/0;for(let X=0;X<$.allRowData.length;X++){let V=$.allRowData[X].rowDiv,K=V.offsetTop,Y=K+V.offsetHeight;if(q>=K&&q<=Y)return X;let U=q<K?K-q:q-Y;if(U<Q)Q=U,J=X}return J}function u2($,_){if(!$.allRowData.length)return null;let q=$.compDiv.clientWidth/2,J=$.compDiv.clientHeight/2;if(_){let W=$.compDiv.getBoundingClientRect();q=w(_.clientX-W.left,0,$.compDiv.clientWidth),J=w(_.clientY-W.top,0,$.compDiv.clientHeight)}let Q=w(_?E4($,J):$.currentRow,0,$.allRowData.length-1),X=$.allRowData[Q].rowDiv,V=X.offsetLeft,K=X.offsetWidth||1,Y=X.offsetHeight||1,U=_?w(($.compDiv.scrollLeft+q-V)/K,0,1):0.5,Z=_?w(($.compDiv.scrollTop+J-X.offsetTop)/Y,0,1):0.5;return{comp:$,rowIdx:Q,currentRowIdx:_?Q:$.currentRow,scrollTopBounds:_?"content":"row",rowXRatio:U,rowYRatio:Z,viewportX:q,viewportY:J}}function T2(){return N.map(($)=>u2($)).filter(($)=>$!==null)}function R4($){let _=$.comp.allRowData[$.rowIdx]?.rowDiv;if(!_)return;let q=_3($,{rowLeft:_.offsetLeft,rowTop:_.offsetTop,rowWidth:_.offsetWidth||1,rowHeight:_.offsetHeight||1,contentHeight:$.comp.compDiv.scrollHeight,viewportWidth:$.comp.compDiv.clientWidth,viewportHeight:$.comp.compDiv.clientHeight});if(_2($.comp),$.comp.compDiv.scrollLeft=q.scrollLeft,$.comp.compDiv.scrollTop=q.scrollTop,$.comp.currentRow=$.currentRowIdx,$.comp.updateRowNav)$.comp.updateRowNav($.currentRowIdx);$.comp.updateLabel?.()}function q3($){let _=$.allRowData[$.currentRow];if(!_)return;let q=_.rowDiv,J=$.compDiv.clientWidth,Q=$.compDiv.clientHeight,X=_3({rowXRatio:0.5,rowYRatio:0.5,viewportX:J/2,viewportY:Q/2,scrollTopBounds:"row"},{rowLeft:q.offsetLeft,rowTop:q.offsetTop,rowWidth:q.offsetWidth||1,rowHeight:q.offsetHeight||1,contentHeight:$.compDiv.scrollHeight,viewportWidth:J,viewportHeight:Q});_2($),$.compDiv.scrollLeft=X.scrollLeft,$.compDiv.scrollTop=X.scrollTop}function D4(){if(x2()!=="device")return 1;return window.devicePixelRatio||1}function q0($){if(!$)return 0;return Math.round($/D4())}function e0(){if(u==="1:1")return 1;let $=h0();return $?s/$:1}function Q3($,_,q){let J=$.imgs[_.currentCol];if(J?.naturalWidth){$.rowDiv.style.width=`${Math.round(q0(J.naturalWidth)*q)}px`;return}if($.rowDiv.style.width=$.sizer?.naturalWidth?`${Math.round(q0($.sizer.naturalWidth)*q)}px`:"100vw",J?.addEventListener("load",()=>{if(u!=="fit"&&$.imgs[_.currentCol]===J&&J.naturalWidth)$.rowDiv.style.width=`${Math.round(q0(J.naturalWidth)*e0())}px`},{once:!0}),$.sizer&&!$.sizer.naturalWidth)$.sizer.addEventListener("load",()=>{if(u==="fit")return;if($.rowDiv.style.width&&$.rowDiv.style.width!=="100vw")return;let Q=$.imgs[_.currentCol]?.naturalWidth||$.sizer?.naturalWidth||0;if(Q)$.rowDiv.style.width=`${Math.round(q0(Q)*e0())}px`},{once:!0})}function J3($,_){if(u==="fit")return;Q3($,_,e0())}function j0($=[]){for(let _ of N)if(u==="fit"){for(let q of _.allRowData)q.rowDiv.style.width="100vw";_.compDiv.classList.remove("_scf_zoomed")}else{let q=e0();for(let J of _.allRowData)Q3(J,_,q);_.compDiv.classList.add("_scf_zoomed")}for(let _ of N)if(_.updateScrollSpacers)_.updateScrollSpacers();for(let _ of $)R4(_);for(let _ of N){if(_.updateNavMap)_.updateNavMap();if(_.syncFillCanvasVisibility)_.syncFillCanvasVisibility()}}function X3(){if(F1()==="fit")return window.innerWidth;return h0()||q0(u4())||window.innerWidth}function u4(){return f().querySelector("._scf_comp_sizer")?.naturalWidth||0}function T4(){let $=f().querySelector("._scf_comp_sizer"),_=$?.naturalWidth||0,q=$?.naturalHeight||0,J=q0(_),Q=N[N.length-1];if(Q){let X=Q.allRowData[Q.currentRow];if(X){let V=X.imgs[Q.currentCol];if(V?.naturalWidth)_=V.naturalWidth,q=V.naturalHeight;J=Math.round(X.rowDiv.offsetWidth)||q0(_)}}return{nativeW:_,nativeH:q,screenW:J}}function h0(){let $=N[N.length-1];if($)for(let _ of $.allRowData){let q=_.imgs[$.currentCol];if(q?.naturalWidth)return q0(q.naturalWidth)}return 0}var b4="#7ee0a0",y4="#8ab4f8";function h4($){if(!Number.isFinite($)||$<=0)return"1";return String(Number($.toFixed(2)))}function a(){let $=u==="fit"?"\uD83D\uDD0D Fit":u==="1:1"?"\uD83D\uDD0D 1:1":"\uD83D\uDD0D "+Math.round(s/X3()*100)+"%",_=window.devicePixelRatio||1,q=h4(_),J=x2()==="device"&&q!=="1";if(!O2()&&!J)return $;let Q=[{text:$,size:"large"}],{nativeW:X,nativeH:V,screenW:K}=T4();if(X){let Y=V?Math.round(K*V/X):0,U=V?X+"×"+V:X+"px",Z=Y?K+"×"+Y:K+"px",W=J?"@"+q+"x":" ("+Math.round(K/X*100)+"%)";Q.push({text:"Original "+U,size:"small",color:b4}),Q.push({text:"On screen "+Z+W,size:"small",color:y4})}if(O2())Q.push({text:"Viewport "+window.innerWidth+"px",size:"tiny",muted:!0});return Q}function b2($,_){let q=W1();return _>0?Math.min(Math.round($*q),window.innerWidth*8):Math.max(Math.round($/q),Math.round(window.innerWidth*0.1))}function y2($,_){let q=X3();if(q>0&&$!==q){if(_>$&&$<q&&_>q||_<$&&$>q&&_<q)return q}return _}function h2(){return(u==="fit"?window.innerWidth:u==="1:1"?h0():s)||window.innerWidth}function V3($){let _=T2(),q=h2();s=y2(q,b2(q,$)),u="custom",j0(_),L(a())}var K3=()=>V3(1),j3=()=>V3(-1);function Y3(){let $=T2();u="fit",s=0,j0($),L(a())}function q2($={}){let _=$.silent?[]:T2();if(u="1:1",s=h0()||s,j0(_),!$.silent)L(a())}function v0(){if(u!=="1:1")return;s=h0()||s,j0()}function z0(){let $=f().getElementById("_scf_hud_");if(!$)$=document.createElement("div"),$.id="_scf_hud_",Object.assign($.style,{position:"fixed",top:"12px",right:"44px",background:"rgba(12,12,12,.82)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.14)",boxShadow:"0 2px 10px rgba(0,0,0,.4)",color:"#fff",font:"600 11px/1 system-ui,sans-serif",letterSpacing:".3px",padding:"5px 12px",borderRadius:"8px",textAlign:"center",whiteSpace:"nowrap",zIndex:"2147483647",pointerEvents:"none",transition:"opacity .25s ease",opacity:"0"}),f().appendChild($);let _=d().label||"",q=N[N.length-1],J=null;if(q){let X=q.currentCol,V=q.colBrightness[X],K=q.colGammaCheck[X],Y=q.colContrast[X];if(!_0(V))_+=(_?"  ":"")+"☀"+Math.round(V*100)+"%";if(K)J=d1(K);if(!_0(Y))_+=(_?"  ":"")+"◐"+Math.round(Y*100)+"%"}let Q=_||J;if($.style.opacity=Q?"1":"0",Q)if($.replaceChildren(),J){let X=[];if(_)X.push(_+"  ");X.push(J.line1);let V=document.createElement("div");V.textContent=X.join(""),$.appendChild(V);let K=document.createElement("div");K.textContent=J.line2,Object.assign(K.style,{fontSize:"9px",opacity:".6",marginTop:"2px"}),$.appendChild(K)}else $.textContent=_}var v4=4,v2=0;function Z3(){let $=v2;return()=>$===v2}function w4(){return v2++,Z3()}function n4($,_){if($<=0)return[];let q=Math.max(0,Math.min($-1,Math.trunc(_))),J=[q];for(let Q=1;J.length<$;Q++){let X=q-Q,V=q+Q;if(X>=0)J.push(X);if(V<$)J.push(V)}return J}function g4($,_){if($<=0)return[];let q=Math.max(0,Math.min($-1,Math.trunc(_))),J=[q];for(let Q=q-1;Q>=0;Q--)J.push(Q);for(let Q=q+1;Q<$;Q++)J.push(Q);return J}function d4($){let _=[],q=n4($.allRowData.length,$.currentRow),J=g4($.numCols,$.currentCol);for(let Q of q){let X=$.allRowData[Q];if(!X)continue;for(let V of J){let K=X.imgs[V];if(K?.src)_.push({comp:$,row:Q,col:V,img:K})}}return _}function m4($){if($.closest("._scf_comp")||$.closest("._scf_nav_map")||$.closest("#_scf_hud_")||$.closest("#_scf_toast_"))return!1;if($.offsetWidth>200||$.naturalWidth>200)return!0;if($.classList.contains("screenshot-comparison__image"))return!0;return!1}function p4(){return[...document.querySelectorAll("img")].filter(m4)}async function s4($){let _=d();if(_.f709)return await m1($)==="2020"?_.f2020:_.f709;return _.filter||""}function c4($,_=1,q=1,J=null){let Q=[];if($)Q.push($);let X=v1(J);if(X)Q.push(X);let V=b1(_,q);if(V)Q.push(V);return Q.join(" ")}async function F0($,_={}){let q=_.shouldApply??Z3(),J=$.src,Q=c4(await s4(J),_.brightness,_.contrast,_.gammaCheck??null);if(!q()||$.isConnected===!1||$.src!==J)return;$.style.filter=Q}async function w2($,_){let{comp:q,col:J,img:Q}=$;await F0(Q,{brightness:q.colBrightness[J],contrast:q.colContrast[J],gammaCheck:q.colGammaCheck[J],shouldApply:_})}function l4(){return new Promise(($)=>setTimeout($,0))}async function t4($,_,q,J){if(!$.length||!q())return;let Q=Math.max(1,Math.floor(Number.isFinite(_)?_:1)),X=Math.min(Q,$.length),V=0;async function K(){while(q()){let Y=V++,U=$[Y];if(U===void 0)return;await J(U),await l4()}}await Promise.all(Array.from({length:X},()=>K()))}function i4($){let _=[],q=[];for(let J of $)if(J.row===J.comp.currentRow&&J.col===J.comp.currentCol)_.push(J);else q.push(J);return{anchors:_,rest:q}}function a4(){return new Promise(($)=>{if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>requestAnimationFrame(()=>$()));else setTimeout($,0)})}async function r4($,_,q,J,Q,X,V){for(let K of $){if(!J())return;await Q(K)}if(!J())return;if(V&&$.length>0){if(await V(),!J())return}await t4(_,q,J,X)}async function o4($,_,q){let{anchors:J,rest:Q}=i4($),X=[...Q.map((V)=>({type:"viewer",target:V})),..._.map((V)=>({type:"page",img:V}))];await r4(J,X,v4,q,(V)=>w2(V,q),async(V)=>{if(V.type==="viewer")await w2(V.target,q);else await F0(V.img,{shouldApply:q})},a4)}function m(){let $=w4(),_=d(),q=p4(),J=N.flatMap(d4);if(T0(),r0(_)){if(_.f709){o4(J,q,$),z0();return}q.forEach((Q)=>{F0(Q,{shouldApply:$})})}else for(let Q of q)Q.style.filter="";J.forEach((Q)=>{w2(Q,$)}),z0()}function Y0(){let $=f();if($.getElementById("_scf_css_"))return;let _=document.createElement("style");_.id="_scf_css_",_.textContent=`
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
      width: 100vw;
      cursor: crosshair;
      margin: 0 auto 2px;
      line-height: 0;
      overflow: hidden;
    }
    ._scf_comp_row._scf_loading::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 32px;
      height: 32px;
      margin: -16px 0 0 -16px;
      border: 3px solid rgba(255,255,255,.15);
      border-top-color: #fff;
      border-radius: 50%;
      animation: _scf_spin .7s linear infinite;
      z-index: 1;
    }
    @keyframes _scf_spin { to { transform: rotate(360deg); } }
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
      transform: translateX(-50%);
      text-shadow: 0 1px 4px rgba(0,0,0,.7);
      transition: opacity .15s ease;
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
    ._scf_source_menu._scf_open ._scf_source_menu_btn {
      opacity: 1;
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
  `,$.appendChild(_)}function G3($){let _={active:!1},q=!1,J=0,Q=0,X=0,V=0,K=4;$.addEventListener("mousedown",(Z)=>{if(Z.button!==0)return;Z.preventDefault(),q=!0,_.active=!1,J=Z.clientX,Q=Z.clientY,X=$.scrollLeft,V=$.scrollTop});function Y(Z){if(!q)return;if(Z.buttons===0){U();return}let W=Z.clientX-J,H=Z.clientY-Q;if(!_.active)if(Math.abs(W)>K||Math.abs(H)>K)_.active=!0,$.classList.add("_scf_dragging");else return;$.scrollLeft=X-W,$.scrollTop=V-H}function U(){if(q)q=!1,_.active=!1,$.classList.remove("_scf_dragging")}return window.addEventListener("mousemove",Y),window.addEventListener("mouseup",U),{drag:_,onDragMove:Y,onDragEnd:U}}function H3($){let _=0,q=0;for(let J of $){let Q="naturalWidth"in J?J.naturalWidth:J.width,X="naturalHeight"in J?J.naturalHeight:J.height;if(!Q||!X)continue;_=Math.max(_,Q),q=Math.max(q,X)}return _&&q?`${_} / ${q}`:null}function e4($){return H3($)}function $5($){let _=$.match(/^((?:https?:)?\/\/i\.hdbits\.org\/[^/?#]+)\.(png|jpe?g|webp)([?#].*)?$/i);if(!_)return null;let q=_[2].toLowerCase(),J=q==="png"?"jpg":q==="jpg"||q==="jpeg"?"webp":null;return J?`${_[1]}.${J}${_[3]??""}`:null}function U3($,_){$.addEventListener("error",()=>{let q=$5($.currentSrc||$.src),J=($.dataset.hdbFallbackTried||"").split(",").filter(Boolean);if(!q||J.includes(q)){_?.();return}if($.dataset.hdbFallbackTried=[...J,q].join(","),$.src=q,$.classList.contains("_scf_comp_img")&&R0())m()})}function W3($,_,q,J,Q,X){let V=document.createElement("div");V.className="_scf_comp_row _scf_loading",V.dataset.col="0";let K=document.createElement("img");K.className="_scf_comp_sizer",U3(K,()=>V.classList.remove("_scf_loading"));let Y=e4($);if(Y)V.style.aspectRatio=Y;if(X){if(K.dataset.src=$[0].full,!Y)V.style.aspectRatio="16 / 9"}else K.addEventListener("load",()=>V.classList.remove("_scf_loading"),{once:!0}),K.src=$[0].full;V.appendChild(K);let U=new Map,Z=(H)=>{if(!H.naturalWidth||!H.naturalHeight)return;U.set(H,{naturalWidth:H.naturalWidth,naturalHeight:H.naturalHeight});let G=H3(U.values());if(G)V.style.aspectRatio=G},W=[];for(let H=0;H<_;H++){if(!$[H])break;let G=document.createElement("div");G.className="_scf_comp_cell";let j=document.createElement("img");j.className="_scf_comp_img",U3(j);let k=$[H].full;if(!X&&H===0)j.addEventListener("load",()=>Z(j),{once:!0}),j.src=k;else j.dataset.src=k;if(j.style.visibility=H===0?"visible":"hidden",j.src)F0(j);G.appendChild(j),V.appendChild(G),W.push(j)}return V.addEventListener("mousemove",(H)=>{if(q.active||!i0())return;let G=Q(H),j=parseInt(V.dataset.col,10);if(G!==j)J(G)}),{rowDiv:V,sizer:K,imgs:W,adjustRowAR:Z}}function n2($,_,q,J){if(!$.dataset.src)return;let Q=$.dataset.src;delete $.dataset.src,$.addEventListener("load",()=>J($),{once:!0}),$.src=Q,F0($,{brightness:q.colBrightness[_],contrast:q.colContrast[_],gammaCheck:q.colGammaCheck[_]})}function g2($,_){if($.loaded)return;$.loaded=!0;let{sizer:q,rowDiv:J,imgs:Q,adjustRowAR:X}=$,V=_.currentCol||0;if(q.dataset.src){let K=Q[V]?.dataset.src||Q[V]?.src||q.dataset.src;delete q.dataset.src,q.addEventListener("load",()=>J.classList.remove("_scf_loading"),{once:!0}),q.src=K}if(Q[V])n2(Q[V],V,_,X);J3($,_)}function z3($,_,q){let J=$.imgs[q];if(!J)return;n2(J,q,_,$.adjustRowAR)}function F3($,_){if(!$.loaded)g2($,_);let{imgs:q,adjustRowAR:J}=$;for(let Q=0;Q<q.length;Q++)n2(q[Q],Q,_,J)}var N3=200,M3=48;function _5($){let _=$.rowWidth||1,q=$.rowHeight||1,J=$.viewportWidth,Q=$.viewportHeight,X=Math.max(0,$.rowLeft+_-J),V=Math.max(0,$.contentHeight-Q),K;if(q<=Q)K=$.rowTop+q/2-Q/2;else K=w($.rowTop+$.fy*q-Q/2,$.rowTop,$.rowTop+q-Q);return{scrollLeft:w($.rowLeft+$.fx*_-J/2,0,X),scrollTop:w(K,0,V)}}function x3($,_,q){let J=document.createElement("div");J.className="_scf_nav_map";let Q=document.createElement("img");Q.draggable=!1,Q.alt="",Q.style.filter="none",J.appendChild(Q);let X=document.createElement("div");X.className="_scf_nav_map_rect",J.appendChild(X),f().appendChild(J);function V(){if(!$.classList.contains("_scf_zoomed")||!K0){J.style.display="none",J.style.opacity="0",J.style.pointerEvents="none";return}let j=_[q.currentRow];if(!j)return;let k=j.imgs[q.currentCol],R=k&&(k.src||k.dataset.src);if(R&&Q.src!==R)Q.src=R;Q.style.objectFit=y?"cover":"contain";let I=j.rowDiv,A=I.offsetWidth||1,C=I.offsetHeight||1,T=Math.min(N3/A,N3/C);J.style.width=Math.max(Math.round(A*T),M3)+"px",J.style.height=Math.max(Math.round(C*T),M3)+"px";let l=I.offsetTop,Q0=$.scrollLeft/A,t=Math.max(0,$.scrollTop-l)/C,r=Math.min($.clientWidth/A,1),F=Math.min($.clientHeight/C,1);X.style.left=Q0*100+"%",X.style.top=t*100+"%",X.style.width=r*100+"%",X.style.height=F*100+"%",J.style.display="block",J.style.opacity="1",J.style.pointerEvents="auto"}let K=!1,Y=null;function U(G){let j=J.getBoundingClientRect();if(!j.width||!j.height)return;let k=Math.max(0,Math.min(1,(G.clientX-j.left)/j.width)),R=Math.max(0,Math.min(1,(G.clientY-j.top)/j.height)),I=Y??q.currentRow,A=_[I];if(!A)return;let C=A.rowDiv,T=_5({fx:k,fy:R,rowLeft:C.offsetLeft,rowTop:C.offsetTop,rowWidth:C.offsetWidth,rowHeight:C.offsetHeight,contentHeight:$.scrollHeight,viewportWidth:$.clientWidth,viewportHeight:$.clientHeight});if(_2(q),q.currentRow=I,$.scrollLeft=T.scrollLeft,$.scrollTop=T.scrollTop,q.updateRowNav)q.updateRowNav(I);q.updateLabel?.()}J.addEventListener("mousedown",(G)=>{if(G.button!==0)return;G.preventDefault(),G.stopPropagation(),K=!0,Y=q.currentRow,J.style.cursor="grabbing",U(G)});function Z(G){if(!K)return;U(G)}function W(){if(!K)return;K=!1,Y=null,J.style.cursor=""}window.addEventListener("mousemove",Z),window.addEventListener("mouseup",W);function H(){J.remove(),window.removeEventListener("mousemove",Z),window.removeEventListener("mouseup",W)}return{navMapImg:Q,updateNavMap:V,cleanup:H}}function O3($,_){let q=null;if($.length>1){q=document.createElement("div"),q.className="_scf_row_nav";for(let X=0;X<$.length;X++){let V=document.createElement("div");V.className="_scf_row_nav_item"+(X===0?" _scf_active":""),V.textContent=String(X+1),V.addEventListener("click",()=>_.setRow(X)),q.appendChild(V)}f().appendChild(q)}function J(X){if(!q)return;let V=q.children;for(let K=0;K<V.length;K++)V[K].classList.toggle("_scf_active",K===X);if(V[X])V[X].scrollIntoView({block:"nearest"})}function Q(){if(q)q.remove()}return{rowNavEl:q,updateRowNav:J,cleanup:Q}}function f3($){return Array.from({length:Math.max(0,$)},(_,q)=>q)}function L3($,_,q,J){if(_<0||_>=J)return $;let Q=$.filter((X,V)=>X>=0&&X<J&&$.indexOf(X)===V);if(q)return Q.includes(_)?Q:[...Q,_].sort((X,V)=>X-V);if(!Q.includes(_)||Q.length<=1)return Q;return Q.filter((X)=>X!==_)}function B3($,_,q){if(!q.length)return 0;let J=Math.max(1,_),Q=Math.max(0,Math.min(0.9999,$/J));return q[Math.floor(Q*q.length)]}function P3($,_){return $.indexOf(_)}function k3($,_){return $+" / "+_}function Q2($,_){let q=$.addSlot(()=>Y(!1)),J=document.createElement("div");J.className=_.containerClass;let Q=document.createElement("button");Q.type="button",Q.className=_.buttonClass,Q.title=_.title,Q.setAttribute("aria-label",_.ariaLabel),Q.setAttribute("aria-expanded","false");let X=document.createElement("span");X.className=_.iconClass,X.setAttribute("aria-hidden","true"),Q.appendChild(X);let V=document.createElement("div");V.className=_.panelClass,V.hidden=!0,J.append(Q,V),$.toolbarEl.appendChild(J);let K=!1;function Y(W){if(J.classList.toggle("_scf_open",W),V.hidden=!W,Q.setAttribute("aria-expanded",String(W)),W)q.notifyOpen()}Q.addEventListener("pointerdown",()=>{K=!0}),Q.addEventListener("click",()=>{if(Y(V.hidden),K)Q.blur();K=!1});let U=(W)=>{if(!$.toolbarEl.contains(W.target))Y(!1)};document.addEventListener("mousedown",U);function Z(){document.removeEventListener("mousedown",U)}return{container:J,button:Q,iconEl:X,panel:V,setOpen:Y,cleanup:Z}}function q5($,_){return $.sourceNames?.[_]?.trim()||"Source "+(_+1)}function I3($,_){let{button:q,panel:J,cleanup:Q}=Q2(_,{containerClass:"_scf_source_menu",buttonClass:"_scf_source_menu_btn",iconClass:"_scf_source_menu_icon",panelClass:"_scf_source_menu_panel",title:"Sources",ariaLabel:"Choose visible sources"}),X=document.createElement("span");X.className="_scf_source_menu_count",q.append(X);function V(){X.textContent=k3($.visibleCols.length,$.numCols),J.replaceChildren();for(let K=0;K<$.numCols;K++){let Y=document.createElement("label");Y.className="_scf_source_option",Y.classList.toggle("_scf_active",K===$.currentCol);let U=document.createElement("input");U.type="checkbox",U.checked=$.visibleCols.includes(K),U.disabled=U.checked&&$.visibleCols.length<=1,U.addEventListener("change",()=>{$.setSourceVisible(K,U.checked)});let Z=document.createElement("span");Z.className="_scf_source_option_idx",Z.textContent=String(K+1);let W=document.createElement("span");W.className="_scf_source_option_name",W.textContent=q5($,K),Y.append(U,Z,W),J.appendChild(Y)}}return V(),{updateSourceMenu:V,cleanup:Q}}function A3($){let{container:_,button:q,panel:J,setOpen:Q,cleanup:X}=Q2($,{containerClass:"_scf_fill_canvas_toggle",buttonClass:"_scf_fill_canvas_btn",iconClass:"_scf_fill_canvas_icon",panelClass:"_scf_fill_canvas_panel",title:"Canvas (C)",ariaLabel:"Choose canvas mode"});function V(Y){let U=y!==Y;if(U)$2(),W0();if(K(),Q(!1),U)L(Y?"Canvas: Fill":"Canvas: Fit")}function K(){q.classList.toggle("_scf_active",y),J.replaceChildren();let Y=[{label:"Fill",cover:!0},{label:"Fit",cover:!1}];for(let U of Y){let Z=document.createElement("label");Z.className="_scf_fill_canvas_option",Z.classList.toggle("_scf_active",y===U.cover);let W=document.createElement("input");W.type="radio",W.name="_scf_fill_canvas_mode",W.checked=y===U.cover,W.addEventListener("change",()=>V(U.cover));let H=document.createElement("span");H.className="_scf_fill_canvas_option_name",H.textContent=U.label,Z.append(W,H),J.appendChild(Z)}}return K(),{fillCanvasBtnEl:_,updateFillCanvasBtn:K,cleanup:X}}function S3(){let $=document.createElement("div");$.className="_scf_toolbar";let _=[];function q(X){return _.push(X),{notifyOpen(){for(let V of _)if(V!==X)V()}}}let J=(X)=>X.stopPropagation();for(let X of["click","mousedown","mousemove","pointermove","wheel"])$.addEventListener(X,J);f().appendChild($);function Q(){$.remove()}return{toolbarEl:$,addSlot:q,cleanup:Q}}var Q5=[],J5={grid:{collapsed:"▦",expanded:"▦"},triangles:{collapsed:"▶",expanded:"▼"},text:{collapsed:"Show grid",expanded:"Hide grid"}};function X5($){let _=x1(),q=_==="custom"?{collapsed:O1(),expanded:f1()}:J5[_];return $?q.expanded:q.collapsed}function w0(){for(let{toggle:$,gridEl:_}of Q5)$.textContent=X5(_.classList.contains("_scf_open"))}var C3=!1;function d2($){C3=$}function m2(){return C3}var V5=[{label:"Viewer Defaults",items:[{type:"radio",key:"defaultZoomMode",label:"Zoom mode",tooltip:"Initial zoom when the viewer opens. 1:1 shows source pixels at native size; Fit scales the row to the viewport.",options:[{label:"Fit",value:"fit"},{label:"1:1",value:"1:1"}]},{type:"radio",key:"zoomPercentBase",label:"Zoom 100%",tooltip:"What the zoom HUD's percentage refers to. Original = source's native pixels; Fit = scaled-to-viewport.",options:[{label:"Original",value:"original"},{label:"Fit",value:"fit"}],onSave:()=>{if(N.length)L(a())}},{type:"radio",key:"oneToOnePixels",label:"1:1 pixels",tooltip:"What a source pixel maps to at 1:1 on a HiDPI / Retina screen. Device = one physical screen pixel (a 4K shot fills a 1080p@2x panel, pixel-perfect); Logical = one CSS pixel (the browser's 100%, ~2x magnified on Retina). No effect on standard displays.",options:[{label:"Logical",value:"logical"},{label:"Device",value:"device"}],onSave:()=>{if(v0(),N.length)L(a())}},{type:"radio",key:"verboseZoom",label:"Zoom info",tooltip:"Brief shows a single-line percentage toast. Verbose adds pixel counts and viewport callouts.",options:[{label:"Brief",value:!1},{label:"Verbose",value:!0}],onSave:()=>{if(N.length)L(a())}},{type:"radio",key:"fillCanvasDefault",label:"Canvas",tooltip:"Whether each row canvas fills the viewport (cropping) or fits inside it (letterbox) at open. Toggle later with C.",options:[{label:"Fill",value:!0},{label:"Fit",value:!1}]},{type:"toggle",key:"navMapDefault",label:"Minimap",tooltip:"Whether the thumbnail navigation minimap is on at viewer open. Toggle later with M."},{type:"toggle",key:"bgLoadDefault",label:"Background loading",tooltip:"When on, all rows download immediately at open instead of waiting for lazy-load. Toggle later with B."},{type:"toggle",key:"mouseSwitch",label:"Mouse switch",tooltip:"When on, moving the cursor across a row switches the visible source by horizontal position."},{type:"radio",key:"closeBtnPosition",label:"Close button",tooltip:"Where the viewer's close button sits. Auto picks left on macOS and right elsewhere. Hide removes the button — close via Esc.",options:[{label:"Auto",value:"auto"},{label:"Left",value:"left"},{label:"Right",value:"right"},{label:"Hide",value:"hide"}],onSave:()=>{for(let $ of N)$.updateCloseBtn?.()}},{type:"radio",key:"uiChromeMode",label:"Chrome",tooltip:"Viewer UI visibility. Always = source titles, row nav and buttons stay shown. Default = titles + row nav sit dimmed (full on action), buttons auto-hide. Auto-hide = titles + row nav show only on action, buttons show only when the cursor is near them.",options:[{label:"Always",value:"always"},{label:"Default",value:"default"},{label:"Auto-hide",value:"autohide"}],onSave:()=>{for(let $ of N)$.syncAutoHide?.()}},{type:"slider",key:"uiHideDelay",label:"UI hide delay",tooltip:"How long the viewer chrome stays at full before settling back (dimmed or hidden, per the Chrome mode) after the last activity. Ignored in Always mode.",min:200,max:5000,step:100,format:($)=>($/1000).toFixed(1)+"s",onSave:()=>{for(let $ of N)$.syncAutoHide?.()}},{type:"radio",key:"ptpGridImageSize",label:"PTP image grid",tooltip:`Resolution for the inline image grid toggled beside PTP's "Show comparison" link. Thumbnail loads PTP's /t/ previews (light); Full loads the /i/ originals. Non-PTP-hosted images are shown as-is.`,options:[{label:"Thumbnail",value:"thumbnail"},{label:"Full",value:"full"}]},{type:"radio",key:"ptpGridClick",label:"PTP grid click",tooltip:"What clicking an image in the PTP grid does. Viewer opens the yacomp comparison viewer at that shot; New tab opens the full image in a new browser tab.",options:[{label:"Viewer",value:"viewer"},{label:"New tab",value:"tab"}]},{type:"radio",key:"hdbitsImageClick",label:"HDBits image click",tooltip:"What clicking a comparison image on HDBits does. Viewer opens the yacomp comparison viewer at that shot; Native keeps HDBits' default (open the full image).",options:[{label:"Viewer",value:"viewer"},{label:"Native",value:"native"}]},{type:"toggle",key:"hdbitsManualAllThreads",label:"Custom comparison everywhere",tooltip:"Show the HDBits forum custom-comparison builder in every thread. Off (default): only in Comparisons-forum threads."},{type:"radio",key:"ptpGridToggleStyle",label:"PTP grid button",tooltip:`The fold toggle beside PTP's "Show comparison". ▦ is a single glyph; ▶ ▼ swaps between closed/open arrows; Text reads "Show grid"/"Hide grid"; Custom lets you type your own.`,options:[{label:"▦",value:"grid"},{label:"▶ ▼",value:"triangles"},{label:"Text",value:"text"},{label:"Custom",value:"custom"}],onSave:()=>w0()},{type:"text",key:"ptpGridToggleCollapsed",label:"Custom (closed)",tooltip:"Used with the Custom style: the toggle's label while the grid is folded shut.",placeholder:"▦",visibleWhen:()=>h().ptpGridToggleStyle==="custom",onSave:()=>w0()},{type:"text",key:"ptpGridToggleExpanded",label:"Custom (open)",tooltip:"Used with the Custom style: the toggle's label while the grid is open.",placeholder:"▦",visibleWhen:()=>h().ptpGridToggleStyle==="custom",onSave:()=>w0()}]},{label:"Adjustments",items:[{type:"slider",key:"bcStep",label:"Brightness step",tooltip:"Increment applied per [ ] and { } press. 5% means each step shifts brightness or contrast by 0.05.",min:0.01,max:0.25,step:0.01,format:($)=>Math.round($*100)+"%"},{type:"slider",key:"toastDuration",label:"Toast duration",tooltip:"How long a HUD toast stays visible before fading out.",min:500,max:1e4,step:100,format:($)=>($/1000).toFixed(1)+"s"},{type:"slider",key:"zoomScaleFactor",label:"Zoom scale factor",tooltip:"Multiplier applied per + / − press. 1.25× means each step grows or shrinks the image by 25%.",min:1.05,max:2,step:0.05,format:($)=>$.toFixed(2)+"x"},{type:"slider",key:"lazyLoadMargin",label:"Lazy load margin",tooltip:"How far outside the visible area, in CSS pixels, deferred rows start downloading. Not relative to image size — zoom level changes how many rows fit in the margin.",min:0,max:2000,step:50,format:($)=>$+"px"}]}],K5="Per-site toggle. Disabling stops yacomp from injecting on that site without uninstalling.",j5="Visual filters reachable via F / Shift+F. Uncheck to skip; drag enabled rows to reorder.",Y5="Export all settings to a JSON file, or import one to restore them. Importing replaces every current setting.",Z5="Click a field, then press a key (modifiers included) or pick a mouse button. Every action needs a main shortcut; the extra is optional (× clears it). Esc cancels capture; a duplicate binding is rejected.",G5="Gamma-mismatch presets reachable via G / Shift+G. Uncheck to skip; drag enabled rows to reorder.",p=null,X2=!1,U5=new Set(["ptpGridImageSize","ptpGridClick","hdbitsImageClick","hdbitsManualAllThreads","ptpGridToggleStyle","ptpGridToggleCollapsed","ptpGridToggleExpanded"]);function u3(){X2=!0}var x0=null;function T3($){let _=document.createElement("button");return _.type="button",_.className="_scf_settings_help",_.textContent="?",_.setAttribute("aria-label","More info"),_.tabIndex=0,_.addEventListener("mouseenter",()=>x0?.show(_,$)),_.addEventListener("mouseleave",()=>x0?.hide()),_.addEventListener("focus",()=>x0?.show(_,$)),_.addEventListener("blur",()=>x0?.hide()),_.addEventListener("click",(q)=>q.preventDefault()),_}function M0($,_){let q=document.createElement("div");if(q.className="_scf_settings_group_label",q.textContent=$,_)q.appendChild(T3(_));return q}function K2($,_){let q=document.createElement("span");if(q.className="_scf_settings_label",q.textContent=$,_)q.appendChild(T3(_));return q}function H5($,_){let q=document.createElement("div");q.className="_scf_settings_row";let J=K2($.label,$.tooltip),Q=document.createElement("div");Q.className="_scf_settings_radios";let X=[];for(let K of $.options){let Y=document.createElement("button");Y.type="button",Y.className="_scf_settings_radio",Y.textContent=K.label,Y.addEventListener("click",()=>{g({[$.key]:K.value});for(let U of _)U();$.onSave?.()}),X.push(Y),Q.appendChild(Y)}function V(){let K=h()[$.key];for(let Y=0;Y<$.options.length;Y++)X[Y].classList.toggle("_scf_selected",$.options[Y].value===K)}return _.push(V),q.append(J,Q),q}function W5($,_){let q=document.createElement("div");q.className="_scf_settings_row";let J=K2($.label,$.tooltip),Q=document.createElement("button");Q.type="button",Q.className="_scf_settings_toggle",Q.addEventListener("click",()=>{g({[$.key]:!h()[$.key]}),X(),$.onSave?.()});function X(){Q.classList.toggle("_scf_on",!!h()[$.key])}return _.push(X),q.append(J,Q),q}function z5($,_){let q=document.createElement("div");q.className="_scf_settings_row";let J=K2($.label,$.tooltip),Q=document.createElement("div");Q.className="_scf_settings_slider_row";let X=document.createElement("input");X.type="range",X.className="_scf_settings_range",X.min=String($.min),X.max=String($.max),X.step=String($.step);let V=document.createElement("span");V.className="_scf_settings_value",X.addEventListener("input",()=>{let Y=parseFloat(X.value);g({[$.key]:Y}),V.textContent=$.format(Y),$.onSave?.()});function K(){let Y=h()[$.key];X.value=String(Y),V.textContent=$.format(Y)}return _.push(K),Q.append(X,V),q.append(J,Q),q}function F5($,_){let q=document.createElement("div");q.className="_scf_settings_row";let J=K2($.label,$.tooltip),Q=document.createElement("input");if(Q.type="text",Q.className="_scf_settings_text",Q.maxLength=$.maxLength??32,$.placeholder)Q.placeholder=$.placeholder;Q.addEventListener("input",()=>{g({[$.key]:Q.value}),$.onSave?.()});function X(){if($.visibleWhen)q.style.display=$.visibleWhen()?"":"none";Q.value=String(h()[$.key]??"")}return _.push(X),q.append(J,Q),q}var N5={solar1:"Solar x1",solar2:"Solar x2",residual:"Residual",luma:"Luma",chroma:"Chroma"},M5={"srgb-bt1886":"0.92","aeqt-0p88":"0.88","legacy-mac":"0.82"};function x5($){let _=document.createElement("div");_.className="_scf_settings_chip_grid";let q=[];for(let Q of p0){let X=document.createElement("button");X.type="button",X.className="_scf_settings_chip",X.textContent=Q1[Q],X.addEventListener("click",()=>{let V=h().enabledSites;g({enabledSites:{...V,[Q]:!V[Q]}}),J()}),q.push({key:Q,btn:X}),_.appendChild(X)}function J(){let Q=h().enabledSites;for(let{key:X,btn:V}of q)V.classList.toggle("_scf_on",!!Q[X])}return $.push(J),_}function E3($,_,q,J){let Q=document.createElement("div");Q.className="_scf_settings_ordered_list";let X=-1;function V(Z,W,H){if(Z===W)return;let G=[...h()[q]],[j]=G.splice(Z,1),k=W>Z?W-1:W;if(!H)k++;G.splice(k,0,j),g({[q]:G}),U()}function K(Z,W,H){let G=document.createElement("div");G.className="_scf_settings_ordered_item _scf_enabled",G.draggable=!0,G.addEventListener("dragstart",(I)=>{X=H,G.classList.add("_scf_dragging"),I.dataTransfer.effectAllowed="move"}),G.addEventListener("dragover",(I)=>{I.preventDefault(),I.dataTransfer.dropEffect="move";let A=G.getBoundingClientRect(),C=I.clientY<A.top+A.height/2;G.classList.toggle("_scf_drag_above",C),G.classList.toggle("_scf_drag_below",!C)}),G.addEventListener("dragleave",()=>{G.classList.remove("_scf_drag_above","_scf_drag_below")}),G.addEventListener("drop",(I)=>{I.preventDefault(),G.classList.remove("_scf_drag_above","_scf_drag_below");let A=G.getBoundingClientRect();V(X,H,I.clientY<A.top+A.height/2)}),G.addEventListener("dragend",()=>{G.classList.remove("_scf_dragging"),Q.querySelectorAll("._scf_drag_above, ._scf_drag_below").forEach((I)=>{I.classList.remove("_scf_drag_above","_scf_drag_below")}),X=-1});let j=document.createElement("input");j.type="checkbox",j.checked=!0,j.className="_scf_settings_ordered_check",j.addEventListener("change",(I)=>{I.stopPropagation();let A=[...h()[q]],C=A.indexOf(Z);if(C!==-1)A.splice(C,1);g({[q]:A}),U()});let k=document.createElement("span");k.className="_scf_settings_ordered_handle",k.textContent="⡇";let R=document.createElement("span");return R.className="_scf_settings_ordered_label",R.textContent=W,G.append(j,k,R),G}function Y(Z,W){let H=document.createElement("div");H.className="_scf_settings_ordered_item";let G=document.createElement("input");G.type="checkbox",G.checked=!1,G.className="_scf_settings_ordered_check",G.addEventListener("change",()=>{let R=[...h()[q]];R.push(Z),g({[q]:R}),U()});let j=document.createElement("span");j.className="_scf_settings_ordered_handle";let k=document.createElement("span");return k.className="_scf_settings_ordered_label",k.textContent=W,H.append(G,j,k),H}function U(){Q.replaceChildren();let Z=h()[q],W=new Set(Z),H=$.filter((G)=>!W.has(G));for(let G=0;G<Z.length;G++)Q.appendChild(K(Z[G],_[Z[G]],G));if(Z.length>0&&H.length>0){let G=document.createElement("div");G.className="_scf_settings_ordered_sep",Q.appendChild(G)}for(let G of H)Q.appendChild(Y(G,_[G]))}return J.push(U),Q}var V2=null;function O5($,_,q,J,Q){V2?.(),d2(!0),_.classList.add("_scf_capturing"),_.textContent="Press a key…";let X=document.createElement("div");X.className="_scf_shortcut_chips";let V=[{g:"click",label:"Click"},{g:"dblclick",label:"2×"},{g:"middle",label:"Mid"},{g:"back",label:"Back"},{g:"forward",label:"Fwd"}];for(let{g:W,label:H}of V){let G=document.createElement("button");G.type="button",G.className="_scf_shortcut_chip",G.textContent=H,G.addEventListener("click",(j)=>{j.preventDefault(),j.stopPropagation(),K({t:"mouse",g:W})}),X.appendChild(G)}$.appendChild(X);function K(W){if(A0(W)){Z(),L("Reserved for viewer open / source number jump"),Q();return}let H=k1(W,q,J);if(Z(),H){L("Already bound to "+o2(H).label),Q();return}let G=v(q);if(f2(q,J==="main"?{main:W,extra:G.extra}:{main:G.main,extra:W}),Q(),q==="viewer.close")for(let j of N)j.updateCloseBtn?.()}function Y(W){if(W.preventDefault(),W.stopImmediatePropagation(),W.key==="Escape"){Z(),Q();return}if(/^(?:Shift|Control|Alt|Meta)(?:Left|Right)$/.test(W.code))return;K(r2(W))}function U(W){if(!$.contains(W.target))Z(),Q()}function Z(){V2=null,d2(!1),_.classList.remove("_scf_capturing"),X.remove(),window.removeEventListener("keydown",Y,!0),f().removeEventListener("mousedown",U,!0)}V2=()=>{Z(),Q()},window.addEventListener("keydown",Y,!0),setTimeout(()=>f().addEventListener("mousedown",U,!0),0)}function R3($,_,q,J){let Q=document.createElement("div");Q.className="_scf_shortcut_field";let X=document.createElement("button");X.type="button",X.className="_scf_shortcut_btn";let V=_==="extra",K=document.createElement("button");K.type="button",K.className="_scf_shortcut_clear",K.textContent="×",K.title="Clear",K.addEventListener("click",(U)=>{U.stopPropagation();let Z=v($);f2($,{main:Z.main,extra:null}),q()});function Y(){let U=v($),Z=_==="main"?U.main:U.extra;if(X.textContent=d0(Z),X.classList.toggle("_scf_shortcut_empty",Z==null),V)K.style.display=Z?"":"none"}if(J.push(Y),Y(),X.addEventListener("click",()=>O5(Q,X,$,_,q)),Q.appendChild(X),V)Q.appendChild(K);return Q}var f5=["Zoom","Navigate","Display","Adjust","Viewer"];function L5($){let _=document.createElement("div");_.className="_scf_shortcuts";let q=[],J=()=>{for(let V of q)V()};for(let V of f5){let K=document.createElement("div");K.className="_scf_shortcuts_subhead",K.textContent=V,_.appendChild(K);for(let Y of i.filter((U)=>U.group===V)){let U=document.createElement("div");U.className="_scf_shortcut_row";let Z=document.createElement("span");Z.className="_scf_settings_label",Z.textContent=Y.label;let W=document.createElement("div");W.className="_scf_shortcut_fields",W.append(R3(Y.id,"main",J,q),R3(Y.id,"extra",J,q)),U.append(Z,W),_.appendChild(U)}}let Q=document.createElement("div");Q.className="_scf_shortcut_reset_row";let X=document.createElement("button");return X.type="button",X.className="_scf_settings_reset",X.textContent="Reset shortcuts",X.addEventListener("click",()=>{P1(),J();for(let V of N)V.updateCloseBtn?.()}),Q.appendChild(X),_.appendChild(Q),$.push(J),_}function B5($,_){let q=new Blob([_],{type:"application/json"}),J=URL.createObjectURL(q),Q=document.createElement("a");Q.href=J,Q.download=$,Q.style.display="none",document.body.appendChild(Q),Q.click(),Q.remove(),setTimeout(()=>URL.revokeObjectURL(J),1000)}function P5($){for(let _ of $)_();for(let _ of N)_.updateCloseBtn?.(),_.syncAutoHide?.(),_.updateFillCanvasBtn?.(),_.updateSourceMenu?.();w0()}function k5($){let _=document.createElement("div");_.className="_scf_settings_backup";let q=document.createElement("button");q.type="button",q.className="_scf_settings_reset",q.textContent="Export",q.addEventListener("click",()=>B5("yacomp-config.json",C1()));let J=document.createElement("button");J.type="button",J.className="_scf_settings_reset",J.textContent="Import";let Q=document.createElement("input");return Q.type="file",Q.accept="application/json,.json",Q.style.display="none",Q.addEventListener("change",()=>{let X=Q.files?.[0];if(Q.value="",!X)return;X.text().then((V)=>{if(E1(V))P5($),L("Settings imported");else L("Couldn't import — not a valid config file")})}),J.addEventListener("click",()=>Q.click()),_.append(q,J,Q),_}function O0(){if(!p)return!1;return p.remove(),p=null,x0=null,V2?.(),!0}var D3=6,J2=8;function I5($,_){let q=_.getBoundingClientRect(),J=$.getBoundingClientRect(),Q=q.left+q.width/2-J.width/2,X=q.bottom+D3;if(X+J.height>window.innerHeight-J2)X=q.top-J.height-D3;Q=Math.max(J2,Math.min(window.innerWidth-J.width-J2,Q)),$.style.left=Q+"px",$.style.top=Math.max(J2,X)+"px"}function j2(){if(p){O0();return}Y0(),p=document.createElement("div"),p.className="_scf_settings_overlay",p.addEventListener("mousedown",(Z)=>{if(Z.target===p)O0()});let $=document.createElement("div");$.className="_scf_settings_panel";let _=document.createElement("div");_.className="_scf_settings_tooltip",_.style.display="none",x0={show:(Z,W)=>{_.textContent=W,_.style.display="block",_.style.left="0",_.style.top="0",I5(_,Z)},hide:()=>{_.style.display="none"}};let q=document.createElement("div");q.className="_scf_settings_header";let J=document.createElement("span");J.className="_scf_settings_title",J.textContent=X2?"yacomp-web Settings":"yacomp Settings";let Q=document.createElement("button");Q.type="button",Q.className="_scf_settings_close",Q.textContent="×",Q.addEventListener("click",O0),q.append(J,Q);let X=document.createElement("div");X.className="_scf_settings_body";let V=[];for(let Z of V5){X.appendChild(M0(Z.label,Z.tooltip));for(let W of Z.items){if(X2&&U5.has(W.key))continue;let H;switch(W.type){case"radio":H=H5(W,V);break;case"toggle":H=W5(W,V);break;case"slider":H=z5(W,V);break;case"text":H=F5(W,V);break}X.appendChild(H)}}if(!X2)X.appendChild(M0("Sites",K5)),X.appendChild(x5(V));X.appendChild(M0("Filter Cycle",j5)),X.appendChild(E3(s0,N5,"filterCycle",V)),X.appendChild(M0("Gamma Check Cycle",G5)),X.appendChild(E3(c0,M5,"gammaCycle",V)),X.appendChild(M0("Shortcuts",Z5)),X.appendChild(L5(V)),X.appendChild(M0("Backup",Y5)),X.appendChild(k5(V));let K=document.createElement("div");K.className="_scf_settings_footer";let Y=document.createElement("button");Y.type="button",Y.className="_scf_settings_reset",Y.textContent="Reset Defaults",Y.addEventListener("click",()=>{S1();for(let Z of N)Z.updateCloseBtn?.();for(let Z of V)Z()});let U=document.createElement("button");U.type="button",U.className="_scf_settings_done",U.textContent="Done",U.addEventListener("click",O0),K.append(Y,U),$.append(q,X,K),p.appendChild($),p.appendChild(_),f().appendChild(p);for(let Z of V)Z()}function b3($){let _=document.createElement("button");_.type="button",_.className="_scf_settings_btn",_.title="Settings",_.setAttribute("aria-label","Open yacomp settings");let q=document.createElement("span");q.className="_scf_settings_btn_icon",q.setAttribute("aria-hidden","true");let J=document.createElementNS("http://www.w3.org/2000/svg","svg");J.setAttribute("viewBox","0 0 24 24"),J.setAttribute("fill","none"),J.setAttribute("stroke","currentColor"),J.setAttribute("stroke-width","2"),J.setAttribute("stroke-linecap","round"),J.setAttribute("stroke-linejoin","round");let Q=document.createElementNS("http://www.w3.org/2000/svg","circle");Q.setAttribute("cx","12"),Q.setAttribute("cy","12"),Q.setAttribute("r","3"),J.appendChild(Q);let X=document.createElementNS("http://www.w3.org/2000/svg","path");return X.setAttribute("d","M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.321-1.915"),J.appendChild(X),q.appendChild(J),_.appendChild(q),_.addEventListener("click",j2),$.toolbarEl.appendChild(_),{cleanup:()=>_.remove()}}var A5=[{title:"Navigation",rows:[{actions:["nav.colPrev"],desc:"Previous column"},{actions:["nav.colNext"],desc:"Next column"},{actions:["nav.rowPrev"],desc:"Previous row"},{actions:["nav.rowNext"],desc:"Next row"},{keys:["1 – 9"],desc:"Jump to Nth column"}]},{title:"Zoom",rows:[{actions:["zoom.out"],desc:"Zoom out"},{actions:["zoom.in"],desc:"Zoom in"},{actions:["zoom.fit"],desc:"Fit to width"},{actions:["zoom.oneToOne"],desc:"Actual size (1:1)"}]},{title:"Mouse",rows:[{keys:["Click image"],desc:"Open viewer from page image grid"},{keys:["Ctrl + Wheel"],desc:"Zoom at cursor on viewer image grid"},{actions:["viewer.close"],binding:"mouse",desc:"Close viewer from viewer image grid",note:"Only when assigned in Settings",hideIfEmpty:!0}]},{title:"Adjustments",rows:[{actions:["bright.down","bright.up"],desc:"Brightness",note:"Shift = contrast"},{actions:["adjust.resetSource"],desc:"Reset current source",note:"Shift = all"},{actions:["gamma.next"],desc:"Gamma mismatch check",note:"Shift = previous"}]},{title:"Toggles",rows:[{actions:["filter.next"],desc:"Cycle filter modes",note:"Shift = previous"},{actions:["display.canvas"],desc:"Canvas fill / fit"},{actions:["display.rowNav"],desc:"Row nav sidebar"},{actions:["display.minimap"],desc:"Minimap"},{actions:["display.bgLoad"],desc:"Background loading"}]},{title:"Other",rows:[{actions:["viewer.help"],desc:"Toggle this help"},{actions:["viewer.close"],binding:"key",desc:"Reset filters, then close viewer",hideIfEmpty:!0}]}],S5={"Shift + /":"?"};function y3($,_){return $==="all"||_.t===$}function h3($){let _=d0($);return S5[_]??_}function C5($){if($.keys)return $.keys;let _=[],q=$.binding??"all";for(let J of $.actions??[]){let Q=v(J);if(y3(q,Q.main))_.push(h3(Q.main));if(Q.extra&&y3(q,Q.extra))_.push(h3(Q.extra))}return _}var n0=null;function g0(){return n0!==null&&n0.isConnected}function f0(){n0?.remove(),n0=null}function E5(){if(g0())return;let $=document.createElement("div");$.className="_scf_help_overlay",$.addEventListener("mousedown",(q)=>{if(q.target===$)q.stopPropagation(),f0()});let _=document.createElement("div");_.className="_scf_help_panel",_.setAttribute("role","dialog"),_.setAttribute("aria-label","Keyboard shortcuts");for(let q of A5){let J=document.createElement("div");J.className="_scf_help_section",J.textContent=q.title,_.appendChild(J);for(let Q of q.rows){let X=C5(Q);if(Q.hideIfEmpty&&X.length===0)continue;let V=document.createElement("div");V.className="_scf_help_row";let K=document.createElement("span");K.className="_scf_help_keys";for(let U of X){let Z=document.createElement("kbd");Z.className="_scf_help_chip",Z.textContent=U,K.appendChild(Z)}let Y=document.createElement("span");if(Y.className="_scf_help_desc",Y.textContent=Q.desc,Q.note){let U=document.createElement("span");U.className="_scf_help_note",U.textContent=" · "+Q.note,Y.appendChild(U)}V.append(K,Y),_.appendChild(V)}}$.appendChild(_),f().appendChild($),n0=$}function Y2(){if(g0())f0();else E5()}function v3($,_){if(!Number.isFinite($)||_<=0)return 0;return Math.max(0,Math.min(_-1,Math.trunc($)))}function w3($){return{row:v3($.initialRow,$.rows.length),col:v3($.initialCol,$.numCols)}}function n3($){if($?.mode==="custom"&&Number.isFinite($.width)&&$.width>0)return{mode:"custom",width:Math.round($.width)};return{mode:"fit"}}function R5($,_){if($==="left"||$==="right"||$==="hide")return $;return _?"left":"right"}var D5=typeof navigator<"u"&&/Mac|iPhone|iPad/.test(navigator.userAgent);function u5(){if(B1())return"hide";return R5(N1(),D5)}function g3($){let _=document.createElement("button");_.type="button",_.title="Close (Esc)",_.setAttribute("aria-label","Close viewer");let q=document.createElement("span");q.className="_scf_close_icon",q.setAttribute("aria-hidden","true"),_.appendChild(q),_.addEventListener("click",(X)=>{X.stopPropagation(),$()}),_.addEventListener("mousedown",(X)=>X.stopPropagation());function J(){let X=u5();_.classList.add("_scf_close_btn"),_.classList.toggle("_scf_left",X==="left"),_.classList.toggle("_scf_right",X!=="left"),_.classList.toggle("_scf_hidden",X==="hide")}J(),f().appendChild(_);function Q(){_.remove()}return{closeBtnEl:_,updatePosition:J,cleanup:Q}}var L0="_scf_ui_autohidden",d3="_scf_ui_dimmed",T5="_scf_ui_force_hidden",Z2=100,b5=350;function m3($){let _=null,q=null,J=null,Q=new Map,X=[$.closeBtnEl,$.toolbarEl],V=()=>M1();function K(F,D){if(!F)return;if(F.classList.remove(L0,d3),D)F.classList.add(D)}function Y(){let F=V();return F==="always"?null:F==="default"?d3:L0}function U(){return V()==="always"?null:L0}function Z(){if(V()==="always")return;if(K($.labelEl,null),_)clearTimeout(_);if(_=setTimeout(()=>K($.labelEl,Y()),a0()),V()==="default")H()}function W(){if(!$.rowNavEl||V()==="always")return;if(K($.rowNavEl,null),q)clearTimeout(q);if(q=setTimeout(()=>K($.rowNavEl,Y()),a0()),V()==="default")H()}function H(){for(let F of X)K(F,null);if(J)clearTimeout(J);J=setTimeout(()=>{for(let F of X)K(F,L0)},a0())}function G(F){let D=Q.get(F);if(D)clearTimeout(D),Q.delete(F)}function j(F){G(F),K(F,null)}function k(F){if(F.classList.contains(L0)||Q.has(F))return;Q.set(F,setTimeout(()=>{Q.delete(F),K(F,L0)},b5))}function R(F,D,n){let E=F.getBoundingClientRect();if(E.width===0&&E.height===0)return!1;return D>=E.left-Z2&&D<=E.right+Z2&&n>=E.top-Z2&&n<=E.bottom+Z2}function I(F,D){for(let n of X)if(R(n,F,D))j(n);else k(n)}function A(){$.fillCanvasBtnEl.classList.toggle(T5,u==="1:1")}let C=(F)=>{let D=V();if(D==="always")return;if(Z(),W(),D==="autohide")I(F.clientX,F.clientY)},T=()=>W();$.compDiv.addEventListener("mousemove",C),$.compDiv.addEventListener("scroll",T,{passive:!0});let l=[];for(let F of X){let D=()=>{let E=V();if(E==="always")return;if(E==="default"){for(let o of X)K(o,null);if(J)clearTimeout(J)}else j(F)},n=()=>{let E=V();if(E==="always")return;if(E==="default")H();else k(F)};F.addEventListener("mouseenter",D),F.addEventListener("mouseleave",n),l.push(()=>{F.removeEventListener("mouseenter",D),F.removeEventListener("mouseleave",n)})}function Q0(){if(_)clearTimeout(_),_=null;if(q)clearTimeout(q),q=null;if(J)clearTimeout(J),J=null;for(let F of X)G(F)}function t(){if(Q0(),A(),K($.labelEl,Y()),K($.rowNavEl,Y()),V()==="default")H();else for(let F of X)K(F,U())}t();function r(){Q0(),$.compDiv.removeEventListener("mousemove",C),$.compDiv.removeEventListener("scroll",T);for(let F of l)F()}return{revealColumnNav:Z,revealRowNav:W,syncFillCanvasVisibility:A,resync:t,cleanup:r}}var y5=200;function h5($){if($.resetTimer)clearTimeout($.resetTimer);$.anchor=null,$.resetTimer=null}function v5($,_,q){if(!$.anchor)$.anchor=u2(_,q);if($.resetTimer)clearTimeout($.resetTimer);return $.resetTimer=setTimeout(()=>{$.anchor=null,$.resetTimer=null},y5),$.anchor}function w5($,_){if($.suppressRowSync)return;let q=$.compDiv.scrollTop+$.compDiv.clientHeight/2,J=0,Q=1/0;for(let X=0;X<$.allRowData.length;X++){let V=$.allRowData[X].rowDiv,K=V.offsetTop+V.offsetHeight/2,Y=Math.abs(K-q);if(Y<Q)Q=Y,J=X}if($.navTargetRow!=null){if(J!==$.navTargetRow)return;$.navTargetRow=null}if(J!==$.currentRow)$.currentRow=J,_(J),$.updateLabel?.()}function n5($,_,q){let J=$/2;return{top:Math.max(0,J-_/2),bottom:Math.max(0,J-q/2)}}function p2($,_,q){if(Y0(),T0(),!N.length)r1(Z1()),o1(G1());b0("fit"),y0(0);let J=w3($),Q=n3($.initialZoom);if(Q.mode==="custom")b0("custom"),y0(Q.width);let X=f(),V=X.getElementById("_scf_comp_label_");if(!V)V=document.createElement("div"),V.id="_scf_comp_label_",V.className="_scf_comp_label",X.appendChild(V);V.innerHTML="",V.classList.add("_scf_ui_autohidden");let K=document.createElement("div");K.className="_scf_comp";let Y={anchor:null,resetTimer:null},{drag:U,onDragMove:Z,onDragEnd:W}=G3(K);K.addEventListener("mousedown",()=>{j.navTargetRow=null}),p3(K,U),K.addEventListener("wheel",(z)=>{if(!z.ctrlKey){j.navTargetRow=null;return}z.preventDefault();let x=h2(),M=v5(Y,j,z);y0(y2(x,b2(x,z.deltaY<0?1:-1))),b0("custom"),j0(M?[M]:[]),L(a())},{passive:!1});let H=[],G=U1(),j={};j.visibleCols=f3($.numCols);let k=document.createElement("div");k.className="_scf_scroll_spacer";let R=document.createElement("div");R.className="_scf_scroll_spacer",K.appendChild(k);function I(z){return B3(z.clientX,window.innerWidth,j.visibleCols)}let A=null;function C(z){let x=$.rowNames?.[j.currentRow]??$.names??[];if(V.replaceChildren(),$.numCols>1)for(let S=0;S<j.visibleCols.length;S++){let X0=j.visibleCols[S],b=x[X0]??"Source "+(X0+1),k0=S+1+". "+b,I0=document.createElement("span");if(I0.textContent=k0,X0!==z)I0.style.opacity=".4";if(V.appendChild(I0),S<j.visibleCols.length-1)V.appendChild(document.createTextNode("  "))}let M=V.textContent||"";if(A!==null&&M!==A)j.revealColumnNav?.();A=M}function T(z){if(!j.visibleCols.includes(z))return;j.currentCol=z;for(let x of H){let{rowDiv:M,imgs:S,loaded:X0}=x;if(X0){let b=S[z];if(b&&!b.src&&b.dataset.src)z3(x,j,z)}if(S.forEach((b,k0)=>{b.style.visibility=k0===z?"visible":"hidden"}),X0){let b=S[z];if(b&&b.src&&!b.complete)M.classList.add("_scf_loading"),b.addEventListener("load",()=>M.classList.remove("_scf_loading"),{once:!0}),b.addEventListener("error",()=>M.classList.remove("_scf_loading"),{once:!0});else M.classList.remove("_scf_loading")}M.dataset.col=String(z)}if(C(z),j.revealColumnNav?.(),K.classList.contains("_scf_zoomed")){let x=H[j.currentRow||0];if(x){let M=x.imgs[z],S=M&&(M.src||M.dataset.src);if(S&&o.navMapImg&&o.navMapImg.src!==S)o.navMapImg.src=S}}j.updateSourceMenu?.(),z0()}for(let z=0;z<$.rows.length;z++){for(let M of $.rows[z])if((M.width==null||M.height==null)&&M.img?.naturalWidth&&M.img.naturalHeight)M.width=M.img.naturalWidth,M.height=M.img.naturalHeight;let x=W3($.rows[z],$.numCols,U,T,I,z>0&&z!==J.row);if(z===0||z===J.row)x.loaded=!0;K.appendChild(x.rowDiv),H.push(x)}K.appendChild(R);let l=new IntersectionObserver((z)=>{for(let x of z)if(x.isIntersecting){let M=H.find((S)=>S.rowDiv===x.target);if(M)g2(M,j),l.unobserve(x.target)}},{root:K,rootMargin:z1()+"px",threshold:0});for(let z=1;z<H.length;z++)l.observe(H[z].rowDiv);let Q0=!1;function t(){if(Q0||!G)return;for(let z=0;z<H.length;z++){let x=H[z];if(!x.loaded)l.unobserve(x.rowDiv);F3(x,j)}}let r=[],F=H[0].sizer;if(F.complete)r.push(setTimeout(t,200));else F.addEventListener("load",()=>r.push(setTimeout(t,200)),{once:!0}),r.push(setTimeout(t,3000));let D=_.style.display,n=q.style.display;j.compDiv=K,j.container=_,j.numCols=$.numCols,j.numRows=H.length,j.sourceNames=$.names,j.currentRow=J.row,j.currentCol=J.col,j.colBrightness=Array($.numCols).fill(1),j.colGammaCheck=Array($.numCols).fill(null),j.colContrast=Array($.numCols).fill(1),j.allRowData=H,j.bgLoadAll=()=>G,j.setBgLoadAll=(z)=>{G=z},j.triggerBgLoad=t,j.updateScrollSpacers=()=>{let z=H[0]?.rowDiv,x=H[H.length-1]?.rowDiv;if(!z||!x)return;let M=n5(K.clientHeight,z.offsetHeight,x.offsetHeight);k.style.height=M.top+"px",R.style.height=M.bottom+"px"},K.addEventListener("mousemove",(z)=>{if(U.active||!i0())return;let x=I(z);if(x!==j.currentCol)T(x)}),j.setColumn=(z)=>{if(z<0||z>=$.numCols)return;if(!j.visibleCols.includes(z))return;T(z),v0()},j.setSourceVisible=(z,x)=>{let M=j.visibleCols,S=L3(M,z,x,$.numCols);if(!(S.length!==M.length||S.some((k0,I0)=>k0!==M[I0]))){if(!x&&M.length<=1&&M.includes(z))L("At least one source must stay visible");j.updateSourceMenu?.();return}let b=Math.max(0,M.indexOf(z));if(j.visibleCols=S,!S.includes(j.currentCol))T(S[Math.min(b,S.length-1)]);else T(j.currentCol);L("Sources: "+S.length+" / "+$.numCols)};let E=O3(H,j);if(j.updateRowNav=E.updateRowNav,$.rowNames)j.updateLabel=()=>C(j.currentCol);let o=x3(K,H,j);j.updateNavMap=o.updateNavMap;let Z0=S3(),X4=b3(Z0),U2=document.createElement("div");U2.className="_scf_help_btn";let J0=document.createElement("button");J0.type="button",J0.className="_scf_help_button",J0.title="Keyboard shortcuts (?)",J0.setAttribute("aria-label","Keyboard shortcuts"),J0.textContent="?",J0.addEventListener("click",(z)=>{z.stopPropagation(),Y2()}),U2.appendChild(J0),Z0.toolbarEl.appendChild(U2);let H2=A3(Z0);j.updateFillCanvasBtn=H2.updateFillCanvasBtn;let l2=I3(j,Z0);j.updateSourceMenu=l2.updateSourceMenu;let W2=g3(()=>j.close());j.updateCloseBtn=W2.updatePosition;let B0=m3({compDiv:K,labelEl:V,rowNavEl:E.rowNavEl,closeBtnEl:W2.closeBtnEl,toolbarEl:Z0.toolbarEl,fillCanvasBtnEl:H2.fillCanvasBtnEl});j.revealColumnNav=B0.revealColumnNav,j.revealRowNav=B0.revealRowNav,j.syncFillCanvasVisibility=B0.syncFillCanvasVisibility,j.syncAutoHide=B0.resync,T(J.col),j.setRow=(z)=>{if(z<0||z>=j.numRows)return;j.currentRow=z,j.navTargetRow=z,j.updateLabel?.(),H[z].rowDiv.scrollIntoView({behavior:"smooth",block:"center"}),E.updateRowNav(z),j.revealRowNav?.(),L("Row "+(z+1)+" / "+j.numRows)},K.addEventListener("scroll",()=>{if(E.rowNavEl)w5(j,E.updateRowNav);o.updateNavMap()});let V4=()=>j.updateScrollSpacers?.(),G0=null;if(typeof ResizeObserver<"u"){if(G0=new ResizeObserver(V4),G0.observe(K),H[0])G0.observe(H[0].rowDiv);if(H[H.length-1])G0.observe(H[H.length-1].rowDiv)}let t2=()=>{j.updateScrollSpacers?.(),v0()};window.addEventListener("resize",t2);let{scrollX:K4,scrollY:j4}=window,P0=null;function Y4(){Q0=!0;for(let z of r)clearTimeout(z);if(window.removeEventListener("mousemove",Z),window.removeEventListener("mouseup",W),window.removeEventListener("resize",t2),G0)G0.disconnect();P0?.disconnect(),l.disconnect(),h5(Y),K.remove(),E.cleanup(),o.cleanup(),l2.cleanup(),H2.cleanup(),W2.cleanup(),Z0.cleanup(),X4.cleanup(),B0.cleanup(),f0(),document.body.style.overflow="",_.style.display=D,q.style.display=n,window.scrollTo(K4,j4),V.classList.add("_scf_ui_autohidden"),V.innerHTML="",b0("fit"),y0(0),$3(j),i1(),z0()}if(j.close=Y4,_.style.display="none",q.style.display="none",document.body.style.overflow="hidden",X.appendChild(K),j.updateScrollSpacers(),e1(j),y)W0();if(Q.mode==="custom")j0();else if(Y1()==="1:1")q2({silent:!0});E.updateRowNav(J.row);let i2=()=>{j.updateScrollSpacers?.(),q3(j),j.updateNavMap()};requestAnimationFrame(i2);let a2=H[J.row]?.rowDiv;if(a2&&typeof ResizeObserver<"u"){P0=new ResizeObserver(()=>{requestAnimationFrame(i2);let x=H[J.row]?.imgs[J.col];if(x?.complete&&x.naturalWidth)P0?.disconnect()}),P0.observe(a2);let z=()=>P0?.disconnect();K.addEventListener("wheel",z,{once:!0,passive:!0}),K.addEventListener("mousedown",z,{once:!0})}}function N0($,_){Y0(),T0();let q=f(),J=document.createElement("div");J.style.display="none",q.appendChild(J);let Q=document.createElement("span");Q.style.display="none",q.appendChild(Q),p2($,J,Q);let X=N[N.length-1],V=X.close;return X.close=function(){if(V(),J.remove(),Q.remove(),_)_()},{close:()=>X.close()}}function s2($){if(!$)return null;return $.split("#",1)[0].split("?",1)[0].split("/").filter(Boolean).pop()||null}function s3($){let _=$.split("/").filter(Boolean);if(_[0]!=="c"||!_[1])return null;return decodeURIComponent(_[1])}function g5($){let _=/^dropdown-image-(\d+)$/.exec($||"");if(!_)return null;return Number.parseInt(_[1],10)}function d5($,_){if(!_)return null;let q=$.comparisons.findIndex((J)=>J.key===_);return q>=0?q:null}function m5($,_){let q=s2(_.publicFileName);if(q)for(let Q=0;Q<$.comparisons.length;Q++){let X=$.comparisons[Q].images.findIndex((V)=>s2(V.publicFileName)===q);if(X>=0)return{row:Q,col:X}}let J=d5($,_.comparisonKey);if(J!==null){let Q=$.comparisons[J].images;if(_.imageName){let X=Q.findIndex((V)=>V.name===_.imageName);if(X>=0)return{row:J,col:X}}if(_.activeImageIndex!==null&&_.activeImageIndex!==void 0&&_.activeImageIndex>=0&&_.activeImageIndex<Q.length)return{row:J,col:_.activeImageIndex};return{row:J,col:0}}return null}function p5($,_=document,q=location){let J=_.getElementById("image"),Q=_.querySelector("#images-dropdown .dropdown-item.active"),X=_.querySelector("#comparisons-dropdown .dropdown-item.active, #preview a.preview-active"),V=X?.href?new URL(X.href,"https://slow.pics"+q.pathname).pathname:"",K=s3(q.pathname)||s3(V);return m5($,{comparisonKey:K,publicFileName:s2(J?.currentSrc||J?.src),imageName:J?.alt||null,activeImageIndex:g5(Q?.id)})}function c3($){return $.replaceAll("."," ")}function s5($){return $.map((_)=>_.images.map((q)=>c3(q.name)))}function l3(){let $=(window.unsafeWindow||window).collection;if(!$||!$.comparisons||!$.comparisons.length)return!1;let _=$.comparisons,q=_[0].images.map((V)=>c3(V.name.replace(/^\([BIP]\) /,""))),J=q.length,Q=_.map((V)=>V.images.map((K)=>({full:"https://i.slow.pics/"+K.publicFileName,width:K.width,height:K.height}))),X=p5($);return N0({rows:Q,numCols:J,names:q,rowNames:s5(_),initialRow:X?.row,initialCol:X?.col,initialZoom:{mode:"fit"}}),!0}function e3($,_){return $.sourceNames?.[_]?.trim()||"Source "+(_+1)}function c5($,_){if(_.code!=="BracketLeft"&&_.code!=="BracketRight")return null;let q=$.currentCol,J=_.code==="BracketRight"?1:-1,Q=t0(),X=J>0?Q:-Q,V=e3($,q);if(_.shiftKey)return $.colContrast[q]=Math.max(P2,Math.min(k2,+($.colContrast[q]+X).toFixed(2))),"◐ "+V+" Contrast "+Math.round($.colContrast[q]*100)+"%";let K=u1($.colBrightness[q],J);return $.colBrightness[q]=K,"☀ "+V+" "+T1(K)}function l5(){if(R0())return!0;for(let $ of N){if($.colBrightness.some((_)=>!_0(_)))return!0;if($.colGammaCheck.some(Boolean))return!0;if($.colContrast.some((_)=>!_0(_)))return!0}return!1}function c(){return N[N.length-1]}function t3($){let _=c();if(!_)return;let J=(P3(_.visibleCols,_.currentCol)+$+_.visibleCols.length)%_.visibleCols.length;_.setColumn(_.visibleCols[J])}function i3($){let _=c();if(_)_.setRow((_.navTargetRow??_.currentRow)+$)}function G2($,_){let q=c();if(!q)return;let J=c5(q,{code:$,shiftKey:_});if(!J)return;m(),L(J)}function a3($){let _=c();if(!_)return;let q=_.currentCol,J=y1(_.colGammaCheck[q],$);if(_.colGammaCheck[q]=J,m(),J)L([{text:e3(_,q),size:"small",muted:!0},{text:"Gamma mismatch check",size:"normal"},{text:w1(J),size:"large"},{text:g1(J),size:"small"},{text:n1(J),size:"tiny",muted:!0}]);else L("Gamma mismatch check OFF")}function r3($){let _=c();if(!_)return;if($)_.colBrightness.fill(1),_.colGammaCheck.fill(null),_.colContrast.fill(1),m(),L("↺ Reset all adjustments");else{let q=_.currentCol;_.colBrightness[q]=1,_.colGammaCheck[q]=null,_.colContrast[q]=1,m(),L("↺ Reset Source "+(q+1)+" adjustments")}}function t5($){if($==="key"&&l5()){I2();let _=c();if(_)_.colBrightness.fill(1),_.colGammaCheck.fill(null),_.colContrast.fill(1);m(),L(d().toast);return}c()?.close()}var $4={"zoom.in":()=>K3(),"zoom.out":()=>j3(),"zoom.fit":()=>Y3(),"zoom.oneToOne":()=>q2(),"nav.colPrev":()=>t3(-1),"nav.colNext":()=>t3(1),"nav.rowPrev":()=>i3(-1),"nav.rowNext":()=>i3(1),"display.canvas":()=>{$2(),W0();for(let $ of N)$.updateFillCanvasBtn?.();L(y?"Canvas: Fill":"Canvas: Fit")},"display.minimap":()=>{a1();for(let $ of N)$.updateNavMap?.();L(K0?"Minimap ON":"Minimap OFF")},"display.rowNav":()=>{let $=f().querySelector("._scf_row_nav");if(!$)return;let _=$.classList.toggle("_scf_ui_force_hidden");if(L("Row nav: "+(_?"off":"on")),!_)c()?.revealRowNav?.()},"display.bgLoad":()=>{let $=c();if(!$)return;let _=!$.bgLoadAll();if($.setBgLoadAll(_),L("Lazy load: "+(_?"bg (load all)":"viewport only")),_)$.triggerBgLoad()},"filter.next":()=>{B2(1),m(),L(d().toast)},"filter.prev":()=>{B2(-1),m(),L(d().toast)},"gamma.next":()=>a3(1),"gamma.prev":()=>a3(-1),"bright.up":()=>G2("BracketRight",!1),"bright.down":()=>G2("BracketLeft",!1),"contrast.up":()=>G2("BracketRight",!0),"contrast.down":()=>G2("BracketLeft",!0),"adjust.resetSource":()=>r3(!1),"adjust.resetAll":()=>r3(!0),"viewer.help":()=>Y2(),"viewer.close":($)=>t5($.source)};function o3($,_){let q=N.length>0;for(let J of i){if((J.phase??"down")!==_)continue;if(!q&&!J.siteLevel)continue;let Q=v(J.id);if(S0(Q.main,$)||Q.extra!=null&&S0(Q.extra,$))return $.preventDefault(),$4[J.id]({source:"key"}),!0}return!1}function c2($){if(N.length===0)return!1;for(let _ of i){let q=v(_.id);if(e(q.main,$)||q.extra!=null&&e(q.extra,$))return $4[_.id]({source:"mouse"}),!0}return!1}function i5($){if(N.length===0)return!1;return i.some((_)=>{let q=v(_.id);return e(q.main,$)||q.extra!=null&&e(q.extra,$)})}function p3($,_){let q=0,J=0;$.addEventListener("mousedown",(Q)=>{if(Q.button===0){q=Q.clientX,J=Q.clientY;return}let X=Q.button===1?"middle":Q.button===3?"back":Q.button===4?"forward":null;if(X&&i5(X))Q.preventDefault()}),$.addEventListener("mouseup",(Q)=>{if(Q.button!==0||_.active)return;if(Math.abs(Q.clientX-q)>4||Math.abs(Q.clientY-J)>4)return;c2("click")}),$.addEventListener("dblclick",()=>c2("dblclick")),$.addEventListener("auxclick",(Q)=>{let X=Q.button===1?"middle":Q.button===3?"back":Q.button===4?"forward":null;if(X&&c2(X))Q.preventDefault()})}function _4($){let _=new Set;window.addEventListener("keydown",(q)=>{if(m2()){_.add(q.code);return}if(q.key==="Escape"&&O0()){_.add(q.code),q.preventDefault(),q.stopPropagation();return}if(E2())return;let J=N.length>0;if(!J&&!A2($))return;if(g0()){let Q=v("viewer.help");if(q.code==="Escape"||S0(Q.main,q)||Q.extra!=null&&S0(Q.extra,q))q.preventDefault(),f0();q.stopPropagation();return}if(q.code==="KeyV"&&!J&&!q.shiftKey&&!q.ctrlKey&&!q.altKey&&!q.metaKey){let Q=document.querySelector("[data-yacomp-comppics]");if(Q){q.preventDefault(),q.stopPropagation(),Q.click();return}if(l3())q.preventDefault(),q.stopPropagation();return}if(J&&/^Digit[1-9]$/.test(q.code)&&!q.shiftKey&&!q.ctrlKey&&!q.altKey&&!q.metaKey){let Q=c(),X=parseInt(q.code.charAt(5),10)-1;if(Q&&X<Q.visibleCols.length)q.preventDefault(),Q.setColumn(Q.visibleCols[X]);return}o3(q,"down")},!0),window.addEventListener("keyup",(q)=>{if(_.delete(q.code))return;if(m2()||E2())return;let J=N.length>0;if(!J&&!A2($))return;if(g0()){q.stopPropagation();return}if(q.key==="Escape"&&!J&&R0()&&!q.ctrlKey&&!q.altKey&&!q.metaKey){I2(),m(),L(d().toast);return}o3(q,"up")},!0)}var q4=!1;function J4(){if(u3(),q4)return;_4(),q4=!0}function Q4($){return $.replaceAll("."," ")}function a5($){if(!$||!Array.isArray($.comparisons)||!$.comparisons.length)throw TypeError("Invalid slow.pics collection: comparisons are required");let _=$.comparisons[0]?.images?.length??0;if(!_)throw TypeError("Invalid slow.pics collection: images are required");for(let q of $.comparisons){if(!Array.isArray(q.images)||q.images.length!==_)throw TypeError("Invalid slow.pics collection: every row must have the same column count");for(let J of q.images)if(!J?.name||!/^[A-Za-z0-9._-]+$/.test(J.publicFileName||""))throw TypeError("Invalid slow.pics collection: malformed image metadata")}}function r5($){a5($);let _=$.comparisons,q=_[0].images.map((Q)=>Q4(Q.name.replace(/^\([BIP]\) /,"")));return{rows:_.map((Q)=>Q.images.map((X)=>({full:`https://i.slow.pics/${X.publicFileName}`,width:X.width,height:X.height}))),numCols:q.length,names:q,rowNames:_.map((Q)=>Q.images.map((X)=>Q4(X.name))),initialZoom:{mode:"fit"}}}function s6($,_={}){let q=r5($);return J4(),N0(q,_.onClose)}function c6(){J4(),j2()}export{r5 as slowPicsCollectionToGrid,s6 as openSlowPicsCollection,c6 as openSettings};
