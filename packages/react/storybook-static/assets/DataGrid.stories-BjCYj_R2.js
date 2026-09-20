import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-CeSprNHO.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,t as o}from"./Button-Dwx7L93c.js";import{n as s,t as ee}from"./Heading-mMt-zxmQ.js";import{n as c,t as te}from"./Text-BmznDQS2.js";import{n as ne,t as re}from"./Input-CqKLz_2Y.js";import{n as ie,t as ae}from"./Icon-CDe7Poew.js";import{n as l,t as oe}from"./Checkbox-CbaGVFBy.js";import{n as se,t as ce}from"./Select-UHdp2xUe.js";import{n as le,t as ue}from"./NumberInput-CHGcqmMr.js";import{n as de,t as fe}from"./DatePicker-B89ZN3Ow.js";function u(e,t){let n=e;for(let[e,r]of Object.entries(t))n=n.replaceAll(`{${e}}`,String(r));return n}function pe(e,t){let n=typeof document<`u`&&document.documentElement.lang||void 0;return new Intl.PluralRules(n).select(t)===`one`?e.one:e.other}function me(e,t){return typeof e==`number`&&typeof t==`number`?e-t:String(e??``).localeCompare(String(t??``),void 0,{numeric:!0})}function he(e){return e==null?``:String(e)}function ge(e){return typeof e==`string`||typeof e==`number`||typeof e==`boolean`?e:e==null?void 0:String(e)}function _e(...e){return e.filter(Boolean).join(` `)}function ve({ref:e,caption:t,captionLevel:n=`2`,hideCaption:r=!1,columns:a,data:s,rowCount:c,sort:ne,defaultSort:ie,selectable:l=`none`,selected:se,editable:le=!1,density:de=`compact`,stickyHeader:ve=!0,height:Oe=`viewport`,loading:ke=!1,emptyMessage:m,showStatusBar:h=!0,container:g,overrides:_,onSortChange:v,onSelectionChange:y,onCellChange:b,onEditStart:x,onRangeNeeded:S,onColumnResize:C,...Ae}){let w=`ds-data-grid-${(0,d.useId)()}`,T=`${w}-caption`,E=`${w}-status`,D=`${w}-cell-`,O=(e,t)=>`${D}${e<0?`h`:e}_${t}`,k=(0,d.useRef)(null),A=(0,d.useRef)(null),j=(0,d.useRef)(null),M=(0,d.useRef)(null),N=(0,d.useRef)(null),P=(0,d.useRef)(!1);if(De&&!P.current){P.current=!0;let e=a.filter(e=>e.isRowHeader).length;e!==1&&console.warn(`DataGrid: exactly one column may be \`isRowHeader\`; found ${e}.`);let t=a.map(e=>e.pinned);t.some((e,n)=>e===`start`&&t.slice(0,n).some(e=>e!==`start`)||e===`end`&&t.slice(n+1).some(e=>e!==`end`))&&console.warn("DataGrid: pinned columns must be contiguous at the start or end of `columns`.")}let F=l===`row`,I=+!!F,L=I+a.length,R=e=>e<I?void 0:a[e-I],z=a.find(e=>e.isRowHeader),[je,Me]=(0,d.useState)({}),Ne=e=>je[e.key]??e.width,Pe=e=>{let t=Ne(e);return t===void 0?be:`${t}px`},Fe=(e,t)=>{let n=0,r=0;for(let i=e;i<t;i+=1){let e=Ne(a[i]);e===void 0?r+=1:n+=e}return r===0?`${n}px`:`calc(${n}px + ${r} * ${be})`},Ie=[F?Se:null,...a.map(Pe)].filter(Boolean).join(` `),Le=(e,t)=>{if(e.pinned===`start`){let e=Fe(0,t);return{insetInlineStart:F?`calc(${Se} + ${e})`:e}}if(e.pinned===`end`)return{insetInlineEnd:Fe(t+1,a.length)}},Re=ne!==void 0,[ze,Be]=(0,d.useState)(ie),B=Re?ne:ze,V=(0,d.useMemo)(()=>{if(Re||!B||c!==void 0)return s;let e=B.direction===`ascending`?1:-1;return[...s].sort((t,n)=>me(t[B.column],n[B.column])*e)},[s,Re,B,c]),H=V.length,Ve=c===void 0?H:Math.max(c,H),He=(0,d.useMemo)(()=>new Map(V.map((e,t)=>[e.id,t])),[V]),[Ue,U]=(0,d.useState)(``),We=e=>{let t=B?.column===e.key&&B.direction===`ascending`?`descending`:`ascending`;Re||Be({column:e.key,direction:t}),v?.(e.key,t),U(u(p.sortedAnnouncement,{column:e.header,direction:t}))},Ge=se!==void 0,[Ke,qe]=(0,d.useState)([]),W=Ge?se:Ke,Je=(0,d.useMemo)(()=>new Set(W),[W]),[Ye,Xe]=(0,d.useState)(null),G=(0,d.useRef)(null),Ze=(0,d.useRef)(null),Qe=e=>{Ge||qe(e),y?.(e),U(u(p.selectedRows,{count:e.length,total:Ve}))},$e=e=>{Ze.current=e,Qe(Je.has(e)?W.filter(t=>t!==e):[...W,e])},et=e=>{let t=Ze.current===null?void 0:He.get(Ze.current),n=He.get(e);if(t===void 0||n===void 0)return $e(e);let r=V.slice(Math.min(t,n),Math.max(t,n)+1).map(e=>e.id);Qe([...W.filter(e=>!r.includes(e)),...r])},tt=V.map(e=>e.id),nt=H>0&&tt.every(e=>Je.has(e)),rt=!nt&&tt.some(e=>Je.has(e)),it=()=>Qe(nt?[]:tt),at=e=>{if(!e)return null;let t=He.get(e.from.rowId),n=He.get(e.to.rowId),r=a.findIndex(t=>t.key===e.from.column),i=a.findIndex(t=>t.key===e.to.column);return t===void 0||n===void 0||r<0||i<0?null:{top:Math.min(t,n),bottom:Math.max(t,n),left:Math.min(r,i),right:Math.max(r,i)}},K=l===`range`?at(Ye):null,q=e=>{let t=at(e);Xe(e),y?.(e),t&&U(u(p.selectedRange,{rows:t.bottom-t.top+1,columns:t.right-t.left+1}))},ot=(e,t)=>{let n=a[0],r=a[a.length-1],i=V[e],o=V[t];return!n||!r||!i||!o?null:{from:{rowId:i.id,column:n.key},to:{rowId:o.id,column:r.key}}},[J,st]=(0,d.useState)(0),[ct,lt]=(0,d.useState)(0),[ut,dt]=(0,d.useState)(0),[ft,pt]=(0,d.useState)(!1),[mt,ht]=(0,d.useState)(!1),gt=Oe!==`content`,_t=J>0&&ct>0,vt=_t?Math.max(1,Math.floor(ct/J)-1):1,yt=0,bt=H-1;if(gt){if(_t){let e=Math.floor(ut/J);yt=Math.max(0,Math.min(e,H)-vt),bt=Math.min(H-1,e+2*vt+1)}else bt=Math.min(H,xe)-1}(0,d.useLayoutEffect)(()=>{let e=k.current;if(!e)return;let t=()=>{let t=e.clientHeight;lt(e=>e===t?e:t);let n=e.querySelector(`[data-part="body"] > [data-part="row"]`),r=n?n.getBoundingClientRect().height:0;r>0&&st(e=>e===r?e:r);let i=e.scrollWidth>e.clientWidth;ht(e=>e===i?e:i)};if(t(),typeof ResizeObserver>`u`)return;let n=new ResizeObserver(t);n.observe(e);let r=e.querySelector(`[data-part="body"] > [data-part="row"]`);return r&&n.observe(r),()=>n.disconnect()},[de,yt,H===0,Oe,L]);let xt=(0,d.useRef)(-1),St=e=>{if(!S||c===void 0||c<=H||e<H-vt)return;let t=Math.min(c-1,H+vt-1);xt.current!==t&&(xt.current=t,S(H,t))},Ct=()=>{let e=k.current;if(!e)return;dt(t=>t===e.scrollTop?t:e.scrollTop);let t=e.scrollLeft!==0;pt(e=>e===t?e:t),_t&&St(Math.floor((e.scrollTop+ct)/J))},[wt,Tt]=(0,d.useState)({row:-1,col:0}),Y=Math.min(wt.row,H-1),X=Math.min(wt.col,L-1),Et=Y===-1||Y>=yt&&Y<=bt,Dt=(0,d.useRef)(!1);(0,d.useLayoutEffect)(()=>{Dt.current&&(Dt.current=!1,(typeof document<`u`?document.getElementById(O(Y,X)):null)?.scrollIntoView?.({block:`nearest`,inline:`nearest`}))});let Z=()=>A.current?.focus(),Q=(e,t,n=!1)=>{let r=Math.max(-1,Math.min(e,H-1)),i=Math.max(0,Math.min(t,L-1)),a=n&&l===`range`&&Y>=0&&r>=0&&G.current!==null;Dt.current=!0,Tt({row:r,col:i}),U(``);let o=k.current;if(o&&gt&&J>0&&r>=0){let e=r*J;e<o.scrollTop?o.scrollTop=e:e+J>o.scrollTop+ct-J&&(o.scrollTop=e+2*J-ct)}r>=0&&St(r);let s=R(i),ee=r>=0?V[r]:void 0;if(!s||!ee)return;let c={rowId:ee.id,column:s.key};l===`cell`&&y?.(c),l===`range`&&(a?q({from:G.current,to:c}):(G.current=c,Ye&&q({from:c,to:c})))},[$,Ot]=(0,d.useState)(null),kt=(0,d.useRef)(null),At=e=>{kt.current=e,Ot(e)},jt=(0,d.useRef)(void 0),Mt=(0,d.useRef)(!1),[Nt,Pt]=(0,d.useState)(void 0),Ft=(e,t,n)=>{let r=R(t),i=V[e];if(!le||!r?.editable||!i||x?.(i.id,r.key)===!1)return!1;let a=r.editor??`text`,o=n!==void 0&&(a===`text`||a===`number`);return jt.current=o?a===`number`?Number.isFinite(Number(n))?Number(n):void 0:n:i[r.key],Mt.current=!1,Tt({row:e,col:t}),At({rowId:i.id,column:r.key,seed:o?n:void 0}),Pt(void 0),U(u(p.editing,{column:r.header})),!0},It=()=>{At(null),Pt(void 0),U(``)},Lt=()=>{It(),Z()},Rt=()=>{let e=kt.current;if(!e)return!0;let t=He.get(e.rowId),n=t===void 0?void 0:V[t],r=a.find(t=>t.key===e.column);if(!n||!r)return It(),!0;let i=jt.current,o=r.validate?.(i,n);if(o)return Pt(o),U(u(p.invalid,{message:o})),!1;let s=n[r.key];return It(),Object.is(i,s)||b?.(n.id,r.key,ge(i),ge(s)),!0},zt=()=>a.flatMap((e,t)=>e.editable?[t+I]:[]),Bt=(e,t)=>{let n=t.editor??`text`;if(e.stopPropagation(),e.key===`Escape`){if(Mt.current)return;e.preventDefault(),Lt()}else if(e.key===`Enter`){if(n===`select`||n===`date`&&Mt.current)return;e.preventDefault(),Rt()&&(Z(),Q(Y+1,X))}else if(e.key===`F2`)e.preventDefault(),Rt()&&Z();else if(e.key===`Tab`){let t=Y,n=zt(),r=e.shiftKey?[...n].reverse().find(e=>e<X):n.find(e=>e>X);if(!Rt()){e.preventDefault();return}Z(),r!==void 0&&(e.preventDefault(),Ft(t,r)||Tt({row:t,col:r}))}},Vt=(e,t)=>{if(e.currentTarget.contains(e.relatedTarget)||Mt.current)return;let n=kt.current;if(!n||n.rowId!==t.rowId||n.column!==t.column)return;let r=a.find(e=>e.key===t.column)?.editor??`text`;(r===`text`||r===`number`||r===`date`)&&Rt()};(0,d.useEffect)(()=>{if(!$)return;let e=N.current?.querySelector(`input, button, select, textarea, [tabindex]`);if(e?.focus(),e instanceof HTMLInputElement&&$.seed!==void 0)try{e.setSelectionRange(e.value.length,e.value.length)}catch{}},[$]),(0,d.useEffect)(()=>{let e=A.current;if(e)for(let t of e.querySelectorAll(we))t===e||t.closest(`[data-part="editor"]`)||t.tabIndex!==-1&&(t.tabIndex=-1)});let Ht=(0,d.useRef)(null),Ut=e=>Math.max(e.minWidth??0,M.current?.getBoundingClientRect().width??0),Wt=(e,t)=>{let n=Ne(e);if(n!==void 0)return n;let r=typeof document<`u`?document.getElementById(O(-1,t+I)):null;return r?r.getBoundingClientRect().width:0},Gt=(e,t)=>{let n=Math.round(Math.max(Ut(e),t));return Me(t=>t[e.key]===n?t:{...t,[e.key]:n}),n},Kt=(e,t,n)=>{e.preventDefault(),e.stopPropagation();let r=e.currentTarget,i=e.clientX,a=Wt(t,n),o=typeof getComputedStyle==`function`&&getComputedStyle(r).direction===`rtl`,s=a;r.setPointerCapture?.(e.pointerId);let ee=e=>{s=Gt(t,a+(o?i-e.clientX:e.clientX-i))},c=e=>{r.releasePointerCapture?.(e.pointerId),r.removeEventListener(`pointermove`,ee),r.removeEventListener(`pointerup`,c),r.removeEventListener(`pointercancel`,c),C?.(t.key,s)};r.addEventListener(`pointermove`,ee),r.addEventListener(`pointerup`,c),r.addEventListener(`pointercancel`,c)},qt=()=>{if(!K)return;let e=a.slice(K.left,K.right+1),t=[];K.top===0&&K.bottom===H-1&&t.push(e.map(e=>e.header).join(`	`));for(let n=K.top;n<=K.bottom;n+=1){let r=V[n];r&&t.push(e.map(e=>he(r[e.key])).join(`	`))}let n=(K.bottom-K.top+1)*e.length;navigator.clipboard?.writeText(t.join(`
`)).then(()=>U(u(pe(p.copied,n),{cells:n}))).catch(()=>void 0)},Jt=()=>{let e=[];if(l===`row`){for(let t of V)if(Je.has(t.id))for(let n of a)n.editable&&e.push([t,n])}else if(l===`cell`){let t=V[Y],n=R(X);t&&n?.editable&&e.push([t,n])}else if(l===`range`&&K)for(let t=K.top;t<=K.bottom;t+=1)for(let n=K.left;n<=K.right;n+=1){let r=V[t],i=a[n];r&&i?.editable&&e.push([r,i])}for(let[t,n]of e)b?.(t.id,n.key,void 0,ge(t[n.key]));return e.length>0},Yt=e=>{if(kt.current)return;let t=A.current;if(!t)return;if(e.target!==t){if(e.key===`Escape`||e.key===`F2`){e.preventDefault(),Z();return}if(e.key===`Tab`&&e.shiftKey){Z();return}if(!Ee.has(e.key))return;Z()}let n=Y,r=X,i=R(r),a=e.ctrlKey||e.metaKey;switch(e.key){case`ArrowRight`:case`ArrowLeft`:{e.preventDefault();let a=e.key===`ArrowRight`?1:-1;if(e.shiftKey&&n===-1&&i?.resizable){let e=j.current?.getBoundingClientRect().width??0,n=getComputedStyle(t).direction===`rtl`,o=Gt(i,Wt(i,r-I)+(n?-a:a)*e);Ht.current={column:i.key,width:o};return}Q(n,r+a,e.shiftKey);return}case`ArrowDown`:e.preventDefault(),Q(n+1,r,e.shiftKey);return;case`ArrowUp`:e.preventDefault(),Q(n-1,r,e.shiftKey);return;case`Home`:e.preventDefault(),Q(a?-1:n,0);return;case`End`:e.preventDefault(),Q(a?H-1:n,L-1);return;case`PageDown`:e.preventDefault(),Q(n+vt,r);return;case`PageUp`:e.preventDefault(),Q(n<0?n:Math.max(0,n-vt),r);return;case`Enter`:{if(e.preventDefault(),n===-1){F&&r===0?it():i?.sortable&&We(i);return}let t=V[n];if(!t)return;if(F&&r===0){$e(t.id);return}if(Ft(n,r))return;let a=document.getElementById(O(n,r))?.querySelector(Te);a&&(a.focus(),a.click());return}case`F2`:e.preventDefault(),n>=0&&Ft(n,r);return;case`Escape`:l===`range`&&Ye&&(e.preventDefault(),Xe(null));return;case` `:{if(l!==`row`&&l!==`range`)break;e.preventDefault();let t=V[n];if(!t)return;if(l===`row`){e.shiftKey?et(t.id):$e(t.id);return}if(a&&i&&V[0]){let e=V[H-1];G.current={rowId:V[0].id,column:i.key},q({from:G.current,to:{rowId:e.id,column:i.key}});return}let r=e.shiftKey&&Ze.current!==null?He.get(Ze.current):void 0;r===void 0&&(Ze.current=t.id);let o=ot(r??n,n);o&&(G.current=o.from,q(o));return}case`Delete`:case`Backspace`:le&&Jt()&&e.preventDefault();return}if(a&&e.code===`KeyA`&&(l===`row`||l===`range`)){if(e.preventDefault(),l===`row`)Qe(tt);else{let e=ot(0,H-1);e&&(G.current=e.from,q(e))}return}if(a&&e.code===`KeyC`&&l===`range`){e.preventDefault(),qt();return}e.key.length===1&&e.key!==` `&&!a&&!e.altKey&&n>=0&&Ft(n,r,e.key)&&e.preventDefault()},Xt=e=>{if(e.key!==`Shift`||!Ht.current)return;let{column:t,width:n}=Ht.current;Ht.current=null,C?.(t,n)},Zt=e=>{let t=e instanceof Element?e.closest(`[role="gridcell"], [role="rowheader"], [role="columnheader"]`):null;if(!t||!t.id.startsWith(D)||!A.current?.contains(t))return null;let[n,r]=t.id.slice(D.length).split(`_`);return{row:n===`h`?-1:Number(n),col:Number(r)}},Qt=(0,d.useRef)(!1),$t=(0,d.useRef)(null),en=e=>{let t=e.target;t.closest(`[data-part="editor"]`)||t.closest(Te)||Zt(t)&&(e.preventDefault(),Z())},tn=e=>{if(e.button!==0)return;let t=e.target;if(t.closest(`[data-part="editor"]`))return;let n=Zt(t);if(!n)return;Tt(n),U(``);let r=R(n.col),i=n.row>=0?V[n.row]:void 0;if(!i||!r)return;let a={rowId:i.id,column:r.key},o=e.ctrlKey||e.metaKey;l===`cell`?y?.(a):l===`row`?e.shiftKey?et(i.id):o&&$e(i.id):l===`range`&&(e.shiftKey&&G.current||(G.current=a),q({from:G.current,to:a}),Qt.current=!0,$t.current=a,A.current?.setPointerCapture?.(e.pointerId))},nn=e=>{if(!Qt.current||!G.current||typeof document.elementFromPoint!=`function`)return;let t=Zt(document.elementFromPoint(e.clientX,e.clientY)),n=t?R(t.col):void 0,r=t&&t.row>=0?V[t.row]:void 0;if(!t||!r||!n)return;let i=$t.current;i&&i.rowId===r.id&&i.column===n.key||($t.current={rowId:r.id,column:n.key},Tt(t),q({from:G.current,to:{rowId:r.id,column:n.key}}))},rn=e=>{Qt.current&&(Qt.current=!1,A.current?.releasePointerCapture?.(e.pointerId))},an=e=>{let t=Zt(e.target);t&&t.row>=0&&!kt.current&&Ft(t.row,t.col)},on={};for(let[e,t]of Object.entries(ye)){let n=_?.[e];n&&(on[t]=i(n))}let sn={paddingInline:`space.0`,fontSize:_?.headerSize??`font.size.sm`,fontWeight:_?.headerWeight??`font.weight.semibold`},cn=(e,t,n)=>{let r=`${w}-editor`,i=t[e.key],a=e=>{jt.current=e},o=e=>{a(e),Rt()&&Z()},s={paddingInline:`space.0`,paddingBlock:`space.0`};switch(e.editor??`text`){case`number`:return(0,f.jsx)(ue,{label:e.header,hideLabel:!0,size:`sm`,name:r,defaultValue:n.seed===void 0?typeof i==`number`?i:void 0:jt.current,overrides:s,onChange:a});case`select`:return(0,f.jsx)(ce,{label:e.header,hideLabel:!0,size:`sm`,name:r,options:e.options??[],defaultValue:he(i),container:g,overrides:{triggerPaddingInline:`space.0`,triggerPaddingBlock:`space.0`},onOpenChange:e=>{Mt.current=e},onChange:e=>o(Array.isArray(e)?e[0]:e)});case`date`:return(0,f.jsx)(fe,{label:e.header,hideLabel:!0,size:`sm`,name:r,defaultValue:typeof i==`string`?i:void 0,container:g,overrides:s,onOpenChange:e=>{Mt.current=e},onChange:e=>a(typeof e==`string`?e:void 0)});case`checkbox`:return(0,f.jsx)(oe,{label:e.header,hideLabel:!0,name:r,checked:!!i,onChange:o});default:return(0,f.jsx)(re,{label:e.header,hideLabel:!0,size:`sm`,name:r,defaultValue:n.seed??he(i),overrides:s,onChange:a})}},ln=(e,t)=>{let n=t+I,r=B?.column===e.key?B.direction:void 0,i=r===`ascending`?`descending`:`ascending`,a=Ne(e);return(0,f.jsxs)(`div`,{id:O(-1,n),role:`columnheader`,"aria-colindex":n+1,"aria-sort":e.sortable?r:void 0,tabIndex:-1,"data-part":`columnHeader`,className:_e(`ds-data-grid__cell`,`ds-data-grid__cell--header`,e.align&&e.align!==`start`&&`ds-data-grid__cell--align-${e.align}`,e.pinned&&`ds-data-grid__cell--pinned`,Y===-1&&X===n&&`ds-data-grid__cell--active`),style:Le(e,t),children:[e.sortable?(0,f.jsx)(`span`,{className:`ds-data-grid__sort`,"data-part":`sortButton`,onClick:()=>We(e),children:(0,f.jsx)(o,{variant:`ghost`,size:`sm`,label:e.header,accessibleName:u(i===`ascending`?p.sortAscending:p.sortDescending,{column:e.header}),trailingIcon:r?(0,f.jsx)(ae,{name:r===`ascending`?`chevron-up`:`chevron-down`,inline:!0}):void 0,overrides:sn,tabIndex:-1})}):e.abbr?(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`span`,{"aria-hidden":`true`,children:e.header}),(0,f.jsx)(`span`,{className:`ds-data-grid__visually-hidden`,children:e.abbr})]}):e.header,e.resizable?(0,f.jsx)(`div`,{role:`separator`,"aria-orientation":`vertical`,"aria-valuenow":a,"aria-valuemin":e.minWidth,"aria-label":u(p.resize,{column:e.header}),"data-part":`resizeHandle`,className:`ds-data-grid__resize-handle`,onPointerDown:n=>Kt(n,e,t)}):null]},e.key)},un=(e,t,n,r)=>{let i=r+I,a=$?.rowId===e.id&&$.column===n.key,o=K!==null&&t>=K.top&&t<=K.bottom&&r>=K.left&&r<=K.right,s=l===`cell`?Y===t&&X===i:l===`range`?o:void 0;return(0,f.jsx)(`div`,{id:O(t,i),role:n.isRowHeader?`rowheader`:`gridcell`,"aria-colindex":i+1,"aria-selected":s,"aria-readonly":le&&!n.editable?!0:void 0,"aria-describedby":a&&Nt?E:void 0,tabIndex:-1,"data-part":n.isRowHeader?`rowHeader`:`cell`,className:_e(`ds-data-grid__cell`,n.align&&n.align!==`start`&&`ds-data-grid__cell--align-${n.align}`,n.pinned&&`ds-data-grid__cell--pinned`,Y===t&&X===i&&`ds-data-grid__cell--active`,a&&`ds-data-grid__cell--editing`,a&&Nt&&`ds-data-grid__cell--invalid`),style:Le(n,r),children:a&&$?(0,f.jsx)(`div`,{ref:N,className:`ds-data-grid__editor`,"data-part":`editor`,onKeyDown:e=>Bt(e,n),onBlur:e=>Vt(e,$),children:cn(n,e,$)}):(0,f.jsx)(`span`,{className:`ds-data-grid__cell-content`,"data-part":`cellContent`,children:n.render?n.render(e):he(e[n.key])})},n.key)},dn=(e,t)=>{let n=Je.has(e.id),r=z&&he(e[z.key])||e.id,i={gridTemplateColumns:Ie};return gt&&(i.transform=`translateY(calc(${t} * ${Ce}))`),(0,f.jsxs)(`div`,{role:`row`,"aria-rowindex":t+2,"aria-selected":F?n:void 0,"data-part":`row`,className:`ds-data-grid__row`,style:i,children:[F?(0,f.jsx)(`div`,{id:O(t,0),role:`gridcell`,"aria-colindex":1,tabIndex:-1,"data-part":`selectCell`,className:_e(`ds-data-grid__cell`,`ds-data-grid__cell--select`,`ds-data-grid__cell--pinned`,Y===t&&X===0&&`ds-data-grid__cell--active`),style:{insetInlineStart:0},onClick:t=>{t.target.closest(`[data-ds="Checkbox"]`)||$e(e.id)},children:(0,f.jsx)(oe,{label:u(p.selectRow,{rowName:r}),hideLabel:!0,name:`${w}-select`,value:e.id,checked:n,tabIndex:-1,onChange:()=>$e(e.id)})}):null,a.map((n,r)=>un(e,t,n,r))]},e.id)},fn=[];for(let e=Math.max(0,yt);e<=bt;e+=1){let t=V[e];t&&fn.push(dn(t,e))}let pn=null;if(K){let e=Math.max(K.top,yt),t=Math.min(K.bottom,bt);if(e<=t){let n={insetBlockStart:`calc(${e} * ${Ce})`,blockSize:`calc(${t-e+1} * ${Ce})`,insetInlineStart:Fe(0,K.left),inlineSize:Fe(K.left,K.right+1)};pn=(0,f.jsxs)(`div`,{"aria-hidden":`true`,className:`ds-data-grid__range-overlay`,"data-part":`rangeOverlay`,children:[(0,f.jsx)(`div`,{className:`ds-data-grid__range-fill`,style:n}),(0,f.jsx)(`div`,{className:`ds-data-grid__range-border`,style:n})]})}}let mn=[u(pe(p.rowCount,Ve),{count:Ve})];l===`row`&&W.length>0&&mn.push(u(p.selectedRows,{count:W.length,total:Ve})),K&&mn.push(u(p.selectedRange,{rows:K.bottom-K.top+1,columns:K.right-K.left+1}));let hn=ke?p.loading:Nt?u(p.invalid,{message:Nt}):Ue,gn=R(X),_n=Y>=0&&gn?u(p.position,{row:Y+1,column:gn.header}):``,vn=_?.statusBarSize?{fontSize:_.statusBarSize}:void 0,yn=H===0&&!ke;return(0,f.jsxs)(`div`,{...Ae,ref:e,"data-ds":`DataGrid`,"data-part":`container`,className:_e(`ds-data-grid`,`ds-data-grid--density-${de}`,`ds-data-grid--height-${Oe}`,gt&&`ds-data-grid--virtual`,(ve||gt)&&`ds-data-grid--sticky-header`,ut>0&&`ds-data-grid--scrolled-y`,ft&&`ds-data-grid--scrolled-x`,ke&&`ds-data-grid--loading`),style:on,children:[(0,f.jsx)(`span`,{ref:j,"aria-hidden":`true`,className:`ds-data-grid__sizer ds-data-grid__sizer--step`}),(0,f.jsx)(`span`,{ref:M,"aria-hidden":`true`,className:`ds-data-grid__sizer ds-data-grid__sizer--target`}),(0,f.jsx)(`div`,{"data-part":`caption`,className:r?`ds-data-grid__visually-hidden`:`ds-data-grid__caption`,children:(0,f.jsx)(ee,{id:T,level:n,size:`md`,overrides:{marginBlockEnd:`space.0`,fontSize:_?.captionSize??`font.size.md`,fontWeight:_?.captionWeight??`font.weight.semibold`},children:t})}),(0,f.jsx)(`div`,{ref:k,"data-part":`scrollRegion`,className:`ds-data-grid__scroll-region`,onScroll:Ct,children:(0,f.jsxs)(`div`,{ref:A,role:`grid`,"data-part":`grid`,className:`ds-data-grid__grid`,tabIndex:0,"aria-labelledby":T,"aria-describedby":h?E:void 0,"aria-rowcount":Ve+1,"aria-colcount":L,"aria-multiselectable":l===`row`||l===`range`||void 0,"aria-readonly":!le,"aria-busy":ke?!0:void 0,"aria-activedescendant":Et&&L>0?O(Y,X):void 0,onKeyDown:Yt,onKeyUp:Xt,onMouseDown:en,onPointerDown:tn,onPointerMove:nn,onPointerUp:rn,onPointerCancel:rn,onDoubleClick:an,children:[(0,f.jsx)(`div`,{role:`rowgroup`,"data-part":`header`,className:`ds-data-grid__header`,children:(0,f.jsxs)(`div`,{role:`row`,"aria-rowindex":1,"data-part":`headerRow`,className:`ds-data-grid__row`,style:{gridTemplateColumns:Ie},children:[F?(0,f.jsx)(`div`,{id:O(-1,0),role:`columnheader`,"aria-colindex":1,tabIndex:-1,"data-part":`selectAllCell`,className:_e(`ds-data-grid__cell`,`ds-data-grid__cell--header`,`ds-data-grid__cell--select`,`ds-data-grid__cell--pinned`,Y===-1&&X===0&&`ds-data-grid__cell--active`),style:{insetInlineStart:0},onClick:e=>{e.target.closest(`[data-ds="Checkbox"]`)||it()},children:(0,f.jsx)(oe,{label:p.selectAll,hideLabel:!0,name:`${w}-select-all`,checked:nt,indeterminate:rt,tabIndex:-1,onChange:it})}):null,a.map(ln)]})}),(0,f.jsxs)(`div`,{role:`rowgroup`,"data-part":`body`,className:`ds-data-grid__body`,style:gt?{blockSize:`calc(${yn?0:Ve} * ${Ce})`}:void 0,children:[pn,yn?(0,f.jsx)(`div`,{role:`row`,"aria-rowindex":2,className:`ds-data-grid__empty-row`,children:(0,f.jsx)(`div`,{role:`gridcell`,"aria-colindex":1,className:`ds-data-grid__empty`,style:{gridColumn:`1 / -1`},children:(0,f.jsx)(te,{element:`p`,tone:`muted`,"data-part":`emptyState`,children:m??p.empty})})}):fn]})]})}),(0,f.jsxs)(`div`,{"data-part":`statusBar`,className:h?`ds-data-grid__status-bar`:`ds-data-grid__visually-hidden`,children:[(0,f.jsxs)(`span`,{className:`ds-data-grid__status-group`,children:[h?mn.map(e=>(0,f.jsx)(te,{element:`span`,size:`xs`,tone:`muted`,overrides:vn,children:e},e)):null,(0,f.jsx)(te,{id:E,element:`span`,size:`xs`,tone:`muted`,role:`status`,"aria-live":`polite`,overrides:vn,children:hn})]}),h?(0,f.jsxs)(`span`,{className:`ds-data-grid__status-group`,children:[mt&&!ft?(0,f.jsx)(te,{element:`span`,size:`xs`,tone:`muted`,overrides:vn,children:p.scrollHint}):null,_n?(0,f.jsx)(te,{element:`span`,size:`xs`,tone:`muted`,overrides:vn,children:_n}):null]}):null]})]})}var d,f,ye,p,be,xe,Se,Ce,we,Te,Ee,De;function Oe(){return(Oe=e((()=>{d=t(),r(),a(),l(),de(),s(),ie(),ne(),le(),se(),c(),f=n(),ye={headerWeight:`--ds-data-grid-header-weight`,headerSize:`--ds-data-grid-header-size`,headerBorder:`--ds-data-grid-header-border`,headerBorderWidth:`--ds-data-grid-header-border-width`,headerShadow:`--ds-data-grid-header-shadow`,gridLine:`--ds-data-grid-grid-line`,gridLineWidth:`--ds-data-grid-grid-line-width`,rowHover:`--ds-data-grid-row-hover`,cellPaddingInline:`--ds-data-grid-cell-padding-inline`,columnWidth:`--ds-data-grid-column-width`,pinnedShadow:`--ds-data-grid-pinned-shadow`,resizeHandle:`--ds-data-grid-resize-handle`,resizeHandleWidth:`--ds-data-grid-resize-handle-width`,resizeStep:`--ds-data-grid-resize-step`,statusBarSize:`--ds-data-grid-status-bar-size`,statusBarPadding:`--ds-data-grid-status-bar-padding`,statusBarGap:`--ds-data-grid-status-bar-gap`,captionSize:`--ds-data-grid-caption-size`,captionWeight:`--ds-data-grid-caption-weight`,captionGap:`--ds-data-grid-caption-gap`,fixedHeight:`--ds-data-grid-fixed-height`,fontFamily:`--ds-data-grid-font-family`,fontSize:`--ds-data-grid-font-size`,lineHeight:`--ds-data-grid-line-height`,numericFont:`--ds-data-grid-numeric-font`,transition:`--ds-data-grid-transition`},p={sortAscending:`Sort by {column}, ascending`,sortDescending:`Sort by {column}, descending`,sortedAnnouncement:`Sorted by {column}, {direction}`,selectAll:`Select all rows`,selectRow:`Select {rowName}`,selectedRows:`{count} of {total} rows selected`,selectedRange:`{rows} rows by {columns} columns selected`,copied:{one:`Copied {cells} cell`,other:`Copied {cells} cells`},editing:`Editing {column}. Enter to save, Escape to cancel.`,invalid:`{message}`,rowCount:{one:`{count} row`,other:`{count} rows`},position:`Row {row}, {column}`,resize:`Resize {column}`,loading:`Loading`,empty:`Nothing to show.`,scrollHint:`Scroll sideways to see more columns`},be=`var(--ds-data-grid-column-size)`,xe=50,Se=`calc(var(--size-target-min) + 2 * var(--ds-data-grid-cell-padding-inline))`,Ce=`var(--ds-data-grid-row-size)`,we=`a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`,Te=`a[href], button, input, select, textarea, [contenteditable="true"]`,Ee=new Set([`ArrowRight`,`ArrowLeft`,`ArrowDown`,`ArrowUp`,`Home`,`End`,`PageDown`,`PageUp`]),De=typeof process<`u`&&!1,ve.__docgenInfo={description:"DataGrid — Design Schema, category: data. APG grid built from `<div>`s with explicit roles.\n\nWhen to use: Use a DataGrid when people navigate cell by cell, edit values in place, select ranges,\nor scroll through more rows than fit in memory as DOM: price lists, inventory counts, timesheets,\nadmin views over large sets, anything a spreadsheet would otherwise be used for. Set `editable` and\nmark the columns that may change; give every editable column a `validate`. Use `height: viewport`\n(the default) so the grid, not the page, scrolls.",methods:[],displayName:`DataGrid`,props:{caption:{required:!0,tsType:{name:`string`},description:'What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`.'},captionLevel:{required:!1,tsType:{name:`union`,raw:`DataGridCaptionLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:`Heading level of the caption in the page outline; its size is captionSize regardless, as Table.`,defaultValue:{value:`'2'`,computed:!1}},hideCaption:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Visually hide the caption; it remains the accessible name.`,defaultValue:{value:`false`,computed:!1}},columns:{required:!0,tsType:{name:`Array`,elements:[{name:`DataGridColumn`}],raw:`DataGridColumn[]`},description:"Table's column model plus grid concerns: pixel `width` (the columnWidth binding when omitted), `resizable`, `pinned`\ncolumns (contiguous at the start or end), `editable` with an `editor` kind and `validate`. Exactly\none column may be `isRowHeader`."},data:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; [key: string]: unknown }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:{name:`string`},value:{name:`unknown`,required:!0}}]}}],raw:`DataGridRow[]`},description:"The rows. `id` must be stable. Large arrays are fine; only visible rows are rendered."},rowCount:{required:!1,tsType:{name:`union`,raw:`number | undefined`,elements:[{name:`number`},{name:`undefined`}]},description:"Total rows when `data` is a window of a larger set (server paging). Sets aria-rowcount;\n`onRangeNeeded` asks for more. `data` is always a contiguous prefix starting at row 0."},sort:{required:!1,tsType:{name:`union`,raw:`DataGridSortState | undefined`,elements:[{name:`DataGridSortState`},{name:`undefined`}]},description:`Controlled sort state; as Table.`},defaultSort:{required:!1,tsType:{name:`union`,raw:`DataGridSortState | undefined`,elements:[{name:`DataGridSortState`},{name:`undefined`}]},description:"Initial sort; the grid sorts `data` itself when `rowCount` is not set."},selectable:{required:!1,tsType:{name:`union`,raw:`DataGridSelectable | undefined`,elements:[{name:`union`,raw:`'none' | 'row' | 'cell' | 'range'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'row'`},{name:`literal`,value:`'cell'`},{name:`literal`,value:`'range'`}]},{name:`undefined`}]},description:"`row` adds a checkbox column and Shift/Ctrl row selection; `cell` selects the focused cell;\n`range` allows Shift+arrow / pointer-drag rectangles (copy as TSV).",defaultValue:{value:`'none'`,computed:!1}},selected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Controlled selected row ids (row mode).`},editable:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Master switch: cells whose column is `editable` can be edited with Enter, F2, typing, or double-click.",defaultValue:{value:`false`,computed:!1}},density:{required:!1,tsType:{name:`union`,raw:`DataGridDensity | undefined`,elements:[{name:`union`,raw:`'compact' | 'comfortable'`,elements:[{name:`literal`,value:`'compact'`},{name:`literal`,value:`'comfortable'`}]},{name:`undefined`}]},description:`Row height: compact suits the grid's purpose; comfortable for touch.`,defaultValue:{value:`'compact'`,computed:!1}},stickyHeader:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`The header stays visible while the body scrolls. Always true when virtualized.`,defaultValue:{value:`true`,computed:!1}},height:{required:!1,tsType:{name:`union`,raw:`DataGridHeight | undefined`,elements:[{name:`union`,raw:`'content' | 'viewport' | 'fixed'`,elements:[{name:`literal`,value:`'content'`},{name:`literal`,value:`'viewport'`},{name:`literal`,value:`'fixed'`}]},{name:`undefined`}]},description:"`viewport` sets the grid height to `100vh − 2 × layout.gap.section`; `content` grows with rows\n(no virtualization); `fixed` uses `overrides.fixedHeight`.",defaultValue:{value:`'viewport'`,computed:!1}},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay.",defaultValue:{value:`false`,computed:!1}},emptyMessage:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Shown when `data` is empty."},showStatusBar:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`A footer line with row count, selection count and, while editing, the validation message.`,defaultValue:{value:`true`,computed:!1}},container:{required:!1,tsType:{name:`union`,raw:`HTMLElement | undefined`,elements:[{name:`HTMLElement`},{name:`undefined`}]},description:"Portal target for the composed Select and DatePicker editors (default `document.body`). Platform prop."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'headerWeight'
| 'headerSize'
| 'headerBorder'
| 'headerBorderWidth'
| 'headerShadow'
| 'gridLine'
| 'gridLineWidth'
| 'rowHover'
| 'cellPaddingInline'
| 'columnWidth'
| 'pinnedShadow'
| 'resizeHandle'
| 'resizeHandleWidth'
| 'resizeStep'
| 'statusBarSize'
| 'statusBarPadding'
| 'statusBarGap'
| 'captionSize'
| 'captionWeight'
| 'captionGap'
| 'fixedHeight'
| 'fontFamily'
| 'fontSize'
| 'lineHeight'
| 'numericFont'
| 'transition'`,elements:[{name:`literal`,value:`'headerWeight'`},{name:`literal`,value:`'headerSize'`},{name:`literal`,value:`'headerBorder'`},{name:`literal`,value:`'headerBorderWidth'`},{name:`literal`,value:`'headerShadow'`},{name:`literal`,value:`'gridLine'`},{name:`literal`,value:`'gridLineWidth'`},{name:`literal`,value:`'rowHover'`},{name:`literal`,value:`'cellPaddingInline'`},{name:`literal`,value:`'columnWidth'`},{name:`literal`,value:`'pinnedShadow'`},{name:`literal`,value:`'resizeHandle'`},{name:`literal`,value:`'resizeHandleWidth'`},{name:`literal`,value:`'resizeStep'`},{name:`literal`,value:`'statusBarSize'`},{name:`literal`,value:`'statusBarPadding'`},{name:`literal`,value:`'statusBarGap'`},{name:`literal`,value:`'captionSize'`},{name:`literal`,value:`'captionWeight'`},{name:`literal`,value:`'captionGap'`},{name:`literal`,value:`'fixedHeight'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'numericFont'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<DataGridOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<DataGridOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Per-instance style overrides; each entry sets the matching `--ds-data-grid-*` hook to that token."},onSortChange:{required:!1,tsType:{name:`union`,raw:`((column: string, direction: DataGridSortDirection) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`As Table.`},onSelectionChange:{required:!1,tsType:{name:`union`,raw:`((selection: DataGridSelection) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired with the selection: row ids, one cell `{ rowId, column }`, or a range `{ from, to }`."},onCellChange:{required:!1,tsType:{name:`union`,raw:`| ((rowId: string, column: string, value: DataGridCellValue | undefined, previous: DataGridCellValue | undefined) => void)
| undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when an edit commits. The caller updates `data`; the grid shows the old value until it does."},onEditStart:{required:!1,tsType:{name:`union`,raw:`((rowId: string, column: string) => boolean | void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when an editor opens; return false to refuse editing that cell.`},onRangeNeeded:{required:!1,tsType:{name:`union`,raw:`((start: number, end: number) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the visible window comes within one page of the end of `data` and `rowCount` says there is more."},onColumnResize:{required:!1,tsType:{name:`union`,raw:`((column: string, width: number) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when the user finishes resizing a resizable column.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDivElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var ke,m,h,g,_,v,y,b,x,S,C,Ae,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,je;function Me(){return(Me=e((()=>{Oe(),ke={title:`DataGrid/React`,component:ve,args:{caption:`Price list`,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0,width:120,pinned:`start`},{key:`name`,header:`Name`,width:200,resizable:!0},{key:`category`,header:`Category`,editable:!0,editor:`select`,options:[{value:`Lighting`,label:`Lighting`},{value:`Furniture`,label:`Furniture`},{value:`Decor`,label:`Decor`}]},{key:`qty`,header:`Qty`,align:`end`,width:80,sortable:!0,editable:!0,editor:`number`,validate:e=>typeof e==`number`&&e>=0?void 0:`Qty must be zero or more.`},{key:`price`,header:`Price (USD)`,abbr:`Price in US dollars`,align:`end`,sortable:!0}],data:[{id:`a`,sku:`A-1`,name:`Aster desk lamp`,category:`Lighting`,qty:42,price:39},{id:`b`,sku:`B-2`,name:`Bramble side table`,category:`Furniture`,qty:8,price:129},{id:`c`,sku:`C-3`,name:`Cedar wall clock`,category:`Decor`,qty:15,price:54.5},{id:`d`,sku:`D-4`,name:`Driftwood shelf`,category:`Furniture`,qty:23,price:89},{id:`e`,sku:`E-5`,name:`Ember candle set`,category:`Decor`,qty:60,price:24}]},tags:[`autodocs`]},m={},h={args:{captionLevel:`2`}},g={args:{captionLevel:`3`}},_={args:{captionLevel:`4`}},v={args:{selectable:`none`}},y={args:{selectable:`row`}},b={args:{selectable:`cell`}},x={args:{selectable:`range`}},S={args:{density:`compact`}},C={args:{density:`comfortable`}},Ae={args:{height:`content`}},w={args:{height:`viewport`}},T={args:{height:`fixed`}},E={args:{caption:`Price list`,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0,width:160},{key:`name`,header:`Name`},{key:`price`,header:`Price`,align:`end`,sortable:!0}],data:[{id:`a`,sku:`A-1`,name:`Widget`,price:10},{id:`b`,sku:`B-2`,name:`Sprocket`,price:20}]}},D={args:{caption:`Stock levels`,editable:!0,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0},{key:`onHand`,header:`On hand`,align:`end`,editable:!0,editor:`number`}],data:[{id:`a`,sku:`A-1`,onHand:12},{id:`b`,sku:`B-2`,onHand:4}]}},O={args:{caption:`Orders`,selectable:`row`,density:`comfortable`,columns:[{key:`order`,header:`Order`,isRowHeader:!0},{key:`customer`,header:`Customer`}],data:[{id:`a`,order:`1001`,customer:`Ana Souza`},{id:`b`,order:`1002`,customer:`Bo Lin`}]}},k={args:{caption:`Daily figures`,selectable:`range`,height:`fixed`,columns:[{key:`day`,header:`Day`,isRowHeader:!0},{key:`visits`,header:`Visits`,align:`end`},{key:`signups`,header:`Signups`,align:`end`}],data:[{id:`a`,day:`Monday`,visits:1200,signups:30},{id:`b`,day:`Tuesday`,visits:1450,signups:41}]}},A={args:{hideCaption:!0}},j={args:{loading:!0}},M={args:{data:[]}},N={args:{data:[],emptyMessage:`No prices loaded.`}},P={args:{defaultSort:{column:`price`,direction:`descending`}}},F={args:{editable:!0}},I={args:{showStatusBar:!1}},L={args:{rowCount:500,onRangeNeeded:()=>void 0}},R={args:{data:Array.from({length:2e3},(e,t)=>({id:`r${t}`,sku:`S-${t+1}`,name:`Item ${t+1}`,category:`Decor`,qty:t%50,price:t%40+1}))}},z={args:{selectable:`row`,editable:!0}},je=`Default.CaptionLevel2.CaptionLevel3.CaptionLevel4.SelectableNone.SelectableRow.SelectableCell.SelectableRange.DensityCompact.DensityComfortable.HeightContent.HeightViewport.HeightFixed.PriceList.EditableCells.RowSelectionForBulkActions.RangeSelection.HideCaption.Loading.Empty.EmptyMessage.DefaultSort.Editable.NoStatusBar.ServerPaged.ManyRows.Keyboard`.split(`.`),m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '2'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '3'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '4'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'cell'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'range'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...C.parameters?.docs?.source}}},Ae.parameters={...Ae.parameters,docs:{...Ae.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'content'
  }
}`,...Ae.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'viewport'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'fixed'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Price list',
    columns: [{
      key: 'sku',
      header: 'SKU',
      isRowHeader: true,
      width: 160
    }, {
      key: 'name',
      header: 'Name'
    }, {
      key: 'price',
      header: 'Price',
      align: 'end',
      sortable: true
    }],
    data: [{
      id: 'a',
      sku: 'A-1',
      name: 'Widget',
      price: 10
    }, {
      id: 'b',
      sku: 'B-2',
      name: 'Sprocket',
      price: 20
    }]
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Stock levels',
    editable: true,
    columns: [{
      key: 'sku',
      header: 'SKU',
      isRowHeader: true
    }, {
      key: 'onHand',
      header: 'On hand',
      align: 'end',
      editable: true,
      editor: 'number'
    }],
    data: [{
      id: 'a',
      sku: 'A-1',
      onHand: 12
    }, {
      id: 'b',
      sku: 'B-2',
      onHand: 4
    }]
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Orders',
    selectable: 'row',
    density: 'comfortable',
    columns: [{
      key: 'order',
      header: 'Order',
      isRowHeader: true
    }, {
      key: 'customer',
      header: 'Customer'
    }],
    data: [{
      id: 'a',
      order: '1001',
      customer: 'Ana Souza'
    }, {
      id: 'b',
      order: '1002',
      customer: 'Bo Lin'
    }]
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Daily figures',
    selectable: 'range',
    height: 'fixed',
    columns: [{
      key: 'day',
      header: 'Day',
      isRowHeader: true
    }, {
      key: 'visits',
      header: 'Visits',
      align: 'end'
    }, {
      key: 'signups',
      header: 'Signups',
      align: 'end'
    }],
    data: [{
      id: 'a',
      day: 'Monday',
      visits: 1200,
      signups: 30
    }, {
      id: 'b',
      day: 'Tuesday',
      visits: 1450,
      signups: 41
    }]
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    data: [],
    emptyMessage: 'No prices loaded.'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSort: {
      column: 'price',
      direction: 'descending'
    }
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    editable: true
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    showStatusBar: false
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    rowCount: 500,
    onRangeNeeded: () => undefined
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    data: Array.from({
      length: 2000
    }, (_, i) => ({
      id: \`r\${i}\`,
      sku: \`S-\${i + 1}\`,
      name: \`Item \${i + 1}\`,
      category: 'Decor',
      qty: i % 50,
      price: i % 40 + 1
    }))
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row',
    editable: true
  }
}`,...z.parameters?.docs?.source},description:{story:`The grid present with a sortable header, the select-all Checkbox and one Checkbox per row — well over\r
three focusable children — for the keyboard gate. No decorators.`,...z.parameters?.docs?.description}}}})))()}Me();export{h as CaptionLevel2,g as CaptionLevel3,_ as CaptionLevel4,m as Default,P as DefaultSort,C as DensityComfortable,S as DensityCompact,F as Editable,D as EditableCells,M as Empty,N as EmptyMessage,Ae as HeightContent,T as HeightFixed,w as HeightViewport,A as HideCaption,z as Keyboard,j as Loading,R as ManyRows,I as NoStatusBar,E as PriceList,k as RangeSelection,O as RowSelectionForBulkActions,b as SelectableCell,v as SelectableNone,x as SelectableRange,y as SelectableRow,L as ServerPaged,je as __namedExportsOrder,ke as default};