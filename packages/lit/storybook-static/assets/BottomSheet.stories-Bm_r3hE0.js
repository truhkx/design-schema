import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-BrJPDVza.js";import{t as i}from"./Button-DJvb7DFH.js";import{t as a}from"./Input-DW6UoXDO.js";import{t as o}from"./Link-EdDzPEMK.js";import{t as s}from"./Stack-CZci_zJ9.js";import{t as c}from"./Checkbox-3bTNXSrN.js";import{y as l}from"./iframe-Dy0IL05G.js";function u(e){let t=e.currentTarget.closest(`ds-bottom-sheet`);t&&(e.detail?.reason!==`escape`||t.dismissible)&&(t.open=!1)}function d(e){let t=e.currentTarget.nextElementSibling;t&&(t.open=!0)}var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),l(),i(),c(),a(),o(),s(),r(),f=n`
  <ds-stack gap="normal">
    <ds-text size="sm">Show items updated in the last:</ds-text>
    <ds-input label="Days" name="days" default-value="30"></ds-input>
    <ds-checkbox label="Open now" name="openNow"></ds-checkbox>
  </ds-stack>
`,p={title:`BottomSheet/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`close`,`drag-dismiss`]}},argTypes:{height:{control:`select`,options:[`content`,`half`,`full`]}},args:{open:!0,heading:`Filters`,hideHeading:!1,height:`content`,dismissible:!0,dragToDismiss:!0},render:e=>n`
    <ds-button label=${e.heading} @press=${d}></ds-button>
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading??!1}
      height=${e.height??`content`}
      ?no-dismiss=${e.dismissible===!1}
      ?no-drag-to-dismiss=${e.dragToDismiss===!1}
      @close=${u}
    >
      ${f}
      <ds-button slot="footer" variant="secondary" label="Clear" @press=${u}></ds-button>
      <ds-button slot="footer" variant="primary" label="Apply" @press=${u}></ds-button>
    </ds-bottom-sheet>
  `},m={},h={args:{height:`content`}},g={args:{height:`half`}},_={args:{height:`full`}},v={args:{hideHeading:!0}},y={args:{dismissible:!1},render:e=>n`
    <ds-button label=${e.heading} @press=${d}></ds-button>
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading??!1}
      height=${e.height??`content`}
      ?no-dismiss=${e.dismissible===!1}
      ?no-drag-to-dismiss=${e.dragToDismiss===!1}
      @close=${u}
    >
      <ds-text>Only the footer actions close this sheet; Escape still reports.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Done" @press=${u}></ds-button>
    </ds-bottom-sheet>
  `},b={args:{dragToDismiss:!1}},x={args:{hideHeading:!0,dismissible:!1},render:e=>n`
    <ds-button label=${e.heading} @press=${d}></ds-button>
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading??!1}
      height=${e.height??`content`}
      ?no-dismiss=${e.dismissible===!1}
      ?no-drag-to-dismiss=${e.dragToDismiss===!1}
      @close=${u}
    >
      ${f}
      <ds-button slot="footer" variant="primary" size="sm" label="Done" @press=${u}></ds-button>
    </ds-bottom-sheet>
  `},S={args:{open:!0,heading:`Filters`,children:`A Form of filter controls`,footer:`Clear and Apply Buttons`},render:e=>n`
    <ds-button label=${e.heading} @press=${d}></ds-button>
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading??!1}
      height=${e.height??`content`}
      ?no-dismiss=${e.dismissible===!1}
      ?no-drag-to-dismiss=${e.dragToDismiss===!1}
      @close=${u}
    >
      <ds-stack gap="normal">
        <ds-input label="Keyword" name="keyword"></ds-input>
        <ds-checkbox label="Open now" name="openNow"></ds-checkbox>
        <ds-checkbox label="Free parking" name="parking"></ds-checkbox>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Clear" @press=${u}></ds-button>
      <ds-button slot="footer" variant="primary" label="Apply" @press=${u}></ds-button>
    </ds-bottom-sheet>
  `},C={args:{open:!0,heading:`Nearby places`,children:`A scrolling list of results`,height:`half`},render:e=>n`
    <ds-button label=${e.heading} @press=${d}></ds-button>
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading??!1}
      height=${e.height??`content`}
      ?no-dismiss=${e.dismissible===!1}
      ?no-drag-to-dismiss=${e.dragToDismiss===!1}
      @close=${u}
    >
      <ds-stack gap="normal">
        <ds-link href="#harbor" label="Harbor Coffee"></ds-link>
        <ds-link href="#lindon" label="Lindon Books"></ds-link>
        <ds-link href="#market" label="Market Hall"></ds-link>
        <ds-link href="#north" label="North Park"></ds-link>
        <ds-link href="#riverside" label="Riverside Deli"></ds-link>
        <ds-link href="#glasshouse" label="The Glasshouse"></ds-link>
        <ds-link href="#union" label="Union Station"></ds-link>
        <ds-link href="#west-end" label="West End Library"></ds-link>
      </ds-stack>
    </ds-bottom-sheet>
  `},w={args:{open:!0,heading:`Share to`,children:`A row of share targets`,hideHeading:!0},render:e=>n`
    <ds-button label=${e.heading} @press=${d}></ds-button>
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading??!1}
      height=${e.height??`content`}
      ?no-dismiss=${e.dismissible===!1}
      ?no-drag-to-dismiss=${e.dragToDismiss===!1}
      @close=${u}
    >
      <ds-stack direction="horizontal" gap="normal">
        <ds-button variant="secondary" label="Email" @press=${u}></ds-button>
        <ds-button variant="secondary" label="Messages" @press=${u}></ds-button>
        <ds-button variant="secondary" label="Copy link" @press=${u}></ds-button>
      </ds-stack>
    </ds-bottom-sheet>
  `},T={args:{open:!0,heading:`New expense`,children:`A Form of a few fields`,footer:`Cancel and Save Buttons`,height:`full`,dragToDismiss:!1},render:e=>n`
    <ds-button label=${e.heading} @press=${d}></ds-button>
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading??!1}
      height=${e.height??`content`}
      ?no-dismiss=${e.dismissible===!1}
      ?no-drag-to-dismiss=${e.dragToDismiss===!1}
      @close=${u}
    >
      <ds-stack gap="normal">
        <ds-input label="Merchant" name="merchant"></ds-input>
        <ds-input label="Amount" name="amount" type="number"></ds-input>
        <ds-input label="Date" name="date" type="date"></ds-input>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=${u}></ds-button>
      <ds-button slot="footer" variant="primary" label="Save" @press=${u}></ds-button>
    </ds-bottom-sheet>
  `},E={args:{open:!0},render:e=>n`
    <ds-button label=${e.heading} @press=${d}></ds-button>
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading??!1}
      height=${e.height??`content`}
      ?no-dismiss=${e.dismissible===!1}
      ?no-drag-to-dismiss=${e.dragToDismiss===!1}
      @close=${u}
    >
      <ds-stack gap="normal">
        <ds-input label="Search term" name="search" default-value="roadmap"></ds-input>
        <ds-input label="Owner" name="owner" default-value="Anyone"></ds-input>
        <ds-input label="Days" name="days" default-value="30"></ds-input>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Clear" @press=${u}></ds-button>
      <ds-button slot="footer" variant="primary" label="Apply" @press=${u}></ds-button>
    </ds-bottom-sheet>
  `},D=[`Default`,`HeightContent`,`HeightHalf`,`HeightFull`,`HideHeading`,`NotDismissible`,`DragToDismissOff`,`HiddenHeadingNotDismissible`,`Filters`,`HalfHeightResults`,`ShareSheet`,`FullScreenTask`,`Keyboard`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'content'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'half'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'full'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading ?? false}
      height=\${args.height ?? 'content'}
      ?no-dismiss=\${args.dismissible === false}
      ?no-drag-to-dismiss=\${args.dragToDismiss === false}
      @close=\${closeSheet}
    >
      <ds-text>Only the footer actions close this sheet; Escape still reports.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Done" @press=\${closeSheet}></ds-button>
    </ds-bottom-sheet>
  \`
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    dragToDismiss: false
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true,
    dismissible: false
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading ?? false}
      height=\${args.height ?? 'content'}
      ?no-dismiss=\${args.dismissible === false}
      ?no-drag-to-dismiss=\${args.dragToDismiss === false}
      @close=\${closeSheet}
    >
      \${filterControls}
      <ds-button slot="footer" variant="primary" size="sm" label="Done" @press=\${closeSheet}></ds-button>
    </ds-bottom-sheet>
  \`
}`,...x.parameters?.docs?.source},description:{story:`Nothing left for the header to hold — no visible heading, no handle, no close button — so it is not rendered.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Filters',
    children: 'A Form of filter controls',
    footer: 'Clear and Apply Buttons'
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading ?? false}
      height=\${args.height ?? 'content'}
      ?no-dismiss=\${args.dismissible === false}
      ?no-drag-to-dismiss=\${args.dragToDismiss === false}
      @close=\${closeSheet}
    >
      <ds-stack gap="normal">
        <ds-input label="Keyword" name="keyword"></ds-input>
        <ds-checkbox label="Open now" name="openNow"></ds-checkbox>
        <ds-checkbox label="Free parking" name="parking"></ds-checkbox>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Clear" @press=\${closeSheet}></ds-button>
      <ds-button slot="footer" variant="primary" label="Apply" @press=\${closeSheet}></ds-button>
    </ds-bottom-sheet>
  \`
}`,...S.parameters?.docs?.source},description:{story:`The phone presentation of a filter panel, with the action row pinned at the bottom.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Nearby places',
    children: 'A scrolling list of results',
    height: 'half'
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading ?? false}
      height=\${args.height ?? 'content'}
      ?no-dismiss=\${args.dismissible === false}
      ?no-drag-to-dismiss=\${args.dragToDismiss === false}
      @close=\${closeSheet}
    >
      <ds-stack gap="normal">
        <ds-link href="#harbor" label="Harbor Coffee"></ds-link>
        <ds-link href="#lindon" label="Lindon Books"></ds-link>
        <ds-link href="#market" label="Market Hall"></ds-link>
        <ds-link href="#north" label="North Park"></ds-link>
        <ds-link href="#riverside" label="Riverside Deli"></ds-link>
        <ds-link href="#glasshouse" label="The Glasshouse"></ds-link>
        <ds-link href="#union" label="Union Station"></ds-link>
        <ds-link href="#west-end" label="West End Library"></ds-link>
      </ds-stack>
    </ds-bottom-sheet>
  \`
}`,...C.parameters?.docs?.source},description:{story:`A browsable list where seeing the page behind matters, so the sheet stops at half height.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Share to',
    children: 'A row of share targets',
    hideHeading: true
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading ?? false}
      height=\${args.height ?? 'content'}
      ?no-dismiss=\${args.dismissible === false}
      ?no-drag-to-dismiss=\${args.dragToDismiss === false}
      @close=\${closeSheet}
    >
      <ds-stack direction="horizontal" gap="normal">
        <ds-button variant="secondary" label="Email" @press=\${closeSheet}></ds-button>
        <ds-button variant="secondary" label="Messages" @press=\${closeSheet}></ds-button>
        <ds-button variant="secondary" label="Copy link" @press=\${closeSheet}></ds-button>
      </ds-stack>
    </ds-bottom-sheet>
  \`
}`,...w.parameters?.docs?.source},description:{story:`A self-explanatory body whose title exists only for assistive technology.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'New expense',
    children: 'A Form of a few fields',
    footer: 'Cancel and Save Buttons',
    height: 'full',
    dragToDismiss: false
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading ?? false}
      height=\${args.height ?? 'content'}
      ?no-dismiss=\${args.dismissible === false}
      ?no-drag-to-dismiss=\${args.dragToDismiss === false}
      @close=\${closeSheet}
    >
      <ds-stack gap="normal">
        <ds-input label="Merchant" name="merchant"></ds-input>
        <ds-input label="Amount" name="amount" type="number"></ds-input>
        <ds-input label="Date" name="date" type="date"></ds-input>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=\${closeSheet}></ds-button>
      <ds-button slot="footer" variant="primary" label="Save" @press=\${closeSheet}></ds-button>
    </ds-bottom-sheet>
  \`
}`,...T.parameters?.docs?.source},description:{story:`A task that needs the whole screen but should still feel dismissable, with the gesture off.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  render: args => html\`
    <ds-button label=\${args.heading} @press=\${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading ?? false}
      height=\${args.height ?? 'content'}
      ?no-dismiss=\${args.dismissible === false}
      ?no-drag-to-dismiss=\${args.dragToDismiss === false}
      @close=\${closeSheet}
    >
      <ds-stack gap="normal">
        <ds-input label="Search term" name="search" default-value="roadmap"></ds-input>
        <ds-input label="Owner" name="owner" default-value="Anyone"></ds-input>
        <ds-input label="Days" name="days" default-value="30"></ds-input>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Clear" @press=\${closeSheet}></ds-button>
      <ds-button slot="footer" variant="primary" label="Apply" @press=\${closeSheet}></ds-button>
    </ds-bottom-sheet>
  \`
}`,...E.parameters?.docs?.source},description:{story:`Open with its trigger and more than three focusable children (three body controls, the close\r
button and two footer actions), so the keyboard gate can check Escape and Tab / Shift+Tab wrapping.`,...E.parameters?.docs?.description}}}})))()}O();export{m as Default,b as DragToDismissOff,S as Filters,T as FullScreenTask,C as HalfHeightResults,h as HeightContent,_ as HeightFull,g as HeightHalf,x as HiddenHeadingNotDismissible,v as HideHeading,E as Keyboard,y as NotDismissible,w as ShareSheet,D as __namedExportsOrder,p as default};