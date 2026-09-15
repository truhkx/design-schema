import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Button-TSn-G4Vm.js";import{t as i}from"./Text-Dgpz9DWN.js";import{t as a}from"./Input-BGhC2i8R.js";import{t as o}from"./Link-CFGwxdql.js";import{_ as s}from"./iframe-CsoUKhN4.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),s(),r(),o(),a(),i(),c={title:`SidePanel/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`open-change`]}},argTypes:{side:{control:`select`,options:[`start`,`end`]},width:{control:`select`,options:[`narrow`,`default`,`wide`]},persistent:{control:`select`,options:[`never`,`content`,`page`]},landmark:{control:`select`,options:[`complementary`,`navigation`]}},args:{open:!0,heading:`Menu`,hideHeading:!1,side:`start`,width:`default`,persistent:`never`,landmark:`complementary`,modal:!1,scrim:!0,dismissible:!0,swipeable:!0},render:e=>n`
    <ds-side-panel
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading}
      side=${e.side}
      width=${e.width}
      persistent=${e.persistent}
      landmark=${e.landmark}
      ?modal=${e.modal}
      .scrim=${e.scrim}
      .dismissible=${e.dismissible}
      .swipeable=${e.swipeable}
    >
      <ds-button slot="trigger" label="Open menu"></ds-button>
      <ds-link href="#home" aria-current="page">Home</ds-link>
      <ds-link href="#account">Account</ds-link>
      <ds-link href="#settings">Settings</ds-link>
    </ds-side-panel>
  `},l={},u={args:{side:`start`}},d={args:{side:`end`}},f={args:{width:`narrow`}},p={args:{width:`default`}},m={args:{width:`wide`}},h={args:{persistent:`never`}},g={args:{persistent:`content`}},_={args:{persistent:`page`}},v={args:{hideHeading:!0}},y={args:{landmark:`complementary`}},b={args:{landmark:`navigation`}},x={args:{modal:!0,heading:`Your cart`},render:e=>n`
    <ds-side-panel
      ?open=${e.open}
      heading=${e.heading}
      side="end"
      ?modal=${e.modal}
      .dismissible=${e.dismissible}
    >
      <ds-button slot="trigger" label="Open cart"></ds-button>
      <ds-text>Your cart is empty.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Checkout"></ds-button>
    </ds-side-panel>
  `},S={args:{scrim:!1}},C={args:{dismissible:!1,modal:!0,heading:`Required filters`},render:e=>n`
    <ds-side-panel
      ?open=${e.open}
      heading=${e.heading}
      ?modal=${e.modal}
      .dismissible=${e.dismissible}
    >
      <ds-button slot="trigger" label="Open filters"></ds-button>
      <ds-text>Choose at least one filter to continue.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Apply"></ds-button>
    </ds-side-panel>
  `},w={args:{swipeable:!1}},T={render:e=>n`
    <ds-side-panel ?open=${e.open} heading=${e.heading}>
      <ds-button slot="trigger" label="Open menu"></ds-button>
      <ds-link href="#home" aria-current="page">Home</ds-link>
      <ds-link href="#account">Account</ds-link>
    </ds-side-panel>
  `},E={render:()=>n`
    <ds-side-panel open heading="Menu">
      <ds-button slot="trigger" label="Open menu"></ds-button>
      <ds-link href="#home" aria-current="page">Home</ds-link>
      <ds-link href="#account">Account</ds-link>
      <ds-input label="Search" name="search" value=""></ds-input>
    </ds-side-panel>
  `},D=[`Default`,`SideStart`,`SideEnd`,`WidthNarrow`,`WidthDefault`,`WidthWide`,`PersistentNever`,`PersistentContent`,`PersistentPage`,`HideHeading`,`RoleComplementary`,`RoleNavigation`,`Modal`,`ScrimFalse`,`DismissibleFalse`,`SwipeableFalse`,`NoFooter`,`Keyboard`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'start'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'end'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'narrow'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'default'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'wide'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'never'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'content'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'page'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    landmark: 'complementary'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    landmark: 'navigation'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    modal: true,
    heading: 'Your cart'
  },
  render: args => html\`
    <ds-side-panel
      ?open=\${args.open}
      heading=\${args.heading}
      side="end"
      ?modal=\${args.modal}
      .dismissible=\${args.dismissible}
    >
      <ds-button slot="trigger" label="Open cart"></ds-button>
      <ds-text>Your cart is empty.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Checkout"></ds-button>
    </ds-side-panel>
  \`
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    scrim: false
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false,
    modal: true,
    heading: 'Required filters'
  },
  render: args => html\`
    <ds-side-panel
      ?open=\${args.open}
      heading=\${args.heading}
      ?modal=\${args.modal}
      .dismissible=\${args.dismissible}
    >
      <ds-button slot="trigger" label="Open filters"></ds-button>
      <ds-text>Choose at least one filter to continue.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Apply"></ds-button>
    </ds-side-panel>
  \`
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    swipeable: false
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-side-panel ?open=\${args.open} heading=\${args.heading}>
      <ds-button slot="trigger" label="Open menu"></ds-button>
      <ds-link href="#home" aria-current="page">Home</ds-link>
      <ds-link href="#account">Account</ds-link>
    </ds-side-panel>
  \`
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-side-panel open heading="Menu">
      <ds-button slot="trigger" label="Open menu"></ds-button>
      <ds-link href="#home" aria-current="page">Home</ds-link>
      <ds-link href="#account">Account</ds-link>
      <ds-input label="Search" name="search" value=""></ds-input>
    </ds-side-panel>
  \`
}`,...E.parameters?.docs?.source},description:{story:`Renders open with its trigger and at least three focusable children so the\r
keyboard gate can verify Tab flowing trigger → panel → page, Shift+Tab\r
returning to the trigger, and Escape.`,...E.parameters?.docs?.description}}}})))()}O();export{l as Default,C as DismissibleFalse,v as HideHeading,E as Keyboard,x as Modal,T as NoFooter,g as PersistentContent,h as PersistentNever,_ as PersistentPage,y as RoleComplementary,b as RoleNavigation,S as ScrimFalse,d as SideEnd,u as SideStart,w as SwipeableFalse,p as WidthDefault,f as WidthNarrow,m as WidthWide,D as __namedExportsOrder,c as default};