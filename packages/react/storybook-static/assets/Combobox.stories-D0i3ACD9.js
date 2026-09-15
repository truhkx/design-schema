import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-CC7880zu.js";import{t as n}from"./react-dom-BROIUpey.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./names-szlHjJ4U.js";import{n as o,r as s}from"./FormContext-CIIsFCPQ.js";import{n as c,t as l}from"./Button-srnfIrN1.js";import{n as ee,t as te}from"./Text-Cwfpaq7X.js";import{n as u,t as ne}from"./Icon-BApvlPYp.js";import{n as re,t as ie}from"./Listbox-DMo7nEv5.js";function ae(e){let t={},n={},r={},i={};for(let o of Object.keys(e)){let s=e[o];if(!s)continue;if(o===`labelWeight`){r.fontWeight=s;continue}if(o===`helperSize`){i.fontSize=s;continue}let c=_[o];if(c){t[c]=a(s);continue}let l=me[o];l&&(n[l]=a(s))}return{rootStyle:t,popupStyle:n,labelOverrides:r,descriptionOverrides:i}}function oe(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}function d(e){return`group`in e}function se(e){let t=[];for(let n of e)d(n)?t.push(...se(n.options)):t.push(n);return t}function ce(e,t){let n=[];for(let r of e)if(d(r)){let e=ce(r.options,t);e.length>0&&n.push({group:r.group,options:e})}else t(r)&&n.push(r);return n}function f(e){return e.normalize(`NFD`).replace(v,``).toLowerCase()}function p(e){return Array.isArray(e)?e:[]}function le(e,t){return t.find(t=>t.value===e)?.label??e}function ue(e,t,n){if(!e)return;let r=Array.from(document.querySelectorAll(y)).filter(e=>!t||!t.contains(e)),i=r.indexOf(e);i!==-1&&r[i+n]?.focus()}function de(e,t){let n=window.innerHeight,r=`bottom`;e.bottom+t.height>n&&e.top-t.height>=0&&(r=`top`);let i={left:e.left,"--ds-combobox-field-width":`${e.width}px`};return r===`bottom`?i.top=e.bottom:i.bottom=n-e.top,{style:i,vertical:r}}var m,fe,h,g,pe,_,me,he,v,y,b;function ge(){return(ge=e((()=>{m=t(),fe=n(),i(),u(),ee(),c(),re(),o(),h=r(),g={empty:`No matches`,loading:`Loading…`,addCustom:`Add "{value}"`,clearLabel:`Clear`,toggleLabel:`Show options`,removeChip:`Remove {label}`,resultCount:`{count} results available`,required:`{label} is required.`,invalid:`{label} is not valid.`,requiredIndicator:` (required)`},pe=500,_={fieldBorderFocus:`--ds-combobox-field-border-focus`,fieldBorderInvalid:`--ds-combobox-field-border-invalid`,fieldBorderWidth:`--ds-combobox-field-border-width`,fieldRadius:`--ds-combobox-field-radius`,fieldPaddingInline:`--ds-combobox-field-padding-inline`,fieldPaddingBlock:`--ds-combobox-field-padding-block`,fieldGap:`--ds-combobox-field-gap`,chipRadius:`--ds-combobox-chip-radius`,chipPaddingInline:`--ds-combobox-chip-padding-inline`,chipPaddingBlock:`--ds-combobox-chip-padding-block`,chipGap:`--ds-combobox-chip-gap`,partGap:`--ds-combobox-part-gap`,fontFamily:`--ds-combobox-font-family`,fontSize:`--ds-combobox-font-size`,chipSize:`--ds-combobox-chip-size`,lineHeight:`--ds-combobox-line-height`,disabledOpacity:`--ds-combobox-disabled-opacity`},me={popupSurface:`--ds-combobox-popup-surface`,popupBorder:`--ds-combobox-popup-border`,popupShadow:`--ds-combobox-popup-shadow`,popupRadius:`--ds-combobox-popup-radius`,popupOffset:`--ds-combobox-popup-offset`,layer:`--ds-combobox-layer`,enter:`--ds-combobox-enter`},he=typeof process<`u`&&!1,v=RegExp(`[̀-ͯ]`,`g`),y=[`a[href]`,`button:not([disabled])`,`input:not([disabled])`,`select:not([disabled])`,`textarea:not([disabled])`,`[contenteditable]:not([contenteditable="false"])`,`[tabindex]:not([tabindex="-1"])`].join(`,`),b=function({ref:e,label:t,name:n,options:r,value:i,defaultValue:a,inputValue:o,multiple:c=!1,allowCustom:ee=!1,filter:u=`contains`,placeholder:re,description:d,required:_=!1,disabled:me=!1,invalid:v=!1,error:y,loading:b=!1,clearable:ge=!0,container:_e,overrides:x,onChange:S,onInputChange:ve,onOpenChange:ye,id:C,className:w,style:T,onFocus:E,onBlur:D,...O}){let k=s(),A=(0,m.useId)(),j=C??(k?.idBase?`${k.idBase}-${n}`:`ds-combobox${A}`),M=`${j}-label`,N=`${j}-description`,P=`${j}-error`,F=`${j}-status`,I=`${j}-listbox`,L=(0,m.useRef)(null);(0,m.useImperativeHandle)(e,()=>L.current,[]);let R=(0,m.useRef)(null),z=(0,m.useRef)(null),be=(0,m.useRef)(null),xe=(0,m.useRef)(null),Se=i!==void 0,[Ce,we]=(0,m.useState)(a??(c?[]:void 0)),B=Se?i:Ce,V=(0,m.useMemo)(()=>se(r),[r]),Te=o!==void 0,[Ee,De]=(0,m.useState)(()=>{if(c)return``;let e=typeof a==`string`?a:typeof i==`string`?i:void 0;return e?le(e,V):``}),H=Te?o:Ee,[U,Oe]=(0,m.useState)(!1),[ke,Ae]=(0,m.useState)(null),[je,Me]=(0,m.useState)(!1),[Ne,Pe]=(0,m.useState)(0),[Fe,Ie]=(0,m.useState)(),[Le,Re]=(0,m.useState)(`bottom`),[ze,Be]=(0,m.useState)(!1),[Ve,He]=(0,m.useState)(``),W=me||(k?.disabled??!1),Ue=y??k?.errors[n],We=v||Ue!==void 0,G=u===`async`&&b;(0,m.useEffect)(()=>{Te||c||typeof B==`string`&&B!==``&&De(le(B,V))},[B]),he&&!t&&console.warn("Combobox: `label` is required and becomes the input’s accessible name.");let K=(0,m.useRef)({label:t,required:_,disabled:W,selected:B,multiple:c,invalid:v,error:y});K.current={label:t,required:_,disabled:W,selected:B,multiple:c,invalid:v,error:y},(0,m.useEffect)(()=>{if(k)return k.register({name:n,id:j,get label(){return K.current.label},getValue:()=>{let{selected:e,multiple:t}=K.current;if(t){let t=p(e);return t.length>0?t:void 0}return typeof e==`string`&&e!==``?e:void 0},isDisabled:()=>K.current.disabled,validate:()=>{let{label:e,required:t,selected:n,multiple:r,invalid:i,error:a}=K.current;if(a!==void 0)return a;let o=r?p(n).length>0:typeof n==`string`&&n!==``;return t&&!o?g.required.replace(`{label}`,e):i?g.invalid.replace(`{label}`,e):null},focus:()=>L.current?.focus()})},[k,n,j]);let q=e=>{Se||we(e),S?.(e),k&&k.validate===`change`&&k.validateField(n)},J=e=>{Te||De(e),ve?.(e)},Ge=e=>{Oe(e),ye?.(e)},Y=()=>{U||W||Ge(!0)},X=()=>{U&&(Ae(null),Ge(!1))},Ke=f((je||u===`none`?``:H).trim()),Z=(0,m.useMemo)(()=>u===`async`||u===`none`||Ke===``?r:ce(r,e=>{let t=f(e.label);return u===`startsWith`?t.startsWith(Ke):t.includes(Ke)}),[r,u,Ke]),Q=H.trim(),qe=ee&&Q!==``&&!V.some(e=>f(e.label)===f(Q)||f(e.value)===f(Q)),Je=(0,m.useMemo)(()=>{let e=qe?[{value:Q,label:g.addCustom.replace(`{value}`,Q)},...Z]:Z;return G?[{value:`__loading__`,label:g.loading,disabled:!0},...e]:e},[Z,qe,Q,G]),Ye=(0,m.useMemo)(()=>se(Z).length,[Z]);(0,m.useEffect)(()=>{if(!U){He(``);return}let e=setTimeout(()=>{He(G?g.loading:Ye===0?g.empty:g.resultCount.replace(`{count}`,String(Ye)))},pe);return()=>clearTimeout(e)},[U,G,Ye]),(0,m.useLayoutEffect)(()=>{if(!U){Be(!1);return}let e=R.current,t=z.current;if(!e||!t)return;let n=()=>{let n=de(e.getBoundingClientRect(),t.getBoundingClientRect());Ie(n.style),Re(n.vertical)};if(n(),xe.current){let e=xe.current;xe.current=null,be.current?.dispatchEvent(new KeyboardEvent(`keydown`,{key:e,bubbles:!0,cancelable:!0}))}return oe()?Be(!0):requestAnimationFrame(()=>Be(!0)),window.addEventListener(`scroll`,n,!0),window.addEventListener(`resize`,n),()=>{window.removeEventListener(`scroll`,n,!0),window.removeEventListener(`resize`,n)}},[U,Ne]),(0,m.useEffect)(()=>{if(!U)return;let e=e=>!e||!z.current?.contains(e)&&!R.current?.contains(e),t=t=>{e(t.target)&&X()},n=t=>{e(t.relatedTarget)&&X()},r=()=>X();return document.addEventListener(`pointerdown`,t),document.addEventListener(`focusout`,n),window.addEventListener(`blur`,r),()=>{document.removeEventListener(`pointerdown`,t),document.removeEventListener(`focusout`,n),window.removeEventListener(`blur`,r)}},[U]);let Xe=e=>{let t=be.current;if(!t){xe.current=e;return}t.dispatchEvent(new KeyboardEvent(`keydown`,{key:e,bubbles:!0,cancelable:!0}))},Ze=e=>{let t=p(B);q(t.includes(e)?t.filter(t=>t!==e):[...t,e])},Qe=e=>{if(c){let t=p(B);t.includes(e)||q([...t,e]),J(``)}else q(e),J(e),X()},$e=e=>{c?(q(e),J(``),L.current?.focus()):(q(e),J(le(e,V)),X())},et=e=>{let t=e.target.value;if(Me(!1),Ae(null),u!==`none`&&Pe(e=>e+1),c&&ee&&t.includes(`,`)){let e=t.split(`,`),n=e.slice(0,-1).map(e=>e.trim()).filter(Boolean),r=e[e.length-1];if(n.length>0){let e=[...p(B)];for(let t of n)e.includes(t)||e.push(t);q(e)}J(r)}else J(t);Y()},tt=()=>{W||Y()},nt=e=>{e.target===e.currentTarget&&L.current?.focus()},rt=()=>{J(``),q(c?[]:``),L.current?.focus()},it=()=>{if(!W){if(U){X();return}Me(!0),Pe(e=>e+1),Y(),L.current?.focus()}},at=e=>{let t=p(B);q(t.filter(t=>t!==e)),L.current?.focus()},ot=e=>{switch(e.key){case`ArrowDown`:e.preventDefault(),Y(),e.altKey||Xe(`ArrowDown`);break;case`ArrowUp`:e.preventDefault(),Y(),Xe(`ArrowUp`);break;case`Enter`:if(!U)break;e.preventDefault(),ke?c?Ze(ke):Xe(`Enter`):ee&&Q!==``&&Qe(Q);break;case`Escape`:U?(e.preventDefault(),X()):ge&&H!==``&&(e.preventDefault(),J(``));break;case`Tab`:if(U){e.preventDefault();let t=L.current,n=z.current;X(),ue(t,n,e.shiftKey?-1:1)}break;case`Backspace`:if(c&&H===``){let t=p(B);t.length>0&&(e.preventDefault(),q(t.slice(0,-1)))}}},$=x?ae(x):void 0,st=$?.rootStyle||T?{...$?.rootStyle,...T}:void 0,ct={...Fe,...$?.popupStyle},lt=[`ds-combobox`,We?`ds-combobox--invalid`:null,W?`ds-combobox--disabled`:null,w??null].filter(Boolean).join(` `),ut=[d?N:null,Ue?P:null,F].filter(Boolean).join(` `),dt=c?p(B).map(e=>({value:e,label:le(e,V)})):[],ft=c?dt.length>0:typeof B==`string`&&B!==``,pt=ge&&!W&&(ft||H!==``),mt=(0,h.jsx)(`label`,{htmlFor:j,id:M,className:`ds-combobox__label`,"data-part":`label`,children:(0,h.jsxs)(te,{element:`span`,weight:`medium`,overrides:Object.keys($?.labelOverrides??{}).length?$.labelOverrides:void 0,children:[t,_?(0,h.jsx)(`span`,{className:`ds-combobox__required`,children:g.requiredIndicator}):null]})}),ht=d?(0,h.jsx)(te,{element:`p`,id:N,size:`sm`,tone:`muted`,"data-part":`description`,overrides:Object.keys($?.descriptionOverrides??{}).length?$.descriptionOverrides:void 0,children:d}):null,gt=Ue?(0,h.jsx)(te,{element:`span`,id:P,role:`alert`,size:`sm`,tone:`danger`,"data-part":`errorMessage`,children:Ue}):null,_t=U&&ke?`${I}-option-${ke}`:void 0,vt=[`ds-combobox__popup`,ze?`ds-combobox__popup--entered`:null].filter(Boolean).join(` `);return(0,h.jsxs)(`div`,{"data-ds":`Combobox`,"data-part":`root`,className:lt,style:st,children:[mt,ht,(0,h.jsxs)(`div`,{ref:R,className:`ds-combobox__field`,"data-part":`field`,onMouseDown:nt,children:[dt.map(e=>(0,h.jsxs)(`span`,{className:`ds-combobox__chip`,"data-part":`chip`,children:[(0,h.jsx)(`span`,{className:`ds-combobox__chip-label`,children:e.label}),(0,h.jsx)(l,{variant:`ghost`,size:`sm`,iconOnly:!0,label:g.removeChip.replace(`{label}`,e.label),leadingIcon:(0,h.jsx)(ne,{name:`close`,inline:!0}),disabled:W,"data-part":`chipRemove`,onClick:()=>at(e.value)})]},e.value)),(0,h.jsx)(`input`,{...O,ref:L,id:j,role:`combobox`,"aria-autocomplete":`list`,"aria-expanded":U?`true`:`false`,"aria-controls":U?I:void 0,"aria-activedescendant":_t,"aria-haspopup":`listbox`,"aria-describedby":ut||void 0,"aria-invalid":We?`true`:void 0,"aria-required":_?`true`:void 0,"aria-disabled":W?`true`:void 0,autoComplete:`off`,"data-part":`input`,className:`ds-combobox__input`,value:H,placeholder:dt.length===0?re:void 0,readOnly:W?!0:O.readOnly,onChange:et,onClick:tt,onKeyDown:ot,onFocus:E,onBlur:D}),pt?(0,h.jsx)(l,{variant:`ghost`,size:`sm`,iconOnly:!0,label:g.clearLabel,leadingIcon:(0,h.jsx)(ne,{name:`close`,inline:!0,overrides:{color:`color.foreground.muted`}}),"data-part":`clearButton`,onClick:rt}):null,(0,h.jsx)(l,{variant:`ghost`,size:`sm`,iconOnly:!0,label:g.toggleLabel,leadingIcon:(0,h.jsx)(ne,{name:`chevron-down`,inline:!0,overrides:{color:`color.foreground.muted`}}),disabled:W,"data-part":`toggleButton`,onClick:it})]}),c?dt.map(e=>(0,h.jsx)(`input`,{type:`hidden`,name:n,value:e.value,disabled:W},e.value)):typeof B==`string`&&B!==``?(0,h.jsx)(`input`,{type:`hidden`,name:n,value:B,disabled:W}):null,gt,(0,h.jsx)(`div`,{id:F,"data-part":`status`,role:`status`,"aria-live":`polite`,className:`ds-combobox__status`,children:Ve}),U?(0,fe.createPortal)((0,h.jsx)(`div`,{ref:z,"data-part":`popup`,"data-vertical":Le,className:vt,style:ct,children:(0,h.jsx)(ie,{ref:be,id:I,label:t,labelledBy:M,options:Je,multiple:c,value:B,selectionFollowsFocus:!1,disabled:W,loading:G,emptyMessage:G?g.loading:g.empty,onChange:$e,onActiveChange:Ae},Ne)}),_e??document.body):null]})},b.__docgenInfo={description:`Combobox — Design Schema, category: input.

