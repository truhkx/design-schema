import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Icon-BHsrajXm.js";import{t as i}from"./Text-BrJPDVza.js";import{t as a}from"./Button-CG4k9eqY.js";import{t as o}from"./Input-BhbKtdVo.js";import{t as s}from"./Link-EdDzPEMK.js";import{t as c}from"./Stack-CZci_zJ9.js";import{t as l}from"./Checkbox-DkY-7lZq.js";import{t as u}from"./Card-GrjfSIWe.js";import{_ as d}from"./iframe-B0T1LYjz.js";function f(e){e.currentTarget.open=e.detail.open}function p(e,t,r,i){return n`
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
      ${t} ${r} ${i??``}
    </ds-side-panel>
  `}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z;function B(){return(B=e((()=>{t(),d(),a(),r(),s(),o(),l(),u(),c(),i(),m=n`
  <ds-button slot="trigger" variant="ghost" icon-only label="Menu">
    <ds-icon slot="leading-icon" name="menu"></ds-icon>
  </ds-button>
`,h=n`
  <ds-stack gap="tight">
    <ds-link href="#home" label="Home"></ds-link>
    <ds-link href="#orders" label="Orders"></ds-link>
    <ds-link href="#settings" label="Settings"></ds-link>
  </ds-stack>
`,g={title:`SidePanel/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`open-change`]}},argTypes:{side:{control:`select`,options:[`start`,`end`]},width:{control:`select`,options:[`narrow`,`default`,`wide`]},persistent:{control:`select`,options:[`never`,`content`,`page`]},landmark:{control:`select`,options:[`complementary`,`navigation`]}},args:{open:!0,heading:`Menu`,hideHeading:!1,side:`start`,width:`default`,persistent:`never`,landmark:`complementary`,modal:!1,scrim:!0,dismissible:!0,swipeable:!0},render:e=>p(e,m,h)},_={},v={args:{side:`start`}},y={args:{side:`end`}},b={args:{width:`narrow`}},x={args:{width:`default`}},S={args:{width:`wide`}},C={args:{persistent:`never`}},w={args:{persistent:`content`}},T={args:{persistent:`page`}},E={args:{landmark:`complementary`}},D={args:{landmark:`navigation`}},O={args:{open:!1}},k={args:{hideHeading:!0}},A={args:{modal:!0}},j={args:{scrim:!1}},M={args:{dismissible:!1}},N={args:{swipeable:!1}},P={args:{open:!1,heading:`Menu`,hideHeading:!0,landmark:`navigation`,persistent:`content`}},F={args:{open:!1,heading:`Filters`,width:`wide`},render:e=>p(e,n`<ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>`,n`
        <ds-stack gap="normal">
          <ds-checkbox label="In stock" name="inStock"></ds-checkbox>
          <ds-checkbox label="On sale" name="onSale"></ds-checkbox>
          <ds-checkbox label="Free shipping" name="freeShipping"></ds-checkbox>
        </ds-stack>
      `,n`
        <ds-button slot="footer" variant="secondary" label="Clear"></ds-button>
        <ds-button slot="footer" variant="primary" label="Apply"></ds-button>
      `)},I={args:{open:!0,heading:`Your cart`,side:`end`,modal:!0},render:e=>p(e,n``,n`
        <ds-stack gap="normal">
          <ds-card inset="md"><ds-text>Notebook × 2</ds-text></ds-card>
          <ds-card inset="md"><ds-text>Pen × 1</ds-text></ds-card>
        </ds-stack>
      `,n`<ds-button slot="footer" variant="primary" label="Checkout"></ds-button>`)},L={args:{open:!0,heading:`Order details`,side:`end`,width:`narrow`,scrim:!1},render:e=>p(e,n``,n`
        <ds-stack gap="tight">
          <ds-text tone="muted">Order</ds-text>
          <ds-text>No. 1042</ds-text>
          <ds-text tone="muted">Status</ds-text>
          <ds-text>Shipped</ds-text>
        </ds-stack>
      `)},R={render:e=>p(e,m,n`
        <ds-stack gap="tight">
          <ds-link href="#home" label="Home"></ds-link>
          <ds-link href="#orders" label="Orders"></ds-link>
          <ds-input label="Search" name="search"></ds-input>
        </ds-stack>
      `)},z=[`Default`,`SideStart`,`SideEnd`,`WidthNarrow`,`WidthDefault`,`WidthWide`,`PersistentNever`,`PersistentContent`,`PersistentPage`,`RoleComplementary`,`RoleNavigation`,`Closed`,`HideHeading`,`Modal`,`ScrimFalse`,`DismissibleFalse`,`SwipeableFalse`,`NavigationDrawer`,`Filters`,`Cart`,`DetailPanel`,`Keyboard`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'start'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'end'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'narrow'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'default'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'wide'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'never'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'content'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'page'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    landmark: 'complementary'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    landmark: 'navigation'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    modal: true
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    scrim: false
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    swipeable: false
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    open: false,
    heading: 'Menu',
    hideHeading: true,
    landmark: 'navigation',
    persistent: 'content'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    open: false,
    heading: 'Filters',
    width: 'wide'
  },
  render: args => panel(args, html\`<ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>\`, html\`
        <ds-stack gap="normal">
          <ds-checkbox label="In stock" name="inStock"></ds-checkbox>
          <ds-checkbox label="On sale" name="onSale"></ds-checkbox>
          <ds-checkbox label="Free shipping" name="freeShipping"></ds-checkbox>
        </ds-stack>
      \`, html\`
        <ds-button slot="footer" variant="secondary" label="Clear"></ds-button>
        <ds-button slot="footer" variant="primary" label="Apply"></ds-button>
      \`)
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Your cart',
    side: 'end',
    modal: true
  },
  render: args => panel(args, html\`\`, html\`
        <ds-stack gap="normal">
          <ds-card inset="md"><ds-text>Notebook × 2</ds-text></ds-card>
          <ds-card inset="md"><ds-text>Pen × 1</ds-text></ds-card>
        </ds-stack>
      \`, html\`<ds-button slot="footer" variant="primary" label="Checkout"></ds-button>\`)
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Order details',
    side: 'end',
    width: 'narrow',
    scrim: false
  },
  render: args => panel(args, html\`\`, html\`
        <ds-stack gap="tight">
          <ds-text tone="muted">Order</ds-text>
          <ds-text>No. 1042</ds-text>
          <ds-text tone="muted">Status</ds-text>
          <ds-text>Shipped</ds-text>
        </ds-stack>
      \`)
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: args => panel(args, menuTrigger, html\`
        <ds-stack gap="tight">
          <ds-link href="#home" label="Home"></ds-link>
          <ds-link href="#orders" label="Orders"></ds-link>
          <ds-input label="Search" name="search"></ds-input>
        </ds-stack>
      \`)
}`,...R.parameters?.docs?.source},description:{story:`Open with its trigger and three focusable children, for the keyboard gate.`,...R.parameters?.docs?.description}}}})))()}B();export{I as Cart,O as Closed,_ as Default,L as DetailPanel,M as DismissibleFalse,F as Filters,k as HideHeading,R as Keyboard,A as Modal,P as NavigationDrawer,w as PersistentContent,C as PersistentNever,T as PersistentPage,E as RoleComplementary,D as RoleNavigation,j as ScrimFalse,y as SideEnd,v as SideStart,N as SwipeableFalse,x as WidthDefault,b as WidthNarrow,S as WidthWide,z as __namedExportsOrder,g as default};