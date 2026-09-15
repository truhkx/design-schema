import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{h as a}from"./iframe-CsoUKhN4.js";var o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{t(),i(),a(),o=[{value:`day`,label:`Day`},{value:`week`,label:`Week`},{value:`month`,label:`Month`,disabled:!0}],s=[{value:`day`,label:`Day`},{value:`week`,label:`Week`},{value:`month`,label:`Month`},{value:`year`,label:`Year`,disabled:!0}],c=[{value:`previous`,label:`Previous`,icon:`chevron-left`},{value:`current`,label:`Current`,icon:`dash`},{value:`next`,label:`Next`,icon:`chevron-right`}],l={title:`SegmentedControl/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{size:{control:`select`,options:[`sm`,`md`]},iconOnly:{control:`boolean`},fill:{control:`boolean`}},args:{label:`Time range`,options:o,value:void 0,defaultValue:void 0,iconOnly:!1,size:`md`,fill:!1},render:e=>n`
    <ds-segmented-control
      label=${e.label}
      .options=${e.options}
      value=${r(e.value)}
      default-value=${r(e.defaultValue)}
      ?icon-only=${e.iconOnly}
      size=${e.size}
      ?fill=${e.fill}
    ></ds-segmented-control>
  `},u={},d={args:{size:`sm`}},f={args:{size:`md`}},p={args:{fill:!0}},m={args:{defaultValue:`week`}},h={args:{options:c,iconOnly:!0}},g={args:{options:s}},_=[`Default`,`SizeSm`,`SizeMd`,`Fill`,`WithDefaultValue`,`IconOnly`,`Keyboard`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    fill: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'week'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    options: ICON_OPTIONS,
    iconOnly: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    options: KEYBOARD_OPTIONS
  }
}`,...g.parameters?.docs?.source},description:{story:`Renders with its trigger-less group open and at least three focusable\r
(enabled) segments so the keyboard gate can verify arrow navigation,\r
wrapping, and Home/End selection.`,...g.parameters?.docs?.description}}}})))()}v();export{u as Default,p as Fill,h as IconOnly,g as Keyboard,f as SizeMd,d as SizeSm,m as WithDefaultValue,_ as __namedExportsOrder,l as default};