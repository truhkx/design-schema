import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{h as a}from"./iframe-DJFLK4ZL.js";var o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{t(),r(),a(),o=[{value:`day`,label:`Day`},{value:`week`,label:`Week`},{value:`month`,label:`Month`}],s=[{value:`day`,label:`Day`},{value:`week`,label:`Week`},{value:`month`,label:`Month`},{value:`year`,label:`Year`,disabled:!0}],c={title:`SegmentedControl/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{size:{control:`select`,options:[`sm`,`md`]},iconOnly:{control:`boolean`},fill:{control:`boolean`}},args:{label:`Range`,options:o,value:void 0,defaultValue:void 0,iconOnly:!1,size:`md`,fill:!1},render:e=>i`
    <ds-segmented-control
      label=${e.label}
      .options=${e.options}
      value=${n(e.value)}
      default-value=${n(e.defaultValue)}
      ?icon-only=${e.iconOnly}
      size=${e.size}
      ?fill=${e.fill}
    ></ds-segmented-control>
  `},l={},u={args:{size:`sm`}},d={args:{size:`md`}},f={args:{value:`week`}},p={args:{options:s,defaultValue:`week`}},m={args:{options:s}},h={args:{label:`View mode`,options:[{value:`list`,label:`List`},{value:`grid`,label:`Grid`}],defaultValue:`list`}},g={args:{label:`View mode`,options:[{value:`list`,label:`List view`,icon:`list`},{value:`grid`,label:`Grid view`,icon:`grid`}],iconOnly:!0,size:`sm`}},_={args:{label:`Range`,options:[{value:`day`,label:`Day`},{value:`week`,label:`Week`},{value:`month`,label:`Month`}],defaultValue:`week`,fill:!0}},v=[`Default`,`SizeSm`,`SizeMd`,`Controlled`,`DisabledOption`,`Keyboard`,`ViewMode`,`IconOnlyToolbar`,`FilledRangeSwitch`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'week'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    options: KEYBOARD_OPTIONS,
    defaultValue: 'week'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    options: KEYBOARD_OPTIONS
  }
}`,...m.parameters?.docs?.source},description:{story:`Three enabled segments and a disabled one, for arrow wrapping, skipping and Home/End.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'View mode',
    options: [{
      value: 'list',
      label: 'List'
    }, {
      value: 'grid',
      label: 'Grid'
    }],
    defaultValue: 'list'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'View mode',
    options: [{
      value: 'list',
      label: 'List view',
      icon: 'list'
    }, {
      value: 'grid',
      label: 'Grid view',
      icon: 'grid'
    }],
    iconOnly: true,
    size: 'sm'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Range',
    options: [{
      value: 'day',
      label: 'Day'
    }, {
      value: 'week',
      label: 'Week'
    }, {
      value: 'month',
      label: 'Month'
    }],
    defaultValue: 'week',
    fill: true
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{f as Controlled,l as Default,p as DisabledOption,_ as FilledRangeSwitch,g as IconOnlyToolbar,m as Keyboard,d as SizeMd,u as SizeSm,h as ViewMode,v as __namedExportsOrder,c as default};