When to use:
Use a Combobox for long lists (fifty-plus: people, cities, products), for values that can be
typed faster than found (dates, codes), for \`async\` search against a server, and for multi-value
fields where chips make the selection legible (recipients, tags, filters). Use \`allowCustom\` when
new values are legitimate (tags, invitees by email) and never when the value must exist (a
customer id). Use \`filter: none\` when the list is short but chips are wanted.

Do not use a Combobox for fewer than about ten options that never grow — use Select. Do not use
it as a search box that navigates to results. Do not use it to pick a date. Do not disable
typing to get a Select; use Select.`,methods:[],displayName:`Combobox`,props:{label:{required:!0,tsType:{name:`string`},description:`Visible label. Always rendered.`},name:{required:!0,tsType:{name:`string`},description:`Field name for the Form.`},options:{required:!0,tsType:{name:`Array`,elements:[{name:`union`,raw:`| { value: string; label: string; description?: string | undefined; icon?: IconName | undefined; disabled?: boolean | undefined }
| { group: string; options: ListboxOption[] }`,elements:[{name:`signature`,type:`object`,raw:`{ value: string; label: string; description?: string | undefined; icon?: IconName | undefined; disabled?: boolean | undefined }`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`description`,value:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}],required:!1}},{key:`icon`,value:{name:`union`,raw:`IconName | undefined`,elements:[{name:`union`,raw:`| 'check'
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
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}]},{name:`undefined`}],required:!1}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}},{name:`signature`,type:`object`,raw:`{ group: string; options: ListboxOption[] }`,signature:{properties:[{key:`group`,value:{name:`string`,required:!0}},{key:`options`,value:{name:`Array`,elements:[{name:`ListboxOption`}],raw:`ListboxOption[]`,required:!0}}]}}]}],raw:`ListboxOption[]`},description:"The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering."},value:{required:!1,tsType:{name:`union`,raw:`ComboboxValue | undefined`,elements:[{name:`union`,raw:`string | string[]`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`}]},{name:`undefined`}]},description:"Controlled selected value(s). With `multiple`, an array. With `allowCustom`, a value not in `options` is a custom entry."},defaultValue:{required:!1,tsType:{name:`union`,raw:`ComboboxValue | undefined`,elements:[{name:`union`,raw:`string | string[]`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`}]},{name:`undefined`}]},description:`Initial value(s).`},inputValue:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Controlled text of the input. Usually uncontrolled; controlled by consumers driving `async` filtering."},multiple:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Pick many: selected options appear as chips before the input, each removable; the list stays
open while toggling; Backspace in an empty input removes the last chip.`,defaultValue:{value:`false`,computed:!1}},allowCustom:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Typed text that matches no option can be committed as a value (tags, emails). Enter or a\nseparator (comma) commits it; the list shows `copy.addCustom` as the first row.",defaultValue:{value:`false`,computed:!1}},filter:{required:!1,tsType:{name:`union`,raw:`ComboboxFilter | undefined`,elements:[{name:`union`,raw:`'startsWith' | 'contains' | 'none' | 'async'`,elements:[{name:`literal`,value:`'startsWith'`},{name:`literal`,value:`'contains'`},{name:`literal`,value:`'none'`},{name:`literal`,value:`'async'`}]},{name:`undefined`}]},description:"How typing narrows `options`: by prefix, by substring (default), not at all (the list is a\npicker; typing only moves the active option), or by the consumer (`async`).",defaultValue:{value:`'contains'`,computed:!1}},placeholder:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Example input shown while empty. Never the only description.`},description:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Helper text under the label.`},required:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Must have a value to submit.`,defaultValue:{value:`false`,computed:!1}},disabled:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Not editable, not submitted, still readable and focusable.`,defaultValue:{value:`false`,computed:!1}},invalid:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Marks the field invalid.`,defaultValue:{value:`false`,computed:!1}},error:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Error message; implies invalid.`},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"For `async`: show the loading row and announce it. The consumer sets it around its request.",defaultValue:{value:`false`,computed:!1}},clearable:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show a clear button when there is a value or text.`,defaultValue:{value:`true`,computed:!1}},container:{required:!1,tsType:{name:`union`,raw:`HTMLElement | undefined`,elements:[{name:`HTMLElement`},{name:`undefined`}]},description:"Portal target for the popup's DOM node. Defaults to `document.body`."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'fieldBorderFocus'
| 'fieldBorderInvalid'
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
| 'popupShadow'
| 'popupRadius'
| 'popupOffset'
| 'layer'
| 'fontFamily'
| 'fontSize'
| 'chipSize'
| 'lineHeight'
| 'disabledOpacity'
| 'enter'`,elements:[{name:`literal`,value:`'fieldBorderFocus'`},{name:`literal`,value:`'fieldBorderInvalid'`},{name:`literal`,value:`'fieldBorderWidth'`},{name:`literal`,value:`'fieldRadius'`},{name:`literal`,value:`'fieldPaddingInline'`},{name:`literal`,value:`'fieldPaddingBlock'`},{name:`literal`,value:`'fieldGap'`},{name:`literal`,value:`'chipRadius'`},{name:`literal`,value:`'chipPaddingInline'`},{name:`literal`,value:`'chipPaddingBlock'`},{name:`literal`,value:`'chipGap'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'labelWeight'`},{name:`literal`,value:`'helperSize'`},{name:`literal`,value:`'popupSurface'`},{name:`literal`,value:`'popupBorder'`},{name:`literal`,value:`'popupShadow'`},{name:`literal`,value:`'popupRadius'`},{name:`literal`,value:`'popupOffset'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'chipSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'disabledOpacity'`},{name:`literal`,value:`'enter'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<ComboboxOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},onChange:{required:!1,tsType:{name:`union`,raw:`((value: ComboboxValue) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`)."},onInputChange:{required:!1,tsType:{name:`union`,raw:`((text: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired on every keystroke with the input text. The hook for `async` filtering."},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((open: boolean) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when the list opens or closes.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLInputElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLInputElement`}],raw:`Ref<HTMLInputElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var _e,x,S,ve,ye,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{_e=t(),ge(),x=r(),S=[{value:`apple`,label:`Apple`},{value:`apricot`,label:`Apricot`},{value:`banana`,label:`Banana`},{value:`blueberry`,label:`Blueberry`},{value:`cherry`,label:`Cherry`},{value:`grape`,label:`Grape`},{value:`mango`,label:`Mango`},{value:`papaya`,label:`Papaya`}],ve=[{group:`Engineering`,options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`}]},{group:`Design`,options:[{value:`product`,label:`Product design`},{value:`brand`,label:`Brand design`}]}],ye={title:`Combobox/React`,component:b,args:{label:`Fruit`,name:`fruit`,options:S},tags:[`autodocs`]},C={},w={args:{filter:`startsWith`}},T={args:{filter:`contains`}},E={args:{filter:`none`}},D={args:{filter:`async`,options:S.slice(0,3)},render:e=>{function t(){let[t,n]=(0,_e.useState)(e.options),[r,i]=(0,_e.useState)(!1);return(0,x.jsx)(b,{...e,options:t,loading:r,onInputChange:e=>{i(!0),setTimeout(()=>{n(S.filter(t=>`label`in t&&t.label.toLowerCase().includes(e.toLowerCase()))),i(!1)},300)}})}return(0,x.jsx)(t,{})}},O={args:{label:`Role`,name:`role`,options:ve,multiple:!0,defaultValue:[`frontend`]}},k={args:{label:`Tags`,name:`tags`,multiple:!0,allowCustom:!0,defaultValue:[`launch`]}},A={args:{description:`Used for the produce order.`}},j={args:{required:!0}},M={args:{placeholder:`Search fruit`}},N={args:{disabled:!0,defaultValue:`banana`}},P={args:{invalid:!0,error:`Fruit is required.`}},F={args:{defaultValue:`cherry`}},I={args:{clearable:!1,defaultValue:`mango`}},L={args:{label:`Role`,name:`role-keyboard`,options:ve,multiple:!0,defaultValue:[`frontend`,`backend`]}},R=[`Default`,`FilterStartsWith`,`FilterContains`,`FilterNone`,`FilterAsync`,`Multiple`,`AllowCustom`,`WithDescription`,`Required`,`Placeholder`,`Disabled`,`InvalidWithError`,`DefaultValue`,`NotClearable`,`Keyboard`],C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'startsWith'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'contains'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'none'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'async',
    options: FRUITS.slice(0, 3)
  },
  render: args => {
    function AsyncDemo() {
      const [options, setOptions] = useState(args.options);
      const [loading, setLoading] = useState(false);
      return <Combobox {...args} options={options} loading={loading} onInputChange={text => {
        setLoading(true);
        setTimeout(() => {
          setOptions(FRUITS.filter(option => 'label' in option && option.label.toLowerCase().includes(text.toLowerCase())));
          setLoading(false);
        }, 300);
      }} />;
    }
    return <AsyncDemo />;
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Role',
    name: 'role',
    options: ROLES,
    multiple: true,
    defaultValue: ['frontend']
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Tags',
    name: 'tags',
    multiple: true,
    allowCustom: true,
    defaultValue: ['launch']
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Used for the produce order.'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Search fruit'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'banana'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true,
    error: 'Fruit is required.'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'cherry'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    clearable: false,
    defaultValue: 'mango'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Role',
    name: 'role-keyboard',
    options: ROLES,
    multiple: true,
    defaultValue: ['frontend', 'backend']
  }
}`,...L.parameters?.docs?.source},description:{story:`Open/present with its trigger, for the keyboard gate. Unlike Select's popup (a single\r
aria-activedescendant listbox with one focus stop), a Combobox's own field always carries\r
several real focus stops — the input plus its clear and toggle buttons — so a single \`multiple\`\r
instance with existing chips (each with its own removable button) already clears the "at least\r
three focusable children" bar without needing the popup open.`,...L.parameters?.docs?.description}}}})))()}z();export{k as AllowCustom,C as Default,F as DefaultValue,N as Disabled,D as FilterAsync,T as FilterContains,E as FilterNone,w as FilterStartsWith,P as InvalidWithError,L as Keyboard,O as Multiple,I as NotClearable,M as Placeholder,j as Required,A as WithDescription,R as __namedExportsOrder,ye as default};