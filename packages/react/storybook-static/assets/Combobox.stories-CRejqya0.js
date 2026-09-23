import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-BaAix2rE.js";import{t as n}from"./react-dom-Beiq-MTI.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as ee}from"./names-szlHjJ4U.js";import{n as a,r as o}from"./FormContext--1Y0XYw7.js";import{n as te,t as ne}from"./Button-CXwJSRqr.js";import{n as s,t as re}from"./Text-BmznDQS2.js";import{n as ie,t as ae}from"./Icon-CNCpSr-m.js";import{n as c,t as oe}from"./Listbox-x-lqtNEb.js";function se(e){let t={},n={},r,i;for(let a of Object.keys(e??{})){let o=e?.[a];o&&(a===`labelWeight`?r={fontWeight:o}:a===`helperSize`?i={fontSize:o}:m[a]?t[m[a]]=ee(o):ve[a]&&(n[ve[a]]=ee(o)))}return{root:Object.keys(t).length?t:void 0,popup:Object.keys(n).length?n:void 0,label:r,helper:i}}function ce(e){return`group`in e}function le(e){let t=[];for(let n of e)ce(n)?t.push(...le(n.options)):t.push(n);return t}function ue(e,t){let n=[];for(let r of e)if(ce(r)){let e=r.options.filter(t);e.length>0&&n.push({group:r.group,options:e})}else t(r)&&n.push(r);return n}function l(e){return e.normalize(`NFD`).replace(h,``).toLowerCase()}function de(e){return Array.isArray(e)?e:e===void 0||e===``?[]:[e]}function fe(e){let t=/^(-?\d*\.?\d+)(ms|s)$/.exec(e.trim());if(!t)return null;let n=Number(t[1]);return t[2]===`s`?n*1e3:n}function pe(e,t){let n=window.innerHeight,r=e.bottom+t.height>n&&e.top>n-e.bottom?`top`:`bottom`,i=Math.max(t.width,e.width);return{vertical:r,left:Math.max(0,Math.min(e.left,window.innerWidth-i)),top:r===`bottom`?e.bottom:void 0,bottom:r===`top`?n-e.top:void 0,minInlineSize:e.width}}function me(e,t){return e!==null&&e.vertical===t.vertical&&e.left===t.left&&e.top===t.top&&e.bottom===t.bottom&&e.minInlineSize===t.minInlineSize}function u({ref:e,label:t,name:n,options:r,value:i,defaultValue:ee,open:a,inputValue:te,multiple:s=!1,allowCustom:ie=!1,filter:c=`contains`,placeholder:ce,description:u,required:m=!1,disabled:ve=!1,invalid:h=!1,error:g,loading:ye=!1,clearable:be=!0,container:xe,overrides:_,onChange:v,onInputChange:y,onOpenChange:b,onKeyDown:x,onClick:S,onBlur:C,id:w,readOnly:T,...E}){let D=o(),O=(0,d.useId)(),k=w??(D?.idBase?`${D.idBase}-${n}`:`ds-combobox${O}`),A=`${k}-label`,j=`${k}-description`,M=`${k}-error`,N=`${k}-listbox`,Se=e=>`${N}-option-${e}`,P=(0,d.useRef)(null),F=(0,d.useRef)(null),I=(0,d.useRef)(null),Ce=(0,d.useRef)(null),we=(0,d.useRef)(null);(0,d.useImperativeHandle)(e,()=>I.current,[]),(0,d.useEffect)(()=>{},[t]);let Te=(0,d.useMemo)(()=>le(r),[r]),L=e=>Te.find(t=>t.value===e)?.label??e,Ee=i!==void 0,[De,Oe]=(0,d.useState)(ee),ke=Ee?i:De,R=de(ke),z=s?void 0:R[0],Ae=te!==void 0,[je,Me]=(0,d.useState)(()=>{let e=s?void 0:de(i??ee)[0];return e===void 0?``:L(e)}),B=Ae?te:je,V=B.trim(),H=ve||(D?.disabled??!1),[Ne,Pe]=(0,d.useState)(!1),U=(a??Ne)&&!H,[Fe,Ie]=(0,d.useState)(!1),[Le,Re]=(0,d.useState)(null),[ze,Be]=(0,d.useState)(`selectedOrFirst`),[Ve,He]=(0,d.useState)({generation:0,intent:`selectedOrFirst`}),[Ue,We]=(0,d.useState)(U),[W,Ge]=(0,d.useState)(null),[Ke,qe]=(0,d.useState)(``),Je=e=>{Re(null),He(t=>({generation:t.generation+1,intent:e}))};U!==Ue&&(We(U),Re(null),U?(He(e=>({generation:e.generation+1,intent:ze})),Be(`selectedOrFirst`)):Ie(!1));let Ye=D?.errors[n],Xe=h||Ye!==void 0,Ze=g!==void 0&&g!==``?g:Ye!==void 0&&Ye!==``?Ye:Xe?p.invalid.replace(`{label}`,t):void 0,Qe=Xe||Ze!==void 0,G=c===`async`&&ye,$e=Fe||c===`none`||c===`async`?``:l(V),K=(0,d.useMemo)(()=>$e===``?r:ue(r,e=>c===`startsWith`?l(e.label).startsWith($e):l(e.label).includes($e)),[r,c,$e]),et=(0,d.useMemo)(()=>le(K).length,[K]),tt=l(V),nt=ie&&V!==``&&!Te.some(e=>l(e.value)===tt||l(e.label)===tt),rt=(0,d.useMemo)(()=>G?[]:nt?[{value:_e,label:p.addCustom.replace(`{value}`,V)},...K]:K,[G,nt,V,K]),q=(0,d.useMemo)(()=>le(rt).filter(e=>!e.disabled),[rt]),it=(e=>{let t=q.find(e=>R.includes(e.value))?.value;if(e!==`none`)return e===`selected`?t:e===`selectedOrFirst`?t??q[0]?.value:e===`selectedOrLast`?t??q[q.length-1]?.value:e===`typeahead`?tt===``?void 0:q.find(e=>l(e.label).startsWith(tt))?.value:q.some(t=>t.value===e.value)?e.value:void 0})(Ve.intent);(0,d.useLayoutEffect)(()=>{U&&it!==void 0&&we.current?.dispatchEvent(new FocusEvent(`focusin`,{bubbles:!0}))},[U,Ve.generation]),(0,d.useLayoutEffect)(()=>{if(!U)return;let e=I.current;e&&!F.current?.contains(document.activeElement)&&e.focus()},[U]);let at=`${G}|${Te.map(e=>e.value).join(`\0`)}`,ot=(0,d.useRef)(at);(0,d.useEffect)(()=>{ot.current!==at&&(ot.current=at,U&&Je(`none`))},[at]),(0,d.useEffect)(()=>{s||Ae||z===void 0||Me(L(z))},[z]);let J=(0,d.useRef)({label:t,required:m,invalid:h,error:g,disabled:H,selected:ke,multiple:s});J.current={label:t,required:m,invalid:h,error:g,disabled:H,selected:ke,multiple:s},(0,d.useEffect)(()=>{if(D)return D.register({name:n,id:k,get label(){return J.current.label},getValue:()=>{let e=de(J.current.selected);if(e.length!==0)return J.current.multiple?e:e[0]},isDisabled:()=>J.current.disabled,validate:()=>{let e=J.current;return e.error===void 0?e.required&&de(e.selected).length===0?p.required.replace(`{label}`,e.label):e.invalid?p.invalid.replace(`{label}`,e.label):null:e.error},focus:()=>I.current?.focus()})},[D,n,k]),(0,d.useEffect)(()=>{if(!U){qe(``);return}let e;if(G)e=p.loading;else if(et===0)e=p.empty;else{let t=P.current?.closest(`[lang]`)?.getAttribute(`lang`)||void 0,n;try{n=new Intl.PluralRules(t)}catch{n=new Intl.PluralRules}e=(n.select(et)===`one`?p.resultCount.one:p.resultCount.other).replace(`{count}`,String(et))}let t=P.current?fe(getComputedStyle(P.current).getPropertyValue(ge.token)):null,n=setTimeout(()=>qe(e),t===null?0:t*ge.multiply);return()=>clearTimeout(n)},[U,G,et]),(0,d.useLayoutEffect)(()=>{if(!U)return;let e=()=>{let e=F.current,t=Ce.current;if(!e||!t)return;let n=pe(e.getBoundingClientRect(),t.getBoundingClientRect());Ge(e=>me(e,n)?e:n)};return e(),window.addEventListener(`scroll`,e,!0),window.addEventListener(`resize`,e),()=>{window.removeEventListener(`scroll`,e,!0),window.removeEventListener(`resize`,e)}},[U,rt]);let st=e=>{e===U||e&&H||(a===void 0&&Pe(e),b?.(e))},Y=e=>{if(U){Je(e);return}Be(e),st(!0)},X=()=>st(!1),ct=(0,d.useRef)(X);ct.current=X,(0,d.useEffect)(()=>{if(!U)return;let e=e=>!(e instanceof Node)||!F.current?.contains(e)&&!Ce.current?.contains(e),t=t=>{e(t.target)&&ct.current()},n=t=>{F.current?.contains(t.target)&&e(t.relatedTarget)&&ct.current()};return document.addEventListener(`pointerdown`,t),document.addEventListener(`focusout`,n),()=>{document.removeEventListener(`pointerdown`,t),document.removeEventListener(`focusout`,n)}},[U]);let Z=e=>{Ee||Oe(e),v?.(e),D&&D.validate===`change`&&D.validateField(n)},Q=e=>{e!==B&&(Ae||Me(e),y?.(e))},lt=e=>{if(e===``)return;let t=l(e),n=Te.find(e=>l(e.value)===t||l(e.label)===t);if(n?.disabled)return;let r=n?.value??e;s?(R.includes(r)||Z([...R,r]),Q(``),Je(`none`)):(r!==z&&Z(r),Q(n?.label??e),X())},ut=e=>{if(e===_e){lt(V);return}s?(Z(R.includes(e)?R.filter(t=>t!==e):[...R,e]),Q(``),Je({value:e})):(e!==z&&Z(e),Q(L(e)),X())},dt=e=>{if(!Array.isArray(e)){ut(e);return}let t=e.find(e=>!R.includes(e))??R.find(t=>!e.includes(t));t!==void 0&&ut(t)},ft=e=>{if(s||z===void 0)return;let t=e.target.closest(`[role="option"]`);t&&t.id===Se(z)&&t.getAttribute(`aria-disabled`)!==`true`&&(Q(L(z)),X())},pt=e=>{H||(Ie(!1),Q(e.target.value),Y(c===`none`?`typeahead`:`none`))},mt=e=>{S?.(e),!(H||U)&&(Ie(!0),Y(`selectedOrFirst`))},ht=e=>{C?.(e),D&&(D.validate===`blur`||D.validate===`change`)&&D.validateField(n)},gt=e=>{we.current?.dispatchEvent(new KeyboardEvent(`keydown`,{key:e,bubbles:!0,cancelable:!0}))},_t=e=>{if(x?.(e),!e.defaultPrevented&&!H)switch(e.key){case`ArrowDown`:case`ArrowUp`:{e.preventDefault();let t=e.key===`ArrowDown`;t&&e.altKey?U||Y(`selected`):U?gt(e.key):Y(t?`selectedOrFirst`:`selectedOrLast`);break}case`Enter`:if(!U)break;e.preventDefault(),Le===null?ie&&lt(V):ut(Le);break;case`,`:if(!ie)break;e.preventDefault(),lt(V);break;case`Escape`:U?(e.preventDefault(),X()):be&&B!==``&&(e.preventDefault(),Q(``));break;case`Tab`:U&&X();break;case`Backspace`:s&&B===``&&R.length>0&&(e.preventDefault(),Z(R.slice(0,-1)))}},vt=()=>{H||(Q(``),R.length>0&&Z(s?[]:``),I.current?.focus())},yt=()=>{if(!H){if(I.current?.focus(),U){X();return}Ie(!0),Y(`selectedOrFirst`)}},bt=e=>{H||(Z(R.filter(t=>t!==e)),I.current?.focus())},xt=e=>{e.target===e.currentTarget&&(e.preventDefault(),I.current?.focus())},$=se(_),St=[u?j:null,Ze===void 0?null:M].filter(Boolean).join(` `),Ct=be&&!H&&(R.length>0||B!==``),wt=[`ds-combobox`,Qe?`ds-combobox--invalid`:null,H?`ds-combobox--disabled`:null].filter(Boolean).join(` `),Tt={...$.popup,...W?{left:W.left,top:W.top,bottom:W.bottom,minInlineSize:W.minInlineSize}:null};return(0,f.jsxs)(`div`,{ref:P,"data-ds":`Combobox`,"data-ds-field":``,className:wt,style:$.root,children:[(0,f.jsx)(`label`,{htmlFor:k,id:A,className:`ds-combobox__label`,"data-part":`label`,children:(0,f.jsxs)(re,{element:`span`,weight:`medium`,overrides:$.label,children:[t,m?p.requiredIndicator:null]})}),u?(0,f.jsx)(re,{element:`p`,id:j,size:`sm`,tone:`muted`,"data-part":`description`,overrides:$.helper,children:u}):null,(0,f.jsxs)(`div`,{ref:F,className:`ds-combobox__field`,"data-part":`field`,onMouseDown:xt,children:[s&&R.length>0?(0,f.jsx)(`span`,{className:`ds-combobox__chips`,"data-part":`chips`,children:R.map(e=>{let t=L(e);return(0,f.jsxs)(`span`,{className:`ds-combobox__chip`,"data-part":`chip`,children:[(0,f.jsx)(`span`,{className:`ds-combobox__chip-label`,children:t}),(0,f.jsx)(`span`,{className:`ds-combobox__control`,"data-part":`chipRemove`,onClick:()=>bt(e),children:(0,f.jsx)(ne,{variant:`ghost`,size:`sm`,iconOnly:!0,label:p.removeChip.replace(`{label}`,t),leadingIcon:(0,f.jsx)(ae,{name:`close`,inline:!0,overrides:{color:`color.foreground.muted`}}),disabled:H})})]},e)})}):null,(0,f.jsx)(`input`,{...E,ref:I,id:k,type:`text`,role:`combobox`,className:`ds-combobox__input`,"data-part":`input`,value:B,placeholder:ce,readOnly:H||T,autoComplete:`off`,"aria-autocomplete":`list`,"aria-haspopup":`listbox`,"aria-expanded":U?`true`:`false`,"aria-controls":N,"aria-activedescendant":U&&Le!==null?Se(Le):void 0,"aria-describedby":St||void 0,"aria-invalid":Qe?`true`:void 0,"aria-required":m?`true`:void 0,"aria-disabled":H?`true`:void 0,onChange:pt,onClick:mt,onKeyDown:_t,onBlur:ht}),Ct?(0,f.jsx)(`span`,{className:`ds-combobox__control`,"data-part":`clearButton`,onClick:vt,children:(0,f.jsx)(ne,{variant:`ghost`,size:`sm`,iconOnly:!0,label:p.clearLabel,leadingIcon:(0,f.jsx)(ae,{name:`close`,inline:!0,overrides:{color:`color.foreground.muted`}})})}):null,(0,f.jsx)(`span`,{className:`ds-combobox__control`,"data-part":`toggleButton`,onClick:yt,children:(0,f.jsx)(ne,{variant:`ghost`,size:`sm`,iconOnly:!0,label:p.toggleLabel,leadingIcon:(0,f.jsx)(ae,{name:`chevron-down`,inline:!0,overrides:{color:`color.foreground.muted`}}),disabled:H,tabIndex:-1})})]}),Ze===void 0?null:(0,f.jsx)(re,{element:`p`,id:M,size:`sm`,tone:`danger`,"data-part":`errorMessage`,overrides:$.helper,children:Ze}),(0,f.jsx)(`div`,{role:`status`,"aria-live":`polite`,className:`ds-combobox__status`,"data-part":`status`,children:Ke}),R.map(e=>(0,f.jsx)(`input`,{type:`hidden`,name:n,value:e,disabled:H},e)),U&&typeof document<`u`?(0,he.createPortal)((0,f.jsx)(`div`,{ref:Ce,className:`ds-combobox__popup`,"data-part":`popup`,"data-vertical":W?.vertical??`bottom`,style:Tt,onMouseDown:e=>e.preventDefault(),onClick:ft,children:(0,f.jsx)(oe,{ref:we,id:N,label:t,labelledBy:A,options:rt,multiple:s,value:s?R:z,selectionFollowsFocus:!1,embedded:!0,loading:G,disabled:H,emptyMessage:p.empty,initialActiveValue:it,onChange:dt,onActiveChange:Re},Ve.generation)}),xe??document.body):null]})}var d,he,f,p,ge,_e,m,ve,h;function g(){return(g=e((()=>{d=t(),he=n(),i(),te(),ie(),c(),s(),a(),f=r(),p={empty:`No matches`,loading:`Loading…`,addCustom:`Add "{value}"`,clearLabel:`Clear`,toggleLabel:`Show options`,removeChip:`Remove {label}`,resultCount:{one:`{count} result available`,other:`{count} results available`},required:`{label} is required.`,invalid:`{label} is not valid.`,requiredIndicator:` (required)`},ge={token:`--motion-duration-base`,multiply:2},_e=`ds-combobox-custom`,m={fieldBorderInvalid:`--ds-combobox-field-border-invalid`,fieldBorderWidth:`--ds-combobox-field-border-width`,fieldRadius:`--ds-combobox-field-radius`,fieldPaddingInline:`--ds-combobox-field-padding-inline`,fieldPaddingBlock:`--ds-combobox-field-padding-block`,fieldGap:`--ds-combobox-field-gap`,chipRadius:`--ds-combobox-chip-radius`,chipPaddingInline:`--ds-combobox-chip-padding-inline`,chipPaddingBlock:`--ds-combobox-chip-padding-block`,chipGap:`--ds-combobox-chip-gap`,partGap:`--ds-combobox-part-gap`,fontFamily:`--ds-combobox-font-family`,fontSize:`--ds-combobox-font-size`,chipSize:`--ds-combobox-chip-size`,lineHeight:`--ds-combobox-line-height`,disabledOpacity:`--ds-combobox-disabled-opacity`},ve={popupSurface:`--ds-combobox-popup-surface`,popupBorder:`--ds-combobox-popup-border`,popupBorderWidth:`--ds-combobox-popup-border-width`,popupShadow:`--ds-combobox-popup-shadow`,popupRadius:`--ds-combobox-popup-radius`,popupOffset:`--ds-combobox-popup-offset`,layer:`--ds-combobox-layer`,enter:`--ds-combobox-enter`},h=/\p{M}/gu,u.__docgenInfo={description:"Combobox — Design Schema, category: input.\n\nWhen to use:\nUse a Combobox for long lists (fifty-plus: people, cities, products), for values that can be typed faster than found (dates, codes), for `async` search against a server, and for multi-value fields where chips make the selection legible (recipients, tags, filters). Use `allowCustom` when new values are legitimate (tags, invitees by email) and never when the value must exist (a customer id). Use `filter: none` when the list is short but chips are wanted.",methods:[],displayName:`Combobox`,props:{label:{required:!0,tsType:{name:`string`},description:`Visible label. Always rendered.`},name:{required:!0,tsType:{name:`string`},description:`Field name for the Form.`},options:{required:!0,tsType:{name:`Array`,elements:[{name:`union`,raw:`ListboxOption | ListboxGroup`,elements:[{name:`signature`,type:`object`,raw:`{
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
}`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`description`,value:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}],required:!1}},{key:`icon`,value:{name:`union`,raw:`IconName | undefined`,elements:[{name:`union`,raw:`| 'check'
| 'dash'
| 'chevron-right'
| 'chevron-down'
| 'chevron-up'
| 'chevron-left'
| 'close'
| 'plus'
| 'minus'
| 'info'
| 'success'
| 'warning'
| 'danger'
| 'external'
| 'ellipsis'
| 'search'
| 'arrow-right'
| 'arrow-left'
| 'calendar'
| 'menu'
| 'list'
| 'grid'
| 'play'
| 'pause'
| 'folder'
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}]},{name:`undefined`}],required:!1}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}},{name:`signature`,type:`object`,raw:`{ group: string; options: ListboxOption[] }`,signature:{properties:[{key:`group`,value:{name:`string`,required:!0}},{key:`options`,value:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
}`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`description`,value:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}],required:!1}},{key:`icon`,value:{name:`union`,raw:`IconName | undefined`,elements:[{name:`union`,raw:`| 'check'
| 'dash'
| 'chevron-right'
| 'chevron-down'
| 'chevron-up'
| 'chevron-left'
| 'close'
| 'plus'
| 'minus'
| 'info'
| 'success'
| 'warning'
| 'danger'
| 'external'
| 'ellipsis'
| 'search'
| 'arrow-right'
| 'arrow-left'
| 'calendar'
| 'menu'
| 'list'
| 'grid'
| 'play'
| 'pause'
| 'folder'
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}]},{name:`undefined`}],required:!1}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}}],raw:`ListboxOption[]`,required:!0}}]}}]}],raw:`ListboxItem[]`},description:"The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering."},value:{required:!1,tsType:{name:`union`,raw:`ComboboxValue | undefined`,elements:[{name:`union`,raw:`string | string[]`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`}]},{name:`undefined`}]},description:"Controlled selected value(s). With `multiple`, an array. With `allowCustom`, a value not in `options` is a custom entry."},defaultValue:{required:!1,tsType:{name:`union`,raw:`ComboboxValue | undefined`,elements:[{name:`union`,raw:`string | string[]`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`}]},{name:`undefined`}]},description:`Initial value(s).`},open:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Controlled popup state, for programmatic use and for stories and tests. Omit for the typing-driven default.`},inputValue:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Controlled text of the input (what the user has typed). Usually uncontrolled; controlled by consumers driving `async` filtering."},multiple:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Pick many: selected options appear as chips before the input, each removable; the list stays
open while toggling; Backspace in an empty input removes the last chip. Uses the same Listbox
engine as Select.`,defaultValue:{value:`false`,computed:!1}},allowCustom:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Typed text that matches no option can be committed as a value (tags, emails). Enter or a comma\ncommits it; the list shows `copy.addCustom` as a synthetic first row, suppressed when the\ntrimmed text already matches an existing option by either its `value` or its `label`.\nCommitting text that matches an option that way (Enter or a comma, same case- and\ndiacritic-insensitive match) commits that option's `value`, never a custom string. If the\nmatching option is disabled, the row stays suppressed and the commit does nothing (neither the\ndisabled value nor a custom string). With `multiple`, text matching an already-selected option\nleaves it selected (no `onChange`, unlike Enter on its row, which toggles) and clears the text.\nA comma typed when there is nothing to commit (empty text, or only a disabled match) is dropped\nand the text before it kept.",defaultValue:{value:`false`,computed:!1}},filter:{required:!1,tsType:{name:`union`,raw:`ComboboxFilter | undefined`,elements:[{name:`union`,raw:`'startsWith' | 'contains' | 'none' | 'async'`,elements:[{name:`literal`,value:`'startsWith'`},{name:`literal`,value:`'contains'`},{name:`literal`,value:`'none'`},{name:`literal`,value:`'async'`}]},{name:`undefined`}]},description:"How typing narrows `options`: by prefix, by substring (default), not at all (the list is a\npicker; typing is type-ahead — it opens the list and moves the active option to the first label\nstarting with the typed characters, without filtering), or by the consumer (`async`: the\ncomponent shows `copy.loading` and the consumer updates `options` from `onInputChange`).",defaultValue:{value:`'contains'`,computed:!1}},placeholder:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Example input shown while empty. Never the only description.`},description:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Helper text under the label.`},required:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Must have a value to submit.`,defaultValue:{value:`false`,computed:!1}},disabled:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Not editable, not submitted, still readable and focusable.`,defaultValue:{value:`false`,computed:!1}},invalid:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Marks the field invalid.`,defaultValue:{value:`false`,computed:!1}},error:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Error message; implies invalid.`},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"For `async`: show the loading row and announce it. The consumer sets it around its request.",defaultValue:{value:`false`,computed:!1}},clearable:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show a clear button when there is a value or text.`,defaultValue:{value:`true`,computed:!1}},container:{required:!1,tsType:{name:`union`,raw:`HTMLElement | undefined`,elements:[{name:`HTMLElement`},{name:`undefined`}]},description:"Portal target for the popup. Defaults to `document.body`. Platform prop; never affects semantics."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'fieldBorderInvalid'
| 'fieldBorderWidth'
| 'fieldRadius'
| 'fieldPaddingInline'
| 'fieldPaddingBlock'
| 'fieldGap'
| 'chipRadius'
| 'chipPaddingInline'
| 'chipPaddingBlock'
| 'chipGap'
| 'partGap'
| 'labelWeight'
| 'helperSize'
| 'popupSurface'
| 'popupBorder'
| 'popupBorderWidth'
| 'popupShadow'
| 'popupRadius'
| 'popupOffset'
| 'layer'
| 'fontFamily'
| 'fontSize'
| 'chipSize'
| 'lineHeight'
| 'disabledOpacity'
| 'enter'`,elements:[{name:`literal`,value:`'fieldBorderInvalid'`},{name:`literal`,value:`'fieldBorderWidth'`},{name:`literal`,value:`'fieldRadius'`},{name:`literal`,value:`'fieldPaddingInline'`},{name:`literal`,value:`'fieldPaddingBlock'`},{name:`literal`,value:`'fieldGap'`},{name:`literal`,value:`'chipRadius'`},{name:`literal`,value:`'chipPaddingInline'`},{name:`literal`,value:`'chipPaddingBlock'`},{name:`literal`,value:`'chipGap'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'labelWeight'`},{name:`literal`,value:`'helperSize'`},{name:`literal`,value:`'popupSurface'`},{name:`literal`,value:`'popupBorder'`},{name:`literal`,value:`'popupBorderWidth'`},{name:`literal`,value:`'popupShadow'`},{name:`literal`,value:`'popupRadius'`},{name:`literal`,value:`'popupOffset'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'chipSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'disabledOpacity'`},{name:`literal`,value:`'enter'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<ComboboxOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},onChange:{required:!1,tsType:{name:`union`,raw:`((value: string | string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`)."},onInputChange:{required:!1,tsType:{name:`union`,raw:`((value: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired on every text change the user causes — each keystroke, and the text a commit, Escape-to-clear\nor the clear button leaves behind (so `async` consumers can reset) — with the input text. Not fired\nwhen a controlled `value` change rewrites the label, nor when a commit, Escape or the clear button\nleaves the text unchanged. The hook for `async` filtering."},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((open: boolean) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when the list opens or closes.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLInputElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLInputElement`}],raw:`Ref<HTMLInputElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var ye,be,xe,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,Se;function P(){return(P=e((()=>{ye=t(),g(),be=r(),xe={title:`Combobox/React`,component:u,args:{label:`Fruit`,name:`fruit`,options:[{value:`apple`,label:`Apple`},{value:`apricot`,label:`Apricot`},{value:`banana`,label:`Banana`}]},tags:[`autodocs`]},_={},v={args:{filter:`startsWith`}},y={args:{filter:`contains`}},b={args:{filter:`none`}},x={args:{filter:`async`}},S={args:{label:`Fruit`,name:`fruit`,options:[{value:`apple`,label:`Apple`},{value:`apricot`,label:`Apricot`},{value:`banana`,label:`Banana`}]}},C={args:{label:`Roles`,name:`roles`,multiple:!0,defaultValue:[`frontend`],options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`},{value:`design`,label:`Design`}]}},w={args:{label:`Tags`,name:`tags`,multiple:!0,allowCustom:!0,options:[{value:`urgent`,label:`Urgent`},{value:`billing`,label:`Billing`}]}},T={args:{label:`Customer`,name:`customer`,filter:`async`,loading:!0,options:[{value:`acme`,label:`Acme Ltd`}]}},E={args:{open:!0}},D={args:{description:`Used for the produce order.`,placeholder:`Search fruit`}},O={args:{required:!0}},k={args:{disabled:!0,defaultValue:`banana`}},A={args:{invalid:!0}},j={args:{error:`Choose a fruit from the list.`}},M={args:{clearable:!1,defaultValue:`apple`}},N={args:{open:!0,defaultValue:`apple`},render:function(e){let[t,n]=(0,ye.useState)(e.open??!0);return(0,be.jsx)(u,{...e,open:t,onOpenChange:t=>{n(t),e.onOpenChange?.(t)}})}},Se=[`Default`,`FilterStartsWith`,`FilterContains`,`FilterNone`,`FilterAsync`,`FruitPicker`,`MultiSelectWithChips`,`FreeTextTags`,`AsyncResults`,`Open`,`WithDescription`,`Required`,`Disabled`,`Invalid`,`WithError`,`NotClearable`,`Keyboard`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'startsWith'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'contains'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'none'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'async'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Fruit',
    name: 'fruit',
    options: [{
      value: 'apple',
      label: 'Apple'
    }, {
      value: 'apricot',
      label: 'Apricot'
    }, {
      value: 'banana',
      label: 'Banana'
    }]
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Roles',
    name: 'roles',
    multiple: true,
    defaultValue: ['frontend'],
    options: [{
      value: 'frontend',
      label: 'Frontend'
    }, {
      value: 'backend',
      label: 'Backend'
    }, {
      value: 'design',
      label: 'Design'
    }]
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Tags',
    name: 'tags',
    multiple: true,
    allowCustom: true,
    options: [{
      value: 'urgent',
      label: 'Urgent'
    }, {
      value: 'billing',
      label: 'Billing'
    }]
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Customer',
    name: 'customer',
    filter: 'async',
    loading: true,
    options: [{
      value: 'acme',
      label: 'Acme Ltd'
    }]
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Used for the produce order.',
    placeholder: 'Search fruit'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'banana'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Choose a fruit from the list.'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    clearable: false,
    defaultValue: 'apple'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    defaultValue: 'apple'
  },
  render: function KeyboardStory(args) {
    const [open, setOpen] = useState(args.open ?? true);
    return <Combobox {...args} open={open} onOpenChange={next => {
      setOpen(next);
      args.onOpenChange?.(next);
    }} />;
  }
}`,...N.parameters?.docs?.source},description:{story:"Open with its input, for the keyboard gate: the options are the focusable children, reached\r\nthrough aria-activedescendant while DOM focus stays in the input. `defaultValue` is set so the\r\nclear button renders and the story has enough focusable children. Args come from the story URL;\r\nthe story owns `open` so Escape and Tab really close it.",...N.parameters?.docs?.description}}}})))()}P();export{T as AsyncResults,_ as Default,k as Disabled,x as FilterAsync,y as FilterContains,b as FilterNone,v as FilterStartsWith,w as FreeTextTags,S as FruitPicker,A as Invalid,N as Keyboard,C as MultiSelectWithChips,M as NotClearable,E as Open,O as Required,D as WithDescription,j as WithError,Se as __namedExportsOrder,xe as default};