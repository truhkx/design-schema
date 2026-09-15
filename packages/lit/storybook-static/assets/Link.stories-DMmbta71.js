import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Text-Dgpz9DWN.js";import{t as i}from"./Link-CFGwxdql.js";var a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{t(),i(),r(),a={title:`Link/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`click`]}},argTypes:{tone:{control:`select`,options:[`default`,`inherit`]},external:{control:`boolean`},download:{control:`boolean`}},args:{href:`#billing`,label:`View the billing history`,external:!1,tone:`default`,download:!1},render:e=>n`
    <ds-link
      href=${e.href}
      label=${e.label}
      tone=${e.tone}
      ?external=${e.external}
      ?download=${e.download}
    ></ds-link>
  `},o={},s={args:{tone:`default`}},c={args:{tone:`inherit`},render:e=>n`
    <ds-text tone="muted"
      >Your trial ends in 3 days.
      <ds-link
        href=${e.href}
        label="Compare plans"
        tone=${e.tone}
        ?external=${e.external}
        ?download=${e.download}
      ></ds-link
      >.</ds-text
    >
  `},l={args:{external:!0,href:`https://www.w3.org/WAI/ARIA/apg/`,label:`ARIA Authoring Practices Guide`}},u={args:{download:!0,href:`/invoice-2026-09.pdf`,label:`Download invoice (PDF)`}},d={render:e=>n`
    <ds-text
      >Screen-reader users navigate by pulling up a list of links, so
      <ds-link href=${e.href} label="link text should describe the destination"></ds-link>
      and make sense out of context.</ds-text
    >
  `},f=[`Default`,`ToneDefault`,`ToneInherit`,`ExternalTrue`,`DownloadTrue`,`Inline`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'default'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'inherit'
  },
  render: args => html\`
    <ds-text tone="muted"
      >Your trial ends in 3 days.
      <ds-link
        href=\${args.href}
        label="Compare plans"
        tone=\${args.tone}
        ?external=\${args.external}
        ?download=\${args.download}
      ></ds-link
      >.</ds-text
    >
  \`
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    external: true,
    href: 'https://www.w3.org/WAI/ARIA/apg/',
    label: 'ARIA Authoring Practices Guide'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    download: true,
    href: '/invoice-2026-09.pdf',
    label: 'Download invoice (PDF)'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-text
      >Screen-reader users navigate by pulling up a list of links, so
      <ds-link href=\${args.href} label="link text should describe the destination"></ds-link>
      and make sense out of context.</ds-text
    >
  \`
}`,...d.parameters?.docs?.source}}}})))()}p();export{o as Default,u as DownloadTrue,l as ExternalTrue,d as Inline,s as ToneDefault,c as ToneInherit,f as __namedExportsOrder,a as default};