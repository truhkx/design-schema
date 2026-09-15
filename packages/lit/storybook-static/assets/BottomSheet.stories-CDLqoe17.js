import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Button-TSn-G4Vm.js";import{t as i}from"./Text-Dgpz9DWN.js";import{t as a}from"./Input-BGhC2i8R.js";import{t as o}from"./Link-CFGwxdql.js";import{y as s}from"./iframe-CsoUKhN4.js";var c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{t(),s(),r(),i(),a(),o(),c={title:`BottomSheet/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`close`,`drag-dismiss`]}},argTypes:{height:{control:`select`,options:[`content`,`half`,`full`]}},args:{open:!0,heading:`Filters`,hideHeading:!1,height:`content`,dismissible:!0,dragToDismiss:!0},render:e=>n`
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading}
      height=${e.height}
      ?no-dismiss=${!e.dismissible}
      ?drag-to-dismiss=${e.dragToDismiss}
    >
      <ds-text>Narrow results by price, distance and rating.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Apply filters"></ds-button>
      <ds-button slot="footer" variant="ghost" size="sm" label="Reset"></ds-button>
    </ds-bottom-sheet>
  `},l={},u={args:{height:`content`}},d={args:{height:`half`}},f={args:{height:`full`}},p={args:{hideHeading:!0,heading:`Share`},render:e=>n`
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      ?hide-heading=${e.hideHeading}
      height=${e.height}
      ?no-dismiss=${!e.dismissible}
      ?drag-to-dismiss=${e.dragToDismiss}
    >
      <ds-text>Share this listing with a link.</ds-text>
    </ds-bottom-sheet>
  `},m={args:{dismissible:!1},render:e=>n`
    <ds-bottom-sheet
      ?open=${e.open}
      heading=${e.heading}
      height=${e.height}
      ?no-dismiss=${!e.dismissible}
      ?drag-to-dismiss=${e.dragToDismiss}
    >
      <ds-text>You must choose an option below to continue.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Continue"></ds-button>
    </ds-bottom-sheet>
  `},h={args:{dragToDismiss:!1}},g={render:e=>n`
    <ds-bottom-sheet ?open=${e.open} heading="Details" height=${e.height}>
      <ds-text>Additional information about this item.</ds-text>
    </ds-bottom-sheet>
  `},_={render:()=>n`
    <button type="button" id="bottom-sheet-trigger">Filters</button>
    <ds-bottom-sheet open heading="Filters" height="content">
      <ds-input label="Keyword" name="keyword" value=""></ds-input>
      <ds-link href="#reset">Reset all</ds-link>
      <ds-button slot="footer" variant="primary" size="sm" label="Apply filters"></ds-button>
      <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
    </ds-bottom-sheet>
  `},v=[`Default`,`HeightContent`,`HeightHalf`,`HeightFull`,`HideHeading`,`DismissibleFalse`,`DragToDismissFalse`,`NoFooter`,`Keyboard`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'content'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'half'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'full'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true,
    heading: 'Share'
  },
  render: args => html\`
    <ds-bottom-sheet
      ?open=\${args.open}
      heading=\${args.heading}
      ?hide-heading=\${args.hideHeading}
      height=\${args.height}
      ?no-dismiss=\${!args.dismissible}
      ?drag-to-dismiss=\${args.dragToDismiss}
    >
      <ds-text>Share this listing with a link.</ds-text>
    </ds-bottom-sheet>
  \`
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  },
  render: args => html\`
    <ds-bottom-sheet
      ?open=\${args.open}
      heading=\${args.heading}
      height=\${args.height}
      ?no-dismiss=\${!args.dismissible}
      ?drag-to-dismiss=\${args.dragToDismiss}
    >
      <ds-text>You must choose an option below to continue.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Continue"></ds-button>
    </ds-bottom-sheet>
  \`
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    dragToDismiss: false
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-bottom-sheet ?open=\${args.open} heading="Details" height=\${args.height}>
      <ds-text>Additional information about this item.</ds-text>
    </ds-bottom-sheet>
  \`
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <button type="button" id="bottom-sheet-trigger">Filters</button>
    <ds-bottom-sheet open heading="Filters" height="content">
      <ds-input label="Keyword" name="keyword" value=""></ds-input>
      <ds-link href="#reset">Reset all</ds-link>
      <ds-button slot="footer" variant="primary" size="sm" label="Apply filters"></ds-button>
      <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
    </ds-bottom-sheet>
  \`
}`,..._.parameters?.docs?.source},description:{story:`Renders open with its trigger and at least three focusable children so the\r
keyboard gate can verify Tab/Shift+Tab wrapping and Escape.`,..._.parameters?.docs?.description}}}})))()}y();export{l as Default,m as DismissibleFalse,h as DragToDismissFalse,u as HeightContent,f as HeightFull,d as HeightHalf,p as HideHeading,_ as Keyboard,g as NoFooter,v as __namedExportsOrder,c as default};