import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-Bb3rYm-L.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,t as o}from"./Text--Q5VwBjk.js";import{n as s,t as c}from"./Icon-CBlYQ3eE.js";function l(e){let t={},n={},r={},a={};for(let o of Object.keys(e)){let s=e[o];if(!s)continue;let c=g[o];switch(c&&(t[c]=i(s)),o){case`labelSize`:n.fontSize=s,r.fontSize=s;break;case`labelWeight`:n.fontWeight=s;break;case`labelCurrentWeight`:r.fontWeight=s;break;case`descriptionSize`:a.fontSize=s;break;case`fontFamily`:n.fontFamily=s,r.fontFamily=s,a.fontFamily=s}}return{rootStyle:t,labelOverrides:n,currentLabelOverrides:r,descriptionOverrides:a}}function u(e,t,n){return e.status?e.status:n===-1?`upcoming`:t<n?`complete`:t===n?`current`:`upcoming`}function d(e,t){return t===`none`?!1:t===`all`||e===`complete`}function f(e){if(e===`complete`)return h.complete;if(e===`current`)return h.current;if(e===`error`)return h.error}var p,m,h,g,_;function v(){return(v=e((()=>{p=t(),r(),a(),s(),m=n(),h={navLabel:`Progress`,stepOf:`Step {current} of {total}`,complete:`completed`,current:`current step`,error:`has an error`,stepLabel:`Step {n}: {label}`},g={indicatorSize:`--ds-stepper-indicator-size`,indicatorBackground:`--ds-stepper-indicator-background`,indicatorBorderWidth:`--ds-stepper-indicator-border-width`,indicatorFontSize:`--ds-stepper-indicator-font-size`,indicatorFontWeight:`--ds-stepper-indicator-font-weight`,connector:`--ds-stepper-connector`,connectorWidth:`--ds-stepper-connector-width`,stepHover:`--ds-stepper-step-hover`,stepRadius:`--ds-stepper-step-radius`,stepGap:`--ds-stepper-step-gap`,partGap:`--ds-stepper-part-gap`,transition:`--ds-stepper-transition`,fontFamily:`--ds-stepper-font-family`},_=function({ref:e,steps:t,current:n,orientation:r=`horizontal`,navigable:i=`completed`,compact:a=!1,label:s=h.navLabel,overrides:g,onStepSelect:_,className:v,style:y,...b}){let x=(0,p.useId)(),S=t.findIndex(e=>e.id===n),C=t.length,w=[`ds-stepper`,`ds-stepper--${r}`,a?`ds-stepper--compact`:null,v??null].filter(Boolean).join(` `),{rootStyle:T,labelOverrides:E,currentLabelOverrides:D,descriptionOverrides:O}=g?l(g):{rootStyle:void 0,labelOverrides:void 0,currentLabelOverrides:void 0,descriptionOverrides:void 0},k=T||y?{...T,...y}:void 0;return(0,m.jsxs)(`nav`,{...b,ref:e,"data-ds":`Stepper`,className:w,style:k,"aria-label":s,children:[(0,m.jsx)(`ol`,{className:`ds-stepper__list`,"data-part":`list`,children:t.map((e,n)=>{let r=u(e,n,S),a=r===`current`,s=n===t.length-1,l=d(r,i),p=f(r),g=e.description?`ds-stepper${x}-description-${e.id}`:void 0,v=!l&&p?`ds-stepper${x}-status-${e.id}`:void 0,y=h.stepLabel.replace(`{n}`,String(n+1)).replace(`{label}`,e.label),b=p?`${y}, ${p}`:y,C=(0,m.jsxs)(`span`,{className:`ds-stepper__indicatorWrap`,children:[(0,m.jsx)(`span`,{className:`ds-stepper__indicator`,"data-part":`indicator`,"aria-hidden":`true`,children:r===`complete`?(0,m.jsx)(c,{name:`check`,inline:!0}):r===`error`?(0,m.jsx)(c,{name:`danger`,inline:!0}):n+1}),!s&&(0,m.jsx)(`span`,{className:`ds-stepper__connector${r===`complete`?` ds-stepper__connector--complete`:``}`,"data-part":`connector`,"aria-hidden":`true`})]}),w=(0,m.jsx)(o,{element:`span`,"data-part":`label`,size:`sm`,weight:a?`semibold`:`medium`,tone:r===`upcoming`?`muted`:`default`,className:`ds-stepper__label`,overrides:a?D:E,children:e.label}),T=e.description?(0,m.jsx)(o,{element:`span`,id:g,"data-part":`description`,size:`xs`,tone:`muted`,className:`ds-stepper__description`,overrides:O,children:e.description}):null;return(0,m.jsx)(`li`,{className:`ds-stepper__item ds-stepper__item--${r}`,"data-part":`step`,children:l?(0,m.jsxs)(`button`,{type:`button`,className:`ds-stepper__control ds-stepper__control--navigable`,"aria-label":b,"aria-describedby":g,"aria-current":a?`step`:void 0,onClick:()=>_?.(e.id),children:[C,(0,m.jsxs)(`span`,{className:`ds-stepper__content`,children:[w,T]})]}):(0,m.jsxs)(`div`,{className:`ds-stepper__control`,"aria-current":a?`step`:void 0,children:[C,(0,m.jsxs)(`span`,{className:`ds-stepper__content`,children:[w,T,p&&(0,m.jsx)(`span`,{id:v,className:`ds-stepper__visually-hidden`,children:p})]})]})},e.id)})}),(0,m.jsx)(o,{element:`span`,className:`ds-stepper__compactStatus`,size:`sm`,tone:`muted`,children:h.stepOf.replace(`{current}`,String(Math.max(S,0)+1)).replace(`{total}`,String(C))})]})},_.__docgenInfo={description:`Stepper — Design Schema, category: navigation.

When to use:
Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen:
checkout, account setup, a report builder, a multi-part application. Vertical with descriptions
for flows that need explanation ("Verify your identity — takes about 2 minutes"); horizontal for
short, familiar ones. Leave \`navigable: completed\` so people can correct earlier answers without
losing later ones (the container keeps the later steps' state).`,methods:[],displayName:`Stepper`,props:{steps:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
  id: string;
  label: string;
  description?: string | undefined;
  status?: StepperStepStatus | undefined;
}`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`description`,value:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}],required:!1}},{key:`status`,value:{name:`union`,raw:`StepperStepStatus | undefined`,elements:[{name:`union`,raw:`'complete' | 'current' | 'upcoming' | 'error'`,elements:[{name:`literal`,value:`'complete'`},{name:`literal`,value:`'current'`},{name:`literal`,value:`'upcoming'`},{name:`literal`,value:`'error'`}]},{name:`undefined`}],required:!1}}]}}],raw:`StepperStep[]`},description:"The steps in order. `status` is derived from `current` when omitted: before it complete, after it upcoming."},current:{required:!0,tsType:{name:`string`},description:`The id of the current step.`},orientation:{required:!1,tsType:{name:`union`,raw:`StepperOrientation | undefined`,elements:[{name:`union`,raw:`'horizontal' | 'vertical'`,elements:[{name:`literal`,value:`'horizontal'`},{name:`literal`,value:`'vertical'`}]},{name:`undefined`}]},description:"Vertical shows descriptions under each label and suits a side column; horizontal collapses to `compact` below the prose width.",defaultValue:{value:`'horizontal'`,computed:!1}},navigable:{required:!1,tsType:{name:`union`,raw:`StepperNavigable | undefined`,elements:[{name:`union`,raw:`'none' | 'completed' | 'all'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'completed'`},{name:`literal`,value:`'all'`}]},{name:`undefined`}]},description:`Which steps are Buttons: none (display only), completed steps (the usual — you can go back,
not skip ahead), or all (a settings-style flow where order does not matter).`,defaultValue:{value:`'completed'`,computed:!1}},compact:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:'Show only the current step\'s label and "Step 2 of 5"; the indicators stay. Automatic on\nnarrow viewports for horizontal steppers. Has no effect when `orientation` is `vertical`.',defaultValue:{value:`false`,computed:!1}},label:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Accessible name of the navigation landmark. Defaults to `copy.navLabel`.",defaultValue:{value:`'Progress'`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'indicatorSize'
| 'indicatorBackground'
| 'indicatorBorderWidth'
| 'indicatorFontSize'
| 'indicatorFontWeight'
| 'connector'
| 'connectorWidth'
| 'labelWeight'
| 'labelCurrentWeight'
| 'labelSize'
| 'descriptionSize'
| 'stepHover'
| 'stepRadius'
| 'stepGap'
| 'partGap'
| 'fontFamily'
| 'transition'`,elements:[{name:`literal`,value:`'indicatorSize'`},{name:`literal`,value:`'indicatorBackground'`},{name:`literal`,value:`'indicatorBorderWidth'`},{name:`literal`,value:`'indicatorFontSize'`},{name:`literal`,value:`'indicatorFontWeight'`},{name:`literal`,value:`'connector'`},{name:`literal`,value:`'connectorWidth'`},{name:`literal`,value:`'labelWeight'`},{name:`literal`,value:`'labelCurrentWeight'`},{name:`literal`,value:`'labelSize'`},{name:`literal`,value:`'descriptionSize'`},{name:`literal`,value:`'stepHover'`},{name:`literal`,value:`'stepRadius'`},{name:`literal`,value:`'stepGap'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<StepperOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<StepperOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook, or the composed Text's own override, to that token.`},onStepSelect:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself."},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLElement`}],raw:`Ref<HTMLElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{v(),y=[{id:`shipping`,label:`Shipping address`},{id:`payment`,label:`Payment`},{id:`review`,label:`Review order`},{id:`confirm`,label:`Confirmation`}],b=[{id:`account`,label:`Create account`,description:`Takes about a minute.`},{id:`verify`,label:`Verify identity`,description:`Takes about 2 minutes.`},{id:`plan`,label:`Choose a plan`,description:`Compare features and pricing.`},{id:`done`,label:`Done`,description:`Review and confirm.`}],x=[{id:`shipping`,label:`Shipping address`,status:`complete`},{id:`payment`,label:`Payment`,status:`error`},{id:`review`,label:`Review order`},{id:`confirm`,label:`Confirmation`}],S={title:`Stepper/React`,component:_,args:{steps:y,current:`payment`,orientation:`horizontal`,navigable:`completed`,compact:!1,label:`Progress`},argTypes:{onStepSelect:{action:`onStepSelect`}}},C={},w={args:{orientation:`horizontal`}},T={args:{orientation:`vertical`,steps:b,current:`verify`}},E={args:{navigable:`none`}},D={args:{navigable:`completed`}},O={args:{navigable:`all`}},k={args:{compact:!0}},A={args:{orientation:`vertical`,steps:b,current:`verify`}},j={args:{steps:x,current:`payment`}},M={args:{label:`Checkout progress`}},N={args:{navigable:`all`}},P=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`NavigableNone`,`NavigableCompleted`,`NavigableAll`,`Compact`,`WithDescriptions`,`WithError`,`CustomLabel`,`Keyboard`],C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical',
    steps: stepsWithDescriptions,
    current: 'verify'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'none'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'completed'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'all'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical',
    steps: stepsWithDescriptions,
    current: 'verify'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    steps: stepsWithError,
    current: 'payment'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Checkout progress'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'all'
  }
}`,...N.parameters?.docs?.source},description:{story:`Every step is navigable (navigable: 'all'), giving at least three focusable controls to tab\r
through and activate with Enter/Space, per the component's keyboard model.`,...N.parameters?.docs?.description}}}})))()}F();export{k as Compact,M as CustomLabel,C as Default,N as Keyboard,O as NavigableAll,D as NavigableCompleted,E as NavigableNone,w as OrientationHorizontal,T as OrientationVertical,A as WithDescriptions,j as WithError,P as __namedExportsOrder,S as default};