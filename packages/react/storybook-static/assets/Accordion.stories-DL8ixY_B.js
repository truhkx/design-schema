import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-D5pPePpr.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,t as o}from"./Text-B1hFPUay.js";import{n as s,t as c}from"./Disclosure-DumHlaUi.js";import{n as l,t as u}from"./Divider-CejG6SHm.js";function d(e){if(e!==void 0)return Array.isArray(e)?e:e===``?[]:[e]}function f(e,t){return t&&e.length>1?e.slice(0,1):e}function p(e,t){return e.length===t.length&&e.every(e=>t.includes(e))}function m({ref:e,items:t,headingLevel:n=`3`,exclusive:r=!1,value:a,defaultValue:o,divided:s=!0,keepMounted:l=!1,overrides:m,onChange:v,onOpenChange:y,onKeyDown:b,...x}){let S=(0,h.useRef)(new Map),C=e=>t=>{t?S.current.set(e,t):S.current.delete(e)},w=a!==void 0,[T,E]=(0,h.useState)(()=>f(d(o)??[],r));!w&&r&&T.length>1&&E(T.slice(0,1));let D=f(w?d(a)??[]:T,r),O=w?JSON.stringify(d(a)??[]):null,k=d(w?a:o)??[],A=(0,h.useRef)(new Set);(0,h.useEffect)(()=>{if(!_||!r||k.length<=1)return;let e=JSON.stringify(k);A.current.has(e)||(A.current.add(e),console.warn(`Accordion: \`exclusive\` opens one section, but \`${w?`value`:`defaultValue`}\` has ${k.length} ids. Opening "${k[0]}"; ignoring ${k.slice(1).join(`, `)}.`))});let j=(0,h.useRef)({valueKey:O,openIds:D}),M=(0,h.useRef)(null);(0,h.useEffect)(()=>{let e=j.current;if(j.current={valueKey:O,openIds:D},!w){M.current=null;return}if(e.valueKey===O)return;let n=M.current;if(M.current=null,!(n!==null&&p(n,k)))for(let n of t){let t=e.openIds.includes(n.id),r=D.includes(n.id);t!==r&&y?.(n.id,r,`controlled`)}});let N=(e,n,i)=>{if(i===`controlled`)return;let a=D,o=n?r?[e]:a.includes(e)?a:[...a,e]:a.filter(t=>t!==e),s=i===`keyboard`?`keyboard`:`trigger`;if(w?M.current=o:E(o),v?.(o),y?.(e,n,s),n&&r)for(let n of t)n.id!==e&&a.includes(n.id)&&y?.(n.id,!1,`exclusive`)},P=e=>{if(b?.(e),e.defaultPrevented)return;let{key:n}=e;if(n!==`ArrowDown`&&n!==`ArrowUp`&&n!==`Home`&&n!==`End`)return;let r=t.findIndex(t=>S.current.get(t.id)===e.target);if(r===-1)return;let i=t.length,a=(e,n)=>{let r=e;for(let e=0;e<i;e+=1)if(r=(r+n+i)%i,!t[r].disabled)return r;return-1},o=-1;o=n===`ArrowDown`?a(r,1):n===`ArrowUp`?a(r,-1):n===`Home`?a(i-1,1):a(0,-1),o!==-1&&(e.preventDefault(),S.current.get(t[o].id)?.focus())},F={triggerPaddingBlock:m?.triggerPaddingBlock??`space.md`,triggerFontFamily:m?.fontFamily??`font.family.body`,triggerFontSize:m?.triggerFontSize??`font.size.md`,triggerFontWeight:m?.triggerFontWeight??`font.weight.medium`},I={color:m?.divider??`color.border`,thickness:m?.dividerWidth??`border.width.thin`},L=m?.itemGap?{"--ds-accordion-item-gap":i(m.itemGap)}:void 0,R=[];return t.forEach((e,t)=>{s&&t>0&&R.push((0,g.jsx)(u,{overrides:I},`divider-${e.id}`)),R.push((0,g.jsx)(c,{ref:C(e.id),summary:e.summary,headingLevel:n,open:D.includes(e.id),disabled:e.disabled,keepMounted:l,overrides:F,onToggle:(t,n)=>N(e.id,t,n),children:e.content},e.id))}),(0,g.jsx)(`div`,{...x,ref:e,"data-ds":`Accordion`,"data-part":`list`,className:`ds-accordion`,style:L,onKeyDown:P,children:R})}var h,g,_;function v(){return(v=e((()=>{h=t(),r(),s(),l(),g=n(),_=typeof process<`u`&&!1,m.__docgenInfo={description:`Accordion — Design Schema, category: container.\r
\r
When to use:\r
Use an Accordion for a series of independent sections a user scans by heading and opens selectively: an FAQ, a\r
settings page grouped by topic, a multi-part form where each part is optional. Set \`headingLevel\` to fit the page\r
outline. Leave \`exclusive\` off unless the panels are heavy or mutually exclusive by nature (a wizard-like "choose\r
one plan to see details").\r
\r
Each item is a Disclosure (the \`item\` part is its root, a direct child of this \`<div>\`); Dividers sit between them.`,methods:[],displayName:`Accordion`,props:{items:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; summary: string; content: ReactNode; disabled?: boolean | undefined }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:`summary`,value:{name:`string`,required:!0}},{key:`content`,value:{name:`ReactNode`,required:!0}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}}],raw:`AccordionItem[]`},description:'The sections in order. `content` is the panel body; on Lit it is dropped from the item type and the body is a\r\nlight-DOM child slotted by the item id (`<div slot="faq-1">`).'},headingLevel:{required:!1,tsType:{name:`union`,raw:`AccordionHeadingLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`'5'`},{name:`literal`,value:`'6'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},{name:`undefined`}]},description:`Heading level for every trigger, so sections appear in the page outline.`,defaultValue:{value:`'3'`,computed:!1}},exclusive:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:'Opening one section closes the others. Off by default: users usually want to compare, and forced-closing is a\r\ncommon frustration. Turning it on while several sections are open trims the open set to the first open id\r\nwithout firing any event. "First" is array order: the order of `value`/`defaultValue`, and for uncontrolled\r\nstate the order the sections were opened. Uncontrolled, the trim is permanent; controlled, it only affects what\r\nis shown, so turning `exclusive` off shows the full `value` again, still without events. A declared set of\r\nseveral ids warns in development, once per distinct id list.',defaultValue:{value:`false`,computed:!1}},value:{required:!1,tsType:{name:`union`,raw:`string | string[] | undefined`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:"Controlled open ids. A bare `string` is accepted as shorthand for a one-id array; an empty array or an empty\r\nstring means nothing is open. Events always report an array, with zero or one entry when `exclusive`."},defaultValue:{required:!1,tsType:{name:`union`,raw:`string | string[] | undefined`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:"Initially open ids; the same shapes as `value`. Given both, `value` controls and `defaultValue` is ignored."},divided:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`A hairline between items.`,defaultValue:{value:`true`,computed:!1}},keepMounted:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Passed to every Disclosure; required when panels contain form fields. Accordion-wide, like `headingLevel`.",defaultValue:{value:`false`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'divider'\r
| 'dividerWidth'\r
| 'itemGap'\r
| 'triggerPaddingBlock'\r
| 'fontFamily'\r
| 'triggerFontSize'\r
| 'triggerFontWeight'`,elements:[{name:`literal`,value:`'divider'`},{name:`literal`,value:`'dividerWidth'`},{name:`literal`,value:`'itemGap'`},{name:`literal`,value:`'triggerPaddingBlock'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'triggerFontSize'`},{name:`literal`,value:`'triggerFontWeight'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<AccordionOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<AccordionOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Per-instance style overrides. `itemGap` sets the root hook; the trigger bindings are forwarded to each composed\r\nDisclosure's `overrides`, `divider`/`dividerWidth` to each Divider's `color`/`thickness`."},onChange:{required:!1,tsType:{name:`union`,raw:`((openIds: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the set of open sections changes, with the open ids — always an array, even under `exclusive`, where\r\nit carries zero or one entry."},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((id: string, open: boolean, reason: AccordionOpenChangeReason) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired per section as it opens or closes. The per-item trigger for analytics, lazy loading of a panel's content,\r\nor scrolling the opened section into view; `onChange` remains the set-level event for state."},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDivElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{v(),a(),y=n(),b=[{id:`cancel`,summary:`What happens if I cancel?`,content:(0,y.jsx)(o,{children:`You keep access until the end of the billing period.`})},{id:`plans`,summary:`Can I change plans later?`,content:(0,y.jsx)(o,{children:`Yes. Changes take effect at the next billing date.`})},{id:`refunds`,summary:`Do you offer refunds?`,content:(0,y.jsx)(o,{children:`Within 14 days of a charge, in full.`})}],x={title:`Accordion/React`,component:m,args:{items:b,headingLevel:`3`,exclusive:!1,divided:!0,keepMounted:!1},argTypes:{headingLevel:{control:`select`,options:[`2`,`3`,`4`,`5`,`6`]},onChange:{action:`onChange`},onOpenChange:{action:`onOpenChange`}},tags:[`autodocs`]},S={},C={args:{headingLevel:`2`}},w={args:{headingLevel:`3`}},T={args:{headingLevel:`4`}},E={args:{headingLevel:`5`}},D={args:{headingLevel:`6`}},O={args:{items:[{id:`cancel`,summary:`What happens if I cancel?`,content:`You keep access until the end of the billing period.`},{id:`refunds`,summary:`Do you offer refunds?`,content:`Within 14 days of a charge, in full.`}]}},k={args:{exclusive:!0,items:[{id:`free`,summary:`Free`,content:`One project and community support.`},{id:`pro`,summary:`Pro`,content:`Unlimited projects and email support.`}]}},A={args:{keepMounted:!0,headingLevel:`2`,items:[{id:`contact`,summary:`Contact details`,content:`Name and email fields.`},{id:`billing`,summary:`Billing address`,content:`Street and city fields.`}]}},j={args:{defaultValue:`setup`,items:[{id:`setup`,summary:`Getting set up`,content:`Install the package and add the provider.`},{id:`upgrade`,summary:`Upgrading`,content:`Read the migration notes before bumping a major.`}]}},M={args:{divided:!1,items:[{id:`shipping`,summary:`Shipping`,content:`Orders ship within two business days.`},{id:`returns`,summary:`Returns`,content:`Items can be returned within 30 days.`}]}},N={args:{value:[`cancel`,`plans`]}},P={args:{items:[...b,{id:`support`,summary:`How do I contact support?`,content:(0,y.jsx)(o,{children:`Write to the support team.`}),disabled:!0}]}},F={args:{items:b}},I=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HeadingLevel5`,`HeadingLevel6`,`Faq`,`OneOpenAtATime`,`FormSections`,`InitiallyOpen`,`Undivided`,`Controlled`,`DisabledItem`,`Keyboard`],S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '5'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '6'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    items: [{
      id: 'cancel',
      summary: 'What happens if I cancel?',
      content: 'You keep access until the end of the billing period.'
    }, {
      id: 'refunds',
      summary: 'Do you offer refunds?',
      content: 'Within 14 days of a charge, in full.'
    }]
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    exclusive: true,
    items: [{
      id: 'free',
      summary: 'Free',
      content: 'One project and community support.'
    }, {
      id: 'pro',
      summary: 'Pro',
      content: 'Unlimited projects and email support.'
    }]
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    keepMounted: true,
    headingLevel: '2',
    items: [{
      id: 'contact',
      summary: 'Contact details',
      content: 'Name and email fields.'
    }, {
      id: 'billing',
      summary: 'Billing address',
      content: 'Street and city fields.'
    }]
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'setup',
    items: [{
      id: 'setup',
      summary: 'Getting set up',
      content: 'Install the package and add the provider.'
    }, {
      id: 'upgrade',
      summary: 'Upgrading',
      content: 'Read the migration notes before bumping a major.'
    }]
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    divided: false,
    items: [{
      id: 'shipping',
      summary: 'Shipping',
      content: 'Orders ship within two business days.'
    }, {
      id: 'returns',
      summary: 'Returns',
      content: 'Items can be returned within 30 days.'
    }]
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    value: ['cancel', 'plans']
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    items: [...ITEMS, {
      id: 'support',
      summary: 'How do I contact support?',
      content: <Text>Write to the support team.</Text>,
      disabled: true
    }]
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    items: ITEMS
  }
}`,...F.parameters?.docs?.source},description:{story:`Present with three enabled triggers and nothing open, for the keyboard gate.`,...F.parameters?.docs?.description}}}})))()}L();export{N as Controlled,S as Default,P as DisabledItem,O as Faq,A as FormSections,C as HeadingLevel2,w as HeadingLevel3,T as HeadingLevel4,E as HeadingLevel5,D as HeadingLevel6,j as InitiallyOpen,F as Keyboard,k as OneOpenAtATime,M as Undivided,I as __namedExportsOrder,x as default};