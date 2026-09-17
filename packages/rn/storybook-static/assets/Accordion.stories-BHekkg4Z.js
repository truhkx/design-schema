import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{c as r,h as i,l as a,m as o,n as s,t as c}from"./decorators-Dl4455ZU.js";import{c as l,l as u,r as d}from"./iframe-CAToN8Eb.js";import{n as f,t as p}from"./Disclosure-_jLb5wWY.js";import{n as m,t as h}from"./Divider-CZvkm8Ht.js";function g(e){return e===void 0||e===``?[]:Array.isArray(e)?e:[e]}function _(e,t){return t&&e.length>1?e.slice(0,1):e}function v(e,t){return e.length===t.length&&e.every(e=>t.includes(e))}function y({items:e,headingLevel:t=`3`,exclusive:n=!1,value:r,defaultValue:i,divided:s=!0,keepMounted:c=!1,onChange:u,onOpenChange:d,overrides:f,ref:m}){let{tokens:y}=l(),S=r!==void 0,[C,w]=b.useState(()=>_(g(i),n)),T=_(S?g(r):C,n),E=T.join(` `),D=S?g(r).join(` `):null;b.useEffect(()=>{!S&&n&&C.length>1&&w(C.slice(0,1))},[n,S,C]);let O=g(S?r:i),k=b.useRef(null);b.useEffect(()=>{if(!n||O.length<=1)return;let e=O.join(` `);k.current!==e&&(k.current=e,console.warn(`Accordion: \`exclusive\` opens one section, but \`${S?`value`:`defaultValue`}\` has ${O.length} ids. Opening "${O[0]}"; ignoring ${O.slice(1).join(`, `)}.`))});let A=b.useRef(T),j=b.useRef(D),M=b.useRef(null);b.useEffect(()=>{let e=A.current,t=j.current!==D;if(A.current=T,j.current=D,!S){M.current=null;return}if(!t)return;let n=M.current;if(M.current=null,!(n!==null&&v(n,T))&&!v(e,T)){for(let t of T)e.includes(t)||d?.(t,!0,`controlled`);for(let t of e)T.includes(t)||d?.(t,!1,`controlled`)}},[E,D,S]);let N=(t,r,i)=>{if(i===`controlled`)return;let a=T,o=r?n?[t]:a.includes(t)?a:[...a,t]:a.filter(e=>e!==t);if(S?M.current=o:w(o),u?.(o),d?.(t,r,`trigger`),r&&n)for(let n of e)n.id!==t&&a.includes(n.id)&&d?.(n.id,!1,`exclusive`)},P=b.useMemo(()=>({triggerPaddingBlock:f?.triggerPaddingBlock??`space.md`,triggerFontFamily:f?.fontFamily??`font.family.body`,triggerFontSize:f?.triggerFontSize??`font.size.md`,triggerFontWeight:f?.triggerFontWeight??`font.weight.medium`}),[f?.triggerPaddingBlock,f?.fontFamily,f?.triggerFontSize,f?.triggerFontWeight]),F=b.useMemo(()=>({color:f?.divider??`color.border`,thickness:f?.dividerWidth??`border.width.thin`}),[f?.divider,f?.dividerWidth]),I={gap:f?.itemGap?a(y,f.itemGap):y.layoutGapNone},L=[];return e.forEach((e,n)=>{s&&n>0&&L.push((0,x.jsx)(h,{overrides:F},`divider-${e.id}`)),L.push((0,x.jsx)(p,{summary:e.summary,headingLevel:t,open:T.includes(e.id),disabled:e.disabled,keepMounted:c,overrides:P,onToggle:(t,n)=>N(e.id,t,n),children:e.content},e.id))}),(0,x.jsx)(o,{ref:m,testID:`Accordion`,style:I,children:L})}var b,x;function S(){return(S=e((()=>{b=t(n(),1),i(),r(),f(),m(),d(),x=u(),y.__docgenInfo={description:"Accordion — a list of Disclosures that know about each other: consistent headings,\nand optionally the rule that opening one closes the rest.\n\nWhen to use: a series of independent sections a user scans by heading and opens\nselectively — an FAQ, a settings page grouped by topic, a multi-part form where each\npart is optional. Leave `exclusive` off unless the panels are heavy or mutually\nexclusive by nature. Do not use it for content most users need, as navigation, as\ntabs, nested, or for a single section (that is a Disclosure).\n\nRenders the `list` part as a `View` (its `gap` is `itemGap`) of `Disclosure`s — the `item`\npart is each Disclosure's root, a direct child — with a `Divider` between them when\n`divided`. The accordion owns the open set (or defers to `value`) and passes\n`open`/`onToggle`, `headingLevel` and `keepMounted` to each Disclosure, forwarding\n`triggerPaddingBlock`, `fontFamily` (as `triggerFontFamily`), `triggerFontSize` and\n`triggerFontWeight` to its `overrides`; `divider`/`dividerWidth` reach each Divider's\n`color`/`thickness`. Disabled items stay visible and focusable but do not toggle.\n\nAcknowledged native limit: `Pressable` has no key events, so ArrowUp/Down/Home/End are\nnot implemented (on react-native-web too); every trigger is an ordinary accessibility\nstop reached by swipe or Tab, and `onOpenChange` reports `trigger` for every activation.\n`headingLevel` only marks each summary `accessibilityRole=\"header\"`.",methods:[],displayName:`Accordion`,props:{items:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; summary: string; content: React.ReactNode; disabled?: boolean | undefined }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:`summary`,value:{name:`string`,required:!0}},{key:`content`,value:{name:`ReactReactNode`,raw:`React.ReactNode`,required:!0}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}}],raw:`{ id: string; summary: string; content: React.ReactNode; disabled?: boolean | undefined }[]`},description:"The sections in order. `content` is the panel body."},headingLevel:{required:!1,tsType:{name:`union`,raw:`AccordionHeadingLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`'5'`},{name:`literal`,value:`'6'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},{name:`undefined`}]},description:'Heading level for every trigger, so sections appear in the page outline. Native has no heading levels: every trigger\'s summary is `accessibilityRole="header"` and the value itself changes nothing else.',defaultValue:{value:`'3'`,computed:!1}},exclusive:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Opening one section closes the others. Off by default: users usually want to compare, and forced-closing is a common frustration. Turning it on while several sections are open trims the open set to the first open id without firing any event.`,defaultValue:{value:`false`,computed:!1}},value:{required:!1,tsType:{name:`union`,raw:`string | string[] | undefined`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:"Controlled open ids. A bare `string` is accepted as shorthand for a one-id array; an empty array or an empty string means nothing is open. Events always report an array, with zero or one entry when `exclusive`."},defaultValue:{required:!1,tsType:{name:`union`,raw:`string | string[] | undefined`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:"Initially open ids; the same shapes as `value`."},divided:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`A hairline between items.`,defaultValue:{value:`true`,computed:!1}},keepMounted:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Passed to every Disclosure; required when panels contain form fields.`,defaultValue:{value:`false`,computed:!1}},onChange:{required:!1,tsType:{name:`union`,raw:`((openIds: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the set of open sections changes, with the open ids — always an array, even under `exclusive`, where it carries zero or one entry."},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((id: string, open: boolean, reason: AccordionOpenChangeReason) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired per section as it opens or closes. The per-item trigger for analytics, lazy loading of a panel's content, or scrolling the opened section into view; `onChange` remains the set-level event for state."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'divider'
| 'dividerWidth'
| 'itemGap'
| 'triggerPaddingBlock'
| 'fontFamily'
| 'triggerFontSize'
| 'triggerFontWeight'`,elements:[{name:`literal`,value:`'divider'`},{name:`literal`,value:`'dividerWidth'`},{name:`literal`,value:`'itemGap'`},{name:`literal`,value:`'triggerPaddingBlock'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'triggerFontSize'`},{name:`literal`,value:`'triggerFontWeight'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<AccordionOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<AccordionOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."},ref:{required:!1,tsType:{name:`union`,raw:`React.Ref<ViewInstance> | undefined`,elements:[{name:`ReactRef`,raw:`React.Ref<ViewInstance>`,elements:[{name:`ViewInstance`}]},{name:`undefined`}]},description:"The root view (the `list` part)."}}}})))()}var C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{S(),c(),C={title:`Accordion/React Native`,component:y,decorators:[s()],args:{items:[{id:`shipping`,summary:`How long does shipping take?`,content:`Orders ship within two business days.`},{id:`returns`,summary:`What is your return policy?`,content:`Items can be returned within 30 days.`},{id:`payment`,summary:`Which payment methods are accepted?`,content:`All major credit cards.`},{id:`support`,summary:`How do I contact support?`,content:`From the Help page.`,disabled:!0}]}},w={},T={args:{headingLevel:`2`}},E={args:{headingLevel:`3`}},D={args:{headingLevel:`4`}},O={args:{headingLevel:`5`}},k={args:{headingLevel:`6`}},A={args:{exclusive:!0,defaultValue:`shipping`}},j={args:{divided:!1}},M={args:{keepMounted:!0}},N={args:{overrides:{triggerPaddingBlock:`space.lg`,divider:`color.border.strong`}}},P={args:{items:[{id:`cancel`,summary:`What happens if I cancel?`,content:`You keep access until the end of the billing period.`},{id:`refunds`,summary:`Do you offer refunds?`,content:`Within 14 days of a charge, in full.`}]}},F={args:{exclusive:!0,items:[{id:`free`,summary:`Free`,content:`One project and community support.`},{id:`pro`,summary:`Pro`,content:`Unlimited projects and email support.`}]}},I={args:{keepMounted:!0,headingLevel:`2`,items:[{id:`contact`,summary:`Contact details`,content:`Name and email fields.`},{id:`billing`,summary:`Billing address`,content:`Street and city fields.`}]}},L={args:{divided:!1,items:[{id:`shipping`,summary:`Shipping`,content:`Orders ship within two business days.`},{id:`returns`,summary:`Returns`,content:`Items can be returned within 30 days.`}]}},R={args:{defaultValue:`shipping`}},z=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HeadingLevel5`,`HeadingLevel6`,`Exclusive`,`NotDivided`,`KeepMounted`,`WithOverrides`,`Faq`,`OneOpenAtATime`,`FormSections`,`Undivided`,`Keyboard`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '5'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '6'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    exclusive: true,
    defaultValue: 'shipping'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    divided: false
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    keepMounted: true
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      triggerPaddingBlock: 'space.lg',
      divider: 'color.border.strong'
    }
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'shipping'
  }
}`,...R.parameters?.docs?.source},description:{story:`Open, with four triggers as focus stops, for the axe gate and manual keyboard checks on react-native-web.`,...R.parameters?.docs?.description}}}})))()}B();export{w as Default,A as Exclusive,P as Faq,I as FormSections,T as HeadingLevel2,E as HeadingLevel3,D as HeadingLevel4,O as HeadingLevel5,k as HeadingLevel6,M as KeepMounted,R as Keyboard,j as NotDivided,F as OneOpenAtATime,L as Undivided,N as WithOverrides,z as __namedExportsOrder,C as default};