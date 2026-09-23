import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-D5pPePpr.js";import{t as n}from"./react-dom-BT06ZQro.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as ee}from"./names-szlHjJ4U.js";import{n as a,r as o}from"./FormContext-BEAFo0vw.js";import{n as te,t as ne}from"./Button-OQwYA6MI.js";import{n as s,t as re}from"./Text-B1hFPUay.js";import{n as ie,t as ae}from"./Icon-dvwZzeX-.js";import{n as c,t as oe}from"./Listbox-D_t9RHZD.js";function se(e){let t={},n={},r,i;for(let a of Object.keys(e??{})){let o=e?.[a];o&&(a===`labelWeight`?r={fontWeight:o}:a===`helperSize`?i={fontSize:o}:m[a]?t[m[a]]=ee(o):ve[a]&&(n[ve[a]]=ee(o)))}return{root:Object.keys(t).length?t:void 0,popup:Object.keys(n).length?n:void 0,label:r,helper:i}}function ce(e){return`group`in e}function le(e){let t=[];for(let n of e)ce(n)?t.push(...le(n.options)):t.push(n);return t}function ue(e,t){let n=[];for(let r of e)if(ce(r)){let e=r.options.filter(t);e.length>0&&n.push({group:r.group,options:e})}else t(r)&&n.push(r);return n}function l(e){return e.normalize(`NFD`).replace(ye,``).toLowerCase()}function de(e){return Array.isArray(e)?e:e===void 0||e===``?[]:[e]}function fe(e){let t=/^(-?\d*\.?\d+)(ms|s)$/.exec(e.trim());if(!t)return null;let n=Number(t[1]);return t[2]===`s`?n*1e3:n}function pe(e,t){let n=window.innerHeight,r=e.bottom+t.height>n&&e.top>n-e.bottom?`top`:`bottom`,i=Math.max(t.width,e.width);return{vertical:r,left:Math.max(0,Math.min(e.left,window.innerWidth-i)),top:r===`bottom`?e.bottom:void 0,bottom:r===`top`?n-e.top:void 0,minInlineSize:e.width}}function me(e,t){return e!==null&&e.vertical===t.vertical&&e.left===t.left&&e.top===t.top&&e.bottom===t.bottom&&e.minInlineSize===t.minInlineSize}function u({ref:e,label:t,name:n,options:r,value:i,defaultValue:ee,open:a,inputValue:te,multiple:s=!1,allowCustom:ie=!1,filter:c=`contains`,placeholder:ce,description:u,required:m=!1,disabled:ve=!1,invalid:ye=!1,error:h,loading:xe=!1,clearable:Se=!0,container:Ce,overrides:g,onChange:_,onInputChange:v,onOpenChange:y,onKeyDown:b,onClick:x,onBlur:S,id:C,readOnly:w,...T}){let E=o(),D=(0,d.useId)(),O=C??(E?.idBase?`${E.idBase}-${n}`:`ds-combobox${D}`),k=`${O}-label`,A=`${O}-description`,j=`${O}-error`,M=`${O}-listbox`,we=e=>`${M}-option-${e}`,N=(0,d.useRef)(null),Te=(0,d.useRef)(null),P=(0,d.useRef)(null),Ee=(0,d.useRef)(null),De=(0,d.useRef)(null);(0,d.useImperativeHandle)(e,()=>P.current,[]),(0,d.useEffect)(()=>{},[t]);let Oe=(0,d.useMemo)(()=>le(r),[r]),F=e=>Oe.find(t=>t.value===e)?.label??e,ke=i!==void 0,[Ae,je]=(0,d.useState)(ee),Me=ke?i:Ae,I=de(Me),L=s?void 0:I[0],Ne=te!==void 0,[Pe,Fe]=(0,d.useState)(()=>{let e=s?void 0:de(i??ee)[0];return e===void 0?``:F(e)}),R=Ne?te:Pe,z=R.trim(),B=ve||(E?.disabled??!1),[Ie,Le]=(0,d.useState)(!1),V=(a??Ie)&&!B,H=(0,d.useSyncExternalStore)(be,()=>!0,()=>!1),[Re,ze]=(0,d.useState)(!1),[Be,U]=(0,d.useState)(V?`selectedOrFirst`:`none`),[Ve,He]=(0,d.useState)(`selectedOrFirst`),[Ue,We]=(0,d.useState)(V),[W,Ge]=(0,d.useState)(null),[Ke,qe]=(0,d.useState)(!1),[Je,Ye]=(0,d.useState)(``);V!==Ue&&(We(V),V?(U(Ve),He(`selectedOrFirst`)):(U(`none`),ze(!1)));let Xe=E?.errors[n],Ze=ye||Xe!==void 0,Qe=h!==void 0&&h!==``?h:Xe!==void 0&&Xe!==``?Xe:Ze?p.invalid.replace(`{label}`,t):void 0,$e=Ze||Qe!==void 0,G=c===`async`&&xe,et=Re||c===`none`||c===`async`?``:l(z),K=(0,d.useMemo)(()=>et===``?r:ue(r,e=>c===`startsWith`?l(e.label).startsWith(et):l(e.label).includes(et)),[r,c,et]),tt=(0,d.useMemo)(()=>le(K).length,[K]),nt=l(z),rt=ie&&z!==``&&!Oe.some(e=>l(e.value)===nt||l(e.label)===nt),it=(0,d.useMemo)(()=>G?[]:rt?[{value:_e,label:p.addCustom.replace(`{value}`,z)},...K]:K,[G,rt,z,K]),q=(0,d.useMemo)(()=>le(it).filter(e=>!e.disabled),[it]),J=V?(e=>{let t=q.find(e=>I.includes(e.value))?.value;if(e!==`none`)return e===`selected`?t:e===`selectedOrFirst`?t??q[0]?.value:e===`selectedOrLast`?t??q[q.length-1]?.value:e===`typeahead`?nt===``?void 0:q.find(e=>l(e.label).startsWith(nt))?.value:q.some(t=>t.value===e.value)?e.value:void 0})(Be)??null:null;(0,d.useLayoutEffect)(()=>{if(!V)return;let e=P.current;e&&!Te.current?.contains(document.activeElement)&&e.focus()},[V]);let at=`${G}|${Oe.map(e=>e.value).join(`\0`)}`,ot=(0,d.useRef)(at);(0,d.useEffect)(()=>{ot.current!==at&&(ot.current=at,U(`none`))},[at]),(0,d.useEffect)(()=>{s||Ne||L===void 0||Fe(F(L))},[L]);let Y=(0,d.useRef)({label:t,required:m,invalid:ye,error:h,disabled:B,selected:Me,multiple:s});Y.current={label:t,required:m,invalid:ye,error:h,disabled:B,selected:Me,multiple:s},(0,d.useEffect)(()=>{if(E)return E.register({name:n,id:O,get label(){return Y.current.label},getValue:()=>{let e=de(Y.current.selected);if(e.length!==0)return Y.current.multiple?e:e[0]},isDisabled:()=>Y.current.disabled,validate:()=>{let e=Y.current;return e.error!==void 0&&e.error!==``?e.error:e.required&&de(e.selected).length===0?p.required.replace(`{label}`,e.label):e.invalid?p.invalid.replace(`{label}`,e.label):null},focus:()=>P.current?.focus()})},[E,n,O]),(0,d.useEffect)(()=>{if(!V){Ye(``);return}let e;if(G)e=p.loading;else if(tt===0)e=p.empty;else{let t=N.current?.closest(`[lang]`)?.getAttribute(`lang`)||void 0,n;try{n=new Intl.PluralRules(t)}catch{n=new Intl.PluralRules}e=(n.select(tt)===`one`?p.resultCount.one:p.resultCount.other).replace(`{count}`,String(tt))}let t=N.current?fe(getComputedStyle(N.current).getPropertyValue(ge.token)):null,n=setTimeout(()=>Ye(e),t===null?0:t*ge.multiply);return()=>clearTimeout(n)},[V,G,tt]),(0,d.useLayoutEffect)(()=>{if(!V||!H){qe(!1);return}let e=requestAnimationFrame(()=>qe(!0));return()=>cancelAnimationFrame(e)},[V,H]),(0,d.useLayoutEffect)(()=>{if(!V||!H)return;let e=()=>{let e=Te.current,t=Ee.current;if(!e||!t)return;let n=pe(e.getBoundingClientRect(),t.getBoundingClientRect());Ge(e=>me(e,n)?e:n)};return e(),window.addEventListener(`scroll`,e,!0),window.addEventListener(`resize`,e),()=>{window.removeEventListener(`scroll`,e,!0),window.removeEventListener(`resize`,e)}},[V,H,it]);let st=e=>{e===V||e&&B||(a===void 0&&Le(e),y?.(e))},X=e=>{if(V){U(e);return}He(e),st(!0)},Z=()=>st(!1),ct=(0,d.useRef)(Z);ct.current=Z,(0,d.useEffect)(()=>{if(!V)return;let e=e=>!(e instanceof Node)||!Te.current?.contains(e)&&!Ee.current?.contains(e),t=t=>{e(t.target)&&ct.current()},n=t=>{Te.current?.contains(t.target)&&e(t.relatedTarget)&&ct.current()};return document.addEventListener(`pointerdown`,t),document.addEventListener(`focusout`,n),()=>{document.removeEventListener(`pointerdown`,t),document.removeEventListener(`focusout`,n)}},[V]);let Q=e=>{ke||je(e),_?.(e),E&&E.validate===`change`&&E.validateField(n)},$=e=>{e!==R&&(Ne||Fe(e),v?.(e))},lt=e=>{if(e===``)return;let t=l(e),n=Oe.find(e=>l(e.value)===t||l(e.label)===t);if(n?.disabled)return;let r=n?.value??e;s?(I.includes(r)||Q([...I,r]),$(``),U(`none`)):(r!==L&&Q(r),$(n?.label??e),Z())},ut=e=>{if(e===_e){lt(z);return}s?(Q(I.includes(e)?I.filter(t=>t!==e):[...I,e]),$(``),U({value:e})):(e!==L&&Q(e),$(F(e)),Z())},dt=e=>{if(!Array.isArray(e)){ut(e);return}let t=e.find(e=>!I.includes(e))??I.find(t=>!e.includes(t));t!==void 0&&ut(t)},ft=e=>{if(s||L===void 0)return;let t=e.target.closest(`[role="option"]`);t&&t.id===we(L)&&t.getAttribute(`aria-disabled`)!==`true`&&($(F(L)),Z())},pt=e=>{B||(ze(!1),$(e.target.value),X(c===`none`?`typeahead`:`none`))},mt=e=>{x?.(e),!(B||V)&&(ze(!0),X(`selectedOrFirst`))},ht=e=>{S?.(e),E&&(E.validate===`blur`||E.validate===`change`)&&E.validateField(n)},gt=e=>{De.current?.dispatchEvent(new KeyboardEvent(`keydown`,{key:e,bubbles:!0,cancelable:!0}))},_t=e=>{if(b?.(e),!e.defaultPrevented&&!B)switch(e.key){case`ArrowDown`:case`ArrowUp`:{e.preventDefault();let t=e.key===`ArrowDown`;t&&e.altKey?V||X(`selected`):V?gt(e.key):X(t?`selectedOrFirst`:`selectedOrLast`);break}case`Enter`:if(!V)break;e.preventDefault(),J===null?ie&&lt(z):ut(J);break;case`,`:if(!ie)break;e.preventDefault(),lt(z);break;case`Escape`:V?(e.preventDefault(),Z()):Se&&R!==``&&(e.preventDefault(),$(``));break;case`Tab`:V&&Z();break;case`Backspace`:s&&R===``&&I.length>0&&(e.preventDefault(),Q(I.slice(0,-1)))}},vt=()=>{B||($(``),I.length>0&&Q(s?[]:``),P.current?.focus())},yt=()=>{if(!B){if(P.current?.focus(),V){Z();return}ze(!0),X(`selectedOrFirst`)}},bt=e=>{B||(Q(I.filter(t=>t!==e)),P.current?.focus())},xt=e=>{e.target===e.currentTarget&&(e.preventDefault(),P.current?.focus())},St=se(g),Ct=[u?A:null,Qe===void 0?null:j].filter(Boolean).join(` `),wt=Se&&!B&&(I.length>0||R!==``),Tt=[`ds-combobox`,$e?`ds-combobox--invalid`:null,B?`ds-combobox--disabled`:null].filter(Boolean).join(` `),Et={...St.popup,...W?{left:W.left,top:W.top,bottom:W.bottom,minInlineSize:W.minInlineSize}:null};return(0,f.jsxs)(`div`,{ref:N,"data-ds":`Combobox`,"data-ds-field":``,className:Tt,style:St.root,children:[(0,f.jsx)(`label`,{htmlFor:O,id:k,className:`ds-combobox__label`,"data-part":`label`,children:(0,f.jsxs)(re,{element:`span`,weight:`medium`,overrides:St.label,children:[t,m?p.requiredIndicator:null]})}),u?(0,f.jsx)(re,{element:`p`,id:A,size:`sm`,tone:`muted`,"data-part":`description`,overrides:St.helper,children:u}):null,(0,f.jsxs)(`div`,{ref:Te,className:`ds-combobox__field`,"data-part":`field`,onMouseDown:xt,children:[s&&I.length>0?(0,f.jsx)(`span`,{className:`ds-combobox__chips`,"data-part":`chips`,children:I.map(e=>{let t=F(e);return(0,f.jsxs)(`span`,{className:`ds-combobox__chip`,"data-part":`chip`,children:[(0,f.jsx)(`span`,{className:`ds-combobox__chip-label`,children:t}),(0,f.jsx)(`span`,{className:`ds-combobox__control`,"data-part":`chipRemove`,onClick:()=>bt(e),children:(0,f.jsx)(ne,{variant:`ghost`,size:`sm`,iconOnly:!0,label:p.removeChip.replace(`{label}`,t),leadingIcon:(0,f.jsx)(ae,{name:`close`,inline:!0,overrides:{color:`color.foreground.muted`}}),disabled:B})})]},e)})}):null,(0,f.jsx)(`input`,{...T,ref:P,id:O,type:`text`,role:`combobox`,className:`ds-combobox__input`,"data-part":`input`,value:R,placeholder:ce,readOnly:B||w,autoComplete:`off`,"aria-autocomplete":`list`,"aria-haspopup":`listbox`,"aria-expanded":V?`true`:`false`,"aria-controls":M,"aria-activedescendant":V&&J!==null?we(J):void 0,"aria-describedby":Ct||void 0,"aria-invalid":$e?`true`:void 0,"aria-required":m?`true`:void 0,"aria-disabled":B?`true`:void 0,onChange:pt,onClick:mt,onKeyDown:_t,onBlur:ht}),wt?(0,f.jsx)(`span`,{className:`ds-combobox__control`,"data-part":`clearButton`,onClick:vt,children:(0,f.jsx)(ne,{variant:`ghost`,size:`sm`,iconOnly:!0,label:p.clearLabel,leadingIcon:(0,f.jsx)(ae,{name:`close`,inline:!0,overrides:{color:`color.foreground.muted`}})})}):null,(0,f.jsx)(`span`,{className:`ds-combobox__control`,"data-part":`toggleButton`,onClick:yt,children:(0,f.jsx)(ne,{variant:`ghost`,size:`sm`,iconOnly:!0,label:p.toggleLabel,leadingIcon:(0,f.jsx)(ae,{name:`chevron-down`,inline:!0,overrides:{color:`color.foreground.muted`}}),disabled:B,tabIndex:-1})})]}),Qe===void 0?null:(0,f.jsx)(re,{element:`p`,id:j,size:`sm`,tone:`danger`,"data-part":`errorMessage`,overrides:St.helper,children:Qe}),(0,f.jsx)(`div`,{role:`status`,"aria-live":`polite`,className:`ds-combobox__status`,"data-part":`status`,children:Je}),I.map(e=>(0,f.jsx)(`input`,{type:`hidden`,name:n,value:e,disabled:B},e)),V&&H?(0,he.createPortal)((0,f.jsx)(`div`,{ref:Ee,className:Ke?`ds-combobox__popup ds-combobox__popup--visible`:`ds-combobox__popup`,"data-part":`popup`,"data-vertical":W?.vertical??`bottom`,style:Et,onMouseDown:e=>e.preventDefault(),onClick:ft,children:(0,f.jsx)(oe,{ref:De,id:M,label:t,labelledBy:k,options:it,multiple:s,value:s?I:L,selectionFollowsFocus:!1,embedded:!0,loading:G,disabled:B,emptyMessage:p.empty,activeValue:J,onChange:dt,onActiveChange:e=>U(e===null?`none`:{value:e})})}),Ce??document.body):null]})}var d,he,f,p,ge,_e,m,ve,ye,be;function h(){return(h=e((()=>{d=t(),he=n(),i(),te(),ie(),c(),s(),a(),f=r(),p={empty:`No matches`,loading:`Loading…`,addCustom:`Add "{value}"`,clearLabel:`Clear`,toggleLabel:`Show options`,removeChip:`Remove {label}`,resultCount:{one:`{count} result available`,other:`{count} results available`},required:`{label} is required.`,invalid:`{label} is not valid.`,requiredIndicator:` (required)`},ge={token:`--motion-duration-base`,multiply:2},_e=`ds-combobox-custom`,m={fieldBorderInvalid:`--ds-combobox-field-border-invalid`,fieldBorderWidth:`--ds-combobox-field-border-width`,fieldRadius:`--ds-combobox-field-radius`,fieldPaddingInline:`--ds-combobox-field-padding-inline`,fieldPaddingBlock:`--ds-combobox-field-padding-block`,fieldGap:`--ds-combobox-field-gap`,chipRadius:`--ds-combobox-chip-radius`,chipPaddingInline:`--ds-combobox-chip-padding-inline`,chipPaddingBlock:`--ds-combobox-chip-padding-block`,chipGap:`--ds-combobox-chip-gap`,partGap:`--ds-combobox-part-gap`,fontFamily:`--ds-combobox-font-family`,fontSize:`--ds-combobox-font-size`,chipSize:`--ds-combobox-chip-size`,lineHeight:`--ds-combobox-line-height`,disabledOpacity:`--ds-combobox-disabled-opacity`},ve={popupSurface:`--ds-combobox-popup-surface`,popupBorder:`--ds-combobox-popup-border`,popupBorderWidth:`--ds-combobox-popup-border-width`,popupShadow:`--ds-combobox-popup-shadow`,popupRadius:`--ds-combobox-popup-radius`,popupOffset:`--ds-combobox-popup-offset`,layer:`--ds-combobox-layer`,enter:`--ds-combobox-enter`},ye=/\p{M}/gu,be=()=>()=>{},u.__docgenInfo={description:"Combobox — Design Schema, category: input.\n\nWhen to use:\nUse a Combobox for long lists (fifty-plus: people, cities, products), for values that can be typed faster than found (dates, codes), for `async` search against a server, and for multi-value fields where chips make the selection legible (recipients, tags, filters). Use `allowCustom` when new values are legitimate (tags, invitees by email) and never when the value must exist (a customer id). Use `filter: none` when the list is short but chips are wanted.",methods:[],displayName:`Combobox`,props:{label:{required:!0,tsType:{name:`string`},description:`Visible label. Always rendered.`},name:{required:!0,tsType:{name:`string`},description:`Field name for the Form.`},options:{required:!0,tsType:{name:`Array`,elements:[{name:`union`,raw:`ListboxOption | ListboxGroup`,elements:[{name:`signature`,type:`object`,raw:`{\r
  value: string;\r
  label: string;\r
  description?: string | undefined;\r
  icon?: IconName | undefined;\r
  disabled?: boolean | undefined;\r
}`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`description`,value:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}],required:!1}},{key:`icon`,value:{name:`union`,raw:`IconName | undefined`,elements:[{name:`union`,raw:`| 'check'\r
| 'dash'\r
| 'chevron-right'\r
| 'chevron-down'\r
| 'chevron-up'\r
| 'chevron-left'\r
| 'close'\r
| 'plus'\r
| 'minus'\r
| 'info'\r
| 'success'\r
| 'warning'\r
| 'danger'\r
| 'external'\r
| 'ellipsis'\r
| 'search'\r
| 'arrow-right'\r
| 'arrow-left'\r
| 'calendar'\r
| 'menu'\r
| 'list'\r
| 'grid'\r
| 'play'\r
| 'pause'\r
| 'folder'\r
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}]},{name:`undefined`}],required:!1}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}},{name:`signature`,type:`object`,raw:`{ group: string; options: ListboxOption[] }`,signature:{properties:[{key:`group`,value:{name:`string`,required:!0}},{key:`options`,value:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{\r
  value: string;\r
  label: string;\r
  description?: string | undefined;\r
  icon?: IconName | undefined;\r
  disabled?: boolean | undefined;\r
}`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`description`,value:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}],required:!1}},{key:`icon`,value:{name:`union`,raw:`IconName | undefined`,elements:[{name:`union`,raw:`| 'check'\r
| 'dash'\r
| 'chevron-right'\r
| 'chevron-down'\r
| 'chevron-up'\r
| 'chevron-left'\r
| 'close'\r
| 'plus'\r
| 'minus'\r
| 'info'\r
| 'success'\r
| 'warning'\r
| 'danger'\r
| 'external'\r
| 'ellipsis'\r
| 'search'\r
| 'arrow-right'\r
| 'arrow-left'\r
| 'calendar'\r
| 'menu'\r
| 'list'\r
| 'grid'\r
| 'play'\r
| 'pause'\r
| 'folder'\r
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}]},{name:`undefined`}],required:!1}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}}],raw:`ListboxOption[]`,required:!0}}]}}]}],raw:`ListboxItem[]`},description:"The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering."},value:{required:!1,tsType:{name:`union`,raw:`ComboboxValue | undefined`,elements:[{name:`union`,raw:`string | string[]`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`}]},{name:`undefined`}]},description:"Controlled selected value(s). With `multiple`, an array. With `allowCustom`, a value not in `options` is a custom entry."},defaultValue:{required:!1,tsType:{name:`union`,raw:`ComboboxValue | undefined`,elements:[{name:`union`,raw:`string | string[]`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`}]},{name:`undefined`}]},description:`Initial value(s).`},open:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Controlled popup state, for programmatic use and for stories and tests. Omit for the
typing-driven default. Opening the list this way claims DOM focus for the input when focus is
not already inside the field — \`aria-activedescendant\` announces nothing otherwise — but never
takes it from a focused clear or chip-remove Button.`},inputValue:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Controlled text of the input (what the user has typed). Usually uncontrolled; controlled by consumers driving `async` filtering."},multiple:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Pick many: selected options appear as chips before the input, each removable; the list stays
open while toggling; Backspace in an empty input removes the last chip. Uses the same Listbox
engine as Select.`,defaultValue:{value:`false`,computed:!1}},allowCustom:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Typed text that matches no option can be committed as a value (tags, emails). Enter or a comma\ncommits it; the list shows `copy.addCustom` as a synthetic first row, suppressed when the\ntrimmed text already matches an existing option by either its `value` or its `label`.\nCommitting text that matches an option that way (Enter or a comma, same case- and\ndiacritic-insensitive match) commits that option's `value`, never a custom string. If the\nmatching option is disabled, the row stays suppressed and the commit does nothing (neither the\ndisabled value nor a custom string). With `multiple`, text matching an already-selected option\nleaves it selected (no `onChange`, unlike Enter on its row, which toggles) and clears the text —\nthat clear does fire `onInputChange`, like any other commit. The synthetic row is independent of\n`filter`: it shows with `filter: none` too. A comma typed when there is nothing to commit (empty text, or only a disabled match) is dropped\nand the text before it kept.",defaultValue:{value:`false`,computed:!1}},filter:{required:!1,tsType:{name:`union`,raw:`ComboboxFilter | undefined`,elements:[{name:`union`,raw:`'startsWith' | 'contains' | 'none' | 'async'`,elements:[{name:`literal`,value:`'startsWith'`},{name:`literal`,value:`'contains'`},{name:`literal`,value:`'none'`},{name:`literal`,value:`'async'`}]},{name:`undefined`}]},description:"How typing narrows `options`: by prefix, by substring (default), not at all (the list is a\npicker; typing is type-ahead — it opens the list and moves the active option to the first label\nstarting with the typed characters, without filtering), or by the consumer (`async`: the\ncomponent shows `copy.loading` and the consumer updates `options` from `onInputChange`).",defaultValue:{value:`'contains'`,computed:!1}},placeholder:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Example input shown while empty. Never the only description.`},description:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Helper text under the label.`},required:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Must have a value to submit.`,defaultValue:{value:`false`,computed:!1}},disabled:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Not editable, not submitted, still readable and focusable.`,defaultValue:{value:`false`,computed:!1}},invalid:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Marks the field invalid.`,defaultValue:{value:`false`,computed:!1}},error:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Error message; implies invalid. An empty string is not a message (as Input): nothing renders, though a Form entry still marks the field.`},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"For `async`: show the loading row and announce it. The consumer sets it around its request.",defaultValue:{value:`false`,computed:!1}},clearable:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show a clear button when there is a value or text. It also gates Escape-clears-text.`,defaultValue:{value:`true`,computed:!1}},container:{required:!1,tsType:{name:`union`,raw:`HTMLElement | undefined`,elements:[{name:`HTMLElement`},{name:`undefined`}]},description:"Portal target for the popup. Defaults to `document.body`. Platform prop; never affects semantics."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'fieldBorderInvalid'
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
| 'enter'`,elements:[{name:`literal`,value:`'fieldBorderInvalid'`},{name:`literal`,value:`'fieldBorderWidth'`},{name:`literal`,value:`'fieldRadius'`},{name:`literal`,value:`'fieldPaddingInline'`},{name:`literal`,value:`'fieldPaddingBlock'`},{name:`literal`,value:`'fieldGap'`},{name:`literal`,value:`'chipRadius'`},{name:`literal`,value:`'chipPaddingInline'`},{name:`literal`,value:`'chipPaddingBlock'`},{name:`literal`,value:`'chipGap'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'labelWeight'`},{name:`literal`,value:`'helperSize'`},{name:`literal`,value:`'popupSurface'`},{name:`literal`,value:`'popupBorder'`},{name:`literal`,value:`'popupBorderWidth'`},{name:`literal`,value:`'popupShadow'`},{name:`literal`,value:`'popupRadius'`},{name:`literal`,value:`'popupOffset'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'chipSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'disabledOpacity'`},{name:`literal`,value:`'enter'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<ComboboxOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},onChange:{required:!1,tsType:{name:`union`,raw:`((value: string | string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`)."},onInputChange:{required:!1,tsType:{name:`union`,raw:`((value: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:'Fired on every text change the user causes — each keystroke, and the text a commit, Escape-to-clear\nor the clear button leaves behind (so `async` consumers can reset) — with the input text. Not fired\nwhen a controlled `value` change rewrites the label, nor when a commit, Escape or the clear button\nleaves the text unchanged ("unchanged" against the text the input shows now, which for a\ncontrolled `inputValue` is the consumer\'s prop). The hook for `async` filtering.'},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((open: boolean) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when the list opens or closes — including the closes the component causes itself (a blur, a single-select commit, Escape, Tab).`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLInputElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLInputElement`}],raw:`Ref<HTMLInputElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var xe,Se,Ce,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,we;function N(){return(N=e((()=>{xe=t(),h(),Se=r(),Ce={title:`Combobox/React`,component:u,args:{label:`Fruit`,name:`fruit`,options:[{value:`apple`,label:`Apple`},{value:`apricot`,label:`Apricot`},{value:`banana`,label:`Banana`}]},tags:[`autodocs`]},g={},_={args:{filter:`startsWith`}},v={args:{filter:`contains`}},y={args:{filter:`none`}},b={args:{filter:`async`}},x={args:{label:`Fruit`,name:`fruit`,options:[{value:`apple`,label:`Apple`},{value:`apricot`,label:`Apricot`},{value:`banana`,label:`Banana`}]}},S={args:{label:`Roles`,name:`roles`,multiple:!0,defaultValue:[`frontend`],options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`},{value:`design`,label:`Design`}]}},C={args:{label:`Tags`,name:`tags`,multiple:!0,allowCustom:!0,options:[{value:`urgent`,label:`Urgent`},{value:`billing`,label:`Billing`}]}},w={args:{label:`Customer`,name:`customer`,filter:`async`,loading:!0,options:[{value:`acme`,label:`Acme Ltd`}]}},T={args:{open:!0}},E={args:{description:`Used for the produce order.`,placeholder:`Search fruit`}},D={args:{required:!0}},O={args:{disabled:!0,defaultValue:`banana`}},k={args:{invalid:!0}},A={args:{error:`Choose a fruit from the list.`}},j={args:{clearable:!1,defaultValue:`apple`}},M={args:{open:!0,defaultValue:`apple`},render:function(e){let[t,n]=(0,xe.useState)(e.open??!0);return(0,Se.jsx)(u,{...e,open:t,onOpenChange:t=>{n(t),e.onOpenChange?.(t)}})}},we=[`Default`,`FilterStartsWith`,`FilterContains`,`FilterNone`,`FilterAsync`,`FruitPicker`,`MultiSelectWithChips`,`FreeTextTags`,`AsyncResults`,`Open`,`WithDescription`,`Required`,`Disabled`,`Invalid`,`WithError`,`NotClearable`,`Keyboard`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'startsWith'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'contains'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'none'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'async'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Used for the produce order.',
    placeholder: 'Search fruit'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'banana'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Choose a fruit from the list.'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    clearable: false,
    defaultValue: 'apple'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:"Open with its input, for the keyboard gate: the options are the focusable children, reached\r\nthrough aria-activedescendant while DOM focus stays in the input. `defaultValue` is set so the\r\nclear button renders and the story has enough focusable children. Args come from the story URL;\r\nthe story owns `open` so Escape and Tab really close it.",...M.parameters?.docs?.description}}}})))()}N();export{w as AsyncResults,g as Default,O as Disabled,b as FilterAsync,v as FilterContains,y as FilterNone,_ as FilterStartsWith,C as FreeTextTags,x as FruitPicker,k as Invalid,M as Keyboard,S as MultiSelectWithChips,j as NotClearable,T as Open,D as Required,E as WithDescription,A as WithError,we as __namedExportsOrder,Ce as default};