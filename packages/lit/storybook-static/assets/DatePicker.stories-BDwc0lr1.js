import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./DatePicker-DxxawGbr.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{t(),i(),a(),o={title:`DatePicker/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`open-change`]}},argTypes:{range:{control:`boolean`},showWeekNumbers:{control:`boolean`},required:{control:`boolean`},hideLabel:{control:`boolean`},size:{control:`select`,options:[`sm`,`md`]},disabled:{control:`boolean`},invalid:{control:`boolean`}},args:{label:`Due date`,name:`due`,value:void 0,defaultValue:void 0,open:void 0,range:!1,min:void 0,max:void 0,locale:void 0,showWeekNumbers:!1,placeholder:void 0,description:void 0,required:!1,hideLabel:!1,size:`md`,disabled:!1,invalid:!1,error:void 0},render:e=>n`
    <ds-date-picker
      label=${e.label}
      name=${e.name}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
      ?open=${e.open}
      ?range=${e.range}
      min=${r(e.min)}
      max=${r(e.max)}
      locale=${r(e.locale)}
      ?show-week-numbers=${e.showWeekNumbers}
      placeholder=${r(e.placeholder)}
      description=${r(e.description)}
      ?required=${e.required}
      ?hide-label=${e.hideLabel}
      size=${e.size}
      ?disabled=${e.disabled}
      ?invalid=${e.invalid}
      error=${r(e.error)}
    ></ds-date-picker>
  `},s={},c={args:{range:!1}},l={args:{range:!0,label:`Report period`,name:`period`,defaultValue:{start:`2026-09-01`,end:`2026-09-10`}}},u={args:{showWeekNumbers:!1}},d={args:{showWeekNumbers:!0}},f={args:{size:`sm`}},p={args:{size:`md`}},m={args:{required:!0}},h={args:{hideLabel:!0,defaultValue:`2026-09-10`}},g={args:{disabled:!0,defaultValue:`2026-09-10`}},_={args:{open:!0,defaultValue:`2026-09-10`}},v={args:{label:`Appointment`,name:`appointment`,min:`2026-09-01`,max:`2026-09-30`,description:`Weekday slots this month only.`}},y={args:{label:`Date of birth`,name:`dob`,description:`Must be at least 18 years ago.`}},b={args:{required:!0,error:`Fix this before continuing.`}},x={args:{defaultValue:`2026-09-10`},play:async({canvasElement:e})=>{(e.querySelector(`ds-date-picker`)?.shadowRoot?.querySelector(`#calendar-button`))?.click()}},S=[`Default`,`RangeFalse`,`RangeTrue`,`ShowWeekNumbersFalse`,`ShowWeekNumbersTrue`,`SizeSm`,`SizeMd`,`RequiredTrue`,`HideLabelTrue`,`DisabledTrue`,`OpenTrue`,`WithMinMax`,`WithDescription`,`ErrorIdentified`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    range: false
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    range: true,
    label: 'Report period',
    name: 'period',
    defaultValue: {
      start: '2026-09-01',
      end: '2026-09-10'
    }
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    showWeekNumbers: false
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    showWeekNumbers: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    hideLabel: true,
    defaultValue: '2026-09-10'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: '2026-09-10'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    defaultValue: '2026-09-10'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Appointment',
    name: 'appointment',
    min: '2026-09-01',
    max: '2026-09-30',
    description: 'Weekday slots this month only.'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Date of birth',
    name: 'dob',
    description: 'Must be at least 18 years ago.'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    required: true,
    error: 'Fix this before continuing.'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: '2026-09-10'
  },
  play: async ({
    canvasElement
  }) => {
    const picker = canvasElement.querySelector('ds-date-picker');
    const trigger = picker?.shadowRoot?.querySelector<HTMLElement>('#calendar-button');
    trigger?.click();
  }
}`,...x.parameters?.docs?.source},description:{story:`Renders open with its trigger and the header/grid/footer controls so the\r
keyboard gate can verify ArrowDown-to-open, arrow/Home/End/PageUp/PageDown\r
navigation, Enter/Space to select, Escape, and Tab cycling through the\r
month/year selects, the grid's single roving tab stop, and Today/Clear.`,...x.parameters?.docs?.description}}}})))()}C();export{s as Default,g as DisabledTrue,b as ErrorIdentified,h as HideLabelTrue,x as Keyboard,_ as OpenTrue,c as RangeFalse,l as RangeTrue,m as RequiredTrue,u as ShowWeekNumbersFalse,d as ShowWeekNumbersTrue,p as SizeMd,f as SizeSm,y as WithDescription,v as WithMinMax,S as __namedExportsOrder,o as default};