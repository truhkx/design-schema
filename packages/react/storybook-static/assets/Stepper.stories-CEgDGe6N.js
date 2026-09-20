import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-CeSprNHO.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,t as o}from"./Text-BmznDQS2.js";import{n as s,t as c}from"./Icon-CDe7Poew.js";function l(e){let t={},n={fontWeight:_.labelWeight},r={fontWeight:_.labelCurrentWeight},a={},o={},s=_.indicatorFontSize;for(let c of Object.keys(e??{})){let l=e?.[c],u=g[c];if(l)switch(u&&(t[u]=i(l)),c){case`labelSize`:n.fontSize=l,r.fontSize=l;break;case`labelWeight`:n.fontWeight=l;break;case`labelCurrentWeight`:r.fontWeight=l;break;case`descriptionSize`:a.fontSize=l;break;case`countSize`:o.fontSize=l;break;case`indicatorFontSize`:s=l;break;case`fontFamily`:n.fontFamily=l,r.fontFamily=l,a.fontFamily=l,o.fontFamily=l}}return{rootStyle:Object.keys(t).length>0?t:void 0,label:n,currentLabel:r,description:Object.keys(a).length>0?a:void 0,count:Object.keys(o).length>0?o:void 0,indicatorFontSize:s}}function u(e,t,n){return e.status?e.status:n===-1||t>n?`upcoming`:t<n?`complete`:`current`}function d({ref:e,label:t,steps:n,current:r,orientation:i=`horizontal`,navigable:a=`completed`,compact:s=!1,overrides:d,onStepSelect:g,...y}){let b=(0,f.useId)(),x=n.findIndex(e=>e.id===r),S=l(d);h&&x===-1&&console.warn(`Stepper: current "${r}" matches no step id — nothing is selected.`);let C=[`ds-stepper`,`ds-stepper--${i}`,s&&i===`horizontal`?`ds-stepper--compact`:null].filter(Boolean).join(` `),w=m.stepOf.replace(`{current}`,String(Math.max(x,0)+1)).replace(`{total}`,String(n.length));return(0,p.jsxs)(`nav`,{...y,ref:e,"data-ds":`Stepper`,className:C,style:S.rootStyle,"aria-label":t||m.navLabel,children:[(0,p.jsx)(`ol`,{className:`ds-stepper__list`,"data-part":`list`,children:n.map((e,t)=>{let r=u(e,t,x),s=t===x,l=x!==-1&&t<x,d=a===`all`||a===`completed`&&l,f=v[r],m=i===`vertical`&&e.description!==void 0&&e.description!==``,h=m?`${b}-d${t}`:void 0,y=t===n.length-1,C=e=>({size:S.indicatorFontSize,color:e}),w=(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`span`,{className:`ds-stepper__indicator`,"data-part":`indicator`,"aria-hidden":`true`,children:r===`complete`?(0,p.jsx)(c,{name:`check`,size:`sm`,overrides:C(_.indicatorCompleteForeground)}):r===`error`?(0,p.jsx)(c,{name:`danger`,size:`sm`,overrides:C(_.indicatorErrorForeground)}):t+1}),(0,p.jsxs)(`span`,{className:`ds-stepper__content`,children:[(0,p.jsx)(o,{element:`span`,size:`sm`,tone:r===`upcoming`?`muted`:`default`,"data-part":`label`,overrides:s?S.currentLabel:S.label,children:e.label}),m?(0,p.jsx)(o,{element:`span`,size:`xs`,tone:`muted`,id:h,"data-part":`description`,overrides:S.description,children:e.description}):null,f?(0,p.jsx)(`span`,{className:`ds-stepper__visually-hidden`,children:`, ${f}`}):null]})]});return(0,p.jsxs)(`li`,{className:[`ds-stepper__step`,`ds-stepper__step--${r}`,s?`ds-stepper__step--selected`:null].filter(Boolean).join(` `),"data-part":`step`,children:[d?(0,p.jsx)(`button`,{type:`button`,className:`ds-stepper__control ds-stepper__control--navigable`,"aria-current":s?`step`:void 0,"aria-describedby":h,onClick:()=>g?.(e.id),children:w}):(0,p.jsx)(`div`,{className:`ds-stepper__control`,"aria-current":s?`step`:void 0,children:w}),y?null:(0,p.jsx)(`span`,{className:`ds-stepper__connector${l?` ds-stepper__connector--complete`:``}`,"data-part":`connector`,"aria-hidden":`true`})]},e.id)})}),(0,p.jsx)(o,{element:`span`,size:`sm`,tone:`muted`,className:`ds-stepper__count`,"data-part":`count`,overrides:S.count,children:w})]})}var f,p,m,h,g,_,v;function y(){return(y=e((()=>{f=t(),r(),a(),s(),p=n(),m={navLabel:`Progress`,stepOf:`Step {current} of {total}`,complete:`completed`,current:`current step`,error:`has an error`,stepLabel:`Step {n}: {label}`},h=typeof process<`u`&&!1,g={indicatorSize:`--ds-stepper-indicator-size`,indicatorBackground:`--ds-stepper-indicator-background`,indicatorRadius:`--ds-stepper-indicator-radius`,indicatorFontSize:`--ds-stepper-indicator-font-size`,indicatorFontWeight:`--ds-stepper-indicator-font-weight`,connector:`--ds-stepper-connector`,stepHover:`--ds-stepper-step-hover`,stepRadius:`--ds-stepper-step-radius`,stepPadding:`--ds-stepper-step-padding`,stepGap:`--ds-stepper-step-gap`,partGap:`--ds-stepper-part-gap`,fontFamily:`--ds-stepper-font-family`,transition:`--ds-stepper-transition`},_={labelWeight:`font.weight.medium`,labelCurrentWeight:`font.weight.semibold`,indicatorFontSize:`font.size.sm`,indicatorCompleteForeground:`color.control.selectedForeground`,indicatorErrorForeground:`color.status.danger.foreground`},v={complete:m.complete,current:m.current,error:m.error,upcoming:void 0},d.__docgenInfo={description:`Stepper — Design Schema, category: navigation.

When to use:
Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen: checkout, account setup, a report builder, a multi-part application. Vertical with descriptions for flows that need explanation ("Verify your identity — takes about 2 minutes"); horizontal for short, familiar ones. Leave \`navigable: completed\` so people can correct earlier answers without losing later ones (the container keeps the later steps' state).`,methods:[],displayName:`Stepper`,props:{label:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Accessible name of the navigation landmark. Defaults to `copy.navLabel`."},steps:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; label: string; description?: string; status?: "complete" | "current" | "upcoming" | "error" }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`description`,value:{name:`string`,required:!1}},{key:`status`,value:{name:`union`,raw:`"complete" | "current" | "upcoming" | "error"`,elements:[{name:`literal`,value:`"complete"`},{name:`literal`,value:`"current"`},{name:`literal`,value:`"upcoming"`},{name:`literal`,value:`"error"`}],required:!1}}]}}],raw:`{ id: string; label: string; description?: string; status?: "complete" | "current" | "upcoming" | "error" }[]`},description:"The steps in order. `status` is derived from `current` when omitted: before it complete, the step it\nnames current, after it upcoming. An explicit `status` sets only the indicator, its colours and the\nstatus word; position (not status) decides the selected state, navigability, the connector colour and\nthe compact reveal."},current:{required:!0,tsType:{name:`string`},description:'The id of the current step. The step whose id matches is the selected one (`aria-current="step"`) and\nthe one compact reveals, whatever its `status`. When no id matches, nothing is selected, every step\nwithout an explicit status is upcoming, no step is navigable under `completed` (all still are under\n`all`), the count reads "Step 1 of m", and development builds log a warning.'},orientation:{required:!1,tsType:{name:`union`,raw:`StepperOrientation | undefined`,elements:[{name:`union`,raw:`'horizontal' | 'vertical'`,elements:[{name:`literal`,value:`'horizontal'`},{name:`literal`,value:`'vertical'`}]},{name:`undefined`}]},description:"Vertical shows descriptions under each label and suits a side column; horizontal does not render\ndescriptions at all (not clipped, and no aria-describedby) and collapses to `compact` below the prose width.",defaultValue:{value:`'horizontal'`,computed:!1}},navigable:{required:!1,tsType:{name:`union`,raw:`StepperNavigable | undefined`,elements:[{name:`union`,raw:`'none' | 'completed' | 'all'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'completed'`},{name:`literal`,value:`'all'`}]},{name:`undefined`}]},description:`Which steps can be activated: none (display only), completed steps (the usual — you can go back,
not skip ahead), or all (a settings-style flow where order does not matter). "Completed" means
visited — any step before the current one by position, including one marked \`error\`.`,defaultValue:{value:`'completed'`,computed:!1}},compact:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show only the current step's label and "Step 2 of 5"; the indicators stay. Horizontal only, set by
hand or automatically below the prose width — a vertical stepper has the room, so the prop does nothing
there. The other steps' labels, with their status words, are visually clipped, not removed.`,defaultValue:{value:`false`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'indicatorSize'
| 'indicatorBackground'
| 'indicatorRadius'
| 'indicatorFontSize'
| 'indicatorFontWeight'
| 'connector'
| 'labelWeight'
| 'labelCurrentWeight'
| 'labelSize'
| 'descriptionSize'
| 'countSize'
| 'stepHover'
| 'stepRadius'
| 'stepPadding'
| 'stepGap'
| 'partGap'
| 'fontFamily'
| 'transition'`,elements:[{name:`literal`,value:`'indicatorSize'`},{name:`literal`,value:`'indicatorBackground'`},{name:`literal`,value:`'indicatorRadius'`},{name:`literal`,value:`'indicatorFontSize'`},{name:`literal`,value:`'indicatorFontWeight'`},{name:`literal`,value:`'connector'`},{name:`literal`,value:`'labelWeight'`},{name:`literal`,value:`'labelCurrentWeight'`},{name:`literal`,value:`'labelSize'`},{name:`literal`,value:`'descriptionSize'`},{name:`literal`,value:`'countSize'`},{name:`literal`,value:`'stepHover'`},{name:`literal`,value:`'stepRadius'`},{name:`literal`,value:`'stepPadding'`},{name:`literal`,value:`'stepGap'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<StepperOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<StepperOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Per-instance style overrides: each entry sets the matching `--ds-stepper-*` hook, or the composed\nText's or Icon's own override, to that token. Consumers may also set the hooks from their own CSS."},onStepSelect:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself."},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLElement`}],raw:`Ref<HTMLElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{y(),b=[{id:`shipping`,label:`Shipping address`},{id:`payment`,label:`Payment`},{id:`review`,label:`Review order`}],x={title:`Stepper/React`,component:d,tags:[`autodocs`],args:{steps:[{id:`shipping`,label:`Shipping address`},{id:`payment`,label:`Payment`},{id:`review`,label:`Review order`},{id:`confirm`,label:`Confirmation`}],current:`payment`,orientation:`horizontal`,navigable:`completed`,compact:!1},argTypes:{orientation:{control:`inline-radio`,options:[`horizontal`,`vertical`]},navigable:{control:`inline-radio`,options:[`none`,`completed`,`all`]},onStepSelect:{action:`onStepSelect`}}},S={},C={args:{orientation:`horizontal`}},w={args:{orientation:`vertical`}},T={args:{navigable:`none`}},E={args:{navigable:`completed`}},D={args:{navigable:`all`}},O={args:{compact:!0}},k={args:{current:`payment`,steps:[{id:`shipping`,label:`Shipping address`},{id:`payment`,label:`Payment`,status:`error`},{id:`review`,label:`Review order`}]}},A={args:{current:`payment`,steps:b}},j={args:{orientation:`vertical`,current:`verify`,steps:[{id:`account`,label:`Create account`,description:`Takes about a minute.`},{id:`verify`,label:`Verify identity`,description:`Takes about 2 minutes.`},{id:`plan`,label:`Choose a plan`,description:`Compare features and pricing.`}]}},M={args:{navigable:`none`,current:`payment`,steps:b}},N={args:{current:`review`,steps:[{id:`shipping`,label:`Shipping address`,status:`complete`},{id:`payment`,label:`Payment`,status:`error`},{id:`review`,label:`Review order`}]}},P={args:{navigable:`all`}},F=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`NavigableNone`,`NavigableCompleted`,`NavigableAll`,`Compact`,`CurrentStepWithError`,`Checkout`,`OnboardingWithDescriptions`,`DisplayOnly`,`AStepWithAnError`,`Keyboard`],S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'none'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'completed'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'all'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    current: 'payment',
    steps: [{
      id: 'shipping',
      label: 'Shipping address'
    }, {
      id: 'payment',
      label: 'Payment',
      status: 'error'
    }, {
      id: 'review',
      label: 'Review order'
    }]
  }
}`,...k.parameters?.docs?.source},description:{story:"The current step also carries `status: 'error'`: the error indicator wins, the selection stays.",...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    current: 'payment',
    steps: checkoutSteps
  }
}`,...A.parameters?.docs?.source},description:{story:`The usual horizontal flow, where a completed step can be revisited.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical',
    current: 'verify',
    steps: [{
      id: 'account',
      label: 'Create account',
      description: 'Takes about a minute.'
    }, {
      id: 'verify',
      label: 'Verify identity',
      description: 'Takes about 2 minutes.'
    }, {
      id: 'plan',
      label: 'Choose a plan',
      description: 'Compare features and pricing.'
    }]
  }
}`,...j.parameters?.docs?.source},description:{story:`A vertical stepper whose steps each need a line of explanation.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'none',
    current: 'payment',
    steps: checkoutSteps
  }
}`,...M.parameters?.docs?.source},description:{story:`A flow the user cannot jump around in.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    current: 'review',
    steps: [{
      id: 'shipping',
      label: 'Shipping address',
      status: 'complete'
    }, {
      id: 'payment',
      label: 'Payment',
      status: 'error'
    }, {
      id: 'review',
      label: 'Review order'
    }]
  }
}`,...N.parameters?.docs?.source},description:{story:`Validation failed on a step the user has already left.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'all'
  }
}`,...P.parameters?.docs?.source},description:{story:"Tab moves between the navigable steps (four here, with `navigable: all`); Enter and Space select.",...P.parameters?.docs?.description}}}})))()}I();export{N as AStepWithAnError,A as Checkout,O as Compact,k as CurrentStepWithError,S as Default,M as DisplayOnly,P as Keyboard,D as NavigableAll,E as NavigableCompleted,T as NavigableNone,j as OnboardingWithDescriptions,C as OrientationHorizontal,w as OrientationVertical,F as __namedExportsOrder,x as default};