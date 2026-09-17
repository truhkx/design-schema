import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Icon-BHsrajXm.js";import{t as o}from"./Text-C3do0IPT.js";import{t as s}from"./Button-DM0-zK5H.js";import{t as c}from"./Link-DBG2Lhp4.js";import{t as l}from"./Card-GrjfSIWe.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{t(),r(),l(),o(),s(),c(),a(),u=e=>e.interactive?i`<ds-link href="#card" label=${e.children}></ds-link>`:i`<ds-text>${e.children}</ds-text>`,d={title:`Card/Lit`,tags:[`autodocs`],argTypes:{headingLevel:{control:`select`,options:[`2`,`3`,`4`,`5`,`6`]},inset:{control:`select`,options:[`sm`,`md`,`lg`]},surface:{control:`select`,options:[`default`,`subtle`]},interactive:{control:`boolean`},focusable:{control:`boolean`}},args:{heading:`Notification settings`,headingLevel:`3`,inset:`md`,surface:`default`,interactive:!1,focusable:!1,children:`Choose which updates you want to hear about, and how.`},render:e=>i`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card
        heading=${n(e.heading)}
        heading-level=${e.headingLevel}
        inset=${e.inset}
        surface=${e.surface}
        ?interactive=${e.interactive}
        ?focusable=${e.focusable}
      >
        ${u(e)}
      </ds-card>
    </div>
  `},f={},p={args:{headingLevel:`2`}},m={args:{headingLevel:`3`}},h={args:{headingLevel:`4`}},g={args:{headingLevel:`5`}},_={args:{headingLevel:`6`}},v={args:{inset:`sm`}},y={args:{inset:`md`}},b={args:{inset:`lg`}},x={args:{surface:`default`}},S={args:{surface:`subtle`}},C={args:{interactive:!0,children:`Manage plan`}},w={args:{focusable:!0}},T={args:{heading:`Team plan`,headingLevel:`3`,children:`What the plan includes`}},E={args:{children:`A search result`,inset:`sm`,surface:`subtle`}},D={args:{heading:`September invoice`,children:`A Link to the invoice`,interactive:!0}},O={args:{heading:`New comment`,children:`The comment body`,focusable:!0}},k={render:e=>i`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${n(e.heading)} heading-level=${e.headingLevel} inset=${e.inset} surface=${e.surface}>
        <ds-link slot="header-actions" href="#details" label="Details"></ds-link>
        <ds-button slot="header-actions" variant="ghost" size="sm" icon-only label="More options">
          <ds-icon slot="leading-icon" name="ellipsis"></ds-icon>
        </ds-button>
        <ds-text>${e.children}</ds-text>
      </ds-card>
    </div>
  `},A={render:e=>i`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${n(e.heading)} heading-level=${e.headingLevel} inset=${e.inset} surface=${e.surface}>
        <ds-text>${e.children}</ds-text>
        <ds-button slot="footer" variant="primary" size="sm" label="Save"></ds-button>
        <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
      </ds-card>
    </div>
  `},j=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HeadingLevel5`,`HeadingLevel6`,`InsetSm`,`InsetMd`,`InsetLg`,`SurfaceDefault`,`SurfaceSubtle`,`Interactive`,`Focusable`,`PlanCard`,`DenseGridCard`,`WholeCardIsALink`,`CardFocusedByAFeed`,`WithHeaderActions`,`WithFooter`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '5'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '6'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'sm'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'md'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'lg'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    surface: 'default'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    surface: 'subtle'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    interactive: true,
    children: 'Manage plan'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    focusable: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Team plan',
    headingLevel: '3',
    children: 'What the plan includes'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'A search result',
    inset: 'sm',
    surface: 'subtle'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'September invoice',
    children: 'A Link to the invoice',
    interactive: true
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'New comment',
    children: 'The comment body',
    focusable: true
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=\${ifDefined(args.heading)} heading-level=\${args.headingLevel} inset=\${args.inset} surface=\${args.surface}>
        <ds-link slot="header-actions" href="#details" label="Details"></ds-link>
        <ds-button slot="header-actions" variant="ghost" size="sm" icon-only label="More options">
          <ds-icon slot="leading-icon" name="ellipsis"></ds-icon>
        </ds-button>
        <ds-text>\${args.children}</ds-text>
      </ds-card>
    </div>
  \`
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=\${ifDefined(args.heading)} heading-level=\${args.headingLevel} inset=\${args.inset} surface=\${args.surface}>
        <ds-text>\${args.children}</ds-text>
        <ds-button slot="footer" variant="primary" size="sm" label="Save"></ds-button>
        <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
      </ds-card>
    </div>
  \`
}`,...A.parameters?.docs?.source}}}})))()}M();export{O as CardFocusedByAFeed,f as Default,E as DenseGridCard,w as Focusable,p as HeadingLevel2,m as HeadingLevel3,h as HeadingLevel4,g as HeadingLevel5,_ as HeadingLevel6,b as InsetLg,y as InsetMd,v as InsetSm,C as Interactive,T as PlanCard,x as SurfaceDefault,S as SurfaceSubtle,D as WholeCardIsALink,A as WithFooter,k as WithHeaderActions,j as __namedExportsOrder,d as default};