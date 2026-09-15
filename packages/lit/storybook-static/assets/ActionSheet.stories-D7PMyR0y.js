import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{v as a}from"./iframe-CsoUKhN4.js";var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{t(),i(),a(),o=[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,tone:`danger`}],s=[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`,disabled:!0},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,tone:`danger`}],c={title:`ActionSheet/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`action`,`close`]}},args:{open:!0,heading:`Photo.jpg`,actions:o,dismissible:!0},render:e=>n`
    <ds-action-sheet
      ?open=${e.open}
      heading=${r(e.heading)}
      .actions=${e.actions}
      cancel-label=${r(e.cancelLabel)}
      ?no-dismiss=${!e.dismissible}
    ></ds-action-sheet>
  `},l={},u={args:{heading:void 0}},d={args:{actions:s}},f={args:{cancelLabel:`Never mind`}},p={args:{dismissible:!1}},m={args:{open:!0,heading:`Photo.jpg`,actions:o}},h=[`Default`,`WithoutTitle`,`WithDisabledAction`,`CustomCancelLabel`,`DismissibleFalse`,`Keyboard`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    heading: undefined
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    actions: DISABLED_ACTIONS
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    cancelLabel: 'Never mind'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: DEFAULT_ACTIONS
  }
}`,...m.parameters?.docs?.source},description:{story:`Renders open with at least three focusable children (four action rows plus\r
Cancel) so the keyboard gate can verify arrow navigation, Home/End wrapping,\r
Enter/Space and Escape. ActionSheet has no dedicated trigger of its own —\r
\`open\` is fully controlled by the consumer.`,...m.parameters?.docs?.description}}}})))()}g();export{f as CustomCancelLabel,l as Default,p as DismissibleFalse,m as Keyboard,d as WithDisabledAction,u as WithoutTitle,h as __namedExportsOrder,c as default};