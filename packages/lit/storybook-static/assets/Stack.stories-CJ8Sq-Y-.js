import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-b_nq3K9L.js";import{t as i}from"./Button-B3rVveNU.js";import{t as a}from"./Input-C44YOz46.js";import{t as o}from"./Stack-CZci_zJ9.js";import{t as s}from"./Box-Cbe3zAzP.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{t(),o(),s(),i(),a(),r(),c=e=>n`<div style="max-inline-size: calc(var(--layout-max-width-prose) * 0.5)">${e()}</div>`,l=n`
  <ds-text>First item</ds-text>
  <ds-text>Second item</ds-text>
  <ds-text>Third item</ds-text>
`,u=[`All`,`Open`,`Closed`,`Mine`,`Unassigned`,`Urgent`,`This week`,`Archived`].map(e=>n`<ds-button variant="secondary" size="sm" label=${e}></ds-button>`),d={title:`Stack/Lit`,tags:[`autodocs`],argTypes:{direction:{control:`select`,options:[`vertical`,`horizontal`]},gap:{control:`select`,options:[`none`,`tight`,`normal`,`loose`,`section`]},align:{control:`select`,options:[`start`,`center`,`end`,`stretch`]},justify:{control:`select`,options:[`start`,`center`,`end`,`between`]},wrap:{control:`boolean`},element:{control:`select`,options:[`div`,`section`,`nav`,`ul`,`ol`]}},args:{direction:`vertical`,gap:`normal`,align:`stretch`,justify:`start`,wrap:!1,element:`div`},render:e=>n`
    <ds-stack
      direction=${e.direction}
      gap=${e.gap}
      align=${e.align}
      justify=${e.justify}
      ?wrap=${e.wrap}
      element=${e.element}
    >
      ${l}
    </ds-stack>
  `},f={},p={args:{direction:`vertical`}},m={args:{direction:`horizontal`,align:`start`}},h={args:{gap:`none`}},g={args:{gap:`tight`}},_={args:{gap:`normal`}},v={args:{gap:`loose`}},y={args:{gap:`section`}},b={args:{align:`start`}},x={args:{align:`center`}},S={args:{align:`end`}},C={args:{align:`stretch`}},w={args:{direction:`horizontal`,align:`start`,justify:`start`}},T={args:{direction:`horizontal`,align:`start`,justify:`center`}},E={args:{direction:`horizontal`,align:`start`,justify:`end`}},D={args:{direction:`horizontal`,align:`start`,justify:`between`}},O={args:{direction:`horizontal`,align:`start`,wrap:!0},decorators:[c],render:e=>n`
    <ds-stack
      direction=${e.direction}
      gap=${e.gap}
      align=${e.align}
      justify=${e.justify}
      ?wrap=${e.wrap}
      element=${e.element}
    >
      ${u}
    </ds-stack>
  `},k={args:{element:`div`}},A={args:{element:`section`}},j={args:{element:`nav`,direction:`horizontal`,align:`start`}},M={args:{element:`ul`}},N={args:{element:`ol`}},P={args:{direction:`vertical`,gap:`normal`},render:e=>n`
    <ds-stack
      direction=${e.direction}
      gap=${e.gap}
      align=${e.align}
      justify=${e.justify}
      ?wrap=${e.wrap}
      element=${e.element}
    >
      <ds-input label="Full name" name="name" type="text"></ds-input>
      <ds-input label="Email" name="email" type="email"></ds-input>
      <ds-input label="Password" name="password" type="password"></ds-input>
    </ds-stack>
  `},F={args:{direction:`horizontal`,gap:`tight`,justify:`end`,align:`center`},render:e=>n`
    <ds-stack
      direction=${e.direction}
      gap=${e.gap}
      align=${e.align}
      justify=${e.justify}
      ?wrap=${e.wrap}
      element=${e.element}
    >
      <ds-button variant="secondary" label="Cancel"></ds-button>
      <ds-button type="submit" label="Submit"></ds-button>
    </ds-stack>
  `},I={args:{direction:`vertical`,gap:`section`},render:e=>n`
    <ds-stack
      direction=${e.direction}
      gap=${e.gap}
      align=${e.align}
      justify=${e.justify}
      ?wrap=${e.wrap}
      element=${e.element}
    >
      <ds-box surface="subtle" inset="md"><ds-text>Summary</ds-text></ds-box>
      <ds-box surface="subtle" inset="md"><ds-text>Details</ds-text></ds-box>
      <ds-box surface="subtle" inset="md"><ds-text>History</ds-text></ds-box>
    </ds-stack>
  `},L={args:{direction:`horizontal`,gap:`tight`,wrap:!0,align:`center`},decorators:[c],render:e=>n`
    <ds-stack
      direction=${e.direction}
      gap=${e.gap}
      align=${e.align}
      justify=${e.justify}
      ?wrap=${e.wrap}
      element=${e.element}
    >
      ${u}
    </ds-stack>
  `},R=`Default.DirectionVertical.DirectionHorizontal.GapNone.GapTight.GapNormal.GapLoose.GapSection.AlignStart.AlignCenter.AlignEnd.AlignStretch.JustifyStart.JustifyCenter.JustifyEnd.JustifyBetween.Wrap.ElementDiv.ElementSection.ElementNav.ElementUl.ElementOl.FormFields.ButtonRow.PageSections.WrappingFilters`.split(`.`),f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'vertical'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    align: 'start'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'none'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'tight'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'normal'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'loose'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'section'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'start'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'center'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'end'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'stretch'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    align: 'start',
    justify: 'start'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    align: 'start',
    justify: 'center'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    align: 'start',
    justify: 'end'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    align: 'start',
    justify: 'between'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    align: 'start',
    wrap: true
  },
  decorators: [proseWidth],
  render: args => html\`
    <ds-stack
      direction=\${args.direction}
      gap=\${args.gap}
      align=\${args.align}
      justify=\${args.justify}
      ?wrap=\${args.wrap}
      element=\${args.element}
    >
      \${filters}
    </ds-stack>
  \`
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'div'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'section'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'nav',
    direction: 'horizontal',
    align: 'start'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'ul'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'ol'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'vertical',
    gap: 'normal'
  },
  render: args => html\`
    <ds-stack
      direction=\${args.direction}
      gap=\${args.gap}
      align=\${args.align}
      justify=\${args.justify}
      ?wrap=\${args.wrap}
      element=\${args.element}
    >
      <ds-input label="Full name" name="name" type="text"></ds-input>
      <ds-input label="Email" name="email" type="email"></ds-input>
      <ds-input label="Password" name="password" type="password"></ds-input>
    </ds-stack>
  \`
}`,...P.parameters?.docs?.source},description:{story:`The usual vertical rhythm between fields in a form.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    gap: 'tight',
    justify: 'end',
    align: 'center'
  },
  render: args => html\`
    <ds-stack
      direction=\${args.direction}
      gap=\${args.gap}
      align=\${args.align}
      justify=\${args.justify}
      ?wrap=\${args.wrap}
      element=\${args.element}
    >
      <ds-button variant="secondary" label="Cancel"></ds-button>
      <ds-button type="submit" label="Submit"></ds-button>
    </ds-stack>
  \`
}`,...F.parameters?.docs?.source},description:{story:`A row of actions at the end of a form or card, tightly spaced and pushed to the end.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'vertical',
    gap: 'section'
  },
  render: args => html\`
    <ds-stack
      direction=\${args.direction}
      gap=\${args.gap}
      align=\${args.align}
      justify=\${args.justify}
      ?wrap=\${args.wrap}
      element=\${args.element}
    >
      <ds-box surface="subtle" inset="md"><ds-text>Summary</ds-text></ds-box>
      <ds-box surface="subtle" inset="md"><ds-text>Details</ds-text></ds-box>
      <ds-box surface="subtle" inset="md"><ds-text>History</ds-text></ds-box>
    </ds-stack>
  \`
}`,...I.parameters?.docs?.source},description:{story:`The section rhythm between the regions of a page.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    direction: 'horizontal',
    gap: 'tight',
    wrap: true,
    align: 'center'
  },
  decorators: [proseWidth],
  render: args => html\`
    <ds-stack
      direction=\${args.direction}
      gap=\${args.gap}
      align=\${args.align}
      justify=\${args.justify}
      ?wrap=\${args.wrap}
      element=\${args.element}
    >
      \${filters}
    </ds-stack>
  \`
}`,...L.parameters?.docs?.source},description:{story:`A horizontal group that reflows onto new lines on narrow viewports instead of overflowing.`,...L.parameters?.docs?.description}}}})))()}z();export{x as AlignCenter,S as AlignEnd,b as AlignStart,C as AlignStretch,F as ButtonRow,f as Default,m as DirectionHorizontal,p as DirectionVertical,k as ElementDiv,j as ElementNav,N as ElementOl,A as ElementSection,M as ElementUl,P as FormFields,v as GapLoose,h as GapNone,_ as GapNormal,y as GapSection,g as GapTight,D as JustifyBetween,T as JustifyCenter,E as JustifyEnd,w as JustifyStart,I as PageSections,O as Wrap,L as WrappingFilters,R as __namedExportsOrder,d as default};