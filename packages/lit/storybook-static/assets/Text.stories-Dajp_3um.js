import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Text-Dgpz9DWN.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{t(),r(),i={title:`Text/Lit`,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`xs`,`sm`,`md`,`lg`,`xl`]},weight:{control:`select`,options:[`regular`,`medium`,`semibold`,`bold`]},tone:{control:`select`,options:[`default`,`strong`,`muted`,`danger`,`onAction`]},align:{control:`select`,options:[`start`,`center`,`end`]},truncate:{control:`boolean`},element:{control:`select`,options:[`p`,`span`]}},args:{size:`md`,weight:`regular`,tone:`default`,align:`start`,truncate:!1,element:`p`,text:`Changes are saved automatically. You can undo any change for 30 days.`},render:e=>n`
    <ds-text
      size=${e.size}
      weight=${e.weight}
      tone=${e.tone}
      align=${e.align}
      ?truncate=${e.truncate}
      .element=${e.element}
      >${e.text}</ds-text
    >
  `},a={},o={args:{size:`xs`}},s={args:{size:`sm`}},c={args:{size:`md`}},l={args:{size:`lg`}},u={args:{size:`xl`}},d={args:{weight:`regular`}},f={args:{weight:`medium`}},p={args:{weight:`semibold`}},m={args:{weight:`bold`}},h={args:{tone:`default`}},g={args:{tone:`strong`}},_={args:{tone:`muted`}},v={args:{tone:`danger`,text:`Error: enter an email address like name@example.com`}},y={args:{tone:`onAction`,text:`Text on an action background`},render:e=>n`
    <div style="background: var(--color-action-primary-background); padding: var(--space-md)">
      <ds-text size=${e.size} weight=${e.weight} tone=${e.tone} align=${e.align} ?truncate=${e.truncate} .element=${e.element}
        >${e.text}</ds-text
      >
    </div>
  `},b={args:{align:`start`}},x={args:{align:`center`}},S={args:{align:`end`}},C={args:{element:`p`}},w={args:{element:`span`}},T={args:{truncate:!0},render:e=>n`
    <div style="max-inline-size: 16rem">
      <ds-text size=${e.size} weight=${e.weight} tone=${e.tone} align=${e.align} ?truncate=${e.truncate} .element=${e.element}
        >${e.text}</ds-text
      >
    </div>
  `},E=[`Default`,`SizeXs`,`SizeSm`,`SizeMd`,`SizeLg`,`SizeXl`,`WeightRegular`,`WeightMedium`,`WeightSemibold`,`WeightBold`,`ToneDefault`,`ToneStrong`,`ToneMuted`,`ToneDanger`,`ToneOnAction`,`AlignStart`,`AlignCenter`,`AlignEnd`,`ElementP`,`ElementSpan`,`Truncate`],a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'xs'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'xl'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    weight: 'regular'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    weight: 'medium'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    weight: 'semibold'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    weight: 'bold'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'default'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'strong'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'muted'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    text: 'Error: enter an email address like name@example.com'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'onAction',
    text: 'Text on an action background'
  },
  render: args => html\`
    <div style="background: var(--color-action-primary-background); padding: var(--space-md)">
      <ds-text size=\${args.size} weight=\${args.weight} tone=\${args.tone} align=\${args.align} ?truncate=\${args.truncate} .element=\${args.element}
        >\${args.text}</ds-text
      >
    </div>
  \`
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
    element: 'p'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'span'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    truncate: true
  },
  render: args => html\`
    <div style="max-inline-size: 16rem">
      <ds-text size=\${args.size} weight=\${args.weight} tone=\${args.tone} align=\${args.align} ?truncate=\${args.truncate} .element=\${args.element}
        >\${args.text}</ds-text
      >
    </div>
  \`
}`,...T.parameters?.docs?.source}}}})))()}D();export{x as AlignCenter,S as AlignEnd,b as AlignStart,a as Default,C as ElementP,w as ElementSpan,l as SizeLg,c as SizeMd,s as SizeSm,u as SizeXl,o as SizeXs,v as ToneDanger,h as ToneDefault,_ as ToneMuted,y as ToneOnAction,g as ToneStrong,T as Truncate,m as WeightBold,f as WeightMedium,d as WeightRegular,p as WeightSemibold,E as __namedExportsOrder,i as default};