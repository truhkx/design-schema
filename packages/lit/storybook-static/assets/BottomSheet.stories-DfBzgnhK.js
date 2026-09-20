import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-BrJPDVza.js";import{t as i}from"./Button-CG4k9eqY.js";import{t as a}from"./Input-BhbKtdVo.js";import{t as o}from"./Link-EdDzPEMK.js";import{t as s}from"./Stack-CZci_zJ9.js";import{t as c}from"./Checkbox-DkY-7lZq.js";import{y as l}from"./iframe-B0T1LYjz.js";function u(e){let t=e.currentTarget.closest(`ds-bottom-sheet`);t&&(t.open=!1)}function d(e){let t=e.currentTarget.nextElementSibling;t&&(t.open=!0)}function f(e,t,r){return n`
    <ds-button label="Open sheet" @press=${d}></ds-button>
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading??!1}
      height=${e.height??`content`}
      ?no-dismiss=${e.dismissible===!1}
      ?no-drag-to-dismiss=${e.dragToDismiss===!1}
      @close=${u}
    >
      ${t} ${r??``}
    </ds-bottom-sheet>
  `}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{t(),l(),i(),c(),a(),o(),s(),r(),p=n`
  <ds-stack gap="normal">
    <ds-input label="Keyword" name="keyword"></ds-input>
    <ds-checkbox label="Open now" name="openNow"></ds-checkbox>
    <ds-checkbox label="Free parking" name="parking"></ds-checkbox>
  </ds-stack>
`,m=n`
  <ds-button slot="footer" variant="primary" label="Apply" @press=${u}></ds-button>
  <ds-button slot="footer" variant="secondary" label="Clear" @press=${u}></ds-button>
`,h={title:`BottomSheet/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`close`,`drag-dismiss`]}},argTypes:{height:{control:`select`,options:[`content`,`half`,`full`]}},args:{open:!0,heading:`Filters`,hideHeading:!1,height:`content`,dismissible:!0,dragToDismiss:!0},render:e=>f(e,p,m)},g={},_={args:{height:`content`}},v={args:{height:`half`}},y={args:{height:`full`}},b={args:{hideHeading:!0}},x={args:{dismissible:!1}},S={args:{dragToDismiss:!1}},C={args:{heading:`Details`},render:e=>f(e,n`<ds-text>Open daily from eight until late. Street parking nearby.</ds-text>`,void 0)},w={args:{open:!0,heading:`Filters`,children:`A Form of filter controls`,footer:`Clear and Apply Buttons`},render:e=>f(e,p,m)},T={args:{open:!0,heading:`Nearby places`,children:`A scrolling list of results`,height:`half`},render:e=>f(e,n`
        <ds-stack gap="normal">
          ${[`Harbor Coffee`,`Lindon Books`,`Market Hall`,`North Park`,`Riverside Deli`,`The Glasshouse`,`Union Station`,`West End Library`].map(e=>n`<ds-link href="#" label=${e}></ds-link>`)}
        </ds-stack>
      `,void 0)},E={args:{open:!0,heading:`Share to`,children:`A row of share targets`,hideHeading:!0},render:e=>f(e,n`
        <ds-stack direction="horizontal" gap="normal">
          <ds-button variant="secondary" label="Email" @press=${u}></ds-button>
          <ds-button variant="secondary" label="Messages" @press=${u}></ds-button>
          <ds-button variant="secondary" label="Copy link" @press=${u}></ds-button>
        </ds-stack>
      `,void 0)},D={args:{open:!0,heading:`New expense`,children:`A Form of a few fields`,footer:`Cancel and Save Buttons`,height:`full`,dragToDismiss:!1},render:e=>f(e,n`
        <ds-stack gap="normal">
          <ds-input label="Merchant" name="merchant"></ds-input>
          <ds-input label="Amount" name="amount" type="number"></ds-input>
          <ds-input label="Date" name="date" type="date"></ds-input>
        </ds-stack>
      `,n`
        <ds-button slot="footer" variant="primary" label="Save" @press=${u}></ds-button>
        <ds-button slot="footer" variant="secondary" label="Cancel" @press=${u}></ds-button>
      `)},O={render:e=>f(e,p,m)},k=[`Default`,`HeightContent`,`HeightHalf`,`HeightFull`,`HideHeading`,`NotDismissible`,`DragToDismissOff`,`NoFooter`,`Filters`,`HalfHeightResults`,`ShareSheet`,`FullScreenTask`,`Keyboard`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'content'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'half'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'full'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    dragToDismiss: false
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Details'
  },
  render: args => renderSheet(args, html\`<ds-text>Open daily from eight until late. Street parking nearby.</ds-text>\`, undefined)
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Filters',
    children: 'A Form of filter controls',
    footer: 'Clear and Apply Buttons'
  },
  render: args => renderSheet(args, filtersBody, filtersFooter)
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Nearby places',
    children: 'A scrolling list of results',
    height: 'half'
  },
  render: args => renderSheet(args, html\`
        <ds-stack gap="normal">
          \${['Harbor Coffee', 'Lindon Books', 'Market Hall', 'North Park', 'Riverside Deli', 'The Glasshouse', 'Union Station', 'West End Library'].map(place => html\`<ds-link href="#" label=\${place}></ds-link>\`)}
        </ds-stack>
      \`, undefined)
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Share to',
    children: 'A row of share targets',
    hideHeading: true
  },
  render: args => renderSheet(args, html\`
        <ds-stack direction="horizontal" gap="normal">
          <ds-button variant="secondary" label="Email" @press=\${closeSheet}></ds-button>
          <ds-button variant="secondary" label="Messages" @press=\${closeSheet}></ds-button>
          <ds-button variant="secondary" label="Copy link" @press=\${closeSheet}></ds-button>
        </ds-stack>
      \`, undefined)
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'New expense',
    children: 'A Form of a few fields',
    footer: 'Cancel and Save Buttons',
    height: 'full',
    dragToDismiss: false
  },
  render: args => renderSheet(args, html\`
        <ds-stack gap="normal">
          <ds-input label="Merchant" name="merchant"></ds-input>
          <ds-input label="Amount" name="amount" type="number"></ds-input>
          <ds-input label="Date" name="date" type="date"></ds-input>
        </ds-stack>
      \`, html\`
        <ds-button slot="footer" variant="primary" label="Save" @press=\${closeSheet}></ds-button>
        <ds-button slot="footer" variant="secondary" label="Cancel" @press=\${closeSheet}></ds-button>
      \`)
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => renderSheet(args, filtersBody, filtersFooter)
}`,...O.parameters?.docs?.source},description:{story:`Open with its trigger and at least three focusable children (the close button, the body's\r
controls and two footer buttons), so the keyboard gate can check Escape and Tab / Shift+Tab wrapping.`,...O.parameters?.docs?.description}}}})))()}A();export{g as Default,S as DragToDismissOff,w as Filters,D as FullScreenTask,T as HalfHeightResults,_ as HeightContent,y as HeightFull,v as HeightHalf,b as HideHeading,O as Keyboard,C as NoFooter,x as NotDismissible,E as ShareSheet,k as __namedExportsOrder,h as default};