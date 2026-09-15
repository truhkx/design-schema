import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-CC7880zu.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,r as o}from"./FormContext-CIIsFCPQ.js";import{n as s,t as c}from"./Text-Cwfpaq7X.js";function l(e){let t={},n={},r={},a={},o={};for(let s of Object.keys(e)){let c=e[s];if(!c)continue;let l=p[s];if(l){t[l]=i(c);continue}switch(s){case`fontFamily`:n.fontFamily=c,r.fontFamily=c,a.fontFamily=c,o.fontFamily=c;break;case`fontSize`:n.fontSize=c;break;case`labelWeight`:n.fontWeight=c;break;case`valueSize`:a.fontSize=c;break;case`helperSize`:r.fontSize=c,o.fontSize=c;break;case`errorText`:o.color=c}}return{rootStyle:t,labelTextOverrides:n,descriptionTextOverrides:r,valueTextOverrides:a,errorTextOverrides:o}}var u,d,f,p,ee,m;function h(){return(h=e((()=>{u=t(),r(),s(),a(),d=n(),f={minimumLabel:`{label} minimum`,maximumLabel:`{label} maximum`,rangeText:`{low} – {high}`,required:`{label} is required.`,invalid:`{label} is not valid.`},p={track:`--ds-slider-track`,trackHeight:`--ds-slider-track-height`,trackRadius:`--ds-slider-track-radius`,thumb:`--ds-slider-thumb`,thumbBorderWidth:`--ds-slider-thumb-border-width`,thumbSize:`--ds-slider-thumb-size`,thumbShadow:`--ds-slider-thumb-shadow`,thumbActiveScale:`--ds-slider-thumb-active-scale`,mark:`--ds-slider-mark`,markSize:`--ds-slider-mark-size`,markLabelSize:`--ds-slider-mark-label-size`,partGap:`--ds-slider-part-gap`,trackPaddingBlock:`--ds-slider-track-padding-block`,disabledOpacity:`--ds-slider-disabled-opacity`,transition:`--ds-slider-transition`},ee=typeof process<`u`&&!1,m=function({ref:e,label:t,name:n,min:r=0,max:i=100,step:a=1,snapToMarks:s=!1,required:p=!1,invalid:m=!1,value:h,defaultValue:g,range:_=!1,formatValue:v,showValue:y=`always`,marks:b,disabled:x=!1,description:S,error:C,overrides:w,onChange:T,onChangeEnd:E,id:D,className:O,style:k,...A}){let j=o(),M=(0,u.useId)(),N=D??(j?.idBase?`${j.idBase}-${n}`:`ds-slider${M}`),te=`${N}-label`,ne=`${N}-description`,re=`${N}-error`,ie=`${N}-min-label`,ae=`${N}-max-label`,oe=(0,u.useRef)(null),P=(0,u.useRef)({single:null,min:null,max:null}),F=i>r;(0,u.useEffect)(()=>{ee&&!F&&console.warn(`Slider: \`max\` (${i}) must be greater than \`min\` (${r}).`)},[F,r,i]);let I=g??(_?[r,i]:r),L=h!==void 0,[se,ce]=(0,u.useState)(I),R=L?h:se,z=(0,u.useRef)(R);z.current=R;let B=x||(j?.disabled??!1),V=C??j?.errors[n],le=m||V!==void 0,[ue,H]=(0,u.useState)(null),[de,U]=(0,u.useState)(null),W=(0,u.useRef)(!1),fe=(0,u.useRef)(null),G=(0,u.useRef)(!1),K=v??(e=>String(e)),q=(0,u.useRef)({label:t,disabled:B,required:p,invalid:m,error:C,effectiveDefault:I});q.current={label:t,disabled:B,required:p,invalid:m,error:C,effectiveDefault:I},(0,u.useEffect)(()=>{if(j)return j.register({name:n,id:N,get label(){return q.current.label},getValue:()=>{let e=z.current;return Array.isArray(e)?[String(e[0]),String(e[1])]:String(e)},isDisabled:()=>q.current.disabled,validate:()=>{let{label:e,required:t,invalid:n,error:r,effectiveDefault:i}=q.current;if(r!==void 0)return r;let a=z.current,o=Array.isArray(a)&&Array.isArray(i)?a[0]===i[0]&&a[1]===i[1]:a===i;return t&&o?f.required.replace(`{label}`,e):n?f.invalid.replace(`{label}`,e):null},focus:()=>(_?P.current.min:P.current.single)?.focus()})},[j,n,N,_]);function J(e){return F?(Math.min(Math.max(e,r),i)-r)/(i-r)*100:0}function Y(e){let t=Math.min(Math.max(e,r),i);if(!(a>0))return t;let n=Math.round((t-r)/a);return Math.min(Math.max(r+n*a,r),i)}function pe(){return b&&b.length>0?[...b].map(e=>e.value).sort((e,t)=>e-t):[]}function me(e){let t=pe();if(t.length===0)return Y(e);let n=t[0],r=Math.abs(e-n);for(let i of t){let t=Math.abs(e-i);t<r&&(n=i,r=t)}return n}function he(e){return s?me(e):Y(e)}function ge(e,t){let n=pe();return n.length===0?e+t*a*10:t===1?n.find(t=>t>e)??n[n.length-1]:[...n].reverse().find(t=>t<e)??n[0]}function _e(e){L||ce(e),z.current=e,T?.(e),j&&j.validate===`change`&&j.validateField(n)}function X(e,t,n=Y){let a=n(t);if(e===null){_e(a);return}let[o,s]=Array.isArray(R)?R:[r,i];_e(e===0?[Math.min(a,s),s]:[o,Math.max(a,o)])}let[Z,Q]=_&&Array.isArray(R)?R:[r,i],$=!_&&typeof R==`number`?R:r,ve=_?[{key:`min`,index:0,value:Z,ariaMin:r,ariaMax:Q,ariaLabelledBy:ie},{key:`max`,index:1,value:Q,ariaMin:Z,ariaMax:i,ariaLabelledBy:ae}]:[{key:`single`,index:null,value:$,ariaMin:r,ariaMax:i,ariaLabelledBy:te}],ye=_?J(Z):0,be=J(_?Q:$);function xe(e){let t=oe.current;if(!t)return r;let n=t.getBoundingClientRect(),a=getComputedStyle(t).direction===`rtl`,o=n.width===0?0:(e-n.left)/n.width;return r+Math.min(Math.max(a?1-o:o,0),1)*(i-r)}function Se(e){return _?Math.abs(e-Z)<=Math.abs(e-Q)?0:1:null}let Ce=e=>{if(B||e.button!==0)return;e.preventDefault();let t=xe(e.clientX),n=Se(t);fe.current=n,W.current=!0;let r=n===null?`single`:n===0?`min`:`max`;H(r),X(n,t,he),e.currentTarget.setPointerCapture(e.pointerId),P.current[r]?.focus()},we=e=>{W.current&&X(fe.current,xe(e.clientX),he)},Te=e=>{W.current&&(W.current=!1,H(null),E?.(z.current),j&&(j.validate===`blur`||j.validate===`change`)&&j.validateField(n),e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId))},Ee=e=>t=>{if(B)return;let n;switch(t.key){case`ArrowRight`:case`ArrowUp`:n=e.value+a;break;case`ArrowLeft`:case`ArrowDown`:n=e.value-a;break;case`PageUp`:n=ge(e.value,1);break;case`PageDown`:n=ge(e.value,-1);break;case`Home`:n=r;break;case`End`:n=i;break;default:return}t.preventDefault(),X(e.index,n),G.current=!0},De=()=>{G.current&&(G.current=!1,E?.(z.current),j&&(j.validate===`blur`||j.validate===`change`)&&j.validateField(n))},Oe=e=>()=>U(e),ke=()=>U(null),Ae=e=>t=>{P.current[e]=t},je=[S?ne:null,V?re:null].filter(Boolean).join(` `),{rootStyle:Me,labelTextOverrides:Ne,descriptionTextOverrides:Pe,valueTextOverrides:Fe,errorTextOverrides:Ie}=w?l(w):{rootStyle:void 0,labelTextOverrides:void 0,descriptionTextOverrides:void 0,valueTextOverrides:void 0,errorTextOverrides:void 0},Le=Me||k?{...Me,...k}:void 0,Re=[`ds-slider`,B?`ds-slider--disabled`:null,le?`ds-slider--invalid`:null,O??null].filter(Boolean).join(` `);return(0,d.jsxs)(`div`,{...A,ref:e,id:N,"data-ds":`Slider`,className:Re,style:Le,children:[(0,d.jsxs)(`div`,{className:`ds-slider__header`,children:[(0,d.jsx)(c,{element:`span`,id:te,"data-part":`label`,weight:`medium`,className:`ds-slider__label`,overrides:Ne,children:t}),y===`always`?(0,d.jsx)(c,{element:`span`,"data-part":`valueText`,size:`sm`,className:`ds-slider__value`,overrides:Fe,children:_?f.rangeText.replace(`{low}`,K(Z)).replace(`{high}`,K(Q)):K($)}):null]}),S?(0,d.jsx)(c,{element:`p`,id:ne,"data-part":`description`,size:`sm`,tone:`muted`,className:`ds-slider__description`,overrides:Pe,children:S}):null,(0,d.jsxs)(`div`,{className:`ds-slider__body`,onPointerDown:Ce,onPointerMove:we,onPointerUp:Te,onPointerCancel:Te,children:[(0,d.jsx)(`div`,{ref:oe,className:`ds-slider__track`,"data-part":`track`,children:(0,d.jsx)(`div`,{className:`ds-slider__fill`,"data-part":`fill`,style:{insetInlineStart:`${ye}%`,inlineSize:`${be-ye}%`}})}),b&&b.length>0?(0,d.jsx)(`div`,{className:`ds-slider__marks`,"data-part":`tickMarks`,"aria-hidden":`true`,children:b.map(e=>(0,d.jsx)(`span`,{className:`ds-slider__mark`,style:{insetInlineStart:`${J(e.value)}%`},children:e.label?(0,d.jsx)(`span`,{className:`ds-slider__mark-label`,children:e.label}):null},e.value))}):null,ve.map(e=>{let t=y===`hover`&&(ue===e.key||de===e.key),n=[`ds-slider__thumb`,ue===e.key?`ds-slider__thumb--active`:null].filter(Boolean).join(` `);return(0,d.jsxs)(`div`,{ref:Ae(e.key),role:`slider`,tabIndex:0,"data-part":`thumb`,className:n,style:{insetInlineStart:`${J(e.value)}%`},"aria-valuenow":e.value,"aria-valuemin":e.ariaMin,"aria-valuemax":e.ariaMax,"aria-valuetext":K(e.value),"aria-labelledby":e.ariaLabelledBy,"aria-orientation":`horizontal`,"aria-disabled":B?`true`:void 0,"aria-describedby":je||void 0,onKeyDown:Ee(e),onKeyUp:De,onFocus:Oe(e.key),onBlur:ke,children:[(0,d.jsx)(`span`,{className:`ds-slider__thumb-knob`,"aria-hidden":`true`}),t?(0,d.jsx)(`span`,{className:`ds-slider__bubble`,"data-part":`valueText`,children:K(e.value)}):null]},e.key)})]}),_?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`span`,{id:ie,className:`ds-slider__visually-hidden`,children:f.minimumLabel.replace(`{label}`,t)}),(0,d.jsx)(`span`,{id:ae,className:`ds-slider__visually-hidden`,children:f.maximumLabel.replace(`{label}`,t)})]}):null,_?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`input`,{type:`hidden`,name:n,value:String(Z),disabled:B}),(0,d.jsx)(`input`,{type:`hidden`,name:n,value:String(Q),disabled:B})]}):(0,d.jsx)(`input`,{type:`hidden`,name:n,value:String($),disabled:B}),V?(0,d.jsx)(c,{element:`p`,id:re,role:`alert`,"data-part":`errorMessage`,size:`sm`,tone:`danger`,className:`ds-slider__error`,overrides:Ie,children:V}):null]})},m.__docgenInfo={description:`Slider — Design Schema, category: input.

When to use:
Use a Slider for a bounded numeric value where approximate is fine and immediate feedback
matters, and where the scale has meaning across its whole width. Use \`range\` for "between"
filters (price, dates as numbers). Add \`marks\` when a few values are meaningful stops. Pair it
with a NumberInput (\`showValue: never\`) when exact entry also matters.`,methods:[],displayName:`Slider`,props:{label:{required:!0,tsType:{name:`string`},description:`Visible label naming the quantity ("Volume", "Price range"). Also the accessible name.`},name:{required:!0,tsType:{name:`string`},description:"Field name for the Form. A range contributes `[min, max]`."},min:{required:!1,tsType:{name:`union`,raw:`number | undefined`,elements:[{name:`number`},{name:`undefined`}]},description:`Lower bound.`,defaultValue:{value:`0`,computed:!1}},max:{required:!1,tsType:{name:`union`,raw:`number | undefined`,elements:[{name:`number`},{name:`undefined`}]},description:`Upper bound.`,defaultValue:{value:`100`,computed:!1}},step:{required:!1,tsType:{name:`union`,raw:`number | undefined`,elements:[{name:`number`},{name:`undefined`}]},description:`Arrow-key increment and snapping granularity.`,defaultValue:{value:`1`,computed:!1}},snapToMarks:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"With `marks`, snap drag and click to the marks instead of `step` (keys still move by step, PageUp/Down by mark).",defaultValue:{value:`false`,computed:!1}},required:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Must have a value other than the default to submit (`copy.required`).",defaultValue:{value:`false`,computed:!1}},invalid:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Marks the slider invalid (`copy.invalid` when no `error`).",defaultValue:{value:`false`,computed:!1}},value:{required:!1,tsType:{name:`union`,raw:`SliderValue | undefined`,elements:[{name:`union`,raw:`number | [number, number]`,elements:[{name:`number`},{name:`tuple`,raw:`[number, number]`,elements:[{name:`number`},{name:`number`}]}]},{name:`undefined`}]},description:`Controlled value; for a range, a two-number array.`},defaultValue:{required:!1,tsType:{name:`union`,raw:`SliderValue | undefined`,elements:[{name:`union`,raw:`number | [number, number]`,elements:[{name:`number`},{name:`tuple`,raw:`[number, number]`,elements:[{name:`number`},{name:`number`}]}]},{name:`undefined`}]},description:"Initial value (or pair). Defaults to `min` (or `[min, max]`)."},range:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Two thumbs choosing a minimum and a maximum; the thumbs cannot cross.`,defaultValue:{value:`false`,computed:!1}},formatValue:{required:!1,tsType:{name:`union`,raw:`((value: number) => string) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Renders the displayed and announced value ("$40", "3 h 20 min"). Defaults to the number.`},showValue:{required:!1,tsType:{name:`union`,raw:`SliderShowValue | undefined`,elements:[{name:`union`,raw:`'always' | 'hover' | 'never'`,elements:[{name:`literal`,value:`'always'`},{name:`literal`,value:`'hover'`},{name:`literal`,value:`'never'`}]},{name:`undefined`}]},description:`Where the value text appears: always beside the label, only while dragging or focused (as a bubble above the thumb), or not at all (when a NumberInput beside the slider shows it).`,defaultValue:{value:`'always'`,computed:!1}},marks:{required:!1,tsType:{name:`union`,raw:`SliderMark[] | undefined`,elements:[{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ value: number; label?: string | undefined }`,signature:{properties:[{key:`value`,value:{name:`number`,required:!0}},{key:`label`,value:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}],required:!1}}]}}],raw:`SliderMark[]`},{name:`undefined`}]},description:`Tick marks on the track, optionally labelled.`},disabled:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Not adjustable, still readable.`,defaultValue:{value:`false`,computed:!1}},description:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Helper text.`},error:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Error message.`},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<SliderOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'track'
| 'trackHeight'
| 'trackRadius'
| 'thumb'
| 'thumbBorderWidth'
| 'thumbSize'
| 'thumbShadow'
| 'thumbActiveScale'
| 'mark'
| 'markSize'
| 'markLabelSize'
| 'valueSize'
| 'labelWeight'
| 'partGap'
| 'trackPaddingBlock'
| 'fontFamily'
| 'fontSize'
| 'helperSize'
| 'errorText'
| 'disabledOpacity'
| 'transition'`,elements:[{name:`literal`,value:`'track'`},{name:`literal`,value:`'trackHeight'`},{name:`literal`,value:`'trackRadius'`},{name:`literal`,value:`'thumb'`},{name:`literal`,value:`'thumbBorderWidth'`},{name:`literal`,value:`'thumbSize'`},{name:`literal`,value:`'thumbShadow'`},{name:`literal`,value:`'thumbActiveScale'`},{name:`literal`,value:`'mark'`},{name:`literal`,value:`'markSize'`},{name:`literal`,value:`'markLabelSize'`},{name:`literal`,value:`'valueSize'`},{name:`literal`,value:`'labelWeight'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'trackPaddingBlock'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'helperSize'`},{name:`literal`,value:`'errorText'`},{name:`literal`,value:`'disabledOpacity'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<SliderOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<SliderOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},onChange:{required:!1,tsType:{name:`union`,raw:`((value: SliderValue) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired on every value change while dragging or with keys (number or pair).`},onChangeEnd:{required:!1,tsType:{name:`union`,raw:`((value: SliderValue) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired once when the interaction ends (pointer up, key released). Use for expensive effects.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDivElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{h(),g=n(),_={title:`Slider/React`,component:m,args:{label:`Volume`,name:`volume`,min:0,max:100,step:1,defaultValue:40,range:!1,showValue:`always`,disabled:!1},argTypes:{onChange:{action:`onChange`},onChangeEnd:{action:`onChangeEnd`}},decorators:[e=>(0,g.jsx)(`div`,{style:{maxInlineSize:`24rem`},children:(0,g.jsx)(e,{})})]},v={},y={args:{showValue:`always`}},b={args:{showValue:`hover`}},x={args:{showValue:`never`}},S={args:{label:`Price range`,name:`price`,min:0,max:500,step:10,range:!0,defaultValue:[100,350],formatValue:e=>`$${e}`}},C={args:{label:`Playback speed`,name:`speed`,min:0,max:4,step:1,defaultValue:2,marks:[{value:0,label:`0.5×`},{value:1,label:`0.75×`},{value:2,label:`1×`},{value:3,label:`1.5×`},{value:4,label:`2×`}],formatValue:e=>[`0.5×`,`0.75×`,`1×`,`1.5×`,`2×`][e]??String(e)}},w={args:{label:`Playback speed`,name:`speed`,min:0,max:4,step:1,snapToMarks:!0,defaultValue:2,marks:[{value:0,label:`0.5×`},{value:1,label:`0.75×`},{value:2,label:`1×`},{value:3,label:`1.5×`},{value:4,label:`2×`}],formatValue:e=>[`0.5×`,`0.75×`,`1×`,`1.5×`,`2×`][e]??String(e)}},T={args:{disabled:!0}},E={args:{required:!0}},D={args:{invalid:!0}},O={args:{description:`Changes take effect immediately.`}},k={args:{error:`Volume must be above 10 for notifications to be audible.`}},A={args:{label:`Price range`,name:`price`,min:0,max:500,step:10,range:!0,defaultValue:[100,350],formatValue:e=>`$${e}`}},j=[`Default`,`ShowValueAlways`,`ShowValueHover`,`ShowValueNever`,`Range`,`WithMarks`,`SnapToMarks`,`Disabled`,`Required`,`Invalid`,`WithDescription`,`WithError`,`Keyboard`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: 'always'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: 'hover'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    showValue: 'never'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    range: true,
    defaultValue: [100, 350],
    formatValue: (value: number) => \`$\${value}\`
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Playback speed',
    name: 'speed',
    min: 0,
    max: 4,
    step: 1,
    defaultValue: 2,
    marks: [{
      value: 0,
      label: '0.5×'
    }, {
      value: 1,
      label: '0.75×'
    }, {
      value: 2,
      label: '1×'
    }, {
      value: 3,
      label: '1.5×'
    }, {
      value: 4,
      label: '2×'
    }],
    formatValue: (value: number) => ['0.5×', '0.75×', '1×', '1.5×', '2×'][value] ?? String(value)
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Playback speed',
    name: 'speed',
    min: 0,
    max: 4,
    step: 1,
    snapToMarks: true,
    defaultValue: 2,
    marks: [{
      value: 0,
      label: '0.5×'
    }, {
      value: 1,
      label: '0.75×'
    }, {
      value: 2,
      label: '1×'
    }, {
      value: 3,
      label: '1.5×'
    }, {
      value: 4,
      label: '2×'
    }],
    formatValue: (value: number) => ['0.5×', '0.75×', '1×', '1.5×', '2×'][value] ?? String(value)
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Changes take effect immediately.'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Volume must be above 10 for notifications to be audible.'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price range',
    name: 'price',
    min: 0,
    max: 500,
    step: 10,
    range: true,
    defaultValue: [100, 350],
    formatValue: (value: number) => \`$\${value}\`
  }
}`,...A.parameters?.docs?.source}}}})))()}M();export{v as Default,T as Disabled,D as Invalid,A as Keyboard,S as Range,E as Required,y as ShowValueAlways,b as ShowValueHover,x as ShowValueNever,w as SnapToMarks,O as WithDescription,k as WithError,C as WithMarks,j as __namedExportsOrder,_ as default};