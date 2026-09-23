import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-b_nq3K9L.js";import{t as i}from"./Link-CzFgI_Cj.js";var a,o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{t(),i(),r(),a={title:`Link/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`click`]}},argTypes:{tone:{control:`select`,options:[`default`,`inherit`]},external:{control:`boolean`},download:{control:`boolean`},current:{control:`boolean`}},args:{href:`/billing/history`,label:`View the billing history`,external:!1,tone:`default`,download:!1,current:!1},render:e=>n`<ds-link
      href=${e.href}
      label=${e.label}
      tone=${e.tone}
      ?external=${e.external}
      ?download=${e.download}
      ?current=${e.current}
    ></ds-link>`},o={},s={args:{tone:`default`}},c={args:{tone:`inherit`},render:e=>n`<ds-text tone="muted"
      >For how charges are calculated, read
      <ds-link
        href=${e.href}
        label=${e.label}
        tone=${e.tone}
        ?external=${e.external}
        ?download=${e.download}
        ?current=${e.current}
      ></ds-link
      >.</ds-text
    >`},l={args:{href:`/billing/history`,label:`View the billing history`},render:e=>n`<ds-text
      >Invoices from the last twelve months are kept.
      <ds-link
        href=${e.href}
        label=${e.label}
        tone=${e.tone}
        ?external=${e.external}
        ?download=${e.download}
        ?current=${e.current}
      ></ds-link
      >.</ds-text
    >`},u={args:{href:`https://status.example.com`,label:`Status page`,external:!0}},d={args:{href:`/help/billing`,label:`the billing guide`,tone:`inherit`},render:e=>n`<ds-text tone="muted"
      >For how charges are calculated, read
      <ds-link
        href=${e.href}
        label=${e.label}
        tone=${e.tone}
        ?external=${e.external}
        ?download=${e.download}
        ?current=${e.current}
      ></ds-link
      >.</ds-text
    >`},f={args:{href:`/invoices/2026-09.pdf`,label:`Download the September invoice`,download:!0}},p=[`Default`,`ToneDefault`,`ToneInherit`,`InlineInAParagraph`,`ExternalDestination`,`InsideMutedText`,`DownloadableFile`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'default'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'inherit'
  },
  render: args => html\`<ds-text tone="muted"
      >For how charges are calculated, read
      <ds-link
        href=\${args.href}
        label=\${args.label}
        tone=\${args.tone}
        ?external=\${args.external}
        ?download=\${args.download}
        ?current=\${args.current}
      ></ds-link
      >.</ds-text
    >\`
}`,...c.parameters?.docs?.source},description:{story:`The inherited color is only visible inside muted text, so this uses the same wrapper as InsideMutedText.`,...c.parameters?.docs?.description}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/billing/history',
    label: 'View the billing history'
  },
  render: args => html\`<ds-text
      >Invoices from the last twelve months are kept.
      <ds-link
        href=\${args.href}
        label=\${args.label}
        tone=\${args.tone}
        ?external=\${args.external}
        ?download=\${args.download}
        ?current=\${args.current}
      ></ds-link
      >.</ds-text
    >\`
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    href: 'https://status.example.com',
    label: 'Status page',
    external: true
  }
}`,...u.parameters?.docs?.source},description:{story:"The `external` state story; renders standalone.",...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/help/billing',
    label: 'the billing guide',
    tone: 'inherit'
  },
  render: args => html\`<ds-text tone="muted"
      >For how charges are calculated, read
      <ds-link
        href=\${args.href}
        label=\${args.label}
        tone=\${args.tone}
        ?external=\${args.external}
        ?download=\${args.download}
        ?current=\${args.current}
      ></ds-link
      >.</ds-text
    >\`
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/invoices/2026-09.pdf',
    label: 'Download the September invoice',
    download: true
  }
}`,...f.parameters?.docs?.source},description:{story:"The `download` state story; renders standalone.",...f.parameters?.docs?.description}}}})))()}m();export{o as Default,f as DownloadableFile,u as ExternalDestination,l as InlineInAParagraph,d as InsideMutedText,s as ToneDefault,c as ToneInherit,p as __namedExportsOrder,a as default};