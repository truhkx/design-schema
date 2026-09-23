import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Icon-BHsrajXm.js";import{t as i}from"./Text-BrJPDVza.js";import{t as a}from"./Button-DJvb7DFH.js";import{t as o}from"./Input-DW6UoXDO.js";import{t as s}from"./Link-EdDzPEMK.js";import{t as c}from"./Stack-CZci_zJ9.js";import{t as l}from"./Checkbox-3bTNXSrN.js";import{t as u}from"./Card-e_oTv443.js";import{_ as d}from"./iframe-Dy0IL05G.js";function f(e){let t=e.currentTarget;t.open!==void 0&&(t.open=e.detail.open)}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{t(),d(),a(),r(),s(),o(),l(),u(),c(),i(),p={title:`SidePanel/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`open-change`]}},argTypes:{side:{control:`select`,options:[`start`,`end`]},width:{control:`select`,options:[`narrow`,`default`,`wide`]},persistent:{control:`select`,options:[`never`,`content`,`page`]},landmark:{control:`select`,options:[`complementary`,`navigation`]}},args:{heading:`Menu`,hideHeading:!1,side:`start`,width:`default`,persistent:`never`,landmark:`complementary`,modal:!1,scrim:!0,dismissible:!0,swipeable:!0},render:e=>n`
    <ds-side-panel
      .open=${e.open}
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
      @open-change=${f}
    >
      <ds-button slot="trigger" variant="ghost" icon-only label="Menu">
        <ds-icon slot="leading-icon" name="menu"></ds-icon>
      </ds-button>
      <ds-stack gap="tight">
        <ds-link href="#dashboard" label="Dashboard"></ds-link>
        <ds-link href="#projects" label="Projects"></ds-link>
        <ds-link href="#settings" label="Settings"></ds-link>
      </ds-stack>
    </ds-side-panel>
  `},m={},h={args:{side:`start`}},g={args:{side:`end`}},_={args:{width:`narrow`}},v={args:{width:`default`}},y={args:{width:`wide`}},b={args:{persistent:`never`}},x={args:{persistent:`content`}},S={args:{persistent:`page`}},C={args:{landmark:`complementary`}},w={args:{landmark:`navigation`}},T={args:{open:!0}},E={args:{open:!0,modal:!0}},D={args:{open:!0,scrim:!1}},O={args:{open:!0,dismissible:!1}},k={args:{open:!0,hideHeading:!0}},A={args:{open:!0,hideHeading:!0,dismissible:!1}},j={args:{heading:`Menu`,hideHeading:!0,landmark:`navigation`,persistent:`content`},render:e=>n`
    <ds-side-panel
      .open=${e.open}
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
      @open-change=${f}
    >
      <ds-button slot="trigger" variant="ghost" icon-only label="Menu">
        <ds-icon slot="leading-icon" name="menu"></ds-icon>
      </ds-button>
      <ds-stack gap="tight">
        <ds-link href="#dashboard" label="Dashboard"></ds-link>
        <ds-link href="#projects" label="Projects"></ds-link>
        <ds-link href="#settings" label="Settings"></ds-link>
      </ds-stack>
    </ds-side-panel>
  `},M={args:{heading:`Filters`,width:`wide`},render:e=>n`
    <ds-side-panel
      .open=${e.open}
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
      @open-change=${f}
    >
      <ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>
      <ds-stack gap="normal">
        <ds-checkbox name="in-stock" label="In stock"></ds-checkbox>
        <ds-checkbox name="free-shipping" label="Free shipping"></ds-checkbox>
        <ds-checkbox name="on-sale" label="On sale"></ds-checkbox>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Clear"></ds-button>
      <ds-button slot="footer" variant="primary" label="Apply"></ds-button>
    </ds-side-panel>
  `},N={args:{open:!0,heading:`Your cart`,side:`end`,modal:!0},render:e=>n`
    <ds-side-panel
      .open=${e.open}
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
      @open-change=${f}
    >
      <ds-stack gap="normal">
        <ds-card heading="Linen shirt"><ds-text>1 × $48.00</ds-text></ds-card>
        <ds-card heading="Canvas tote"><ds-text>2 × $22.00</ds-text></ds-card>
      </ds-stack>
      <ds-button slot="footer" variant="primary" label="Checkout"></ds-button>
    </ds-side-panel>
  `},P={args:{open:!0,heading:`Order details`,side:`end`,width:`narrow`,scrim:!1},render:e=>n`
    <ds-side-panel
      .open=${e.open}
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
      @open-change=${f}
    >
      <ds-stack gap="tight">
        <ds-text tone="muted">Order</ds-text>
        <ds-text>#10482</ds-text>
        <ds-text tone="muted">Status</ds-text>
        <ds-text>Shipped</ds-text>
      </ds-stack>
    </ds-side-panel>
  `},F={args:{open:!0},render:e=>n`
    <ds-side-panel
      .open=${e.open}
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
      @open-change=${f}
    >
      <ds-button slot="trigger" variant="ghost" icon-only label="Menu">
        <ds-icon slot="leading-icon" name="menu"></ds-icon>
      </ds-button>
      <ds-stack gap="tight">
        <ds-link href="#dashboard" label="Dashboard"></ds-link>
        <ds-link href="#projects" label="Projects"></ds-link>
        <ds-input label="Search" name="search"></ds-input>
      </ds-stack>
    </ds-side-panel>
  `},I=[`Default`,`SideStart`,`SideEnd`,`WidthNarrow`,`WidthDefault`,`WidthWide`,`PersistentNever`,`PersistentContent`,`PersistentPage`,`RoleComplementary`,`RoleNavigation`,`Open`,`Modal`,`NoScrim`,`NotDismissible`,`HiddenHeading`,`HiddenHeadingNotDismissible`,`NavigationDrawer`,`Filters`,`Cart`,`DetailPanel`,`Keyboard`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'start'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'end'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'narrow'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'default'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'wide'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'never'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'content'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'page'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    landmark: 'complementary'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    landmark: 'navigation'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    modal: true
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    scrim: false
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    dismissible: false
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    hideHeading: true
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    hideHeading: true,
    dismissible: false
  }
}`,...A.parameters?.docs?.source},description:{story:`hideHeading with no close button: the header part is not rendered and the hidden title leads the column.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Menu',
    hideHeading: true,
    landmark: 'navigation',
    persistent: 'content'
  },
  render: args => html\`
    <ds-side-panel
      .open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading}
      side=\${args.side}
      width=\${args.width}
      persistent=\${args.persistent}
      landmark=\${args.landmark}
      ?modal=\${args.modal}
      .scrim=\${args.scrim}
      .dismissible=\${args.dismissible}
      .swipeable=\${args.swipeable}
      @open-change=\${followOpenChange}
    >
      <ds-button slot="trigger" variant="ghost" icon-only label="Menu">
        <ds-icon slot="leading-icon" name="menu"></ds-icon>
      </ds-button>
      <ds-stack gap="tight">
        <ds-link href="#dashboard" label="Dashboard"></ds-link>
        <ds-link href="#projects" label="Projects"></ds-link>
        <ds-link href="#settings" label="Settings"></ds-link>
      </ds-stack>
    </ds-side-panel>
  \`
}`,...j.parameters?.docs?.source},description:{story:`The phone hamburger menu that becomes the permanent sidebar on desktop, with a self-explanatory list.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Filters',
    width: 'wide'
  },
  render: args => html\`
    <ds-side-panel
      .open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading}
      side=\${args.side}
      width=\${args.width}
      persistent=\${args.persistent}
      landmark=\${args.landmark}
      ?modal=\${args.modal}
      .scrim=\${args.scrim}
      .dismissible=\${args.dismissible}
      .swipeable=\${args.swipeable}
      @open-change=\${followOpenChange}
    >
      <ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>
      <ds-stack gap="normal">
        <ds-checkbox name="in-stock" label="In stock"></ds-checkbox>
        <ds-checkbox name="free-shipping" label="Free shipping"></ds-checkbox>
        <ds-checkbox name="on-sale" label="On sale"></ds-checkbox>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Clear"></ds-button>
      <ds-button slot="footer" variant="primary" label="Apply"></ds-button>
    </ds-side-panel>
  \`
}`,...M.parameters?.docs?.source},description:{story:`A wide filter panel beside a results page, ending in an action row.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Your cart',
    side: 'end',
    modal: true
  },
  render: args => html\`
    <ds-side-panel
      .open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading}
      side=\${args.side}
      width=\${args.width}
      persistent=\${args.persistent}
      landmark=\${args.landmark}
      ?modal=\${args.modal}
      .scrim=\${args.scrim}
      .dismissible=\${args.dismissible}
      .swipeable=\${args.swipeable}
      @open-change=\${followOpenChange}
    >
      <ds-stack gap="normal">
        <ds-card heading="Linen shirt"><ds-text>1 × $48.00</ds-text></ds-card>
        <ds-card heading="Canvas tote"><ds-text>2 × $22.00</ds-text></ds-card>
      </ds-stack>
      <ds-button slot="footer" variant="primary" label="Checkout"></ds-button>
    </ds-side-panel>
  \`
}`,...N.parameters?.docs?.source},description:{story:`A checkout panel from the end edge that must be finished or dismissed, so it is modal.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Order details',
    side: 'end',
    width: 'narrow',
    scrim: false
  },
  render: args => html\`
    <ds-side-panel
      .open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading}
      side=\${args.side}
      width=\${args.width}
      persistent=\${args.persistent}
      landmark=\${args.landmark}
      ?modal=\${args.modal}
      .scrim=\${args.scrim}
      .dismissible=\${args.dismissible}
      .swipeable=\${args.swipeable}
      @open-change=\${followOpenChange}
    >
      <ds-stack gap="tight">
        <ds-text tone="muted">Order</ds-text>
        <ds-text>#10482</ds-text>
        <ds-text tone="muted">Status</ds-text>
        <ds-text>Shipped</ds-text>
      </ds-stack>
    </ds-side-panel>
  \`
}`,...P.parameters?.docs?.source},description:{story:`A narrow detail panel that should feel like part of the page, so it has no scrim.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  render: args => html\`
    <ds-side-panel
      .open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading}
      side=\${args.side}
      width=\${args.width}
      persistent=\${args.persistent}
      landmark=\${args.landmark}
      ?modal=\${args.modal}
      .scrim=\${args.scrim}
      .dismissible=\${args.dismissible}
      .swipeable=\${args.swipeable}
      @open-change=\${followOpenChange}
    >
      <ds-button slot="trigger" variant="ghost" icon-only label="Menu">
        <ds-icon slot="leading-icon" name="menu"></ds-icon>
      </ds-button>
      <ds-stack gap="tight">
        <ds-link href="#dashboard" label="Dashboard"></ds-link>
        <ds-link href="#projects" label="Projects"></ds-link>
        <ds-input label="Search" name="search"></ds-input>
      </ds-stack>
    </ds-side-panel>
  \`
}`,...F.parameters?.docs?.source},description:{story:`Open with its trigger and three focusable children, for the keyboard gate.`,...F.parameters?.docs?.description}}}})))()}L();export{N as Cart,m as Default,P as DetailPanel,M as Filters,k as HiddenHeading,A as HiddenHeadingNotDismissible,F as Keyboard,E as Modal,j as NavigationDrawer,D as NoScrim,O as NotDismissible,T as Open,x as PersistentContent,b as PersistentNever,S as PersistentPage,C as RoleComplementary,w as RoleNavigation,g as SideEnd,h as SideStart,v as WidthDefault,_ as WidthNarrow,y as WidthWide,I as __namedExportsOrder,p as default};