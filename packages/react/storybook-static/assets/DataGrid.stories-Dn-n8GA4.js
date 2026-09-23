import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-D5pPePpr.js";import{t as n}from"./react-dom-BT06ZQro.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./names-szlHjJ4U.js";import{n as o,t as s}from"./FormContext-BEAFo0vw.js";import{n as c,t as l}from"./Button-OQwYA6MI.js";import{n as ee,t as u}from"./Heading-IOamlp7v.js";import{n as d,t as f}from"./Text-B1hFPUay.js";import{n as te,t as ne}from"./Input-D3dYrjhs.js";import{n as re,t as ie}from"./Icon-dvwZzeX-.js";import{n as ae,t as oe}from"./Checkbox-Za7sMM6c.js";import{n as se,t as ce}from"./Select--B9VQw0y.js";import{n as le,t as ue}from"./NumberInput-BEPb2fih.js";import{n as de,t as fe}from"./DatePicker-B8ouJgRa.js";function pe(e){let t={};if(!e)return t;for(let n of Object.keys(e)){let r=Ce[n],i=e[n];r&&i&&(t[r]=a(i))}return t}function me(e,t){return e==null?t==null?0:1:t==null?-1:typeof e==`number`&&typeof t==`number`?e-t:String(e).localeCompare(String(t),void 0,{numeric:!0})}function he(e){return e==null?``:String(e)}function ge(...e){return e.filter(Boolean).join(` `)}function p(e,t){return e.replace(/\{(\w+)\}/g,(e,n)=>n in t?String(t[n]):e)}function _e(){return()=>void 0}function ve(){return document.documentElement.lang}function ye(){return``}function be(e,t){let n=e.currentTarget.querySelector(t),r=e.target;!n||n.contains(r)||r.closest(`label`)||n.click()}function xe({ref:e,caption:t,captionLevel:n=`2`,hideCaption:r=!1,columns:i,data:a,rowCount:o,sort:c,defaultSort:ee,selectable:d=`none`,selected:te,editable:re=!1,density:ae=`compact`,stickyHeader:se=!0,height:le=`viewport`,loading:de=!1,emptyMessage:xe,showStatusBar:Ce=!0,container:Ee,overrides:_,onSortChange:De,onSelectionChange:v,onCellChange:Oe,onEditStart:ke,onRangeNeeded:y,onColumnResize:b,...x}){let S=(0,m.useId)(),C=`${S}-caption`,w=`${S}-live`,T=e=>`${S}-r${e.row}-c${e.col}`,E=(0,m.useRef)(null),D=(0,m.useRef)(null),O=(0,m.useRef)(null),k=(0,m.useRef)(null),A=(0,m.useRef)(null),j=(0,m.useRef)(null),M=(0,m.useRef)(null);i.filter(e=>e.isRowHeader).length;{let e=i.map((e,t)=>e.pinned===`start`?t:-1).filter(e=>e>=0),t=i.map((e,t)=>e.pinned===`end`?t:-1).filter(e=>e>=0);e.every((e,t)=>e===t),t.every((e,n)=>e===i.length-t.length+n)}let N=i.find(e=>e.isRowHeader),P=d===`row`,F=+!!P,I=i.length+F,L=e=>i[e-F],[R,z]=(0,m.useState)(ee),B=c!==void 0,V=B?c:R,H=(0,m.useMemo)(()=>{if(B||o!==void 0||!V)return a;let e=V.direction===`ascending`?1:-1;return[...a].sort((t,n)=>me(t[V.column],n[V.column])*e)},[a,B,o,V]),U=H.length-1,W=o??a.length,[Ae,je]=(0,m.useState)(``),Me=e=>{let t=V?.column===e.key&&V.direction===`ascending`?`descending`:`ascending`;B||z({column:e.key,direction:t}),De?.(e.key,t),je(p(g.sortedAnnouncement,{column:e.header,direction:t}))},[G,Ne]=(0,m.useState)({row:-1,col:0}),Pe=(0,m.useRef)(!1),[Fe,Ie]=(0,m.useState)([]),K=te??Fe,q=new Set(K),Le=(0,m.useRef)(null),Re=e=>p(g.selectedRows,{count:e,total:W}),ze=e=>{e.length===K.length&&e.every(e=>q.has(e))||(te===void 0&&Ie(e),v?.(e),je(Re(e.length)))},Be=e=>{let t=H[e];t&&(Le.current=e,ze(q.has(t.id)?K.filter(e=>e!==t.id):[...K,t.id]))},Ve=e=>{let t=Le.current??e,n=Math.min(t,e),r=Math.max(t,e),i=[...K];for(let e=n;e<=r;e+=1){let t=H[e];t&&!q.has(t.id)&&i.push(t.id)}ze(i)},He=H.length>0&&H.every(e=>q.has(e.id)),Ue=!He&&H.some(e=>q.has(e.id)),We=()=>ze(He?[]:H.map(e=>e.id)),Ge=(0,m.useRef)(null),Ke=e=>{let t=H[e.row],n=L(e.col);if(e.row<0||!t||!n)return;let r=`${t.id}\u0000${n.key}`;Ge.current!==r&&(Ge.current=r,v?.({rowId:t.id,column:n.key}))},[J,qe]=(0,m.useState)(null),Y=(0,m.useRef)(null),Je=(0,m.useRef)(null),Ye=e=>{let t=H[e.row],n=L(e.col);return t&&n?{rowId:t.id,column:n.key}:null},X=e=>{qe(e);let t=Ye(e.anchor),n=Ye(e.focus);if(!t||!n)return;let r=`${t.rowId}\u0000${t.column}\u0000${n.rowId}\u0000${n.column}`;Je.current!==r&&(Je.current=r,v?.({from:t,to:n}),je(p(g.selectedRange,{rows:Math.abs(e.focus.row-e.anchor.row)+1,columns:Math.abs(e.focus.col-e.anchor.col)+1})))},Xe=()=>{qe(null),Je.current=null},[Z,Ze]=(0,m.useState)(0),[Qe,$e]=(0,m.useState)(0),[et,tt]=(0,m.useState)(0),[nt,rt]=(0,m.useState)(0),[it,at]=(0,m.useState)(!1),[ot,st]=(0,m.useState)(!1),[ct,lt]=(0,m.useState)(!1),[ut,dt]=(0,m.useState)(!1),ft=Z>0&&Qe>0?Math.max(1,Math.floor(Qe/Z)-1):1,pt=(0,m.useRef)(null);(0,m.useEffect)(()=>{pt.current=null},[a.length]);let mt=e=>{if(o===void 0||a.length>=o||e<a.length-1-ft)return;let t=Math.min(o-1,a.length+ft-1);pt.current!==t&&(pt.current=t,y?.(a.length,t))},[ht,gt]=(0,m.useState)({}),_t=e=>ht[e.key]??e.width,vt=e=>`var(--ds-data-grid-col-${e})`,yt=(e,t)=>{let n=[];for(let r=e;r<t;r+=1)n.push(vt(r));return n.length?`calc(${n.join(` + `)})`:`0`},bt={};P&&(bt[`--ds-data-grid-col-0`]=`calc(var(--ds-data-grid-select-column-width) + 2 * var(--ds-data-grid-cell-padding-inline))`),i.forEach((e,t)=>{let n=_t(e);bt[`--ds-data-grid-col-${t+F}`]=n===void 0?`var(--ds-data-grid-column-width-computed)`:`${n}px`});let xt=e=>{if(P&&e===0)return{insetInlineStart:`0`};let t=L(e);if(t?.pinned===`start`)return{insetInlineStart:yt(0,e)};if(t?.pinned===`end`)return{insetInlineEnd:yt(e+1,I)}},St=(()=>{let e=P?0:-1;return i.forEach((t,n)=>{t.pinned===`start`&&(e=n+F)}),e})(),Ct=i.findIndex(e=>e.pinned===`end`),wt=e=>e?e.getBoundingClientRect().width:0,Tt=e=>Math.max(e.minWidth??0,wt(M.current)),Et=le!==`content`,Dt=0,Ot=U;if(Et){if(Z>0&&Qe>0){let e=Math.ceil(Qe/Z);Dt=Math.max(0,nt-ft),Ot=Math.min(U,nt+e+ft)}else Dt=Math.min(Math.max(0,nt),Math.max(0,U)),Ot=Math.min(U,Dt+we-1)}let[Q,kt]=(0,m.useState)(null),[At,jt]=(0,m.useState)(void 0),$=(0,m.useRef)(void 0),Mt=(0,m.useRef)(!0),Nt=(0,m.useRef)(0),Pt=(0,m.useRef)(!1);(0,m.useEffect)(()=>(Pt.current=!1,()=>{Pt.current=!0}),[]);let Ft=Q?H.findIndex(e=>e.id===Q.rowId):-1,It=Q?i.findIndex(e=>e.key===Q.column)+F:-1;(0,m.useEffect)(()=>{Q&&Ft<0&&(Mt.current=!0,kt(null),jt(void 0))},[Q,Ft]);let Lt=(e,t)=>e.editor??(typeof t[e.key]==`number`?`number`:`text`),Rt=e=>{let t=L(e.col);return re&&e.row>=0&&!!H[e.row]&&!!t?.editable},zt=(e,t)=>{let n=H[e.row],r=L(e.col);if(!n||!r||!Rt(e)||ke?.(n.id,r.key)===!1)return!1;Nt.current+=1,Mt.current=!1;let i=Lt(r,n),a=n[r.key];if(t!==void 0&&i===`text`)$.current=t;else if(t!==void 0&&i===`number`){let e=Number(t);$.current=Number.isFinite(e)?e:void 0}else $.current=a;return Ne(e),jt(void 0),kt({rowId:n.id,column:r.key,initial:t,session:Nt.current}),je(p(g.editing,{column:r.header})),!0},Bt=()=>D.current?.focus({preventScroll:!0}),Vt=e=>{Mt.current=!0,kt(null),jt(void 0),e&&Bt()},Ht=(e=!0)=>{Mt.current||Vt(e)},Ut=(e,t)=>{if(!Q||Mt.current)return!1;let n=H.find(e=>e.id===Q.rowId),r=i.find(e=>e.key===Q.column);if(!n||!r)return Vt(t),!0;let a=r.validate?.(e,n);if(a)return jt(a),je(p(g.invalid,{message:a})),!1;let o=n[r.key];return Vt(t),Object.is(e,o)||Oe?.(n.id,r.key,e,o),!0},Wt=()=>{let e=[];return i.forEach((t,n)=>{t.editable&&e.push(n+F)}),e},Gt=e=>{e.stopPropagation();let t=e.currentTarget;if(!(e.target instanceof Node)||!t.contains(e.target)||!Q)return;let n=i.find(e=>e.key===Q.column),r=H.find(e=>e.id===Q.rowId);if(!n||!r)return;let a=Lt(n,r),o={row:Ft,col:It};if(e.key===`Escape`){e.preventDefault(),Ht();return}if(e.key===`F2`){e.preventDefault(),Ut($.current,!0);return}if(e.key===`Enter`&&(a===`text`||a===`number`||a===`date`)){if(e.preventDefault(),Ut($.current,!0)){let e={row:Math.min(o.row+1,U),col:o.col};Ne(e),Pe.current=!0}return}if(e.key===`Tab`){let t=Wt(),n=t.indexOf(o.col),r=t[e.shiftKey?n-1:n+1],i=!1;if((0,Se.flushSync)(()=>{i=Ut($.current,!0)}),!i){e.preventDefault();return}if(r!==void 0){e.preventDefault();let t={row:o.row,col:r};zt(t)||Ne(t),Pe.current=!0}}},Kt=e=>{if(Pt.current||Mt.current||!Q)return;let t=e.relatedTarget;if(t&&e.currentTarget.contains(t))return;let n=i.find(e=>e.key===Q.column),r=H.find(e=>e.id===Q.rowId);if(!n||!r)return;let a=Lt(n,r);a!==`select`&&a!==`checkbox`&&(t&&!D.current?.contains(t)&&t.closest(`[role="dialog"], [role="listbox"], [popover]`)||Ut($.current,!1))};(0,m.useLayoutEffect)(()=>{if(!Q)return;let e=A.current?.querySelector(`input, select, textarea, button`);if(e&&(e.focus(),Q.initial!==void 0&&e instanceof HTMLInputElement))try{let t=e.value.length;e.setSelectionRange(t,t)}catch{}},[Q]),(0,m.useLayoutEffect)(()=>{let e=D.current;if(e)for(let t of e.querySelectorAll(`.ds-data-grid__cell :is(${Te})`))t.closest(`.ds-data-grid__editor`)||t.tabIndex!==-1&&(t.tabIndex=-1)}),(0,m.useLayoutEffect)(()=>{if(!Pe.current)return;Pe.current=!1;let e=E.current,t=e?.ownerDocument.getElementById(T(G));if(!e||!t)return;let n=e.getBoundingClientRect(),r=t.getBoundingClientRect(),i=G.row>=0?O.current?.getBoundingClientRect().height??0:0,a=n.top+e.clientTop+i,o=n.top+e.clientTop+e.clientHeight;if(r.top<a?e.scrollTop-=a-r.top:r.bottom>o&&(e.scrollTop+=r.bottom-o),t.classList.contains(`ds-data-grid__cell--pinned`))return;let s=n.left+e.clientLeft,c=s+e.clientWidth;r.left<s?e.scrollLeft-=s-r.left:r.right>c&&(e.scrollLeft+=r.right-c)});let qt=H.length===0,Jt=i.map(e=>_t(e)??``).join(`,`);(0,m.useLayoutEffect)(()=>{let e=E.current,t=D.current;if(!e||!t)return;let n=()=>{let t=k.current?.querySelector(`[role="row"]`),n=t?t.getBoundingClientRect().height:0;Ze(e=>e===n?e:n);let r=e.clientHeight;$e(e=>e===r?e:r);let i=e.scrollWidth-e.clientWidth>=1;dt(e=>e===i?e:i);let a=wt(M.current);tt(e=>e===a?e:a)};if(n(),typeof ResizeObserver>`u`)return;let r=new ResizeObserver(n);r.observe(e),r.observe(t);let i=k.current?.querySelector(`[role="row"]`);return i&&r.observe(i),()=>r.disconnect()},[qt,ae,d,le,Jt,Dt]);let Yt=e=>{let t=e.currentTarget,n=Math.abs(t.scrollLeft)>=1;at(e=>e===n?e:n),n&&lt(!0);let r=t.scrollTop>=1;if(st(e=>e===r?e:r),Z>0){let e=Math.floor(t.scrollTop/Z);rt(t=>t===e?t:e),mt(Math.min(U,e+Math.ceil(t.clientHeight/Z)))}},Xt=(e,t)=>{if(Ne(e),Pe.current=!0,d===`cell`&&Ke(e),d===`range`&&e.row>=0){if(t){let t=Y.current??(G.row>=0?G:e);Y.current=t,X({anchor:t,focus:e})}else Y.current=e,J&&X({anchor:e,focus:e})}e.row>=0&&mt(e.row)},Zt=(0,m.useRef)(null),Qt=(e,t,n)=>{let r=wt(j.current),i=E.current?.ownerDocument.getElementById(T({row:-1,col:t})),a=_t(e)??(i?i.getBoundingClientRect().width:0),o=Math.round(Math.max(Tt(e),a+r*n));gt(t=>({...t,[e.key]:o})),Zt.current={column:e.key,width:o}},$t=e=>({r0:Math.min(e.anchor.row,e.focus.row),r1:Math.max(e.anchor.row,e.focus.row),c0:Math.min(e.anchor.col,e.focus.col),c1:Math.max(e.anchor.col,e.focus.col)}),en=(0,m.useSyncExternalStore)(_e,ve,ye),tn=e=>new Intl.PluralRules(en||void 0).select(e)===`one`?`one`:`other`,nn=()=>{if(!J)return;let{r0:e,r1:t,c0:n,c1:r}=$t(J),i=[];if(e===0&&t===U){let e=[];for(let t=n;t<=r;t+=1)e.push(L(t)?.header??``);i.push(e.join(`	`))}for(let a=e;a<=t;a+=1){let e=H[a],t=[];for(let i=n;i<=r;i+=1){let n=L(i);t.push(e&&n?he(e[n.key]):``)}i.push(t.join(`	`))}let a=(t-e+1)*(r-n+1),o=typeof navigator<`u`?navigator.clipboard:void 0;o&&o.writeText(i.join(`
`)).then(()=>je(p(g.copied[tn(a)],{cells:a})),()=>void 0)},rn=()=>{if(!re)return;let e=[],t=Wt();if(d===`row`)H.forEach((n,r)=>{if(q.has(n.id))for(let n of t)e.push({row:r,col:n})});else if(d===`range`&&J){let{r0:n,r1:r,c0:i,c1:a}=$t(J);for(let o=n;o<=r;o+=1)for(let n of t)n>=i&&n<=a&&e.push({row:o,col:n})}else d===`cell`&&Rt(G)&&e.push(G);for(let t of e){let e=H[t.row],n=L(t.col);if(!e||!n)continue;let r=e[n.key];Object.is(r,void 0)||Oe?.(e.id,n.key,void 0,r)}},an=e=>{let t=e.currentTarget;if(e.target!==t){e.key===`Escape`&&(e.preventDefault(),t.focus());return}let n=e.ctrlKey||e.metaKey,{key:r,shiftKey:i}=e,a=getComputedStyle(t).direction===`rtl`,o=L(G.col),s=G.row>=0,c=I-1,l=a?`ArrowLeft`:`ArrowRight`,ee=a?`ArrowRight`:`ArrowLeft`;if(i&&!s&&o?.resizable&&(r===`ArrowLeft`||r===`ArrowRight`)){e.preventDefault(),Qt(o,G.col,r===l?1:-1);return}let u=null;switch(r){case l:u={row:G.row,col:Math.min(G.col+1,c)};break;case ee:u={row:G.row,col:Math.max(G.col-1,0)};break;case`ArrowDown`:u={row:Math.min(G.row+1,U),col:G.col};break;case`ArrowUp`:u={row:Math.max(G.row-1,d===`range`&&i?0:-1),col:G.col};break;case`Home`:u=n?{row:-1,col:0}:{row:G.row,col:0};break;case`End`:u=n?{row:U,col:c}:{row:G.row,col:c};break;case`PageDown`:u={row:Math.min(G.row+ft,U),col:G.col};break;case`PageUp`:u={row:s?Math.max(G.row-ft,0):-1,col:G.col}}if(u){e.preventDefault();let t=i&&d===`range`&&s&&u.row>=0&&r.startsWith(`Arrow`);n&&r===`End`&&mt(U),Xt(u,t);return}if(r===`Enter`){if(!s){P&&G.col===0?(e.preventDefault(),We()):o?.sortable&&(e.preventDefault(),Me(o));return}if(P&&G.col===0){e.preventDefault(),Be(G.row);return}if(Rt(G)){e.preventDefault(),zt(G);return}let n=t.ownerDocument.getElementById(T(G))?.querySelector(Te);n&&(e.preventDefault(),n.focus(),n.click());return}if(r===`F2`){Rt(G)&&(e.preventDefault(),zt(G));return}if(r===`Escape`){J&&(e.preventDefault(),Xe());return}if(r===` `&&s&&(d===`row`||d===`range`)){if(e.preventDefault(),d===`row`){i?Ve(G.row):Be(G.row);return}if(n){if(U<0)return;Y.current={row:0,col:G.col},X({anchor:{row:0,col:G.col},focus:{row:U,col:G.col}});return}let t=i&&J?J.anchor.row:G.row;Y.current={row:t,col:0},X({anchor:{row:t,col:0},focus:{row:G.row,col:c}});return}if(n&&(e.code===`KeyA`||r===`a`)&&(d===`row`||d===`range`)){e.preventDefault(),d===`row`?ze(H.map(e=>e.id)):U>=0&&(Y.current={row:0,col:0},X({anchor:{row:0,col:0},focus:{row:U,col:c}}));return}if(n&&(e.code===`KeyC`||r===`c`)&&d===`range`){J&&(e.preventDefault(),nn());return}if((r===`Delete`||r===`Backspace`)&&re&&d!==`none`){e.preventDefault(),rn();return}if(r.length===1&&r!==` `&&!n&&!e.altKey&&Rt(G)){let t=H[G.row],n=t&&o?Lt(o,t):`text`;e.preventDefault(),zt(G,n===`text`||n===`number`?r:void 0)}},on=e=>{if(e.key!==`Shift`||!Zt.current)return;let{column:t,width:n}=Zt.current;Zt.current=null,b?.(t,n)},sn=e=>{let t=e instanceof Element?e.closest(`[data-grid-row]`):null;return!t||!D.current?.contains(t)?null:{row:Number(t.dataset.gridRow),col:Number(t.dataset.gridCol)}},cn=(0,m.useRef)(!1),ln=e=>{if(d!==`range`||e.button!==0||e.target.closest(`.ds-data-grid__editor, [data-part="resizeHandle"]`))return;let t=sn(e.target);!t||t.row<0||(e.shiftKey&&Y.current?X({anchor:Y.current,focus:t}):(Y.current=t,X({anchor:t,focus:t})),cn.current=!0,e.currentTarget.setPointerCapture?.(e.pointerId))},un=e=>{if(!cn.current||!Y.current)return;let t=e.currentTarget.ownerDocument,n=typeof t.elementFromPoint==`function`?t.elementFromPoint(e.clientX,e.clientY):null,r=sn(n);!r||r.row<0||(r.row!==G.row||r.col!==G.col)&&(Ne(r),X({anchor:Y.current,focus:r}))},dn=e=>{cn.current&&(cn.current=!1,e.currentTarget.releasePointerCapture?.(e.pointerId))},fn=e=>{let t=e.target;if(t.closest(`.ds-data-grid__editor`))return;let n=sn(t);if(!n)return;Ne(n),Q&&Ht(!1),n.row>=0&&(d===`cell`&&Ke(n),d===`row`&&!(P&&n.col===0)&&(e.shiftKey?Ve(n.row):(e.ctrlKey||e.metaKey)&&Be(n.row)));let r=t.closest(Te);(!r||r.classList.contains(`ds-data-grid__cell`)||t.closest(`[data-part="selectCell"], [data-part="selectAllCell"], [data-part="sortButton"]`))&&Bt()},pn=e=>{let t=sn(e.target);t&&Rt(t)&&zt(t)},mn=(e,t)=>{if(e.button!==0)return;e.preventDefault(),e.stopPropagation();let n=e.currentTarget,r=n.parentElement,i=_t(t)??(r?r.getBoundingClientRect().width:0),a=e.clientX,o=getComputedStyle(n).direction===`rtl`?-1:1,s=i;n.setPointerCapture?.(e.pointerId);let c=e=>{s=Math.round(Math.max(Tt(t),i+(e.clientX-a)*o)),gt(e=>e[t.key]===s?e:{...e,[t.key]:s})},l=()=>{n.removeEventListener(`pointermove`,c),n.removeEventListener(`pointerup`,l),n.removeEventListener(`pointercancel`,l),b?.(t.key,s)};n.addEventListener(`pointermove`,c),n.addEventListener(`pointerup`,l),n.addEventListener(`pointercancel`,l)},hn=e=>N&&he(e[N.key])||e.id,gn=(e,t,n)=>{let r=L(t),i=P&&t===0||r?.pinned!==void 0;return ge(`ds-data-grid__cell`,e,r?.align&&r.align!==`start`&&`ds-data-grid__cell--align-${r.align}`,i&&`ds-data-grid__cell--pinned`,t===St&&`ds-data-grid__cell--pinned-start-edge`,Ct>=0&&t===Ct+F&&`ds-data-grid__cell--pinned-end-edge`,n)},_n=e=>e.row===G.row&&e.col===G.col,vn=(e,t)=>{let n=t+F,r={row:-1,col:n},i=V?.column===e.key?V.direction:void 0,a=i===`ascending`?`descending`:`ascending`,o=_t(e),s=e.minWidth??(et>0?Math.round(et):void 0);return(0,h.jsxs)(`div`,{id:T(r),role:`columnheader`,"aria-colindex":n+1,"aria-sort":i,tabIndex:-1,"data-part":`columnHeader`,"data-grid-row":-1,"data-grid-col":n,className:gn(`ds-data-grid__column-header`,n,_n(r)&&`ds-data-grid__cell--active`),style:{inlineSize:vt(n),...xt(n)},children:[e.sortable?(0,h.jsx)(`span`,{"data-part":`sortButton`,className:`ds-data-grid__sort`,onClick:e=>be(e,`button`),children:(0,h.jsx)(l,{variant:`ghost`,size:`sm`,label:e.header,accessibleName:p(a===`ascending`?g.sortAscending:g.sortDescending,{column:e.header}),trailingIcon:i?(0,h.jsx)(ie,{name:i===`ascending`?`chevron-up`:`chevron-down`,inline:!0}):void 0,overrides:{paddingInline:`space.0`,fontWeight:_?.headerWeight??`font.weight.semibold`,fontSize:_?.headerSize??`font.size.sm`},onClick:()=>Me(e)})}):e.abbr?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(`span`,{"aria-hidden":`true`,children:e.header}),(0,h.jsx)(`span`,{className:`ds-data-grid__visually-hidden`,children:e.abbr})]}):(0,h.jsx)(`span`,{className:`ds-data-grid__header-text`,children:e.header}),e.resizable?(0,h.jsx)(`div`,{role:`separator`,"aria-orientation":`vertical`,"aria-label":p(g.resize,{column:e.header}),"aria-valuenow":o,"aria-valuemin":s,"data-part":`resizeHandle`,className:`ds-data-grid__resize-handle`,onPointerDown:t=>mn(t,e)}):null]},e.key)},yn=(e,t)=>{let n=Lt(e,t),r=t[e.key],i=`${S}-edit-${e.key}`,a=Q?.initial,o=e=>{$.current=e},c={paddingInline:`space.0`,paddingBlock:`space.0`},l;return l=n===`number`?(0,h.jsx)(ue,{label:e.header,hideLabel:!0,name:i,size:`sm`,defaultValue:typeof $.current==`number`?$.current:void 0,overrides:c,onChange:e=>o(e)}):n===`select`?(0,h.jsx)(ce,{label:e.header,hideLabel:!0,name:i,size:`sm`,options:e.options??[],defaultValue:he(r)||void 0,open:!0,container:Ee,overrides:{triggerPaddingInline:`space.0`,triggerPaddingBlock:`space.0`},onChange:e=>{Ut(Array.isArray(e)?e[0]:e,!0)},onOpenChange:e=>{e||Ht()}}):n===`date`?(0,h.jsx)(fe,{label:e.header,hideLabel:!0,name:i,size:`sm`,defaultValue:he(r)||void 0,container:Ee,overrides:c,onChange:e=>o(typeof e==`string`?e:void 0)}):n===`checkbox`?(0,h.jsx)(oe,{label:e.header,hideLabel:!0,name:i,defaultChecked:!!r,onChange:e=>{Ut(e,!0)}}):(0,h.jsx)(ne,{label:e.header,hideLabel:!0,name:i,size:`sm`,defaultValue:a??he(r),overrides:c,onChange:e=>o(e)}),(0,h.jsx)(`div`,{ref:A,"data-part":`editor`,className:`ds-data-grid__editor`,onKeyDown:Gt,onBlur:Kt,children:(0,h.jsx)(s,{value:null,children:l})})},bn=(e,t)=>{let n=q.has(e.id),r=d===`row`?n:void 0,a=d===`range`&&J?$t(J):null;return(0,h.jsxs)(`div`,{role:`row`,"aria-rowindex":t+2,"aria-selected":r,"data-part":`row`,className:ge(`ds-data-grid__row`,d===`row`&&n&&`ds-data-grid__row--selected`),style:{"--ds-data-grid-row-index":t},children:[P?(0,h.jsx)(`div`,{id:T({row:t,col:0}),role:`gridcell`,"aria-colindex":1,tabIndex:-1,"data-part":`selectCell`,"data-grid-row":t,"data-grid-col":0,className:gn(`ds-data-grid__select`,0,_n({row:t,col:0})&&`ds-data-grid__cell--active`),style:{inlineSize:vt(0),...xt(0)},onClick:e=>be(e,`input`),children:(0,h.jsx)(s,{value:null,children:(0,h.jsx)(oe,{label:p(g.selectRow,{rowName:hn(e)}),hideLabel:!0,name:`${S}-select`,value:e.id,checked:n,overrides:{controlSize:`size.target.min`},onChange:()=>Be(t)})})}):null,i.map((n,r)=>{let i=r+F,o={row:t,col:i},s=e[n.key],c=n===N,l=Q!==null&&Q.rowId===e.id&&Q.column===n.key,ee=typeof s==`number`&&!n.render,u=a?t>=a.r0&&t<=a.r1&&i>=a.c0&&i<=a.c1:!1,f=d===`range`?u:d===`cell`?Ge.current===`${e.id}\u0000${n.key}`:void 0;return(0,h.jsx)(`div`,{id:T(o),role:c?`rowheader`:`gridcell`,"aria-colindex":i+1,"aria-selected":f,"aria-describedby":l&&At?w:void 0,tabIndex:-1,"data-part":c?`rowHeader`:`cell`,"data-grid-row":t,"data-grid-col":i,className:gn(`ds-data-grid__body-cell`,i,ge(_n(o)&&`ds-data-grid__cell--active`,ee&&`ds-data-grid__cell--numeric`,l&&`ds-data-grid__cell--editing`,l&&At!==void 0&&`ds-data-grid__cell--invalid`)),style:{inlineSize:vt(i),...xt(i)},children:l?yn(n,e):(0,h.jsx)(`span`,{"data-part":`cellContent`,className:`ds-data-grid__cell-content`,children:n.render?n.render(e):he(s)})},n.key)})]},e.id)},xn=[];for(let e=Dt;e<=Ot;e+=1)xn.push(e);for(let e of[G.row,Ft])e>=0&&e<=U&&!xn.includes(e)&&xn.push(e);xn.sort((e,t)=>e-t);let Sn=null;if(d===`range`&&J&&H.length>0){let{r0:e,r1:t,c0:n,c1:r}=$t(J),i=Math.max(e,Dt),a=Math.min(t,Ot);i<=a&&(Sn=(0,h.jsx)(`div`,{"aria-hidden":`true`,"data-part":`rangeOverlay`,className:`ds-data-grid__range`,style:{"--ds-data-grid-range-first":i,"--ds-data-grid-range-rows":a-i+1,insetInlineStart:yt(0,n),inlineSize:yt(n,r+1)}}))}let Cn=p(g.rowCount[tn(W)],{count:W}),wn;if(d===`row`&&K.length>0&&(wn=Re(K.length)),d===`range`&&J){let{r0:e,r1:t,c0:n,c1:r}=$t(J);wn=p(g.selectedRange,{rows:t-e+1,columns:r-n+1})}let Tn=L(G.col),En=G.row>=0&&H[G.row]&&Tn?p(g.position,{row:G.row+1,column:Tn.header}):void 0,Dn=ut&&!ct,On={fontSize:_?.statusBarSize??`font.size.xs`},kn=At===void 0?de?g.loading:Ae:(0,h.jsx)(`span`,{className:`ds-data-grid__invalid`,children:(0,h.jsx)(f,{element:`span`,size:`xs`,overrides:On,children:p(g.invalid,{message:At})})}),An=H.length===0&&!de,jn=P||ae===`comfortable`?`comfortable`:`compact`;return(0,h.jsxs)(`div`,{...x,ref:e,"data-ds":`DataGrid`,"data-part":`container`,className:ge(`ds-data-grid`,`ds-data-grid--height-${le}`,`ds-data-grid--rows-${jn}`,se&&`ds-data-grid--sticky-header`,r&&`ds-data-grid--hide-caption`,de&&`ds-data-grid--loading`,it&&`ds-data-grid--scrolled-x`,ot&&`ds-data-grid--scrolled-y`),style:pe(_),children:[(0,h.jsx)(`span`,{"data-part":`caption`,className:`ds-data-grid__caption`,children:(0,h.jsx)(u,{id:C,level:n,size:`md`,overrides:{fontSize:_?.captionSize??`font.size.md`,fontWeight:_?.captionWeight??`font.weight.semibold`,marginBlockEnd:`space.0`},children:t??``})}),(0,h.jsxs)(`div`,{ref:E,"data-part":`scrollRegion`,className:`ds-data-grid__scroll-region`,onScroll:Yt,children:[(0,h.jsxs)(`div`,{ref:D,role:`grid`,"aria-labelledby":C,"aria-rowcount":W+1,"aria-colcount":I,"aria-multiselectable":d===`row`||d===`range`||d!==`cell`&&void 0,"aria-readonly":!re||void 0,"aria-busy":de?!0:void 0,"aria-activedescendant":T(G),tabIndex:0,"data-part":`grid`,className:`ds-data-grid__grid`,style:bt,onKeyDown:an,onKeyUp:on,onClick:fn,onDoubleClick:pn,onPointerDown:ln,onPointerMove:un,onPointerUp:dn,children:[(0,h.jsx)(`div`,{ref:O,role:`rowgroup`,"data-part":`header`,className:`ds-data-grid__header`,children:(0,h.jsxs)(`div`,{role:`row`,"aria-rowindex":1,"data-part":`headerRow`,className:`ds-data-grid__header-row`,children:[P?(0,h.jsx)(`div`,{id:T({row:-1,col:0}),role:`columnheader`,"aria-colindex":1,tabIndex:-1,"data-part":`selectAllCell`,"data-grid-row":-1,"data-grid-col":0,className:gn(`ds-data-grid__column-header ds-data-grid__select`,0,_n({row:-1,col:0})&&`ds-data-grid__cell--active`),style:{inlineSize:vt(0),...xt(0)},onClick:e=>be(e,`input`),children:(0,h.jsx)(s,{value:null,children:(0,h.jsx)(oe,{label:g.selectAll,hideLabel:!0,name:`${S}-select-all`,checked:He,indeterminate:Ue,overrides:{controlSize:`size.target.min`},onChange:We})})}):null,i.map(vn)]})}),(0,h.jsxs)(`div`,{ref:k,role:`rowgroup`,"data-part":`body`,className:`ds-data-grid__body`,style:{"--ds-data-grid-row-total":H.length>0?W:0},children:[Sn,xn.map(e=>{let t=H[e];return t?bn(t,e):null})]})]}),An?(0,h.jsx)(`div`,{className:`ds-data-grid__empty`,children:(0,h.jsx)(f,{element:`p`,tone:`muted`,"data-part":`emptyState`,children:xe??g.empty})}):null]}),(0,h.jsxs)(`div`,{className:ge(`ds-data-grid__status`,!Ce&&`ds-data-grid__visually-hidden`),children:[(0,h.jsx)(f,{id:w,element:`span`,tone:`muted`,size:`xs`,role:`status`,"data-part":`statusBar`,overrides:On,children:kn}),Ce?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(f,{element:`span`,tone:`muted`,size:`xs`,overrides:On,children:Cn}),wn===void 0?null:(0,h.jsx)(f,{element:`span`,tone:`muted`,size:`xs`,overrides:On,children:wn}),Dn?(0,h.jsx)(f,{element:`span`,tone:`muted`,size:`xs`,overrides:On,children:g.scrollHint}):null,En===void 0?null:(0,h.jsx)(f,{element:`span`,tone:`muted`,size:`xs`,overrides:On,children:En})]}):null]}),(0,h.jsx)(`span`,{ref:j,"aria-hidden":`true`,className:`ds-data-grid__probe ds-data-grid__probe--step`}),(0,h.jsx)(`span`,{ref:M,"aria-hidden":`true`,className:`ds-data-grid__probe ds-data-grid__probe--min`})]})}var m,Se,h,g,Ce,we,Te;function Ee(){return(Ee=e((()=>{m=t(),Se=n(),i(),c(),ae(),de(),o(),ee(),re(),te(),le(),se(),d(),h=r(),g={sortAscending:`Sort by {column}, ascending`,sortDescending:`Sort by {column}, descending`,sortedAnnouncement:`Sorted by {column}, {direction}`,selectAll:`Select all rows`,selectRow:`Select {rowName}`,selectedRows:`{count} of {total} rows selected`,selectedRange:`{rows} rows by {columns} columns selected`,copied:{one:`Copied {cells} cell`,other:`Copied {cells} cells`},editing:`Editing {column}. Enter to save, Escape to cancel.`,invalid:`{message}`,rowCount:{one:`{count} row`,other:`{count} rows`},position:`Row {row}, {column}`,resize:`Resize {column}`,loading:`Loading`,empty:`Nothing to show.`,scrollHint:`Scroll sideways to see more columns`},Ce={headerWeight:`--ds-data-grid-header-weight`,headerSize:`--ds-data-grid-header-size`,headerBorder:`--ds-data-grid-header-border`,headerBorderWidth:`--ds-data-grid-header-border-width`,headerShadow:`--ds-data-grid-header-shadow`,gridLine:`--ds-data-grid-grid-line`,gridLineWidth:`--ds-data-grid-grid-line-width`,rowHover:`--ds-data-grid-row-hover`,cellPaddingInline:`--ds-data-grid-cell-padding-inline`,columnWidth:`--ds-data-grid-column-width`,pinnedShadow:`--ds-data-grid-pinned-shadow`,resizeHandle:`--ds-data-grid-resize-handle`,resizeHandleWidth:`--ds-data-grid-resize-handle-width`,resizeStep:`--ds-data-grid-resize-step`,statusBarPadding:`--ds-data-grid-status-bar-padding`,statusBarGap:`--ds-data-grid-status-bar-gap`,captionGap:`--ds-data-grid-caption-gap`,fixedHeight:`--ds-data-grid-fixed-height`,fontFamily:`--ds-data-grid-font-family`,fontSize:`--ds-data-grid-font-size`,lineHeight:`--ds-data-grid-line-height`,numericFont:`--ds-data-grid-numeric-font`,transition:`--ds-data-grid-transition`},we=50,Te=`a[href], button, input, select, textarea, [tabindex]`,xe.__docgenInfo={description:"DataGrid — Design Schema, category: data.\r\n\r\nWhen to use:\r\nUse a DataGrid when people navigate cell by cell, edit values in place, select ranges, or scroll through more rows than fit in memory as DOM: price lists, inventory counts, timesheets, admin views over large sets, anything a spreadsheet would otherwise be used for. Set `editable` and mark the columns that may change; give every editable column a `validate`. Use `height: viewport` (the default) so the grid, not the page, scrolls.",methods:[],displayName:`DataGrid`,props:{caption:{required:!0,tsType:{name:`string`},description:'What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. Required: a grid built without one falls back to an empty caption and warns in development.'},captionLevel:{required:!1,tsType:{name:`union`,raw:`DataGridCaptionLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:`Heading level of the caption in the page outline; its size is captionSize regardless, as Table.`,defaultValue:{value:`'2'`,computed:!1}},hideCaption:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Visually hide the caption; it remains the accessible name.`,defaultValue:{value:`false`,computed:!1}},columns:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{\r
  key: string;\r
  header: string;\r
  abbr?: string | undefined;\r
  align?: DataGridColumnAlign | undefined;\r
  sortable?: boolean | undefined;\r
  width?: number | undefined;\r
  minWidth?: number | undefined;\r
  resizable?: boolean | undefined;\r
  isRowHeader?: boolean | undefined;\r
  pinned?: DataGridColumnPinned | undefined;\r
  editable?: boolean | undefined;\r
  editor?: DataGridEditorKind | undefined;\r
  options?: DataGridColumnOption[] | undefined;\r
  render?: ((row: DataGridRow) => ReactNode) | undefined;\r
  validate?: ((value: unknown, row: DataGridRow) => string | undefined) | undefined;\r
}`,signature:{properties:[{key:`key`,value:{name:`string`,required:!0}},{key:`header`,value:{name:`string`,required:!0}},{key:`abbr`,value:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}],required:!1}},{key:`align`,value:{name:`union`,raw:`DataGridColumnAlign | undefined`,elements:[{name:`union`,raw:`'start' | 'end' | 'center'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`},{name:`literal`,value:`'center'`}]},{name:`undefined`}],required:!1}},{key:`sortable`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}},{key:`width`,value:{name:`union`,raw:`number | undefined`,elements:[{name:`number`},{name:`undefined`}],required:!1}},{key:`minWidth`,value:{name:`union`,raw:`number | undefined`,elements:[{name:`number`},{name:`undefined`}],required:!1}},{key:`resizable`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}},{key:`isRowHeader`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}},{key:`pinned`,value:{name:`union`,raw:`DataGridColumnPinned | undefined`,elements:[{name:`union`,raw:`'start' | 'end'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}]},{name:`undefined`}],required:!1}},{key:`editable`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}},{key:`editor`,value:{name:`union`,raw:`DataGridEditorKind | undefined`,elements:[{name:`union`,raw:`'text' | 'number' | 'select' | 'date' | 'checkbox'`,elements:[{name:`literal`,value:`'text'`},{name:`literal`,value:`'number'`},{name:`literal`,value:`'select'`},{name:`literal`,value:`'date'`},{name:`literal`,value:`'checkbox'`}]},{name:`undefined`}],required:!1}},{key:`options`,value:{name:`union`,raw:`DataGridColumnOption[] | undefined`,elements:[{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ value: string; label: string }`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}}]}}],raw:`DataGridColumnOption[]`},{name:`undefined`}],required:!1}},{key:`render`,value:{name:`union`,raw:`((row: DataGridRow) => ReactNode) | undefined`,elements:[{name:`unknown`},{name:`undefined`}],required:!1}},{key:`validate`,value:{name:`union`,raw:`((value: unknown, row: DataGridRow) => string | undefined) | undefined`,elements:[{name:`unknown`},{name:`undefined`}],required:!1}}]}}],raw:`DataGridColumn[]`},description:"Table's column model plus grid concerns: pixel `width`, `minWidth`, `resizable`, `pinned`, `editable` with an `editor` kind and `validate`. Exactly one column may be `isRowHeader`."},data:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; [key: string]: unknown }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:{name:`string`},value:{name:`unknown`,required:!0}}]}}],raw:`DataGridRow[]`},description:"The rows. `id` must be stable. Large arrays are fine; only visible rows are rendered."},rowCount:{required:!1,tsType:{name:`union`,raw:`number | undefined`,elements:[{name:`number`},{name:`undefined`}]},description:"Total rows when `data` is a window of a larger set (server paging). Sets aria-rowcount; `onRangeNeeded` asks for more."},sort:{required:!1,tsType:{name:`union`,raw:`DataGridSortState | undefined`,elements:[{name:`signature`,type:`object`,raw:`{ column: string; direction: DataGridSortDirection }`,signature:{properties:[{key:`column`,value:{name:`string`,required:!0}},{key:`direction`,value:{name:`union`,raw:`'ascending' | 'descending'`,elements:[{name:`literal`,value:`'ascending'`},{name:`literal`,value:`'descending'`}],required:!0}}]}},{name:`undefined`}]},description:`Controlled sort state; as Table.`},defaultSort:{required:!1,tsType:{name:`union`,raw:`DataGridSortState | undefined`,elements:[{name:`signature`,type:`object`,raw:`{ column: string; direction: DataGridSortDirection }`,signature:{properties:[{key:`column`,value:{name:`string`,required:!0}},{key:`direction`,value:{name:`union`,raw:`'ascending' | 'descending'`,elements:[{name:`literal`,value:`'ascending'`},{name:`literal`,value:`'descending'`}],required:!0}}]}},{name:`undefined`}]},description:"Initial sort; the grid sorts `data` itself when `rowCount` is not set and the sort is uncontrolled."},selectable:{required:!1,tsType:{name:`union`,raw:`DataGridSelectable | undefined`,elements:[{name:`union`,raw:`'none' | 'row' | 'cell' | 'range'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'row'`},{name:`literal`,value:`'cell'`},{name:`literal`,value:`'range'`}]},{name:`undefined`}]},description:"`row` adds a checkbox column and Shift/Ctrl row selection; `cell` selects the focused cell; `range` allows Shift+arrow / pointer-drag rectangles (copy as TSV).",defaultValue:{value:`'none'`,computed:!1}},selected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Controlled selected row ids (row mode). Left undefined, the grid keeps the selection itself.`},editable:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Master switch: cells whose column is `editable` can be edited with Enter, F2, typing, or double-click.",defaultValue:{value:`false`,computed:!1}},density:{required:!1,tsType:{name:`union`,raw:`DataGridDensity | undefined`,elements:[{name:`union`,raw:`'compact' | 'comfortable'`,elements:[{name:`literal`,value:`'compact'`},{name:`literal`,value:`'comfortable'`}]},{name:`undefined`}]},description:`Row height: compact suits the grid's purpose; comfortable for touch.`,defaultValue:{value:`'compact'`,computed:!1}},stickyHeader:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`The header stays visible while the grid's own scroll region scrolls. Accepted for parity; every virtualized height keeps it sticky.`,defaultValue:{value:`true`,computed:!1}},height:{required:!1,tsType:{name:`union`,raw:`DataGridHeight | undefined`,elements:[{name:`union`,raw:`'content' | 'viewport' | 'fixed'`,elements:[{name:`literal`,value:`'content'`},{name:`literal`,value:`'viewport'`},{name:`literal`,value:`'fixed'`}]},{name:`undefined`}]},description:"`viewport` fills the viewport less 2 × layout.gap.section; `content` grows with rows (no virtualization); `fixed` uses `overrides.fixedHeight`.",defaultValue:{value:`'viewport'`,computed:!1}},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay, their text in cellMutedColor.",defaultValue:{value:`false`,computed:!1}},emptyMessage:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Shown when `data` is empty."},showStatusBar:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`A footer line with row count, selection count and, while editing, the validation message.`,defaultValue:{value:`true`,computed:!1}},container:{required:!1,tsType:{name:`union`,raw:`HTMLElement | undefined`,elements:[{name:`HTMLElement`},{name:`undefined`}]},description:`Portal target for the composed Select and DatePicker editors. Defaults to document.body.`},overrides:{required:!1,tsType:{name:`union`,raw:`DataGridOverrides | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'headerWeight'\r
| 'headerSize'\r
| 'headerBorder'\r
| 'headerBorderWidth'\r
| 'headerShadow'\r
| 'gridLine'\r
| 'gridLineWidth'\r
| 'rowHover'\r
| 'cellPaddingInline'\r
| 'columnWidth'\r
| 'pinnedShadow'\r
| 'resizeHandle'\r
| 'resizeHandleWidth'\r
| 'resizeStep'\r
| 'statusBarSize'\r
| 'statusBarPadding'\r
| 'statusBarGap'\r
| 'captionSize'\r
| 'captionWeight'\r
| 'captionGap'\r
| 'fixedHeight'\r
| 'fontFamily'\r
| 'fontSize'\r
| 'lineHeight'\r
| 'numericFont'\r
| 'transition'`,elements:[{name:`literal`,value:`'headerWeight'`},{name:`literal`,value:`'headerSize'`},{name:`literal`,value:`'headerBorder'`},{name:`literal`,value:`'headerBorderWidth'`},{name:`literal`,value:`'headerShadow'`},{name:`literal`,value:`'gridLine'`},{name:`literal`,value:`'gridLineWidth'`},{name:`literal`,value:`'rowHover'`},{name:`literal`,value:`'cellPaddingInline'`},{name:`literal`,value:`'columnWidth'`},{name:`literal`,value:`'pinnedShadow'`},{name:`literal`,value:`'resizeHandle'`},{name:`literal`,value:`'resizeHandleWidth'`},{name:`literal`,value:`'resizeStep'`},{name:`literal`,value:`'statusBarSize'`},{name:`literal`,value:`'statusBarPadding'`},{name:`literal`,value:`'statusBarGap'`},{name:`literal`,value:`'captionSize'`},{name:`literal`,value:`'captionWeight'`},{name:`literal`,value:`'captionGap'`},{name:`literal`,value:`'fixedHeight'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'numericFont'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<DataGridOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<DataGridOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},onSortChange:{required:!1,tsType:{name:`union`,raw:`((column: string, direction: DataGridSortDirection) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`As Table.`},onSelectionChange:{required:!1,tsType:{name:`union`,raw:`((selection: DataGridSelection) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the selection: row ids, one cell, or a range. Fired only when the selection actually changes.`},onCellChange:{required:!1,tsType:{name:`union`,raw:`| ((rowId: string, column: string, value: DataGridCellValue, previous: DataGridCellValue) => void)\r
| undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when an edit commits, only when the committed value differs from the cell's (Object.is). The caller updates `data`."},onEditStart:{required:!1,tsType:{name:`union`,raw:`((rowId: string, column: string) => boolean | void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when an editor opens; return false to refuse editing that cell.`},onRangeNeeded:{required:!1,tsType:{name:`union`,raw:`((start: number, end: number) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the visible window comes within one page of the end of `data` and `rowCount` says there is more."},onColumnResize:{required:!1,tsType:{name:`union`,raw:`((column: string, width: number) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when the user finishes dragging a resizable column edge, or on keyup of Shift after Shift+ArrowLeft/Right resizing.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDivElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var _,De,v,Oe,ke,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W;function Ae(){return(Ae=e((()=>{Ee(),_=[{key:`sku`,header:`SKU`,isRowHeader:!0,width:160,pinned:`start`},{key:`name`,header:`Name`,sortable:!0,resizable:!0},{key:`category`,header:`Category`,sortable:!0},{key:`price`,header:`Price (USD)`,abbr:`Price in US dollars`,align:`end`},{key:`stock`,header:`Qty`,abbr:`Quantity in stock`,align:`end`}],De=[`Widget`,`Sprocket`,`Gear`,`Flange`,`Bracket`,`Hinge`,`Spring`,`Valve`],v=[`Hardware`,`Fittings`,`Motion`],Oe=Array.from({length:200},(e,t)=>({id:`row-${t}`,sku:`A-${1e3+t}`,name:`${De[t%De.length]} ${Math.floor(t/De.length)+1}`,category:v[t%v.length],price:t*37%500+10,stock:t*13%90})),ke={title:`DataGrid/React`,component:xe,tags:[`autodocs`],args:{caption:`Price list`,columns:_,data:Oe}},y={},b={args:{captionLevel:`2`}},x={args:{captionLevel:`3`}},S={args:{captionLevel:`4`}},C={args:{selectable:`none`}},w={args:{selectable:`row`}},T={args:{selectable:`cell`}},E={args:{selectable:`range`}},D={args:{density:`compact`}},O={args:{density:`comfortable`}},k={args:{height:`content`,data:Oe.slice(0,8)}},A={args:{height:`viewport`}},j={args:{height:`fixed`,overrides:{fixedHeight:`layout.maxWidth.prose`}}},M={args:{hideCaption:!0}},N={args:{loading:!0}},P={args:{loading:!0,data:[]}},F={args:{data:[]}},I={args:{data:[],emptyMessage:`No prices loaded.`}},L={args:{showStatusBar:!1}},R={args:{editable:!0,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0},{key:`name`,header:`Name`,editable:!0,editor:`text`},{key:`category`,header:`Category`,editable:!0,editor:`select`,options:v.map(e=>({value:e,label:e}))},{key:`price`,header:`Price (USD)`,align:`end`,editable:!0,editor:`number`,validate:e=>typeof e==`number`&&e<0?`Price cannot be negative.`:void 0}]}},z={args:{selectable:`row`,data:Oe.slice(0,20)}},B={args:{caption:`Price list`,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0,width:160},{key:`name`,header:`Name`},{key:`price`,header:`Price`,align:`end`,sortable:!0}],data:[{id:`a`,sku:`A-1`,name:`Widget`,price:10},{id:`b`,sku:`B-2`,name:`Sprocket`,price:20}]}},V={args:{caption:`Stock levels`,editable:!0,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0},{key:`onHand`,header:`On hand`,align:`end`,editable:!0,editor:`number`}],data:[{id:`a`,sku:`A-1`,onHand:12},{id:`b`,sku:`B-2`,onHand:4}]}},H={args:{caption:`Orders`,selectable:`row`,density:`comfortable`,columns:[{key:`order`,header:`Order`,isRowHeader:!0},{key:`customer`,header:`Customer`}],data:[{id:`a`,order:`1001`,customer:`Ana Souza`},{id:`b`,order:`1002`,customer:`Bo Lin`}]}},U={args:{caption:`Daily figures`,selectable:`range`,height:`fixed`,columns:[{key:`day`,header:`Day`,isRowHeader:!0},{key:`visits`,header:`Visits`,align:`end`},{key:`signups`,header:`Signups`,align:`end`}],data:[{id:`a`,day:`Monday`,visits:1200,signups:30},{id:`b`,day:`Tuesday`,visits:1450,signups:41}]}},W=[`Default`,`CaptionLevel2`,`CaptionLevel3`,`CaptionLevel4`,`SelectableNone`,`SelectableRow`,`SelectableCell`,`SelectableRange`,`DensityCompact`,`DensityComfortable`,`HeightContent`,`HeightViewport`,`HeightFixed`,`HiddenCaption`,`Loading`,`LoadingFirstPage`,`Empty`,`EmptyWithMessage`,`WithoutStatusBar`,`Editable`,`Keyboard`,`PriceList`,`EditableCells`,`RowSelectionForBulkActions`,`RangeSelection`],y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '2'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '3'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '4'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'cell'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'range'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'content',
    data: data.slice(0, 8)
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'viewport'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'fixed',
    overrides: {
      fixedHeight: 'layout.maxWidth.prose'
    }
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    data: []
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    data: [],
    emptyMessage: 'No prices loaded.'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    showStatusBar: false
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    editable: true,
    columns: [{
      key: 'sku',
      header: 'SKU',
      isRowHeader: true
    }, {
      key: 'name',
      header: 'Name',
      editable: true,
      editor: 'text'
    }, {
      key: 'category',
      header: 'Category',
      editable: true,
      editor: 'select',
      options: categories.map(category => ({
        value: category,
        label: category
      }))
    }, {
      key: 'price',
      header: 'Price (USD)',
      align: 'end',
      editable: true,
      editor: 'number',
      validate: value => typeof value === 'number' && value < 0 ? 'Price cannot be negative.' : undefined
    }]
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row',
    data: data.slice(0, 20)
  }
}`,...z.parameters?.docs?.source},description:{story:`Keyboard gate: the grid is present with sortable headers and select checkboxes inside it.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}}})))()}Ae();export{b as CaptionLevel2,x as CaptionLevel3,S as CaptionLevel4,y as Default,O as DensityComfortable,D as DensityCompact,R as Editable,V as EditableCells,F as Empty,I as EmptyWithMessage,k as HeightContent,j as HeightFixed,A as HeightViewport,M as HiddenCaption,z as Keyboard,N as Loading,P as LoadingFirstPage,B as PriceList,U as RangeSelection,H as RowSelectionForBulkActions,T as SelectableCell,C as SelectableNone,E as SelectableRange,w as SelectableRow,L as WithoutStatusBar,W as __namedExportsOrder,ke as default};