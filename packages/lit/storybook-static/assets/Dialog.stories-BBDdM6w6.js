import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Button-TSn-G4Vm.js";import{t as o}from"./Text-Dgpz9DWN.js";import{t as s}from"./Input-BGhC2i8R.js";import{t as c}from"./Dialog-QeR6tLZ1.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),i(),c(),a(),s(),o(),l={title:`Dialog/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`close`,`opened`]}},argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`]},initialFocus:{control:`select`,options:[`first`,`title`,`close`]}},args:{open:!0,heading:`Rename project`,description:`This changes the project name everywhere it appears.`,hideHeading:!1,size:`md`,dismissible:!0,initialFocus:`first`},render:e=>n`
    <ds-dialog
      ?open=${e.open}
      heading=${e.heading}
      description=${r(e.description)}
      ?hide-heading=${e.hideHeading}
      size=${e.size}
      ?no-dismiss=${!e.dismissible}
      initial-focus=${e.initialFocus}
    >
      <ds-input label="Project name" name="projectName" value="Untitled project"></ds-input>
      <ds-button slot="footer" variant="primary" size="sm" label="Rename"></ds-button>
      <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
    </ds-dialog>
  `},u={},d={args:{size:`sm`}},f={args:{size:`md`}},p={args:{size:`lg`}},m={args:{initialFocus:`first`}},h={args:{initialFocus:`title`}},g={args:{initialFocus:`close`}},_={args:{dismissible:!1},render:e=>n`
    <ds-dialog
      ?open=${e.open}
      heading=${e.heading}
      description="You must choose an option below to continue."
      size=${e.size}
      ?no-dismiss=${!e.dismissible}
      initial-focus=${e.initialFocus}
    >
      <ds-text>Your session is about to expire.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Stay signed in"></ds-button>
      <ds-button slot="footer" variant="secondary" size="sm" label="Sign out"></ds-button>
    </ds-dialog>
  `},v={args:{description:void 0}},y={args:{hideHeading:!0}},b={render:e=>n`
    <ds-dialog ?open=${e.open} heading="Keyboard shortcuts" size=${e.size}>
      <ds-text>Press "?" anywhere to reopen this list.</ds-text>
    </ds-dialog>
  `},x={render:()=>n`
    <button type="button" id="dialog-trigger">Rename</button>
    <ds-dialog open heading="Rename project" description="This changes the project name everywhere it appears.">
      <ds-input label="Project name" name="projectName" value="Untitled project"></ds-input>
      <ds-button slot="footer" variant="primary" size="sm" label="Rename"></ds-button>
      <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
    </ds-dialog>
  `},S=[`Default`,`SizeSm`,`SizeMd`,`SizeLg`,`InitialFocusFirst`,`InitialFocusTitle`,`InitialFocusClose`,`DismissibleFalse`,`NoDescription`,`HideHeadingTrue`,`NoFooter`,`Keyboard`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'first'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'title'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    initialFocus: 'close'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  },
  render: args => html\`
    <ds-dialog
      ?open=\${args.open}
      heading=\${args.heading}
      description="You must choose an option below to continue."
      size=\${args.size}
      ?no-dismiss=\${!args.dismissible}
      initial-focus=\${args.initialFocus}
    >
      <ds-text>Your session is about to expire.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Stay signed in"></ds-button>
      <ds-button slot="footer" variant="secondary" size="sm" label="Sign out"></ds-button>
    </ds-dialog>
  \`
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    description: undefined
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    hideHeading: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-dialog ?open=\${args.open} heading="Keyboard shortcuts" size=\${args.size}>
      <ds-text>Press "?" anywhere to reopen this list.</ds-text>
    </ds-dialog>
  \`
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <button type="button" id="dialog-trigger">Rename</button>
    <ds-dialog open heading="Rename project" description="This changes the project name everywhere it appears.">
      <ds-input label="Project name" name="projectName" value="Untitled project"></ds-input>
      <ds-button slot="footer" variant="primary" size="sm" label="Rename"></ds-button>
      <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
    </ds-dialog>
  \`
}`,...x.parameters?.docs?.source},description:{story:`Renders open with its trigger and at least three focusable children so the\r
keyboard gate can verify Tab/Shift+Tab wrapping and Escape.`,...x.parameters?.docs?.description}}}})))()}C();export{u as Default,_ as DismissibleFalse,y as HideHeadingTrue,g as InitialFocusClose,m as InitialFocusFirst,h as InitialFocusTitle,x as Keyboard,v as NoDescription,b as NoFooter,p as SizeLg,f as SizeMd,d as SizeSm,S as __namedExportsOrder,l as default};