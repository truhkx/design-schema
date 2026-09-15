import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Heading-zy-G4KpZ.js";import{t as i}from"./Text-Dgpz9DWN.js";import{t as a}from"./Stack-CZSvFm0E.js";import{t as o}from"./Link-CFGwxdql.js";import{t as s}from"./Landmark-SaX6suX5.js";var c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{t(),s(),r(),i(),a(),o(),c={title:`Landmark/Lit`,tags:[`autodocs`],argTypes:{role:{control:`select`,options:[`banner`,`navigation`,`main`,`complementary`,`contentinfo`,`region`,`search`,`form`]}},args:{role:`region`,label:`Related articles`},render:e=>n`
    <ds-landmark role=${e.role} .label=${e.label}>
      <ds-stack gap="2">
        <ds-heading level="2">${e.label??e.role}</ds-heading>
        <ds-text tone="muted"
          >This element is a <code>${e.role}</code> landmark with no shadow root; inspect it to see
          the role and name on the host.</ds-text
        >
      </ds-stack>
    </ds-landmark>
  `},l={},u={args:{role:`banner`,label:void 0}},d={args:{role:`navigation`,label:`Main`},render:e=>n`
    <ds-landmark role=${e.role} .label=${e.label}>
      <ds-stack element="ul" direction="horizontal" gap="4">
        <ds-link href="#docs" label="Docs"></ds-link>
        <ds-link href="#pricing" label="Pricing"></ds-link>
        <ds-link href="#changelog" label="Changelog"></ds-link>
      </ds-stack>
    </ds-landmark>
  `},f={args:{role:`main`,label:void 0}},p={args:{role:`complementary`,label:`Related`}},m={args:{role:`contentinfo`,label:void 0}},h={args:{role:`region`,label:`Related articles`}},g={args:{role:`search`,label:void 0}},_={args:{role:`form`,label:`Newsletter`}},v={render:()=>n`
    <ds-stack gap="4">
      <ds-landmark role="banner">
        <ds-text weight="semibold">Acme Console</ds-text>
      </ds-landmark>
      <ds-landmark role="navigation" aria-label="Main">
        <ds-stack element="ul" direction="horizontal" gap="4">
          <ds-link href="#overview" label="Overview"></ds-link>
          <ds-link href="#settings" label="Settings"></ds-link>
        </ds-stack>
      </ds-landmark>
      <ds-landmark role="main">
        <ds-heading level="1">Overview</ds-heading>
        <ds-text>Main content of the page.</ds-text>
      </ds-landmark>
      <ds-landmark role="complementary" aria-label="Tips">
        <ds-text tone="muted">Press ? for keyboard shortcuts.</ds-text>
      </ds-landmark>
      <ds-landmark role="contentinfo">
        <ds-text size="sm" tone="muted">© Acme</ds-text>
      </ds-landmark>
    </ds-stack>
  `},y=[`Default`,`RoleBanner`,`RoleNavigation`,`RoleMain`,`RoleComplementary`,`RoleContentinfo`,`RoleRegion`,`RoleSearch`,`RoleForm`,`PageStructure`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'banner',
    label: undefined
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'navigation',
    label: 'Main'
  },
  render: args => html\`
    <ds-landmark role=\${args.role} .label=\${args.label}>
      <ds-stack element="ul" direction="horizontal" gap="4">
        <ds-link href="#docs" label="Docs"></ds-link>
        <ds-link href="#pricing" label="Pricing"></ds-link>
        <ds-link href="#changelog" label="Changelog"></ds-link>
      </ds-stack>
    </ds-landmark>
  \`
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'main',
    label: undefined
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'complementary',
    label: 'Related'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'contentinfo',
    label: undefined
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'region',
    label: 'Related articles'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'search',
    label: undefined
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'form',
    label: 'Newsletter'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-stack gap="4">
      <ds-landmark role="banner">
        <ds-text weight="semibold">Acme Console</ds-text>
      </ds-landmark>
      <ds-landmark role="navigation" aria-label="Main">
        <ds-stack element="ul" direction="horizontal" gap="4">
          <ds-link href="#overview" label="Overview"></ds-link>
          <ds-link href="#settings" label="Settings"></ds-link>
        </ds-stack>
      </ds-landmark>
      <ds-landmark role="main">
        <ds-heading level="1">Overview</ds-heading>
        <ds-text>Main content of the page.</ds-text>
      </ds-landmark>
      <ds-landmark role="complementary" aria-label="Tips">
        <ds-text tone="muted">Press ? for keyboard shortcuts.</ds-text>
      </ds-landmark>
      <ds-landmark role="contentinfo">
        <ds-text size="sm" tone="muted">© Acme</ds-text>
      </ds-landmark>
    </ds-stack>
  \`
}`,...v.parameters?.docs?.source}}}})))()}b();export{l as Default,v as PageStructure,u as RoleBanner,p as RoleComplementary,m as RoleContentinfo,_ as RoleForm,f as RoleMain,d as RoleNavigation,h as RoleRegion,g as RoleSearch,y as __namedExportsOrder,c as default};