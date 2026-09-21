import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,b as n,w as r}from"./if-defined-CARySXJh.js";import{t as i}from"./Text-BrJPDVza.js";import{t as a}from"./Button-DJvb7DFH.js";import{t as o}from"./Link-EdDzPEMK.js";import{t as s}from"./Card-e_oTv443.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{t(),s(),i(),a(),o(),c={title:`Card/Lit`,tags:[`autodocs`],argTypes:{headingLevel:{control:`select`,options:[`2`,`3`,`4`,`5`,`6`]},inset:{control:`select`,options:[`sm`,`md`,`lg`]},surface:{control:`select`,options:[`default`,`subtle`]},interactive:{control:`boolean`},focusable:{control:`boolean`},footer:{control:`boolean`}},args:{heading:`Team plan`,headingLevel:`3`,inset:`md`,surface:`default`,interactive:!1,focusable:!1,children:`What the plan includes`,footer:!1},render:e=>r`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card
        heading=${e.heading}
        heading-level=${e.headingLevel}
        inset=${e.inset}
        surface=${e.surface}
        ?interactive=${e.interactive}
        ?focusable=${e.focusable}
      >
        ${e.interactive?r`<ds-link href="#invoice" label=${e.children}></ds-link>`:r`<ds-text element="p">${e.children}</ds-text>`}
        ${e.footer?r`<ds-button slot="footer" label="Choose plan" variant="primary" size="sm"></ds-button>
              <ds-button slot="footer" label="Compare plans" variant="secondary" size="sm"></ds-button>`:n}
      </ds-card>
    </div>
  `},l={args:{footer:!0}},u={args:{...l.args,headingLevel:`2`}},d={args:{...l.args,headingLevel:`3`}},f={args:{...l.args,headingLevel:`4`}},p={args:{...l.args,headingLevel:`5`}},m={args:{...l.args,headingLevel:`6`}},h={args:{...l.args,inset:`sm`}},g={args:{...l.args,inset:`md`}},_={args:{...l.args,inset:`lg`}},v={args:{...l.args,surface:`default`}},y={args:{...l.args,surface:`subtle`}},b={args:{...l.args},render:e=>r`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card
        heading=${e.heading}
        heading-level=${e.headingLevel}
        inset=${e.inset}
        surface=${e.surface}
      >
        <ds-link slot="header-actions" href="#details" label="Details"></ds-link>
        <ds-text element="p">${e.children}</ds-text>
        <ds-button slot="footer" label="Choose plan" variant="primary" size="sm"></ds-button>
        <ds-button slot="footer" label="Compare plans" variant="secondary" size="sm"></ds-button>
      </ds-card>
    </div>
  `},x={args:{heading:`September invoice`,interactive:!0,children:`View the September invoice`}},S={args:{...x.args,surface:`subtle`}},C={args:{heading:`September invoice`,interactive:!0,children:`View the September invoice`},render:e=>r`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${e.heading} heading-level=${e.headingLevel} inset=${e.inset} surface=${e.surface} interactive>
        <ds-button slot="header-actions" label="Download" variant="ghost" size="sm"></ds-button>
        <ds-text element="p" tone="muted">Due 30 September.</ds-text>
        <ds-link href="#invoice" label=${e.children}></ds-link>
      </ds-card>
    </div>
  `},w={args:{heading:`September invoice`,interactive:!0,children:`View the September invoice`},render:e=>r`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${e.heading} heading-level=${e.headingLevel} inset=${e.inset} surface=${e.surface} interactive>
        ${r`<ds-text element="p" tone="muted">Due 30 September.</ds-text>
          <ds-link href="#invoice" label=${e.children}></ds-link>`}
      </ds-card>
    </div>
  `},T={args:{heading:`Archived plan`,interactive:!0,children:`Choose plan`},render:e=>r`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${e.heading} heading-level=${e.headingLevel} inset=${e.inset} surface=${e.surface} interactive>
        <ds-button label=${e.children} variant="secondary" disabled></ds-button>
      </ds-card>
    </div>
  `},E={args:{heading:`Team plan`,headingLevel:`3`,children:`What the plan includes`}},D={args:{heading:``,children:`A search result`,inset:`sm`,surface:`subtle`}},O={args:{heading:`September invoice`,children:`A Link to the invoice`,interactive:!0}},k={args:{heading:`New comment`,children:`The comment body`,focusable:!0}},A=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HeadingLevel5`,`HeadingLevel6`,`InsetSm`,`InsetMd`,`InsetLg`,`SurfaceDefault`,`SurfaceSubtle`,`WithHeaderActions`,`Interactive`,`InteractiveSubtle`,`InteractiveWithText`,`InteractiveInFragment`,`InteractiveDisabledButton`,`PlanCard`,`DenseGridCard`,`WholeCardIsALink`,`CardFocusedByAFeed`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    footer: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    headingLevel: '2'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    headingLevel: '3'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    headingLevel: '4'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    headingLevel: '5'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    headingLevel: '6'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    inset: 'sm'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    inset: 'md'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    inset: 'lg'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    surface: 'default'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    surface: 'subtle'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  render: args => html\`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card
        heading=\${args.heading}
        heading-level=\${args.headingLevel}
        inset=\${args.inset}
        surface=\${args.surface}
      >
        <ds-link slot="header-actions" href="#details" label="Details"></ds-link>
        <ds-text element="p">\${args.children}</ds-text>
        <ds-button slot="footer" label="Choose plan" variant="primary" size="sm"></ds-button>
        <ds-button slot="footer" label="Compare plans" variant="secondary" size="sm"></ds-button>
      </ds-card>
    </div>
  \`
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'September invoice',
    interactive: true,
    children: 'View the September invoice'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ...Interactive.args,
    surface: 'subtle'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'September invoice',
    interactive: true,
    children: 'View the September invoice'
  },
  render: args => html\`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=\${args.heading} heading-level=\${args.headingLevel} inset=\${args.inset} surface=\${args.surface} interactive>
        <ds-button slot="header-actions" label="Download" variant="ghost" size="sm"></ds-button>
        <ds-text element="p" tone="muted">Due 30 September.</ds-text>
        <ds-link href="#invoice" label=\${args.children}></ds-link>
      </ds-card>
    </div>
  \`
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'September invoice',
    interactive: true,
    children: 'View the September invoice'
  },
  render: args => html\`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=\${args.heading} heading-level=\${args.headingLevel} inset=\${args.inset} surface=\${args.surface} interactive>
        \${html\`<ds-text element="p" tone="muted">Due 30 September.</ds-text>
          <ds-link href="#invoice" label=\${args.children}></ds-link>\`}
      </ds-card>
    </div>
  \`
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Archived plan',
    interactive: true,
    children: 'Choose plan'
  },
  render: args => html\`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=\${args.heading} heading-level=\${args.headingLevel} inset=\${args.inset} surface=\${args.surface} interactive>
        <ds-button label=\${args.children} variant="secondary" disabled></ds-button>
      </ds-card>
    </div>
  \`
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Team plan',
    headingLevel: '3',
    children: 'What the plan includes'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    heading: '',
    children: 'A search result',
    inset: 'sm',
    surface: 'subtle'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'September invoice',
    children: 'A Link to the invoice',
    interactive: true
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'New comment',
    children: 'The comment body',
    focusable: true
  }
}`,...k.parameters?.docs?.source}}}})))()}j();export{k as CardFocusedByAFeed,l as Default,D as DenseGridCard,u as HeadingLevel2,d as HeadingLevel3,f as HeadingLevel4,p as HeadingLevel5,m as HeadingLevel6,_ as InsetLg,g as InsetMd,h as InsetSm,x as Interactive,T as InteractiveDisabledButton,w as InteractiveInFragment,S as InteractiveSubtle,C as InteractiveWithText,E as PlanCard,v as SurfaceDefault,y as SurfaceSubtle,O as WholeCardIsALink,b as WithHeaderActions,A as __namedExportsOrder,c as default};