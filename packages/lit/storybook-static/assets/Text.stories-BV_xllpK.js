import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-C3do0IPT.js";function i(e){return n`
    <ds-text
      size=${e.size}
      weight=${e.weight}
      tone=${e.tone}
      align=${e.align}
      ?truncate=${e.truncate}
      element=${e.element}
      >${e.text}</ds-text
    >
  `}var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{t(),r(),a={title:`Text/Lit`,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`xs`,`sm`,`md`,`lg`,`xl`]},weight:{control:`select`,options:[`regular`,`medium`,`semibold`,`bold`]},tone:{control:`select`,options:[`default`,`strong`,`muted`,`danger`,`onAction`]},align:{control:`select`,options:[`start`,`center`,`end`]},truncate:{control:`boolean`},element:{control:`select`,options:[`p`,`span`]}},args:{size:`md`,weight:`regular`,tone:`default`,align:`start`,truncate:!1,element:`p`,text:`Changes are saved automatically. You can undo any change for 30 days.`},render:i},o={},s={args:{size:`xs`}},c={args:{size:`sm`}},l={args:{size:`md`}},u={args:{size:`lg`}},d={args:{size:`xl`}},f={args:{weight:`regular`}},p={args:{weight:`medium`}},m={args:{weight:`semibold`}},h={args:{weight:`bold`}},g={args:{tone:`default`}},_={args:{tone:`strong`}},v={args:{tone:`muted`}},y={args:{tone:`danger`,text:`Error: enter an email address like name@example.com`}},b={args:{tone:`onAction`,text:`Text on an action background`},render:e=>n`
    <div style="background: var(--color-action-primary-background); padding: var(--space-md)">${i(e)}</div>
  `},x={args:{align:`start`}},S={args:{align:`center`}},C={args:{align:`end`}},w={args:{element:`p`}},T={args:{element:`span`}},E={args:{text:`Changes are saved automatically. You can undo any change for 30 days.`}},D={args:{text:`Last updated 2 minutes ago.`,size:`xs`,tone:`muted`}},O={args:{text:`Error: enter an email address like name@example.com`,tone:`danger`,element:`span`}},k={args:{text:`Quarterly revenue summary for the EMEA region.`,truncate:!0},render:e=>n`<div style="max-inline-size: 16rem">${i(e)}</div>`},A=[`Default`,`SizeXs`,`SizeSm`,`SizeMd`,`SizeLg`,`SizeXl`,`WeightRegular`,`WeightMedium`,`WeightSemibold`,`WeightBold`,`ToneDefault`,`ToneStrong`,`ToneMuted`,`ToneDanger`,`ToneOnAction`,`AlignStart`,`AlignCenter`,`AlignEnd`,`ElementP`,`ElementSpan`,`BodyCopy`,`Caption`,`InlineErrorWording`,`TruncatedCell`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'xs'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'xl'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    weight: 'regular'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    weight: 'medium'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    weight: 'semibold'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    weight: 'bold'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'default'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'strong'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'muted'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'danger',
    text: 'Error: enter an email address like name@example.com'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'onAction',
    text: 'Text on an action background'
  },
  render: args => html\`
    <div style="background: var(--color-action-primary-background); padding: var(--space-md)">\${renderText(args)}</div>
  \`
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'start'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'center'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'end'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'p'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    element: 'span'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Changes are saved automatically. You can undo any change for 30 days.'
  }
}`,...E.parameters?.docs?.source},description:{story:`The default paragraph — body size, regular weight, default tone.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Last updated 2 minutes ago.',
    size: 'xs',
    tone: 'muted'
  }
}`,...D.parameters?.docs?.source},description:{story:`Secondary metadata at the smallest readable size, muted so it sits behind the content it annotates.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Error: enter an email address like name@example.com',
    tone: 'danger',
    element: 'span'
  }
}`,...O.parameters?.docs?.source},description:{story:`Error copy where the danger tone is paired with explicit words, so color alone never carries the meaning.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Quarterly revenue summary for the EMEA region.',
    truncate: true
  },
  render: args => html\`<div style="max-inline-size: 16rem">\${renderText(args)}</div>\`
}`,...k.parameters?.docs?.source},description:{story:`One line of text in a dense cell, with the full string still reachable.`,...k.parameters?.docs?.description}}}})))()}j();export{S as AlignCenter,C as AlignEnd,x as AlignStart,E as BodyCopy,D as Caption,o as Default,w as ElementP,T as ElementSpan,O as InlineErrorWording,u as SizeLg,l as SizeMd,c as SizeSm,d as SizeXl,s as SizeXs,y as ToneDanger,g as ToneDefault,v as ToneMuted,b as ToneOnAction,_ as ToneStrong,k as TruncatedCell,h as WeightBold,p as WeightMedium,f as WeightRegular,m as WeightSemibold,A as __namedExportsOrder,a as default};