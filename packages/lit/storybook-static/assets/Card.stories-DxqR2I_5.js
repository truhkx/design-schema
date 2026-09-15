import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Button-TSn-G4Vm.js";import{t as o}from"./Text-Dgpz9DWN.js";import{t as s}from"./Link-CFGwxdql.js";import{t as c}from"./Card-Dlyr1ZnO.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{t(),i(),c(),o(),a(),s(),l={title:`Card/Lit`,tags:[`autodocs`],argTypes:{headingLevel:{control:`select`,options:[`2`,`3`,`4`,`5`,`6`]},inset:{control:`select`,options:[`sm`,`md`,`lg`]},surface:{control:`select`,options:[`default`,`subtle`]},interactive:{control:`boolean`}},args:{heading:`Notification settings`,headingLevel:`3`,inset:`md`,surface:`default`,interactive:!1,body:`Choose which updates you want to hear about, and how.`},render:e=>n`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card
        heading=${r(e.heading)}
        heading-level=${e.headingLevel}
        inset=${e.inset}
        surface=${e.surface}
        ?interactive=${e.interactive}
      >
        <ds-text>${e.body}</ds-text>
      </ds-card>
    </div>
  `},u={},d={args:{headingLevel:`2`}},f={args:{headingLevel:`3`}},p={args:{headingLevel:`4`}},m={args:{headingLevel:`5`}},h={args:{headingLevel:`6`}},g={args:{inset:`sm`}},_={args:{inset:`md`}},v={args:{inset:`lg`}},y={args:{surface:`default`}},b={args:{surface:`subtle`}},x={args:{heading:void 0,body:`Your plan renews on the 12th of every month.`}},S={render:e=>n`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${r(e.heading)} heading-level=${e.headingLevel} inset=${e.inset} surface=${e.surface}>
        <ds-link slot="header-actions" href="#details" label="Details"></ds-link>
        <ds-button slot="header-actions" variant="ghost" size="sm" icon-only label="More options">
          <svg slot="leading-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="13" cy="8" r="1.5" />
          </svg>
        </ds-button>
        <ds-text>${e.body}</ds-text>
      </ds-card>
    </div>
  `},C={render:e=>n`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${r(e.heading)} heading-level=${e.headingLevel} inset=${e.inset} surface=${e.surface}>
        <ds-text>${e.body}</ds-text>
        <ds-button slot="footer" variant="primary" size="sm" label="Save"></ds-button>
        <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
      </ds-card>
    </div>
  `},w={render:()=>n`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading="Storage plan" heading-level="3" interactive>
        <ds-text>2 TB, billed annually.</ds-text>
        <ds-link href="#plan" label="Manage plan"></ds-link>
      </ds-card>
    </div>
  `},T={render:e=>n`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${r(e.heading)} heading-level=${e.headingLevel} inset=${e.inset} surface=${e.surface} focusable>
        <ds-text>${e.body}</ds-text>
      </ds-card>
    </div>
  `},E=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HeadingLevel5`,`HeadingLevel6`,`InsetSm`,`InsetMd`,`InsetLg`,`SurfaceDefault`,`SurfaceSubtle`,`SingleContent`,`WithHeaderActions`,`WithFooter`,`InteractiveTrue`,`FocusableTrue`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '5'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '6'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'sm'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'md'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    inset: 'lg'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    surface: 'default'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    surface: 'subtle'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    heading: undefined,
    body: 'Your plan renews on the 12th of every month.'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=\${ifDefined(args.heading)} heading-level=\${args.headingLevel} inset=\${args.inset} surface=\${args.surface}>
        <ds-link slot="header-actions" href="#details" label="Details"></ds-link>
        <ds-button slot="header-actions" variant="ghost" size="sm" icon-only label="More options">
          <svg slot="leading-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="13" cy="8" r="1.5" />
          </svg>
        </ds-button>
        <ds-text>\${args.body}</ds-text>
      </ds-card>
    </div>
  \`
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=\${ifDefined(args.heading)} heading-level=\${args.headingLevel} inset=\${args.inset} surface=\${args.surface}>
        <ds-text>\${args.body}</ds-text>
        <ds-button slot="footer" variant="primary" size="sm" label="Save"></ds-button>
        <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
      </ds-card>
    </div>
  \`
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading="Storage plan" heading-level="3" interactive>
        <ds-text>2 TB, billed annually.</ds-text>
        <ds-link href="#plan" label="Manage plan"></ds-link>
      </ds-card>
    </div>
  \`
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=\${ifDefined(args.heading)} heading-level=\${args.headingLevel} inset=\${args.inset} surface=\${args.surface} focusable>
        <ds-text>\${args.body}</ds-text>
      </ds-card>
    </div>
  \`
}`,...T.parameters?.docs?.source}}}})))()}D();export{u as Default,T as FocusableTrue,d as HeadingLevel2,f as HeadingLevel3,p as HeadingLevel4,m as HeadingLevel5,h as HeadingLevel6,v as InsetLg,_ as InsetMd,g as InsetSm,w as InteractiveTrue,x as SingleContent,y as SurfaceDefault,b as SurfaceSubtle,C as WithFooter,S as WithHeaderActions,E as __namedExportsOrder,l as default};