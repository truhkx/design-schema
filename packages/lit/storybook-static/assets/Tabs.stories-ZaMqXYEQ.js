import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{g as a}from"./iframe-CsoUKhN4.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{t(),i(),a(),o=[{id:`overview`,label:`Overview`},{id:`activity`,label:`Activity`,badge:`3`},{id:`files`,label:`Files`,icon:`external`},{id:`members`,label:`Members`,disabled:!0}],s={overview:`A summary of the project: status, owner and recent changes.`,activity:`A chronological feed of comments, edits and status changes.`,files:`Every file attached to this project, newest first.`,members:`The people with access to this project and their roles.`},c={title:`Tabs/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{activation:{control:`select`,options:[`automatic`,`manual`]},orientation:{control:`select`,options:[`horizontal`,`vertical`]},fit:{control:`select`,options:[`start`,`fill`]},keepMounted:{control:`boolean`}},args:{label:`Project sections`,tabs:o,value:void 0,defaultValue:void 0,activation:`automatic`,orientation:`horizontal`,fit:`start`,keepMounted:!1},render:e=>n`
    <ds-tabs
      label=${e.label}
      .tabs=${e.tabs}
      value=${r(e.value)}
      default-value=${r(e.defaultValue)}
      activation=${e.activation}
      orientation=${e.orientation}
      fit=${e.fit}
      ?keep-mounted=${e.keepMounted}
    >
      ${e.tabs.map(e=>n`<ds-tab-panel id=${e.id}>${s[e.id]??e.label}</ds-tab-panel>`)}
    </ds-tabs>
  `},l={},u={args:{activation:`automatic`}},d={args:{activation:`manual`}},f={args:{orientation:`horizontal`}},p={args:{orientation:`vertical`}},m={args:{fit:`start`}},h={args:{fit:`fill`}},g={args:{keepMounted:!0}},_={args:{defaultValue:`activity`}},v={args:{tabs:o,activation:`manual`}},y=[`Default`,`ActivationAutomatic`,`ActivationManual`,`OrientationHorizontal`,`OrientationVertical`,`FitStart`,`FitFill`,`KeepMountedTrue`,`WithDefaultValue`,`Keyboard`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'automatic'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    activation: 'manual'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    fit: 'start'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    fit: 'fill'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    keepMounted: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'activity'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    tabs: TABS,
    activation: 'manual'
  }
}`,...v.parameters?.docs?.source},description:{story:`Renders with its trigger-less tab list open and at least three focusable\r
(enabled) tabs so the keyboard gate can verify arrow navigation, wrapping,\r
Home/End, Tab-out and, under manual activation, Enter/Space selection.`,...v.parameters?.docs?.description}}}})))()}b();export{u as ActivationAutomatic,d as ActivationManual,l as Default,h as FitFill,m as FitStart,g as KeepMountedTrue,v as Keyboard,f as OrientationHorizontal,p as OrientationVertical,_ as WithDefaultValue,y as __namedExportsOrder,c as default};